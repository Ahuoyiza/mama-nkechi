import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { verifyAndCleanImage } from "../verify";

async function jpeg(width: number, height: number, withExif = false) {
  let img = sharp({ create: { width, height, channels: 3, background: { r: 200, g: 80, b: 40 } } }).jpeg();
  if (withExif) {
    // Stand-in for the camera data a phone adds (the real thing can include GPS).
    img = img.withExif({ IFD0: { Copyright: "Secret location 6.5244N 3.3792E", Artist: "Ada" } });
  }
  return new File([new Uint8Array(await img.toBuffer())], "dish.jpg", { type: "image/jpeg" });
}

describe("verifyAndCleanImage", () => {
  it("accepts a real photo and re-encodes it as WebP", async () => {
    const result = await verifyAndCleanImage(await jpeg(800, 600));
    expect(result.ok).toBe(true);
    if (result.ok) expect((await sharp(result.buffer).metadata()).format).toBe("webp");
  });

  it("strips EXIF metadata", async () => {
    const input = await jpeg(800, 600, true);
    expect((await sharp(Buffer.from(await input.arrayBuffer())).metadata()).exif).toBeDefined();

    const result = await verifyAndCleanImage(input);
    expect(result.ok).toBe(true);
    if (result.ok) expect((await sharp(result.buffer).metadata()).exif).toBeUndefined();
  });

  it("rejects photos under 600px on the short side", async () => {
    const result = await verifyAndCleanImage(await jpeg(1200, 599));
    expect(result).toMatchObject({ ok: false });
  });

  it("allows exactly 600px", async () => {
    expect((await verifyAndCleanImage(await jpeg(600, 600))).ok).toBe(true);
  });

  it("checks the real bytes, not the name or claimed type", async () => {
    const fake = new File(["<script>alert('hi')</script>"], "dish.jpg", { type: "image/jpeg" });
    expect(await verifyAndCleanImage(fake)).toEqual({ ok: false, message: "That file isn’t really a JPG, PNG or WebP photo" });
  });

  it("rejects real images in formats we don't accept (GIF)", async () => {
    const gif = await sharp({ create: { width: 700, height: 700, channels: 3, background: "#fff" } }).gif().toBuffer();
    const file = new File([new Uint8Array(gif)], "dish.jpg", { type: "image/jpeg" });
    expect((await verifyAndCleanImage(file)).ok).toBe(false);
  });
});

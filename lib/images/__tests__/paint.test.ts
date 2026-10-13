import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { PAINT_SIZE, paintDish, paintedPath } from "../paint";

async function fakePhoto() {
  return sharp({ create: { width: 1600, height: 1200, channels: 3, background: { r: 190, g: 120, b: 60 } } })
    .composite([{ input: Buffer.from('<svg width="1600" height="1200"><circle cx="800" cy="600" r="400" fill="#e8b020"/></svg>') }])
    .jpeg()
    .toBuffer();
}

describe("paintDish", () => {
  it("returns a square PNG with transparency", async () => {
    const meta = await sharp(await paintDish(await fakePhoto())).metadata();
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(PAINT_SIZE);
    expect(meta.height).toBe(PAINT_SIZE);
    expect(meta.hasAlpha).toBe(true);
  });

  it("fades the corners out and keeps the middle solid", async () => {
    const { data, info } = await sharp(await paintDish(await fakePhoto())).raw().toBuffer({ resolveWithObject: true });
    const alphaAt = (x: number, y: number) => data[(y * info.width + x) * info.channels + 3];
    expect(alphaAt(2, 2)).toBe(0);
    expect(alphaAt(PAINT_SIZE / 2, PAINT_SIZE / 2)).toBe(255);
  });

  it("keeps painted pictures in their own folder", () => {
    expect(paintedPath("abc")).toBe("painted/abc.png");
  });
});

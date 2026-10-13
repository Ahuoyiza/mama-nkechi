import "server-only";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

/**
 * Server-side photo check. The client schema already looked at the file's
 * type and size, but `file.type` comes from the file NAME: rename virus.exe to
 * dish.jpg and the browser happily says "image/jpeg". So here we:
 *   1. read the first bytes ("magic bytes") to learn what the file really is;
 *   2. check the real pixel size (at least 600px on the short side);
 *   3. re-encode it with sharp. That strips EXIF metadata, which can include
 *      the GPS location where the photo was taken: someone's home address.
 */
export const MIN_SHORT_SIDE = 600;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type CleanImage = { ok: true; buffer: Buffer; contentType: "image/webp"; extension: "webp" };
export type ImageProblem = { ok: false; message: string };

export async function verifyAndCleanImage(file: File): Promise<CleanImage | ImageProblem> {
  const input = Buffer.from(await file.arrayBuffer());

  const detected = await fileTypeFromBuffer(input);
  if (!detected || !ALLOWED.has(detected.mime)) {
    return { ok: false, message: "That file isn’t really a JPG, PNG or WebP photo" };
  }

  let width = 0;
  let height = 0;
  try {
    const meta = await sharp(input).metadata();
    // autoOrient accounts for phone photos stored sideways.
    width = meta.autoOrient?.width ?? meta.width ?? 0;
    height = meta.autoOrient?.height ?? meta.height ?? 0;
  } catch {
    return { ok: false, message: "We couldn’t read that photo. Try another one" };
  }

  if (Math.min(width, height) < MIN_SHORT_SIDE) {
    return { ok: false, message: `Photo is a little small. Use one at least ${MIN_SHORT_SIDE} pixels on its shortest side` };
  }

  // sharp drops all metadata (EXIF, GPS, camera details) unless asked to keep it.
  const buffer = await sharp(input)
    .rotate() // apply the EXIF orientation before it's removed
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  return { ok: true, buffer, contentType: "image/webp", extension: "webp" };
}

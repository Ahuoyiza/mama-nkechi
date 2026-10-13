import "server-only";

/**
 * Server-side photo check.
 *
 * The client schema looked at file.type and file.size, but file.type comes
 * from the file NAME: rename notes.txt to dish.jpg and the browser says
 * "image/jpeg". Phone photos can also carry the GPS location they were taken at.
 */
export const MIN_SHORT_SIDE = 600;

export type CleanImage = { ok: true; buffer: Buffer; contentType: "image/webp"; extension: "webp" };
export type ImageProblem = { ok: false; message: string };

export async function verifyAndCleanImage(file: File): Promise<CleanImage | ImageProblem> {
  // TODO (Activity 3):
  //   1. Read the bytes and use fileTypeFromBuffer() from "file-type" to learn
  //      what the file REALLY is. Only allow image/jpeg, image/png, image/webp.
  //   2. Use sharp(buffer).metadata() and reject photos under MIN_SHORT_SIDE
  //      pixels on the short side.
  //   3. Re-encode with sharp: .rotate().resize({ width: 1600, height: 1600,
  //      fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).
  //      sharp drops EXIF (including GPS) unless you ask it to keep it.
  void file;
  return { ok: false, message: "Image checks aren’t built yet (Activity 3)" };
}

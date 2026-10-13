import sharp from "sharp";

/**
 * "Paint it Mama's way": turns a phone photo into a flat, hand-painted-looking
 * picture that sits on the coloured card panel like the launch illustrations.
 *
 * No AI and no outside service: plain image processing on our own server, so
 * the cook's photo never leaves us. It's a filter, not a redraw:
 *   1. smooth away fine photo detail (median filter);
 *   2. warm up the colours;
 *   3. reduce to a small palette, so colours sit in flat areas like paint;
 *   4. trace ink outlines from the edges and darken them onto the paint;
 *   5. fade the surroundings out with a soft round "plate" mask, so the dish
 *      floats on the card colour (PNG with transparency).
 */
export const PAINT_SIZE = 1024;

/** Where the painted version of a submission's photo is kept (private submission-images bucket). */
export const paintedPath = (submissionId: string) => `painted/${submissionId}.png`;

export async function paintDish(input: Buffer): Promise<Buffer> {
  // 1–2. Square crop around the middle, smoothed and warmed.
  const base = await sharp(input)
    .rotate()
    .resize(PAINT_SIZE, PAINT_SIZE, { fit: "cover", position: "attention" })
    .median(7)
    .median(5)
    .modulate({ saturation: 1.35, brightness: 1.04 })
    .toBuffer();

  // 3. A small palette with no dithering gives flat, poster-paint areas.
  const paint = await sharp(base).png({ palette: true, colours: 28, dither: 0 }).toBuffer();

  // 4. Ink: edge detection on a softened greyscale copy, inverted to dark lines on white.
  const ink = await sharp(base)
    .greyscale()
    .blur(1.2)
    .convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] })
    .linear(3.2, 0) // strengthen the edges
    .threshold(70) // keep only clear outlines
    .negate()
    .blur(0.6) // soften the line like a brush
    .toColourspace("b-w")
    .toBuffer();

  // 5. Soft round plate: opaque in the middle, fading to transparent at the edges.
  const r = PAINT_SIZE / 2;
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PAINT_SIZE}" height="${PAINT_SIZE}">
      <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="78%" stop-color="#fff" stop-opacity="1"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient></defs>
      <circle cx="${r}" cy="${r}" r="${r}" fill="url(#g)"/>
    </svg>`,
  );

  return sharp(paint)
    .ensureAlpha()
    .composite([
      { input: ink, blend: "multiply" },
      { input: plate, blend: "dest-in" },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

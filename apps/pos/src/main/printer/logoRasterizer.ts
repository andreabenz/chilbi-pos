import fs from 'node:fs';
import sharp from 'sharp';

const LOGO_WIDTH = 576;
const THRESHOLD = 180;

let cachedLogoBuffer: Buffer | null = null;
let cachedLogoPath: string | null = null;

/**
 * Encodes 1-bit monochrome raw pixel buffer into ESC/POS GS ( L raster graphics commands.
 *
 * @param pixels 1-channel raw thresholded pixel buffer
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @returns ESC/POS graphics command buffer
 */
function createGraphicsCommand(pixels: Buffer, width: number, height: number): Buffer {
  const bytesPerRow = Math.ceil(width / 8);
  const rasterData = Buffer.alloc(bytesPerRow * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y * width + x];

      if (pixel === 0) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);

        rasterData[byteIndex] |= 1 << bitIndex;
      }
    }
  }

  const graphicsPayload = Buffer.concat([
    Buffer.from([
      0x30,
      0x70,
      0x30,
      0x01,
      0x01,
      0x31,
      width & 0xff,
      (width >> 8) & 0xff,
      height & 0xff,
      (height >> 8) & 0xff,
    ]),
    rasterData,
  ]);

  const payloadLength = graphicsPayload.length;

  if (payloadLength > 0xffff) {
    throw new Error(`ESC/POS graphics payload too large: ${payloadLength} bytes`);
  }

  const pL = payloadLength & 0xff;
  const pH = (payloadLength >> 8) & 0xff;

  const storeGraphicsCommand = Buffer.concat([
    Buffer.from([
      0x1d, // GS
      0x28, // (
      0x4c, // L
      pL,
      pH,
    ]),
    graphicsPayload,
  ]);

  const printGraphicsCommand = Buffer.from([0x1d, 0x28, 0x4c, 0x02, 0x00, 0x30, 0x32]);

  return Buffer.concat([storeGraphicsCommand, printGraphicsCommand]);
}

/**
 * Loads an SVG file, converts it to monochrome 1-bit bitmap using sharp, and encodes it into ESC/POS.
 *
 * @param svgPath Filesystem path to the SVG file
 * @returns ESC/POS raster graphics command buffer
 */
export async function rasterizeLogo(svgPath: string): Promise<Buffer> {
  const svgBuffer = fs.readFileSync(svgPath);

  const { data, info } = await sharp(svgBuffer)
    .resize({
      width: LOGO_WIDTH,
      withoutEnlargement: false,
    })
    .flatten({
      background: {
        r: 255,
        g: 255,
        b: 255,
      },
    })
    .greyscale()
    .threshold(THRESHOLD)
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  if (info.channels !== 1) {
    throw new Error(`Expected 1-channel grayscale image, got ${info.channels} channels`);
  }

  return createGraphicsCommand(data, info.width, info.height);
}

/**
 * Rasterizes and caches the SVG logo for future receipt printing.
 *
 * @param svgPath Filesystem path to the SVG logo
 */
export async function initializeLogo(svgPath: string): Promise<void> {
  if (cachedLogoBuffer && cachedLogoPath === svgPath) {
    return;
  }

  cachedLogoBuffer = await rasterizeLogo(svgPath);
  cachedLogoPath = svgPath;
}

/**
 * Returns the in-memory cached ESC/POS rasterized logo buffer.
 *
 * @returns Cached logo command buffer or null if not yet initialized
 */
export function getCachedLogo(): Buffer | null {
  return cachedLogoBuffer;
}

/**
 * Standard ESC/POS Command Byte Constants for thermal printers (e.g., Epson TM-T20II).
 */
export const ESC = 0x1b;
export const GS = 0x1d;
export const FS = 0x1c;
export const LF = 0x0a;

/**
 * ESC/POS binary command builders for thermal receipt printers.
 */
export const EscPos = {
  /** Resets the printer to default settings. */
  init: (): Buffer => Buffer.from([ESC, 0x40]),

  /** Selects character code table (default 19 = PC858 Euro/Multilingual). */
  setCodeTable: (table = 19): Buffer => Buffer.from([ESC, 0x74, table]),

  /** Sets text justification alignment. */
  align: (align: 'left' | 'center' | 'right'): Buffer => {
    const val = align === 'center' ? 1 : align === 'right' ? 2 : 0;
    return Buffer.from([ESC, 0x61, val]);
  },

  /** Toggles emphasized (bold) print mode. */
  bold: (enable: boolean): Buffer => Buffer.from([ESC, 0x45, enable ? 1 : 0]),

  /** Sets character width and height magnification (1 to 4). */
  textSize: (width = 1, height = 1): Buffer => {
    const w = Math.min(Math.max(width - 1, 0), 7);
    const h = Math.min(Math.max(height - 1, 0), 7);
    return Buffer.from([GS, 0x21, (w << 4) | h]);
  },

  /** Feeds paper by the specified number of lines. */
  feed: (lines = 1): Buffer => Buffer.from([ESC, 0x64, lines]),

  /** Performs a partial or full paper cut. */
  cut: (mode: 'full' | 'partial' = 'partial'): Buffer => {
    return Buffer.from([GS, 0x56, mode === 'full' ? 0x00 : 0x01]);
  },

  /** Prints a non-volatile bitmap logo stored in printer NV-RAM. */
  printNvLogo: (logoIndex = 1): Buffer => Buffer.from([FS, 0x70, logoIndex, 0x00]),
};

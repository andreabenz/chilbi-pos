// Standard ESC/POS Command Byte Constants for Epson TM-T20II
export const ESC = 0x1b;
export const GS = 0x1d;
export const FS = 0x1c;
export const LF = 0x0a;

export const EscPos = {
  // Reset printer to default state
  init: (): Buffer => Buffer.from([ESC, 0x40]),

  // Select Code Table (19 = PC858 Euro/Multilingual)
  setCodeTable: (table = 19): Buffer => Buffer.from([ESC, 0x74, table]),

  // Alignment: 0 = Left, 1 = Center, 2 = Right
  align: (align: 'left' | 'center' | 'right'): Buffer => {
    const val = align === 'center' ? 1 : align === 'right' ? 2 : 0;
    return Buffer.from([ESC, 0x61, val]);
  },

  // Bold / Emphasized mode
  bold: (enable: boolean): Buffer => Buffer.from([ESC, 0x45, enable ? 1 : 0]),

  // Character Sizing: width and height multiplier (1 to 4)
  textSize: (width = 1, height = 1): Buffer => {
    const w = Math.min(Math.max(width - 1, 0), 7);
    const h = Math.min(Math.max(height - 1, 0), 7);
    return Buffer.from([GS, 0x21, (w << 4) | h]);
  },

  // Line Feeds
  feed: (lines = 1): Buffer => Buffer.from([ESC, 0x64, lines]),

  // Paper Cut: 'full' or 'partial'
  cut: (mode: 'full' | 'partial' = 'partial'): Buffer => {
    return Buffer.from([GS, 0x56, mode === 'full' ? 0x00 : 0x01]);
  },

  // Print NV Logo (if uploaded to printer NV-RAM slot 1)
  printNvLogo: (logoIndex = 1): Buffer => Buffer.from([FS, 0x70, logoIndex, 0x00]),
};

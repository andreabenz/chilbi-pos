// PC858 character byte mappings for Epson TM-T20II
const charMap: Record<string, number> = {
  ä: 0x84,
  ö: 0x94,
  ü: 0x81,
  Ä: 0x8e,
  Ö: 0x99,
  Ü: 0x9a,
  é: 0x82,
  è: 0x8a,
  à: 0x85,
  ê: 0x88,
  '–': 0x2d, // en-dash -> '-'
  '—': 0x2d, // em-dash -> '-'
  '’': 0x27, // typographic apostrophe -> '''
  '«': 0xae,
  '»': 0xaf,
};

export function encodeText(text: string): Buffer {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (charMap[char] !== undefined) {
      bytes.push(charMap[char]);
    } else {
      const code = char.charCodeAt(0);
      bytes.push(code <= 127 ? code : 0x20); // Fallback to space for unmapped symbols
    }
  }
  return Buffer.from(bytes);
}

/**
 * Formats a two-column line (Left text and Right text) with exact column width spacing
 */
export function formatRow(left: string, right: string, totalWidth = 48): string {
  const leftLen = left.length;
  const rightLen = right.length;
  const spaceCount = Math.max(1, totalWidth - leftLen - rightLen);
  return left + ' '.repeat(spaceCount) + right;
}

/**
 * Formats a separator line (e.g. "------------------------------------------------")
 */
export function formatSeparator(char = '-', totalWidth = 48): string {
  return char.repeat(totalWidth);
}

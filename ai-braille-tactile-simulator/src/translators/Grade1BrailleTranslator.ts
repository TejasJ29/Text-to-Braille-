import { BrailleCell, IBrailleTranslator, SixBitPattern, TranslationResult } from '../types/braille';

/**
 * Transparent English Grade 1 (Uncontracted) Braille Translator.
 * Bit ordering is strictly [dot1, dot2, dot3, dot4, dot5, dot6].
 * Structured around IBrailleTranslator so a future Liblouis integration can replace it.
 */
export const GRADE1_LETTERS: Record<string, SixBitPattern> = {
  A: [1, 0, 0, 0, 0, 0],
  B: [1, 1, 0, 0, 0, 0],
  C: [1, 0, 0, 1, 0, 0],
  D: [1, 0, 0, 1, 1, 0],
  E: [1, 0, 0, 0, 1, 0],
  F: [1, 1, 0, 1, 0, 0],
  G: [1, 1, 0, 1, 1, 0],
  H: [1, 1, 0, 0, 1, 0],
  I: [0, 1, 0, 1, 0, 0],
  J: [0, 1, 0, 1, 1, 0],
  K: [1, 0, 1, 0, 0, 0],
  L: [1, 1, 1, 0, 0, 0],
  M: [1, 0, 1, 1, 0, 0],
  N: [1, 0, 1, 1, 1, 0],
  O: [1, 0, 1, 0, 1, 0],
  P: [1, 1, 1, 1, 0, 0],
  Q: [1, 1, 1, 1, 1, 0],
  R: [1, 1, 1, 0, 1, 0],
  S: [0, 1, 1, 1, 0, 0],
  T: [0, 1, 1, 1, 1, 0],
  U: [1, 0, 1, 0, 0, 1],
  V: [1, 1, 1, 0, 0, 1],
  W: [0, 1, 0, 1, 1, 1],
  X: [1, 0, 1, 1, 0, 1],
  Y: [1, 0, 1, 1, 1, 1],
  Z: [1, 0, 1, 0, 1, 1],
};

export const GRADE1_DIGITS: Record<string, SixBitPattern> = {
  '1': [1, 0, 0, 0, 0, 0],
  '2': [1, 1, 0, 0, 0, 0],
  '3': [1, 0, 0, 1, 0, 0],
  '4': [1, 0, 0, 1, 1, 0],
  '5': [1, 0, 0, 0, 1, 0],
  '6': [1, 1, 0, 1, 0, 0],
  '7': [1, 1, 0, 1, 1, 0],
  '8': [1, 1, 0, 0, 1, 0],
  '9': [0, 1, 0, 1, 0, 0],
  '0': [0, 1, 0, 1, 1, 0],
};

export const GRADE1_PUNCTUATION: Record<string, SixBitPattern> = {
  ' ': [0, 0, 0, 0, 0, 0],
  '.': [0, 1, 0, 0, 1, 1],
  ',': [0, 1, 0, 0, 0, 0],
  '!': [0, 1, 1, 0, 1, 0],
  '?': [0, 1, 1, 0, 0, 1],
  '-': [0, 0, 1, 0, 0, 1],
  ':': [0, 1, 0, 0, 1, 0],
  ';': [0, 1, 1, 0, 0, 0],
  "'": [0, 0, 1, 0, 0, 0],
};

export const CAPITAL_INDICATOR_BITS: SixBitPattern = [0, 0, 0, 0, 0, 1];
export const NUMBER_INDICATOR_BITS: SixBitPattern = [0, 0, 1, 1, 1, 1];

export function bitsToUnicode(bits: SixBitPattern): string {
  let mask = 0;
  for (let i = 0; i < 6; i++) {
    if (bits[i] === 1) mask |= 1 << i;
  }
  return String.fromCodePoint(0x2800 + mask);
}

export function bitsToActiveDots(bits: SixBitPattern): number[] {
  const dots: number[] = [];
  bits.forEach((b, idx) => {
    if (b === 1) dots.push(idx + 1);
  });
  return dots;
}

export class Grade1BrailleTranslator implements IBrailleTranslator {
  translate(rawText: string, options = { expandPrefixCells: false }): TranslationResult {
    const normalizedText = rawText.replace(/\r?\n/g, ' ');
    const cells: BrailleCell[] = [];
    let letterCount = 0;
    let digitCount = 0;
    let spaceCount = 0;
    let punctCount = 0;
    let unsupportedCount = 0;
    let inNumberRun = false;

    for (let i = 0; i < normalizedText.length; i++) {
      const ch = normalizedText[i];
      const upper = ch.toUpperCase();
      const isUpper = ch >= 'A' && ch <= 'Z';
      const isLower = ch >= 'a' && ch <= 'z';
      const isDigit = ch >= '0' && ch <= '9';

      if (isDigit) {
        if (options.expandPrefixCells && !inNumberRun) {
          cells.push({
            position: cells.length + 1,
            sourceIndex: i + 1,
            char: '#IND',
            displayChar: '⠼ (NUM)',
            category: 'INDICATOR',
            modifierNote: 'Number Indicator (Dots 3,4,5,6)',
            bits: [...NUMBER_INDICATOR_BITS] as SixBitPattern,
            bitString: NUMBER_INDICATOR_BITS.join(''),
            unicode: bitsToUnicode(NUMBER_INDICATOR_BITS),
            activeDots: bitsToActiveDots(NUMBER_INDICATOR_BITS),
            supported: true,
          });
        }
        inNumberRun = true;
        digitCount++;
        const bits = [...GRADE1_DIGITS[ch]] as SixBitPattern;
        cells.push({
          position: cells.length + 1,
          sourceIndex: i + 1,
          char: ch,
          displayChar: ch,
          category: 'NUMBER',
          modifierNote: 'Numeric (#⠼ Indicator)',
          bits,
          bitString: bits.join(''),
          unicode: bitsToUnicode(bits),
          activeDots: bitsToActiveDots(bits),
          supported: true,
        });
      } else if (isUpper || isLower) {
        inNumberRun = false;
        letterCount++;
        if (isUpper && options.expandPrefixCells) {
          cells.push({
            position: cells.length + 1,
            sourceIndex: i + 1,
            char: '^CAP',
            displayChar: '⠠ (CAP)',
            category: 'INDICATOR',
            modifierNote: 'Capital Indicator (Dot 6)',
            bits: [...CAPITAL_INDICATOR_BITS] as SixBitPattern,
            bitString: CAPITAL_INDICATOR_BITS.join(''),
            unicode: bitsToUnicode(CAPITAL_INDICATOR_BITS),
            activeDots: bitsToActiveDots(CAPITAL_INDICATOR_BITS),
            supported: true,
          });
        }
        const bits = [...GRADE1_LETTERS[upper]] as SixBitPattern;
        cells.push({
          position: cells.length + 1,
          sourceIndex: i + 1,
          char: ch,
          displayChar: ch,
          category: 'LETTER',
          modifierNote: isUpper ? 'UPPERCASE (⠠ Dot 6)' : 'LOWERCASE',
          bits,
          bitString: bits.join(''),
          unicode: bitsToUnicode(bits),
          activeDots: bitsToActiveDots(bits),
          supported: true,
        });
      } else if (Object.prototype.hasOwnProperty.call(GRADE1_PUNCTUATION, ch)) {
        inNumberRun = false;
        if (ch === ' ') spaceCount++;
        else punctCount++;
        const bits = [...GRADE1_PUNCTUATION[ch]] as SixBitPattern;
        cells.push({
          position: cells.length + 1,
          sourceIndex: i + 1,
          char: ch,
          displayChar: ch === ' ' ? 'SPACE' : ch,
          category: ch === ' ' ? 'SPACE' : 'PUNCTUATION',
          modifierNote: ch === ' ' ? 'Blank Cell' : 'Grade 1 Punctuation',
          bits,
          bitString: bits.join(''),
          unicode: bitsToUnicode(bits),
          activeDots: bitsToActiveDots(bits),
          supported: true,
        });
      } else {
        inNumberRun = false;
        unsupportedCount++;
        const bits: SixBitPattern = [0, 0, 0, 0, 0, 0];
        cells.push({
          position: cells.length + 1,
          sourceIndex: i + 1,
          char: ch,
          displayChar: ch,
          category: 'UNSUPPORTED',
          modifierNote: 'Unsupported in Grade 1 Demo',
          bits,
          bitString: '000000',
          unicode: '⠀',
          activeDots: [],
          supported: false,
        });
      }
    }

    return {
      rawText,
      normalizedText,
      cells,
      stats: {
        totalChars: normalizedText.length,
        totalCells: cells.length,
        letterCount,
        digitCount,
        spaceCount,
        punctCount,
        unsupportedCount,
      },
    };
  }
}

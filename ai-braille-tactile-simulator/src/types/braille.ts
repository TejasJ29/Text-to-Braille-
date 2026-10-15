export type SixBitPattern = [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1];

export type CharacterCategory =
  | 'LETTER'
  | 'NUMBER'
  | 'SPACE'
  | 'PUNCTUATION'
  | 'INDICATOR'
  | 'UNSUPPORTED';

export interface BrailleCell {
  position: number;
  sourceIndex: number;
  char: string;
  displayChar: string;
  category: CharacterCategory;
  modifierNote: string;
  bits: SixBitPattern; // Documented dot order: [dot1, dot2, dot3, dot4, dot5, dot6]
  bitString: string;
  unicode: string;
  activeDots: number[];
  supported: boolean;
}

export interface TranslationResult {
  rawText: string;
  normalizedText: string;
  cells: BrailleCell[];
  stats: {
    totalChars: number;
    totalCells: number;
    letterCount: number;
    digitCount: number;
    spaceCount: number;
    punctCount: number;
    unsupportedCount: number;
  };
}

export interface IBrailleTranslator {
  translate(rawText: string, options?: { expandPrefixCells?: boolean }): TranslationResult;
}

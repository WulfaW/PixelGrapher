/**
 * AI Commit Artist - Text to Pattern Generator
 * Converts text into a natural-looking 7x52 GitHub contribution grid pattern
 * Uses compact 3x5 font to fit more text (~13 characters)
 */

type CellIntensity = 0 | 1 | 2 | 3 | 4;

// İyileştirilmiş 3×5 font - Daha net ve ayırt edilebilir harfler
const FONT_3X5: Record<string, number[][]> = {
  // Harfler - Klasik pixel font tasarımı
  'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  'C': [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
  'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
  'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  'G': [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
  'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  'J': [[0,1,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
  'K': [[1,0,1],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  // M: tepe boşluklu; N: tam dolu tepe ile ayrışıyor
  'M': [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  'N': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1]],
  'O': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'P': [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  'Q': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,1]],
  'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  'S': [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
  'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'V': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  'W': [[1,0,1],[1,0,1],[1,1,1],[1,1,1],[1,0,1]],
  'X': [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
  
  // Sayılar - Klasik ve net tasarım
  '0': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2': [[0,1,0],[1,0,1],[0,0,1],[0,1,0],[1,1,1]],
  '3': [[1,1,0],[0,0,1],[0,1,0],[0,0,1],[1,1,0]],
  '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
  '5': [[1,1,1],[1,0,0],[1,1,0],[0,0,1],[1,1,0]],
  '6': [[0,1,1],[1,0,0],[1,1,0],[1,0,1],[0,1,0]],
  '7': [[1,1,1],[0,0,1],[0,0,1],[0,1,0],[0,1,0]],
  '8': [[0,1,0],[1,0,1],[0,1,0],[1,0,1],[0,1,0]],
  '9': [[0,1,0],[1,0,1],[0,1,1],[0,0,1],[1,1,0]],
  
  // Özel karakterler - Basit, temiz ve okunaklı tasarım
  ' ': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
  '!': [[0,1,0],[0,1,0],[0,1,0],[0,0,0],[0,1,0]],
  '?': [[1,1,0],[0,0,1],[0,1,0],[0,0,0],[0,1,0]],
  '.': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
  ',': [[0,0,0],[0,0,0],[0,0,0],[0,1,0],[1,0,0]],
  ':': [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[0,0,0]],
  ';': [[0,0,0],[0,1,0],[0,0,0],[0,1,0],[1,0,0]],
  '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  '_': [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[1,1,1]],
  '+': [[0,1,0],[1,1,1],[0,1,0],[0,0,0],[0,0,0]],
  '=': [[0,0,0],[1,1,1],[0,0,0],[1,1,1],[0,0,0]],
  '*': [[1,0,1],[0,1,0],[1,0,1],[0,0,0],[0,0,0]],
  '/': [[0,0,1],[0,1,0],[1,0,0],[0,0,0],[0,0,0]],
  '\\': [[1,0,0],[0,1,0],[0,0,1],[0,0,0],[0,0,0]],
  '(': [[0,1,0],[1,0,0],[1,0,0],[1,0,0],[0,1,0]],
  ')': [[0,1,0],[0,0,1],[0,0,1],[0,0,1],[0,1,0]],
  '[': [[1,1,0],[1,0,0],[1,0,0],[1,0,0],[1,1,0]],
  ']': [[0,1,1],[0,0,1],[0,0,1],[0,0,1],[0,1,1]],
  '{': [[0,1,1],[0,1,0],[1,0,0],[0,1,0],[0,1,1]],
  '}': [[1,1,0],[0,1,0],[0,0,1],[0,1,0],[1,1,0]],
  '<': [[0,0,1],[0,1,0],[1,0,0],[0,1,0],[0,0,1]],
  '>': [[1,0,0],[0,1,0],[0,0,1],[0,1,0],[1,0,0]],
  '#': [[1,0,1],[1,1,1],[1,0,1],[1,1,1],[1,0,1]],
  '@': [[1,1,1],[1,0,1],[1,1,1],[1,0,0],[0,1,1]],
  '&': [[0,1,0],[1,0,1],[0,1,0],[1,0,1],[0,1,1]],
  '%': [[1,0,1],[0,0,1],[0,1,0],[1,0,0],[1,0,1]],
  '$': [[0,1,1],[1,1,0],[0,1,0],[0,1,1],[1,1,0]],
  '^': [[0,1,0],[1,0,1],[0,0,0],[0,0,0],[0,0,0]],
  '~': [[0,0,0],[1,0,1],[0,1,0],[0,0,0],[0,0,0]],
  '|': [[0,1,0],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  '"': [[1,0,1],[1,0,1],[0,0,0],[0,0,0],[0,0,0]],
  "'": [[0,1,0],[0,1,0],[0,0,0],[0,0,0],[0,0,0]],
  '`': [[1,0,0],[0,1,0],[0,0,0],[0,0,0],[0,0,0]],
};

interface TextToPatternOptions {
  text: string;
  rows?: number;
  cols?: number;
  baseIntensity?: number;
  backgroundNoise?: number;
  textAlignment?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  noiseIntensity?: number;
}

/**
 * Generate a natural-looking GitHub contribution pattern from text
 */
export function generateTextPattern(options: TextToPatternOptions): CellIntensity[][] {
  const {
    text,
    rows = 7,
    cols = 52,
    baseIntensity = 4,
    backgroundNoise = 0.15,
    textAlignment = 'center',
    verticalAlign = 'middle',
    noiseIntensity = 1,
  } = options;

  const grid: CellIntensity[][] = Array(rows).fill(null).map(() => Array(cols).fill(0 as CellIntensity));
  const cleanText = text.toUpperCase().split('').filter((c) => FONT_3X5[c]).join('');
  
  if (cleanText.length === 0) return grid;

  const charWidth = 3;
  const charSpacing = 1;
  const textWidth = cleanText.length * charWidth + (cleanText.length - 1) * charSpacing;

  let startCol = 0;
  if (textAlignment === 'center') {
    startCol = Math.max(0, Math.floor((cols - textWidth) / 2));
  } else if (textAlignment === 'right') {
    startCol = Math.max(0, cols - textWidth);
  }

  let startRow = 0;
  if (verticalAlign === 'middle') {
    startRow = Math.floor((rows - 5) / 2);
  } else if (verticalAlign === 'bottom') {
    startRow = rows - 5;
  }

  let currentCol = startCol;
  for (const char of cleanText) {
    const fontData = FONT_3X5[char];
    if (!fontData || currentCol + charWidth > cols) break;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < charWidth; col++) {
        const targetRow = startRow + row;
        const targetCol = currentCol + col;
        if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
          if (fontData[row][col] === 1) {
            const variation = Math.random() > 0.7 ? -1 : 0;
            const intensity = Math.max(2, Math.min(4, baseIntensity + variation)) as CellIntensity;
            grid[targetRow][targetCol] = intensity;
          }
        }
      }
    }
    currentCol += charWidth + charSpacing;
  }

  if (backgroundNoise > 0) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (grid[row][col] === 0 && Math.random() < backgroundNoise) {
          const intensity = Math.random() > 0.5 ? 1 : (noiseIntensity as CellIntensity);
          grid[row][col] = intensity;
        }
      }
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col] > 0) {
        if (Math.random() < 0.1) {
          grid[row][col] = Math.max(1, grid[row][col] - 1) as CellIntensity;
        }
        if (Math.random() < 0.05) {
          grid[row][col] = Math.min(4, grid[row][col] + 1) as CellIntensity;
        }
      }
    }
  }

  return grid;
}

export function generateRealisticTextPattern(text: string, cols?: number): CellIntensity[][] {
  return generateTextPattern({ text, cols, baseIntensity: 4, backgroundNoise: 0.2, noiseIntensity: 1, textAlignment: 'center', verticalAlign: 'middle' });
}

export function generateCleanTextPattern(text: string, cols?: number): CellIntensity[][] {
  return generateTextPattern({ text, cols, baseIntensity: 4, backgroundNoise: 0.05, noiseIntensity: 1, textAlignment: 'center', verticalAlign: 'middle' });
}

export function generateHeavyTextPattern(text: string, cols?: number): CellIntensity[][] {
  return generateTextPattern({ text, cols, baseIntensity: 4, backgroundNoise: 0.35, noiseIntensity: 2, textAlignment: 'center', verticalAlign: 'middle' });
}

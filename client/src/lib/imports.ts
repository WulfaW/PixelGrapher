type CellIntensity = 0 | 1 | 2 | 3 | 4;

const ROWS = 7;
const COLS = 52;

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function makeGrid(rows = ROWS, cols = COLS, fill: CellIntensity = 0): CellIntensity[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function resizeToGrid(src: number[][]): CellIntensity[][] {
  // Pad/crop to 7x52 with nearest-neighbor sampling
  const srcH = src.length || 0;
  const srcW = src[0]?.length || 0;
  if (srcH === 0 || srcW === 0) return makeGrid();
  const out = makeGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const sr = Math.floor((r / (ROWS - 1)) * (srcH - 1));
      const sc = Math.floor((c / (COLS - 1)) * (srcW - 1));
      out[r][c] = clamp(src[sr][sc] ?? 0, 0, 4) as CellIntensity;
    }
  }
  return out;
}

export function parseAsciiToGrid(text: string): CellIntensity[][] {
  // Map characters to intensities
  const map: Record<string, number> = {
    '#': 4, '@': 4, '%': 4,
    '+': 3, 'X': 3, 'x': 3,
    '*': 2, '=': 2,
    '-': 1, '~': 1, ':': 1,
  };
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.length > 0);
  if (lines.length === 0) throw new Error('ASCII metin boş.');
  const width = Math.max(...lines.map(l => l.length));
  const src: number[][] = lines.map(l => {
    const row: number[] = [];
    for (let i = 0; i < width; i++) {
      const ch = l[i] ?? ' ';
      row.push(map[ch] ?? 0);
    }
    return row;
  });
  return resizeToGrid(src);
}

export function parseJsonToGrid(jsonText: string): CellIntensity[][] {
  let data: any;
  try {
    data = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('JSON parse edilemedi.');
  }
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('JSON formatı geçersiz. 2D sayı dizisi bekleniyor.');
  }
  const src: number[][] = data.map((row: any) =>
    row.map((v: any) => clamp(Number(v) || 0, 0, 4))
  );
  return resizeToGrid(src);
}

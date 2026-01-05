type CellIntensity = 0 | 1 | 2 | 3 | 4;
import { generateCleanTextPattern } from '@/lib/text-to-pattern';

const ROWS = 7;
const COLS = 52;

// Helpers
function makeGrid(rows = ROWS, cols = COLS, fill: CellIntensity = 0): CellIntensity[][] {
  return Array(rows).fill(null).map(() => Array(cols).fill(fill));
}

function generateWavePattern(): CellIntensity[][] {
  const grid = makeGrid();
  for (let x = 0; x < COLS; x++) {
    const wave1 = Math.sin(x / 4) * 1.5 + 2.5;
    const wave2 = Math.cos(x / 5 + Math.PI / 3) * 1.2 + 3.5;
    
    [wave1, wave2].forEach((wave, waveIdx) => {
      const center = Math.round(wave);
      for (let offset = -1; offset <= 1; offset++) {
        const r = center + offset;
        if (r >= 0 && r < ROWS) {
          const intensity = offset === 0 ? 4 : (waveIdx === 0 ? 3 : 2);
          grid[r][x] = Math.max(grid[r][x], intensity) as CellIntensity;
        }
      }
    });
  }
  return grid;
}

function generateGradientPattern(): CellIntensity[][] {
  const grid = makeGrid();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Radial gradient from center
      const centerR = ROWS / 2;
      const centerC = COLS / 2;
      const distR = (r - centerR) / centerR;
      const distC = (c - centerC) / centerC;
      const distance = Math.sqrt(distR * distR + distC * distC);
      const normalized = Math.max(0, Math.min(1, 1 - distance / 1.5));
      const intensity = Math.max(1, Math.min(4, Math.round(normalized * 4))) as CellIntensity;
      grid[r][c] = intensity;
    }
  }
  return grid;
}

function generatePixelPattern(): CellIntensity[][] {
  const grid = makeGrid();
  
  // Classic Space Invader pixel art (iconic and recognizable)
  const invader = [
    [0,0,1,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0],
    [0,1,1,0,1,1,1,0,1,1,0],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,1],
    [0,0,0,1,1,0,1,1,0,0,0],
  ];
  
  // Center the invader
  const h = invader.length;
  const w = invader[0].length;
  const startRow = Math.floor((ROWS - h) / 2);
  const startCol = Math.floor((COLS - w) / 2);
  
  // Draw main invader
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (invader[r][c]) {
        const rr = startRow + r;
        const cc = startCol + c;
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
          grid[rr][cc] = 4;
        }
      }
    }
  }
  
  // Add smaller invaders on sides for decoration
  const sideInvader = [
    [0,1,0,0,0,1,0],
    [0,0,1,0,1,0,0],
    [0,1,1,1,1,1,0],
    [1,0,1,1,1,0,1],
    [1,1,1,1,1,1,1],
  ];
  
  const sh = sideInvader.length;
  const sw = sideInvader[0].length;
  const sideStartRow = Math.floor((ROWS - sh) / 2);
  
  // Left invader
  const leftStartCol = 5;
  for (let r = 0; r < sh; r++) {
    for (let c = 0; c < sw; c++) {
      if (sideInvader[r][c]) {
        const rr = sideStartRow + r;
        const cc = leftStartCol + c;
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
          grid[rr][cc] = 3;
        }
      }
    }
  }
  
  // Right invader
  const rightStartCol = COLS - sw - 5;
  for (let r = 0; r < sh; r++) {
    for (let c = 0; c < sw; c++) {
      if (sideInvader[r][c]) {
        const rr = sideStartRow + r;
        const cc = rightStartCol + c;
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
          grid[rr][cc] = 3;
        }
      }
    }
  }
  
  return grid;
}

function generateHeart(): CellIntensity[][] {
  const grid = makeGrid();
  
  // Compact heart that fits in 7 rows (row 0 = top = Sunday in GitHub graph)
  const heartMask = [
    [0,1,1,0,0,1,1,0],  // Row 0 (Sunday - top)
    [1,1,1,1,1,1,1,1],  // Row 1 (Monday)
    [1,1,1,1,1,1,1,1],  // Row 2 (Tuesday)
    [1,1,1,1,1,1,1,1],  // Row 3 (Wednesday)
    [0,1,1,1,1,1,1,0],  // Row 4 (Thursday)
    [0,0,1,1,1,1,0,0],  // Row 5 (Friday)
    [0,0,0,1,1,0,0,0],  // Row 6 (Saturday - bottom)
  ];
  
  const h = heartMask.length;
  const w = heartMask[0].length;
  const startRow = 0; // Start from top (Sunday)
  const startCol = Math.max(0, Math.floor((COLS - w) / 2));
  
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      if (heartMask[r][c]) {
        const rr = startRow + r;
        const cc = startCol + c;
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
          // Create depth with intensity variation
          const distFromCenter = Math.abs(c - w / 2) / (w / 2);
          const intensity = r < 2 ? 4 : (distFromCenter > 0.6 ? 3 : 4);
          grid[rr][cc] = intensity as CellIntensity;
        }
      }
    }
  }
  return grid;
}

function generateSmile(): CellIntensity[][] {
  const grid = makeGrid();
  const midC = Math.floor(COLS / 2);
  
  // Simple minimal cat face
  const catData = [
    // Left ear
    [0, midC - 4, 4],
    [1, midC - 5, 4],
    [1, midC - 4, 4],
    // Right ear
    [0, midC + 4, 4],
    [1, midC + 4, 4],
    [1, midC + 5, 4],
    // Face outline
    [2, midC - 3, 3],
    [2, midC - 2, 3],
    [2, midC - 1, 3],
    [2, midC, 3],
    [2, midC + 1, 3],
    [2, midC + 2, 3],
    [2, midC + 3, 3],
    [3, midC - 3, 3],
    [3, midC + 3, 3],
    // Eyes
    [3, midC - 2, 4],
    [3, midC + 2, 4],
    // Nose
    [4, midC, 4],
    // Mouth
    [5, midC - 1, 2],
    [5, midC, 4],
    [5, midC + 1, 2],
  ];
  
  catData.forEach(([r, c, intensity]) => {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      grid[r][c] = intensity as CellIntensity;
    }
  });
  
  return grid;
}

function generateMountains(): CellIntensity[][] {
  const grid = makeGrid();
  
  // Generate three mountain peaks
  const peaks = [
    { center: 12, height: 5, width: 10 },
    { center: 26, height: 6, width: 14 },
    { center: 42, height: 4, width: 8 },
  ];
  
  peaks.forEach(({ center, height, width }) => {
    for (let c = center - width; c <= center + width; c++) {
      if (c >= 0 && c < COLS) {
        const distFromPeak = Math.abs(c - center);
        const mountainHeight = Math.max(0, height - Math.floor(distFromPeak * height / width));
        
        for (let h = 0; h < mountainHeight; h++) {
          const r = ROWS - 1 - h;
          if (r >= 0 && r < ROWS) {
            const intensity = h < 2 ? 4 : h < 4 ? 3 : 2;
            grid[r][c] = Math.max(grid[r][c], intensity) as CellIntensity;
          }
        }
      }
    }
  });
  
  return grid;
}

export const TEMPLATES = {
  hello: {
    name: 'HELLO',
    description: 'Classic greeting - perfect for first impressions',
    grid: generateCleanTextPattern('HELLO', COLS)
  },

  heart: {
    name: 'Heart',
    description: 'Express love with a shaded heart emoji',
    grid: generateHeart()
  },

  cat: {
    name: 'Cat',
    description: 'Cute minimal cat face',
    grid: generateSmile()
  },

  mountains: {
    name: 'Mountains',
    description: 'Scenic mountain range landscape',
    grid: generateMountains()
  },

  wave: {
    name: 'Wave',
    description: 'Smooth flowing sine waves',
    grid: generateWavePattern()
  },

  gradient: {
    name: 'Gradient',
    description: 'Radial gradient from center outward',
    grid: generateGradientPattern()
  },

  pixel: {
    name: 'Space Invader',
    description: 'Classic retro gaming icon',
    grid: generatePixelPattern()
  },
} as const;

export function getTemplate(id: string): CellIntensity[][] | null {
  const template = TEMPLATES[id as keyof typeof TEMPLATES];
  return template ? (template.grid as CellIntensity[][]) : null;
}

export function getAllTemplates() {
  return Object.entries(TEMPLATES).map(([id, template]) => ({ id, ...template }));
}

import { Brick, BrickColorKey } from './types';

export const PLAYFIELD_WIDTH = 448;
export const PLAYFIELD_HEIGHT = 576;
export const WALL_THICKNESS = 20;
export const BRICK_COLS = 11;
export const BRICK_WIDTH = 36;
export const BRICK_HEIGHT = 16;
export const BRICK_GAP = 1;
export const BRICK_START_Y = 72;

export interface BrickColorConfig {
  base: string;
  highlight: string;
  shadow: string;
  points: number;
  hits: number;
  indestructible?: boolean;
}

export const BRICK_CONFIG: Record<BrickColorKey, BrickColorConfig> = {
  white: {
    base: '#f8fafc',
    highlight: '#ffffff',
    shadow: '#94a3b8',
    points: 50,
    hits: 1,
  },
  orange: {
    base: '#f97316',
    highlight: '#fb923c',
    shadow: '#c2410c',
    points: 60,
    hits: 1,
  },
  cyan: {
    base: '#06b6d4',
    highlight: '#22d3ee',
    shadow: '#0e7490',
    points: 70,
    hits: 1,
  },
  green: {
    base: '#22c55e',
    highlight: '#4ade80',
    shadow: '#15803d',
    points: 80,
    hits: 1,
  },
  red: {
    base: '#ef4444',
    highlight: '#f87171',
    shadow: '#b91c1c',
    points: 90,
    hits: 1,
  },
  blue: {
    base: '#3b82f6',
    highlight: '#60a5fa',
    shadow: '#1d4ed8',
    points: 100,
    hits: 1,
  },
  pink: {
    base: '#ec4899',
    highlight: '#f472b6',
    shadow: '#be185d',
    points: 110,
    hits: 1,
  },
  yellow: {
    base: '#eab308',
    highlight: '#facc15',
    shadow: '#a16207',
    points: 120,
    hits: 1,
  },
  silver: {
    base: '#cbd5e1',
    highlight: '#f1f5f9',
    shadow: '#64748b',
    points: 200,
    hits: 2, // takes 2-3 hits
  },
  gold: {
    base: '#d97706',
    highlight: '#fde047',
    shadow: '#78350f',
    points: 0,
    hits: 9999,
    indestructible: true,
  },
};

// Character codes for stage templates:
// 'w': white, 'o': orange, 'c': cyan, 'g': green, 'r': red, 'b': blue, 'p': pink, 'y': yellow, 's': silver, 'k': gold, '.': empty
const STAGE_TEMPLATES: string[][] = [
  // Stage 1: The Iconic Arkanoid Level 1
  [
    'sssssssssss',
    'rrrrrrrrrrr',
    'yyyyyyyyyyy',
    'bbbbbbbbbbb',
    'ggggggggggg',
    'ppppppppppp',
  ],

  // Stage 2: Fortress & Vault
  [
    '...s...s...',
    '..sss.sss..',
    '.rrkrrrksr.',
    'bbbbbbbbbbb',
    '.ccccccccc.',
    '..ggggggg..',
    '...ooooo...',
    '....yyy....',
    '.....w.....',
  ],

  // Stage 3: Twin Pillars & Golden Gate
  [
    'k.sssssss.k',
    'k.rrrrrrr.k',
    'k.bbbbbbb.k',
    'k...kkk...k',
    'k.ggggggg.k',
    'k.ppppppp.k',
    'k.ooooooo.k',
    'k...sss...k',
  ],

  // Stage 4: Alien Skull / Invader
  [
    '..rr...rr..',
    '.rrrr.rrrr.',
    'rrsrrrrrsrr',
    'rrrrrrrrrrr',
    '.bb.bbb.bb.',
    '.bbbbbbbbb.',
    '..pp.p.pp..',
    '..k.....k..',
  ],

  // Stage 5: Diamond Maze
  [
    '.....k.....',
    '....sks....',
    '...srrrs...',
    '..sbbbbbs..',
    '.sgggggggs.',
    '..sppppps..',
    '...sooos...',
    '....sws....',
    '.....s.....',
  ],
];

export function buildBricksForRound(round: number): Brick[] {
  const templateIdx = (round - 1) % STAGE_TEMPLATES.length;
  let rows = STAGE_TEMPLATES[templateIdx];

  // For high looping rounds, dynamically alter or add silver rows
  const silverHits = Math.min(4, 2 + Math.floor((round - 1) / 5));

  const bricks: Brick[] = [];
  const startX = WALL_THICKNESS + Math.floor((PLAYFIELD_WIDTH - WALL_THICKNESS * 2 - BRICK_COLS * BRICK_WIDTH) / 2);

  rows.forEach((rowStr, rowIndex) => {
    for (let colIndex = 0; colIndex < rowStr.length; colIndex++) {
      const char = rowStr[colIndex];
      let colorKey: BrickColorKey | null = null;

      switch (char) {
        case 'w': colorKey = 'white'; break;
        case 'o': colorKey = 'orange'; break;
        case 'c': colorKey = 'cyan'; break;
        case 'g': colorKey = 'green'; break;
        case 'r': colorKey = 'red'; break;
        case 'b': colorKey = 'blue'; break;
        case 'p': colorKey = 'pink'; break;
        case 'y': colorKey = 'yellow'; break;
        case 's': colorKey = 'silver'; break;
        case 'k': colorKey = 'gold'; break;
      }

      if (!colorKey) continue;

      const cfg = BRICK_CONFIG[colorKey];
      const hits = colorKey === 'silver' ? silverHits : cfg.hits;
      const points = colorKey === 'silver' ? 50 * round : cfg.points;

      bricks.push({
        id: `brick-${rowIndex}-${colIndex}-${round}`,
        x: startX + colIndex * BRICK_WIDTH,
        y: BRICK_START_Y + rowIndex * (BRICK_HEIGHT + BRICK_GAP),
        width: BRICK_WIDTH - BRICK_GAP,
        height: BRICK_HEIGHT,
        type: colorKey,
        hitsLeft: hits,
        maxHits: hits,
        points,
        baseColor: cfg.base,
        highlightColor: cfg.highlight,
        shadowColor: cfg.shadow,
        indestructible: cfg.indestructible,
      });
    }
  });

  return bricks;
}

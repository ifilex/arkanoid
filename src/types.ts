export type PowerUpType = 'S' | 'C' | 'L' | 'E' | 'D' | 'B' | 'P';

export type BrickColorKey = 
  | 'white' 
  | 'orange' 
  | 'cyan' 
  | 'green' 
  | 'red' 
  | 'blue' 
  | 'pink' 
  | 'yellow' 
  | 'silver' 
  | 'gold';

export interface Brick {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickColorKey;
  hitsLeft: number;
  maxHits: number;
  points: number;
  baseColor: string;
  highlightColor: string;
  shadowColor: string;
  indestructible?: boolean;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  attachedToPaddle: boolean;
  attachOffsetX: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  skinId: string;
  hasLaser: boolean;
  hasCatch: boolean;
  isExpanded: boolean;
  laserCooldown: number;
}

export interface PowerUpPill {
  id: string;
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  width: number;
  height: number;
  color: string;
  label: string;
  glowColor: string;
}

export interface LaserBolt {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
}

export interface CoinPickup {
  id: string;
  x: number;
  y: number;
  vy: number;
  value: number;
  radius: number;
  rotation: number;
}

export interface EnemyDrone {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'pyramid' | 'sphere' | 'diamond' | 'cube';
  angle: number;
  width: number;
  height: number;
  points: number;
  time: number;
}

export interface WarpGate {
  isOpen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  pulseTime: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  shape?: 'square' | 'circle' | 'spark' | 'ring';
  gravity?: number;
  friction?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface VausSkin {
  id: string;
  name: string;
  price: number;
  description: string;
  bodyColor: string;
  trimColor: string;
  cockpitColor: string;
  glowColor: string;
}

export interface BallSkin {
  id: string;
  name: string;
  price: number;
  description: string;
  coreColor: string;
  glowColor: string;
  trailColor: string;
  trailType: 'simple' | 'fire' | 'plasma' | 'rainbow' | 'pixel';
}

export interface ThemeScenario {
  id: string;
  name: string;
  price: number;
  description: string;
  bgDark: string;
  bgLight: string;
  gridColor: string;
  wallColor: string;
  wallHighlight: string;
}

export interface PlayerCloudProfile {
  playerId: string;
  playerName: string;
  coins: number;
  highScore: number;
  maxRound: number;
  unlockedSkins: string[];
  selectedVausSkin: string;
  selectedBallSkin: string;
  selectedTheme: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  round: number;
  date: string;
}

export type GameStateStatus = 
  | 'menu' 
  | 'ready' 
  | 'playing' 
  | 'paused' 
  | 'round_clear' 
  | 'game_over' 
  | 'victory';

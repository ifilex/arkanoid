import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '2mb' }));

// In-memory persistent store for user saves and global leaderboard
interface UserSaveData {
  playerId: string;
  playerName: string;
  coins: number;
  highScore: number;
  maxRound: number;
  unlockedSkins: string[];
  selectedVausSkin: string;
  selectedBallSkin: string;
  selectedTheme: string;
  updatedAt: string;
}

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  score: number;
  round: number;
  date: string;
}

const userCloudStorage = new Map<string, UserSaveData>();
let globalLeaderboard: LeaderboardEntry[] = [
  { playerId: 'bot-1', playerName: 'DOH_SLAYER', score: 28450, round: 5, date: '2026-09-01' },
  { playerId: 'bot-2', playerName: 'ARCADE_KING', score: 22100, round: 4, date: '2026-09-03' },
  { playerId: 'bot-3', playerName: 'VAUS_PILOT', score: 18950, round: 4, date: '2026-09-05' },
  { playerId: 'bot-4', playerName: 'RETRO_STAR', score: 14200, round: 3, date: '2026-09-07' },
  { playerId: 'bot-5', playerName: 'BRICK_BREAKER', score: 9800, round: 2, date: '2026-09-08' },
];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cloud sync: Save user progress
app.post('/api/sync/save', (req, res) => {
  try {
    const data: UserSaveData = req.body;
    if (!data || !data.playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }
    data.updatedAt = new Date().toISOString();
    userCloudStorage.set(data.playerId, data);

    // Also update leaderboard if score is worthy
    if (data.highScore > 0) {
      const existingIdx = globalLeaderboard.findIndex(e => e.playerId === data.playerId);
      if (existingIdx >= 0) {
        if (data.highScore > globalLeaderboard[existingIdx].score) {
          globalLeaderboard[existingIdx].score = data.highScore;
          globalLeaderboard[existingIdx].playerName = data.playerName || 'PILOT';
          globalLeaderboard[existingIdx].round = Math.max(globalLeaderboard[existingIdx].round, data.maxRound || 1);
          globalLeaderboard[existingIdx].date = new Date().toISOString().split('T')[0];
        }
      } else {
        globalLeaderboard.push({
          playerId: data.playerId,
          playerName: data.playerName || 'PILOT',
          score: data.highScore,
          round: data.maxRound || 1,
          date: new Date().toISOString().split('T')[0],
        });
      }
      globalLeaderboard.sort((a, b) => b.score - a.score);
      globalLeaderboard = globalLeaderboard.slice(0, 20);
    }

    res.json({ success: true, savedAt: data.updatedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save progress' });
  }
});

// Cloud sync: Load user progress
app.get('/api/sync/load/:playerId', (req, res) => {
  const { playerId } = req.params;
  const userRecord = userCloudStorage.get(playerId);
  if (!userRecord) {
    return res.status(404).json({ error: 'Player cloud data not found' });
  }
  res.json({ success: true, data: userRecord });
});

// Leaderboard API
app.get('/api/sync/leaderboard', (req, res) => {
  res.json({ leaderboard: globalLeaderboard });
});

app.post('/api/sync/leaderboard', (req, res) => {
  const { playerId, playerName, score, round } = req.body;
  if (!playerId || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid score submission' });
  }

  const existingIdx = globalLeaderboard.findIndex(e => e.playerId === playerId);
  if (existingIdx >= 0) {
    if (score > globalLeaderboard[existingIdx].score) {
      globalLeaderboard[existingIdx].score = score;
      globalLeaderboard[existingIdx].playerName = playerName || 'PILOT';
      globalLeaderboard[existingIdx].round = round || 1;
      globalLeaderboard[existingIdx].date = new Date().toISOString().split('T')[0];
    }
  } else {
    globalLeaderboard.push({
      playerId,
      playerName: playerName || 'PILOT',
      score,
      round: round || 1,
      date: new Date().toISOString().split('T')[0],
    });
  }

  globalLeaderboard.sort((a, b) => b.score - a.score);
  globalLeaderboard = globalLeaderboard.slice(0, 20);

  res.json({ success: true, leaderboard: globalLeaderboard });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arkanoid Retro server running on port ${PORT}`);
  });
}

start();

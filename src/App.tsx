import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './gameEngine';
import { GameStateStatus, LeaderboardEntry, PlayerCloudProfile, PowerUpType } from './types';
import { PLAYFIELD_HEIGHT, PLAYFIELD_WIDTH } from './levels';
import { retroAudio } from './audio';
import { GameHUD } from './components/GameHUD';
import { VirtualControls } from './components/VirtualControls';
import { StartMenu } from './components/StartMenu';
import { ArcadeShop } from './components/ArcadeShop';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { detectDevice, DeviceInfo } from './utils/deviceDetection';
import { LeftArcadeWing, RightArcadeWing } from './components/ArcadeCabinetWings';
import { Play, RotateCcw, Home, Sparkles } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'arkanoid_retro_save_v1';
const LOCAL_LEADERBOARD_KEY = 'arkanoid_retro_scores_v1';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const animationFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // State
  const [status, setStatus] = useState<GameStateStatus>('menu');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);

  // User Profile & Customization
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('PILOT-1986');
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([
    'vaus_classic',
    'ball_energy',
    'theme_arcade',
  ]);
  const [selectedVausSkin, setSelectedVausSkin] = useState<string>('vaus_classic');
  const [selectedBallSkin, setSelectedBallSkin] = useState<string>('ball_energy');
  const [selectedTheme, setSelectedTheme] = useState<string>('theme_arcade');

  // Modals & Settings
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [controlsMode, setControlsMode] = useState<'auto' | 'always' | 'never'>('auto');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);

  // Cloud & Local Scores
  const [localScores, setLocalScores] = useState<LeaderboardEntry[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Dynamic Device and System detection
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Initialize Game Engine and load saved data
  useEffect(() => {
    // Initial system detection
    const currentDevice = detectDevice();
    setDeviceInfo(currentDevice);

    // Load local storage save
    let loadedId = '';
    let loadedName = 'PILOT-1986';
    let loadedCoins = 0;
    let loadedHighScore = 0;
    let loadedUnlocked = ['vaus_classic', 'ball_energy', 'theme_arcade'];
    let loadedVaus = 'vaus_classic';
    let loadedBall = 'ball_energy';
    let loadedTheme = 'theme_arcade';

    try {
      const savedRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        loadedId = saved.playerId || '';
        loadedName = saved.playerName || 'PILOT-1986';
        loadedCoins = saved.coins || 0;
        loadedHighScore = saved.highScore || 0;
        loadedUnlocked = saved.unlockedSkins || loadedUnlocked;
        loadedVaus = saved.selectedVausSkin || loadedVaus;
        loadedBall = saved.selectedBallSkin || loadedBall;
        loadedTheme = saved.selectedTheme || loadedTheme;
      }

      const scoresRaw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
      if (scoresRaw) {
        setLocalScores(JSON.parse(scoresRaw));
      } else {
        const sampleLocal: LeaderboardEntry[] = [
          { playerId: 'loc-1', playerName: 'ARKANOID_ACE', score: 25400, round: 4, date: '2026-09-02' },
          { playerId: 'loc-2', playerName: 'VAUS_MASTER', score: 18200, round: 3, date: '2026-09-04' },
          { playerId: 'loc-3', playerName: 'RETRO_RUNNER', score: 11500, round: 2, date: '2026-09-06' },
        ];
        setLocalScores(sampleLocal);
        localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(sampleLocal));
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }

    if (!loadedId) {
      loadedId = `VAUS-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    setPlayerId(loadedId);
    setPlayerName(loadedName);
    setCoins(loadedCoins);
    setHighScore(loadedHighScore);
    setUnlockedSkins(loadedUnlocked);
    setSelectedVausSkin(loadedVaus);
    setSelectedBallSkin(loadedBall);
    setSelectedTheme(loadedTheme);

    // Initialize Engine
    const engine = new GameEngine({
      onScoreChange: (s) => setScore(s),
      onCoinsChange: (c) => setCoins(c),
      onLivesChange: (l) => setLives(l),
      onRoundChange: (r) => setRound(r),
      onStatusChange: (st) => setStatus(st),
      onActivePowerUp: (p) => setActivePowerUp(p),
    });

    engine.selectedVausSkin = loadedVaus;
    engine.selectedBallSkin = loadedBall;
    engine.selectedTheme = loadedTheme;
    engine.isDarkMode = isDarkMode;

    engineRef.current = engine;

    // Try background cloud sync load
    fetch(`/api/sync/load/${loadedId}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((json) => {
        if (json && json.success && json.data) {
          const cd: PlayerCloudProfile = json.data;
          if (cd.coins > loadedCoins) setCoins(cd.coins);
          if (cd.highScore > loadedHighScore) setHighScore(cd.highScore);
          setIsCloudSynced(true);
          setLastSyncedAt(cd.updatedAt || new Date().toISOString());
        }
      })
      .catch(() => {});

    // Window resize & orientation listener to adapt to screen changes
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Save to localStorage whenever critical state updates
  useEffect(() => {
    if (!playerId) return;
    const data: PlayerCloudProfile = {
      playerId,
      playerName,
      coins,
      highScore,
      maxRound: round,
      unlockedSkins,
      selectedVausSkin,
      selectedBallSkin,
      selectedTheme,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save error', e);
    }
  }, [
    playerId,
    playerName,
    coins,
    highScore,
    round,
    unlockedSkins,
    selectedVausSkin,
    selectedBallSkin,
    selectedTheme,
  ]);

  // Handle Game Over: record in local leaderboard & auto-sync to cloud
  useEffect(() => {
    if (status === 'game_over' && score > 0) {
      // Record in local leaderboard
      const newEntry: LeaderboardEntry = {
        playerId,
        playerName,
        score,
        round,
        date: new Date().toISOString().split('T')[0],
      };

      setLocalScores((prev) => {
        const next = [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 20);
        try {
          localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(next));
        } catch (e) {}
        return next;
      });

      // Auto-sync to Cloud
      syncToCloud(newEntry);
    }
  }, [status]);

  // Main Canvas Render & Game Loop
  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!active) return;
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      const engine = engineRef.current;
      const canvas = canvasRef.current;

      if (engine && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          engine.update(dt);
          engine.render(ctx);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Keyboard events
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      retroAudio.unlock();
      engineRef.current?.handleKeyDown(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      engineRef.current?.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Direct canvas touch / mouse drag handling
  const handleCanvasPointerMove = (clientX: number) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    engineRef.current.setPaddleTargetFromRatio(ratio);
  };

  const syncToCloud = async (customScoreEntry?: LeaderboardEntry) => {
    if (!playerId) return;
    setIsCloudSyncing(true);
    try {
      const payload = {
        playerId,
        playerName,
        coins,
        highScore: Math.max(highScore, score),
        maxRound: round,
        unlockedSkins,
        selectedVausSkin,
        selectedBallSkin,
        selectedTheme,
      };

      const res = await fetch('/api/sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const resJson = await res.json();
        setIsCloudSynced(true);
        setLastSyncedAt(resJson.savedAt || new Date().toISOString());
      }
    } catch (e) {
      console.warn('Cloud sync error', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleManualCloudLoad = async () => {
    if (!playerId) return;
    setIsCloudSyncing(true);
    try {
      const res = await fetch(`/api/sync/load/${playerId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const d: PlayerCloudProfile = json.data;
          setCoins(d.coins);
          setHighScore(d.highScore);
          setPlayerName(d.playerName || playerName);
          setUnlockedSkins(d.unlockedSkins || unlockedSkins);
          setSelectedVausSkin(d.selectedVausSkin || selectedVausSkin);
          setSelectedBallSkin(d.selectedBallSkin || selectedBallSkin);
          setSelectedTheme(d.selectedTheme || selectedTheme);
          setLastSyncedAt(d.updatedAt || new Date().toISOString());
          setIsCloudSynced(true);
          retroAudio.playPowerupCollect();
        }
      }
    } catch (e) {
      console.warn('Could not load cloud save', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Start game action
  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.selectedVausSkin = selectedVausSkin;
    engineRef.current.selectedBallSkin = selectedBallSkin;
    engineRef.current.selectedTheme = selectedTheme;
    engineRef.current.isDarkMode = isDarkMode;
    engineRef.current.initGame(coins, highScore);
  };

  // Buy Skin
  const handleBuySkin = (skinId: string, price: number): boolean => {
    if (coins < price) return false;
    const newCoins = coins - price;
    setCoins(newCoins);
    const newUnlocked = [...unlockedSkins, skinId];
    setUnlockedSkins(newUnlocked);
    if (engineRef.current) {
      engineRef.current.coins = newCoins;
    }
    syncToCloud();
    return true;
  };

  const handleEquipVausSkin = (skinId: string) => {
    setSelectedVausSkin(skinId);
    if (engineRef.current) {
      engineRef.current.selectedVausSkin = skinId;
      engineRef.current.paddle.skinId = skinId;
    }
    syncToCloud();
  };

  const handleEquipBallSkin = (skinId: string) => {
    setSelectedBallSkin(skinId);
    if (engineRef.current) {
      engineRef.current.selectedBallSkin = skinId;
    }
    syncToCloud();
  };

  const handleEquipTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    if (engineRef.current) {
      engineRef.current.selectedTheme = themeId;
    }
    syncToCloud();
  };

  const showVirtualControls =
    controlsMode === 'always' ||
    (controlsMode === 'auto' && (deviceInfo.type === 'mobile' || deviceInfo.type === 'tablet'));

  return (
    <div
      id="arkanoid-app-container"
      className="relative w-full h-screen h-[100dvh] flex flex-row items-stretch justify-center overflow-hidden select-none bg-neutral-950 text-neutral-100"
    >
      {/* Left Arcade Cabinet Wing */}
      <LeftArcadeWing
        playerName={playerName}
        coins={coins}
        highScores={localScores}
        currentRound={round}
      />

      {/* Main Arcade Cabinet Center Stage */}
      <main
        id="arcade-stage-wrapper"
        ref={containerRef}
        onPointerMove={(e) => {
          if (status === 'playing') {
            handleCanvasPointerMove(e.clientX);
          }
        }}
        onPointerDown={(e) => {
          retroAudio.unlock();
          if (status === 'playing') {
            handleCanvasPointerMove(e.clientX);
            engineRef.current?.handleActionTrigger();
          }
        }}
        className="relative flex-1 h-full max-h-screen flex items-center justify-center p-0 sm:p-2 md:p-3 overflow-hidden bg-neutral-950"
      >
        {/* Arcade Cabinet Frame (Fills full height, maintains 448/576 arcade ratio) */}
        <div
          id="arcade-screen-bezel"
          className="relative h-full max-h-full aspect-[448/576] w-auto max-w-full rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border-4 border-neutral-800 bg-black overflow-hidden flex flex-col items-stretch"
        >
          {/* Integrated Arcade Cabinet HUD */}
          <GameHUD
            score={score}
            highScore={highScore}
            round={round}
            lives={lives}
            coins={coins}
            activePowerUp={activePowerUp}
            isPaused={status === 'paused'}
            isMuted={isMuted}
            isCloudSynced={isCloudSynced}
            isFullscreen={isFullscreen}
            onTogglePause={() => {
              if (status === 'playing') {
                setStatus('paused');
                if (engineRef.current) engineRef.current.status = 'paused';
              } else if (status === 'paused') {
                setStatus('playing');
                if (engineRef.current) engineRef.current.status = 'playing';
              }
            }}
            onToggleMute={() => {
              const next = !isMuted;
              setIsMuted(next);
              retroAudio.setMuted(next);
            }}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenShop={() => setIsShopOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* HTML5 Game Canvas Area */}
          <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden flex items-center justify-center bg-black">
            <canvas
              id="arkanoid-canvas"
              ref={canvasRef}
              width={PLAYFIELD_WIDTH}
              height={PLAYFIELD_HEIGHT}
              onPointerDown={(e) => {
                retroAudio.unlock();
                handleCanvasPointerMove(e.clientX);
                engineRef.current?.handleActionTrigger();
              }}
              onPointerMove={(e) => {
                handleCanvasPointerMove(e.clientX);
              }}
              onTouchStart={(e) => {
                retroAudio.unlock();
                if (e.touches.length > 0) {
                  handleCanvasPointerMove(e.touches[0].clientX);
                }
                engineRef.current?.handleActionTrigger();
              }}
              onTouchMove={(e) => {
                if (e.touches.length > 0) {
                  handleCanvasPointerMove(e.touches[0].clientX);
                }
              }}
              className="w-full h-full object-contain cursor-crosshair touch-none"
              style={{ touchAction: 'none' }}
            />

            {/* CRT Scanlines Layer */}
            {showScanlines && <div className="absolute inset-0 crt-overlay pointer-events-none" />}

            {/* Start Menu Overlay */}
            {status === 'menu' && (
              <StartMenu
                onStartGame={handleStartGame}
                onOpenShop={() => setIsShopOpen(true)}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                coins={coins}
                highScore={highScore}
                playerName={playerName}
                deviceInfo={deviceInfo}
              />
            )}

            {/* Paused Overlay */}
            {status === 'paused' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs text-center p-6 select-none overflow-hidden">
                <h2 className="font-arcade text-2xl sm:text-3xl text-yellow-400 mb-6 animate-pulse drop-shadow-[0_2px_10px_rgba(250,204,21,0.5)]">
                  PAUSA
                </h2>
                <div className="flex flex-col gap-3 w-52">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('playing');
                      if (engineRef.current) engineRef.current.status = 'playing';
                    }}
                    className="py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-arcade text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/30 active:scale-98 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    REANUDAR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('menu');
                      if (engineRef.current) engineRef.current.status = 'menu';
                    }}
                    className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-arcade text-xs flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer active:scale-98 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    MENÚ PRINCIPAL
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Screen Overlay */}
            {status === 'game_over' && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm text-center p-6 select-none overflow-hidden">
                <h2 className="font-arcade text-3xl sm:text-4xl text-red-500 mb-2 drop-shadow-[0_4px_12px_rgba(239,68,68,0.6)]">
                  GAME OVER
                </h2>
                <p className="font-arcade text-xs text-yellow-300 mb-4 tracking-wider">
                  PUNTUACIÓN FINAL: {score.toLocaleString()}
                </p>

                <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/40 px-3.5 py-1.5 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="font-arcade text-xs text-yellow-300">
                    MONEDAS EN BANCO: {coins}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 w-56">
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="py-3 px-4 rounded-xl bg-linear-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-arcade text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/30 active:scale-98 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    REINTENTAR
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-cyan-300 font-arcade text-xs flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer active:scale-98 transition-all"
                  >
                    VER CLASIFICACIÓN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('menu');
                      if (engineRef.current) engineRef.current.status = 'menu';
                    }}
                    className="py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-arcade text-xs flex items-center justify-center gap-2 border border-neutral-800 cursor-pointer active:scale-98 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    MENÚ
                  </button>
                </div>
              </div>
            )}

            {/* Virtual Transparent Mobile Joystick & Action Button */}
            {status === 'playing' && (
              <VirtualControls
                isVisible={showVirtualControls}
                hasLaser={engineRef.current?.paddle.hasLaser || false}
                onMoveDelta={(delta) => engineRef.current?.movePaddleDelta(delta)}
                onMoveRatio={(ratio) => engineRef.current?.setPaddleTargetFromRatio(ratio)}
                onAction={() => engineRef.current?.handleActionTrigger()}
              />
            )}
          </div>
        </div>
      </main>

      {/* Right Arcade Cabinet Wing */}
      <RightArcadeWing
        onToggleScanlines={() => setShowScanlines(!showScanlines)}
        showScanlines={showScanlines}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          retroAudio.setMuted(next);
        }}
        isMuted={isMuted}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals */}
      <ArcadeShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        unlockedSkins={unlockedSkins}
        selectedVausSkin={selectedVausSkin}
        selectedBallSkin={selectedBallSkin}
        selectedTheme={selectedTheme}
        onBuySkin={handleBuySkin}
        onEquipVausSkin={handleEquipVausSkin}
        onEquipBallSkin={handleEquipBallSkin}
        onEquipTheme={handleEquipTheme}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        localScores={localScores}
        playerName={playerName}
        playerId={playerId}
        currentScore={score}
        currentRound={round}
        onUpdatePlayerName={(name) => {
          setPlayerName(name);
          syncToCloud();
        }}
        onSubmitCloudScore={async () => {
          await syncToCloud();
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => {
          const next = !isDarkMode;
          setIsDarkMode(next);
          if (engineRef.current) engineRef.current.isDarkMode = next;
        }}
        showScanlines={showScanlines}
        onToggleScanlines={() => setShowScanlines(!showScanlines)}
        controlsMode={controlsMode}
        onChangeControlsMode={(m) => setControlsMode(m)}
        deviceInfo={deviceInfo}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          retroAudio.setMuted(next);
        }}
        volume={volume}
        onChangeVolume={(v) => {
          setVolume(v);
          retroAudio.setVolume(v);
        }}
        playerId={playerId}
        isCloudSyncing={isCloudSyncing}
        lastSyncedAt={lastSyncedAt}
        onManualCloudSave={() => syncToCloud()}
        onManualCloudLoad={handleManualCloudLoad}
      />
    </div>
  );
}

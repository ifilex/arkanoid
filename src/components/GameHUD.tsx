import React from 'react';
import { Pause, Play, ShoppingBag, Settings, Trophy, Volume2, VolumeX, Maximize2, Minimize2, Cloud, CloudCheck } from 'lucide-react';
import { PowerUpType } from '../types';

interface GameHUDProps {
  score: number;
  highScore: number;
  round: number;
  lives: number;
  coins: number;
  activePowerUp: PowerUpType | null;
  isPaused: boolean;
  isMuted: boolean;
  isCloudSynced: boolean;
  isFullscreen?: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen?: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  round,
  lives,
  coins,
  activePowerUp,
  isPaused,
  isMuted,
  isCloudSynced,
  isFullscreen,
  onTogglePause,
  onToggleMute,
  onOpenShop,
  onOpenLeaderboard,
  onOpenSettings,
  onToggleFullscreen,
}) => {
  const getPowerUpBadge = (type: PowerUpType) => {
    switch (type) {
      case 'S':
        return { label: 'S • SLOW', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/50' };
      case 'C':
        return { label: 'C • CATCH', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' };
      case 'L':
        return { label: 'L • LASER', bg: 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' };
      case 'E':
        return { label: 'E • EXPAND', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/50' };
      case 'D':
        return { label: 'D • DISRUPT', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' };
      case 'B':
        return { label: 'B • PORTAL', bg: 'bg-pink-500/20 text-pink-400 border-pink-500/50 animate-bounce' };
      case 'P':
        return { label: 'P • EXTRA', bg: 'bg-slate-200/20 text-slate-200 border-slate-400/50' };
    }
  };

  const badge = activePowerUp ? getPowerUpBadge(activePowerUp) : null;

  return (
    <header
      id="game-hud-bar"
      className="w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-2 sm:px-3 py-1.5 flex flex-col gap-1 select-none shrink-0 z-20"
    >
      {/* Top Arcade Score Line */}
      <div className="flex items-center justify-between font-arcade text-xs leading-none">
        {/* 1UP Score */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] sm:text-[9px] text-red-500 font-bold tracking-wider animate-pulse">1UP</span>
          <span className="text-white text-xs sm:text-sm tracking-widest font-mono font-bold">
            {score.toString().padStart(6, '0')}
          </span>
        </div>

        {/* High Score */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] sm:text-[9px] text-red-500 tracking-wider hidden xs:inline">RECORD</span>
          <span className="text-yellow-400 text-xs sm:text-sm tracking-widest font-mono font-bold">
            {highScore.toString().padStart(6, '0')}
          </span>
        </div>

        {/* Round */}
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] sm:text-[9px] text-cyan-400 tracking-wider">RD</span>
          <span className="text-cyan-300 text-xs sm:text-sm tracking-widest font-mono font-bold">
            {round.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Second Row: Vaus Lives, Coins, Active Item & Controls */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/50">
        {/* Lives (Mini Vaus Ships) */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <div
              key={`life-${i}`}
              className="w-4 h-1.5 sm:w-5 sm:h-2 rounded-xs bg-linear-to-r from-red-600 via-neutral-100 to-red-600 border border-neutral-700 shadow-xs"
              title="Vaus nave restante"
            />
          ))}
          {lives <= 0 && <span className="text-[8px] font-arcade text-red-500">ÚLTIMA NAVE</span>}
        </div>

        {/* Active PowerUp Badge */}
        {badge && (
          <div
            className={`flex items-center px-1.5 py-0.5 rounded-full border text-[8px] font-arcade ${badge.bg}`}
          >
            {badge.label}
          </div>
        )}

        {/* Coins Counter */}
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">
          <span className="w-3 h-3 rounded-full bg-yellow-400 flex items-center justify-center text-[7px] font-bold text-yellow-950">
            $
          </span>
          <span className="font-arcade text-[9px] text-yellow-300">{coins}</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Pause */}
          <button
            id="hud-pause-btn"
            type="button"
            onClick={onTogglePause}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isPaused ? 'Reanudar' : 'Pausar'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-yellow-400 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Sound Mute */}
          <button
            id="hud-mute-btn"
            type="button"
            onClick={onToggleMute}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Shop */}
          <button
            id="hud-shop-btn"
            type="button"
            onClick={onOpenShop}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-yellow-300 transition-colors cursor-pointer"
            title="Tienda de Skins"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>

          {/* Leaderboard */}
          <button
            id="hud-leaderboard-btn"
            type="button"
            onClick={onOpenLeaderboard}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Ranking"
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen (if handler provided) */}
          {onToggleFullscreen && (
            <button
              id="hud-fullscreen-btn"
              type="button"
              onClick={onToggleFullscreen}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Settings */}
          <button
            id="hud-settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Ajustes"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

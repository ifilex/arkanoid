import React from 'react';
import { Play, ShoppingBag, Trophy, Settings, Zap, Monitor, Smartphone } from 'lucide-react';
import { retroAudio } from '../audio';
import { DeviceInfo } from '../utils/deviceDetection';

interface StartMenuProps {
  onStartGame: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  coins: number;
  highScore: number;
  playerName: string;
  deviceInfo: DeviceInfo;
}

export const StartMenu: React.FC<StartMenuProps> = ({
  onStartGame,
  onOpenShop,
  onOpenLeaderboard,
  onOpenSettings,
  coins,
  highScore,
  playerName,
  deviceInfo,
}) => {
  return (
    <div
      id="arcade-start-menu"
      className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-6 bg-neutral-950/95 backdrop-blur-md overflow-hidden select-none"
    >
      {/* Top Status Bar: Player & Bank */}
      <div className="w-full flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-arcade text-[9px] sm:text-[10px] text-cyan-300 tracking-wider">
            PILOTO: {playerName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/40 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-yellow-400 text-yellow-950 font-bold flex items-center justify-center text-[8px] sm:text-[9px]">
            $
          </span>
          <span className="font-arcade text-[10px] sm:text-xs text-yellow-300 font-bold">{coins}</span>
        </div>
      </div>

      {/* Center: Title & Arcade Cabinet Branding */}
      <div className="flex flex-col items-center text-center my-auto py-2 sm:py-4 shrink-0 max-w-sm w-full">
        {/* Retro Badge */}
        <div className="px-3 py-0.5 rounded-full border border-red-500/50 bg-red-500/10 text-red-400 text-[8px] sm:text-[9px] font-arcade tracking-widest mb-2 animate-pulse">
          TAITO 1986 CLONE • 60 FPS
        </div>

        {/* Title */}
        <h1 className="font-arcade text-3xl sm:text-4xl text-transparent bg-clip-text bg-linear-to-b from-white via-cyan-300 to-blue-600 tracking-wider drop-shadow-[0_4px_16px_rgba(6,182,212,0.6)]">
          ARKANOID
        </h1>
        <span className="font-arcade text-[10px] sm:text-xs text-yellow-400 tracking-[0.35em] mt-1">
          RETRO ARCADE
        </span>

        {/* High Score Banner */}
        <div className="mt-3 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-2">
          <span className="font-arcade text-[8px] sm:text-[9px] text-neutral-400">RECORD:</span>
          <span className="font-arcade text-[10px] sm:text-xs text-yellow-300 font-bold tracking-widest">
            {highScore.toLocaleString()} PTS
          </span>
        </div>

        {/* Main Action: INSERT COIN */}
        <div className="w-full space-y-2 sm:space-y-3 mt-4 sm:mt-6">
          <button
            id="start-game-btn"
            type="button"
            onClick={() => {
              retroAudio.unlock();
              retroAudio.playRoundStart();
              onStartGame();
            }}
            className="w-full py-3 sm:py-4 px-4 rounded-xl bg-linear-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-arcade text-xs sm:text-sm tracking-wider shadow-lg shadow-red-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-400/40"
          >
            <Play className="w-4 h-4 fill-current" />
            INSERT COIN / JUGAR
          </button>

          {/* Secondary Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              id="menu-shop-btn"
              type="button"
              onClick={() => {
                retroAudio.unlock();
                retroAudio.playPaddleBounce();
                onOpenShop();
              }}
              className="py-2.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-300 font-arcade text-[8px] sm:text-[9px] border border-neutral-800 hover:border-yellow-500/40 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              TIENDA
            </button>

            <button
              id="menu-leaderboard-btn"
              type="button"
              onClick={() => {
                retroAudio.unlock();
                retroAudio.playPaddleBounce();
                onOpenLeaderboard();
              }}
              className="py-2.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-cyan-300 font-arcade text-[8px] sm:text-[9px] border border-neutral-800 hover:border-cyan-500/40 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              RANKING
            </button>

            <button
              id="menu-settings-btn"
              type="button"
              onClick={() => {
                retroAudio.unlock();
                retroAudio.playPaddleBounce();
                onOpenSettings();
              }}
              className="py-2.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-arcade text-[8px] sm:text-[9px] border border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              AJUSTES
            </button>
          </div>
        </div>

        {/* Quick Powerup Capsule Preview Pills */}
        <div className="mt-3 flex items-center justify-center gap-1 flex-wrap text-[7px] sm:text-[8px] font-arcade">
          <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">S: Slow</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">C: Catch</span>
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">L: Laser</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">E: Expand</span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">D: Disrupt</span>
          <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">B: Break</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-400/20 text-slate-300 border border-slate-400/30">P: Vaus</span>
        </div>
      </div>

      {/* Footer Instructions (Zero scroll, compact single/double line) */}
      <div className="w-full text-center shrink-0 pt-1">
        {deviceInfo.type === 'desktop' ? (
          <p className="text-[9px] sm:text-[10px] text-cyan-300 font-arcade">
            🖱️ RATÓN DIRECTO | ◄ ► TECLAS | ESPACIO: ACCIÓN
          </p>
        ) : (
          <p className="text-[9px] sm:text-[10px] text-cyan-300 font-arcade">
            📱 TÁCTIL: DESLIZA O USA JOYSTICK | BOTÓN: LANZAR
          </p>
        )}
      </div>
    </div>
  );
};

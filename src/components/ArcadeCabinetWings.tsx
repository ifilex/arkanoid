import React from 'react';
import { Trophy, Zap, Shield, Sparkles, Monitor, Keyboard, MousePointer, Volume2, VolumeX, Maximize2, Minimize2, Settings, ShoppingBag } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeftWingProps {
  playerName: string;
  coins: number;
  highScores: LeaderboardEntry[];
  currentRound: number;
}

export const LeftArcadeWing: React.FC<LeftWingProps> = ({
  playerName,
  coins,
  highScores,
  currentRound,
}) => {
  return (
    <aside
      id="arcade-left-wing"
      className="hidden xl:flex flex-col justify-between w-64 h-full p-4 bg-neutral-950/80 border-r border-neutral-800/80 select-none overflow-hidden"
    >
      {/* Marquee Header */}
      <div className="space-y-2">
        <div className="p-3 rounded-xl bg-linear-to-b from-neutral-900 to-neutral-950 border border-neutral-800 shadow-inner">
          <div className="flex items-center justify-between text-[9px] font-arcade text-red-400 mb-1">
            <span>TAITO 1986</span>
            <span className="animate-pulse">● LIVE</span>
          </div>
          <h2 className="font-arcade text-lg text-transparent bg-clip-text bg-linear-to-r from-red-500 via-amber-400 to-yellow-300 tracking-wider">
            ARKANOID
          </h2>
          <p className="text-[9px] font-tech text-neutral-400 tracking-widest mt-0.5 uppercase">
            CABINA ARCADE OFICIAL
          </p>
        </div>

        {/* Pilot Dossier Card */}
        <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-arcade text-cyan-400">PILOTO VAUS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-300 font-bold">{playerName}</span>
            <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded-full">
              <span className="text-yellow-400 font-bold text-[10px]">$</span>
              <span className="font-arcade text-[10px] text-yellow-300">{coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hall of Fame / High Scores List */}
      <div className="my-auto py-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-arcade text-[10px] text-yellow-400 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            RECORD ARCADE
          </span>
          <span className="text-[9px] font-tech text-neutral-500 uppercase">TOP 5</span>
        </div>

        <div className="bg-neutral-900/40 rounded-xl border border-neutral-800/80 p-2 space-y-1.5 font-arcade text-[9px]">
          {highScores.slice(0, 5).map((entry, idx) => (
            <div
              key={entry.playerId || `hs-${idx}`}
              className={`flex items-center justify-between p-1.5 rounded ${
                idx === 0
                  ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 font-bold'
                  : idx === 1
                  ? 'bg-slate-300/10 text-slate-200'
                  : idx === 2
                  ? 'bg-amber-700/10 text-amber-300'
                  : 'text-neutral-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[8px] opacity-70">#{idx + 1}</span>
                <span className="truncate max-w-[80px]">{entry.playerName || 'PILOT'}</span>
              </div>
              <span className="font-mono tracking-wider">{entry.score.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Controls Scheme */}
      <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/70 space-y-2">
        <div className="text-[9px] font-arcade text-neutral-400 flex items-center gap-1">
          <Keyboard className="w-3 h-3 text-cyan-400" />
          CONTROLES DE JUEGO
        </div>
        <div className="space-y-1.5 text-[9px] font-tech text-neutral-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-cyan-300">
              <MousePointer className="w-3 h-3" /> Ratón
            </span>
            <span className="text-neutral-400">Movimiento directo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="px-1 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[9px] text-neutral-200">
              ◄ ► / A D
            </span>
            <span className="text-neutral-400">Mover nave</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[9px] text-neutral-200">
              ESPACIO / CLICK
            </span>
            <span className="text-neutral-400">Lanzar / Fuego</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface RightWingProps {
  onToggleScanlines: () => void;
  showScanlines: boolean;
  onToggleMute: () => void;
  isMuted: boolean;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenShop: () => void;
  onOpenSettings: () => void;
}

export const RightArcadeWing: React.FC<RightWingProps> = ({
  onToggleScanlines,
  showScanlines,
  onToggleMute,
  isMuted,
  onToggleFullscreen,
  isFullscreen,
  onOpenShop,
  onOpenSettings,
}) => {
  return (
    <aside
      id="arcade-right-wing"
      className="hidden xl:flex flex-col justify-between w-64 h-full p-4 bg-neutral-950/80 border-l border-neutral-800/80 select-none overflow-hidden"
    >
      {/* Power-Up Capsules Reference */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-arcade text-[10px] text-cyan-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            CÁPSULAS DE PODER
          </span>
          <span className="text-[9px] font-tech text-neutral-500 uppercase">INTEL</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[8px] font-arcade">
          <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300">
            <span className="font-bold text-orange-400">S:</span> SLOW (Lento)
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <span className="font-bold text-emerald-400">C:</span> CATCH (Atrapar)
          </div>
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
            <span className="font-bold text-red-400">L:</span> LASER (Fuego)
          </div>
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
            <span className="font-bold text-blue-400">E:</span> EXPAND (Nave)
          </div>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <span className="font-bold text-cyan-400">D:</span> DISRUPT (x3)
          </div>
          <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-300">
            <span className="font-bold text-pink-400">B:</span> BREAK (Portal)
          </div>
          <div className="p-1.5 rounded-lg bg-slate-400/10 border border-slate-400/30 text-slate-200 col-span-2 flex items-center justify-between">
            <span><span className="font-bold text-slate-100">P:</span> EXTRA VAUS</span>
            <span className="text-[7px] text-slate-400">+1 VIDA</span>
          </div>
        </div>
      </div>

      {/* Brick Scoring Matrix */}
      <div className="my-auto py-3 space-y-2">
        <div className="text-[9px] font-arcade text-neutral-400 flex items-center justify-between px-1">
          <span>VALOR DE LADRILLOS</span>
          <span className="text-yellow-400">PUNTOS</span>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-2.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-tech">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-neutral-200">
              <span className="w-2.5 h-1.5 rounded-xs bg-white inline-block" /> Blanco
            </span>
            <span className="font-mono text-neutral-400">50</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="w-2.5 h-1.5 rounded-xs bg-orange-500 inline-block" /> Naranja
            </span>
            <span className="font-mono text-neutral-400">60</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-1.5 rounded-xs bg-cyan-400 inline-block" /> Celeste
            </span>
            <span className="font-mono text-neutral-400">70</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-1.5 rounded-xs bg-emerald-500 inline-block" /> Verde
            </span>
            <span className="font-mono text-neutral-400">80</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-1.5 rounded-xs bg-red-500 inline-block" /> Rojo
            </span>
            <span className="font-mono text-neutral-400">90</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-1.5 rounded-xs bg-blue-500 inline-block" /> Azul
            </span>
            <span className="font-mono text-neutral-400">100</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-yellow-300">
              <span className="w-2.5 h-1.5 rounded-xs bg-yellow-400 inline-block" /> Oro
            </span>
            <span className="font-mono text-amber-400">INMORTAL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-1.5 rounded-xs bg-slate-300 inline-block" /> Plata
            </span>
            <span className="font-mono text-slate-300">xROUNDS</span>
          </div>
        </div>
      </div>

      {/* Quick Cabinet Controls */}
      <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/70 space-y-2">
        <div className="text-[9px] font-arcade text-neutral-400">ACCESOS RÁPIDOS</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onToggleScanlines}
            className={`py-1.5 px-2 rounded font-arcade text-[8px] border transition-colors flex items-center justify-center gap-1 ${
              showScanlines
                ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
          >
            CRT: {showScanlines ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="py-1.5 px-2 rounded font-arcade text-[8px] bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            {isFullscreen ? 'VENTANA' : 'PANTALLA'}
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            className="py-1.5 px-2 rounded font-arcade text-[8px] bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            {isMuted ? 'MUDO' : 'SONIDO'}
          </button>

          <button
            type="button"
            onClick={onOpenShop}
            className="py-1.5 px-2 rounded font-arcade text-[8px] bg-neutral-800 border border-neutral-700 text-yellow-300 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" />
            TIENDA
          </button>
        </div>
      </div>
    </aside>
  );
};

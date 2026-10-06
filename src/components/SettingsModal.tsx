import React from 'react';
import { X, Settings, Moon, Sun, Volume2, VolumeX, Smartphone, Monitor, Tablet, Cloud, Download, Upload, CheckCircle } from 'lucide-react';
import { retroAudio } from '../audio';
import { DeviceInfo } from '../utils/deviceDetection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  controlsMode: 'auto' | 'always' | 'never';
  onChangeControlsMode: (mode: 'auto' | 'always' | 'never') => void;
  deviceInfo: DeviceInfo;
  isMuted: boolean;
  onToggleMute: () => void;
  volume: number;
  onChangeVolume: (val: number) => void;
  playerId: string;
  isCloudSyncing: boolean;
  lastSyncedAt: string | null;
  onManualCloudSave: () => Promise<void>;
  onManualCloudLoad: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  showScanlines,
  onToggleScanlines,
  controlsMode,
  onChangeControlsMode,
  deviceInfo,
  isMuted,
  onToggleMute,
  volume,
  onChangeVolume,
  playerId,
  isCloudSyncing,
  lastSyncedAt,
  onManualCloudSave,
  onManualCloudLoad,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="settings-modal"
        className="w-full max-w-md bg-neutral-900 border-2 border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="font-arcade text-sm text-cyan-400 tracking-wider">
              AJUSTES DEL SISTEMA
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Audio Section */}
          <div className="space-y-2">
            <h3 className="font-arcade text-[10px] text-neutral-400 tracking-wider uppercase">
              AUDIO RETRO CHIP
            </h3>
            <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-200">Efectos de Sonido 8-Bit</span>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded font-arcade text-[9px] transition-colors ${
                    !isMuted
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                      : 'bg-red-500/20 border border-red-500/50 text-red-300'
                  }`}
                >
                  {!isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  {!isMuted ? 'ACTIVO' : 'MUTED'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-neutral-400 text-[10px] w-12">Volumen</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400"
                />
                <span className="text-neutral-400 text-[10px] w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Display & Visuals Section */}
          <div className="space-y-2">
            <h3 className="font-arcade text-[10px] text-neutral-400 tracking-wider uppercase">
              VISUALIZACIÓN Y TEMA
            </h3>
            <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-800 space-y-3">
              {/* Dark / Light Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                  <span className="text-neutral-200">Modo Oscuro / Claro</span>
                </div>
                <button
                  type="button"
                  onClick={onToggleDarkMode}
                  className="px-3 py-1 rounded font-arcade text-[9px] bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
                >
                  {isDarkMode ? 'OSCURO (ARCADE)' : 'CLARO'}
                </button>
              </div>

              {/* CRT Scanlines */}
              <div className="flex items-center justify-between border-t border-neutral-700/50 pt-2">
                <span className="text-neutral-200">Filtro CRT Scanlines</span>
                <button
                  type="button"
                  onClick={onToggleScanlines}
                  className={`px-3 py-1 rounded font-arcade text-[9px] transition-colors ${
                    showScanlines
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                      : 'bg-neutral-800 border border-neutral-700 text-neutral-400'
                  }`}
                >
                  {showScanlines ? 'ACTIVADO' : 'DESACTIVADO'}
                </button>
              </div>
            </div>
          </div>

          {/* Controls & Device Adaptation Section */}
          <div className="space-y-2">
            <h3 className="font-arcade text-[10px] text-neutral-400 tracking-wider uppercase flex items-center justify-between">
              <span>ADAPTACIÓN DE PANTALLA Y CONTROLES</span>
              {deviceInfo.type === 'desktop' ? (
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              ) : deviceInfo.type === 'tablet' ? (
                <Tablet className="w-3.5 h-3.5 text-yellow-400" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </h3>
            <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-800 space-y-3">
              {/* Detected System Status */}
              <div className="flex items-center justify-between p-2 rounded bg-neutral-950/60 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-neutral-300">Sistema Detectado:</span>
                  <span className="font-arcade text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                    {deviceInfo.type === 'desktop'
                      ? '💻 PC / ESCRITORIO'
                      : deviceInfo.type === 'tablet'
                      ? '📱 TABLET'
                      : '📱 SMARTPHONE MÓVIL'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {deviceInfo.screenWidth}×{deviceInfo.screenHeight}
                </span>
              </div>

              <div>
                <p className="text-neutral-400 text-[11px] mb-2">
                  En PC/Escritorio juegas con ratón directo y teclado (◄ ► / Espacio). En móviles/tablets se activa el joystick táctil.
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(['auto', 'always', 'never'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => onChangeControlsMode(mode)}
                      className={`py-2 px-2 rounded font-arcade text-[8px] text-center border transition-all ${
                        controlsMode === mode
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-xs'
                          : 'bg-neutral-900/60 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                      }`}
                    >
                      {mode === 'auto'
                        ? 'AUTO (RECOMENDADO)'
                        : mode === 'always'
                        ? 'FORZAR TÁCTIL'
                        : 'SOLO RATÓN / TECLADO'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Sync Section */}
          <div className="space-y-2">
            <h3 className="font-arcade text-[10px] text-neutral-400 tracking-wider uppercase flex items-center justify-between">
              <span>SINCRONIZACIÓN EN LA NUBE</span>
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <div className="p-3 bg-neutral-800/40 rounded-lg border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-neutral-300 text-[11px]">
                <span>ID de Jugador:</span>
                <span className="font-mono text-cyan-300 font-bold">{playerId}</span>
              </div>

              {lastSyncedAt && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Último guardado: {new Date(lastSyncedAt).toLocaleTimeString()}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onManualCloudSave}
                  disabled={isCloudSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-arcade text-[9px] transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isCloudSyncing ? 'GUARDANDO...' : 'GUARDAR NUBE'}
                </button>

                <button
                  type="button"
                  onClick={onManualCloudLoad}
                  disabled={isCloudSyncing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-neutral-700 hover:bg-neutral-600 text-white font-arcade text-[9px] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CARGAR NUBE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

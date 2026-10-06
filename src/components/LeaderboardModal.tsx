import React, { useState, useEffect } from 'react';
import { X, Trophy, Globe, User, RefreshCw, Send } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  localScores: LeaderboardEntry[];
  playerName: string;
  playerId: string;
  currentScore: number;
  currentRound: number;
  onUpdatePlayerName: (name: string) => void;
  onSubmitCloudScore: () => Promise<void>;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  localScores,
  playerName,
  playerId,
  currentScore,
  currentRound,
  onUpdatePlayerName,
  onSubmitCloudScore,
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');
  const [cloudScores, setCloudScores] = useState<LeaderboardEntry[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    setNameInput(playerName);
  }, [playerName]);

  const fetchCloudLeaderboard = async () => {
    setIsLoadingCloud(true);
    try {
      const res = await fetch('/api/sync/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setCloudScores(data.leaderboard || []);
      }
    } catch (e) {
      console.warn('Could not fetch cloud leaderboard', e);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'cloud') {
      fetchCloudLeaderboard();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    const clean = nameInput.trim().toUpperCase().slice(0, 12) || 'PILOT';
    onUpdatePlayerName(clean);
    setIsEditingName(false);
  };

  const handleSendCloud = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await onSubmitCloudScore();
    await fetchCloudLeaderboard();
    setIsSubmitting(false);
  };

  const scoresToDisplay = activeTab === 'local' ? localScores : cloudScores;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="leaderboard-modal"
        className="w-full max-w-md bg-neutral-900 border-2 border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="font-arcade text-sm text-yellow-400 tracking-wider">
              CLASIFICACIÓN
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

        {/* Player Profile Banner */}
        <div className="px-5 py-3 bg-neutral-800/40 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value.toUpperCase())}
                  maxLength={12}
                  className="bg-neutral-950 border border-cyan-500 text-cyan-300 font-arcade text-[10px] px-2 py-1 rounded w-28 uppercase"
                  placeholder="NOMBRE"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-arcade text-[9px] rounded font-bold"
                >
                  OK
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-arcade text-xs text-white">{playerName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-[9px] text-cyan-400 hover:underline cursor-pointer"
                >
                  (Cambiar)
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSendCloud}
            disabled={isSubmitting || currentScore <= 0}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-arcade transition-all ${
              currentScore > 0
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-xs'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
            }`}
            title="Enviar puntuación actual a la nube"
          >
            <Send className="w-3 h-3" />
            {isSubmitting ? 'ENVIANDO...' : 'SUBIR SCORE'}
          </button>
        </div>

        {/* Tabs: Local vs Cloud */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-3 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg font-arcade text-[10px] tracking-wider transition-all ${
              activeTab === 'local'
                ? 'bg-neutral-800 text-yellow-400 border-t-2 border-yellow-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-3 h-3" />
            LOCAL
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('cloud');
              fetchCloudLeaderboard();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg font-arcade text-[10px] tracking-wider transition-all ${
              activeTab === 'cloud'
                ? 'bg-neutral-800 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            GLOBAL NUBE
          </button>

          {activeTab === 'cloud' && (
            <button
              type="button"
              onClick={fetchCloudLeaderboard}
              className="ml-auto p-1 text-neutral-400 hover:text-white"
              title="Actualizar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCloud ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Scores Table */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {scoresToDisplay.length === 0 ? (
            <div className="text-center py-10 text-neutral-500 font-arcade text-xs">
              {isLoadingCloud ? 'CARGANDO DATOS...' : 'SIN PUNTUACIONES REGISTRADAS'}
            </div>
          ) : (
            scoresToDisplay.map((entry, idx) => {
              const rankColor =
                idx === 0
                  ? 'text-yellow-400'
                  : idx === 1
                  ? 'text-slate-300'
                  : idx === 2
                  ? 'text-amber-600'
                  : 'text-neutral-400';

              const isUser = entry.playerId === playerId || entry.playerName === playerName;

              return (
                <div
                  key={`${entry.playerId}-${idx}`}
                  className={`flex items-center justify-between p-2.5 rounded-lg border font-arcade text-xs ${
                    isUser
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                      : 'bg-neutral-800/30 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold ${rankColor}`}>
                      #{idx + 1}
                    </span>
                    <span className="tracking-wider">{entry.playerName}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-neutral-400">R{entry.round}</span>
                    <span className="font-bold text-yellow-300 tracking-wider">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

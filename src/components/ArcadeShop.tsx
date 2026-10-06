import React, { useState } from 'react';
import { X, Check, ShoppingBag, Sparkles, Shield, Disc, Globe } from 'lucide-react';
import { VAUS_SKINS, BALL_SKINS, THEME_SCENARIOS } from '../shopData';
import { retroAudio } from '../audio';

interface ArcadeShopProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  unlockedSkins: string[];
  selectedVausSkin: string;
  selectedBallSkin: string;
  selectedTheme: string;
  onBuySkin: (skinId: string, price: number) => boolean;
  onEquipVausSkin: (skinId: string) => void;
  onEquipBallSkin: (skinId: string) => void;
  onEquipTheme: (themeId: string) => void;
}

export const ArcadeShop: React.FC<ArcadeShopProps> = ({
  isOpen,
  onClose,
  coins,
  unlockedSkins,
  selectedVausSkin,
  selectedBallSkin,
  selectedTheme,
  onBuySkin,
  onEquipVausSkin,
  onEquipBallSkin,
  onEquipTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'vaus' | 'balls' | 'themes'>('vaus');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="arcade-shop-modal"
        className="w-full max-w-lg bg-neutral-900 border-2 border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-yellow-400" />
            <h2 className="font-arcade text-sm sm:text-base text-yellow-400 tracking-wider">
              TIENDA DE SKINS
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Coins badge */}
            <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full">
              <span className="w-4 h-4 rounded-full bg-yellow-400 text-yellow-950 font-bold flex items-center justify-center text-[9px]">
                $
              </span>
              <span className="font-arcade text-xs text-yellow-300">{coins}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-3 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('vaus')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-arcade text-[10px] tracking-wider transition-all ${
              activeTab === 'vaus'
                ? 'bg-neutral-800 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            NAVES VAUS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balls')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-arcade text-[10px] tracking-wider transition-all ${
              activeTab === 'balls'
                ? 'bg-neutral-800 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            BOLAS DE PLASMA
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-arcade text-[10px] tracking-wider transition-all ${
              activeTab === 'themes'
                ? 'bg-neutral-800 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            ESCENARIOS
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* Vaus Tab */}
          {activeTab === 'vaus' &&
            VAUS_SKINS.map((item) => {
              const isUnlocked = unlockedSkins.includes(item.id) || item.price === 0;
              const isEquipped = selectedVausSkin === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isEquipped
                      ? 'bg-cyan-950/20 border-cyan-500/60'
                      : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Preview of Vaus */}
                    <div className="w-16 h-10 rounded-lg bg-neutral-950 flex items-center justify-center border border-neutral-800 relative overflow-hidden">
                      <div
                        className="w-12 h-3 rounded-full relative"
                        style={{ backgroundColor: item.bodyColor, boxShadow: `0 0 8px ${item.glowColor}` }}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-full"
                          style={{ backgroundColor: item.trimColor }}
                        />
                        <div
                          className="absolute right-0 top-0 bottom-0 w-2.5 rounded-r-full"
                          style={{ backgroundColor: item.trimColor }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                          style={{ backgroundColor: item.cockpitColor }}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-arcade text-xs text-white">{item.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xs">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full sm:w-auto flex justify-end">
                    {isEquipped ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[10px] font-arcade">
                        <Check className="w-3.5 h-3.5" /> EQUIPADO
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          onEquipVausSkin(item.id);
                          retroAudio.playPaddleBounce();
                        }}
                        className="px-4 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[10px] font-arcade transition-all cursor-pointer"
                      >
                        EQUIPAR
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const success = onBuySkin(item.id, item.price);
                          if (success) {
                            retroAudio.playPowerupCollect();
                          } else {
                            retroAudio.playLifeLost();
                          }
                        }}
                        disabled={coins < item.price}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-arcade transition-all ${
                          coins >= item.price
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold cursor-pointer shadow-md shadow-yellow-500/20'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        COMPRAR ${item.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Balls Tab */}
          {activeTab === 'balls' &&
            BALL_SKINS.map((item) => {
              const isUnlocked = unlockedSkins.includes(item.id) || item.price === 0;
              const isEquipped = selectedBallSkin === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isEquipped
                      ? 'bg-cyan-950/20 border-cyan-500/60'
                      : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Preview */}
                    <div className="w-16 h-10 rounded-lg bg-neutral-950 flex items-center justify-center border border-neutral-800">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: item.coreColor,
                          boxShadow: `0 0 10px ${item.glowColor}`,
                          border: `1px solid ${item.glowColor}`,
                        }}
                      />
                    </div>

                    <div>
                      <h3 className="font-arcade text-xs text-white">{item.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xs">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full sm:w-auto flex justify-end">
                    {isEquipped ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[10px] font-arcade">
                        <Check className="w-3.5 h-3.5" /> EQUIPADO
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          onEquipBallSkin(item.id);
                          retroAudio.playPaddleBounce();
                        }}
                        className="px-4 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[10px] font-arcade transition-all cursor-pointer"
                      >
                        EQUIPAR
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const success = onBuySkin(item.id, item.price);
                          if (success) {
                            retroAudio.playPowerupCollect();
                          } else {
                            retroAudio.playLifeLost();
                          }
                        }}
                        disabled={coins < item.price}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-arcade transition-all ${
                          coins >= item.price
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold cursor-pointer shadow-md shadow-yellow-500/20'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        COMPRAR ${item.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Themes Tab */}
          {activeTab === 'themes' &&
            THEME_SCENARIOS.map((item) => {
              const isUnlocked = unlockedSkins.includes(item.id) || item.price === 0;
              const isEquipped = selectedTheme === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isEquipped
                      ? 'bg-cyan-950/20 border-cyan-500/60'
                      : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Preview */}
                    <div
                      className="w-16 h-10 rounded-lg border-2 flex items-center justify-center p-1 relative overflow-hidden"
                      style={{
                        backgroundColor: item.bgDark,
                        borderColor: item.wallColor,
                      }}
                    >
                      <div className="w-full h-full border border-dashed opacity-30 border-white" />
                    </div>

                    <div>
                      <h3 className="font-arcade text-xs text-white">{item.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xs">{item.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full sm:w-auto flex justify-end">
                    {isEquipped ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-[10px] font-arcade">
                        <Check className="w-3.5 h-3.5" /> EQUIPADO
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          onEquipTheme(item.id);
                          retroAudio.playWallBounce();
                        }}
                        className="px-4 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[10px] font-arcade transition-all cursor-pointer"
                      >
                        EQUIPAR
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const success = onBuySkin(item.id, item.price);
                          if (success) {
                            retroAudio.playPowerupCollect();
                          } else {
                            retroAudio.playLifeLost();
                          }
                        }}
                        disabled={coins < item.price}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-arcade transition-all ${
                          coins >= item.price
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold cursor-pointer shadow-md shadow-yellow-500/20'
                            : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        COMPRAR ${item.price}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

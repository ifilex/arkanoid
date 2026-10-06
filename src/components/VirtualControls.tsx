import React, { useRef, useState, useEffect } from 'react';
import { Crosshair, Zap } from 'lucide-react';

interface VirtualControlsProps {
  onMoveDelta: (delta: number) => void;
  onMoveRatio: (ratio: number) => void;
  onAction: () => void;
  hasLaser: boolean;
  isVisible: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveDelta,
  onMoveRatio,
  onAction,
  hasLaser,
  isVisible,
}) => {
  const [knobX, setKnobX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFirePressed, setIsFirePressed] = useState<boolean>(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  if (!isVisible) return null;

  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateKnob(touch.clientX);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        updateKnob(e.changedTouches[i].clientX);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobX(0);
        break;
      }
    }
  };

  const updateKnob = (clientX: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const maxRadius = rect.width / 2 - 16;

    const rawOffset = clientX - centerX;
    const clampedOffset = Math.max(-maxRadius, Math.min(maxRadius, rawOffset));
    setKnobX(clampedOffset);

    // Continuous delta speed when holding knob
    const intensity = clampedOffset / maxRadius;
    onMoveDelta(intensity * 18);
  };

  return (
    <div
      id="virtual-controls-container"
      className="absolute bottom-4 left-0 right-0 px-6 py-2 flex items-center justify-between pointer-events-none z-30 select-none"
    >
      {/* Left Transparent Analog Joystick / Slider */}
      <div
        id="virtual-joystick-base"
        ref={joystickBaseRef}
        onTouchStart={handleJoystickTouchStart}
        onTouchMove={handleJoystickTouchMove}
        onTouchEnd={handleJoystickTouchEnd}
        onTouchCancel={handleJoystickTouchEnd}
        className={`w-28 h-28 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-xs flex items-center justify-center pointer-events-auto relative touch-none transition-transform ${
          isDragging ? 'scale-105 border-cyan-400/50 bg-cyan-500/10' : ''
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Joystick Crosshair Guides */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <div className="w-full h-0.5 bg-white"></div>
          <div className="h-full w-0.5 bg-white absolute"></div>
        </div>

        {/* Floating Knob */}
        <div
          id="virtual-joystick-knob"
          className={`w-14 h-14 rounded-full border border-white/40 shadow-lg pointer-events-none flex items-center justify-center transition-colors ${
            isDragging
              ? 'bg-cyan-400/40 border-cyan-300 shadow-cyan-500/50'
              : 'bg-white/20 border-white/30'
          }`}
          style={{
            transform: `translateX(${knobX}px)`,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-white/80"></div>
        </div>

        {/* Direction arrows */}
        <div className="absolute -bottom-5 text-[9px] font-arcade tracking-wider text-white/50 pointer-events-none">
          ◄ VAUS ►
        </div>
      </div>

      {/* Right Transparent Action / Fire Button */}
      <div className="flex flex-col items-center">
        <button
          id="virtual-action-button"
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            setIsFirePressed(true);
            onAction();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsFirePressed(false);
          }}
          onTouchCancel={() => setIsFirePressed(false)}
          onMouseDown={() => {
            setIsFirePressed(true);
            onAction();
          }}
          onMouseUp={() => setIsFirePressed(false)}
          className={`w-20 h-20 rounded-full pointer-events-auto border-2 flex flex-col items-center justify-center transition-all active:scale-95 touch-none ${
            hasLaser
              ? isFirePressed
                ? 'bg-red-500/50 border-red-300 shadow-lg shadow-red-500/50 scale-95'
                : 'bg-red-500/20 border-red-400/60 shadow-md shadow-red-500/30 animate-pulse'
              : isFirePressed
              ? 'bg-cyan-500/50 border-cyan-300 shadow-lg shadow-cyan-500/50 scale-95'
              : 'bg-white/10 border-white/25 shadow-sm'
          }`}
          style={{ touchAction: 'none' }}
        >
          {hasLaser ? (
            <>
              <Crosshair className="w-7 h-7 text-red-400" />
              <span className="text-[8px] font-arcade text-red-300 mt-1">FUEGO</span>
            </>
          ) : (
            <>
              <Zap className="w-7 h-7 text-cyan-300" />
              <span className="text-[8px] font-arcade text-cyan-200 mt-1">LANZAR</span>
            </>
          )}
        </button>
        <span className="text-[8px] font-arcade text-white/40 mt-1">ACTION</span>
      </div>
    </div>
  );
};

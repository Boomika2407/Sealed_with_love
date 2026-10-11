import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function WaxSeal({
  isUnlocked,
  onAttemptUnlock,
  isLoading,
  shake,
  theme = 'blush'
}) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const holdTimerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const HOLD_DURATION_MS = 1400; // Hold for 1.4 seconds

  const startHold = () => {
    if (isUnlocked || isLoading) return;

    setHolding(true);
    const startTime = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);
    }, 20);

    holdTimerRef.current = setTimeout(() => {
      clearInterval(progressIntervalRef.current);
      setProgress(100);
      setHolding(false);
      onAttemptUnlock();
    }, HOLD_DURATION_MS);
  };

  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Theme colors for wax
  const getWaxColor = () => {
    if (isUnlocked) return 'from-emerald-500 to-teal-600 border-emerald-800 text-white';
    if (theme === 'lilac') return 'from-purple-500 to-indigo-600 border-purple-900 text-white';
    if (theme === 'mint') return 'from-emerald-500 to-green-600 border-emerald-900 text-white';
    if (theme === 'yellow') return 'from-amber-400 to-yellow-600 border-amber-900 text-plum-950';
    return 'from-rose-500 to-red-600 border-rose-900 text-white'; // default blush
  };

  return (
    <div className="flex flex-col items-center select-none py-2">
      <div className="relative flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="w-28 h-28 transform -rotate-90 pointer-events-none">
          <circle
            cx="56"
            cy="56"
            r="50"
            className="stroke-plum-900/15 dark:stroke-purple-900/40 fill-none"
            strokeWidth="5"
          />
          {holding && (
            <circle
              cx="56"
              cy="56"
              r="50"
              className="stroke-rose-500 fill-none transition-all duration-75"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 50}
              strokeDashoffset={2 * Math.PI * 50 * (1 - progress / 100)}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* The Wax Stamp Core */}
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={startHold}
          onTouchEnd={cancelHold}
          disabled={isUnlocked || isLoading}
          className={`absolute w-20 h-20 rounded-full bg-gradient-to-br ${getWaxColor()} border-3 shadow-sticker flex flex-col items-center justify-center transition-all duration-200 hover:rotate-6 hover:scale-105 active:scale-90 active:rotate-0 ${
            shake ? 'animate-wax-shake' : ''
          } ${holding ? 'scale-110 shadow-sticker-lg' : ''} cursor-pointer group`}
        >
          {/* Wax outer wavy rim ring */}
          <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />

          {/* Wax Emblem */}
          {isUnlocked ? (
            <div className="flex flex-col items-center">
              <span className="text-2xl">✨</span>
              <span className="text-[10px] font-display font-bold uppercase tracking-wider">OPEN</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-2xl transform group-hover:scale-110 transition-transform">
                {holding ? '⚡' : '💌'}
              </span>
              <span className="text-[9px] font-display font-extrabold tracking-widest uppercase opacity-90">
                {isLoading ? 'CHECK' : holding ? 'HOLD...' : 'PRESS'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Helper text */}
      <p className="mt-3 font-handwriting text-base font-semibold text-plum-800 dark:text-purple-300">
        {isUnlocked
          ? 'Wax stamp broken! Letter unlocked 🎓'
          : holding
          ? 'Keep holding to verify campus spot & time...'
          : 'Press and hold to break the wax seal'}
      </p>
    </div>
  );
}

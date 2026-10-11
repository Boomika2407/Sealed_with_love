import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * Retro Rolling Odometer Digit Box
 */
function OdometerDigit({ value, unit }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative bg-[#1E0D33] text-amber-200 dark:text-yellow-300 px-1.5 py-0.5 rounded-md border border-[#3E1A66] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] font-mono font-black text-xs min-w-[26px] text-center overflow-hidden">
        {/* Horizontal Split Line of Mechanical Drum */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/40 pointer-events-none" />
        <span className="relative z-10 transition-transform duration-300 inline-block">
          {value}
        </span>
      </div>
      <span className="text-[9px] font-display font-bold text-plum-600 dark:text-purple-400 -mt-0.5 uppercase">
        {unit}
      </span>
    </div>
  );
}

export default function OdometerCountdown({ targetDate, isUnlocked }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0 || isUnlocked) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate, isUnlocked]);

  if (isUnlocked || timeLeft.isOver) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-emerald-800 dark:text-emerald-200 rounded-full font-display text-xs font-bold">
        <span>🎉 Mature & Unlockable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 select-none">
      <Clock className="w-3.5 h-3.5 text-rose-500 animate-pulse flex-shrink-0" />
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <OdometerDigit value={timeLeft.days} unit="days" />
        )}
        <OdometerDigit value={String(timeLeft.hours).padStart(2, '0')} unit="hrs" />
        <span className="text-xs font-bold text-plum-900 dark:text-purple-300 -mt-2.5">:</span>
        <OdometerDigit value={String(timeLeft.minutes).padStart(2, '0')} unit="min" />
        <span className="text-xs font-bold text-plum-900 dark:text-purple-300 -mt-2.5">:</span>
        <OdometerDigit value={String(timeLeft.seconds).padStart(2, '0')} unit="sec" />
      </div>
    </div>
  );
}

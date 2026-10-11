import React from 'react';

/**
 * Scrapbook Accents:
 * - TornPaperDivider (organic torn paper edge between sections)
 * - PushPin & PaperClip SVGs
 * - HandwrittenArrow (with "start here!" or custom caption)
 */

export function TornPaperDivider({ className = '', inverted = false }) {
  return (
    <div className={`w-full overflow-hidden leading-none select-none my-2 ${className}`}>
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className="w-full h-4 sm:h-6 fill-current text-[#FFF5F7] dark:text-[#0F0B18]"
      >
        <path
          d={
            inverted
              ? 'M0,0 L0,18 Q40,8 80,18 T160,16 T240,19 T320,15 T400,18 T480,14 T560,19 T640,16 T720,18 T800,15 T880,19 T960,16 T1040,18 T1120,14 T1200,18 L1200,0 Z'
              : 'M0,24 L0,6 Q40,16 80,6 T160,8 T240,5 T320,9 T400,6 T480,10 T560,5 T640,8 T720,6 T800,9 T880,5 T960,8 T1040,6 T1120,10 T1200,6 L1200,24 Z'
          }
        />
      </svg>
    </div>
  );
}

export function PushPin({ color = '#F43F5E', size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`select-none ${className}`}>
      {/* Pin Shadow */}
      <ellipse cx="14" cy="18" rx="4" ry="2" fill="#2E1065" opacity="0.25" />
      {/* Needle point */}
      <path d="M12 13L13 21" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
      {/* Pin head */}
      <circle cx="11" cy="9" r="6" fill={color} stroke="#2E1065" strokeWidth="2" />
      <circle cx="9.5" cy="7.5" r="2" fill="#FFFFFF" opacity="0.8" />
    </svg>
  );
}

export function PaperClip({ size = 24, className = '', color = '#9333EA' }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 20 30" fill="none" className={`select-none ${className}`}>
      <path
        d="M6 9V20C6 22.8 8.2 25 11 25C13.8 25 16 22.8 16 20V6C16 4 14.4 2.5 12.5 2.5C10.6 2.5 9 4 9 6V19C9 20.1 9.9 21 11 21C12.1 21 13 20.1 13 19V9"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function HandwrittenArrow({
  text = 'start here! ✨',
  direction = 'down', // 'right' | 'left' | 'down' | 'up'
  className = ''
}) {
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <span className="font-handwriting font-bold text-lg text-rose-600 dark:text-rose-400 whitespace-nowrap">
        {text}
      </span>
      <svg
        width="34"
        height="26"
        viewBox="0 0 40 30"
        fill="none"
        className="stroke-rose-600 dark:stroke-rose-400 -rotate-12 animate-pulse"
      >
        <path
          d="M4 14 C15 4, 25 6, 32 16"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M24 16 L33 17 L30 8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

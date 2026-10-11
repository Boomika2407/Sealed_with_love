import React from 'react';

/**
 * Sticker Pack of SVG Doodles
 * Hand-drawn scrapbook aesthetics: stars, hearts, sparkles, clouds, tiny envelopes,
 * padlocks, cassette tapes, film strips, flowers, smiley faces, and graduation caps.
 */

export function StarDoodle({ size = 24, className = '', color = '#FACC15' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`select-none ${className}`}>
      <path
        d="M12 2L14.2 8.5L21 9.2L16 13.8L17.5 20.5L12 17L6.5 20.5L8 13.8L3 9.2L9.8 8.5L12 2Z"
        fill={color}
        stroke="#2E1065"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeartDoodle({ size = 24, className = '', color = '#FDA4AF' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`select-none ${className}`}>
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill={color}
        stroke="#2E1065"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleDoodle({ size = 22, className = '', color = '#C084FC' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`select-none ${className}`}>
      <path
        d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
        fill={color}
        stroke="#2E1065"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloudDoodle({ size = 32, className = '', color = '#E0F2FE' }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 36 24" fill="none" className={`select-none ${className}`}>
      <path
        d="M8 18C5.2 18 3 15.8 3 13C3 10.5 4.8 8.4 7.2 8.1C8.1 5.2 10.8 3 14 3C17.5 3 20.4 5.5 21 8.8C21.8 8.3 22.8 8 24 8C26.8 8 29 10.2 29 13C29 13.3 28.9 13.6 28.9 13.9C30.7 14.5 32 16.1 32 18C32 20.2 30.2 22 28 22L8 22C5.8 22 4 20.2 4 18"
        fill={color}
        stroke="#2E1065"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TinyEnvelopeDoodle({ size = 26, className = '', color = '#FFF0F5' }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 28 21" fill="none" className={`select-none ${className}`}>
      <rect x="2" y="2" width="24" height="17" rx="3" fill={color} stroke="#2E1065" strokeWidth="2" />
      <path d="M2 3L14 12L26 3" stroke="#2E1065" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="11.5" r="2.5" fill="#F43F5E" />
    </svg>
  );
}

export function PadlockDoodle({ size = 24, className = '', color = '#FEF08A' }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 24 28" fill="none" className={`select-none ${className}`}>
      <path d="M6 11V7C6 3.7 8.7 1 12 1C15.3 1 18 3.7 18 7V11" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="3" y="10" width="18" height="15" rx="4" fill={color} stroke="#2E1065" strokeWidth="2.5" />
      <circle cx="12" cy="16.5" r="2" fill="#2E1065" />
      <line x1="12" y1="18.5" x2="12" y2="21" stroke="#2E1065" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CassetteDoodle({ size = 32, className = '', color = '#BBF7D0' }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 36 24" fill="none" className={`select-none ${className}`}>
      <rect x="2" y="2" width="32" height="20" rx="3" fill={color} stroke="#2E1065" strokeWidth="2" />
      <rect x="7" y="5" width="22" height="9" rx="1.5" fill="#FFFFFF" stroke="#2E1065" strokeWidth="1.5" />
      <circle cx="13" cy="9.5" r="2" fill="#2E1065" />
      <circle cx="23" cy="9.5" r="2" fill="#2E1065" />
      <line x1="15" y1="9.5" x2="21" y2="9.5" stroke="#2E1065" strokeWidth="1.2" />
      <polygon points="10,18 26,18 24,21 12,21" fill="#FFFFFF" stroke="#2E1065" strokeWidth="1.2" />
    </svg>
  );
}

export function FilmStripDoodle({ size = 26, className = '', color = '#E9D5FF' }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 24 30" fill="none" className={`select-none ${className}`}>
      <rect x="2" y="2" width="20" height="26" rx="2" fill={color} stroke="#2E1065" strokeWidth="2" />
      <rect x="5" y="6" width="14" height="18" rx="1" fill="#FFFFFF" stroke="#2E1065" strokeWidth="1.5" />
      <rect x="3" y="3" width="2.5" height="2" fill="#2E1065" />
      <rect x="18.5" y="3" width="2.5" height="2" fill="#2E1065" />
      <rect x="3" y="25" width="2.5" height="2" fill="#2E1065" />
      <rect x="18.5" y="25" width="2.5" height="2" fill="#2E1065" />
    </svg>
  );
}

export function FlowerDoodle({ size = 26, className = '', color = '#FDE047' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" className={`select-none ${className}`}>
      {/* 5 Petals */}
      <circle cx="13" cy="6" r="4" fill="#FDA4AF" stroke="#2E1065" strokeWidth="1.5" />
      <circle cx="19.5" cy="11" r="4" fill="#FDA4AF" stroke="#2E1065" strokeWidth="1.5" />
      <circle cx="17" cy="19" r="4" fill="#FDA4AF" stroke="#2E1065" strokeWidth="1.5" />
      <circle cx="9" cy="19" r="4" fill="#FDA4AF" stroke="#2E1065" strokeWidth="1.5" />
      <circle cx="6.5" cy="11" r="4" fill="#FDA4AF" stroke="#2E1065" strokeWidth="1.5" />
      {/* Center disk */}
      <circle cx="13" cy="13" r="4.5" fill={color} stroke="#2E1065" strokeWidth="1.8" />
    </svg>
  );
}

export function SmileyDoodle({ size = 24, className = '', color = '#FEF08A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`select-none ${className}`}>
      <circle cx="12" cy="12" r="10" fill={color} stroke="#2E1065" strokeWidth="2" />
      <circle cx="8.5" cy="9.5" r="1.5" fill="#2E1065" />
      <circle cx="15.5" cy="9.5" r="1.5" fill="#2E1065" />
      <path d="M7.5 14 Q12 19 16.5 14" stroke="#2E1065" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function GraduationCapDoodle({ size = 28, className = '', color = '#1E1035' }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 32 24" fill="none" className={`select-none ${className}`}>
      <polygon points="16,3 30,10 16,17 2,10" fill={color} stroke="#2E1065" strokeWidth="2" />
      <path d="M9 13.5 Q16 19 23 13.5 L23 18 Q16 23 9 18 Z" fill="#2E1065" />
      <circle cx="16" cy="10" r="1.8" fill="#FACC15" />
      <path d="M16 10 Q25 12 27 19" stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * FloatingStickersBackground
 * Gracefully scatters cute doodles around outer page margins, floating gently with CSS
 * Respects prefers-reduced-motion automatically.
 */
export function FloatingStickersBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-65 dark:opacity-40"
    >
      {/* Top Left Margin */}
      <div className="absolute top-16 left-3 sm:left-8 animate-float-slow">
        <SparkleDoodle size={22} color="#C084FC" />
      </div>
      <div className="absolute top-36 left-2 sm:left-14 animate-float-medium delay-300">
        <HeartDoodle size={20} color="#FDA4AF" />
      </div>
      <div className="hidden lg:block absolute top-72 left-6 animate-float-slow delay-700">
        <CassetteDoodle size={32} color="#BBF7D0" />
      </div>

      {/* Top Right Margin */}
      <div className="absolute top-20 right-3 sm:right-10 animate-float-medium">
        <StarDoodle size={24} color="#FACC15" />
      </div>
      <div className="absolute top-44 right-2 sm:right-16 animate-float-slow delay-500">
        <FlowerDoodle size={26} color="#FDE047" />
      </div>
      <div className="hidden lg:block absolute top-80 right-8 animate-float-medium delay-200">
        <TinyEnvelopeDoodle size={26} color="#FFF0F5" />
      </div>

      {/* Mid Page Margins */}
      <div className="hidden xl:block absolute top-[45%] left-4 animate-float-slow delay-400">
        <FilmStripDoodle size={24} color="#E9D5FF" />
      </div>
      <div className="hidden xl:block absolute top-[48%] right-5 animate-float-medium delay-600">
        <PadlockDoodle size={22} color="#FEF08A" />
      </div>

      {/* Bottom Margins */}
      <div className="absolute bottom-24 left-4 sm:left-12 animate-float-medium delay-100">
        <SmileyDoodle size={22} color="#FEF08A" />
      </div>
      <div className="absolute bottom-16 right-4 sm:right-12 animate-float-slow delay-300">
        <GraduationCapDoodle size={26} color="#1E1035" />
      </div>
      <div className="hidden lg:block absolute bottom-32 right-24 animate-float-medium delay-700">
        <CloudDoodle size={30} color="#E0F2FE" />
      </div>
    </div>
  );
}

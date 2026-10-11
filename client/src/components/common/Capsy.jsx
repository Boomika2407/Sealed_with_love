import React from 'react';

/**
 * Capsy - The Sealed Campus Time Capsule Mascot
 * A smiling pill-shaped capsule with blushing cheeks, tiny arms, and a mini graduation cap.
 * 
 * Expressions: 'happy' | 'sleepy' | 'shocked' | 'tears' | 'waving' | 'running' | 'graduated'
 */
export default function Capsy({
  expression = 'happy',
  speech = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = '',
  speechPlacement = 'top' // 'top' | 'right' | 'left'
}) {
  const sizeMap = {
    sm: { width: 56, height: 72 },
    md: { width: 84, height: 108 },
    lg: { width: 120, height: 154 },
    xl: { width: 160, height: 205 }
  };

  const { width, height } = sizeMap[size] || sizeMap.md;

  // Render expression elements (eyes, mouth, tears, extras)
  const renderFace = () => {
    switch (expression) {
      case 'sleepy':
        return (
          <g>
            {/* Sleepy closed eyes */}
            <path d="M28 48 Q33 53 38 48" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M52 48 Q57 53 62 48" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Small drowsy mouth */}
            <ellipse cx="45" cy="58" rx="2.5" ry="3.5" fill="#2E1065" />
            {/* ZZZ bubbles */}
            <text x="68" y="32" fontFamily="Fredoka, sans-serif" fontWeight="bold" fontSize="12" fill="#8B5CF6" className="animate-pulse">z</text>
            <text x="76" y="24" fontFamily="Fredoka, sans-serif" fontWeight="bold" fontSize="14" fill="#A855F7" className="animate-pulse">Z</text>
          </g>
        );

      case 'shocked':
        return (
          <g>
            {/* Wide round eyes */}
            <circle cx="33" cy="46" r="5.5" fill="#2E1065" />
            <circle cx="31.5" cy="44.5" r="1.8" fill="#FFFFFF" />
            <circle cx="57" cy="46" r="5.5" fill="#2E1065" />
            <circle cx="55.5" cy="44.5" r="1.8" fill="#FFFFFF" />
            {/* Little shocked O mouth */}
            <circle cx="45" cy="58" r="4.5" fill="#2E1065" />
            {/* Sweat drop */}
            <path d="M66 40 C66 38 69 35 69 35 C69 35 72 38 72 40 C72 42 70.6 43 69 43 C67.4 43 66 42 66 40 Z" fill="#60A5FA" />
          </g>
        );

      case 'tears':
      case 'crying happy tears':
        return (
          <g>
            {/* Joyful closed squinting eyes */}
            <path d="M28 47 Q33 42 38 47" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M52 47 Q57 42 62 47" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Big beaming happy mouth */}
            <path d="M37 56 Q45 66 53 56 Z" fill="#2E1065" />
            <path d="M41 59 Q45 65 49 59 Z" fill="#F43F5E" />
            {/* Glistening happy tear streams */}
            <path d="M26 49 C24 54 23 58 24 61 C25 63 27 63 28 61 C29 58 28 53 28 49 Z" fill="#38BDF8" opacity="0.85" />
            <path d="M64 49 C66 54 67 58 66 61 C65 63 63 63 62 61 C61 58 62 53 62 49 Z" fill="#38BDF8" opacity="0.85" />
          </g>
        );

      case 'waving':
        return (
          <g>
            {/* Winking face */}
            <circle cx="33" cy="46" r="4.5" fill="#2E1065" />
            <circle cx="31.5" cy="44.5" r="1.6" fill="#FFFFFF" />
            <path d="M53 46 Q57 42 61 46" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Happy open smile */}
            <path d="M38 56 Q45 65 52 56 Z" fill="#2E1065" />
            <ellipse cx="45" cy="60" rx="3.5" ry="2" fill="#FB7185" />
          </g>
        );

      case 'running':
        return (
          <g>
            {/* Determined happy focused eyes */}
            <ellipse cx="34" cy="46" rx="4" ry="4.5" fill="#2E1065" />
            <circle cx="32.5" cy="44.5" r="1.5" fill="#FFFFFF" />
            <ellipse cx="56" cy="46" rx="4" ry="4.5" fill="#2E1065" />
            <circle cx="54.5" cy="44.5" r="1.5" fill="#FFFFFF" />
            {/* Open cheerful mouth */}
            <path d="M39 56 Q45 63 51 56 Z" fill="#2E1065" />
            {/* Motion lines underneath body */}
            <path d="M8 88 L20 88" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
            <path d="M4 93 L16 93" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <path d="M72 88 L82 88" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          </g>
        );

      case 'graduated':
        return (
          <g>
            {/* Ecstatic star eyes */}
            <path d="M33 42 L34.5 45 L37.5 45.5 L35 47.5 L36 50.5 L33 49 L30 50.5 L31 47.5 L28.5 45.5 L31.5 45 Z" fill="#F59E0B" />
            <path d="M57 42 L58.5 45 L61.5 45.5 L59 47.5 L60 50.5 L57 49 L54 50.5 L55 47.5 L52.5 45.5 L55.5 45 Z" fill="#F59E0B" />
            {/* Big cheering open mouth */}
            <path d="M37 54 Q45 67 53 54 Z" fill="#2E1065" />
            <path d="M41 58 Q45 65 49 58 Z" fill="#F43F5E" />
            {/* Confetti specks */}
            <circle cx="20" cy="20" r="2.5" fill="#EC4899" />
            <rect x="68" y="16" width="4" height="4" transform="rotate(25 70 18)" fill="#10B981" />
            <circle cx="78" cy="30" r="2" fill="#F59E0B" />
          </g>
        );

      case 'happy':
      default:
        return (
          <g>
            {/* Round kawaii shiny eyes */}
            <circle cx="33" cy="46" r="4.5" fill="#2E1065" />
            <circle cx="31.5" cy="44.2" r="1.6" fill="#FFFFFF" />
            <circle cx="57" cy="46" r="4.5" fill="#2E1065" />
            <circle cx="55.5" cy="44.2" r="1.6" fill="#FFFFFF" />
            {/* Sweet upward curved smile */}
            <path d="M39 55 Q45 63 51 55" stroke="#2E1065" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  // Render arms
  const renderArms = () => {
    if (expression === 'waving') {
      return (
        <g>
          {/* Left resting arm */}
          <path d="M18 58 Q12 62 16 68" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Right waving arm raised high */}
          <path d="M72 56 Q80 44 82 34" stroke="#2E1065" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <circle cx="82" cy="34" r="3.5" fill="#FB7185" stroke="#2E1065" strokeWidth="2" />
          {/* Waving breeze lines */}
          <path d="M84 28 Q88 32 86 38" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    if (expression === 'running') {
      return (
        <g>
          {/* Pumping running arms */}
          <path d="M18 56 Q8 62 14 70" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M72 56 Q82 60 76 68" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    if (expression === 'shocked') {
      return (
        <g>
          {/* Hands to cheeks */}
          <path d="M18 58 Q22 54 26 52" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M72 58 Q68 54 64 52" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    if (expression === 'graduated') {
      return (
        <g>
          {/* Both arms thrown high in celebration */}
          <path d="M18 56 Q10 42 16 32" stroke="#2E1065" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <circle cx="16" cy="32" r="3.5" fill="#FB7185" stroke="#2E1065" strokeWidth="2" />
          <path d="M72 56 Q80 42 74 32" stroke="#2E1065" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <circle cx="74" cy="32" r="3.5" fill="#FB7185" stroke="#2E1065" strokeWidth="2" />
        </g>
      );
    }

    // Default cute tiny resting arms
    return (
      <g>
        <path d="M18 58 Q12 65 18 70" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M72 58 Q78 65 72 70" stroke="#2E1065" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    );
  };

  // Render graduation cap
  const renderCap = () => {
    if (expression === 'graduated') {
      // Cap flying high in the air with rotation!
      return (
        <g transform="translate(15, -14) rotate(-15 45 20)">
          {/* Mortarboard Diamond */}
          <polygon points="45,4 66,13 45,22 24,13" fill="#1E1035" stroke="#2E1065" strokeWidth="2.5" />
          {/* Skullcap underneath */}
          <path d="M35 17 Q45 25 55 17" fill="#2E1065" />
          {/* Center golden button */}
          <circle cx="45" cy="13" r="2.2" fill="#FACC15" />
          {/* Swinging tassel ribbon */}
          <path d="M45 13 Q56 16 58 27" stroke="#FACC15" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="58" cy="27" r="2" fill="#EAB308" />
        </g>
      );
    }

    // Normal cap perched on head
    return (
      <g transform={expression === 'running' ? 'rotate(-6 45 24)' : ''}>
        {/* Mortarboard Diamond */}
        <polygon points="45,12 66,21 45,30 24,21" fill="#1E1035" stroke="#2E1065" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Skull cap band */}
        <path d="M35 25 Q45 31 55 25 L55 28 Q45 34 35 28 Z" fill="#2E1065" />
        {/* Golden button */}
        <circle cx="45" cy="21" r="2.2" fill="#FACC15" />
        {/* Golden tassel */}
        <path d="M45 21 Q57 24 59 34" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="59" cy="34" r="1.8" fill="#EAB308" />
      </g>
    );
  };

  return (
    <div className={`inline-flex flex-col items-center relative select-none ${className}`}>
      {/* Speech Bubble */}
      {speech && (
        <div
          className={`mb-2 bg-white dark:bg-dorm-card border-2.5 border-plum-900 dark:border-purple-600 px-3 py-1.5 rounded-2xl shadow-sticker text-xs font-display font-bold text-plum-900 dark:text-purple-100 max-w-xs text-center relative animate-bounce-gentle z-20`}
        >
          <span>{speech}</span>
          {/* Speech bubble pointy arrow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-8 border-t-plum-900 dark:border-t-purple-600" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-5 border-x-transparent border-t-7 border-t-white dark:border-t-dorm-card" />
        </div>
      )}

      {/* Mascot Inline SVG */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 90 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`filter drop-shadow-sm transition-transform duration-300 ${
          expression === 'running' ? 'animate-run-tilt' : 'hover:scale-105'
        }`}
      >
        <defs>
          <linearGradient id="capsyTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
          <linearGradient id="capsyBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBF5" />
            <stop offset="100%" stopColor="#F3E8FF" />
          </linearGradient>
        </defs>

        {/* Shadow under feet/capsule */}
        <ellipse cx="45" cy="104" rx="26" ry="6" fill="#2E1065" opacity="0.12" />

        {/* Arms behind/around */}
        {renderArms()}

        {/* Capsule Main Pill Shape (Split into Top & Bottom) */}
        <g id="capsule-body">
          {/* Top Half: Blush Dome */}
          <path
            d="M20 54 L20 42 C20 28 31 18 45 18 C59 18 70 28 70 42 L70 54 Z"
            fill="url(#capsyTopGrad)"
            stroke="#2E1065"
            strokeWidth="3.2"
          />

          {/* Bottom Half: Creamy White / Lilac Dome */}
          <path
            d="M20 54 L20 78 C20 92 31 101 45 101 C59 101 70 92 70 78 L70 54 Z"
            fill="url(#capsyBottomGrad)"
            stroke="#2E1065"
            strokeWidth="3.2"
          />

          {/* Middle Dividing Seam */}
          <line x1="20" y1="54" x2="70" y2="54" stroke="#2E1065" strokeWidth="2.5" />

          {/* Cute Little Seam Heart Charm */}
          <path
            d="M45 56 C45 56 42 53 40 54.5 C38.5 55.7 38.8 58 40.5 59.5 L45 63 L49.5 59.5 C51.2 58 51.5 55.7 50 54.5 C48 53 45 56 45 56 Z"
            fill="#F43F5E"
            stroke="#2E1065"
            strokeWidth="1.2"
          />

          {/* Soft Pill Highlight Gloss Streak */}
          <path
            d="M26 32 C26 26 32 23 38 22"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>

        {/* Blushing Cheeks */}
        <ellipse cx="25" cy="52" rx="4.5" ry="3" fill="#FB7185" opacity="0.65" />
        <ellipse cx="65" cy="52" rx="4.5" ry="3" fill="#FB7185" opacity="0.65" />

        {/* Face Expressions (Eyes & Mouth) */}
        {renderFace()}

        {/* Graduation Cap */}
        {renderCap()}
      </svg>
    </div>
  );
}

import React, { useEffect, useState, useRef } from 'react';

/**
 * CustomCursor - Desktop sparkle & heart cursor trail
 * Active only on fine pointer (mouse) devices, strictly respecting prefers-reduced-motion.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [sparkles, setSparkles] = useState([]);
  const lastSparkleTime = useRef(0);
  const sparkleIdCounter = useRef(0);

  useEffect(() => {
    // Check for fine pointer (desktop mouse) & prefers-reduced-motion
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      const now = Date.now();
      // Drop a mini-sparkle every 70ms while moving
      if (now - lastSparkleTime.current > 70) {
        lastSparkleTime.current = now;
        const newSparkle = {
          id: ++sparkleIdCounter.current,
          x: e.clientX + (Math.random() * 8 - 4),
          y: e.clientY + (Math.random() * 8 - 4),
          color: ['#F43F5E', '#A855F7', '#FBBF24', '#34D399'][sparkleIdCounter.current % 4],
          size: Math.floor(Math.random() * 6) + 6
        };

        setSparkles((prev) => [...prev.slice(-8), newSparkle]);

        // Remove sparkle after 450ms
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id));
        }, 450);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Trailing fading sparkles */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            color: s.color,
            transform: 'translate(-50%, -50%)'
          }}
          className="absolute animate-sparkle-fade text-xs flex items-center justify-center font-bold"
        >
          ✦
        </span>
      ))}

      {/* Main Cursor: Cute tiny pink heart / sparkle */}
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-40%, -40%)`
        }}
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none transition-transform duration-75 ease-out"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 14.2L7.05 13.3C3.5 10.1 1.2 7.9 1.2 5.3C1.2 3.2 2.8 1.6 4.9 1.6C6.1 1.6 7.2 2.2 8 3.1C8.8 2.2 9.9 1.6 11.1 1.6C13.2 1.6 14.8 3.2 14.8 5.3C14.8 7.9 12.5 10.1 8.95 13.3L8 14.2Z"
            fill="#FB7185"
            stroke="#2E1065"
            strokeWidth="1.2"
          />
        </svg>
      </div>
    </div>
  );
}

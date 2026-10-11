import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, User, Heart } from 'lucide-react';
import WaxSeal from './WaxSeal';

export default function Envelope3D({
  capsule,
  onAttemptUnlock,
  isLoading,
  shake,
  onReact
}) {
  if (!capsule) return null;

  const isUnlocked = capsule.isUnlocked;

  return (
    <div className="w-full max-w-xl mx-auto perspective-container my-4">
      <div className="relative bg-[#FFF9FB] dark:bg-[#1A132B] border-3 border-plum-900 dark:border-purple-600 rounded-2xl shadow-sticker-lg overflow-hidden transition-all p-6 sm:p-8">
        {/* Top Washi Tape Decoration */}
        <div className="washi-tape washi-tape-pink" />

        {/* Header details */}
        <div className="flex items-start justify-between border-b-2 border-plum-900/15 dark:border-purple-800/40 pb-4 mb-5">
          <div>
            <span className="inline-block text-[11px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blush-200 dark:bg-purple-900/80 text-plum-900 dark:text-purple-200 border border-plum-900/20 mb-1.5">
              {capsule.capsuleType.replace('_', ' ')}
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-plum-900 dark:text-purple-100">
              {capsule.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-plum-700 dark:text-purple-300 font-semibold">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-rose-500" />
                {capsule.creatorName} ({capsule.batch})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {capsule.location?.name} ({capsule.location?.radiusMeters || 100}m radius)
              </span>
            </div>
          </div>

          {/* Heart reaction button */}
          {isUnlocked && (
            <button
              onClick={() => onReact && onReact(capsule._id)}
              className="flex items-center gap-1.5 btn-sticker bg-rose-100 dark:bg-rose-950/60 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{capsule.reactions?.hearts || 0}</span>
            </button>
          )}
        </div>

        {/* Envelope Body / Content Presentation */}
        <AnimatePresence mode="wait">
          {!isUnlocked ? (
            /* LOCKED STATE: The Sealed Envelope */
            <motion.div
              key="locked-envelope"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-6 text-center"
            >
              <div className="w-full bg-[#FFF0F5] dark:bg-purple-950/30 border-2 border-dashed border-rose-300 dark:border-purple-800 rounded-xl p-6 relative mb-6">
                <div className="absolute top-2 right-3 font-mono text-[10px] text-plum-500 dark:text-purple-400">
                  SERVER-ENFORCED ACCESS CONTROL
                </div>
                <div className="text-4xl mb-2">🔒</div>
                <h3 className="font-display font-bold text-lg text-plum-900 dark:text-purple-200">
                  This capsule is strictly locked!
                </h3>
                <p className="text-sm text-plum-700 dark:text-purple-300 max-w-md mx-auto mt-1">
                  The message and photo are AES-256 encrypted at rest and will not leave the server until date & campus spot are verified.
                </p>

                {/* Target Requirements Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                  <div className="bg-white dark:bg-dorm-card px-3 py-1.5 rounded-lg border border-plum-900/20 text-xs">
                    <span className="font-bold text-plum-900 dark:text-purple-200">Unlock Date: </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">
                      {new Date(capsule.unlockDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-dorm-card px-3 py-1.5 rounded-lg border border-plum-900/20 text-xs">
                    <span className="font-bold text-plum-900 dark:text-purple-200">Spot: </span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {capsule.location?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wax Seal Interaction */}
              <WaxSeal
                isUnlocked={false}
                onAttemptUnlock={onAttemptUnlock}
                isLoading={isLoading}
                shake={shake}
                theme={capsule.theme?.color}
              />
            </motion.div>
          ) : (
            /* UNLOCKED STATE: The Letter & Polaroid Reveal */
            <motion.div
              key="unlocked-letter"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="space-y-6"
            >
              {/* Unlocked celebration banner */}
              <div className="bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🎉</span>
                  WELCOME BACK. You survived college!
                </span>
                <span className="font-mono text-[11px] opacity-80">
                  Unlocked on {new Date(capsule.unlockedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              {/* Polaroid Photo if present */}
              {capsule.mediaUrl && (
                <div className="flex justify-center my-4">
                  <div className="polaroid-card p-3 pb-6 max-w-sm w-full relative transform -rotate-1">
                    <div className="washi-tape washi-tape-lilac" />
                    <img
                      src={capsule.mediaUrl}
                      alt="Capsule Memory Polaroid"
                      className="w-full h-64 object-cover rounded-md border border-plum-900/20"
                    />
                    <p className="font-handwriting text-center text-xl text-plum-800 dark:text-purple-300 mt-3">
                      {capsule.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Handwritten Letter Sheet */}
              <div className="bg-[#FFFDF7] dark:bg-[#251A3E] border-2 border-amber-300 dark:border-purple-700 rounded-xl p-6 sm:p-8 shadow-sm relative">
                <div className="washi-tape washi-tape-mint" />
                <h4 className="font-handwriting text-2xl text-plum-900 dark:text-purple-200 mb-2 border-b border-amber-200 dark:border-purple-800 pb-2">
                  Dear Future Self & Friends,
                </h4>
                <p className="font-handwriting text-2xl sm:text-3xl leading-relaxed text-plum-950 dark:text-purple-100 whitespace-pre-wrap">
                  {capsule.message || 'No written letter attached.'}
                </p>
                <div className="text-right mt-6 font-handwriting text-xl text-plum-700 dark:text-purple-300">
                  — {capsule.creatorName}, Batch of {capsule.batch} 🎓
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

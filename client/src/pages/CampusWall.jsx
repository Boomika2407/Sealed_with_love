import React, { useState } from 'react';
import { Heart, MapPin, Sparkles, User, MessageCircle } from 'lucide-react';
import Capsy from '../components/common/Capsy';
import { PushPin } from '../components/common/ScrapbookAccents';

const EMOJI_STICKERS = [
  { emoji: '❤️', label: 'love' },
  { emoji: '😭', label: 'crying' },
  { emoji: '😂', label: 'haha' },
  { emoji: '🫶', label: 'wholesome' },
  { emoji: '🎓', label: 'grad' }
];

export default function CampusWall({ wallCapsules = [], onReact, isLoading }) {
  // Local active reactions for popping micro-animations
  const [poppedReaction, setPoppedReaction] = useState({});

  const handleEmojiClick = (capsuleId, emoji) => {
    setPoppedReaction((prev) => ({ ...prev, [capsuleId]: emoji }));
    if (onReact) {
      onReact(capsuleId);
    }
    setTimeout(() => {
      setPoppedReaction((prev) => ({ ...prev, [capsuleId]: null }));
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Wall Header */}
      <div className="text-center max-w-xl mx-auto py-4 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200 rounded-full font-display text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Public Campus Scrapbook Wall</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-plum-900 dark:text-purple-100">
          Opened Memories Across Batches 💌
        </h2>
        <p className="font-handwriting text-lg text-plum-700 dark:text-purple-300 mt-1">
          Real letters and polaroids decrypted by students upon reaching campus spots.
        </p>
      </div>

      {/* Polaroid Wall Grid */}
      {wallCapsules.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/70 dark:bg-dorm-card/70 rounded-2xl border-2.5 border-dashed border-plum-900/30 flex flex-col items-center">
          <Capsy expression="waving" size="lg" speech="The wall is waiting for your story!" />
          <h3 className="font-display font-bold text-xl text-plum-900 dark:text-purple-200 mt-4">
            The campus wall is quiet for now.
          </h3>
          <p className="text-sm text-plum-700 dark:text-purple-400 mt-1 max-w-md mx-auto">
            Once students unlock their public capsules at the campus spots, their letters will appear pinned here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallCapsules.map((cap, idx) => {
            const tilt = idx % 2 === 0 ? -1.8 : 1.8;
            return (
              <div
                key={cap._id}
                style={{ transform: `rotate(${tilt}deg)` }}
                className="polaroid-card p-5 relative flex flex-col justify-between group transition-all"
              >
                {/* Scrapbook Pin on top corner */}
                <div className="absolute -top-3.5 -right-2 z-20 pointer-events-none">
                  <PushPin color={idx % 2 === 0 ? '#F43F5E' : '#A855F7'} size={24} />
                </div>

                {/* Washi Tape */}
                <div
                  className={`washi-tape ${
                    idx % 3 === 0
                      ? 'washi-tape-pink'
                      : idx % 3 === 1
                      ? 'washi-tape-mint'
                      : 'washi-tape-lilac'
                  }`}
                />

                {/* Top Info */}
                <div>
                  <div className="flex items-center justify-between text-xs text-plum-600 dark:text-purple-400 mb-2 pt-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <User className="w-3.5 h-3.5 text-rose-500" />
                      {cap.creatorName} ({cap.batch})
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {cap.location?.name}
                    </span>
                  </div>

                  {/* Photo if present */}
                  {cap.mediaUrl && (
                    <div className="mb-3 rounded-xl overflow-hidden border-2 border-plum-900/30 dark:border-purple-800">
                      <img
                        src={cap.mediaUrl}
                        alt="Campus memory"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Capsule Title */}
                  <h3 className="font-display font-bold text-lg text-plum-900 dark:text-purple-100">
                    {cap.title}
                  </h3>

                  {/* Handwritten letter snippet */}
                  <div className="bg-[#FFFDF7] dark:bg-[#251A3E] p-3.5 rounded-xl border-2 border-amber-200/80 dark:border-purple-800/60 mt-2.5 shadow-sm">
                    <p className="font-handwriting text-xl text-plum-950 dark:text-purple-100 line-clamp-4 leading-snug">
                      "{cap.message}"
                    </p>
                  </div>
                </div>

                {/* Footer with Emoji Reaction Stickers */}
                <div className="mt-4 pt-3 border-t border-plum-900/10 dark:border-purple-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-plum-500 dark:text-purple-400">
                      Opened {new Date(cap.unlockedAt || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="font-display font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      {cap.reactions?.hearts || 0} loves
                    </span>
                  </div>

                  {/* Emoji reaction stickers: ❤️ 😭 😂 🫶 🎓 */}
                  <div className="flex items-center justify-between bg-plum-50 dark:bg-purple-950/40 p-1.5 rounded-full border border-plum-900/15 dark:border-purple-800">
                    {EMOJI_STICKERS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => handleEmojiClick(cap._id, s.emoji)}
                        title={`React ${s.emoji}`}
                        className={`text-sm sm:text-base px-2 py-0.5 rounded-full hover:scale-130 active:scale-90 transition-transform ${
                          poppedReaction[cap._id] === s.emoji ? 'scale-135 bg-white shadow-sm' : ''
                        }`}
                      >
                        {s.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

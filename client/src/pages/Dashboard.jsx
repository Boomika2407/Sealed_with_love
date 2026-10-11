import React, { useState } from 'react';
import { PlusCircle, MapPin, Calendar, Lock, Unlock, Sparkles, Filter, X, Share2 } from 'lucide-react';
import OdometerCountdown from '../components/capsule/OdometerCountdown';
import Envelope3D from '../components/capsule/Envelope3D';
import Capsy from '../components/common/Capsy';
import BadgeShowcase from '../components/common/BadgeShowcase';
import { HandwrittenArrow, PushPin } from '../components/common/ScrapbookAccents';

export default function Dashboard({
  capsules = [],
  onOpenCreate,
  onUnlockCapsule,
  onReactCapsule,
  isLoadingUnlock,
  activeCapsule,
  setActiveCapsule,
  unlockError,
  setUnlockError,
  onShareToMemoryWall
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [shareCaption, setShareCaption] = useState('');

  const filteredCapsules = capsules.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.capsuleType === filterType;
  });

  const handleCardClick = (capsule) => {
    setActiveCapsule(capsule);
    setUnlockError(null);
    setShowSharePrompt(false);
  };

  const handleCloseModal = () => {
    setActiveCapsule(null);
    setUnlockError(null);
    setShowSharePrompt(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Scrapbook Banner */}
      <div className="bg-gradient-to-r from-blush-100 via-lilac-100 to-butter-100 dark:from-purple-950/40 dark:via-dorm-card dark:to-purple-900/30 p-6 rounded-3xl border-2.5 border-plum-900/20 dark:border-purple-800/50 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="washi-tape washi-tape-mint" />
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/70 dark:bg-purple-900/50 rounded-full border border-plum-900/20 text-xs font-bold font-display text-plum-900 dark:text-purple-200 mb-2">
            <span>✨ College Memory Archive</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-plum-900 dark:text-purple-100">
            Your Campus Scrapbook 🎓
          </h2>
          <p className="text-sm text-plum-700 dark:text-purple-300 mt-1 leading-relaxed">
            Digital time capsules locked by server-enforced access control until the exact graduation day & physical campus spot.
          </p>
        </div>

        {/* Action Button with Handwritten Arrow Caption */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 z-10">
          <HandwrittenArrow text="start here! ✨" className="hidden sm:inline-flex pr-3" />
          <button
            onClick={onOpenCreate}
            className="btn-sticker bg-plum-900 text-white dark:bg-purple-600 px-5 py-2.5 text-sm flex items-center gap-2 shadow-sticker"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Seal a New Memory 💌</span>
          </button>
        </div>
      </div>

      {/* Badges & Milestones Showcase */}
      <BadgeShowcase capsules={capsules} />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-display font-bold text-plum-600 dark:text-purple-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {[
          { id: 'ALL', label: 'All Capsules' },
          { id: 'FRESHERS_LETTER', label: '🌱 Freshers’ Letters' },
          { id: 'BATCH_FAREWELL', label: '🎓 Batch Farewells' },
          { id: 'CLASS_MEMORY', label: '📸 Class Memories' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`btn-sticker text-xs px-3.5 py-1 ${
              filterType === tab.id
                ? 'bg-plum-900 text-white dark:bg-purple-600'
                : 'bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Capsules Grid or Empty State with Sleepy Capsy */}
      {filteredCapsules.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white/70 dark:bg-dorm-card/70 rounded-3xl border-2.5 border-dashed border-plum-900/30 flex flex-col items-center">
          <Capsy
            expression="sleepy"
            size="lg"
            speech="Nothing sealed yet. Future you is bored."
          />
          <h3 className="font-display font-bold text-xl text-plum-900 dark:text-purple-200 mt-4">
            Nothing sealed yet. Future you is bored.
          </h3>
          <p className="text-sm text-plum-700 dark:text-purple-400 mt-1 max-w-md mx-auto">
            Write a letter to your 4th-year self, seal a photo at the canteen, or preserve a secret spot before graduation.
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-6 btn-sticker bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 text-sm font-bold shadow-sticker"
          >
            💌 Seal Your First Capsule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredCapsules.map((cap, idx) => {
            const tilt = idx % 3 === 0 ? -1.8 : idx % 3 === 1 ? 1.8 : -0.8;
            return (
              <div
                key={cap._id}
                onClick={() => handleCardClick(cap)}
                style={{ transform: `rotate(${tilt}deg)` }}
                className="polaroid-card p-5 cursor-pointer relative group flex flex-col justify-between"
              >
                {/* PushPin on corner */}
                <div className="absolute -top-3.5 -left-1 z-20 pointer-events-none">
                  <PushPin color={idx % 2 === 0 ? '#FB7185' : '#34D399'} size={22} />
                </div>

                {/* Washi Tape Accent */}
                <div
                  className={`washi-tape ${
                    idx % 3 === 0
                      ? 'washi-tape-pink'
                      : idx % 3 === 1
                      ? 'washi-tape-mint'
                      : 'washi-tape-lilac'
                  }`}
                />

                {/* Card Top: Type badge & status */}
                <div>
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blush-100 dark:bg-purple-900/60 text-plum-900 dark:text-purple-200 border border-plum-900/20">
                      {cap.capsuleType.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        cap.isUnlocked
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                      }`}
                    >
                      {cap.isUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {cap.isUnlocked ? 'Unlocked' : 'Sealed'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-plum-900 dark:text-purple-100 line-clamp-2">
                    {cap.title}
                  </h3>

                  {/* Location & Radius */}
                  <div className="flex items-center gap-1.5 text-xs text-plum-700 dark:text-purple-300 mt-2 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{cap.location?.name} ({cap.location?.radiusMeters || 100}m)</span>
                  </div>

                  {/* Date target */}
                  <div className="flex items-center gap-1.5 text-xs text-plum-700 dark:text-purple-300 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    <span>Unlocks: {new Date(cap.unlockDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Bottom Countdown & Action */}
                <div className="mt-5 pt-3 border-t border-plum-900/10 dark:border-purple-800/40 flex items-center justify-between">
                  <OdometerCountdown
                    targetDate={cap.unlockDate}
                    isUnlocked={cap.isUnlocked}
                  />
                  <span className="font-display text-xs text-plum-800 dark:text-purple-300 font-bold group-hover:translate-x-1 transition-transform">
                    {cap.isUnlocked ? 'Read letter →' : 'Attempt unlock →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / Envelope Modal */}
      {activeCapsule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-white dark:bg-dorm-card border-2 border-plum-900 text-plum-900 dark:text-purple-100 flex items-center justify-center shadow-sticker hover:scale-110 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Envelope 3D Viewer */}
            <Envelope3D
              capsule={activeCapsule}
              onAttemptUnlock={onUnlockCapsule}
              isLoadingUnlock={isLoadingUnlock}
              unlockError={unlockError}
            />

            {/* Share to Memory Wall button (only for unlocked capsules) */}
            {activeCapsule.isUnlocked && onShareToMemoryWall && (
              <div className="mt-3 px-4 pb-4">
                {showSharePrompt ? (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl space-y-2.5">
                    <p className="font-display font-bold text-xs text-amber-900 dark:text-amber-200">
                      Share "{activeCapsule.title}" to Campus Memory Wall 📌
                    </p>
                    <textarea
                      value={shareCaption}
                      onChange={(e) => setShareCaption(e.target.value)}
                      placeholder="Add a thought or caption... (optional)"
                      rows={2}
                      maxLength={300}
                      className="w-full p-2.5 text-xs rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-[#150D2A] text-plum-900 dark:text-purple-100 font-handwriting text-base focus:outline-none focus:border-rose-400 resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowSharePrompt(false)}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-plum-600 dark:text-purple-300 hover:bg-black/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onShareToMemoryWall(activeCapsule._id, shareCaption);
                          setShowSharePrompt(false);
                          setShareCaption('');
                          handleCloseModal();
                        }}
                        className="btn-sticker bg-emerald-500 text-white px-4 py-1 text-xs font-bold shadow-sm"
                      >
                        Share to Wall 🎉
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowSharePrompt(true)}
                      className="w-full btn-sticker bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share this memory to the Wall 📌
                    </button>
                    <p className="text-center text-xs text-plum-400 dark:text-purple-500 mt-1.5 font-handwriting">
                      Posts instantly — no lock, no date required!
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

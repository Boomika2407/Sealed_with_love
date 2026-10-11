import React from 'react';
import { Award, CheckCircle2, Lock } from 'lucide-react';

/**
 * Scrapbook Badge Stickers & Achievements
 * Badges:
 * - "First Letter Sealed" (At least 1 capsule created)
 * - "Patient One" (Capsule locked for > 1 year)
 * - "Gate Keeper" (Capsule at Main Gate)
 * - "Wall Star" (10+ hearts received on Campus Wall)
 */
export default function BadgeShowcase({ capsules = [], wallCapsules = [] }) {
  // Check conditions
  const hasSealed = capsules.length > 0;

  const hasPatientOne = capsules.some((c) => {
    const diff = new Date(c.unlockDate).getTime() - new Date(c.createdAt || Date.now()).getTime();
    return diff > 1000 * 60 * 60 * 24 * 365; // > 1 year
  });

  const hasGateKeeper = capsules.some((c) =>
    c.location?.name?.toLowerCase().includes('gate')
  );

  const totalHearts = capsules.reduce((sum, c) => sum + (c.reactions?.hearts || 0), 0);
  const hasWallStar = totalHearts >= 10;

  const badges = [
    {
      id: 'first_letter',
      title: 'First Letter Sealed',
      desc: 'Penned your inaugural college time capsule',
      icon: '💌',
      color: 'bg-blush-100 dark:bg-rose-950/50 border-rose-400 text-rose-950 dark:text-rose-200',
      isUnlocked: hasSealed,
      tilt: '-1.5deg'
    },
    {
      id: 'patient_one',
      title: 'Patient One',
      desc: 'Locked a letter for over a full academic year',
      icon: '⏳',
      color: 'bg-butter-100 dark:bg-amber-950/50 border-amber-400 text-amber-950 dark:text-amber-200',
      isUnlocked: hasPatientOne,
      tilt: '1.2deg'
    },
    {
      id: 'gate_keeper',
      title: 'Gate Keeper',
      desc: 'Anchored a memory at the Campus Main Gate',
      icon: '🏛️',
      color: 'bg-mint-100 dark:bg-emerald-950/50 border-emerald-400 text-emerald-950 dark:text-emerald-200',
      isUnlocked: hasGateKeeper,
      tilt: '-0.8deg'
    },
    {
      id: 'wall_star',
      title: 'Wall Star',
      desc: 'Collected 10+ hearts from fellow campus batchmates',
      icon: '⭐',
      color: 'bg-lilac-100 dark:bg-purple-950/50 border-purple-400 text-purple-950 dark:text-purple-200',
      isUnlocked: hasWallStar,
      tilt: '1.8deg'
    }
  ];

  return (
    <div className="bg-white/80 dark:bg-dorm-card/80 p-4 rounded-2xl border-2 border-plum-900/20 dark:border-purple-800/40 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 font-display font-bold text-sm text-plum-900 dark:text-purple-100">
          <Award className="w-4 h-4 text-rose-500" />
          <span>Campus Scrapbook Badges & Milestones</span>
        </div>
        <span className="text-[11px] font-handwriting text-plum-700 dark:text-purple-300">
          collect them during your college years!
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            style={{ transform: `rotate(${b.tilt})` }}
            className={`p-3 rounded-xl border-2 border-dashed transition-all select-none relative group ${
              b.isUnlocked
                ? `${b.color} shadow-sticker hover:scale-105 hover:rotate-0`
                : 'bg-gray-100/70 dark:bg-purple-950/20 border-gray-300 dark:border-purple-900/40 opacity-60 text-plum-900 dark:text-purple-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{b.icon}</span>
              {b.isUnlocked ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <h5 className="font-display font-bold text-xs leading-tight mb-0.5">
              {b.title}
            </h5>
            <p className="text-[10px] leading-tight opacity-80">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

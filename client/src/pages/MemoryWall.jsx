import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pin, SlidersHorizontal, Map, List, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';
import Capsy from '../components/common/Capsy';
import MemoryCard from '../components/wall/MemoryCard';
import PinMemoryModal from '../components/wall/PinMemoryModal';
import SpotsMemoryMap from '../components/wall/SpotsMemoryMap';
import { memoryWallApi } from '../services/api';
import { PushPin } from '../components/common/ScrapbookAccents';

const FILTERS = [
  { key: 'all', label: 'All 🌸' },
  { key: 'photos', label: 'Photos 📸' },
  { key: 'videos', label: 'Videos 🎬' },
  { key: 'text', label: 'Notes 📝' },
  { key: 'batch', label: 'My Batch 👩‍🎓' }
];
const MOODS = ['Funny', 'Emotional', 'Fest', 'Canteen', 'Class', 'Hostel', 'Farewell'];
const MOOD_EMOJI = {
  Funny: '😂', Emotional: '😭', Fest: '🎉', Canteen: '☕',
  Class: '📚', Hostel: '🌙', Farewell: '🎓'
};
const SORTS = [
  { key: 'latest', label: 'Latest ⏱️' },
  { key: 'loved', label: 'Most Loved ❤️' },
  { key: 'onthisday', label: 'On This Day 📅' }
];

function WallFilters({ filter, setFilter, mood, setMood, sort, setSort, spots, spotFilter, setSpotFilter }) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-3 mb-6">
      {/* Primary filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-display font-bold border-2 transition-all ${
              filter === f.key
                ? 'bg-plum-900 dark:bg-purple-600 text-white border-plum-900 dark:border-purple-600 scale-105'
                : 'bg-white dark:bg-[#150D2A] border-plum-900/20 dark:border-purple-800 text-plum-700 dark:text-purple-300 hover:scale-105'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowMore((s) => !s)}
          className="px-3 py-1.5 rounded-full text-xs font-display font-bold border-2 bg-white dark:bg-[#150D2A] border-plum-900/20 dark:border-purple-800 text-plum-500 dark:text-purple-400 hover:scale-105 transition-all flex items-center gap-1"
        >
          <SlidersHorizontal className="w-3 h-3" />More filters
          <ChevronDown className={`w-3 h-3 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded filters */}
      {showMore && (
        <div className="p-4 bg-white/70 dark:bg-[#1A132B]/70 rounded-xl border-2 border-plum-900/15 dark:border-purple-800/40 space-y-3">
          <div>
            <p className="text-xs font-display font-bold text-plum-600 dark:text-purple-400 uppercase tracking-wider mb-2">Mood</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setMood('')}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${!mood ? 'bg-plum-900 text-white border-plum-900' : 'bg-white dark:bg-[#150D2A] border-plum-900/20 dark:border-purple-800 text-plum-700 dark:text-purple-300'}`}
              >All</button>
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? '' : m)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${mood === m ? 'bg-plum-900 text-white border-plum-900' : 'bg-white dark:bg-[#150D2A] border-plum-900/20 dark:border-purple-800 text-plum-700 dark:text-purple-300'}`}
                >
                  {MOOD_EMOJI[m]} {m}
                </button>
              ))}
            </div>
          </div>

          {spots.length > 0 && (
            <div>
              <p className="text-xs font-display font-bold text-plum-600 dark:text-purple-400 uppercase tracking-wider mb-2">Spot</p>
              <select
                value={spotFilter}
                onChange={(e) => setSpotFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border-2 border-plum-900/20 dark:border-purple-800 bg-white dark:bg-[#150D2A] text-xs text-plum-900 dark:text-purple-100 focus:outline-none"
              >
                <option value="">All spots</option>
                {spots.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Sort pills */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-display font-bold text-plum-500 dark:text-purple-500 uppercase tracking-wider">Sort:</span>
        {SORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSort(s.key)}
            className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
              sort === s.key
                ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 text-amber-800 dark:text-amber-300 scale-105'
                : 'bg-white dark:bg-[#150D2A] border-plum-900/15 dark:border-purple-800 text-plum-500 dark:text-purple-400 hover:scale-105'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MemoryWall({ user, spots = [] }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [filter, setFilter] = useState('all');
  const [mood, setMood] = useState('');
  const [sort, setSort] = useState('latest');
  const [spotFilter, setSpotFilter] = useState('');
  const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'map'
  const [pinInitialSpotId, setPinInitialSpotId] = useState('');

  const loaderRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPosts = useCallback(async (reset = true) => {
    if (reset) {
      setIsLoading(true);
      setNextCursor(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = {
        filter,
        sort,
        limit: 12,
        ...(mood && { mood }),
        ...(spotFilter && { spotId: spotFilter }),
        ...(!reset && nextCursor && { cursor: nextCursor })
      };

      const res = await memoryWallApi.getFeed(params);
      if (reset) {
        setPosts(res.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(res.posts || [])]);
      }
      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error('Failed to load memory wall:', err);
      showToast('Failed to load memories. Try again!', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filter, mood, sort, spotFilter]);

  // Refetch on filter/sort change
  useEffect(() => {
    fetchPosts(true);
  }, [filter, mood, sort, spotFilter]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          fetchPosts(false);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    showToast('Pinned! Your batch will see this 🎉');
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
    showToast('Post deleted. Gone but not forgotten. 🗑️');
  };

  // Masonry split for 3 columns on desktop
  const col1 = posts.filter((_, i) => i % 3 === 0);
  const col2 = posts.filter((_, i) => i % 3 === 1);
  const col3 = posts.filter((_, i) => i % 3 === 2);

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border-2 shadow-sticker font-display font-bold text-sm transition-all ${
            toast.type === 'error'
              ? 'bg-rose-100 dark:bg-rose-950 border-rose-400 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-100 dark:bg-emerald-950 border-emerald-400 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto py-4 relative mb-2">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <PushPin color="#F43F5E" size={28} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200 rounded-full font-display text-xs font-bold mb-3 mt-4">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Public Memory Wall — No Lock, No Seal, Pure Vibes</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-plum-900 dark:text-purple-100">
          Campus Memory Wall 📌
        </h2>
        <p className="font-handwriting text-lg text-plum-600 dark:text-purple-300 mt-1">
          Real moments from real CIT students. Instant. Always open.
        </p>

        {/* Pin Memory CTA & View Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <button
            onClick={() => setShowPinModal(true)}
            className="btn-sticker bg-gradient-to-r from-rose-500 to-purple-600 text-white px-6 py-2 text-sm font-bold shadow-sticker"
          >
            📌 Pin a Memory
          </button>

          {/* View Switcher: Feed vs Map */}
          <div className="inline-flex p-1 rounded-full bg-white/80 dark:bg-[#150D2A]/80 border-2 border-plum-900/20 dark:border-purple-800 shadow-sm">
            <button
              onClick={() => setViewMode('feed')}
              className={`px-3.5 py-1 rounded-full text-xs font-display font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'feed'
                  ? 'bg-plum-900 dark:bg-purple-600 text-white shadow-sm'
                  : 'text-plum-700 dark:text-purple-300 hover:text-plum-950'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Feed 🧱</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3.5 py-1 rounded-full text-xs font-display font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'map'
                  ? 'bg-plum-900 dark:bg-purple-600 text-white shadow-sm'
                  : 'text-plum-700 dark:text-purple-300 hover:text-plum-950'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map 🗺️</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <SpotsMemoryMap
          spots={spots}
          onFilterBySpot={(sId) => {
            setSpotFilter(sId);
            setViewMode('feed');
          }}
          onPinAtSpot={(sId) => {
            setPinInitialSpotId(sId);
            setShowPinModal(true);
          }}
        />
      ) : (
        <>
          {/* Filters */}
          <WallFilters
            filter={filter} setFilter={setFilter}
            mood={mood} setMood={setMood}
            sort={sort} setSort={setSort}
            spots={spots}
            spotFilter={spotFilter} setSpotFilter={setSpotFilter}
          />

          {/* Refresh button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => fetchPosts(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-plum-900/20 dark:border-purple-800 bg-white dark:bg-[#150D2A] text-plum-600 dark:text-purple-400 hover:scale-105 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />Refresh
            </button>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center py-16 gap-4">
              <Capsy expression="running" size="lg" speech="Loading all the good memories..." />
              <div className="flex gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-rose-400"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-16 px-4 bg-white/70 dark:bg-dorm-card/70 rounded-2xl border-2.5 border-dashed border-plum-900/30 flex flex-col items-center">
              <Capsy expression="sleepy" size="lg" speech="The wall is empty. Be the first to ruin it with a good memory." />
              <h3 className="font-display font-bold text-xl text-plum-900 dark:text-purple-200 mt-4">
                {filter === 'onthisday' || sort === 'onthisday'
                  ? 'No memories from this day... yet!'
                  : 'Nothing here yet!'}
              </h3>
              <p className="text-sm text-plum-600 dark:text-purple-400 mt-1 max-w-sm">
                {sort === 'onthisday'
                  ? 'Come back when someone pins a memory from today!'
                  : "Be the first to pin a memory and make this wall legendary. 🏆"}
              </p>
              <button
                onClick={() => setShowPinModal(true)}
                className="mt-4 btn-sticker bg-rose-500 text-white px-5 py-2 text-sm font-bold"
              >
                📌 Pin the First Memory
              </button>
            </div>
          )}

          {/* Masonry Grid — 3 cols on large, 2 on md, 1 on mobile */}
          {!isLoading && posts.length > 0 && (
            <>
              {/* Mobile / tablet: single column */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                {posts.map((post, i) => (
                  <MemoryCard
                    key={post._id}
                    post={post}
                    index={i}
                    currentUser={user}
                    onDeleted={handlePostDeleted}
                  />
                ))}
              </div>

              {/* Desktop: 3-column masonry */}
              <div className="hidden lg:flex gap-6 items-start">
                {[col1, col2, col3].map((col, ci) => (
                  <div key={ci} className="flex-1 space-y-6">
                    {col.map((post, i) => (
                      <MemoryCard
                        key={post._id}
                        post={post}
                        index={ci * 100 + i}
                        currentUser={user}
                        onDeleted={handlePostDeleted}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Infinite scroll loader */}
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-plum-500 dark:text-purple-400 font-display text-sm">
                  <span className="inline-block w-5 h-5 border-2 border-plum-300 dark:border-purple-700 border-t-plum-700 dark:border-t-purple-300 rounded-full animate-spin" />
                  Loading more memories...
                </div>
              ) : (
                <button
                  onClick={() => fetchPosts(false)}
                  className="btn-sticker bg-white dark:bg-[#150D2A] text-plum-700 dark:text-purple-300 px-5 py-2 text-sm font-bold border-plum-900/30 dark:border-purple-700"
                >
                  Load more memories 📜
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Pin Memory Modal */}
      {showPinModal && (
        <PinMemoryModal
          onClose={() => {
            setShowPinModal(false);
            setPinInitialSpotId('');
          }}
          onPosted={handlePostCreated}
          spots={spots}
          user={user}
          initialSpotId={pinInitialSpotId}
        />
      )}
    </div>
  );
}

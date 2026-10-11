import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart, Laugh, Wind, GraduationCap, BookHeart,
  MessageCircle, Bookmark, Flag, Trash2, X, Play,
  ChevronDown, Send, MapPin, Calendar, MoreHorizontal
} from 'lucide-react';
import { memoryWallApi } from '../../services/api';

const EMOJI_MAP = {
  heart: { emoji: '❤️', icon: Heart, color: 'text-rose-500' },
  cry:   { emoji: '😭', icon: BookHeart, color: 'text-blue-500' },
  haha:  { emoji: '😂', icon: Laugh, color: 'text-amber-500' },
  care:  { emoji: '🫶', icon: Wind, color: 'text-pink-500' },
  grad:  { emoji: '🎓', icon: GraduationCap, color: 'text-purple-500' }
};

const MOOD_EMOJI = {
  Funny: '😂', Emotional: '😭', Fest: '🎉', Canteen: '☕',
  Class: '📚', Hostel: '🌙', Farewell: '🎓'
};

const TILT_CLASSES = ['-rotate-[1.5deg]', 'rotate-[1.8deg]', '-rotate-[0.8deg]', 'rotate-[1.2deg]'];

// ─── Video Lightbox ────────────────────────────────────────────────────────────
function VideoLightbox({ url, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-3xl w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <video
          src={url}
          controls
          autoPlay
          className="w-full max-h-[80vh] rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}

// ─── Comment section ───────────────────────────────────────────────────────────
function CommentSection({ postId, comments = [], currentUser, onCommentAdded }) {
  const [text, setText] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [replyTo, setReplyTo] = useState(null); // { commentId, authorName }
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await memoryWallApi.addComment(postId, text.trim(), isAnon);
      setLocalComments((prev) => [...prev, res.comment]);
      setText('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyTo) return;
    setIsSubmitting(true);
    try {
      await memoryWallApi.replyToComment(postId, replyTo.commentId, replyText.trim(), isAnon);
      setReplyText('');
      setReplyTo(null);
    } catch (err) {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-plum-900/10 dark:border-purple-800/30 space-y-2">
      {localComments.slice(-5).map((c) => (
        <div key={c._id} className="text-xs">
          <span className="font-bold text-plum-800 dark:text-purple-200">
            {c.isAnonymous ? 'Anonymous' : c.authorName}
          </span>
          <span className="text-plum-400 dark:text-purple-500 ml-1">({c.authorBatch})</span>
          <span className="ml-2 text-plum-700 dark:text-purple-300">{c.text}</span>
          <button
            onClick={() => setReplyTo({ commentId: c._id, authorName: c.authorName })}
            className="ml-2 text-rose-400 hover:text-rose-500 font-semibold transition-colors"
          >
            reply
          </button>
          {c.replies?.length > 0 && (
            <div className="ml-4 mt-1 space-y-1">
              {c.replies.map((r, ri) => (
                <div key={ri} className="text-xs">
                  <span className="font-bold text-plum-700 dark:text-purple-300">
                    ↳ {r.isAnonymous ? 'Anonymous' : r.authorName}
                  </span>
                  <span className="ml-2 text-plum-600 dark:text-purple-400">{r.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Reply form */}
      {replyTo && (
        <form onSubmit={submitReply} className="flex gap-1.5 mt-1">
          <span className="text-xs text-rose-400 font-semibold self-center whitespace-nowrap">
            ↳ @{replyTo.authorName}
          </span>
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Your reply..."
            maxLength={300}
            className="flex-1 px-2 py-1 text-xs rounded-lg border border-plum-900/20 dark:border-purple-800 bg-white dark:bg-[#150D2A] text-plum-900 dark:text-purple-100 focus:outline-none"
          />
          <button type="button" onClick={() => setReplyTo(null)} className="text-plum-400 hover:text-rose-500">
            <X className="w-3.5 h-3.5" />
          </button>
          <button type="submit" disabled={isSubmitting} className="text-rose-500 hover:text-rose-600 disabled:opacity-50">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Add comment */}
      <form onSubmit={submit} className="flex gap-1.5 mt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment... ✍️"
          maxLength={500}
          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-plum-900/20 dark:border-purple-800 bg-white dark:bg-[#150D2A] text-plum-900 dark:text-purple-100 focus:outline-none focus:border-rose-400"
        />
        <label className="flex items-center gap-1 text-xs text-plum-400 dark:text-purple-500 cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} className="w-3 h-3" />
          anon
        </label>
        <button type="submit" disabled={isSubmitting || !text.trim()} className="text-rose-500 hover:text-rose-600 disabled:opacity-30 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

// ─── Emoji Reaction Bar ────────────────────────────────────────────────────────
function ReactionBar({ postId, reactions = {}, onReacted }) {
  const [localReactions, setLocalReactions] = useState(reactions);
  const [popped, setPopped] = useState(null);

  const handleReact = async (emoji) => {
    setPopped(emoji);
    setTimeout(() => setPopped(null), 600);

    // Optimistic update
    setLocalReactions((prev) => {
      const current = prev[emoji] || { count: 0, reacted: false };
      return {
        ...prev,
        [emoji]: {
          count: current.reacted ? current.count - 1 : current.count + 1,
          reacted: !current.reacted
        }
      };
    });

    try {
      const res = await memoryWallApi.react(postId, emoji);
      setLocalReactions(res.reactions);
      if (onReacted) onReacted();
    } catch (err) {
      // revert on error
      setLocalReactions(reactions);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Object.entries(EMOJI_MAP).map(([key, { emoji, color }]) => {
        const r = localReactions[key] || { count: 0, reacted: false };
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleReact(key)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold transition-all duration-150 ${
              r.reacted
                ? 'bg-rose-100 dark:bg-rose-950/50 border-rose-400 text-rose-700 dark:text-rose-300'
                : 'bg-white dark:bg-[#150D2A] border-plum-900/15 dark:border-purple-800 text-plum-600 dark:text-purple-400 hover:scale-110'
            } ${popped === key ? 'scale-125' : ''}`}
            style={{ transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <span>{emoji}</span>
            {r.count > 0 && <span className={r.reacted ? 'text-rose-600' : ''}>{r.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Post Actions Menu ─────────────────────────────────────────────────────────
function PostActions({ postId, isOwner, isSaved, onSave, onReport, onDelete }) {
  const [open, setOpen] = useState(false);
  const [isSavedState, setIsSavedState] = useState(isSaved);

  const handleSave = async () => {
    try {
      const res = await memoryWallApi.savePost(postId);
      setIsSavedState(res.saved);
      if (onSave) onSave(res.saved);
    } catch { /* silent */ }
    setOpen(false);
  };

  const handleReport = async () => {
    try {
      await memoryWallApi.reportPost(postId, 'Reported by user');
      if (onReport) onReport();
    } catch { /* silent */ }
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this memory? Gone forever! 🗑️")) return;
    try {
      await memoryWallApi.deletePost(postId);
      if (onDelete) onDelete(postId);
    } catch { /* silent */ }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1 rounded-full text-plum-400 dark:text-purple-500 hover:text-plum-700 dark:hover:text-purple-300 hover:bg-plum-100 dark:hover:bg-purple-900/40 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-44 bg-white dark:bg-[#1A132B] border-2 border-plum-900/20 dark:border-purple-800 rounded-xl shadow-sticker overflow-hidden">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-display font-semibold text-plum-800 dark:text-purple-200 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSavedState ? 'fill-amber-500 text-amber-500' : ''}`} />
              {isSavedState ? 'Unsave' : 'Save to collection'}
            </button>
            {!isOwner && (
              <button
                onClick={handleReport}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-display font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />Report
              </button>
            )}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-display font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />Delete post
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main MemoryCard ───────────────────────────────────────────────────────────
export default function MemoryCard({ post, index, currentUser, onDeleted }) {
  const [showComments, setShowComments] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [localPost, setLocalPost] = useState(post);
  const videoRef = useRef(null);

  // Autoplay muted video when visible
  useEffect(() => {
    if (!videoRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const tiltClass = TILT_CLASSES[index % TILT_CLASSES.length];

  const images = (localPost.media || []).filter((m) => m.type === 'image');
  const video  = (localPost.media || []).find((m) => m.type === 'video');
  const isVideoCard = !!video;
  const isTextOnly  = !localPost.media?.length;

  const displayName = localPost.isAnonymous ? 'Anonymous 🎭' : localPost.authorName;

  // Card style selection
  if (isTextOnly) {
    // Sticky note card
    return (
      <>
        <div
          className={`sticky-note p-4 bg-amber-50 dark:bg-amber-950/30 ${tiltClass} hover:rotate-0 hover:!translate-y-[-4px] transition-all duration-200 group`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="font-handwriting text-xl text-plum-900 dark:text-amber-100 leading-snug line-clamp-6">
                "{localPost.caption}"
              </p>
            </div>
            <PostActions
              postId={localPost._id}
              isOwner={localPost.isOwner}
              isSaved={localPost.isSaved}
              onDelete={onDeleted}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] mt-3 pt-2 border-t border-amber-200 dark:border-amber-800">
            <span className="font-display font-bold text-plum-700 dark:text-amber-200">{displayName}</span>
            {localPost.mood && <span>{MOOD_EMOJI[localPost.mood]} {localPost.mood}</span>}
          </div>

          {localPost.spotTag?.spotName && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">
              <MapPin className="w-3 h-3" />{localPost.spotTag.spotName}
            </div>
          )}

          <ReactionBar
            postId={localPost._id}
            reactions={localPost.reactions}
          />

          <button
            onClick={() => setShowComments((s) => !s)}
            className="flex items-center gap-1 text-[10px] text-plum-500 dark:text-purple-400 hover:text-rose-500 mt-2 font-semibold transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            {localPost.comments?.length || 0} comments
            <ChevronDown className={`w-3 h-3 transition-transform ${showComments ? 'rotate-180' : ''}`} />
          </button>

          {showComments && (
            <CommentSection postId={localPost._id} comments={localPost.comments || []} currentUser={currentUser} />
          )}
        </div>
      </>
    );
  }

  if (isVideoCard) {
    // Film strip card
    return (
      <>
        {lightboxUrl && <VideoLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
        <div
          className={`polaroid-card p-0 overflow-hidden ${tiltClass} hover:rotate-0 transition-all duration-200 group`}
          style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Film strip top bar */}
          <div className="flex bg-plum-900 dark:bg-purple-950 px-2 py-1.5 gap-1.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-plum-700 dark:bg-purple-800 rounded-sm flex-shrink-0" />
            ))}
          </div>

          {/* Video thumbnail */}
          <div
            className="relative cursor-pointer"
            onClick={() => setLightboxUrl(video.url)}
          >
            {video.thumbnailUrl ? (
              <img src={video.thumbnailUrl} alt="video thumbnail" className="w-full h-48 object-cover" />
            ) : (
              <video
                ref={videoRef}
                src={video.url}
                muted
                loop
                playsInline
                className="w-full h-48 object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-plum-900 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* Film strip bottom bar */}
          <div className="flex bg-plum-900 dark:bg-purple-950 px-2 py-1.5 gap-1.5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-plum-700 dark:bg-purple-800 rounded-sm flex-shrink-0" />
            ))}
          </div>

          {/* Card body */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-display font-bold text-sm text-plum-900 dark:text-purple-100">{displayName}</span>
                {localPost.mood && <span className="ml-2 text-xs">{MOOD_EMOJI[localPost.mood]} {localPost.mood}</span>}
              </div>
              <PostActions postId={localPost._id} isOwner={localPost.isOwner} isSaved={localPost.isSaved} onDelete={onDeleted} />
            </div>
            {localPost.caption && (
              <p className="font-handwriting text-base text-plum-800 dark:text-purple-200 line-clamp-3 mb-2">
                {localPost.caption}
              </p>
            )}
            {localPost.spotTag?.spotName && (
              <div className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 mb-2">
                <MapPin className="w-3 h-3" />{localPost.spotTag.spotName}
              </div>
            )}
            <ReactionBar postId={localPost._id} reactions={localPost.reactions} />
            <button
              onClick={() => setShowComments((s) => !s)}
              className="flex items-center gap-1 text-xs text-plum-500 dark:text-purple-400 hover:text-rose-500 mt-2 font-semibold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {localPost.comments?.length || 0} comments
              <ChevronDown className={`w-3 h-3 transition-transform ${showComments ? 'rotate-180' : ''}`} />
            </button>
            {showComments && (
              <CommentSection postId={localPost._id} comments={localPost.comments || []} currentUser={currentUser} />
            )}
          </div>
        </div>
      </>
    );
  }

  // Polaroid photo card
  const washi = ['washi-tape-pink', 'washi-tape-mint', 'washi-tape-lilac'][index % 3];
  return (
    <div
      className={`polaroid-card p-4 relative ${tiltClass} hover:rotate-0 transition-all duration-200 group`}
      style={{ transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {/* Washi tape */}
      <div className={`washi-tape ${washi}`} />

      {/* Top meta */}
      <div className="flex items-center justify-between text-xs text-plum-500 dark:text-purple-400 mt-2 mb-3">
        <span className="font-display font-bold">{displayName}</span>
        <div className="flex items-center gap-1">
          {localPost.mood && <span>{MOOD_EMOJI[localPost.mood]}</span>}
          <PostActions postId={localPost._id} isOwner={localPost.isOwner} isSaved={localPost.isSaved} onDelete={onDeleted} />
        </div>
      </div>

      {/* Image grid */}
      <div className={`rounded-xl overflow-hidden border-2 border-plum-900/20 dark:border-purple-800 mb-3 ${
        images.length === 1 ? '' : 'grid grid-cols-2 gap-0.5'
      }`}>
        {images.slice(0, 4).map((img, i) => (
          <div key={i} className="relative">
            <img
              src={img.url}
              alt={`memory ${i + 1}`}
              className={`w-full object-cover group-hover:brightness-105 transition-all cursor-pointer ${
                images.length === 1 ? 'h-52' : 'h-32'
              }`}
              loading="lazy"
            />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Caption */}
      {localPost.caption && (
        <p className="font-handwriting text-lg text-plum-900 dark:text-purple-100 line-clamp-3 mb-2">
          {localPost.caption}
        </p>
      )}

      {/* Spot + date */}
      <div className="flex items-center gap-3 text-[10px] text-plum-400 dark:text-purple-500 mb-2">
        {localPost.spotTag?.spotName && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-3 h-3" />{localPost.spotTag.spotName}
          </span>
        )}
        {localPost.throwbackDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(localPost.throwbackDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Reactions */}
      <ReactionBar postId={localPost._id} reactions={localPost.reactions} />

      {/* Comments toggle */}
      <button
        onClick={() => setShowComments((s) => !s)}
        className="flex items-center gap-1 text-xs text-plum-500 dark:text-purple-400 hover:text-rose-500 mt-2 font-semibold transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {localPost.comments?.length || 0} comments
        <ChevronDown className={`w-3 h-3 transition-transform ${showComments ? 'rotate-180' : ''}`} />
      </button>

      {showComments && (
        <CommentSection postId={localPost._id} comments={localPost.comments || []} currentUser={currentUser} />
      )}
    </div>
  );
}

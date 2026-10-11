import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, Film, Image as ImageIcon, MapPin, Calendar, Eye, UserX, AlertCircle } from 'lucide-react';
import Capsy from '../common/Capsy';
import { memoryWallApi } from '../../services/api';

const MOODS = ['Funny', 'Emotional', 'Fest', 'Canteen', 'Class', 'Hostel', 'Farewell'];
const MOOD_COLORS = {
  Funny: 'bg-amber-100 text-amber-800 border-amber-400',
  Emotional: 'bg-rose-100 text-rose-800 border-rose-400',
  Fest: 'bg-purple-100 text-purple-800 border-purple-400',
  Canteen: 'bg-orange-100 text-orange-800 border-orange-400',
  Class: 'bg-blue-100 text-blue-800 border-blue-400',
  Hostel: 'bg-teal-100 text-teal-800 border-teal-400',
  Farewell: 'bg-pink-100 text-pink-800 border-pink-400'
};
const MOOD_EMOJI = {
  Funny: '😂', Emotional: '😭', Fest: '🎉', Canteen: '☕',
  Class: '📚', Hostel: '🌙', Farewell: '🎓'
};

export default function PinMemoryModal({ onClose, onPosted, spots = [], user, initialSpotId = '' }) {
  const [caption, setCaption] = useState('');
  const [mood, setMood] = useState('');
  const [spotId, setSpotId] = useState(initialSpotId || '');
  const [throwbackDate, setThrowbackDate] = useState('');
  const [visibility, setVisibility] = useState('college');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [files, setFiles] = useState([]); // { file, preview, type }
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef();

  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
  const MAX_SIZE = 50 * 1024 * 1024;

  const processFiles = useCallback((incoming) => {
    setError('');
    const newFiles = [...incoming];
    const currentImages = files.filter((f) => f.type === 'image');
    const currentVideos = files.filter((f) => f.type === 'video');

    const results = [];
    for (const file of newFiles) {
      if (!ALLOWED.includes(file.type)) {
        setError(`"${file.name}" — only JPG, PNG, WEBP images and MP4/WEBM videos are allowed.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`That file is huge. Keep it under 50 MB. 📦`);
        continue;
      }
      const isVideo = file.type.startsWith('video/');
      if (isVideo && currentVideos.length + results.filter(r => r.type === 'video').length >= 1) {
        setError("Only one video per post allowed. One is enough for the drama. 🎬");
        continue;
      }
      if (!isVideo && currentImages.length + results.filter(r => r.type === 'image').length >= 5) {
        setError("Max 5 images per post. Quality over quantity! 📸");
        continue;
      }

      // Check video duration (max 30 seconds)
      if (isVideo) {
        const previewUrl = URL.createObjectURL(file);
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.onloadedmetadata = () => {
          if (videoElement.duration > 30.5) {
            setError("That video is huge. Keep it under 30 seconds.");
            setFiles((prev) => prev.filter((f) => f.file !== file));
          }
        };
        videoElement.src = previewUrl;
        results.push({ file, preview: previewUrl, type: 'video' });
      } else {
        results.push({ file, preview: URL.createObjectURL(file), type: 'image' });
      }
    }
    setFiles((prev) => [...prev, ...results]);
  }, [files]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const handleFileInput = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim() && files.length === 0) {
      setError('Add a caption or some photos/videos to post! 📝');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const fd = new FormData();
      fd.append('caption', caption.trim());
      fd.append('mood', mood);
      fd.append('spotId', spotId);
      fd.append('throwbackDate', throwbackDate);
      fd.append('visibility', visibility);
      fd.append('isAnonymous', isAnonymous);
      files.forEach((f) => fd.append('media', f.file));

      const res = await memoryWallApi.createPost(fd, (progressEvent) => {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(pct);
      });

      setSuccess(res.message || 'Pinned! 🎉');
      setTimeout(() => {
        if (onPosted) onPosted(res.post);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-900/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto polaroid-card p-0 relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#1A132B] border-b-2 border-plum-900/20 dark:border-purple-800/40 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <Capsy expression="waving" size="sm" />
            <div>
              <h2 className="font-display font-bold text-xl text-plum-900 dark:text-purple-100">Pin a Memory 📌</h2>
              <p className="text-xs font-handwriting text-plum-600 dark:text-purple-400">No seal. No lock. Just vibes.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors">
            <X className="w-5 h-5 text-plum-700 dark:text-purple-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Caption */}
          <div>
            <textarea
              id="memory-caption"
              rows={3}
              maxLength={1000}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What happened today that you'll never forget? 🌟"
              className="w-full px-4 py-3 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-[#FFFBF5] dark:bg-[#150D2A] font-handwriting text-lg text-plum-900 dark:text-purple-100 placeholder:text-plum-400 dark:placeholder:text-purple-600 focus:outline-none focus:border-rose-400 resize-none transition-colors"
            />
            <div className="text-right text-xs text-plum-400 dark:text-purple-600 mt-1 font-mono">{caption.length}/1000</div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all text-center ${
              isDragging
                ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 scale-[1.01]'
                : 'border-plum-900/30 dark:border-purple-700 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm"
              className="hidden"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2 text-plum-400 dark:text-purple-500">
                <ImageIcon className="w-6 h-6" />
                <Film className="w-6 h-6" />
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-display font-semibold text-plum-700 dark:text-purple-300 text-sm">
                Drop photos & videos here, or click to browse
              </p>
              <p className="text-xs text-plum-400 dark:text-purple-600">
                Up to 5 images • 1 video (max 30s) • JPG, PNG, WEBP, MP4, WEBM • 50 MB limit
              </p>
            </div>

            {/* File previews */}
            {files.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                {files.map((f, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-plum-900/30 dark:border-purple-700 group">
                    {f.type === 'image' ? (
                      <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-plum-900/80 dark:bg-purple-950 flex flex-col items-center justify-center">
                        <Film className="w-5 h-5 text-white" />
                        <span className="text-[10px] text-purple-200 mt-1 font-mono">video</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mood Chips */}
          <div>
            <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-2">
              Mood 🎭
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? '' : m)}
                  className={`px-3 py-1 rounded-full border-2 text-xs font-display font-bold transition-all ${
                    mood === m
                      ? MOOD_COLORS[m] + ' scale-110 shadow-sm'
                      : 'bg-white dark:bg-[#150D2A] border-plum-900/20 dark:border-purple-800 text-plum-700 dark:text-purple-300 hover:scale-105'
                  }`}
                >
                  {MOOD_EMOJI[m]} {m}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: spot, date, visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Spot Tag */}
            <div>
              <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3 inline mr-1" />Spot Tag
              </label>
              <select
                value={spotId}
                onChange={(e) => setSpotId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm text-plum-900 dark:text-purple-100 focus:outline-none focus:border-rose-400"
              >
                <option value="">No spot (everywhere ✨)</option>
                {spots.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Throwback date */}
            <div>
              <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />Throwback Date
              </label>
              <input
                type="date"
                value={throwbackDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setThrowbackDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm text-plum-900 dark:text-purple-100 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* Visibility + Anonymous */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                <Eye className="w-3 h-3 inline mr-1" />Visible to
              </label>
              <div className="flex gap-2">
                {[['college', '🏫 Whole College'], ['batch', `👩‍🎓 My Batch (${user?.batch})`]].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setVisibility(val)}
                    className={`px-3 py-1.5 rounded-full border-2 text-xs font-display font-bold transition-all ${
                      visibility === val
                        ? 'bg-plum-900 dark:bg-purple-600 text-white border-plum-900 dark:border-purple-600 scale-105'
                        : 'bg-white dark:bg-[#150D2A] border-plum-900/30 dark:border-purple-700 text-plum-700 dark:text-purple-300 hover:scale-105'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none mt-1 sm:mt-5">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full border-2 transition-colors ${isAnonymous ? 'bg-rose-400 border-rose-500' : 'bg-gray-200 dark:bg-purple-900 border-gray-300 dark:border-purple-700'}`} />
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-gray-300 transition-transform ${isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs font-display font-bold text-plum-700 dark:text-purple-300 flex items-center gap-1">
                <UserX className="w-3.5 h-3.5" />Post anonymously
              </span>
            </label>
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-plum-600 dark:text-purple-400">
                <span>Uploading your memories... 📤</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-plum-100 dark:bg-purple-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl text-center">
              <p className="text-sm font-display font-bold text-emerald-800 dark:text-emerald-300">{success}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-sticker bg-gradient-to-r from-rose-500 to-purple-600 text-white py-3 text-sm font-bold shadow-sticker disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Pinning to the wall...
              </span>
            ) : '📌 Pin this Memory'}
          </button>
        </form>
      </div>
    </div>
  );
}

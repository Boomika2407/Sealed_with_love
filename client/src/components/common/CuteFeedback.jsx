import React from 'react';
import Capsy from './Capsy';
import { X, AlertCircle } from 'lucide-react';

/**
 * CuteLoadingScreen - Capsy running in place with "Dusting off your memories…"
 */
export function CuteLoadingScreen({ text = 'Dusting off your memories…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none">
      <div className="relative mb-3">
        <Capsy expression="running" size="lg" />
      </div>
      <h3 className="font-display font-bold text-xl text-plum-900 dark:text-purple-100 tracking-wide mt-2">
        {text}
      </h3>
      <p className="font-handwriting text-base text-plum-600 dark:text-purple-400 mt-1">
        fetching letters, polaroids, and campus memories ✨
      </p>
    </div>
  );
}

/**
 * Cute404 - Capsy with graduation cap thrown in the air and "This page graduated early."
 */
export function Cute404({ onHome }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto select-none">
      <div className="relative mb-4">
        <Capsy expression="graduated" size="xl" speech="Whoops! 🎓" />
      </div>
      <span className="text-4xl font-display font-bold text-plum-900 dark:text-purple-200">
        404
      </span>
      <h3 className="font-display font-bold text-2xl text-plum-900 dark:text-purple-100 mt-1">
        This page graduated early.
      </h3>
      <p className="font-body text-sm text-plum-700 dark:text-purple-300 mt-2">
        The memory or route you are looking for has already completed its finals and moved on.
      </p>
      {onHome && (
        <button
          onClick={onHome}
          className="mt-6 btn-sticker bg-plum-900 text-white dark:bg-purple-600 px-6 py-2.5 text-sm font-bold shadow-sticker"
        >
          Return to Scrapbook 💌
        </button>
      )}
    </div>
  );
}

/**
 * CuteErrorToast - "Something broke. It wasn't you. Probably."
 */
export function CuteErrorToast({ title, message, onClose }) {
  if (!message && !title) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] sm:w-auto bg-[#FFF5F7] dark:bg-dorm-card border-2.5 border-plum-900 dark:border-rose-600 rounded-2xl shadow-sticker-lg p-4 flex items-start gap-3 text-plum-900 dark:text-purple-100 animate-bounce-gentle">
      <div className="flex-shrink-0 -mt-1">
        <Capsy expression="shocked" size="sm" />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h5 className="font-display font-bold text-sm text-rose-600 dark:text-rose-400">
          {title || "Something broke. It wasn't you. Probably."}
        </h5>
        <p className="text-xs text-plum-700 dark:text-purple-300 mt-0.5 leading-relaxed break-words">
          {message}
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { Heart, Moon, Sun, Sparkles, LogOut, PlusCircle, Compass, Grid, Pin } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode
}) {
  const navItems = user ? [
    { key: 'dashboard', label: 'Capsules 💌', icon: Grid },
    { key: 'memory-wall', label: 'Wall 📌', icon: Pin },
    { key: 'create', label: '+ Seal Memory', icon: PlusCircle },
    { key: 'admin', label: 'Admin ⚙️', icon: null }
  ] : [];

  const mobileNavItems = user ? [
    { key: 'dashboard', label: 'Capsules 💌' },
    { key: 'memory-wall', label: 'Wall 📌' },
    { key: 'create', label: '+Seal' },
    { key: 'admin', label: 'Admin' }
  ] : [];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#FFF5F7]/85 dark:bg-[#0F0B18]/85 border-b-2 border-plum-900/15 dark:border-purple-900/40 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-full bg-rose-500 border-2 border-plum-900 shadow-sticker flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <span className="text-xl">💌</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-2xl tracking-wide text-plum-900 dark:text-purple-100 leading-none">
                Sealed
              </h1>
              <span className="text-xs bg-blush-200 dark:bg-purple-900/60 text-plum-900 dark:text-purple-200 font-bold px-2 py-0.5 rounded-full border border-plum-900/30">
                Campus
              </span>
            </div>
            <p className="font-handwriting text-sm text-plum-700 dark:text-purple-300 -mt-0.5 leading-none">
              sealed with love, opened on time
            </p>
          </div>
        </div>

        {/* Center Nav Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 bg-white/70 dark:bg-dorm-card/80 p-1.5 rounded-full border-2 border-plum-900/30 dark:border-purple-800/50 shadow-sm flex-wrap justify-center">
            {navItems.map(({ key, label }) => (
              <button
                key={key}
                id={`nav-${key}`}
                onClick={() => setCurrentTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display text-xs sm:text-sm font-semibold transition-all ${
                  currentTab === key
                    ? 'bg-plum-900 text-white dark:bg-purple-600 shadow-sm'
                    : 'text-plum-900 dark:text-purple-200 hover:bg-blush-100 dark:hover:bg-purple-950/60'
                } ${key === 'memory-wall' ? 'ring-2 ring-offset-1 ring-rose-300 dark:ring-rose-700' : ''}`}
              >
                {key === 'memory-wall' && <span className="text-[11px]">📌</span>}
                {label.replace('📌 ', '')}
              </button>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Day Scrapbook' : 'Switch to Midnight Dorm'}
            className="w-9 h-9 rounded-full bg-white dark:bg-dorm-card border-2 border-plum-900 dark:border-purple-600 flex items-center justify-center text-plum-900 dark:text-purple-200 hover:scale-105 active:scale-95 transition-transform shadow-sticker"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-plum-900" />}
          </button>

          {/* User profile or Logout */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="font-display font-semibold text-xs leading-none text-plum-900 dark:text-purple-200">
                  {user.name}
                </span>
                <span className="font-body text-[10px] text-plum-600 dark:text-purple-400">
                  {user.batch}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Log out"
                id="logout-btn"
                className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/60 border-2 border-plum-900 dark:border-rose-700 flex items-center justify-center text-rose-700 dark:text-rose-300 hover:scale-105 active:scale-95 transition-transform shadow-sticker"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      {user && (
        <div className="flex md:hidden justify-around mt-2 pt-2 border-t border-plum-900/10 dark:border-purple-900/30 overflow-x-auto gap-1">
          {mobileNavItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrentTab(key)}
              className={`font-display text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap transition-all ${
                currentTab === key
                  ? 'bg-plum-900 text-white dark:bg-purple-600'
                  : 'text-plum-800 dark:text-purple-200'
              } ${key === 'memory-wall' ? 'ring-1 ring-rose-300 dark:ring-rose-700' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

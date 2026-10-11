import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, GraduationCap } from 'lucide-react';
import Capsy from '../components/common/Capsy';
import { PushPin } from '../components/common/ScrapbookAccents';

export default function AuthModal({ onLogin, onRegister, isLoading, error }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [batch, setBatch] = useState('2024-2028');
  const [college, setCollege] = useState('Coimbatore Institute of Technology');

  // Quick fill sample student account for easy testing
  const handleSampleStudent = () => {
    setIsRegister(false);
    setEmail('boomika@college.edu');
    setPassword('securePassword123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      onRegister({ name, email, password, batch, college });
    } else {
      onLogin({ email, password });
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 relative select-none">
      {/* Push Pin decorative anchor */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <PushPin color="#F43F5E" size={26} />
      </div>

      <div className="washi-tape washi-tape-pink" />

      {/* Main Scrapbook Card */}
      <div className="polaroid-card p-6 sm:p-8 relative bg-white/95 dark:bg-dorm-card/95 shadow-sticker-lg">
        {/* Header with Mascot Capsy */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Capsy
            expression="waving"
            size="md"
            speech="Psst, your letter is waiting! 💌"
          />

          <h2 className="font-display font-bold text-2xl text-plum-900 dark:text-purple-100 tracking-wide mt-3">
            {isRegister ? 'Join Campus Scrapbook' : 'Welcome Back to Sealed'}
          </h2>
          <p className="font-handwriting text-base text-plum-700 dark:text-purple-300 mt-0.5">
            {isRegister
              ? 'Lock memories today, unlock on graduation day'
              : 'Sign in to visit your digital campus vault'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-plum-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Boomika"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm focus:outline-none focus:border-plum-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
              College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-plum-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@cit.edu.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm focus:outline-none focus:border-plum-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-plum-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm focus:outline-none focus:border-plum-900"
              />
            </div>
          </div>

          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                  Batch
                </label>
                <input
                  type="text"
                  required
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-display font-bold text-plum-900 dark:text-purple-200 uppercase tracking-wider mb-1">
                  College
                </label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-plum-900/30 dark:border-purple-700 bg-white dark:bg-[#150D2A] text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-sticker bg-plum-900 text-white dark:bg-purple-600 py-3 text-sm font-bold shadow-sticker disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Dusting off memories...' : isRegister ? 'Create Student Account 🎓' : 'Enter Campus 💌'}
          </button>
        </form>

        {/* Quick Fill Sample Account Button */}
        <div className="mt-4 pt-3 border-t border-plum-900/10 dark:border-purple-800/40">
          <button
            type="button"
            onClick={handleSampleStudent}
            className="w-full btn-sticker bg-amber-100 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 py-2 text-xs font-bold border-amber-500"
          >
            🌱 Fill Sample Account (boomika@college.edu)
          </button>
        </div>

        {/* Toggle mode */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="font-handwriting text-base text-rose-600 dark:text-rose-400 hover:underline"
          >
            {isRegister
              ? 'Already sealed capsules? Log in here'
              : 'New student? Register your campus locker'}
          </button>
        </div>
      </div>
    </div>
  );
}

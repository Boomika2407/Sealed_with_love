import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import CreateCapsule from './pages/CreateCapsule';
import CampusWall from './pages/CampusWall';
import MemoryWall from './pages/MemoryWall';
import AdminSpots from './pages/AdminSpots';
import AuthModal from './pages/AuthModal';
import CustomCursor from './components/common/CustomCursor';
import { FloatingStickersBackground } from './components/common/StickerDoodles';
import { CuteLoadingScreen, Cute404, CuteErrorToast } from './components/common/CuteFeedback';
import { authApi, capsuleApi, wallApi, spotApi, memoryWallApi } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  // Campus & Spots real location data
  const [campus, setCampus] = useState(null);
  const [spots, setSpots] = useState([]);

  // Capsule lists
  const [capsules, setCapsules] = useState([]);
  const [wallCapsules, setWallCapsules] = useState([]);
  const [activeCapsule, setActiveCapsule] = useState(null);

  // Unlock and Action states
  const [isLoadingUnlock, setIsLoadingUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState(null);
  const [isSubmittingCapsule, setIsSubmittingCapsule] = useState(false);

  // Share to Memory Wall toast
  const [shareToast, setShareToast] = useState(null);

  // Apply dark mode class to root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial user authentication & campus loading
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('sealed_auth_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
        } catch {
          localStorage.removeItem('sealed_auth_token');
        }
      }
      setAuthLoading(false);
    };

    initApp();
    fetchCampusAndSpots();
  }, []);

  const fetchCampusAndSpots = async () => {
    try {
      const [campusRes, spotsRes] = await Promise.all([
        spotApi.getCampus(),
        spotApi.getSpots()
      ]);
      setCampus(campusRes.campus);
      setSpots(spotsRes.spots || []);
    } catch (err) {
      console.warn('Failed to load campus and spots:', err);
    }
  };

  // Fetch student capsules & wall when user is logged in
  const fetchCapsules = async () => {
    try {
      const res = await capsuleApi.getMyCapsules();
      setCapsules(res.capsules || []);
    } catch (err) {
      console.error('Failed to load my capsules:', err);
    }
  };

  const fetchWall = async () => {
    try {
      const res = await wallApi.getWall();
      setWallCapsules(res.capsules || []);
    } catch (err) {
      console.error('Failed to load campus wall:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCapsules();
      fetchWall();
    }
  }, [user]);

  // Auth Handlers
  const handleLogin = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('sealed_auth_token', res.token);
      setUser(res.user);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async ({ name, email, password, batch, college }) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await authApi.register({ name, email, password, batch, college });
      localStorage.setItem('sealed_auth_token', res.token);
      setUser(res.user);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed. Try college email.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sealed_auth_token');
    setUser(null);
    setCurrentTab('dashboard');
    setActiveCapsule(null);
  };

  // Capsule Creation Handler with Confetti & Hearts
  const handleCreateCapsule = async (formData) => {
    setIsSubmittingCapsule(true);
    try {
      const res = await capsuleApi.create(formData);

      // Sweet celebratory confetti burst!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FDA4AF', '#C084FC', '#FDE047', '#BBF7D0']
      });

      await fetchCapsules();
      setCurrentTab('dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to seal capsule. Please try again.');
    } finally {
      setIsSubmittingCapsule(false);
    }
  };

  // Wall reaction handler
  const handleReactCapsule = async (id) => {
    try {
      await capsuleApi.react(id);
      await fetchWall();
      await fetchCapsules();
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  // Share unlocked capsule to Memory Wall
  const handleShareCapsuleToMemoryWall = async (capsuleId, caption) => {
    try {
      const res = await memoryWallApi.shareCapsule(capsuleId, caption);
      setShareToast(res.message || 'Capsule shared to Memory Wall! 🎉');
      setTimeout(() => setShareToast(null), 3500);
      setCurrentTab('memory-wall');
    } catch (err) {
      setShareToast('Failed to share. ' + (err.response?.data?.message || 'Try again!'));
      setTimeout(() => setShareToast(null), 3500);
    }
  };

  // Pure Real GPS & Server UTC Unlock Handler
  const handleAttemptUnlock = (capsuleId) => {
    setIsLoadingUnlock(true);
    setUnlockError(null);

    const submitUnlock = async (coords) => {
      try {
        const payload = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy || 10
        };

        const res = await capsuleApi.unlock(capsuleId, payload);

        // SUCCESS! Burst Confetti & hearts
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#F43F5E', '#EC4899', '#A855F7', '#FBBF24']
        });

        // Update active capsule with unlocked letter
        setActiveCapsule(res.capsule);

        // Refresh lists
        await fetchCapsules();
        await fetchWall();
      } catch (err) {
        const data = err.response?.data;
        const status = err.response?.status;

        if (status === 403) {
          setUnlockError({
            title: data.error === 'TIME_LOCKED' ? 'Too Early! ⏳' : 'Wrong Location! 📍',
            message: data.message || 'Unlock conditions not met.'
          });
        } else if (status === 429) {
          setUnlockError({
            title: 'Rate Limited! 🛑',
            message: data.message || 'Chill! You are attempting unlock requests too rapidly.'
          });
        } else {
          setUnlockError({
            title: "Something broke. It wasn't you. Probably.",
            message: data?.message || 'Server error while validating unlock.'
          });
        }
      } finally {
        setIsLoadingUnlock(false);
      }
    };

    // Strict Real Browser GPS check
    if (!navigator.geolocation) {
      setIsLoadingUnlock(false);
      setUnlockError({
        title: 'No GPS Hardware Detected',
        message: 'Your browser or device does not support geolocation. A real GPS reading is required to verify campus spot presence.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        submitUnlock({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (geoError) => {
        setIsLoadingUnlock(false);
        setUnlockError({
          title: 'GPS Location Needed 📍',
          message:
            'Please allow location permission in your browser to verify that you are physically standing at the target campus spot.'
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const VALID_TABS = ['dashboard', 'create', 'wall', 'memory-wall', 'admin'];

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-200">
      {/* Desktop Sparkle Trail Custom Cursor */}
      <CustomCursor />

      {/* Floating Scrapbook Doodle Stickers */}
      <FloatingStickersBackground />

      {/* Main Navbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 z-10 relative">
        {authLoading ? (
          <CuteLoadingScreen text="Dusting off your memories…" />
        ) : !user ? (
          <AuthModal
            onLogin={handleLogin}
            onRegister={handleRegister}
            isLoading={authLoading}
            error={authError}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                capsules={capsules}
                onOpenCreate={() => setCurrentTab('create')}
                onUnlockCapsule={handleAttemptUnlock}
                onReactCapsule={handleReactCapsule}
                isLoadingUnlock={isLoadingUnlock}
                activeCapsule={activeCapsule}
                setActiveCapsule={setActiveCapsule}
                unlockError={unlockError}
                setUnlockError={setUnlockError}
                onShareToMemoryWall={handleShareCapsuleToMemoryWall}
              />
            )}

            {currentTab === 'create' && (
              <CreateCapsule
                onBack={() => setCurrentTab('dashboard')}
                onCapsuleCreated={handleCreateCapsule}
                isSubmitting={isSubmittingCapsule}
                campus={campus}
                spots={spots}
              />
            )}

            {(currentTab === 'wall' || currentTab === 'memory-wall') && (
              <MemoryWall
                user={user}
                spots={spots}
              />
            )}

            {currentTab === 'admin' && (
              <AdminSpots
                campus={campus}
                spots={spots}
                onRefresh={fetchCampusAndSpots}
                onBack={() => setCurrentTab('dashboard')}
              />
            )}

            {!VALID_TABS.includes(currentTab) && (
              <Cute404 onHome={() => setCurrentTab('dashboard')} />
            )}
          </>
        )}
      </main>

      {/* Unlock Error Toast */}
      {unlockError && (
        <CuteErrorToast
          title={unlockError.title}
          message={unlockError.message}
          onClose={() => setUnlockError(null)}
        />
      )}

      {/* Share to Memory Wall toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border-2 border-emerald-400 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-display font-bold text-sm shadow-sticker">
          {shareToast}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-plum-900/10 dark:border-purple-900/30 py-6 text-center text-xs text-plum-600 dark:text-purple-400 z-10 relative">
        <p className="font-display font-semibold">
          💌 Sealed • College Time Capsule Network
        </p>
        <p className="font-mono text-[11px] opacity-75 mt-0.5">
          Server-Enforced Access Control • AES-256-GCM • GeoJSON Proximity
        </p>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Sparkles, Image, Lock, ShieldCheck, ArrowLeft, Heart, ShieldAlert } from 'lucide-react';
import LocationPicker from '../components/capsule/LocationPicker';
import { isPointInsideCampus } from '../utils/clientTurf';

export default function CreateCapsule({
  onBack,
  onCapsuleCreated,
  isSubmitting,
  campus,
  spots = []
}) {
  const [capsuleType, setCapsuleType] = useState('FRESHERS_LETTER');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // 4-year default for freshers letter
  const defaultFutureDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 4);
    return d.toISOString().split('T')[0];
  };

  const [unlockDate, setUnlockDate] = useState(defaultFutureDate());

  // Location Picker State
  const [pickerMode, setPickerMode] = useState('named'); // 'named' or 'custom'
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [customCoords, setCustomCoords] = useState(null);
  const [customLocationName, setCustomLocationName] = useState('My Secret Campus Corner');
  const [radiusMeters, setRadiusMeters] = useState(60);

  const [visibility, setVisibility] = useState('PUBLIC_WALL');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [themeColor, setThemeColor] = useState('blush');

  // Initialize selected spot when spots prop loads
  useEffect(() => {
    if (spots && spots.length > 0 && !selectedSpot) {
      const gate = spots.find((s) => s.category === 'gate') || spots[0];
      setSelectedSpot(gate);
      setRadiusMeters(gate.radiusMeters || 60);
    }
  }, [spots]);

  // Handle capsule type quick pre-sets
  const handleTypeChange = (type) => {
    setCapsuleType(type);
    if (type === 'FRESHERS_LETTER') {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 4);
      setUnlockDate(d.toISOString().split('T')[0]);
      setTitle("A Note to My Future Graduating Self 🎓");

      const gate = spots.find((s) => s.category === 'gate') || spots[0];
      if (gate) {
        setPickerMode('named');
        setSelectedSpot(gate);
        setRadiusMeters(gate.radiusMeters || 50);
      }
    } else if (type === 'BATCH_FAREWELL') {
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setUnlockDate(d.toISOString().split('T')[0]);
      setTitle("Final Year Batch Memories & Goodbyes ✨");

      const iconic = spots.find((s) => s.category === 'iconic') || spots[0];
      if (iconic) {
        setPickerMode('named');
        setSelectedSpot(iconic);
        setRadiusMeters(iconic.radiusMeters || 65);
      }
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setUnlockDate(d.toISOString().split('T')[0]);
      setTitle("Canteen Chai Chronicles ☕");

      const canteen = spots.find((s) => s.category === 'canteen') || spots[0];
      if (canteen) {
        setPickerMode('named');
        setSelectedSpot(canteen);
        setRadiusMeters(canteen.radiusMeters || 75);
      }
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !message || !unlockDate) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('capsuleType', capsuleType);
    formData.append('message', message);
    formData.append('unlockDate', new Date(unlockDate).toISOString());
    formData.append('visibility', visibility);
    formData.append('themeColor', themeColor);

    if (pickerMode === 'named' && selectedSpot) {
      formData.append('spotId', selectedSpot._id);
      formData.append('locationName', selectedSpot.name);
      formData.append('latitude', selectedSpot.location.coordinates[1]);
      formData.append('longitude', selectedSpot.location.coordinates[0]);
      formData.append('radiusMeters', radiusMeters || selectedSpot.radiusMeters || 100);
    } else if (pickerMode === 'custom' && customCoords) {
      // Validate client-side first
      if (campus?.boundary && !isPointInsideCampus(customCoords.lon, customCoords.lat, campus.boundary)) {
        alert("Whoa! Custom pin is outside campus boundary polygon. Please drag the pin inside the campus!");
        return;
      }
      formData.append('locationName', customLocationName || 'Custom Campus Corner');
      formData.append('latitude', customCoords.lat);
      formData.append('longitude', customCoords.lon);
      formData.append('radiusMeters', radiusMeters || 100);
    } else {
      alert("Please select a valid campus spot or drop a custom pin!");
      return;
    }

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    onCapsuleCreated(formData);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-sticker bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200 px-3 py-1.5 text-xs flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <span className="font-handwriting text-lg text-plum-700 dark:text-purple-300">
          ✨ "Don't even think about peeking."
        </span>
      </div>

      {/* Main Scrapbook Form Card */}
      <div className="bg-[#FFFDF9] dark:bg-[#1A132B] border-3 border-plum-900 dark:border-purple-600 rounded-2xl p-6 sm:p-8 shadow-sticker-lg relative">
        <div className="washi-tape washi-tape-pink" />

        <div className="mb-6 border-b-2 border-plum-900/10 dark:border-purple-800/40 pb-4">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-plum-900 dark:text-purple-100">
            Seal a Time Capsule 💌
          </h2>
          <p className="text-xs text-plum-700 dark:text-purple-300 mt-1">
            Real College Campus: <strong>{campus?.name || 'Campus'}</strong> • Protected with server-enforced access control & AES-256-GCM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Capsule Type */}
          <div>
            <label className="block font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200 mb-2">
              1. Select Capsule Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'FRESHERS_LETTER',
                  label: "Freshers' Letter",
                  sub: 'Note to 4-year future self',
                  icon: '🌱'
                },
                {
                  id: 'BATCH_FAREWELL',
                  label: 'Batch Farewell',
                  sub: 'Shared alumni farewell memory',
                  icon: '🎓'
                },
                {
                  id: 'CLASS_MEMORY',
                  label: 'Class Memory',
                  sub: 'Spot memory (e.g. Canteen)',
                  icon: '📸'
                }
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    capsuleType === t.id
                      ? 'border-plum-900 bg-blush-100 dark:bg-purple-900/60 shadow-sticker'
                      : 'border-plum-900/20 bg-white dark:bg-dorm-card hover:bg-blush-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{t.icon}</div>
                  <h4 className="font-display font-bold text-sm text-plum-900 dark:text-purple-200">
                    {t.label}
                  </h4>
                  <p className="text-[11px] text-plum-600 dark:text-purple-400">{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Title & Unlock Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200 mb-1">
                2. Capsule Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. To My Senior Year Self"
                className="w-full px-3 py-2 rounded-xl border-2 border-plum-900 dark:border-purple-700 bg-white dark:bg-dorm-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200 mb-1">
                3. Unlock Date (Server Clock)
              </label>
              <input
                type="date"
                required
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-plum-900 dark:border-purple-700 bg-white dark:bg-dorm-card font-body text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          {/* 3. Handwritten Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200">
                4. Your Secret Letter (AES-256 Encrypted)
              </label>
              <span className="text-[11px] font-handwriting text-rose-600 dark:text-rose-400 text-base">
                ✍️ Preview in handwriting font below
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dear Future Me, do not forget how nervous you were on Day 1..."
              className="w-full px-4 py-3 rounded-xl border-2 border-plum-900 dark:border-purple-700 bg-[#FFFDF7] dark:bg-[#251A3E] font-handwriting text-2xl text-plum-950 dark:text-purple-100 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-y"
            />
          </div>

          {/* 4. Optional Photo Upload (Private / Authenticated) */}
          <div>
            <label className="block font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200 mb-1">
              5. Attach a Polaroid Photo (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="btn-sticker bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200 px-4 py-2 text-xs cursor-pointer flex items-center gap-1.5">
                <Image className="w-4 h-4 text-rose-500" />
                <span>Upload Memory Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="polaroid-card p-2 max-w-[140px] relative">
                  <div className="washi-tape washi-tape-mint !w-12 !h-3 !-top-1.5" />
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-24 object-cover rounded"
                  />
                  <span className="block text-[10px] text-center font-handwriting text-plum-700 mt-1">
                    Attached! 📸
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 5. Campus Spot Picker (Real Campus Satellite & Turf.js Boundary) */}
          <div>
            <label className="block font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200 mb-2">
              6. Campus Location Lock (Satellite Map & Boundary)
            </label>
            <LocationPicker
              campus={campus}
              spots={spots}
              selectedSpot={selectedSpot}
              setSelectedSpot={setSelectedSpot}
              customCoords={customCoords}
              setCustomCoords={setCustomCoords}
              customLocationName={customLocationName}
              setCustomLocationName={setCustomLocationName}
              radiusMeters={radiusMeters}
              setRadiusMeters={setRadiusMeters}
              pickerMode={pickerMode}
              setPickerMode={setPickerMode}
            />
          </div>

          {/* 6. Visibility */}
          <div>
            <label className="block font-display font-bold text-xs uppercase tracking-wider text-plum-900 dark:text-purple-200 mb-1">
              7. Capsule Visibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ONLY_ME', label: 'Only Me 🔒' },
                { id: 'BATCH', label: 'My Batch 🎓' },
                { id: 'PUBLIC_WALL', label: 'Public Wall 💌' }
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVisibility(v.id)}
                  className={`btn-sticker text-xs py-2 ${
                    visibility === v.id
                      ? 'bg-plum-900 text-white dark:bg-purple-600'
                      : 'bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t-2 border-plum-900/10 dark:border-purple-800/40">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-sticker bg-rose-500 hover:bg-rose-600 text-white py-3.5 text-base flex items-center justify-center gap-2 shadow-sticker-lg disabled:opacity-50"
            >
              <Lock className="w-5 h-5" />
              <span>{isSubmitting ? 'Sealing & Encrypting...' : 'Seal Capsule Forever 💌'}</span>
            </button>
            <p className="text-center font-handwriting text-sm text-plum-600 dark:text-purple-400 mt-2">
              The server will enforce date & location before this letter can ever be read.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

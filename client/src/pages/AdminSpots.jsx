import React, { useState } from 'react';
import {
  MapPin,
  PlusCircle,
  Edit2,
  Trash2,
  Layers,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Building,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { spotApi } from '../services/api';
import { isPointInsideCampus } from '../utils/clientTurf';

// Category emoji helper
const createCategoryIcon = (category) => {
  const emojiMap = {
    gate: '🏛️',
    canteen: '☕',
    library: '📚',
    academic: '🔬',
    sports: '⚽',
    iconic: '🎭',
    hostel: '🛏️'
  };
  const emoji = emojiMap[category] || '📍';

  return L.divIcon({
    html: `<div style="
      background-color: #8b5cf6;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid #2E1065;
      box-shadow: 2px 3px 0px rgba(46, 16, 101, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    ">${emoji}</div>`,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function AdminSpots({ campus, spots = [], onRefresh, onBack }) {
  const [tileLayer, setTileLayer] = useState('satellite');
  const [showModal, setShowModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('academic');
  const [description, setDescription] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(60);
  const [coords, setCoords] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fallback campus object to prevent undefined errors
  const safeCampus = campus || {
    name: 'Coimbatore Institute of Technology',
    code: 'CIT_COIMBATORE',
    city: 'Coimbatore, Tamil Nadu',
    center: [77.0274, 11.0277],
    zoom: 17,
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [77.024792, 11.0252095],
          [77.0248796, 11.0246174],
          [77.0254527, 11.0246677],
          [77.0255216, 11.0243531],
          [77.0296894, 11.025048],
          [77.0296368, 11.0271274],
          [77.029296, 11.0284461],
          [77.0291505, 11.0297877],
          [77.0286976, 11.0301435],
          [77.0285581, 11.0306955],
          [77.025105, 11.0282723],
          [77.0254559, 11.0268839],
          [77.0257352, 11.0253567],
          [77.024792, 11.0252095]
        ]
      ]
    }
  };

  const safeSpots = Array.isArray(spots) ? spots : [];

  const defaultCenter = safeCampus.center
    ? [safeCampus.center[1], safeCampus.center[0]]
    : [11.0277, 77.0274];

  const campusPolygonLatLngs =
    safeCampus?.boundary?.coordinates?.[0]?.map((c) => [c[1], c[0]]) || [];

  const isFormCoordInside =
    coords && safeCampus?.boundary
      ? isPointInsideCampus(coords.lon, coords.lat, safeCampus.boundary)
      : true;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOpenCreate = () => {
    setEditingSpot(null);
    setName('');
    setCategory('academic');
    setDescription('');
    setRadiusMeters(60);
    setCoords(
      safeCampus.center
        ? { lat: safeCampus.center[1], lon: safeCampus.center[0] }
        : { lat: 11.0277, lon: 77.0274 }
    );
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (spot) => {
    setEditingSpot(spot);
    setName(spot.name || '');
    setCategory(spot.category || 'academic');
    setDescription(spot.description || '');
    setRadiusMeters(spot.radiusMeters || 100);
    if (spot.location?.coordinates) {
      setCoords({
        lat: spot.location.coordinates[1],
        lon: spot.location.coordinates[0]
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this campus spot?')) return;
    try {
      await spotApi.deleteSpot(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete spot');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !coords) return;

    if (!isFormCoordInside) {
      setFormError('Spot coordinates are outside campus polygon boundary!');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const payload = {
        name,
        category,
        description,
        radiusMeters,
        latitude: coords.lat,
        longitude: coords.lon
      };

      if (editingSpot) {
        await spotApi.updateSpot(editingSpot._id, payload);
      } else {
        await spotApi.createSpot(payload);
      }

      setShowModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save spot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP DEDICATED BACK NAVIGATION BAR */}
      <div className="flex items-center justify-between bg-white/80 dark:bg-dorm-card/80 p-3 rounded-2xl border-2 border-plum-900/20 shadow-sm backdrop-blur-sm">
        <button
          onClick={onBack}
          className="btn-sticker bg-plum-900 text-white dark:bg-purple-600 px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-sticker hover:translate-x-[-2px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Capsules</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="btn-sticker bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200 px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Spots'}</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn-sticker bg-rose-500 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-sticker"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Spot</span>
          </button>
        </div>
      </div>

      {/* 2. CAMPUS BANNER */}
      <div className="bg-[#FFFDF9] dark:bg-[#1A132B] border-3 border-plum-900 dark:border-purple-600 rounded-2xl p-6 shadow-sticker-lg relative">
        <div className="washi-tape washi-tape-lilac" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-6 h-6 text-purple-600" />
              <h2 className="font-display font-bold text-2xl text-plum-900 dark:text-purple-100">
                {safeCampus.name}
              </h2>
            </div>
            <p className="text-xs text-plum-700 dark:text-purple-300 mt-1">
              📍 Location: <strong>{safeCampus.city}</strong> • GeoJSON Boundary Active •{' '}
              <span className="font-bold text-rose-600">{safeSpots.length} Registered Spots</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE SATELLITE / STREET MAP */}
      <div className="bg-white dark:bg-dorm-card p-4 rounded-2xl border-2 border-plum-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-plum-900 dark:text-purple-200">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Campus Polygon Perimeter & Registered Landmarks</span>
          </div>

          <button
            onClick={() => setTileLayer(tileLayer === 'osm' ? 'satellite' : 'osm')}
            className="btn-sticker bg-white dark:bg-dorm-card text-[11px] px-3 py-1 text-plum-900 dark:text-purple-200 flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span>{tileLayer === 'satellite' ? '🛰️ Esri Satellite View' : '🗺️ Street Map'}</span>
          </button>
        </div>

        <div className="h-80 w-full rounded-xl overflow-hidden border-2 border-plum-900 relative z-0">
          <MapContainer
            center={defaultCenter}
            zoom={safeCampus.zoom || 17}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            {tileLayer === 'satellite' ? (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {/* Campus Boundary Polygon */}
            {campusPolygonLatLngs.length > 0 && (
              <Polygon
                positions={campusPolygonLatLngs}
                pathOptions={{
                  color: '#9333ea',
                  weight: 3,
                  dashArray: '6, 8',
                  fillColor: '#c084fc',
                  fillOpacity: 0.15
                }}
              />
            )}

            {/* Spot Markers */}
            {safeSpots.map((s) => {
              const lat = s.location?.coordinates?.[1];
              const lon = s.location?.coordinates?.[0];
              if (!lat || !lon) return null;

              return (
                <Marker
                  key={s._id}
                  position={[lat, lon]}
                  icon={createCategoryIcon(s.category)}
                />
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* 4. SPOTS GRID OR EMPTY STATE */}
      {safeSpots.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white/60 dark:bg-dorm-card/60 rounded-2xl border-2 border-dashed border-plum-900/30">
          <div className="text-4xl mb-2">🏛️</div>
          <h4 className="font-display font-bold text-lg text-plum-900 dark:text-purple-200">
            No spots loaded yet
          </h4>
          <p className="text-xs text-plum-600 dark:text-purple-400 mt-1 max-w-sm mx-auto">
            Click 'Add New Spot' above or click 'Refresh Spots' to load from seed file!
          </p>
          <button
            onClick={handleManualRefresh}
            className="mt-4 btn-sticker bg-plum-900 text-white px-4 py-1.5 text-xs font-bold"
          >
            🔄 Load Real Campus Spots
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeSpots.map((spot) => {
            const lon = spot.location?.coordinates?.[0] ?? 0;
            const lat = spot.location?.coordinates?.[1] ?? 0;

            return (
              <div
                key={spot._id}
                className="polaroid-card p-4 flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blush-100 dark:bg-purple-900 text-plum-900 dark:text-purple-200 border border-plum-900/20">
                      {spot.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                      {spot.radiusMeters || 100}m radius
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-base text-plum-900 dark:text-purple-100">
                    {spot.name}
                  </h4>
                  <p className="text-xs text-plum-600 dark:text-purple-300 mt-1 line-clamp-2">
                    {spot.description || 'No description provided.'}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-plum-500 dark:text-purple-400">
                    [{lon.toFixed(5)}, {lat.toFixed(5)}]
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-2 border-t border-plum-900/10 dark:border-purple-800/40 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(spot)}
                    className="btn-sticker bg-white dark:bg-dorm-card p-1.5 text-xs text-plum-800 dark:text-purple-200"
                    title="Edit spot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(spot._id)}
                    className="btn-sticker bg-rose-100 dark:bg-rose-950/60 p-1.5 text-xs text-rose-700 dark:text-rose-300"
                    title="Delete spot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ADD / EDIT SPOT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#1A132B] border-3 border-plum-900 dark:border-purple-600 rounded-2xl p-6 shadow-sticker-lg max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-dorm-card border border-plum-900 font-bold flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="font-display font-bold text-xl text-plum-900 dark:text-purple-100 mb-1">
              {editingSpot ? 'Edit Campus Spot' : 'Add New Campus Spot'}
            </h3>
            <p className="text-xs text-plum-600 dark:text-purple-400 mb-4">
              Click on the map to set the exact spot location inside campus bounds.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-100 border border-rose-400 rounded-xl text-rose-900 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-plum-900 dark:text-purple-200 mb-1">
                  Spot Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mechanical Lab Courtyard"
                  className="w-full px-3 py-2 rounded-xl border-2 border-plum-900 dark:border-purple-700 bg-white dark:bg-dorm-card text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-plum-900 dark:text-purple-200 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-plum-900 dark:border-purple-700 bg-white dark:bg-dorm-card text-xs"
                  >
                    <option value="gate">🏛️ Gate</option>
                    <option value="canteen">☕ Canteen</option>
                    <option value="library">📚 Library</option>
                    <option value="academic">🔬 Academic</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="hostel">🛏️ Hostel</option>
                    <option value="iconic">🎭 Iconic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-plum-900 dark:text-purple-200 mb-1">
                    Radius: <span className="text-rose-600">{radiusMeters}m</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="5"
                    value={radiusMeters}
                    onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-plum-900 dark:text-purple-200 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why is this spot special to students?"
                  className="w-full px-3 py-2 rounded-xl border-2 border-plum-900 dark:border-purple-700 bg-white dark:bg-dorm-card text-xs"
                />
              </div>

              {/* Map Click Picker for Coordinates */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase text-plum-900 dark:text-purple-200">
                    Click Map to Place Spot Pin
                  </label>
                  {isFormCoordInside ? (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Inside Campus
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Outside Bounds!
                    </span>
                  )}
                </div>

                <div className="h-48 w-full rounded-xl overflow-hidden border-2 border-plum-900">
                  <MapContainer
                    center={coords ? [coords.lat, coords.lon] : defaultCenter}
                    zoom={17}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='Tiles &copy; Esri'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    {campusPolygonLatLngs.length > 0 && (
                      <Polygon
                        positions={campusPolygonLatLngs}
                        pathOptions={{ color: '#a855f7', weight: 2, dashArray: '4, 6' }}
                      />
                    )}
                    {coords && (
                      <>
                        <Marker
                          position={[coords.lat, coords.lon]}
                          icon={createCategoryIcon(category)}
                        />
                        <Circle
                          center={[coords.lat, coords.lon]}
                          radius={radiusMeters}
                          pathOptions={{ color: '#f43f5e', fillOpacity: 0.2 }}
                        />
                      </>
                    )}
                    <MapClickHandler
                      onMapClick={(lat, lon) => setCoords({ lat, lon })}
                    />
                  </MapContainer>
                </div>
                {coords && (
                  <p className="text-[10px] font-mono text-gray-500 mt-1">
                    Coordinates: [{coords.lon.toFixed(5)}, {coords.lat.toFixed(5)}]
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isFormCoordInside}
                className="w-full btn-sticker bg-rose-500 text-white py-2.5 text-xs font-bold disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingSpot
                  ? 'Update Campus Spot 📍'
                  : 'Register New Spot 📍'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

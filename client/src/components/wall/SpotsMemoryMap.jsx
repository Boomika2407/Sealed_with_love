import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Sparkles, Filter, Pin, Plus } from 'lucide-react';
import { memoryWallApi } from '../../services/api';

const CATEGORY_EMOJI = {
  gate: '🏛️',
  canteen: '☕',
  library: '📚',
  academic: '🔬',
  sports: '⚽',
  iconic: '🎭',
  hostel: '🛏️'
};

const createSpotMarkerIcon = (count, category) => {
  const emoji = CATEGORY_EMOJI[category] || '📍';
  const hasMemories = count > 0;

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="
          width: 36px;
          height: 36px;
          background: ${hasMemories ? 'linear-gradient(135deg, #F43F5E, #A855F7)' : '#FFFFFF'};
          border: 2px solid #2E1065;
          border-radius: 50%;
          box-shadow: 2px 3px 0px rgba(46, 16, 101, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          transform: rotate(-4deg);
          transition: transform 0.2s ease;
        ">
          ${emoji}
        </div>
        ${hasMemories ? `
          <div style="
            position: absolute;
            top: -6px;
            right: -8px;
            background: #FBBF24;
            color: #78350F;
            border: 1.5px solid #2E1065;
            border-radius: 9999px;
            padding: 1px 5px;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 1px 2px 0px rgba(46, 16, 101, 0.5);
            font-family: sans-serif;
          ">
            ${count} 📌
          </div>
        ` : ''}
      </div>
    `,
    className: 'custom-leaflet-memory-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

export default function SpotsMemoryMap({ spots = [], onFilterBySpot, onPinAtSpot }) {
  const [spotPins, setSpotPins] = useState({});
  const [loading, setLoading] = useState(true);

  // CIT default coords
  const defaultCenter = [11.0277, 77.0274];

  // CIT campus boundary
  const campusBoundary = [
    [11.0252095, 77.024792],
    [11.0246174, 77.0248796],
    [11.0246677, 77.0254527],
    [11.0243531, 77.0255216],
    [11.025048,  77.0296894],
    [11.0271274, 77.0296368],
    [11.0284461, 77.029296],
    [11.0297877, 77.0291505],
    [11.0301435, 77.0286976],
    [11.0306955, 77.0285581],
    [11.0282723, 77.025105],
    [11.0268839, 77.0254559],
    [11.0253567, 77.0257352],
    [11.0252095, 77.024792]
  ];

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const res = await memoryWallApi.getSpotMapPins();
        const pinMap = {};
        (res.pins || []).forEach((p) => {
          if (p._id) {
            pinMap[p._id.toString()] = p.count;
          }
        });
        setSpotPins(pinMap);
      } catch (err) {
        console.warn('Failed to load spot pins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2.5 border-plum-900/30 dark:border-purple-800 shadow-sticker bg-white dark:bg-[#150D2A] mb-8">
      {/* Map Header Banner */}
      <div className="p-3.5 bg-gradient-to-r from-rose-100 via-purple-100 to-amber-100 dark:from-purple-950/80 dark:to-plum-950/80 border-b-2 border-plum-900/20 dark:border-purple-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" />
          <span className="font-display font-bold text-xs sm:text-sm text-plum-900 dark:text-purple-100">
            Interactive Campus Memory Map 🗺️
          </span>
          <span className="text-[11px] font-handwriting text-plum-600 dark:text-purple-300 hidden sm:inline">
            Click any spot to explore or filter memories!
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-plum-700 dark:text-purple-300">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>{spots.length} Campus Spots</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[420px] sm:h-[480px] w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={17}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          {/* Tile Layer (Clean OpenStreetMap or Carto) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Campus Boundary Outline */}
          <Polygon
            positions={campusBoundary}
            pathOptions={{
              color: '#F43F5E',
              weight: 2,
              dashArray: '5, 8',
              fillColor: '#FDA4AF',
              fillOpacity: 0.1
            }}
          />

          {/* Spot Markers */}
          {spots.map((spot) => {
            if (!spot.location?.coordinates || spot.location.coordinates.length < 2) return null;
            const [lng, lat] = spot.location.coordinates;
            const count = spotPins[spot._id?.toString()] || 0;

            return (
              <React.Fragment key={spot._id}>
                {/* Spot Radius Circle */}
                <Circle
                  center={[lat, lng]}
                  radius={spot.radiusMeters || 50}
                  pathOptions={{
                    color: count > 0 ? '#A855F7' : '#9CA3AF',
                    weight: 1.5,
                    dashArray: '3, 4',
                    fillColor: count > 0 ? '#C084FC' : '#E5E7EB',
                    fillOpacity: 0.15
                  }}
                />

                {/* Spot Marker */}
                <Marker
                  position={[lat, lng]}
                  icon={createSpotMarkerIcon(count, spot.category)}
                >
                  <Popup className="scrapbook-popup">
                    <div className="p-2 min-w-[190px] font-body text-xs">
                      <div className="flex items-center gap-1.5 font-display font-bold text-sm text-plum-900 border-b border-plum-900/10 pb-1.5 mb-1.5">
                        <span>{CATEGORY_EMOJI[spot.category] || '📍'}</span>
                        <span>{spot.name}</span>
                      </div>

                      {spot.description && (
                        <p className="text-[11px] text-plum-600 mb-2 font-handwriting">
                          "{spot.description}"
                        </p>
                      )}

                      <div className="bg-rose-50 rounded-lg p-1.5 mb-2.5 text-center border border-rose-200">
                        <span className="font-display font-bold text-xs text-rose-700">
                          {count === 0 ? 'No memories pinned here yet' : `${count} memory pinned here! 🎉`}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {count > 0 && onFilterBySpot && (
                          <button
                            onClick={() => onFilterBySpot(spot._id)}
                            className="w-full py-1 px-2 rounded-lg bg-plum-900 text-white font-display font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-plum-800 transition-colors"
                          >
                            <Filter className="w-3 h-3" />
                            Filter wall for this spot
                          </button>
                        )}
                        {onPinAtSpot && (
                          <button
                            onClick={() => onPinAtSpot(spot._id)}
                            className="w-full py-1 px-2 rounded-lg bg-rose-500 text-white font-display font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-rose-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            Pin a memory here 📌
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

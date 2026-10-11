import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPin, Compass, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { isPointInsideCampus } from '../../utils/clientTurf';

// Custom icons based on category
const createCategoryIcon = (category, isSelected = false) => {
  const emojiMap = {
    gate: '🏛️',
    canteen: '☕',
    library: '📚',
    academic: '🔬',
    sports: '⚽',
    iconic: '🎭',
    hostel: '🛏️',
    custom: '📍'
  };
  const emoji = emojiMap[category] || '📍';
  const bgColor = isSelected ? '#f43f5e' : '#8b5cf6';

  return L.divIcon({
    html: `<div style="
      background-color: ${bgColor};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2.5px solid #2E1065;
      box-shadow: 2px 3px 0px rgba(46, 16, 101, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
      transition: transform 0.2s;
    ">${emoji}</div>`,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Map auto-panner when selected spot changes
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 17, { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
}

// Sub-component to handle map click events for dropping custom pins
function MapClickHandler({ onMapClick, activeMode }) {
  useMapEvents({
    click(e) {
      if (activeMode === 'custom') {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

export default function LocationPicker({
  campus,
  spots = [],
  selectedSpot,
  setSelectedSpot,
  customCoords,
  setCustomCoords,
  customLocationName,
  setCustomLocationName,
  radiusMeters,
  setRadiusMeters,
  pickerMode,
  setPickerMode
}) {
  // Tile layer state: 'osm' or 'satellite'
  const [tileLayer, setTileLayer] = useState('satellite'); // Esri satellite by default for real campus realism!

  // Campus center default
  const defaultCenter = campus?.center
    ? [campus.center[1], campus.center[0]] // Leaflet takes [lat, lon]
    : [11.0277, 77.0274];

  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Convert GeoJSON Polygon coordinates [[[lon, lat], ...]] to Leaflet Polygon format [[lat, lon], ...]
  const campusPolygonLatLngs = campus?.boundary?.coordinates?.[0]?.map(
    (coord) => [coord[1], coord[0]]
  ) || [];

  // Determine active coordinates
  const activeLat =
    pickerMode === 'named'
      ? selectedSpot?.location?.coordinates?.[1]
      : customCoords?.lat;
  const activeLon =
    pickerMode === 'named'
      ? selectedSpot?.location?.coordinates?.[0]
      : customCoords?.lon;

  // Real-time check if custom pin is inside campus
  const isCustomPinValid =
    pickerMode === 'custom' && customCoords?.lon && customCoords?.lat && campus?.boundary
      ? isPointInsideCampus(customCoords.lon, customCoords.lat, campus.boundary)
      : true;

  // Handle clicking a named spot badge
  const handleSelectNamedSpot = (spot) => {
    setPickerMode('named');
    setSelectedSpot(spot);
    if (spot.radiusMeters) {
      setRadiusMeters(spot.radiusMeters);
    }
    if (spot.location?.coordinates) {
      setMapCenter([spot.location.coordinates[1], spot.location.coordinates[0]]);
    }
  };

  // Handle map click in custom mode
  const handleMapClick = (lat, lon) => {
    setCustomCoords({ lat, lon });
    setMapCenter([lat, lon]);
    if (!customLocationName) {
      setCustomLocationName('My Special Campus Corner');
    }
  };

  return (
    <div className="space-y-3">
      {/* Mode Switcher: Named Spots vs Custom Pin */}
      <div className="flex items-center justify-between border-b border-plum-900/10 dark:border-purple-800/40 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPickerMode('named')}
            className={`btn-sticker text-xs px-3 py-1.5 ${
              pickerMode === 'named'
                ? 'bg-plum-900 text-white dark:bg-purple-600'
                : 'bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200'
            }`}
          >
            🏛️ Named Campus Spots ({spots.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setPickerMode('custom');
              if (!customCoords && spots[0]?.location?.coordinates) {
                setCustomCoords({
                  lat: spots[0].location.coordinates[1] + 0.0002,
                  lon: spots[0].location.coordinates[0] + 0.0002
                });
              }
            }}
            className={`btn-sticker text-xs px-3 py-1.5 ${
              pickerMode === 'custom'
                ? 'bg-plum-900 text-white dark:bg-purple-600'
                : 'bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200'
            }`}
          >
            🎯 Drop Custom Pin
          </button>
        </div>

        {/* Satellite vs Street Tile Switcher */}
        <button
          type="button"
          onClick={() => setTileLayer(tileLayer === 'osm' ? 'satellite' : 'osm')}
          className="btn-sticker bg-white dark:bg-dorm-card text-[11px] px-2.5 py-1 text-plum-900 dark:text-purple-200 flex items-center gap-1 shadow-sm"
        >
          <Layers className="w-3.5 h-3.5 text-rose-500" />
          <span>{tileLayer === 'satellite' ? '🛰️ Satellite View' : '🗺️ Street Map'}</span>
        </button>
      </div>

      {/* Named Spots Horizontal Pill List */}
      {pickerMode === 'named' && (
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {spots.map((spot) => {
            const isSelected = selectedSpot?._id === spot._id;
            return (
              <button
                key={spot._id}
                type="button"
                onClick={() => handleSelectNamedSpot(spot)}
                className={`btn-sticker text-xs px-3 py-1.5 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-sticker'
                    : 'bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-200 hover:bg-blush-50'
                }`}
              >
                <span>{createCategoryIcon(spot.category).options.html.match(/(..)/)?.[0] || '📍'}</span>
                <span>{spot.name}</span>
                <span className="text-[10px] opacity-80">({spot.radiusMeters}m)</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Pin Information Input */}
      {pickerMode === 'custom' && (
        <div className="bg-purple-50 dark:bg-dorm-card p-3 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-plum-900 dark:text-purple-200">
              🎯 Custom Campus Location
            </span>
            {isCustomPinValid ? (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Inside Campus Bounds
              </span>
            ) : (
              <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> Outside Campus Polygon!
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customLocationName}
              onChange={(e) => setCustomLocationName(e.target.value)}
              placeholder="e.g. Quadrangle bench under tree, Lab 404"
              className="flex-1 px-3 py-1.5 rounded-lg border border-plum-900/30 text-xs bg-white dark:bg-dorm-card text-plum-900 dark:text-purple-100"
            />
            <p className="text-[11px] text-plum-600 dark:text-purple-400 self-center">
              Click anywhere inside the purple boundary on the map to place pin.
            </p>
          </div>
        </div>
      )}

      {/* The Leaflet Map with Real Campus Polygon and Esri Satellite View */}
      <div className="h-72 w-full rounded-2xl overflow-hidden border-3 border-plum-900 shadow-sticker relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={campus?.zoom || 17}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={mapCenter} zoom={campus?.zoom || 17} />

          {/* Dynamic Tile Layer (OSM or Esri Satellite) */}
          {tileLayer === 'satellite' ? (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* Campus Polygon Boundary Outline */}
          {campusPolygonLatLngs.length > 0 && (
            <Polygon
              positions={campusPolygonLatLngs}
              pathOptions={{
                color: '#a855f7',
                weight: 3,
                dashArray: '6, 8',
                fillColor: '#c084fc',
                fillOpacity: 0.12
              }}
            />
          )}

          {/* Pre-registered Spots Markers */}
          {spots.map((spot) => {
            const isSelected = pickerMode === 'named' && selectedSpot?._id === spot._id;
            const spotLat = spot.location.coordinates[1];
            const spotLon = spot.location.coordinates[0];

            return (
              <Marker
                key={spot._id}
                position={[spotLat, spotLon]}
                icon={createCategoryIcon(spot.category, isSelected)}
                eventHandlers={{
                  click: () => handleSelectNamedSpot(spot)
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold text-plum-900">{spot.name}</p>
                    <p className="text-gray-600">{spot.description}</p>
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">
                      Radius: {spot.radiusMeters}m
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Custom Pin Marker */}
          {pickerMode === 'custom' && customCoords?.lat && (
            <Marker
              position={[customCoords.lat, customCoords.lon]}
              icon={createCategoryIcon('custom', true)}
            >
              <Popup>
                <div className="text-xs font-bold">
                  {customLocationName || 'Custom Campus Pin'}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Circle Overlay showing the physical unlock radius */}
          {activeLat && activeLon && (
            <Circle
              center={[activeLat, activeLon]}
              radius={radiusMeters || 100}
              pathOptions={{
                color: isCustomPinValid ? '#f43f5e' : '#dc2626',
                fillColor: isCustomPinValid ? '#fb7185' : '#ef4444',
                fillOpacity: 0.28,
                weight: 2,
                dashArray: '4, 6'
              }}
            />
          )}

          <MapClickHandler onMapClick={handleMapClick} activeMode={pickerMode} />
        </MapContainer>
      </div>

      {/* Radius Configurator */}
      <div className="bg-white/90 dark:bg-dorm-card p-3 rounded-xl border border-plum-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <label className="font-display font-semibold text-plum-900 dark:text-purple-200">
            Physical Unlock Radius:{' '}
            <span className="text-rose-600 dark:text-rose-400 font-bold">{radiusMeters} meters</span>
          </label>
          <p className="text-[11px] text-plum-600 dark:text-purple-400">
            {pickerMode === 'named'
              ? `Default spot radius is set to ${selectedSpot?.radiusMeters || radiusMeters}m.`
              : 'Adjust the allowed circle radius around your custom pin.'}
          </p>
        </div>
        <input
          type="range"
          min="30"
          max="300"
          step="5"
          value={radiusMeters}
          onChange={(e) => setRadiusMeters(parseInt(e.target.value, 10))}
          className="w-full sm:w-44 accent-rose-500 cursor-pointer"
        />
      </div>
    </div>
  );
}

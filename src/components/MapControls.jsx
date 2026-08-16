import React, { useState } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, MapPin, Share2, Plus, Minus, Layers, Check, X } from 'lucide-react';

// Custom Pin Icon for Marked Locations with pixel-perfect needle tip anchor
export const createMarkedPinIcon = () => {
  return L.divIcon({
    className: 'custom-marked-pin-marker',
    html: `
      <div style="width: 36px; height: 48px; position: relative; pointer-events: auto; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 14px rgba(126, 34, 206, 0.6));">
          <path d="M18 0C8.05887 0 0 8.05887 0 18C0 28.5 16 43 17.3 43.8C17.7 44.05 18.3 44.05 18.7 43.8C20 43 36 28.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="url(#pin-gradient-v2)" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round"/>
          <circle cx="18" cy="18" r="6" fill="#FFFFFF" />
          <defs>
            <linearGradient id="pin-gradient-v2" x1="0" y1="0" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop stop-color="#a855f7" />
              <stop offset="1" stop-color="#4f46e5" />
            </linearGradient>
          </defs>
        </svg>
        <div style="width: 10px; height: 4px; background: rgba(0,0,0,0.4); border-radius: 50%; filter: blur(1.5px); margin-top: -2px;"></div>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48]
  });
};

// Custom Pulsing User Location Icon
export const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div style="width: 28px; height: 28px; position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 130, 246, 0.35); border: 2px solid #3b82f6; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; border: 2.5px solid #ffffff; box-shadow: 0 0 12px rgba(59, 130, 246, 0.9); z-index: 10;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

/**
 * Helper component placed inside <MapContainer> to capture map clicks for Drop Marker mode
 */
export function MapClickHandler({ isMarkingMode, onMapClick }) {
  useMapEvents({
    click(e) {
      if (isMarkingMode && onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

/**
 * Reusable Map Control Bar
 */
export default function MapControls({
  mapRef,
  userLocation,
  setUserLocation,
  markedLocation,
  setMarkedLocation,
  isMarkingMode,
  setIsMarkingMode,
  mapStyle,
  setMapStyle,
  onShare,
  shareTitle = 'SmartTransit Map',
  shareText = 'Check out this live transit view on SmartTransit',
  customBottomClass = 'bottom-24 sm:bottom-28',
  customRightClass = 'right-4 sm:right-6'
}) {
  const [locating, setLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, duration = 3000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  // 1. Locate Me / My Location Handler (Toggles ON / OFF)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported on this device.');
      return;
    }

    if (userLocation) {
      setUserLocation(null);
      showToast('Location tracking turned off');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        setLocating(false);
        if (mapRef) {
          mapRef.flyTo([latitude, longitude], 16, { animate: true, duration: 1.2 });
        }
        showToast('Located your position');
      },
      (error) => {
        setLocating(false);
        if (error.code === 1) {
          showToast('Location access denied. Please enable permission in browser settings.');
        } else if (error.code === 2) {
          showToast('Location unavailable. Please check GPS or network.');
        } else if (error.code === 3) {
          showToast('Location request timed out. Please try again.');
        } else {
          showToast('Could not retrieve your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // 2. Drop Marker / Mark Location Handler
  const handleToggleMarkingMode = () => {
    if (isMarkingMode) {
      setIsMarkingMode(false);
      showToast('Marking mode cancelled');
    } else {
      setIsMarkingMode(true);
      showToast('Tap anywhere on the map to drop a pin');
    }
  };

  const handleClearMarker = () => {
    setMarkedLocation(null);
    setIsMarkingMode(false);
    showToast('Marker removed');
  };

  // 3. Share Button Handler
  const handleShareClick = async () => {
    if (onShare) {
      onShare();
      return;
    }

    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Unable to copy link.');
    }
  };

  // 4. Custom Zoom In / Out Handlers
  const handleZoomIn = () => {
    if (mapRef) mapRef.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef) mapRef.zoomOut();
  };

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[1000] bg-[#0b101a]/95 border border-blue-500/30 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl flex items-center gap-2 pointer-events-none animate-fade-in transition-all">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mode Status Bar when Dropping Marker */}
      {isMarkingMode && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-purple-950/90 border border-purple-500/50 text-purple-200 text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.4)] backdrop-blur-xl flex items-center gap-3 animate-pulse pointer-events-auto">
          <span>📍 Tap map to drop pin</span>
          <button
            onClick={() => setIsMarkingMode(false)}
            aria-label="Cancel drop pin"
            className="p-1 hover:bg-purple-800/50 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Floating Control Stack */}
      <div className={`fixed ${customRightClass} ${customBottomClass} z-[600] flex flex-col items-center gap-2.5 pointer-events-auto select-none`}>
        {/* Share Button */}
        <button
          id="btn-share-map"
          type="button"
          onClick={handleShareClick}
          aria-label="Share map view"
          title="Share map view"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0b101a]/90 hover:bg-[#151c2c] backdrop-blur-xl border border-white/15 text-slate-200 hover:text-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 transition-all"
        >
          <Share2 size={19} />
        </button>

        {/* Locate Me Button */}
        <button
          id="btn-locate-me"
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          aria-label="Locate my position"
          title="Locate my position"
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all shadow-[0_6px_20px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 ${
            userLocation
              ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]'
              : 'bg-[#0b101a]/90 hover:bg-[#151c2c] border-white/15 text-slate-200 hover:text-white'
          }`}
        >
          {locating ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Crosshair size={20} />
          )}
        </button>

        {/* Drop Marker / Mark Location Button */}
        <button
          id="btn-drop-marker"
          type="button"
          onClick={markedLocation ? handleClearMarker : handleToggleMarkingMode}
          aria-label={markedLocation ? "Remove marked pin" : isMarkingMode ? "Cancel mark location" : "Mark location on map"}
          title={markedLocation ? "Remove marked pin" : isMarkingMode ? "Cancel mark location" : "Mark location on map"}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all shadow-[0_6px_20px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 ${
            markedLocation || isMarkingMode
              ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]'
              : 'bg-[#0b101a]/90 hover:bg-[#151c2c] border-white/15 text-slate-200 hover:text-white'
          }`}
        >
          <MapPin size={20} className={isMarkingMode ? 'animate-bounce' : ''} />
        </button>

        {/* Layer / Map Style Toggle (Satellite vs Streets) */}
        {setMapStyle && (
          <button
            id="btn-toggle-layer"
            type="button"
            onClick={() => setMapStyle(mapStyle === 'satellite' ? 'streets' : 'satellite')}
            aria-label={mapStyle === 'satellite' ? "Switch to Street View" : "Switch to Satellite Hybrid"}
            title={mapStyle === 'satellite' ? "Switch to Street View (Roads & Names)" : "Switch to Satellite Hybrid"}
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl backdrop-blur-xl border transition-all shadow-[0_6px_20px_rgba(0,0,0,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center ${
              mapStyle === 'streets' 
                ? 'bg-blue-600/30 border-blue-400/50 text-blue-300' 
                : 'bg-[#0b101a]/90 hover:bg-[#151c2c] border-white/15 text-slate-200 hover:text-white'
            }`}
          >
            <Layers size={19} />
          </button>
        )}

        {/* Professional Non-Overlapping Zoom Controls */}
        <div className="flex flex-col bg-[#0b101a]/90 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.4)]">
          <button
            id="btn-zoom-in"
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            title="Zoom in"
            className="w-11 h-10 sm:w-12 sm:h-10 hover:bg-[#151c2c] text-slate-200 hover:text-white flex items-center justify-center transition-colors border-b border-white/10 active:bg-blue-600"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
          <button
            id="btn-zoom-out"
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            title="Zoom out"
            className="w-11 h-10 sm:w-12 sm:h-10 hover:bg-[#151c2c] text-slate-200 hover:text-white flex items-center justify-center transition-colors active:bg-blue-600"
          >
            <Minus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
}

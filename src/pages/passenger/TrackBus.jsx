import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useDragControls } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Navigation, Map as MapIcon, Share2, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { solarch } from '../../lib/solarch';
import { fetchRoadSnappedRoute } from '../../lib/osrm';
import { isPlaceFavorite, saveFavoritePlace, removeFavoritePlace, isRouteFavorite, saveFavoriteRoute, removeFavoriteRoute } from '../../utils/favorites';
import MapControls, { MapClickHandler, createMarkedPinIcon, createUserLocationIcon } from '../../components/MapControls';

// Beautiful Bus Sticker
const createBusIcon = (busNumber) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: 56px; height: 56px;">
        <div class="absolute -top-10 bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
          <p class="text-[12px] font-bold m-0 leading-tight">${busNumber}</p>
        </div>
        <div class="relative w-14 h-14 rounded-full bg-white flex items-center justify-center border-[3px] border-blue-600 shadow-[0_6px_20px_rgba(0,0,0,0.4)] z-10 overflow-hidden">
          <div class="text-[26px] mt-0.5">🚌</div>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28]
  });
};

// Destination Pole
const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div class="relative flex flex-col items-center" style="width: 40px; height: 60px;">
        <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center border-[3px] border-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="w-1.5 h-6 bg-red-600 shadow-sm z-0 -mt-1 rounded-b-sm"></div>
        <div class="w-6 h-1.5 bg-black/40 rounded-[100%] blur-[2px] mt-0.5"></div>
      </div>
    `,
    iconSize: [40, 60],
    iconAnchor: [20, 60],
    popupAnchor: [0, -60]
  });
};

// Origin Dot
const createOriginIcon = () => {
  return L.divIcon({
    className: 'custom-origin-marker',
    html: `
      <div class="relative flex flex-col items-center" style="width: 32px; height: 32px;">
        <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-[3px] border-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] z-10">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Indore Default Coordinates
const INDORE_CENTER = [22.7196, 75.8577];

export default function TrackBus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeLine, setRouteLine] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeStatus, setRouteStatus] = useState('loading'); // 'loading', 'ok', 'failed'

  const [mapRef, setMapRef] = useState(null);
  const dragControls = useDragControls();
  const [userLocation, setUserLocation] = useState(null);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [isFavorited, setIsFavorited] = useState(false);
  const [error, setError] = useState(null);

  const [, setFavTick] = useState(0);

  useEffect(() => {
    const handleFavUpdate = () => {
      setFavTick(t => t + 1);
      if (id && id !== 'undefined') setIsFavorited(isRouteFavorite(id));
    };
    handleFavUpdate();
    window.addEventListener('smarttransit_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('smarttransit_favorites_updated', handleFavUpdate);
  }, [id]);

  const toggleFavorite = () => {
    const targetId = id || trip?.$id || trip?.id || trip?.bus_number;
    if (!targetId) return;
    if (isRouteFavorite(targetId)) {
      removeFavoriteRoute(targetId);
      setIsFavorited(false);
    } else if (trip) {
      saveFavoriteRoute(trip);
      setIsFavorited(true);
    }
  };

  // Fetch real trip details and subscribe to live telemetry
  useEffect(() => {
    let unsubscribe = null;
    const init = async () => {
      try {
        let tripDoc = null;

        // 1. Try getById if valid ID
        if (id && id !== 'undefined') {
          try {
            tripDoc = await solarch.db.collection('trips').getById(id);
          } catch (err) {
            console.warn("Trip not found by ID, checking by bus_number", err);
          }
        }

        // 2. Try querying by bus_number or route_id
        if (!tripDoc && id && id !== 'undefined') {
          const byBus = await solarch.db.collection('trips').get({
            filter: { bus_number: id },
            limit: 1
          });
          const docs = byBus?.items || byBus?.documents || [];
          if (docs.length > 0) tripDoc = docs[0];
        }

        // 3. Graceful fallback: Load any active in-progress trip or first trip
        if (!tripDoc) {
          const anyTrip = await solarch.db.collection('trips').get({ limit: 1 });
          const anyDocs = anyTrip?.items || anyTrip?.documents || [];
          if (anyDocs.length > 0) tripDoc = anyDocs[0];
        }

        if (tripDoc) {
          setTrip(tripDoc);
          const resolvedTripId = tripDoc.$id || tripDoc.id || tripDoc.bus_number;
          setIsFavorited(isRouteFavorite(resolvedTripId));

          // Fetch actual route stops
          if (tripDoc.route_id) {
            const stopsRes = await solarch.db.collection('stops').get({
              filter: { route_id: tripDoc.route_id },
              limit: 100
            });
            
            if (stopsRes && stopsRes.items) {
              const sortedStops = stopsRes.items.sort((a, b) => a.stop_order - b.stop_order);
              setStops(sortedStops);
              
              // Road-snapped geometry fetch with zero straight-line fabrication
              const coords = await fetchRoadSnappedRoute(sortedStops);
              if (coords) {
                setRouteLine(coords);
                setRouteStatus('ok');
              } else {
                console.warn("Road routing unavailable from OSRM.");
                setRouteLine([]);
                setRouteStatus('failed');
              }
            }
          }

          // Subscribe to live location SSE Stream
          unsubscribe = await solarch.db.collection('live_locations').subscribe(
            { filter: { trip_id: resolvedTripId } },
            (event) => {
              if (event.action === 'create' || event.action === 'update') {
                 setTrip(prev => {
                   if (!prev) return prev;
                   return {
                     ...prev,
                     current_location: { lat: event.document.latitude, lng: event.document.longitude },
                     speed_kmh: event.document.speed || prev.speed_kmh || 0
                   };
                 });
              }
            }
          );
        } else {
          setError('No active bus found for tracking.');
        }
      } catch (err) {
        console.error('Failed to load trip from DB:', err);
        setError('This bus is currently unavailable or the trip has ended.');
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  const handleRetryRoute = async () => {
    if (!stops || stops.length < 2) return;
    setRouteStatus('loading');
    const coords = await fetchRoadSnappedRoute(stops, true);
    if (coords) {
      setRouteLine(coords);
      setRouteStatus('ok');
    } else {
      setRouteLine([]);
      setRouteStatus('failed');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Track Bus ${trip?.bus_number || ''}`,
          text: `Track my bus on route ${trip?.route_id || ''} live!`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard?.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Compute live bus location with zero ReferenceErrors
  const busLocation = (trip?.current_location && typeof trip.current_location.lat === 'number' && typeof trip.current_location.lng === 'number')
    ? { lat: trip.current_location.lat, lng: trip.current_location.lng, speed: trip.speed_kmh || 0 }
    : (typeof trip?.latitude === 'number' && typeof trip?.longitude === 'number'
        ? { lat: trip.latitude, lng: trip.longitude, speed: trip.speed_kmh || 0 }
        : null);

  const mapCenter = busLocation
    ? [busLocation.lat, busLocation.lng]
    : (stops.length > 0 && typeof stops[0].latitude === 'number' && typeof stops[0].longitude === 'number'
        ? [stops[0].latitude, stops[0].longitude]
        : INDORE_CENTER);

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      
      {/* Real Interactive Leaflet Map Background */}
      <div 
        className="absolute inset-0 z-0 bg-[#030712]"
        onClick={() => {
          if (!isMinimized) setIsMinimized(true);
        }}
      >
        <MapContainer 
          center={mapCenter} 
          zoom={15} 
          zoomControl={false}
          ref={setMapRef}
          style={{ width: '100%', height: '100%', background: '#030712' }}
        >
          <TileLayer
            url={mapStyle === 'satellite' 
              ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
              : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"}
            attribution='&copy; Google Maps'
          />
          
          {/* Draw Route Polyline only when valid road geometry exists */}
          {routeStatus === 'ok' && routeLine.length > 0 && (
            <Polyline positions={routeLine} color="#3b82f6" weight={5} opacity={0.8} />
          )}
          
          {/* Draw Origin/Destination Stops */}
          {stops.length > 0 && (
             <Marker position={[stops[0].latitude, stops[0].longitude]} icon={createOriginIcon()} />
          )}
          {stops.length > 1 && (
             <Marker position={[stops[stops.length - 1].latitude, stops[stops.length - 1].longitude]} icon={createDestinationIcon()} />
          )}

          {/* Draw Intermediate Stops */}
          {stops.length > 2 && stops.slice(1, -1).map((stop) => (
             <Marker key={stop.$id || stop.id} position={[stop.latitude, stop.longitude]} icon={L.divIcon({ className: 'bg-white rounded-full border-[2px] border-blue-500 shadow-md', iconSize: [10, 10] })} />
          ))}

          {/* Real Telemetry Bus Marker */}
          {busLocation && (
            <Marker position={[busLocation.lat, busLocation.lng]} icon={createBusIcon(trip?.bus_number || 'BUS')}>
              <Popup className="custom-popup">
                <div className="font-bold text-slate-800">{trip?.bus_number}</div>
                <div className="text-xs text-slate-500 mt-1">{trip?.route_id}</div>
                <div className="text-xs font-bold text-blue-600 mt-2">{busLocation.speed || 0} km/h • Live</div>
              </Popup>
            </Marker>
          )}

          {/* Render User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserLocationIcon()}>
              <Popup className="custom-popup">
                <div className="p-1 text-slate-800 text-xs">
                  <p className="font-bold">📍 Your Current Position</p>
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">{userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Dropped / Marked Pin */}
          {markedLocation && (
            <Marker position={[markedLocation.lat, markedLocation.lng]} icon={createMarkedPinIcon()}>
              <Popup className="custom-popup">
                <div className="p-2 text-slate-800 text-xs min-w-[170px]">
                  <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
                    <p className="font-bold text-purple-700 flex items-center gap-1">📍 Marked Location</p>
                    <button
                      onClick={() => {
                        if (isPlaceFavorite(markedLocation.lat, markedLocation.lng)) {
                          removeFavoritePlace(markedLocation);
                        } else {
                          saveFavoritePlace({
                            name: `Pin (${markedLocation.lat.toFixed(3)}, ${markedLocation.lng.toFixed(3)})`,
                            lat: markedLocation.lat,
                            lng: markedLocation.lng
                          });
                        }
                      }}
                      className={`p-1 rounded-md transition-colors ${
                        isPlaceFavorite(markedLocation.lat, markedLocation.lng)
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-500 hover:text-amber-600'
                      }`}
                      title={isPlaceFavorite(markedLocation.lat, markedLocation.lng) ? "Remove from Favorites" : "Save to Favorites"}
                    >
                      <Star size={14} fill={isPlaceFavorite(markedLocation.lat, markedLocation.lng) ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 my-1.5">{markedLocation.lat.toFixed(5)}, {markedLocation.lng.toFixed(5)}</p>
                  <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => setMarkedLocation(null)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-bold transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        if (isPlaceFavorite(markedLocation.lat, markedLocation.lng)) {
                          removeFavoritePlace(markedLocation);
                        } else {
                          saveFavoritePlace({
                            name: `Pin (${markedLocation.lat.toFixed(3)}, ${markedLocation.lng.toFixed(3)})`,
                            lat: markedLocation.lat,
                            lng: markedLocation.lng
                          });
                        }
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        isPlaceFavorite(markedLocation.lat, markedLocation.lng)
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isPlaceFavorite(markedLocation.lat, markedLocation.lng) ? '★ Saved' : '☆ Save'}
                    </button>
                    <button
                      onClick={() => {
                        const shareUrl = `https://maps.google.com/?q=${markedLocation.lat},${markedLocation.lng}`;
                        navigator.clipboard?.writeText(shareUrl);
                        alert('Marked location coordinates copied!');
                      }}
                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-[11px] font-bold transition-colors"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Capture Map Clicks for Dropping Pin */}
          <MapClickHandler
            isMarkingMode={isMarkingMode}
            onMapClick={(latlng) => {
              setMarkedLocation(latlng);
              setIsMarkingMode(false);
            }}
          />
        </MapContainer>

        {/* Gradient overlays to blend map into UI */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#030712]/90 to-transparent z-[400] pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-[500] px-5 pt-12 pb-4 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg pointer-events-auto">
          <ArrowLeft size={24} />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button onClick={toggleFavorite} className={`w-12 h-12 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors shadow-lg ${isFavorited ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-[#0b101a]/90 text-white hover:bg-white/10'}`}>
            <Star size={20} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      {/* Status banner for routing state */}
      {routeStatus === 'failed' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/90 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-3 pointer-events-auto backdrop-blur-md">
          <span>⚠️ Route temporarily unavailable</span>
          <button 
            onClick={handleRetryRoute}
            className="px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-full font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      {routeStatus === 'loading' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/80 border border-white/10 text-slate-300 px-3.5 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 pointer-events-none backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
          <span>Loading road route...</span>
        </div>
      )}

      {/* Unified Professional Map Controls */}
      <MapControls
        mapRef={mapRef}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        markedLocation={markedLocation}
        setMarkedLocation={setMarkedLocation}
        isMarkingMode={isMarkingMode}
        setIsMarkingMode={setIsMarkingMode}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        onShare={handleShare}
        shareTitle={`Track Bus ${trip?.bus_number || ''}`}
        shareText={`Track bus ${trip?.bus_number || ''} live on route ${trip?.route_id || ''} with SmartTransit.`}
        customBottomClass="top-24 sm:top-28"
        customRightClass="right-4 sm:right-6"
      />


      {/* Bottom Information Card */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: isMinimized ? '75%' : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.5 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 40) setIsMinimized(true);
          if (info.offset.y < -40) setIsMinimized(false);
        }}
        className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0b101a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] touch-none pointer-events-auto"
      >
        {/* Drag Indicator */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-full pt-2 pb-6 -mt-2 -mb-4 flex justify-center cursor-pointer shrink-0"
        >
          <div 
            className="w-12 h-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          ></div>
        </div>

        <div 
          className="flex-1 overflow-y-auto custom-scrollbar touch-pan-y"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-[22px] font-bold tracking-wide">{trip?.bus_number || 'Loading...'}</h2>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981] animate-pulse"></div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            </div>
            <p className="text-[13px] text-slate-400 font-medium">{trip?.route_id || 'Route Information'}</p>
          </div>
          
          <div className="text-right">
            <p className="text-[24px] font-bold text-white leading-none">2 <span className="text-[14px] text-slate-400 font-medium">min</span></p>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-1">Away</p>
          </div>
        </div>

        {/* Next Stop Indicator */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-4 mb-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <MapPin size={20} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-blue-400 uppercase tracking-wider font-bold mb-0.5">Next Stop</p>
            <h4 className="text-[15px] font-bold text-white">Malhar Mega Mall</h4>
          </div>
          <div className="text-right">
            <p className="text-[14px] font-bold text-white">09:24</p>
            <p className="text-[10px] text-slate-400 uppercase">AM</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-auto pt-4 shrink-0">
          <button 
            onClick={() => navigate(`/passenger/bus/${id}`)}
            className="flex-1 h-[52px] bg-white/5 hover:bg-white/10 text-white font-bold text-[14px] rounded-xl transition-colors border border-white/5"
          >
            View Details
          </button>
          <button className="flex-1 h-[52px] bg-blue-600 hover:bg-blue-500 text-white font-bold text-[14px] rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-colors flex items-center justify-center gap-2">
            <Clock size={18} />
            Set Alert
          </button>
        </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Target, Layers, Wifi, ShieldAlert, AlertTriangle, CheckCircle2, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';
import { fetchRoadSnappedRoute } from '../../lib/osrm';
import { isPlaceFavorite, saveFavoritePlace, removeFavoritePlace, isRouteFavorite, saveFavoriteRoute, removeFavoriteRoute } from '../../utils/favorites';
import AuthRequiredModal from '../../components/AuthRequiredModal';
import MapControls, { MapClickHandler, createMarkedPinIcon, createUserLocationIcon } from '../../components/MapControls';

// Create a custom pulsing dot icon for the driver's bus
const driverBusIconHtml = `
  <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
    <div style="position: absolute; width: 100%; height: 100%; background-color: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: pulse 2s infinite;"></div>
    <div style="position: absolute; width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);"></div>
  </div>
  <style>
    @keyframes pulse {
      0% { transform: scale(0.5); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }
  </style>
`;
const driverBusMarkerIcon = new L.DivIcon({
  html: driverBusIconHtml,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

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

export default function ActiveTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trip, setTrip] = useState(null);
  const [location, setLocation] = useState([22.7196, 75.8577]); // Default Indore
  const [speed, setSpeed] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [tripEnded, setTripEnded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');

  const [isTracking, setIsTracking] = useState(true);
  const [gpsError, setGpsError] = useState(null);
  const [routeLine, setRouteLine] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeStatus, setRouteStatus] = useState('loading'); // 'loading', 'ok', 'failed'
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [authActionName, setAuthActionName] = useState('ending or updating active trips');

  const isRealDriver = user && (user.role || '').toUpperCase() === 'DRIVER';

  // Support jumping to coordinate passed via URL
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  useEffect(() => {
    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMarkedLocation({ lat, lng });
        if (mapRef) {
          mapRef.flyTo([lat, lng], 16, { animate: true, duration: 1 });
        }
      }
    }
  }, [latParam, lngParam, mapRef]);

  // Route favorite state & reactive tick
  const tripId = trip?.$id || trip?.id || trip?.bus_number;
  const [isFavRoute, setIsFavRoute] = useState(false);
  const [, setFavTick] = useState(0);

  useEffect(() => {
    const handleFavUpdate = () => {
      setFavTick(t => t + 1);
      if (tripId) setIsFavRoute(isRouteFavorite(tripId));
    };
    handleFavUpdate();
    window.addEventListener('smarttransit_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('smarttransit_favorites_updated', handleFavUpdate);
  }, [tripId]);

  const toggleFavoriteRoute = () => {
    if (!trip) return;
    if (!isRealDriver) {
      setAuthActionName('saving favorite routes');
      setAuthModalOpen(true);
      return;
    }
    if (isRouteFavorite(tripId)) {
      removeFavoriteRoute(tripId);
      setIsFavRoute(false);
    } else {
      saveFavoriteRoute(trip);
      setIsFavRoute(true);
    }
  };

  // Initialize Trip
  useEffect(() => {
    const initTrip = async () => {
      try {
        let docs = [];
        if (user?.assigned_bus) {
          const response = await solarch.db.collection('trips').get({
            filter: { bus_number: user.assigned_bus, status: 'IN_PROGRESS' },
            limit: 1
          });
          docs = response?.items || response?.documents || [];
        }

        if (docs.length === 0) {
          const anyRes = await solarch.db.collection('trips').get({ limit: 1 });
          docs = anyRes?.items || anyRes?.documents || [];
        }

        if (docs.length > 0) {
          const tripDoc = docs[0];
          setTrip(tripDoc);

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
                console.warn("Road routing unavailable from OSRM for driver map.");
                setRouteLine([]);
                setRouteStatus('failed');
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to init trip', err);
        setRouteStatus('failed');
      }
    };

    initTrip();
  }, [user]);

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

  // Handle GPS Tracking
  useEffect(() => {
    let watchId;
    
    if (trip && isTracking) {
      if (!navigator.geolocation) {
        setGpsError('unavailable');
      } else {
        setGpsError(null);
        watchId = navigator.geolocation.watchPosition(
          async (pos) => {
            setGpsError(null);
            const newLoc = [pos.coords.latitude, pos.coords.longitude];
            setLocation(newLoc);
            const calculatedSpeed = Math.round((pos.coords.speed || 0) * 3.6); // m/s to km/h
            setSpeed(calculatedSpeed);

            // Update Backend Telemetry
            try {
              await solarch.db.collection('live_locations').create({
                bus_id: trip.bus_id || trip.bus_number,
                trip_id: trip.id || trip.$id,
                latitude: newLoc[0],
                longitude: newLoc[1],
                speed: calculatedSpeed,
                timestamp: new Date().toISOString()
              });
            } catch (err) {
              console.error('GPS update failed', err);
            }
          },
          (err) => {
            console.error('GPS watch error:', err);
            if (err.code === 1) {
              setGpsError('denied');
            } else if (err.code === 2) {
              setGpsError('unavailable');
            } else if (err.code === 3) {
              setGpsError('timeout');
            } else {
              setGpsError('error');
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      }
    } else if (!isTracking) {
      setSpeed(0);
      setGpsError(null);
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trip, isTracking]);

  const handleRetryGps = () => {
    setGpsError(null);
    setIsTracking(false);
    setTimeout(() => setIsTracking(true), 100);
  };

  const handleEndTrip = async () => {
    if (!isRealDriver) {
      setShowEndConfirm(false);
      setAuthModalOpen(true);
      return;
    }

    if (!trip) return;
    try {
      await solarch.db.collection('trips').update(trip.$id || trip.id, {
        status: 'COMPLETED',
        end_time: new Date().toISOString()
      });
      setShowEndConfirm(false);
      setTripEnded(true); // Show success screen
    } catch (err) {
      console.error('Failed to end trip', err);
      alert('Could not end trip. Check connection.');
    }
  };

  if (tripEnded) {
    return (
      <div className="h-dvh w-full bg-[#030712] flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#030712] to-[#030712] pointer-events-none" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0b101a]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 w-full max-w-sm flex flex-col items-center text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] relative z-10"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Trip Completed!</h2>
          <p className="text-slate-400 text-sm mb-8">All telemetries finalized and passengers notified safely.</p>
          <button 
            onClick={() => navigate('/driver')}
            className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full relative bg-[#030712] overflow-hidden flex flex-col">
      {/* Full-Screen Leaflet Map Background */}
      <div 
        className="absolute inset-0 z-0 bg-[#030712]"
        onClick={() => {
          if (!isMinimized) setIsMinimized(true);
        }}
      >
        <MapContainer 
          center={location} 
          zoom={16} 
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
             <Marker key={stop.$id || stop.id} position={[stop.latitude, stop.longitude]} icon={L.divIcon({ className: 'bg-white rounded-full border-[2px] border-blue-500 shadow-md', iconSize: [12, 12] })} />
          ))}

          {location && (
            <Marker position={location} icon={driverBusMarkerIcon}>
              <Popup className="custom-popup">
                <div className="font-bold text-slate-800">Bus Location</div>
                <div className="text-xs text-slate-500">{speed} km/h</div>
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
                        if (!isRealDriver) {
                          setAuthActionName('saving favorite places');
                          setAuthModalOpen(true);
                          return;
                        }
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
                        if (!isRealDriver) {
                          setAuthActionName('saving favorite places');
                          setAuthModalOpen(true);
                          return;
                        }
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
          shareTitle={`Driver Active Trip - ${trip?.bus_number || ''}`}
          shareText={`Live tracking bus ${trip?.bus_number || ''} on route ${trip?.route_id || ''}.`}
          customBottomClass="top-24 sm:top-28"
          customRightClass="right-4 sm:right-6"
        />
      </div>

      {/* Top Floating Header */}
      <header className="relative z-[500] px-4 pt-10 pb-2 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="bg-[#0b101a]/90 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-3 pointer-events-auto shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mb-0.5">Trip In Progress</span>
            <span className="text-[13px] font-bold text-white tracking-wide leading-tight">{trip?.bus_number || 'Loading...'}</span>
          </div>
          {trip && (
            <button
              onClick={toggleFavoriteRoute}
              className={`p-1.5 rounded-full border transition-colors ${
                isFavRoute 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={isFavRoute ? "Remove Route from Favorites" : "Save Route to Favorites"}
            >
              <Star size={15} fill={isFavRoute ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsTracking(!isTracking)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all shadow-lg ${
              isTracking 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
            title={isTracking ? "Click to pause GPS tracking" : "Click to resume GPS tracking"}
          >
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{isTracking ? 'GPS Active' : 'GPS Off'}</span>
          </button>
        </div>
      </header>

      {/* GPS Error Notification Banner */}
      {gpsError && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] bg-rose-950/90 border border-rose-500/50 text-rose-200 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xl flex items-center gap-3 pointer-events-auto backdrop-blur-md">
          <span>⚠️ {gpsError === 'denied' ? 'Location permission is required to start live trip tracking.' : 'GPS signal unavailable.'}</span>
          <button 
            onClick={handleRetryGps}
            className="px-2.5 py-0.5 bg-rose-500/30 hover:bg-rose-500/50 text-rose-100 border border-rose-500/40 rounded-full font-bold transition-colors"
          >
            Retry GPS
          </button>
        </div>
      )}

      {/* Route Status banner */}
      {routeStatus === 'failed' && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-3 pointer-events-auto backdrop-blur-md">
          <span>⚠️ Route temporarily unavailable</span>
          <button 
            onClick={handleRetryRoute}
            className="px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-full font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bottom Floating HUD */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: isMinimized ? 'calc(100% - 68px)' : 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.4 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 35) setIsMinimized(true);
          if (info.offset.y < -35) setIsMinimized(false);
        }}
        className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0b101a]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[32px] p-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] touch-none flex flex-col pointer-events-auto select-none"
      >
        {/* Drag Indicator */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-full pt-1 pb-3 flex justify-center cursor-pointer shrink-0"
        >
          <div className="w-12 h-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-colors"></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="flex flex-col items-center justify-center p-2.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[20px] font-bold text-white">{speed}</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Speed (km/h)</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[20px] font-bold text-white">1.2<span className="text-xs text-slate-400 font-normal">km</span></span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Distance</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[20px] font-bold text-white">12</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Stops Left</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <Target size={16} className={isTracking ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">GPS Status</span>
              <span className={`text-[12px] font-bold ${isTracking ? 'text-white' : 'text-slate-500'}`}>{isTracking ? 'Strong Signal' : 'Disabled'}</span>
            </div>
          </div>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">Telemetry</span>
              <span className="text-[12px] text-white font-bold">Online</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowEndConfirm(true)}
          className="w-full h-[52px] bg-rose-600 hover:bg-rose-500 text-white font-bold text-[15px] rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition-all"
        >
          End Trip
        </button>
      </motion.div>

      {/* End Trip Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b101a] border border-white/10 rounded-[32px] p-6 max-w-sm w-full text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">End Trip?</h3>
              <p className="text-sm text-slate-400 mb-6">Are you sure you want to end this trip? This action cannot be undone.</p>
              
              <div className="flex flex-col gap-3">
                <button onClick={handleEndTrip} className="w-full py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                  Yes, End Trip
                </button>
                <button onClick={() => setShowEndConfirm(false)} className="w-full py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        requiredRole="Driver"
        actionName={authActionName}
      />
    </div>
  );
}

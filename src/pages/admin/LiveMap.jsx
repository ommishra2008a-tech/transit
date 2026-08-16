import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Bus, Navigation, Star, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';
import { fetchRoadSnappedRoute } from '../../lib/osrm';
import { isPlaceFavorite, saveFavoritePlace, removeFavoritePlace, isRouteFavorite, saveFavoriteRoute, removeFavoriteRoute } from '../../utils/favorites';
import MapControls, { MapClickHandler, createMarkedPinIcon, createUserLocationIcon } from '../../components/MapControls';
import AuthRequiredModal from '../../components/AuthRequiredModal';

// Indore Coordinates
const INDORE_CENTER = [22.7196, 75.8577];

// Create a custom bus icon using L.divIcon
const createAdminBusIcon = (busNumber, status) => {
  const isRunning = status === 'IN_PROGRESS';
  const colorClass = isRunning ? 'bg-blue-600' : 'bg-amber-500';
  const glowClass = isRunning ? 'shadow-[0_0_15px_rgba(37,99,235,0.6)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.6)]';
  const borderClass = isRunning ? 'border-blue-500' : 'border-amber-400';
  
  return L.divIcon({
    className: 'custom-admin-bus-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: 32px; height: 32px;">
        <div class="absolute -top-8 bg-[#0b101a] border border-white/10 text-white px-2 py-0.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
          <p class="text-[10px] font-bold m-0 leading-tight">${busNumber}</p>
        </div>
        <div class="relative w-8 h-8 rounded-full ${colorClass}/90 flex items-center justify-center border-2 border-white backdrop-blur-md ${glowClass} z-10">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
        ${isRunning ? `<div class="absolute inset-0 rounded-full border-2 ${borderClass} animate-ping opacity-50 z-0"></div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Component to fetch and display driver info when a bus is clicked
const BusPopupContent = ({ bus }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const busId = bus.$id || bus.id || bus.bus_number;
  const [isFav, setIsFav] = useState(isRouteFavorite(busId));

  useEffect(() => {
    const checkFav = () => setIsFav(isRouteFavorite(busId));
    checkFav();
    window.addEventListener('smarttransit_favorites_updated', checkFav);
    return () => window.removeEventListener('smarttransit_favorites_updated', checkFav);
  }, [busId]);

  const toggleFav = () => {
    if (isRouteFavorite(busId)) {
      removeFavoriteRoute(busId);
      setIsFav(false);
    } else {
      saveFavoriteRoute(bus);
      setIsFav(true);
    }
  };

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await solarch.db.collection('users').get({
          filter: { assigned_bus: bus.bus_number },
          limit: 1
        });
        const docs = res?.items || res?.documents || [];
        if (docs.length > 0) {
          setDriver(docs[0]);
        }
      } catch (err) {
        console.error('Failed to fetch driver info', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [bus.bus_number]);

  return (
    <div className="p-1.5 min-w-[170px] text-slate-800">
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm">{bus.bus_number}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav();
          }}
          className={`p-1 rounded-md transition-colors ${
            isFav ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500 hover:text-amber-600'
          }`}
          title={isFav ? "Remove from Favorites" : "Save to Favorites"}
        >
          <Star size={15} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="text-xs text-slate-600 mt-1">{bus.route_id}</p>
      
      <div className="mt-2 pt-1.5 border-t border-slate-200">
        <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Driver Info</p>
        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : driver ? (
          <>
            <p className="text-xs font-bold text-slate-800">{driver.name || 'No Name'}</p>
            <p className="text-[11px] font-mono text-blue-600 font-bold">{driver.phone || 'No Phone'}</p>
          </>
        ) : (
          <p className="text-xs text-slate-500">No driver assigned</p>
        )}
      </div>

      <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between">
        <p className="text-xs font-bold text-amber-600">{bus.speed_kmh || 0} km/h • {bus.status}</p>
        <button
          onClick={toggleFav}
          className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
            isFav ? 'bg-amber-500 text-white shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
          }`}
        >
          {isFav ? '★ Favorited' : '☆ Favorite'}
        </button>
      </div>
    </div>
  );
};

export default function LiveMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [driversMap, setDriversMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('satellite');

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('managing map features');
  const [, setFavTick] = useState(0);

  useEffect(() => {
    const handleFavUpdate = () => setFavTick(t => t + 1);
    window.addEventListener('smarttransit_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('smarttransit_favorites_updated', handleFavUpdate);
  }, []);

  const isRealAdmin = user && (user.role || '').toUpperCase() === 'ADMIN';

  const [mapRef, setMapRef] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [isMarkingMode, setIsMarkingMode] = useState(false);

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routeLine, setRouteLine] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeStatus, setRouteStatus] = useState('loading'); // 'loading', 'ok', 'failed'

  // Center on coordinates or route if passed via query params (e.g. from Saved Places or Routes)
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const routeIdParam = searchParams.get('route_id') || searchParams.get('bus');

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

  useEffect(() => {
    if (routeIdParam) {
      setSelectedRouteId(routeIdParam);
    }
  }, [routeIdParam]);

  // Auto-focus on matching bus when route_id is provided
  useEffect(() => {
    if (routeIdParam && buses.length > 0 && mapRef) {
      const match = buses.find(b => 
        (b.route_id && b.route_id.toLowerCase() === routeIdParam.toLowerCase()) ||
        (b.bus_number && b.bus_number.toLowerCase() === routeIdParam.toLowerCase()) ||
        b.$id === routeIdParam
      );
      if (match && match.current_location && match.current_location.lat) {
        mapRef.flyTo([match.current_location.lat, match.current_location.lng], 16, { animate: true, duration: 1 });
      }
    }
  }, [routeIdParam, buses, mapRef]);

  // Fetch real active trips and driver information for comprehensive search & mapping
  useEffect(() => {
    const fetchBusesAndDrivers = async () => {
      try {
        const [tripsRes, driversRes] = await Promise.all([
          solarch.db.collection('trips').get({ limit: 50 }),
          solarch.db.collection('users').get({ limit: 100 })
        ]);
        const docs = tripsRes?.items || tripsRes?.documents || [];
        setBuses(docs);

        const usersList = driversRes?.items || driversRes?.documents || [];
        const dMap = {};
        usersList.forEach(u => {
          if (u.assigned_bus) {
            dMap[u.assigned_bus] = u;
          }
          if (u.$id || u.id) {
            dMap[u.$id || u.id] = u;
          }
        });
        setDriversMap(dMap);
      } catch (err) {
        console.error('Failed to fetch buses or drivers for map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusesAndDrivers();
  }, []);

  // Fetch and draw route when a bus is selected
  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedRouteId) {
        setRouteLine([]);
        setStops([]);
        return;
      }
      setRouteStatus('loading');
      try {
        const stopsRes = await solarch.db.collection('stops').get({
          filter: { route_id: selectedRouteId },
          limit: 100
        });
        if (stopsRes && stopsRes.items) {
          const sortedStops = stopsRes.items.sort((a, b) => a.stop_order - b.stop_order);
          setStops(sortedStops);
          
          const coords = await fetchRoadSnappedRoute(sortedStops);
          if (coords) {
            setRouteLine(coords);
            setRouteStatus('ok');
          } else {
            console.warn("Road routing unavailable from OSRM for admin map.");
            setRouteLine([]);
            setRouteStatus('failed');
          }
        }
      } catch (err) {
        console.error("Failed to fetch route for selected bus", err);
        setRouteLine([]);
        setRouteStatus('failed');
      }
    };
    fetchRoute();
  }, [selectedRouteId]);

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

  const filteredBuses = buses.filter(bus => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const busMatch = (bus.bus_number || '').toLowerCase().includes(q);
    const routeMatch = (bus.route_id || '').toLowerCase().includes(q);
    const driver = driversMap[bus.bus_number] || driversMap[bus.driver_id];
    const driverNameMatch = (driver?.name || '').toLowerCase().includes(q);
    const driverPhoneMatch = (driver?.phone || '').toLowerCase().includes(q);
    return busMatch || routeMatch || driverNameMatch || driverPhoneMatch;
  });

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    if (filteredBuses.length > 0) {
      const targetBus = filteredBuses[0];
      if (targetBus.current_location?.lat && targetBus.current_location?.lng) {
        if (mapRef) {
          mapRef.flyTo([targetBus.current_location.lat, targetBus.current_location.lng], 16, { animate: true, duration: 1.2 });
        }
      }
      if (targetBus.route_id) {
        setSelectedRouteId(targetBus.route_id);
      }
      setIsDropdownOpen(false);
    }
  };

  const handleSelectBus = (bus) => {
    if (bus.current_location?.lat && bus.current_location?.lng) {
      if (mapRef) {
        mapRef.flyTo([bus.current_location.lat, bus.current_location.lng], 16, { animate: true, duration: 1.2 });
      }
    }
    if (bus.route_id) {
      setSelectedRouteId(bus.route_id);
    }
    setSearchQuery(bus.bus_number || '');
    setIsDropdownOpen(false);
  };

  const runningCount = buses.filter(b => b.status === 'IN_PROGRESS').length;
  const scheduledCount = buses.filter(b => b.status === 'SCHEDULED').length;

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      
      {/* Real Interactive Leaflet Map Background */}
      <div className="absolute inset-0 z-0 bg-[#030712]">
        <MapContainer 
          center={INDORE_CENTER} 
          zoom={12} 
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
             <Marker position={[stops[0].latitude, stops[0].longitude]} icon={L.divIcon({ className: 'custom-origin-marker', html: '<div class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md"></div>', iconSize: [16, 16] })} />
          )}
          {stops.length > 1 && (
             <Marker position={[stops[stops.length - 1].latitude, stops[stops.length - 1].longitude]} icon={L.divIcon({ className: 'custom-dest-marker', html: '<div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>', iconSize: [16, 16] })} />
          )}

          {/* Draw Intermediate Stops */}
          {stops.length > 2 && stops.slice(1, -1).map((stop) => (
             <Marker key={stop.$id} position={[stop.latitude, stop.longitude]} icon={L.divIcon({ className: 'bg-white rounded-full border-[2px] border-blue-500 shadow-md', iconSize: [10, 10] })} />
          ))}

          {/* Render real map markers for all buses */}
          {!loading && filteredBuses.map((bus) => {
            if (!bus.current_location || !bus.current_location.lat) return null;
            return (
              <Marker 
                key={bus.$id} 
                position={[bus.current_location.lat, bus.current_location.lng]}
                icon={createAdminBusIcon(bus.bus_number, bus.status)}
                eventHandlers={{ click: () => setSelectedRouteId(bus.route_id) }}
              >
                <Popup className="custom-dark-popup">
                  <BusPopupContent 
                    bus={bus} 
                    isRealAdmin={isRealAdmin} 
                    onAuthRequired={(action) => {
                      setAuthActionName(action || 'saving favorite buses');
                      setAuthModalOpen(true);
                    }} 
                  />
                </Popup>
              </Marker>
            );
          })}

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
                        if (!isRealAdmin) {
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
                        if (!isRealAdmin) {
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
          shareTitle="Admin Live Fleet Map"
          shareText={`Live fleet monitoring view: ${runningCount} active buses on routes.`}
          customBottomClass="bottom-24 sm:bottom-28"
          customRightClass="right-4 sm:right-6"
        />
      </div>

      {/* Header overlays */}
      <header className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-6 pb-2 pointer-events-none">
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
        <div className="flex items-center gap-3 mb-3 pointer-events-auto max-w-xl">
          <button 
            onClick={() => navigate(-1)} 
            className="w-11 h-11 shrink-0 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg text-white"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          
          <form 
            onSubmit={handleSearchSubmit}
            className="flex-1 relative flex items-center"
          >
            <div className="w-full h-11 bg-[#0b101a]/90 backdrop-blur-md border border-white/10 focus-within:border-blue-500/50 rounded-full flex items-center px-3.5 shadow-lg transition-all">
              <Search size={16} className="text-slate-400 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Search bus, route, or driver..." 
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-white placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsDropdownOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-white mr-1.5 transition-colors"
                  title="Clear"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[12px] font-bold rounded-full shadow-md transition-all shrink-0 flex items-center gap-1"
              >
                Search
              </button>
            </div>

            {/* Live Autocomplete Results Dropdown */}
            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute top-13 left-0 right-0 max-h-64 overflow-y-auto bg-[#0b101a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                {filteredBuses.length > 0 ? (
                  filteredBuses.map((bus) => {
                    const driver = driversMap[bus.bus_number] || driversMap[bus.driver_id];
                    return (
                      <div
                        key={bus.$id || bus.bus_number}
                        onClick={() => handleSelectBus(bus)}
                        className="p-2.5 rounded-xl hover:bg-white/10 cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                            <Bus size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {bus.bus_number} <span className="text-[10px] text-slate-400 font-normal ml-1">({bus.route_id})</span>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Driver: <span className="text-slate-300 font-medium">{driver?.name || 'Assigned'}</span> {driver?.phone ? `• ${driver.phone}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          bus.status === 'IN_PROGRESS' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {bus.status === 'IN_PROGRESS' ? 'Running' : 'Idle'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400">
                    No matching bus, route, or driver found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Stats Row */}
        <div className="flex gap-2.5 pointer-events-auto">
          <div className="bg-[#0b101a]/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[11px] font-bold text-white">{runningCount} Running</span>
          </div>
          <div className="bg-[#0b101a]/90 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[11px] font-bold text-white">{scheduledCount} Idle</span>
          </div>
        </div>
      </header>
      
      {/* Required CSS override for Leaflet dark popups */}
      <style>{`
        .custom-dark-popup .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .custom-dark-popup .leaflet-popup-tip {
          background-color: white;
        }
      `}</style>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        requiredRole="Admin"
        actionName={authActionName}
      />
    </div>
  );
}

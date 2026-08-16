import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useDragControls } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Bus, Navigation, CheckCircle2, ChevronUp, ChevronDown, Share2, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { solarch } from '../../lib/solarch';
import { fuzzySearch } from '../../utils/fuzzySearch';
import { isPlaceFavorite, saveFavoritePlace, removeFavoritePlace, isRouteFavorite, saveFavoriteRoute, removeFavoriteRoute } from '../../utils/favorites';
import MapControls, { MapClickHandler, createMarkedPinIcon, createUserLocationIcon } from '../../components/MapControls';

// Indore Coordinates
const INDORE_CENTER = [22.7196, 75.8577];

// Beautiful Bus Sticker
const createBusIcon = (busNumber, isSelected = false) => {
  const borderClass = isSelected ? 'border-amber-400 ring-4 ring-amber-400/50 scale-110' : 'border-blue-600';
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: 56px; height: 56px;">
        <div class="absolute -top-10 bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
          <p class="text-[12px] font-bold m-0 leading-tight">${busNumber}</p>
        </div>
        <div class="relative w-14 h-14 rounded-full bg-white flex items-center justify-center border-[3px] ${borderClass} shadow-[0_6px_20px_rgba(0,0,0,0.4)] z-10 overflow-hidden transition-all">
          <div class="text-[26px] mt-0.5">🚌</div>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28]
  });
};

export default function PassengerMap() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const dragControls = useDragControls();
  
  const [buses, setBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  
  const [mapRef, setMapRef] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'dark'

  const [selectedBus, setSelectedBus] = useState(null);
  const [isSheetMinimized, setIsSheetMinimized] = useState(false);
  const [, setFavTick] = useState(0);

  // Listen for favorite changes to re-render stars reactively
  useEffect(() => {
    const handleFavUpdate = () => setFavTick(t => t + 1);
    window.addEventListener('smarttransit_favorites_updated', handleFavUpdate);
    return () => window.removeEventListener('smarttransit_favorites_updated', handleFavUpdate);
  }, []);

  // Center on coordinates if passed via query params (e.g. from Saved Places)
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

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await solarch.db.collection('trips').get({ filter: { status: 'IN_PROGRESS' } });
        const docs = response?.items || response?.documents || [];
        setBuses(docs);
        if (docs.length > 0 && !selectedBus) {
          setSelectedBus(docs[0]);
        }
      } catch (error) {
        console.error('Failed to fetch buses for map:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(searchQuery ? { q: searchQuery } : {});
    setIsSheetMinimized(false);
  };

  const filteredBuses = fuzzySearch(searchParams.get('q') || '', buses, ['route_id', 'bus_number']);

  // Custom Share Handler for selected bus or map
  const handleCustomShare = async () => {
    let shareUrl = window.location.href;
    let shareTitle = 'SmartTransit Bus Network';
    let shareText = 'Discover live buses on SmartTransit.';

    if (selectedBus) {
      const busId = selectedBus.$id || selectedBus.id;
      shareUrl = `${window.location.origin}/passenger/track/${busId}`;
      shareTitle = `Track Bus ${selectedBus.bus_number}`;
      shareText = `Track bus ${selectedBus.bus_number} on route ${selectedBus.route_id} live on SmartTransit.`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard?.writeText(shareUrl);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      navigator.clipboard?.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      
      {/* Real Interactive Leaflet Map Background */}
      <div 
        className="absolute inset-0 z-0 bg-[#030712]"
        onClick={() => {
          // Touching outside the sheet closes / minimizes it smoothly
          if (!isSheetMinimized) setIsSheetMinimized(true);
        }}
      >
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
          
          {/* Render real map markers for buses */}
          {!loading && filteredBuses.map((bus) => {
            if (!bus.current_location || !bus.current_location.lat) return null;
            const busRecordId = bus.$id || bus.id || bus.bus_number;
            const isSelected = selectedBus && (selectedBus.$id || selectedBus.id || selectedBus.bus_number) === busRecordId;
            return (
              <Marker 
                key={busRecordId} 
                position={[bus.current_location.lat, bus.current_location.lng]}
                icon={createBusIcon(bus.bus_number, isSelected)}
                eventHandlers={{
                  click: () => {
                    setSelectedBus(bus);
                    setIsSheetMinimized(false);
                    if (mapRef) {
                      mapRef.flyTo([bus.current_location.lat, bus.current_location.lng], 14, { animate: true, duration: 1 });
                    }
                  }
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[130px] text-slate-800 text-xs">
                    <div className="font-bold text-sm text-slate-900">{bus.bus_number}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{bus.route_id}</div>
                    <div className="text-xs font-bold text-blue-600 mt-1">{bus.speed_kmh || 0} km/h</div>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <button 
                        onClick={() => navigate(`/passenger/track/${busRecordId}`)}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold transition-colors shadow-sm"
                      >
                        Track Bus Live
                      </button>
                    </div>
                  </div>
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
          onShare={handleCustomShare}
          shareTitle={selectedBus ? `Track Bus ${selectedBus.bus_number}` : 'SmartTransit Bus Network'}
          shareText={selectedBus ? `Live tracking bus ${selectedBus.bus_number} on route ${selectedBus.route_id}.` : 'Discover active buses on SmartTransit.'}
          customBottomClass="top-28 sm:top-32"
          customRightClass="right-4 sm:right-6"
        />
        
        {/* Subtle overlay gradient to blend map edges with UI */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-transparent to-[#030712]/90 pointer-events-none z-[400]" />
      </div>

      {/* Floating Header */}
      <header className="relative z-[500] px-5 pt-12 pb-4 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-[#0b101a]/80 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg shrink-0">
            <ArrowLeft size={24} />
          </button>
          
          <form onSubmit={handleSearch} className="flex-1 relative flex items-center group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search destination or bus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b101a]/80 backdrop-blur-md border border-white/10 text-white text-[14px] placeholder:text-slate-400 focus:border-blue-500/50 focus:bg-[#0f172a] focus:ring-1 focus:ring-blue-500/50 h-[48px] rounded-full pl-11 pr-[85px] outline-none transition-all shadow-lg"
            />
            <button type="submit" className="absolute right-1.5 h-[36px] px-4 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors">
              Search
            </button>
          </form>
        </div>
      </header>

      {/* Smooth Collapsible Bottom Sheet */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: isSheetMinimized ? 'calc(100% - 68px)' : 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.4 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 35) setIsSheetMinimized(true);
          if (info.offset.y < -35) setIsSheetMinimized(false);
        }}
        className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0b101a]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[32px] p-5 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.6)] touch-none flex flex-col pointer-events-auto select-none"
        style={{ maxHeight: '55vh' }}
      >
        {/* Drag Handle and Collapsible Title Header */}
        <div 
          onClick={() => setIsSheetMinimized(!isSheetMinimized)}
          className="w-full cursor-pointer shrink-0 pb-3 -mt-2"
        >
          <div 
            className="w-full py-1.5 flex justify-center cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-12 h-1.5 bg-white/25 rounded-full hover:bg-white/40 transition-colors"></div>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold tracking-wide text-white flex items-center gap-2">
                {searchParams.get('q') ? 'Search Results' : 'Active Buses'}
              </h3>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/25 px-2 py-0.5 rounded-full">
                {filteredBuses.length} found
              </span>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              {isSheetMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Bus List Items */}
        <div 
          className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar flex-1 touch-pan-y pt-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus) => {
              const busRecordId = bus.$id || bus.id || bus.bus_number;
              const isSelected = selectedBus && (selectedBus.$id || selectedBus.id || selectedBus.bus_number) === busRecordId;
              return (
                <div 
                  key={busRecordId}
                  className={`border rounded-2xl p-3.5 flex items-center justify-between transition-all cursor-pointer group ${
                    isSelected 
                      ? 'bg-blue-600/15 border-blue-500/60 shadow-[0_0_15px_rgba(37,99,235,0.2)]' 
                      : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/15'
                  }`}
                  onClick={() => {
                    setSelectedBus(bus);
                    if (bus.current_location && mapRef) {
                      mapRef.flyTo([bus.current_location.lat, bus.current_location.lng], 14, { animate: true, duration: 1 });
                    }
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Select / Tick Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBus(bus);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-blue-500 text-white shadow-[0_0_10px_#3b82f6]' 
                          : 'bg-white/10 hover:bg-white/20 text-slate-400'
                      }`}
                      title={isSelected ? "Selected for Share" : "Select this bus"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <div>
                      <h4 className="text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        {bus.bus_number}
                        {isSelected && <span className="text-[10px] text-blue-400 font-normal">(Selected)</span>}
                      </h4>
                      <p className="text-[12px] text-slate-400">{bus.route_id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <p className="text-[13px] font-bold text-white">{bus.speed_kmh || 0} <span className="text-[10px] text-slate-500 font-medium">km/h</span></p>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Live</p>
                    </div>
                    {/* Star Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isRouteFavorite(busRecordId)) {
                          removeFavoriteRoute(busRecordId);
                        } else {
                          saveFavoriteRoute(bus);
                        }
                      }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isRouteFavorite(busRecordId)
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/10 hover:bg-white/20 text-slate-400'
                      }`}
                      title={isRouteFavorite(busRecordId) ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star size={15} fill={isRouteFavorite(busRecordId) ? "currentColor" : "none"} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (busRecordId) navigate(`/passenger/track/${busRecordId}`);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold rounded-xl shadow-[0_0_12px_rgba(37,99,235,0.3)] transition-colors"
                    >
                      Track
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-500">
              <MapPin size={32} className="mx-auto mb-3 opacity-50" />
              <p>No buses found for this route.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

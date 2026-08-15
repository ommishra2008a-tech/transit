import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useDragControls } from 'framer-motion';
import { ArrowLeft, Search, MapPin, Bus, Navigation, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { solarch } from '../../lib/solarch';
import { fuzzySearch } from '../../utils/fuzzySearch';

// Indore Coordinates
const INDORE_CENTER = [22.7196, 75.8577];

// Beautiful Bus Sticker
const createBusIcon = (busNumber) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: 56px; height: 56px; margin-left: -28px; margin-top: -28px;">
        <div class="absolute -top-10 bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
          <p class="text-[12px] font-bold m-0 leading-tight">${busNumber}</p>
        </div>
        <div class="relative w-14 h-14 rounded-full bg-white flex items-center justify-center border-[3px] border-blue-600 shadow-[0_6px_20px_rgba(0,0,0,0.4)] z-10 overflow-hidden">
          <div class="text-[26px] mt-0.5">🚌</div>
        </div>
      </div>
    `,
    iconSize: [56, 56],
    iconAnchor: [28, 28]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div class="w-6 h-6 rounded-full bg-blue-500 border-[3px] border-white shadow-xl flex items-center justify-center relative" style="margin-left: -12px; margin-top: -12px;">
        <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        <div class="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-70"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
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
  const [locating, setLocating] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite' | 'dark'

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await solarch.db.collection('trips').get({ filter: { status: 'IN_PROGRESS' } });
        const docs = response?.items || response?.documents || [];
        setBuses(docs);
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
  };

  const locateUser = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);
        if (mapRef) {
          mapRef.flyTo([latitude, longitude], 15, { animate: true, duration: 1.5 });
        }
      },
      (error) => {
        console.error("Location error:", error);
        alert("Could not retrieve your location. Please check permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const filteredBuses = fuzzySearch(searchParams.get('q') || '', buses, ['route_id', 'bus_number']);

  return (
    <div className="min-h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      
      {/* Real Interactive Leaflet Map */}
      <div className="absolute inset-0 z-0 bg-[#030712]">
        <MapContainer 
          center={INDORE_CENTER} 
          zoom={12} 
          zoomControl={false}
          ref={setMapRef}
          style={{ width: '100%', height: '100%', background: '#030712' }}
        >
          <ZoomControl position="bottomright" />
          
          <TileLayer
            url={mapStyle === 'satellite' 
              ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
              : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
            attribution='&copy; Map tiles'
          />
          
          {/* Render real map markers for buses */}
          {!loading && filteredBuses.map((bus) => {
            if (!bus.current_location || !bus.current_location.lat) return null;
            return (
              <Marker 
                key={bus.$id} 
                position={[bus.current_location.lat, bus.current_location.lng]}
                icon={createBusIcon(bus.bus_number)}
                eventHandlers={{
                  click: () => navigate(`/passenger/track/${bus.$id}`)
                }}
              >
                <Popup className="custom-popup">
                  <div className="font-bold text-slate-800">{bus.bus_number}</div>
                  <div className="text-xs text-slate-500 mt-1">{bus.route_id}</div>
                  <div className="text-xs font-bold text-blue-600 mt-2">{bus.speed_kmh || 0} km/h</div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()} />
          )}
        </MapContainer>
        
        {/* Floating Action Button for Location & Map Style */}
        <div className="absolute right-5 bottom-[40vh] z-[400] flex flex-col gap-3">
          <button 
            onClick={() => setMapStyle(mapStyle === 'satellite' ? 'dark' : 'satellite')}
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-colors border bg-[#0b101a]/90 backdrop-blur-md border-white/10 hover:bg-white/10 text-white"
          >
            <MapPin size={20} />
          </button>
          <button 
            onClick={locateUser}
            disabled={locating}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-colors border ${userLocation ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-[#0b101a]/90 backdrop-blur-md border-white/10 hover:bg-white/10 text-white'} ${locating ? 'opacity-70 animate-pulse' : ''}`}
          >
            <Crosshair size={22} />
          </button>
        </div>
        
        {/* Required CSS override for Leaflet zoom controls to fit dark theme */}
        <style>{`
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
            margin-bottom: 50vh !important;
          }
          .leaflet-control-zoom a {
            background-color: rgba(11, 16, 26, 0.9) !important;
            color: white !important;
            border-color: rgba(255,255,255,0.1) !important;
            backdrop-filter: blur(8px);
          }
          .leaflet-control-zoom a:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
        `}</style>
        
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
              placeholder="Search destination..."
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
      {/* Bottom Sheet for Results */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: searchQuery ? 0 : '70%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.5 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 50) setSearchParams({});
        }}
        className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0b101a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] touch-none flex flex-col pointer-events-auto"
        style={{ maxHeight: '60vh' }}
      >
        <div 
          className="w-full pt-2 pb-6 -mt-2 -mb-4 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-[18px] font-bold tracking-wide">
            {searchParams.get('q') ? 'Search Results' : 'Active Buses'}
          </h3>
          <span className="text-[13px] font-medium text-slate-400">{filteredBuses.length} found</span>
        </div>

        <div 
          className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 touch-pan-y"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus) => (
              <div 
                key={bus.$id}
                onClick={() => navigate(`/passenger/track/${bus.$id}`)}
                className="bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Navigation size={18} className="rotate-45" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors">{bus.bus_number}</h4>
                    <p className="text-[12px] text-slate-400">{bus.route_id}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-bold text-white">{bus.speed_kmh} <span className="text-[10px] text-slate-500 font-medium">km/h</span></p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Live</p>
                </div>
              </div>
            ))
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

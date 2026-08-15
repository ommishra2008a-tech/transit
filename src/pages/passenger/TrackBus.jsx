import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useDragControls } from 'framer-motion';
import { ArrowLeft, Clock, MapPin, Navigation, Map as MapIcon, Share2, Crosshair, Star } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { solarch } from '../../lib/solarch';

// Mock Route Coordinates for Indore Route
const ROUTE_COORDS = [
  [22.7196, 75.8577],
  [22.7210, 75.8600],
  [22.7230, 75.8620],
  [22.7250, 75.8650]
];

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

// Destination Pole
const createDestinationIcon = () => {
  return L.divIcon({
    className: 'custom-dest-marker',
    html: `
      <div class="relative flex flex-col items-center" style="width: 40px; height: 60px; margin-left: -20px; margin-top: -60px;">
        <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center border-[3px] border-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="w-1.5 h-6 bg-red-600 shadow-sm z-0 -mt-1 rounded-b-sm"></div>
        <div class="w-6 h-1.5 bg-black/40 rounded-[100%] blur-[2px] mt-0.5"></div>
      </div>
    `,
    iconSize: [40, 60],
    iconAnchor: [20, 60]
  });
};

// Origin Dot
const createOriginIcon = () => {
  return L.divIcon({
    className: 'custom-origin-marker',
    html: `
      <div class="relative flex flex-col items-center" style="width: 32px; height: 32px; margin-left: -16px; margin-top: -16px;">
        <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center border-[3px] border-white shadow-[0_4px_15px_rgba(0,0,0,0.4)] z-10">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
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

export default function TrackBus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mapRef, setMapRef] = useState(null);
  const dragControls = useDragControls();
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(localStorage.getItem(`fav_${id}`) === 'true');
  }, [id]);

  const toggleFavorite = () => {
    const newVal = !isFavorited;
    setIsFavorited(newVal);
    if (newVal) localStorage.setItem(`fav_${id}`, 'true');
    else localStorage.removeItem(`fav_${id}`);
  };

  const [error, setError] = useState(null);

  // Fetch real trip details and subscribe to live telemetry
  useEffect(() => {
    let unsubscribe = null;
    const init = async () => {
      try {
        const tripDoc = await solarch.db.collection('trips').getById(id);
        if (!tripDoc) throw new Error("Trip not found");
        setTrip(tripDoc);

        // Subscribe to live location SSE Stream
        unsubscribe = await solarch.db.collection('live_locations').subscribe(
          { filter: { trip_id: id } },
          (event) => {
            if (event.action === 'create' || event.action === 'update') {
               setTrip(prev => {
                 if (!prev) return prev;
                 return {
                   ...prev,
                   current_location: { lat: event.document.latitude, lng: event.document.longitude }
                 };
               });
            }
          }
        );
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

  const toggleLocation = () => {
    if (userLocation) {
      // Toggle Off
      setUserLocation(null);
      return;
    }
    
    // Toggle On
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
          mapRef.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Track My Bus',
          text: `Track my bus on route ${trip?.route_id || ''} live!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('User cancelled share or error:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const mapCenter = trip?.current_location ? [trip.current_location.lat, trip.current_location.lng] : ROUTE_COORDS[0];

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      
      {/* Real Interactive Leaflet Map Background */}
      <div className="absolute inset-0 z-0 bg-[#030712]">
        <MapContainer 
          center={mapCenter} 
          zoom={15} 
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
          
          {/* Draw Route Polyline */}
          <Polyline positions={ROUTE_COORDS} color="#3b82f6" weight={5} opacity={0.8} dashArray="10, 10" />
          
          {/* Draw Origin/Destination Stops */}
          <Marker position={ROUTE_COORDS[0]} icon={createOriginIcon()} />
          <Marker position={ROUTE_COORDS[ROUTE_COORDS.length - 1]} icon={createDestinationIcon()} />

          {/* Draw Live Bus */}
          {!loading && trip?.current_location && (
            <Marker position={[trip.current_location.lat, trip.current_location.lng]} icon={createBusIcon(trip.bus_number)} />
          )}

          {/* Render User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()} />
          )}
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
          <button onClick={handleShare} className="w-12 h-12 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg text-white">
            <Share2 size={20} />
          </button>
        </div>
      </header>

      {/* Floating Action Buttons */}
      <motion.div 
        animate={{ y: isMinimized ? 0 : -20 }}
        className="absolute right-5 bottom-[280px] z-[400] flex flex-col gap-3"
      >
        <button 
          onClick={toggleLocation}
          disabled={locating}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-colors border \${userLocation ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-[#0b101a]/90 backdrop-blur-md border-white/10 hover:bg-white/10 text-white'} \${locating ? 'opacity-70 animate-pulse' : ''}`}
        >
          <Crosshair size={22} />
        </button>
        <button 
          onClick={() => setMapStyle(mapStyle === 'satellite' ? 'dark' : 'satellite')}
          className="w-12 h-12 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg text-slate-300"
        >
          <MapIcon size={20} />
        </button>
      </motion.div>

      {/* Required CSS override for Leaflet zoom controls to fit dark theme */}
      <style>{`
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
          margin-bottom: 30vh !important;
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
          if (info.offset.y > 50) setIsMinimized(true);
          if (info.offset.y < -50) setIsMinimized(false);
        }}
        className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0b101a]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[32px] p-6 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] touch-none pointer-events-auto"
      >
        {/* Drag Indicator */}
        <div 
          className="w-full pt-2 pb-6 -mt-2 -mb-4 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
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

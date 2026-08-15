import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Bus, Navigation, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { solarch } from '../../lib/solarch';
import { fetchRoadSnappedRoute } from '../../lib/osrm';

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
      <div class="relative flex flex-col items-center group cursor-pointer" style="width: 32px; height: 32px; margin-left: -16px; margin-top: -16px;">
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
    iconAnchor: [16, 16]
  });
};

// Component to fetch and display driver info when a bus is clicked
const BusPopupContent = ({ bus }) => {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="p-1 min-w-[150px]">
      <h3 className="font-bold text-[#0b101a]">{bus.bus_number}</h3>
      <p className="text-xs text-slate-600 mt-1">{bus.route_id}</p>
      
      <div className="mt-3 pt-2 border-t border-slate-200">
        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Driver Info</p>
        {loading ? (
          <p className="text-xs text-slate-500">Loading...</p>
        ) : driver ? (
          <>
            <p className="text-sm font-bold text-slate-800">{driver.name || 'No Name'}</p>
            <p className="text-xs font-mono text-blue-600 font-bold mt-0.5">{driver.phone || 'No Phone'}</p>
          </>
        ) : (
          <p className="text-xs text-slate-500">No driver assigned</p>
        )}
      </div>

      <p className="text-xs font-bold text-amber-600 mt-3">{bus.speed_kmh || 0} km/h • {bus.status}</p>
    </div>
  );
};

export default function LiveMap() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapStyle, setMapStyle] = useState('satellite');

  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [routeLine, setRouteLine] = useState([]);
  const [stops, setStops] = useState([]);
  const [routeStatus, setRouteStatus] = useState('loading'); // 'loading', 'ok', 'failed'

  // Fetch real active trips for map
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await solarch.db.collection('trips').get({ limit: 50 });
        let docs = response?.items || response?.documents || [];
        
        setBuses(docs);
      } catch (err) {
        console.error('Failed to fetch buses for map:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
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
          style={{ width: '100%', height: '100%', background: '#030712' }}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url={mapStyle === 'satellite' 
              ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
              : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
            attribution='&copy; Map tiles'
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
          {!loading && buses.map((bus) => {
            if (!bus.current_location || !bus.current_location.lat) return null;
            return (
              <Marker 
                key={bus.$id} 
                position={[bus.current_location.lat, bus.current_location.lng]}
                icon={createAdminBusIcon(bus.bus_number, bus.status)}
                eventHandlers={{ click: () => setSelectedRouteId(bus.route_id) }}
              >
                <Popup className="custom-dark-popup">
                  <BusPopupContent bus={bus} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Header overlays */}
      <header className="relative z-10 px-5 pt-12 pb-4 pointer-events-none">
        {routeStatus === 'failed' && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[500] bg-slate-900/90 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl flex items-center gap-3 pointer-events-auto backdrop-blur-md">
            <span>⚠️ Route temporarily unavailable</span>
            <button 
              onClick={handleRetryRoute}
              className="px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 rounded-full font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex items-center gap-4 mb-4 pointer-events-auto">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 h-12 bg-[#0b101a]/90 backdrop-blur-md border border-white/10 rounded-full flex items-center px-4 shadow-lg">
            <Search size={18} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              placeholder="Search bus or driver..." 
              className="w-full bg-transparent border-none outline-none text-[14px] text-white placeholder:text-slate-500"
            />
          </div>

        </div>

        {/* Stats Row */}
        <div className="flex gap-3 pointer-events-auto">
          <div className="bg-[#0b101a]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[12px] font-bold text-white">{runningCount} Running</span>
          </div>
          <div className="bg-[#0b101a]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-[12px] font-bold text-white">{scheduledCount} Idle</span>
          </div>
        </div>
      </header>

      {/* Floating Action Buttons */}
      <div className="absolute right-5 bottom-8 z-10 flex flex-col gap-3">

        <button 
          onClick={() => setMapStyle(mapStyle === 'satellite' ? 'dark' : 'satellite')}
          className="w-12 h-12 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg text-slate-300"
        >
          <MapIcon size={20} />
        </button>
      </div>
      
      {/* Required CSS override for Leaflet to blend with UI */}
      <style>{`
        .custom-dark-popup .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .custom-dark-popup .leaflet-popup-tip {
          background-color: white;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
          margin-bottom: 120px !important;
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
    </div>
  );
}

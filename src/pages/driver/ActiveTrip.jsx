import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Target, Layers, Wifi, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { solarch } from '../../lib/solarch';

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

export default function ActiveTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [location, setLocation] = useState([22.7196, 75.8577]); // Default Indore
  const [speed, setSpeed] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [tripEnded, setTripEnded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [isTracking, setIsTracking] = useState(true);

  // Initialize Trip
  useEffect(() => {
    const initTrip = async () => {
      try {
        const response = await solarch.db.collection('trips').get({
          filter: { bus_number: user?.assigned_bus, status: 'IN_PROGRESS' },
          limit: 1
        });
        
        const docs = response?.items || response?.documents || [];
        if (docs.length > 0) {
          setTrip(docs[0]);
        } else {
          // If no active trip, go back to dashboard
          navigate('/driver');
        }
      } catch (err) {
        console.error('Failed to init active trip', err);
      }
    };

    if (user) initTrip();
  }, [user, navigate]);

  // Handle GPS Tracking
  useEffect(() => {
    let watchId;
    
    if (trip && isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const newLoc = [pos.coords.latitude, pos.coords.longitude];
          setLocation(newLoc);
          const calculatedSpeed = Math.round((pos.coords.speed || 0) * 3.6); // m/s to km/h
          setSpeed(calculatedSpeed);

          // Update Backend
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
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trip, isTracking]);

  const handleEndTrip = async () => {
    if (!trip) return;
    try {
      await solarch.db.collection('trips').update(trip.$id, {
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
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Trip Completed</h2>
          <p className="text-slate-400 text-sm mb-8">Your trip has been completed successfully. Great job!</p>
          
          <div className="grid grid-cols-3 w-full gap-2 mb-8">
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl">
              <span className="text-lg font-bold text-white">12.8</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">km Dist</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl">
              <span className="text-lg font-bold text-white">18</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Stops</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl">
              <span className="text-lg font-bold text-white">01:12</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Duration</span>
            </div>
          </div>

          <button onClick={() => navigate('/driver')} className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold mb-3 hover:bg-blue-500 transition-colors">
            View Summary
          </button>
          <button onClick={() => navigate('/driver')} className="text-slate-400 hover:text-white text-sm font-medium">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full relative bg-[#030712] overflow-hidden flex flex-col">
      {/* Top Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pt-12 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-white/10 transition-colors shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="bg-[#0b101a]/90 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full flex flex-col items-center pointer-events-auto shadow-lg">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Trip In Progress</span>
          <span className="text-[14px] font-bold text-white tracking-wide">{trip?.bus_number || 'Loading...'}</span>
        </div>
        
        <div className="flex items-center gap-2 pointer-events-auto">
          <button 
            onClick={() => setIsTracking(!isTracking)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${
              isTracking 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-rose-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{isTracking ? 'GPS ON' : 'GPS OFF'}</span>
          </button>
          <button 
            onClick={() => {/* Use navigate or context if available, but for now we dispatch to open sidebar if possible, though ActiveTrip is full screen. Let's redirect to dashboard which has sidebar */ navigate('/driver') }}
            className="w-10 h-10 rounded-full bg-[#0b101a]/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
          >
            <Layers size={20} />
          </button>
        </div>
      </div>

      {/* Map Layer */}
      <div className="flex-1 relative z-0">
        <MapContainer 
          center={location} 
          zoom={16} 
          className="w-full h-full"
          zoomControl={true}
        >
          {/* Google Maps Hybrid Satellite Tiles */}
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps'
          />
          {location && (
            <Marker position={location} icon={driverBusMarkerIcon}>
              <Popup className="custom-popup">
                <div className="font-bold text-slate-800">You are here</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        
        {/* Required CSS override for Leaflet to blend with UI */}
        <style>{`
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
            margin-top: 100px !important;
            margin-left: 20px !important;
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



      {/* Bottom Floating HUD */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: isMinimized ? '75%' : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.5 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 50) setIsMinimized(true);
          if (info.offset.y < -50) setIsMinimized(false);
        }}
        className="absolute bottom-0 left-0 right-0 z-[1000] pb-6 px-4 touch-none cursor-grab active:cursor-grabbing"
      >
        <div className="bg-[#0b101a]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {/* Drag Indicator */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4"></div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[22px] font-bold text-white">{speed}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Speed</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[22px] font-bold text-white">1.2<span className="text-sm text-slate-400">km</span></span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Distance</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[22px] font-bold text-white">12</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Stops Left</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 mb-5">
             <div className="flex items-center gap-2">
               <Target size={16} className="text-emerald-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider">GPS</span>
                 <span className="text-[12px] text-white font-bold">Strong</span>
               </div>
             </div>
             <div className="w-[1px] h-6 bg-white/10" />
             <div className="flex items-center gap-2">
               <Wifi size={16} className="text-emerald-400" />
               <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wider">Signal</span>
                 <span className="text-[12px] text-white font-bold">Excellent</span>
               </div>
             </div>
          </div>

          <button 
            onClick={() => setShowEndConfirm(true)}
            className="w-full h-[56px] bg-rose-600 hover:bg-rose-500 text-white font-bold text-[16px] rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition-all"
          >
            End Trip
          </button>

        </div>
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
    </div>
  );
}

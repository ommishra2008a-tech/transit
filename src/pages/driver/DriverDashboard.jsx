import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, User as UserIcon, Home, Clock, Play, Star, MapPin, Bus, ArrowRight, Bookmark, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';
import { solarch } from '../../lib/solarch';
import AuthRequiredModal from '../../components/AuthRequiredModal';
import { getTimeAwareGreeting } from '../../utils/greeting';
import { getFavoritePlaces, removeFavoritePlace, getFavoriteRoutes, isRouteFavorite, saveFavoriteRoute, removeFavoriteRoute } from '../../utils/favorites';

export default function DriverDashboard() {
  const { user, requireDriverApproval } = useAuth();
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const [assignedTrip, setAssignedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('starting or managing trips');
  const [favFilterTab, setFavFilterTab] = useState('all');

  const isRealDriver = user && (user.role || '').toUpperCase() === 'DRIVER';

  useEffect(() => {
    // Only enforce setup & approval redirects for actual DRIVER accounts
    if (isRealDriver) {
      if (requireDriverApproval && user?.approval_status === 'PENDING') {
        navigate('/driver/pending', { replace: true });
        return;
      }

      if (!user.name || !user.phone || !user.assigned_bus) {
        navigate('/driver/setup', { replace: true });
      }
    }
  }, [user, requireDriverApproval, isRealDriver, navigate]);

  // Fetch assigned trip for this driver or a sample trip for view-only exploration
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        let docs = [];
        if (user?.assigned_bus) {
          const response = await solarch.db.collection('trips').get({
            filter: { bus_number: user.assigned_bus },
            limit: 1
          });
          docs = response?.items || response?.documents || [];
        }

        if (docs.length === 0) {
          // If no specific bus is assigned yet, fetch active trip
          const anyResponse = await solarch.db.collection('trips').get({ limit: 1 });
          docs = anyResponse?.items || anyResponse?.documents || [];
        }

        if (docs.length > 0) {
          setAssignedTrip(docs[0]);
        } else {
          setAssignedTrip(null);
        }
      } catch (err) {
        console.error('Failed to fetch assigned trip:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [user]);

  const handleStartTrip = async () => {
    if (!isRealDriver) {
      setAuthActionName('starting or managing trips');
      setAuthModalOpen(true);
      return;
    }

    if (!assignedTrip) return;
    try {
      if (assignedTrip.status !== 'IN_PROGRESS') {
        await solarch.db.collection('trips').update(assignedTrip.$id || assignedTrip.id, {
          status: 'IN_PROGRESS',
          start_time: new Date().toISOString()
        });
      }
      navigate('/driver/trip');
    } catch (err) {
      console.error('Failed to start trip', err);
      alert('Could not start trip. Check connection.');
    }
  };

  const handleToggleAssignedFavorite = () => {
    if (!assignedTrip) return;
    if (!isRealDriver) {
      setAuthActionName('saving favorite routes');
      setAuthModalOpen(true);
      return;
    }
    const id = assignedTrip.$id || assignedTrip.id || assignedTrip.bus_number;
    if (isRouteFavorite(id)) {
      removeFavoriteRoute(id);
    } else {
      saveFavoriteRoute(assignedTrip);
    }
  };

  const handleRemovePlace = (placeId) => {
    if (!isRealDriver) {
      setAuthActionName('managing favorite places');
      setAuthModalOpen(true);
      return;
    }
    removeFavoritePlace(placeId);
  };

  const handleRemoveRoute = (routeId) => {
    if (!isRealDriver) {
      setAuthActionName('managing favorite routes');
      setAuthModalOpen(true);
      return;
    }
    removeFavoriteRoute(routeId);
  };

  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);

  useEffect(() => {
    const loadFavs = () => {
      setFavoritePlaces(getFavoritePlaces());
      setFavoriteRoutes(getFavoriteRoutes());
    };
    loadFavs();
    window.addEventListener('smarttransit_favorites_updated', loadFavs);
    return () => window.removeEventListener('smarttransit_favorites_updated', loadFavs);
  }, []);

  const userName = user?.name || user?.email?.split('@')[0] || 'Driver';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const greeting = getTimeAwareGreeting();

  const isTripActive = assignedTrip?.status === 'IN_PROGRESS';

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.02] bg-[url('https://images.unsplash.com/photo-1555626906-fcf10d6851b4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-screen"></div>

      <div className="flex-1 overflow-y-auto pb-24 relative z-10 px-5 pt-12">
        <header className="flex items-center justify-between mb-8">
          <button onClick={openSidebar} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden cursor-pointer">
             <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </header>

        {/* Greeting Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-slate-400 text-[13px] font-medium tracking-wide uppercase mb-1">{greeting},</p>
          <h2 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-2">
            {capitalizedName}
            {!isRealDriver && (
              <span className="text-xs px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-normal">
                View Only
              </span>
            )}
          </h2>
        </motion.div>

        {/* Assigned Shift Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl mb-6"
        >
          {/* subtle glow behind card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] pointer-events-none"></div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Assigned Bus</p>
              <div className="flex items-center gap-2">
                <h3 className="text-[22px] font-bold text-white tracking-wide">{assignedTrip ? assignedTrip.bus_number : 'No Trip Assigned'}</h3>
                {assignedTrip && (
                  <button
                    onClick={handleToggleAssignedFavorite}
                    className={`p-1.5 rounded-full border transition-colors ${
                      isRouteFavorite(assignedTrip.$id || assignedTrip.bus_number)
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title={isRouteFavorite(assignedTrip.$id || assignedTrip.bus_number) ? "Remove Route from Favorites" : "Save Route to Favorites"}
                  >
                    <Star size={15} fill={isRouteFavorite(assignedTrip.$id || assignedTrip.bus_number) ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
              <p className="text-[13px] text-slate-400 mt-0.5">{assignedTrip ? assignedTrip.route_id : 'Please contact admin for a schedule.'}</p>
            </div>
            {/* Minimal Bus Graphic */}
            <div className="w-16 h-12 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center">
              <img src="/vite.svg" alt="Bus" className="w-8 opacity-50 grayscale" />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-b border-white/5 mb-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Start Time</span>
              <span className="text-[14px] font-bold text-white">{assignedTrip?.start_time ? new Date(assignedTrip.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Status</span>
              <span className="text-[12px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{assignedTrip?.status || 'Waiting'}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[20px] font-bold text-white">0</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">km Dist</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[20px] font-bold text-white">0</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Stops</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3">
              <span className="text-[20px] font-bold text-white">00:00</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Duration</span>
            </div>
          </div>

          <button 
            onClick={handleStartTrip}
            disabled={loading || !assignedTrip}
            className={`w-full h-[56px] text-white font-bold text-[16px] rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 group ${!assignedTrip ? 'bg-slate-600 opacity-50 cursor-not-allowed shadow-none hover:shadow-none' : isTripActive ? 'bg-blue-600' : 'bg-gradient-to-r from-emerald-600 to-emerald-500'}`}
          >
            <Play fill="currentColor" size={16} className="group-hover:scale-110 transition-transform" />
            <span>{isTripActive ? 'Resume Trip' : 'Start Trip'}</span>
          </button>
        </motion.div>

        {/* Saved Places & Starred Routes Widget for Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0b101a]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bookmark size={18} className="fill-amber-400/30" />
              </div>
              <div>
                <h4 className="text-[16px] font-bold text-white">Saved Places & Routes</h4>
                <p className="text-[11px] text-slate-400">Quick access to bookmarked locations & routes</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full">
              {favoritePlaces.length + favoriteRoutes.length} Items
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFavFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                favFilterTab === 'all'
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              All ({favoritePlaces.length + favoriteRoutes.length})
            </button>
            <button
              onClick={() => setFavFilterTab('places')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                favFilterTab === 'places'
                  ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              📍 Places ({favoritePlaces.length})
            </button>
            <button
              onClick={() => setFavFilterTab('routes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                favFilterTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
              }`}
            >
              🚌 Routes ({favoriteRoutes.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Show Saved Places */}
            {(favFilterTab === 'all' || favFilterTab === 'places') && favoritePlaces.map((place) => (
              <div 
                key={place.id}
                className="bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-3 flex items-center justify-between transition-all group"
              >
                <div 
                  onClick={() => navigate(`/passenger/map?lat=${place.lat}&lng=${place.lng}`)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">{place.name || 'Pinned Location'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(`/passenger/map?lat=${place.lat}&lng=${place.lng}`)}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-colors flex items-center gap-1"
                  >
                    <span>Map</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => handleRemovePlace(place.id)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                    title="Delete saved place"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Show Favorite Routes */}
            {(favFilterTab === 'all' || favFilterTab === 'routes') && favoriteRoutes.map((route) => {
              const routeId = route.$id || route.id || route.bus_number;
              return (
                <div 
                  key={routeId}
                  className="bg-white/5 hover:bg-white/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-3 flex items-center justify-between transition-all group"
                >
                  <div 
                    onClick={() => navigate(`/passenger/track/${encodeURIComponent(routeId)}`)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Bus size={18} />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">{route.bus_number}</p>
                      <p className="text-[10px] text-slate-400 truncate">{route.route_id || 'Active Route'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => navigate(`/passenger/track/${encodeURIComponent(routeId)}`)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-colors flex items-center gap-1"
                    >
                      <span>Track</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveRoute(routeId)}
                      className="w-8 h-8 rounded-xl bg-amber-500/15 hover:bg-rose-500/20 text-amber-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                      title="Remove favorite route"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {((favFilterTab === 'all' && favoritePlaces.length === 0 && favoriteRoutes.length === 0) ||
              (favFilterTab === 'places' && favoritePlaces.length === 0) ||
              (favFilterTab === 'routes' && favoriteRoutes.length === 0)) && (
              <div className="py-6 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2.5">
                  <Star size={18} />
                </div>
                <p className="text-xs font-semibold text-slate-300">No {favFilterTab === 'places' ? 'places' : favFilterTab === 'routes' ? 'routes' : 'favourites'} saved yet</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Use the star icon on your assigned shift or pin places on the live map</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/90 backdrop-blur-2xl border-t border-white/5 pb-safe pt-2 px-6">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          <button onClick={() => navigate('/driver')} className="flex flex-col items-center gap-1.5 text-blue-500">
            <Home size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-semibold">Dashboard</span>
          </button>
          <button onClick={() => navigate('/driver/trip')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <Clock size={22} />
            <span className="text-[10px] font-medium">My Trips</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <UserIcon size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>

      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        requiredRole="Driver"
        actionName={authActionName}
      />
    </div>
  );
}

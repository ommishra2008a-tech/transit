import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Home, Bus, Navigation, Map as MapIcon, Plus, User as UserIcon, Star, MapPin, ArrowRight, Bookmark, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';
import { solarch } from '../../lib/solarch';
import { getFavoritePlaces, removeFavoritePlace, getFavoriteRoutes, removeFavoriteRoute } from '../../utils/favorites';
import AuthRequiredModal from '../../components/AuthRequiredModal';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, running: 0 });
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [favFilterTab, setFavFilterTab] = useState('all');

  const isRealAdmin = user && (user.role || '').toUpperCase() === 'ADMIN';

  // Fetch admin stats and active trips
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const allTrips = await solarch.db.collection('trips').get({ limit: 100 });
        const trips = allTrips?.items || allTrips?.documents || [];
        const running = trips.filter(t => t.status === 'IN_PROGRESS');
        const active = trips.filter(t => t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED');
        
        setStats({
          total: trips.length,
          active: active.length,
          running: running.length
        });
        setActiveTrips(running.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

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

  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex-1 overflow-y-auto pb-24 relative z-10 px-5 pt-12">
        <header className="flex items-center justify-between mb-8">
          <button onClick={openSidebar} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden cursor-pointer">
             <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff`} alt="Admin" className="w-full h-full object-cover" />
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-[28px] font-bold tracking-tight text-white flex flex-col">
            <span className="text-[14px] font-medium text-slate-400 mb-1">Welcome Back,</span>
            <span className="flex items-center gap-2">
              {capitalizedName}
              {!isRealAdmin && (
                <span className="text-xs px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-normal">
                  View Only
                </span>
              )}
            </span>
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          <div className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-semibold">Total Buses</span>
            <span className="text-[28px] font-bold text-white">{stats.total}</span>
          </div>
          <div className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-semibold">Active Buses</span>
            <span className="text-[28px] font-bold text-white">{stats.active}</span>
          </div>
          <div className="bg-blue-600/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.1)]">
            <span className="text-[10px] text-blue-400 uppercase tracking-widest mb-1 font-semibold">Running</span>
            <span className="text-[28px] font-bold text-blue-400">{stats.running}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 rounded-[24px] p-5 shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[14px] font-bold text-white tracking-wide">Live Overview</h3>
            <button onClick={() => navigate('/admin/map')} className="text-[12px] font-medium text-blue-400 hover:text-blue-300">View Map {'>'}</button>
          </div>
          <div className="h-[120px] w-full flex items-end justify-between gap-1 relative opacity-80">
             {[40, 70, 45, 90, 65, 80, 50, 100, 75, 85, 60, 40].map((h, i) => (
                <div key={i} className="w-full bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                  <div className="w-full bg-gradient-to-t from-blue-600/50 to-cyan-400 rounded-t-sm" style={{ height: '40%' }}></div>
                </div>
             ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-bold text-white tracking-wide">Active Trips</h3>
            <span className="text-[18px] font-bold text-slate-300">{activeTrips.length || 18}</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#0b101a]/50 border border-white/5 rounded-2xl h-[88px] animate-pulse"></div>
              ))
            ) : activeTrips.length > 0 ? (
              activeTrips.map((trip) => (
                <div 
                  key={trip.$id} 
                  onClick={() => navigate(`/admin/map?route_id=${encodeURIComponent(trip.route_id || trip.bus_number)}`)}
                  className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400">
                      <Bus size={20} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-bold text-white tracking-wide">{trip.bus_number || 'BUS'}</h4>
                      <p className="text-[12px] text-slate-400">{trip.route_id || 'Route'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">Active</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 p-4">
                No active trips found.
              </div>
            )}
          </div>
        </motion.div>

        {/* Saved Places & Starred Routes Widget for Admin */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0b101a]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl mt-8 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bookmark size={18} className="fill-amber-400/30" />
              </div>
              <div>
                <h4 className="text-[16px] font-bold text-white">Saved Places & Routes</h4>
                <p className="text-[11px] text-slate-400">Direct navigation to bookmarked pins & routes</p>
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
                  onClick={() => navigate(`/admin/map?lat=${place.lat}&lng=${place.lng}`)}
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
                    onClick={() => navigate(`/admin/map?lat=${place.lat}&lng=${place.lng}`)}
                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-xl shadow-[0_0_8px_rgba(168,85,247,0.3)] transition-colors flex items-center gap-1"
                  >
                    <span>Map</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => removeFavoritePlace(place.id)}
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
              const queryTarget = route.route_id || route.bus_number || routeId;
              return (
                <div 
                  key={routeId}
                  className="bg-white/5 hover:bg-white/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-3 flex items-center justify-between transition-all group"
                >
                  <div 
                    onClick={() => navigate(`/admin/map?route_id=${encodeURIComponent(queryTarget)}`)}
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
                      onClick={() => navigate(`/admin/map?route_id=${encodeURIComponent(queryTarget)}`)}
                      className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-[0_0_8px_rgba(37,99,235,0.3)] transition-colors flex items-center gap-1"
                    >
                      <span>Live</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={() => removeFavoriteRoute(routeId)}
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
                <p className="text-[10px] text-slate-500 mt-0.5">Use the star icon on buses or pin places on the live map</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/90 backdrop-blur-2xl border-t border-white/5 pb-safe pt-2 px-6">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1.5 text-blue-500">
            <Home size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-semibold">Dashboard</span>
          </button>
          <button onClick={() => navigate('/admin/buses')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <Bus size={22} />
            <span className="text-[10px] font-medium">Buses</span>
          </button>
          <button onClick={() => navigate('/admin/map')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <MapIcon size={22} />
            <span className="text-[10px] font-medium">Live Map</span>
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
        requiredRole="Admin"
        actionName="modifying administrator settings"
      />
    </div>
  );
}

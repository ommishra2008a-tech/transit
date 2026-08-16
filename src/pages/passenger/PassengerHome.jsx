import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, MapPin, Navigation, Bus, Clock, Bell, User as UserIcon, Home, Star, Map as MapIcon, Heart, Trash2, ArrowRight, Bookmark } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../contexts/SidebarContext';
import { solarch } from '../../lib/solarch';
import { fuzzySearch } from '../../utils/fuzzySearch';
import { getTimeAwareGreeting } from '../../utils/greeting';
import { getFavoritePlaces, removeFavoritePlace, getFavoriteRoutes, removeFavoriteRoute } from '../../utils/favorites';

export default function PassengerHome() {
  const { user } = useAuth();
  const { openSidebar } = useSidebar();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [favoritePlaces, setFavoritePlaces] = useState([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);
  const [favFilterTab, setFavFilterTab] = useState('all'); // 'all' | 'places' | 'routes'
  const favoritesRef = useRef(null);

  // Load and subscribe to favorites updates
  useEffect(() => {
    const loadFavorites = () => {
      setFavoritePlaces(getFavoritePlaces());
      setFavoriteRoutes(getFavoriteRoutes());
    };
    loadFavorites();

    window.addEventListener('smarttransit_favorites_updated', loadFavorites);
    return () => window.removeEventListener('smarttransit_favorites_updated', loadFavorites);
  }, []);

  // Fetch active trips (buses)
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await solarch.db.collection('trips').get({ 
          filter: { status: 'IN_PROGRESS' },
          limit: 10 
        });
        
        const docs = response?.items || response?.documents || [];
        setBuses(docs);
      } catch (err) {
        console.error('Failed to fetch buses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuses();
  }, []);

  // Use fuzzy search for typo tolerance
  const filteredBuses = fuzzySearch(searchQuery, buses, ['bus_number', 'route_id']);

  const userName = user?.name || user?.email?.split('@')[0] || 'Passenger';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const greeting = getTimeAwareGreeting();

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030712] to-[#030712] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-screen"></div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 relative z-10 px-5 pt-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button onClick={openSidebar} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#030712]"></span>
            </button>
            <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
            </button>
          </div>
        </header>

        {/* Greeting Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-2">
            {greeting}, <br/> {capitalizedName} <span className="text-2xl animate-waving-hand origin-bottom-right inline-block">👋</span>
          </h2>
          <p className="text-slate-400 text-[15px] mt-1.5">Where do you want to go today?</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8 group"
        >
          <form onSubmit={(e) => { e.preventDefault(); navigate(`/passenger/map?q=${encodeURIComponent(searchQuery)}`); }} className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search buses, routes or stops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b101a]/80 backdrop-blur-md border border-white/10 text-white text-[15px] placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-[#0f172a] focus:ring-1 focus:ring-blue-500/50 h-[56px] rounded-2xl pl-12 pr-[100px] outline-none transition-all shadow-inner"
            />
            <button type="submit" className="absolute right-2 h-[40px] px-4 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors">
              Search
            </button>
          </form>
        </motion.div>

        {/* Quick Action Cards (Gamification / Stats) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {/* Nearby Buses */}
          <div className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bus size={20} />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold text-white">Nearby</p>
              <p className="text-[10px] text-slate-500">{filteredBuses.length} Buses</p>
            </div>
          </div>
          
          {/* Live Tracking */}
          <div onClick={() => navigate('/passenger/map')} className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <MapIcon size={20} />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold text-white">Tracking</p>
              <p className="text-[10px] text-slate-500">Real-time</p>
            </div>
          </div>

          {/* Favourites */}
          <div 
            onClick={() => favoritesRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-br from-amber-500/15 to-orange-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/25 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Star size={20} className="fill-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-bold text-amber-400">Favourites</p>
              <p className="text-[10px] text-amber-300 font-semibold">{favoritePlaces.length + favoriteRoutes.length} Saved</p>
            </div>
          </div>
        </motion.div>


        {/* Dedicated Saved Places & Favourite Routes Section */}
        <motion.div
          ref={favoritesRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mb-8 bg-[#0b101a]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bookmark size={18} className="fill-amber-400/30" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-white tracking-wide flex items-center gap-2">
                  Saved & Favourites
                </h3>
                <p className="text-[11px] text-slate-400">Quick access to pinned places & starred buses</p>
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

          {/* Favorites List Items */}
          <div className="space-y-3">
            {/* Show Saved Places */}
            {(favFilterTab === 'all' || favFilterTab === 'places') && favoritePlaces.map((place) => (
              <div 
                key={place.id}
                className="bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-purple-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white group-hover:text-purple-300 transition-colors">
                      {place.name || 'Pinned Location'}
                    </h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/passenger/map?lat=${place.lat}&lng=${place.lng}`)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-colors flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => removeFavoritePlace(place.id)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                    title="Remove from saved places"
                  >
                    <Trash2 size={15} />
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
                  className="bg-white/5 hover:bg-white/10 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Bus size={20} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-white group-hover:text-blue-300 transition-colors">
                        {route.bus_number}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {route.route_id || 'Active Route'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/passenger/track/${routeId}`)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-colors flex items-center gap-1"
                    >
                      <span>Track</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={() => removeFavoriteRoute(routeId)}
                      className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-colors"
                      title="Unfavorite route"
                    >
                      <Star size={16} className="fill-amber-400" />
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
                  <Star size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-300">No {favFilterTab === 'places' ? 'places' : favFilterTab === 'routes' ? 'routes' : 'favourites'} saved yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[260px] mx-auto">
                  Drop a pin on the map or tap the star (⭐) icon on any bus to save it for quick access.
                </p>
                <button
                  onClick={() => navigate('/passenger/map')}
                  className="mt-3 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Explore Map
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Nearby Buses Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[18px] font-semibold text-white tracking-wide">Nearby Buses</h3>
            <button className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors">View all</button>
          </div>

          <div className="space-y-3">
            {loading ? (
              // Skeleton Loading State
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#0b101a]/50 border border-white/5 rounded-2xl h-[88px] animate-pulse"></div>
              ))
            ) : filteredBuses.length > 0 ? (
              filteredBuses.map((bus) => (
                <div 
                  key={bus.$id || bus.id || bus.bus_number}
                  onClick={() => navigate(`/passenger/track/${encodeURIComponent(bus.$id || bus.id || bus.bus_number)}`)}
                  className="bg-[#0b101a]/80 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 flex flex-col gap-1 shadow-lg cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-[15px] font-bold text-white group-hover:text-blue-400 transition-colors tracking-wide">{bus.bus_number || 'BUS-00X'}</h4>
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]"></div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[13px] text-slate-400 font-medium">Route ID: {bus.route_id || 'Unknown Route'}</p>
                    <div className="text-right">
                      <p className="text-[14px] font-bold text-white">2 min</p>
                      <p className="text-[10px] text-slate-500 font-medium">Away</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#0b101a]/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-3">
                  <Bus size={24} />
                </div>
                <h4 className="text-white font-medium text-sm">No Active Buses</h4>
                <p className="text-xs text-slate-500 mt-1">There are no buses running nearby at the moment.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070b13]/90 backdrop-blur-2xl border-t border-white/5 pb-safe pt-2 px-6">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          <button onClick={() => navigate('/passenger')} className="flex flex-col items-center gap-1.5 text-blue-500">
            <Home size={22} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[10px] font-semibold">Home</span>
          </button>
          <button onClick={() => navigate('/passenger/map')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <MapPin size={22} />
            <span className="text-[10px] font-medium">Map</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <UserIcon size={22} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

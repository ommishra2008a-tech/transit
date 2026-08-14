import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bus, Calendar, Wallet, History, Zap, MapPin, QrCode, Compass, Flame, Leaf, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getBuses } from '../../services/bus.service';
import { getRoutes } from '../../services/route.service';
import BusCard from '../../components/BusCard/BusCard';
import RouteCard from '../../components/RouteCard/RouteCard';
import Input from '../../components/ui/Input';
import TicketModal from '../../components/TicketModal';
import PageContainer from '../../components/layout/PageContainer';
import ResponsiveGrid from '../../components/layout/ResponsiveGrid';

export default function PassengerHome() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buses');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Gamification state
  const ecoPoints = 280;
  const streakDays = 6;
  const co2SavedKg = 18.4;

  useEffect(() => {
    Promise.all([getBuses(), getRoutes()])
      .then(([b, r]) => { setBuses(b || []); setRoutes(r || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredBuses = buses.filter((bus) => {
    const q = search.toLowerCase();
    const route = bus.expand?.route_id;
    return (
      bus.bus_number.toLowerCase().includes(q) ||
      route?.route_name?.toLowerCase().includes(q) ||
      route?.start_location?.toLowerCase().includes(q) ||
      route?.end_location?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <PageContainer narrow>
        <div className="skeleton h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </PageContainer>
    );
  }

  const activeBus = buses[0];
  const activeRoute = activeBus?.expand?.route_id;

  return (
    <PageContainer narrow className="pb-24">
      {/* ===== GAMIFICATION ECO STREAK BANNER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3.5 rounded-2xl bg-[#0e1626] border border-[#1e2a3f] flex items-center justify-between text-xs font-mono backdrop-blur-md shadow-lg"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <Leaf size={18} />
          </div>
          <div>
            <p className="font-extrabold text-white text-xs leading-none">Eco Commuter Level 3</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{co2SavedKg} kg CO₂ Saved</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xs">
            <Flame size={15} className="animate-pulse" />
            <span>{streakDays}d Streak</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[#00d2ff] font-extrabold text-[11px]">
            {ecoPoints} PTS
          </div>
        </div>
      </motion.div>

      {/* ===== HERO TRIP CARD (EXACT MATCH TO SCREENSHOT 3 & 4) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#0e1626] border border-[#1e2a3f] rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        {/* Top 3D Isometric Map Graphic Header */}
        <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
            alt="Isometric Transit Map"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-[#0e1626]/40 to-transparent" />
          
          {/* Top overlay badge */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-700 backdrop-blur-md text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1.5">
            <Compass size={12} className="text-[#00d2ff] animate-spin" style={{ animationDuration: '8s' }} />
            <span>LIVE COMMUTE TRACKER</span>
          </div>
        </div>

        {/* Hero Card Details (Matched to Screenshot 3 & 4) */}
        <div className="p-5 sm:p-6 pt-2 space-y-4">
          
          {/* Badge & Train/Bus Line */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ff5533] text-white text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-md shadow-rose-600/30">
              EN ROUTE
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              {activeBus?.bus_number || 'BUS 101'} • Express
            </span>
          </div>

          {/* Destination & Arrival Time */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              {activeRoute?.end_location || 'Central Station'}
            </h2>
            <p className="text-sm sm:text-base font-extrabold text-[#00d2ff] mt-1">
              Arriving in 14 mins
            </p>
          </div>

          {/* Timeline Nodes (Matched to Screenshot 3 & 4) */}
          <div className="space-y-3 py-1">
            {/* Departed Node */}
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-500 border-2 border-[#0e1626] flex-shrink-0" />
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Departed</p>
                <p className="text-xs font-extrabold text-slate-200">{activeRoute?.start_location || 'Uptown Hub'}</p>
              </div>
            </div>

            {/* Next Stop Node */}
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#00d2ff] border-2 border-[#0e1626] shadow-md shadow-cyan-500/50 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-mono font-bold text-[#00d2ff] uppercase">Next Stop</p>
                <p className="text-xs font-extrabold text-white">{activeRoute?.end_location || 'Central Station'}</p>
              </div>
            </div>
          </div>

          {/* Cyan CTA Button: View Ticket (Matched to Screenshot 3 & 4) */}
          <button
            type="button"
            onClick={() => setTicketModalOpen(true)}
            className="w-full h-12 rounded-2xl bg-[#0096a6] hover:bg-[#00808c] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer transition-all active:scale-[0.98]"
          >
            <QrCode size={18} />
            View Ticket
          </button>
        </div>
      </motion.div>

      {/* ===== QUICK ACTIONS SECTION (EXACT MATCH TO SCREENSHOT 3 & 4) ===== */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-white font-extrabold text-lg">
          <Zap size={20} className="text-[#00d2ff]" />
          <span>Quick Actions</span>
        </div>

        {/* 2x2 Grid of Square Dark Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Book Ride */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTicketModalOpen(true)}
            className="p-5 rounded-3xl bg-[#0e1626] border border-[#1e2a3f] flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-cyan-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1b263b] text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bus size={22} />
            </div>
            <span className="text-xs font-extrabold text-white">Book Ride</span>
          </motion.div>

          {/* Card 2: Schedule */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('routes')}
            className="p-5 rounded-3xl bg-[#0e1626] border border-[#1e2a3f] flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-cyan-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1b263b] text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={22} />
            </div>
            <span className="text-xs font-extrabold text-white">Schedule</span>
          </motion.div>

          {/* Card 3: Top-up Wallet */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert(`Wallet Balance: $48.50 | Eco Points: ${ecoPoints}`)}
            className="p-5 rounded-3xl bg-[#0e1626] border border-[#1e2a3f] flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-cyan-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1b263b] text-coral-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet size={22} className="text-[#ff6b4a]" />
            </div>
            <span className="text-xs font-extrabold text-white">Top-up Wallet</span>
          </motion.div>

          {/* Card 4: History */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('buses')}
            className="p-5 rounded-3xl bg-[#0e1626] border border-[#1e2a3f] flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-cyan-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-[#1b263b] text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <History size={22} />
            </div>
            <span className="text-xs font-extrabold text-white">History</span>
          </motion.div>
        </div>
      </div>

      {/* Search Input & Fleet List Section */}
      <div className="pt-3 space-y-3">
        <Input
          icon={Search}
          placeholder="Search bus number or route corridor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0e1626] border-[#1e2a3f] text-white placeholder:text-slate-500 focus:border-[#00d2ff]"
        />

        <ResponsiveGrid>
          {filteredBuses.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </ResponsiveGrid>
      </div>

      {/* Ticket Modal (Matched to Screenshot 5) */}
      <TicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        bus={activeBus}
        route={activeRoute}
      />
    </PageContainer>
  );
}

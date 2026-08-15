import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus, Bus, Filter } from 'lucide-react';
import { solarch } from '../../lib/solarch';
import { fuzzySearch } from '../../utils/fuzzySearch';

export default function BusesManagement() {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const response = await solarch.db.collection('trips').get({ limit: 50 });
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

  const tabs = ['All', 'Active', 'Running', 'Offline'];

  const displayBuses = buses.map(b => ({
    $id: b.$id,
    bus_number: b.bus_number,
    route_id: b.route_id,
    status: b.status === 'IN_PROGRESS' ? 'Running' : b.status === 'SCHEDULED' ? 'Active' : 'Offline'
  }));

  const statusFilteredBuses = displayBuses.filter(bus => activeTab === 'All' || bus.status === activeTab);
  
  // Apply fuzzy search
  const filteredBuses = fuzzySearch(searchQuery, statusFilteredBuses, ['bus_number', 'route_id']);

  return (
    <div className="h-dvh bg-[#030712] text-white flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030712] to-[#030712] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-5 pt-12 pb-6 border-b border-white/5 flex flex-col gap-5 bg-[#0b101a]/80 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[20px] font-bold tracking-wide">Buses</h1>
          </div>
          <button onClick={() => navigate('/admin/drivers/add')} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[12px] font-bold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Plus size={16} strokeWidth={3} />
            Add Driver
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search buses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#030712] border border-white/10 text-white text-[14px] placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 h-[48px] rounded-xl pl-11 pr-[85px] outline-none transition-all shadow-inner"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 h-[36px] px-4 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors">
            Search
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-5 py-4 border-b border-white/5 overflow-x-auto no-scrollbar relative z-10 bg-[#070b13]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-500' 
                  : 'bg-[#0b101a] text-slate-400 border border-white/5 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-6 relative z-10 space-y-3 pb-20">
        {loading ? (
           Array(5).fill(0).map((_, i) => (
             <div key={i} className="bg-[#0b101a]/50 border border-white/5 rounded-2xl h-[72px] animate-pulse"></div>
           ))
        ) : filteredBuses.length > 0 ? filteredBuses.map(bus => {
          const getStatusBadge = (status) => {
            switch(status) {
              case 'Running':
                return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">Running</span>;
              case 'Active':
                return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">Active</span>;
              case 'Offline':
                return <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 uppercase tracking-wider">Offline</span>;
              default:
                return null;
            }
          };

          return (
            <div key={bus.$id} className="bg-[#0b101a]/80 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  bus.status === 'Offline' ? 'bg-white/5 text-slate-500' : 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'
                }`}>
                  <Bus size={20} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-white tracking-wide">{bus.bus_number}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{bus.route_id}</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(bus.status)}
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <Bus size={48} className="mb-4 opacity-50" />
            <p className="text-[16px] font-medium">No buses found</p>
            <p className="text-[12px] mt-1 text-center max-w-xs">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

    </div>
  );
}

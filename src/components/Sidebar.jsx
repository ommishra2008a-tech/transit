import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  Home, Map as MapIcon, Navigation, Star, User as UserIcon, 
  Settings as SettingsIcon, HelpCircle, Info, LogOut, Bus, Users, Clock, LayoutDashboard, X, ShieldAlert, Compass, Eye
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = (user.role || 'PASSENGER').toUpperCase();
  const currentPath = location.pathname;

  // Determine current context for navigation links
  const isInAdminSection = currentPath.startsWith('/admin');
  const isInDriverSection = currentPath.startsWith('/driver');

  const getLinks = () => {
    if (isInAdminSection) {
      return [
        { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin' },
        { icon: Bus, label: 'Buses Management', path: '/admin/buses' },
        { icon: MapIcon, label: 'Live Map', path: '/admin/map' },
        { icon: Users, label: 'Add Driver', path: '/admin/drivers/add' },
        { icon: ShieldAlert, label: 'Driver Approvals', path: '/admin/drivers/approvals' },
        { icon: SettingsIcon, label: 'Admin Settings', path: '/admin/settings' },
        { icon: UserIcon, label: 'My Profile', path: '/profile' }
      ];
    }

    if (isInDriverSection) {
      return [
        { icon: LayoutDashboard, label: 'Driver Dashboard', path: '/driver' },
        { icon: Clock, label: 'Active Trip', path: '/driver/trip' },
        { icon: UserIcon, label: 'My Profile', path: '/profile' }
      ];
    }

    // Default PASSENGER view
    return [
      { icon: Home, label: 'Home', path: '/passenger' },
      { icon: MapIcon, label: 'Transit Map', path: '/passenger/map' },
      { icon: UserIcon, label: 'My Profile', path: '/profile' }
    ];
  };

  const links = getLinks();
  const userName = user.name || user.email?.split('@')[0] || 'User';
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  const handleNavigate = (path) => {
    if (path !== '#') navigate(path);
    closeSidebar();
  };

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 z-[3999] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[290px] bg-[#0b101a] border-r border-white/5 z-[4000] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* User Profile Header */}
            <div className="p-6 pb-6 border-b border-white/5 relative bg-white/[0.02]">
              <button onClick={closeSidebar} className="absolute top-6 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3.5 mt-1">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden shrink-0">
                   <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-[15px] truncate">{capitalizedName}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <p className="text-slate-400 text-[11px] uppercase tracking-widest font-semibold">{role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-5 px-4 space-y-1 custom-scrollbar">
              <div className="px-3 pb-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {isInAdminSection ? 'Admin Controls' : isInDriverSection ? 'Driver Controls' : 'Passenger Menu'}
              </div>

              {links.map((link, idx) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(link.path)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] font-semibold' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : ''} />
                    <span className="text-[13px] tracking-wide">{link.label}</span>
                  </button>
                );
              })}

              {/* Explore Dashboards (Demo/View-Only Mode) */}
              <div className="pt-5 mt-4 border-t border-white/5">
                <div className="px-3 pb-2 flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-400/80 tracking-wider">
                  <Compass size={12} />
                  <span>Explore Dashboards (View Only)</span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('/passenger')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      !isInAdminSection && !isInDriverSection
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home size={16} />
                      <span>Passenger View</span>
                    </div>
                    {role === 'PASSENGER' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">Your Role</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigate('/driver')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isInDriverSection
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={16} />
                      <span>Driver View</span>
                    </div>
                    {role !== 'DRIVER' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium">Demo</span>
                    )}
                  </button>

                  <button
                    onClick={() => handleNavigate('/admin')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                      isInAdminSection
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard size={16} />
                      <span>Admin View</span>
                    </div>
                    {role !== 'ADMIN' && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-medium">Demo</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.01]">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-xs font-semibold"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

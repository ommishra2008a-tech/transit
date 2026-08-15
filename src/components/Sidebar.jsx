import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  Home, Map as MapIcon, Navigation, Star, User as UserIcon, 
  Settings as SettingsIcon, HelpCircle, Info, LogOut, Bus, Users, Clock, LayoutDashboard, X, ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.email?.includes('driver') ? 'DRIVER' : user.email?.includes('admin') ? 'ADMIN' : 'PASSENGER';

  const getLinks = () => {
    switch(role) {
      case 'DRIVER':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/driver' },
          { icon: Clock, label: 'My Trips', path: '/driver/trip' },
          { icon: UserIcon, label: 'Profile', path: '/profile' }
        ];
      case 'ADMIN':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
          { icon: Bus, label: 'Buses', path: '/admin/buses' },
          { icon: MapIcon, label: 'Live Map', path: '/admin/live-map' },
          { icon: Users, label: 'Drivers Form', path: '/admin/drivers/add' },
          { icon: ShieldAlert, label: 'Approvals', path: '/admin/approvals' },
          { icon: SettingsIcon, label: 'Settings', path: '/admin/settings' },
          { icon: UserIcon, label: 'Profile', path: '/profile' }
        ];
      default:
        // PASSENGER
        return [
          { icon: Home, label: 'Home', path: '/passenger' },
          { icon: MapIcon, label: 'Map', path: '/passenger/map' },
          { icon: UserIcon, label: 'Profile', path: '/profile' }
        ];
    }
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
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0b101a] border-r border-white/5 z-[2001] flex flex-col shadow-2xl"
          >
            <div className="p-6 pb-8 border-b border-white/5 relative">
              <button onClick={closeSidebar} className="absolute top-6 right-4 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${capitalizedName}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-[16px]">{capitalizedName}</h3>
                  <p className="text-slate-400 text-[12px] uppercase tracking-widest">{role}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              {links.map((link, idx) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(link.path)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : ''} />
                    <span className="text-[14px] font-medium tracking-wide">{link.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-white/5">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-[14px] font-medium tracking-wide">Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Home, Bus, LayoutDashboard, Route as RouteIcon, MapPin, Sun, Moon, Radio, Navigation } from 'lucide-react';
import SmartTransitLogo from '../SmartTransitLogo';

const mobileNavItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Transit', icon: Home },
  ],
  DRIVER: [
    { path: '/driver', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/driver/trip', label: 'Active Trip', icon: Navigation },
  ],
  ADMIN: [
    { path: '/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/admin/buses', label: 'Fleet', icon: Bus },
    { path: '/admin/routes', label: 'Routes', icon: RouteIcon },
    { path: '/admin/live-map', label: 'Live Map', icon: MapPin },
  ],
};

const desktopNavItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Transit Home', icon: Home },
  ],
  DRIVER: [
    { path: '/driver', label: 'Driver Portal', icon: LayoutDashboard },
    { path: '/driver/trip', label: 'Active Trip', icon: Navigation },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/buses', label: 'Bus Fleet', icon: Bus },
    { path: '/admin/routes', label: 'Routes & Stops', icon: RouteIcon },
    { path: '/admin/live-map', label: 'Live Fleet Map', icon: MapPin },
  ],
};

function getUserInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0]?.toUpperCase() || 'U';
}

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const mobileItems = mobileNavItems[role] || mobileNavItems.PASSENGER;
  const deskItems = desktopNavItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getUserInitials(user?.name);

  return (
    <>
      {/* ===== DESKTOP TOP NAVBAR ===== */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/90 dark:bg-[#090d16]/90 border-b border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-95 transition-opacity flex-shrink-0">
            <SmartTransitLogo layout="horizontal" />
          </Link>

          <nav className="flex items-center gap-1.5 ml-6">
            {deskItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path + item.label}
                  to={item.path}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 select-none ${
                    isActive
                      ? 'text-[#0047BA] dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <ItemIcon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Connection Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/40">
              <Radio size={12} className="text-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                LIVE SSE
              </span>
            </div>

            {/* Theme Toggle Button */}
            <motion.button
              type="button"
              whileTap={{ rotate: 180, scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </motion.button>

            {/* User Profile Avatar / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left group"
                title="Click to Logout"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {initials}
                </div>
                <div className="hidden xl:block pr-1">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-tight truncate max-w-[100px]">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                    {role}
                  </p>
                </div>
                <LogOut size={15} className="text-slate-400 group-hover:text-rose-500 transition-colors ml-1" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM NAVIGATION DOCK ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-slate-200/80 dark:border-slate-800 px-3 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-[60px] max-w-md mx-auto">
          {mobileItems.map((item, idx) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label + idx}
                to={item.path}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[64px] transition-all select-none ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-950/80 rounded-2xl border border-blue-200/60 dark:border-blue-800/80 -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <ItemIcon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="text-[10px] font-mono font-bold mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Theme & Logout Quick Triggers on Mobile Dock */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-amber-400 transition-colors select-none"
            title="Toggle Dark/Light Mode"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            <span className="text-[10px] font-mono font-bold mt-0.5 tracking-tight">Theme</span>
          </button>
        </div>
      </div>
    </>
  );
}

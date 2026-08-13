import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Home, Bus, LayoutDashboard, Route as RouteIcon, MapPin, User, Sun, Moon, Navigation2, Users } from 'lucide-react';
import SmartTransitLogo from '../SmartTransitLogo';
import Button from '../ui/Button';

const navItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Home', icon: Home },
  ],
  DRIVER: [
    { path: '/driver', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/driver', label: 'Tracking', icon: Navigation2 },
    { path: '/admin/buses', label: 'Fleet', icon: Bus },
    { path: '/driver', label: 'Profile', icon: User },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/buses', label: 'Fleet', icon: Bus },
    { path: '/admin/routes', label: 'Routes', icon: RouteIcon },
    { path: '/admin/live-map', label: 'Map', icon: MapPin },
  ],
};

// Desktop nav (top bar links)
const desktopNavItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Transit Home', icon: Home },
  ],
  DRIVER: [
    { path: '/driver', label: 'Driver Dashboard', icon: Bus },
  ],
  ADMIN: [
    { path: '/admin', label: 'Fleet Overview', icon: LayoutDashboard },
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

  const mobileItems = navItems[role] || [];
  const deskItems = desktopNavItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getUserInitials(user?.name);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center hover:opacity-95 transition-opacity flex-shrink-0">
          <SmartTransitLogo layout="horizontal" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 ml-6">
          {deskItems.map((item) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ItemIcon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Online badge + Theme + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Online status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Online</span>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>

          {/* User avatar with initials */}
          <div
            className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all"
            onClick={handleLogout}
            title={`${user?.name || 'User'} — Click to logout`}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM NAVIGATION DOCK ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-center h-[60px]">
          {mobileItems.map((item, idx) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path && idx === 0;
            return (
              <Link
                key={item.label + idx}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-xl min-w-[56px] transition-all ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <ItemIcon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-semibold ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

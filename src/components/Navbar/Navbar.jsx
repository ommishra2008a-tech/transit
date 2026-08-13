import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Home, Bus, LayoutDashboard, Route as RouteIcon, MapPin, User, Activity, Sun, Moon } from 'lucide-react';
import SmartTransitLogo from '../SmartTransitLogo';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const navItems = {
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

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Platform Subtitle */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
            <SmartTransitLogo layout="horizontal" className="h-8" />
          </Link>

          {/* Realtime Live Status Ticker */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Activity size={14} className="text-emerald-600 animate-pulse" />
            <span>SOLARCH REALTIME ACTIVE</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            {items.map((item) => {
              const ItemIcon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ItemIcon size={16} className={isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme Switcher, User Profile & Logout Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>

          <Badge variant="active" className="hidden sm:inline-flex bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 px-3 py-1">
            {role}
          </Badge>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
              <User size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{user?.name || 'Operator'}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg">
        <div className="flex justify-around">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <ItemIcon size={18} className="mb-0.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Home, Bus, LayoutDashboard, Route as RouteIcon, MapPin, User, Sun, Moon, Bell, Navigation2 } from 'lucide-react';
import SmartTransitLogo from '../SmartTransitLogo';

const mobileNavItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/passenger', label: 'Routes', icon: Bus },
    { path: '/passenger/track/1', label: 'Live Map', icon: MapPin },
    { path: '/passenger', label: 'Alerts', icon: Bell },
  ],
  DRIVER: [
    { path: '/driver', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/driver/trip', label: 'Trips', icon: Navigation2 },
    { path: '/driver/trip', label: 'Tracking', icon: MapPin },
    { path: '/driver', label: 'Fleet', icon: Bus },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/routes', label: 'Routes', icon: Bus },
    { path: '/admin/live-map', label: 'Live Map', icon: MapPin },
    { path: '/admin', label: 'Alerts', icon: Bell },
  ],
};

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

  const mobileItems = mobileNavItems[role] || mobileNavItems.PASSENGER;
  const deskItems = desktopNavItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getUserInitials(user?.name);

  return (
    <>
      {/* Top Header for Desktop */}
      <header className="hidden md:block sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
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
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0047BA] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ItemIcon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Online</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            <div
              className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all"
              onClick={handleLogout}
              title={`${user?.name || 'User'} — Click to logout`}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM DOCK (MATCHES SCREENSHOTS EXACTLY) ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 px-3 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-[62px]">
          {mobileItems.map((item, idx) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label + idx}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[68px] transition-all ${
                  isActive
                    ? 'bg-[#dbeafe] dark:bg-blue-950/80 text-[#0047BA] dark:text-blue-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <ItemIcon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[11px] font-mono font-bold mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

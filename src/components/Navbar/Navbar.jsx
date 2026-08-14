import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, LayoutGrid, Compass, Ticket, User, Sun, Moon, LogOut, Bus, MapPin, Route as RouteIcon, Navigation2 } from 'lucide-react';
import SmartTransitLogo from '../SmartTransitLogo';

const mobileNavItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Home', icon: LayoutGrid },
    { path: '/passenger', label: 'Routes', icon: Compass },
    { path: '/passenger/bus/1', label: 'Tickets', icon: Ticket },
    { path: '/passenger', label: 'Profile', icon: User },
  ],
  DRIVER: [
    { path: '/driver', label: 'Dashboard', icon: LayoutGrid },
    { path: '/driver/trip', label: 'Tracking', icon: Navigation2 },
    { path: '/driver', label: 'Profile', icon: User },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: LayoutGrid },
    { path: '/admin/buses', label: 'Fleet', icon: Bus },
    { path: '/admin/routes', label: 'Routes', icon: RouteIcon },
    { path: '/admin/live-map', label: 'Live Map', icon: MapPin },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mobileItems = mobileNavItems[role] || mobileNavItems.PASSENGER;
  const initials = getUserInitials(user?.name);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ===== TOP BAR (MATCHES SCREENSHOT 3 & 4) ===== */}
      <header className="sticky top-0 z-40 bg-[#070e1c]/95 border-b border-[#1b273d] backdrop-blur-md text-white transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-[#131d31] cursor-pointer transition-colors"
              title="Toggle Menu"
            >
              <Menu size={22} />
            </button>

            {/* SmartTransit Logo */}
            <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
              <SmartTransitLogo layout="horizontal" iconSize={32} />
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-[#131d31] transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* User Profile Avatar */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-cyan-500/20 cursor-pointer border border-cyan-400/40 hover:scale-105 transition-all"
              title={`${user?.name || 'User'} — Tap to logout`}
            >
              {initials}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="z-40 bg-[#0e1626] border-b border-[#1e2a3f] px-4 py-3 text-white shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between py-2 border-b border-[#1e2a3f] mb-3">
              <div>
                <p className="text-sm font-extrabold text-white">{user?.name || 'Commuter'}</p>
                <p className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{role} ROLE</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-1.5"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <Link to="/passenger" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-[#131d31] hover:bg-cyan-950/40 text-slate-200">
                Transit Home
              </Link>
              {role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-[#131d31] hover:bg-cyan-950/40 text-[#00d2ff]">
                  Admin Fleet
                </Link>
              )}
              {role === 'DRIVER' && (
                <Link to="/driver" onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-[#131d31] hover:bg-cyan-950/40 text-[#00d2ff]">
                  Driver Console
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MOBILE BOTTOM NAVIGATION DOCK (MATCHES SCREENSHOT 3 & 4) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070d18]/95 border-t border-[#1b273d] px-3 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex justify-around items-center h-[62px] max-w-md mx-auto">
          {mobileItems.map((item, idx) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label + idx}
                to={item.path}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl min-w-[66px] transition-all select-none ${
                  isActive
                    ? 'text-[#00d2ff] font-extrabold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDockTab"
                    className="absolute inset-0 bg-[#0f2a3a]/80 rounded-2xl border border-cyan-500/30 -z-10 shadow-lg shadow-cyan-500/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <ItemIcon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="text-[11px] font-mono font-bold mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

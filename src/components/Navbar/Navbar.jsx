import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SmartTransitLogo from '../SmartTransitLogo';

const navItems = {
  PASSENGER: [
    { path: '/passenger', label: 'Home', icon: '🏠' },
  ],
  DRIVER: [
    { path: '/driver', label: 'Dashboard', icon: '🚌' },
  ],
  ADMIN: [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/buses', label: 'Buses', icon: '🚌' },
    { path: '/admin/routes', label: 'Routes', icon: '🗺️' },
    { path: '/admin/live-map', label: 'Live Map', icon: '📍' },
  ],
};

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <SmartTransitLogo layout="horizontal" className="h-8" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  location.pathname === item.path
                    ? 'bg-[#f0f4ff] text-[#142d76]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#f0f4ff] text-[#142d76] text-xs font-bold uppercase tracking-wider">
            {role}
          </span>
          <span className="text-sm font-medium text-slate-700 hidden md:block">{user?.name || user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
        <div className="flex justify-around">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === item.path
                  ? 'text-[#142d76] bg-[#f0f4ff]'
                  : 'text-slate-500'
              }`}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

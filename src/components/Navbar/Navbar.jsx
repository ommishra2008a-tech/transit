import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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

  const roleBadge = {
    PASSENGER: { label: 'Passenger', class: 'badge-active' },
    DRIVER: { label: 'Driver', class: 'badge-running' },
    ADMIN: { label: 'Admin', class: 'badge-scheduled' },
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-surface-950/80 border-b border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-surface-100 hover:text-primary-400 transition-colors">
            <span className="text-2xl">🚍</span>
            <span className="hidden sm:inline">SmartTransit</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
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
          <span className={`badge ${roleBadge[role]?.class || 'badge-inactive'} hidden sm:flex`}>
            {roleBadge[role]?.label || role}
          </span>
          <span className="text-sm text-surface-400 hidden md:block">{user?.name || user?.email}</span>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-950/95 backdrop-blur-xl border-t border-surface-800/50 px-2 py-1">
        <div className="flex justify-around">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg text-xs transition-all ${
                location.pathname === item.path
                  ? 'text-primary-400'
                  : 'text-surface-500'
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

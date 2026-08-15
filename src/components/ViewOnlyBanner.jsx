import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Eye, ArrowLeft, Lock } from 'lucide-react';

export default function ViewOnlyBanner() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const realRole = (user.role || 'PASSENGER').toUpperCase();
  const pathname = location.pathname;

  const isAdminRoute = pathname.startsWith('/admin');
  const isDriverRoute = pathname.startsWith('/driver');

  const isViewOnlyAdmin = isAdminRoute && realRole !== 'ADMIN';
  const isViewOnlyDriver = isDriverRoute && realRole !== 'DRIVER' && realRole !== 'ADMIN';

  if (!isViewOnlyAdmin && !isViewOnlyDriver) return null;

  const modeText = isViewOnlyAdmin 
    ? 'Viewing Admin Dashboard — View Only' 
    : 'Viewing Driver Dashboard — View Only';

  return (
    <div className="sticky top-0 z-[3000] bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-amber-950/95 border-b border-amber-500/30 px-4 py-2 backdrop-blur-md text-amber-200 text-xs font-medium flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-full bg-amber-500/20 text-amber-400">
          <Eye size={14} />
        </span>
        <span className="font-semibold">{modeText}</span>
        <span className="hidden sm:inline text-amber-400/70">• Actions are restricted</span>
      </div>
      <button
        onClick={() => navigate('/passenger')}
        className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
      >
        <ArrowLeft size={12} />
        <span>Back to Passenger</span>
      </button>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getBusById } from '../../services/bus.service';
import { getStopsByRoute } from '../../services/route.service';
import StopList from '../../components/StopList/StopList';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import PageContainer from '../../components/layout/PageContainer';

export default function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBusById(id)
      .then((b) => {
        setBus(b);
        if (b?.route_id) return getStopsByRoute(b.route_id);
        return [];
      })
      .then((s) => setStops(s))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageContainer narrow>
        <div className="skeleton h-12 w-full rounded-2xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="skeleton h-64 w-full rounded-2xl" />
      </PageContainer>
    );
  }

  if (!bus) {
    return (
      <PageContainer narrow>
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🚫</p>
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Bus vehicle not found</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Go Back
          </Button>
        </div>
      </PageContainer>
    );
  }

  const route = bus.expand?.route_id;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-5 md:px-6 py-4 sm:py-5 space-y-4 animate-slide-up">
          {/* Navigation & Title Header */}
          <div className="flex items-center justify-between pb-1 sm:pb-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="rounded-lg sm:rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs"
            >
              <ArrowLeft size={15} /> Back
            </Button>
            <div className="text-right min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{bus.bus_number}</h1>
              <p className="text-[10px] sm:text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 truncate">{bus.registration_number}</p>
            </div>
          </div>

          {/* Route Overview Card */}
          {route && (
            <Card className="p-4 sm:p-5 border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Route Line</p>
                  <div className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg md:text-xl flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="truncate">{route.start_location}</span>
                    <span className="text-slate-400 flex-shrink-0">→</span>
                    <span className="truncate">{route.end_location}</span>
                  </div>
                </div>
                <Badge variant={bus.status === 'RUNNING' ? 'running' : 'active'} pulse={bus.status === 'RUNNING'}>
                  {bus.status}
                </Badge>
              </div>
            </Card>
          )}

          {/* Stop Sequence Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center justify-between text-slate-900 dark:text-white">
                <span>Route Stop Sequence</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stops.length} Stops</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <StopList stops={stops} currentStopIndex={0} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full h-12 sm:h-14 text-sm sm:text-base font-extrabold shadow-lg shadow-blue-600/20 cursor-pointer rounded-xl sm:rounded-2xl"
            onClick={() => navigate(`/passenger/track/${bus.id}`)}
          >
            <MapPin size={18} />
            Track Bus Live
          </Button>
        </div>
      </div>
    </div>
  );
}

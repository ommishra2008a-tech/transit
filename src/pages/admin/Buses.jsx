import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus as BusIcon, ShieldCheck } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Card } from '../../components/ui/Card';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';

export default function Buses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBuses()
      .then((b) => setBuses(b || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="skeleton h-24 w-full rounded-3xl" />
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Bus Fleet Inventory 🚌"
        subtitle={`Managing ${buses.length} registered vehicle fleet units.`}
        badge="Fleet Registry"
        badgeIcon={ShieldCheck}
      />

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {buses.map((bus, idx) => (
          <motion.div
            key={bus.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.2 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900">
                    <BusIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 dark:text-white text-base truncate">{bus.bus_number}</p>
                    <p className="text-xs font-mono font-semibold text-slate-400 dark:text-slate-500 truncate">{bus.registration_number}</p>
                  </div>
                </div>
                <StatusBadge status={bus.status} />
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div>
                  <span className="text-slate-400">Route: </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{bus.expand?.route_id?.route_name || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Driver: </span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">{bus.expand?.driver_id?.name || 'Unassigned'}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="overflow-hidden bg-white/95 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800 hidden md:block backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-mono uppercase font-bold tracking-wider">
                <th className="p-4">Bus Number</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Assigned Route</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors">
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-100 dark:border-blue-900">
                      <BusIcon size={18} />
                    </div>
                    {bus.bus_number}
                  </td>
                  <td className="p-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{bus.registration_number}</td>
                  <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">
                    {bus.expand?.route_id?.route_name || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                  </td>
                  <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">
                    {bus.expand?.driver_id?.name || <span className="text-slate-400 font-normal italic">Unassigned</span>}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={bus.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}

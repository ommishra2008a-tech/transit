import { useState, useEffect } from 'react';
import { Bus as BusIcon } from 'lucide-react';
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
      .then(setBuses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        light
        title="Bus Fleet Management 🚌"
        subtitle={`${buses.length} registered bus vehicles`}
      />

      {/* Fleet Table — Mobile: card list, Desktop: table */}
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {buses.map((bus) => (
          <Card key={bus.id} className="p-3.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <BusIcon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{bus.bus_number}</p>
                  <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">{bus.registration_number}</p>
                </div>
              </div>
              <StatusBadge status={bus.status} />
            </div>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <div>
                <span className="text-slate-400 dark:text-slate-500">Route: </span>
                <span className="text-slate-700 dark:text-slate-300">{bus.expand?.route_id?.route_name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Driver: </span>
                <span className="text-slate-700 dark:text-slate-300">{bus.expand?.driver_id?.name || 'Unassigned'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop table view */}
      <Card className="overflow-hidden animate-fade-in bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="p-4">Bus Number</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Assigned Route</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                      <BusIcon size={16} />
                    </div>
                    {bus.bus_number}
                  </td>
                  <td className="p-4 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{bus.registration_number}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    {bus.expand?.route_id?.route_name || <span className="text-slate-400 dark:text-slate-600 font-normal">Unassigned</span>}
                  </td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                    {bus.expand?.driver_id?.name || <span className="text-slate-400 dark:text-slate-600 font-normal">Unassigned</span>}
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

import { useState, useEffect } from 'react';
import { Bus as BusIcon } from 'lucide-react';
import { getBuses } from '../../services/bus.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import { Card } from '../../components/ui/Card';

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
      <div className="p-6 max-w-6xl mx-auto space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6 space-y-6">
      <div className="animate-fade-in bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-950">Bus Fleet Management 🚌</h1>
          <p className="text-slate-500 text-sm mt-0.5">{buses.length} registered bus vehicles</p>
        </div>
      </div>

      {/* Fleet Table */}
      <Card className="overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                <th className="p-4">Bus Number</th>
                <th className="p-4">Registration</th>
                <th className="p-4">Assigned Route</th>
                <th className="p-4">Assigned Driver</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center font-bold">
                      <BusIcon size={16} />
                    </div>
                    {bus.bus_number}
                  </td>
                  <td className="p-4 font-mono text-xs font-semibold text-slate-500">{bus.registration_number}</td>
                  <td className="p-4 font-semibold text-slate-700">
                    {bus.expand?.route_id?.route_name || <span className="text-slate-400 font-normal">Unassigned</span>}
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    {bus.expand?.driver_id?.name || <span className="text-slate-400 font-normal">Unassigned</span>}
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
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getBuses } from '../../services/bus.service';
import StatusBadge from '../../components/StatusBadge/StatusBadge';

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
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto pb-24 md:pb-6">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-surface-100">Bus Management 🚌</h1>
        <p className="text-surface-500">{buses.length} buses in the system</p>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/50 text-left">
                <th className="p-4 text-surface-400 font-medium">Bus</th>
                <th className="p-4 text-surface-400 font-medium">Registration</th>
                <th className="p-4 text-surface-400 font-medium">Route</th>
                <th className="p-4 text-surface-400 font-medium">Driver</th>
                <th className="p-4 text-surface-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus, idx) => (
                <tr
                  key={bus.id}
                  className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚌</span>
                      <span className="font-semibold text-surface-100">{bus.bus_number}</span>
                    </div>
                  </td>
                  <td className="p-4 text-surface-400">{bus.registration_number}</td>
                  <td className="p-4 text-surface-300">
                    {bus.expand?.route_id?.route_name || <span className="text-surface-600">Unassigned</span>}
                  </td>
                  <td className="p-4 text-surface-300">
                    {bus.expand?.driver_id?.name || <span className="text-surface-600">Unassigned</span>}
                  </td>
                  <td className="p-4"><StatusBadge status={bus.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

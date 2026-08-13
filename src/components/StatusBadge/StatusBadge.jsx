export default function StatusBadge({ status }) {
  const statusMap = {
    RUNNING: 'badge-running',
    ACTIVE: 'badge-active',
    INACTIVE: 'badge-inactive',
    OFFLINE: 'badge-offline',
    SCHEDULED: 'badge-scheduled',
    COMPLETED: 'badge-completed',
  };

  const dotColors = {
    RUNNING: 'bg-green-400',
    ACTIVE: 'bg-blue-400',
    INACTIVE: 'bg-gray-400',
    OFFLINE: 'bg-red-400',
    SCHEDULED: 'bg-amber-400',
    COMPLETED: 'bg-green-400',
  };

  return (
    <span className={`badge ${statusMap[status] || 'badge-inactive'}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColors[status] || 'bg-gray-400'} ${status === 'RUNNING' ? 'animate-pulse-dot' : ''}`} />
      {status}
    </span>
  );
}

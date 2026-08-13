import Badge from '../ui/Badge';

export default function StatusBadge({ status }) {
  const normalized = (status || 'INACTIVE').toUpperCase();

  const variantMap = {
    RUNNING: 'running',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OFFLINE: 'offline',
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
  };

  return (
    <Badge variant={variantMap[normalized] || 'default'} pulse={normalized === 'RUNNING'}>
      {normalized}
    </Badge>
  );
}

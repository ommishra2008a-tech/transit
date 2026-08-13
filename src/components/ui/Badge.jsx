import { cn } from '../../lib/utils';

export default function Badge({ children, variant = 'default', className, pulse = false, ...props }) {
  const variants = {
    default: 'bg-primary-50 text-primary-700 border-primary-200',
    running: 'bg-emerald-600 text-white border-emerald-600',
    active: 'bg-primary-700 text-white border-primary-700',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    offline: 'bg-red-50 text-red-700 border-red-200',
    scheduled: 'bg-amber-50 text-amber-800 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };

  const isRunning = variant === 'running' || variant === 'RUNNING';
  const matchedVariant = typeof variant === 'string' ? variant.toLowerCase() : 'default';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase border',
        variants[matchedVariant] || variants.default,
        className
      )}
      {...props}
    >
      {(pulse || isRunning) && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      )}
      {children}
    </span>
  );
}

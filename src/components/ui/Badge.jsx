import { cn } from '../../lib/utils';

export default function Badge({ children, variant = 'default', className, pulse = false, ...props }) {
  const variants = {
    default: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
    running: 'bg-emerald-500 text-white border-emerald-400/30 shadow-xs shadow-emerald-500/20 font-extrabold',
    active: 'bg-blue-600 text-white border-blue-500/30 shadow-xs shadow-blue-600/20 font-extrabold',
    inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    offline: 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
    scheduled: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    completed: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    live: 'bg-cyan-500 text-white border-cyan-400/30 shadow-xs shadow-cyan-500/20 font-extrabold',
  };

  const matchedVariant = typeof variant === 'string' ? variant.toLowerCase() : 'default';
  const isPulseActive = pulse || matchedVariant === 'running' || matchedVariant === 'live';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase border select-none',
        variants[matchedVariant] || variants.default,
        className
      )}
      {...props}
    >
      {isPulseActive && (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

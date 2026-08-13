/**
 * PageHeader — Reusable hero/header banner for every dashboard page.
 * 
 * Handles:
 *   - Dark gradient banner with ambient glow
 *   - Responsive text sizing
 *   - Optional subtitle / badge / right-side stats
 *   - Consistent height + spacing across all viewports
 *
 * Usage:
 *   <PageHeader
 *     title="Hello, Passenger 👋"
 *     subtitle="Search active transit lines"
 *     badge="Live Passenger Command"
 *     badgeIcon={Compass}
 *     right={<StatCards />}
 *   />
 */
export default function PageHeader({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  statusPill,
  right,
  light = false,
}) {
  if (light) {
    return (
      <div className="animate-fade-in bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {badge && (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-2.5">
              {BadgeIcon && <BadgeIcon size={13} className="animate-pulse flex-shrink-0" />}
              <span className="truncate">{badge}</span>
            </div>
          )}
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-300 text-xs sm:text-sm mt-1 line-clamp-2">{subtitle}</p>
          )}
        </div>

        {/* Right side: status pill or stat counters */}
        {(statusPill || right) && (
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2 sm:gap-3">
            {statusPill}
            {right}
          </div>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';

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
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white/95 dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 backdrop-blur-md"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-0.5 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 lg:p-8 shadow-xl shadow-blue-950/20 border border-blue-900/40 relative overflow-hidden"
    >
      {/* Radial ambient background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
              {BadgeIcon && <BadgeIcon size={12} className="animate-pulse text-blue-400 flex-shrink-0" />}
              <span className="truncate">{badge}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white break-words">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 line-clamp-2">{subtitle}</p>
          )}
        </div>

        {(statusPill || right) && (
          <div className="flex-shrink-0 flex flex-wrap items-center gap-2 sm:gap-3">
            {statusPill}
            {right}
          </div>
        )}
      </div>
    </motion.div>
  );
}

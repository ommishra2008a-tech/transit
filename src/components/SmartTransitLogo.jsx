import { Bus, Navigation2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartTransitLogo({ className = '', layout = 'horizontal', iconSize = 20 }) {
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 mb-3 border border-blue-400/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Bus size={28} strokeWidth={2.2} className="relative z-10" />
        </motion.div>
        
        <div className="font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
          <span className="text-xl text-blue-600 dark:text-blue-400 font-mono tracking-wider">SMART</span>
          <span className="text-xl text-slate-900 dark:text-white font-mono tracking-wider ml-1.5">TRANSIT</span>
        </div>
        
        <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold tracking-widest uppercase border border-blue-200/80 dark:border-blue-800 flex items-center gap-1">
          <Navigation2 size={10} className="text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>MOBILITY PLATFORM</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none whitespace-nowrap flex-shrink-0 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/25 flex-shrink-0 border border-blue-400/30"
      >
        <Bus size={iconSize} strokeWidth={2.2} />
      </motion.div>

      <div className="font-extrabold tracking-wider leading-none flex items-center gap-1.5 py-0.5">
        <span className="text-base sm:text-lg text-blue-600 dark:text-blue-400 font-mono tracking-tight font-extrabold">SMART</span>
        <span className="text-base sm:text-lg text-slate-900 dark:text-white font-mono tracking-tight font-extrabold">TRANSIT</span>
      </div>
    </div>
  );
}

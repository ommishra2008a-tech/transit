import { motion } from 'framer-motion';
import { Bus } from 'lucide-react';

export default function SmartTransitLogo({ className = '', layout = 'horizontal', iconSize = 40 }) {
  const LogoMark = ({ size = 40 }) => (
    <div 
      className="relative flex items-center justify-center bg-blue-600 rounded-[14px] shadow-[0_0_15px_rgba(37,99,235,0.5)]"
      style={{ width: size, height: size }}
    >
      <Bus size={size * 0.6} className="text-white" strokeWidth={2.5} />
    </div>
  );

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Blue Logo Card */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="mb-4 relative group cursor-pointer"
        >
          <LogoMark size={72} />
        </motion.div>

        {/* Title */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="font-bold tracking-wide text-2xl sm:text-3xl leading-none flex items-center justify-center cursor-pointer text-white uppercase"
        >
          SMART<span className="font-light text-blue-400">TRANSIT</span>
        </motion.div>

        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          Smart Way to Travel
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      className={`flex items-center gap-3 select-none whitespace-nowrap flex-shrink-0 cursor-pointer ${className}`}
    >
      <LogoMark size={iconSize} />
      <div className="flex flex-col">
        <div className="font-bold tracking-wide text-lg leading-none flex items-center text-white uppercase">
          SMART<span className="font-light text-blue-400">TRANSIT</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Smart Way to Travel
        </p>
      </div>
    </motion.div>
  );
}

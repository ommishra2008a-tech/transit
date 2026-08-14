import { motion } from 'framer-motion';

/**
 * SmartTransit Stylized "S" Emblem & Lighting Logo Component
 * - Stylized "S" emblem with cyan neon lighting glow
 * - "Smart" (White with subtle glow) + "Transit" (Neon Cyan with lighting effect)
 * - Spring bounce & light shine interaction on hover/tap
 */
export default function SmartTransitLogo({ className = '', layout = 'horizontal', iconSize = 40 }) {
  const SMark = ({ size = 40 }) => (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none"
      >
        <defs>
          <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#888888" />
          </linearGradient>
        </defs>

        {/* Stylized "S" Curved Geometry */}
        <path
          d="M 72 28 C 72 18, 56 16, 42 16 C 26 16, 18 26, 18 40 C 18 64, 82 46, 82 72 C 82 88, 66 90, 44 90 C 26 90, 16 80, 16 70"
          stroke="url(#sGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Dark Accent */}
        <path
          d="M 68 26 C 68 20, 56 18, 44 18 C 30 18, 22 26, 22 38"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </div>
  );

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Dark Logo Card with Bounce Interaction */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="w-24 h-24 rounded-2xl bg-[#14151a] border border-[#2a2c35] flex items-center justify-center shadow-2xl mb-4 relative overflow-hidden group cursor-pointer"
        >
          <SMark size={48} />
        </motion.div>

        {/* Title */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="font-extrabold tracking-tight text-4xl leading-none flex items-center justify-center cursor-pointer text-[#8be2e3]"
        >
          SmartTransit
        </motion.div>

        <p className="mt-2 text-[13px] font-medium text-slate-300/80">
          Next-gen cinematic mobility
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
      <SMark size={iconSize} />
      <div className="font-extrabold tracking-tight text-2xl leading-none flex items-center text-[#8be2e3]">
        SmartTransit
      </div>
    </motion.div>
  );
}

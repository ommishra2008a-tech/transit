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
      {/* Outer Cyan Neon Glow Ring */}
      <div 
        className="absolute inset-0 rounded-full bg-[#00d2ff]/20 blur-md animate-pulse"
        style={{ width: size, height: size }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none drop-shadow-[0_0_12px_rgba(0,210,255,0.6)]"
      >
        <defs>
          <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d2ff" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Stylized "S" Curved Geometry with Lighting Path */}
        <path
          d="M 72 28 C 72 18, 56 16, 42 16 C 26 16, 18 26, 18 40 C 18 64, 82 46, 82 72 C 82 88, 66 90, 44 90 C 26 90, 16 80, 16 70"
          stroke="url(#sGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />
        {/* Inner Light Accent */}
        <path
          d="M 68 26 C 68 20, 56 18, 44 18 C 30 18, 22 26, 22 38"
          stroke="#ffffff"
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
        {/* Dark Logo Card with Neon Lighting & Bounce Interaction */}
        <motion.div
          whileHover={{ scale: 1.08, rotate: [0, -2, 2, 0] }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0a1220] border border-[#1e2e4a] flex items-center justify-center shadow-2xl shadow-cyan-500/20 mb-3.5 relative overflow-hidden group cursor-pointer"
        >
          {/* Light Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
          <SMark size={52} />
        </motion.div>

        {/* Title with Lighting Effect */}
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className="font-extrabold tracking-tight text-3xl sm:text-4xl leading-none flex items-center justify-center gap-0.5 cursor-pointer"
        >
          <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">Smart</span>
          <span className="text-[#00d2ff] drop-shadow-[0_0_15px_rgba(0,210,255,0.8)]">Transit</span>
        </motion.div>

        <p className="mt-1.5 text-xs font-mono font-medium text-slate-400 tracking-widest uppercase">
          Next-Gen Cinematic Mobility
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      className={`flex items-center gap-3 select-none whitespace-nowrap flex-shrink-0 cursor-pointer ${className}`}
    >
      <SMark size={iconSize} />
      <div className="font-extrabold tracking-tight text-xl sm:text-2xl leading-none flex items-center">
        <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">Smart</span>
        <span className="text-[#00d2ff] drop-shadow-[0_0_12px_rgba(0,210,255,0.7)]">Transit</span>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';

/**
 * SmartTransit Emblem Logo Component
 * Matched strictly to the reference design (Screenshot 1 & 2):
 *  - Stylized S/3 continuous loop emblem in dark teal & vibrant cyan
 *  - Clean typography: "Smart" in White + "Transit" in Cyan
 */
export default function SmartTransitLogo({ className = '', layout = 'horizontal', iconSize = 36 }) {
  const EmblemMark = ({ size = 36 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 select-none"
    >
      {/* Dark Teal / Blue Base Loop */}
      <path
        d="M 65 25 C 45 25, 25 35, 25 55 C 25 72, 42 80, 60 80 C 75 80, 80 68, 75 58 C 70 48, 55 48, 48 52"
        stroke="#0c345a"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cyan Overlay Curve */}
      <path
        d="M 35 75 C 55 75, 78 68, 78 48 C 78 30, 60 22, 42 22 C 28 22, 22 34, 28 44 C 34 54, 52 54, 60 50"
        stroke="#00d2ff"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
        {/* Dark Logo Card as seen in Screenshot 2 */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0b1322] border border-[#1e2a3f] text-white flex items-center justify-center shadow-2xl shadow-cyan-500/10 mb-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
          <EmblemMark size={48} />
        </motion.div>

        <div className="font-extrabold tracking-tight text-3xl sm:text-4xl leading-none flex items-center justify-center gap-0.5">
          <span className="text-white">Smart</span>
          <span className="text-[#00d2ff]">Transit</span>
        </div>

        <p className="mt-2 text-xs font-mono font-medium text-slate-400 tracking-wider">
          Next-gen cinematic mobility
        </p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none whitespace-nowrap flex-shrink-0 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center"
      >
        <EmblemMark size={iconSize} />
      </motion.div>

      <div className="font-extrabold tracking-tight text-lg sm:text-xl leading-none flex items-center">
        <span className="text-white dark:text-white">Smart</span>
        <span className="text-[#00d2ff]">Transit</span>
      </div>
    </div>
  );
}

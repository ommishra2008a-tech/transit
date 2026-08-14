import { motion } from 'framer-motion';

export default function PageContainer({
  children,
  narrow = false,
  wide = false,
  full = false,
  noPadding = false,
  className = '',
}) {
  if (full) {
    return (
      <div className={`flex-1 flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200 ${className}`}>
        {children}
      </div>
    );
  }

  const maxWidth = narrow
    ? 'max-w-3xl'
    : wide
    ? 'max-w-screen-2xl'
    : 'max-w-6xl';

  return (
    <div className={`flex-1 bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={`${maxWidth} mx-auto w-full space-y-4 sm:space-y-5 ${
          noPadding ? '' : 'px-3.5 sm:px-5 md:px-6 py-3.5 sm:py-5'
        }`}
      >
        {children}
      </motion.div>
    </div>
  );
}

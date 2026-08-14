import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const Button = forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  type = 'button',
  disabled,
  loading = false,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30 shadow-md shadow-blue-600/20 dark:shadow-blue-900/30',
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-blue-500/30 shadow-lg shadow-blue-600/25 dark:shadow-blue-900/40',
    secondary: 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 shadow-2xs',
    outline: 'bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30 shadow-md shadow-rose-600/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30 shadow-md shadow-emerald-600/20',
    link: 'bg-transparent text-blue-600 dark:text-blue-400 hover:underline p-0 border-transparent',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm rounded-xl',
    sm: 'h-8 px-3 text-xs rounded-lg',
    lg: 'h-12 px-6 text-base font-bold rounded-2xl',
    xl: 'h-14 px-8 text-base font-extrabold rounded-2xl tracking-wide',
    pill: 'h-11 px-6 text-sm font-bold rounded-full',
    icon: 'h-10 w-10 p-0 rounded-xl justify-center',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors border outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
export { Button };

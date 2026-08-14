import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const Button = forwardRef(({
  className,
  variant = 'coral',
  size = 'default',
  children,
  type = 'button',
  disabled,
  loading = false,
  ...props
}, ref) => {
  const variants = {
    coral: 'coral-cta-btn text-white border-transparent font-extrabold uppercase tracking-wider',
    cyan: 'cyan-cta-btn text-white border-transparent font-extrabold uppercase tracking-wider',
    default: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-extrabold border-cyan-400/30 shadow-md shadow-cyan-500/20',
    primary: 'coral-cta-btn text-white border-transparent font-extrabold uppercase tracking-wider',
    secondary: 'bg-[#131d31] text-slate-200 hover:bg-[#1c2942] border-[#1e2a3f] shadow-xs',
    outline: 'bg-transparent text-slate-300 border-[#1e2a3f] hover:bg-[#131d31] hover:text-cyan-400 hover:border-cyan-500/40',
    ghost: 'bg-transparent text-slate-400 hover:bg-[#131d31] hover:text-white border-transparent',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30 shadow-md shadow-rose-600/20',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30 shadow-md shadow-emerald-600/20',
  };

  const sizes = {
    default: 'h-11 px-5 text-sm rounded-2xl',
    sm: 'h-8 px-3 text-xs rounded-xl',
    lg: 'h-12 px-6 text-base font-extrabold rounded-2xl',
    xl: 'h-14 px-8 text-base font-extrabold rounded-2xl tracking-wider',
    pill: 'h-11 px-6 text-sm font-bold rounded-full',
    icon: 'h-10 w-10 p-0 rounded-xl justify-center',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.015 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all border outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none',
        variants[variant] || variants.coral,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin text-current" />
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

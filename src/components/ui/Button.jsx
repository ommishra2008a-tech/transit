import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Button = forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  children,
  type = 'button',
  disabled,
  ...props
}, ref) => {
  const variants = {
    default: 'bg-blue-700 hover:bg-blue-800 text-white border-blue-700 shadow-sm',
    primary: 'bg-blue-700 hover:bg-blue-800 text-white border-blue-700 shadow-sm',
    secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600',
    outline: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-sm',
    link: 'bg-transparent text-blue-700 dark:text-blue-400 hover:underline p-0 border-transparent',
  };

  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs rounded-md',
    lg: 'h-12 px-6 text-base rounded-xl',
    pill: 'h-11 px-6 text-sm rounded-full',
    icon: 'h-10 w-10 p-0 rounded-xl',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 border outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]',
        'rounded-xl',
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

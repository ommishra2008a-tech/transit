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
    default: 'bg-primary-700 text-white hover:bg-primary-800 border-primary-700 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-200',
    outline: 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-primary-700 hover:border-primary-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600 shadow-sm',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600 shadow-sm',
    link: 'bg-transparent text-primary-700 hover:underline p-0 border-transparent',
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

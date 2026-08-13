import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, icon: Icon, error, type = 'text', ...props }, ref) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={18} strokeWidth={2} />
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full h-11 px-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400',
          'transition-all duration-150 outline-none',
          'focus:bg-white focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10',
          Icon && 'pl-10',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

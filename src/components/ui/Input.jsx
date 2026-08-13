import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, icon: Icon, error, type = 'text', ...props }, ref) => {
  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10 flex items-center justify-center">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full h-11 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'transition-all duration-150 outline-none pr-3.5 font-medium',
            Icon ? 'pl-11' : 'pl-3.5',
            'focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

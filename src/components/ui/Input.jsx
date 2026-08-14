import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, icon: Icon, error, type = 'text', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <div className="relative flex items-center w-full">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10 flex items-center justify-center">
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
        <input
          type={inputType}
          ref={ref}
          style={{
            paddingLeft: Icon ? '2.75rem' : undefined,
            paddingRight: isPassword ? '2.75rem' : undefined,
            ...props.style,
          }}
          className={cn(
            'w-full h-12 text-sm bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'transition-all duration-150 outline-none font-medium px-4',
            'focus:bg-white dark:focus:bg-slate-950 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 dark:focus:ring-blue-500/20',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
export { Input };

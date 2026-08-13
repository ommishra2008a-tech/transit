import { cn } from '../../lib/utils';

export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs transition-all duration-200 text-slate-900 dark:text-slate-100',
        hover && 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 hover:translate-y-[-1px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-slate-100', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs font-medium text-slate-500 dark:text-slate-400', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0 flex items-center border-t border-slate-100 dark:border-slate-700/80 mt-4', className)} {...props}>
      {children}
    </div>
  );
}

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = forwardRef(({ className, children, hover = false, interactive = false, ...props }, ref) => {
  if (interactive) {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all text-slate-900 dark:text-slate-100 cursor-pointer hover:border-blue-400/60 dark:hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/5',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all text-slate-900 dark:text-slate-100',
        hover && 'hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 hover:translate-y-[-1px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pb-3 flex flex-col space-y-1.5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('font-extrabold text-base sm:text-lg leading-tight tracking-tight text-slate-900 dark:text-white', className)} {...props}>
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
    <div className={cn('p-4 sm:p-5 pt-0 flex items-center border-t border-slate-100 dark:border-slate-800/80 mt-4', className)} {...props}>
      {children}
    </div>
  );
}

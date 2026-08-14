import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = forwardRef(({ className, children, hover = false, interactive = false, ...props }, ref) => {
  if (interactive) {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={cn(
          'glass-card-cinematic rounded-3xl p-5 shadow-xl text-slate-100 cursor-pointer hover:border-cyan-500/50 hover:shadow-cyan-500/10 transition-all',
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
        'glass-card-cinematic rounded-3xl p-5 shadow-xl text-slate-100 transition-all',
        hover && 'hover:shadow-2xl hover:border-cyan-500/40 hover:translate-y-[-1px]',
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
    <h3 className={cn('font-extrabold text-base sm:text-lg leading-tight tracking-tight text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-xs font-medium text-slate-400', className)} {...props}>
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
    <div className={cn('p-4 sm:p-5 pt-0 flex items-center border-t border-[#1e2a3f] mt-4', className)} {...props}>
      {children}
    </div>
  );
}

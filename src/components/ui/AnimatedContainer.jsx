import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function FadeIn({ children, className }) {
  return <div className={cn('animate-fade-in', className)}>{children}</div>;
}

export function StaggerContainer({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className }) {
  return <div className={cn('animate-fade-in-up', className)}>{children}</div>;
}

export function AnimatedCard({ children, className, glass, hover }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={hover !== false ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'transition-all duration-300 rounded-2xl',
        glass ? 'glass-card' : 'bg-card border border-border',
        hover !== false && 'hover:border-white/10',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedButton({ children, className, glass, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200',
        glass && 'glass-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function GlassCard({ children, className, hover, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover !== false ? { y: -3, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass-card-hover rounded-2xl p-5',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }) {
  return <div className="animate-fade-in">{children}</div>;
}

export function PulseDot({ className }) {
  return (
    <span className={cn('relative flex h-2 w-2', className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
    </span>
  );
}

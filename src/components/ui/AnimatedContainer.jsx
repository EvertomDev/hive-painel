import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function FadeIn({ children, className }) {
  return <div className={cn('animate-fade-in', className)}>{children}</div>;
}

export function StaggerContainer({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className }) {
  return <div className={cn('animate-fade-in', className)}>{children}</div>;
}

export function AnimatedCard({ children, className }) {
  return (
    <motion.div whileHover={{ y: -2 }} className={cn('transition-shadow', className)}>
      {children}
    </motion.div>
  );
}

export function AnimatedButton({ children, className, ...props }) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }} className={className} {...props}>
      {children}
    </motion.button>
  );
}

export function PageTransition({ children }) {
  return <div className="animate-fade-in">{children}</div>;
}

export function PulseDot({ className }) {
  return (
    <span className={cn('relative flex h-2.5 w-2.5', className)}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current"></span>
    </span>
  );
}

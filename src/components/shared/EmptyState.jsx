import React from 'react';
import { Inbox } from 'lucide-react';
import { AnimatedCard } from '../ui/AnimatedContainer';

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <AnimatedCard className="flex flex-col items-center justify-center p-12 bg-card rounded-2xl border border-border shadow-sm text-center mx-auto max-w-md">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon size={32} className="text-primary" />
      </div>
      {title && <h3 className="text-lg font-bold text-card-foreground mb-2">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground mb-6">{description}</p>}
      {action}
    </AnimatedCard>
  );
}

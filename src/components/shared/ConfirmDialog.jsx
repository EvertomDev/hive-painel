import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'danger', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${variant === 'danger' ? 'bg-destructive/15 text-destructive' : 'bg-chart-3/15 text-chart-3'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${variant === 'danger' ? 'bg-destructive hover:bg-destructive/90' : 'bg-chart-3 hover:bg-chart-3/90'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

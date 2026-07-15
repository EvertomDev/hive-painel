import React, { useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import { useApp } from '../store/AppContext';
import { Bell, Check, Trash2, X } from 'lucide-react';

function NotificationsPanel({ open, setOpen }) {
  const { state, dispatch } = useApp();
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors hover:scale-105 active:scale-95 transition-transform"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-fade-in">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-card-foreground">Notificações</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => dispatch({ type: 'READ_ALL_NOTIFICATIONS' })} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg hover:scale-110 active:scale-90 transition-transform" title="Marcar todas como lidas">
                <Check size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg hover:scale-110 active:scale-90 transition-transform">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {state.notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
            ) : state.notifications.map((n, i) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-border/50 last:border-0 ${!n.read ? 'bg-muted/40' : ''} animate-fade-in`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`text-sm ${!n.read ? 'font-medium text-card-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.time).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!n.read && (
                      <button onClick={() => dispatch({ type: 'READ_NOTIFICATION', payload: n.id })} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded hover:scale-110 active:scale-90 transition-transform" title="Marcar como lida">
                        <Check size={12} />
                      </button>
                    )}
                    <button onClick={() => dispatch({ type: 'DELETE_NOTIFICATION', payload: n.id })} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded hover:scale-110 active:scale-90 transition-transform" title="Excluir">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPanel;

import React, { useState, useEffect, useRef } from 'react';
import { getPlatformMeta } from './PlatformIcon';
import { ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';

export function AccountWebView({ account }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const meta = getPlatformMeta(account.platform);

  useEffect(() => {
    setLoading(true);
    setError(null);
  }, [account.id]);

  const handleOpenExternal = () => {
    window.open(meta.url, '_blank');
  };

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setLoading(true);
      setError(null);
    }
  };

  const handleError = () => {
    setError(`A plataforma ${meta.label} bloqueia a exibição em iframe por segurança (X-Frame-Options).`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {account.photo ? (
              <img src={account.photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold uppercase">{account.name[0]}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-card-foreground truncate">{account.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{account.identifier} · {meta.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleReload} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Recarregar">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleOpenExternal} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Abrir no navegador">
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-background">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground z-10">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-sm">Carregando {meta.label}...</span>
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 text-destructive mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-base font-semibold text-card-foreground mb-2">Integração limitada</h3>
              <p className="text-sm text-muted-foreground mb-4">{error} Use o botão abaixo para abrir a conta em uma nova aba do navegador.</p>
              <button onClick={handleOpenExternal} className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
                <ExternalLink size={16} />
                Abrir {meta.label}
              </button>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={meta.url}
            title={account.name}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onLoad={() => setLoading(false)}
            onError={handleError}
          />
        )}
      </div>
    </div>
  );
}

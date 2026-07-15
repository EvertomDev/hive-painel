import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Check, X, Shield, CreditCard } from 'lucide-react';

function Gateways() {
  const { state, dispatch, addActivity, addNotification } = useApp();
  const [configs, setConfigs] = useState({});

  const handleToggle = (g) => {
    dispatch({ type: 'TOGGLE_GATEWAY', payload: g.name });
    const connected = !g.connected;
    addActivity(`Gateway ${g.name} ${connected ? 'conectado' : 'desconectado'}`, 'warning');
    if (connected) addNotification('Gateway conectado', `${g.name} está pronto para receber pagamentos.`);
  };

  const handleSaveConfig = (name) => {
    addActivity(`Configurações do ${name} salvas`, 'success');
    addNotification('Gateway configurado', `Credenciais do ${name} atualizadas.`);
    setConfigs({ ...configs, [name]: { ...configs[name], saved: true } });
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Gateways de Pagamento</h1>
          <p className="text-sm text-muted-foreground mt-1">Conecte seus gateways PIX e cartão</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.gateways.map((g, i) => (
            <div key={g.name} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground hover:rotate-3 hover:scale-105 transition-transform">
                      {g.type.includes('PIX') ? <Shield size={20} /> : <CreditCard size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">{g.name}</h3>
                      <p className="text-sm text-muted-foreground">{g.type}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${g.connected ? 'bg-chart-1/15 text-chart-1' : 'bg-muted text-muted-foreground'}`}>
                    {g.connected ? <Check size={12} /> : <X size={12} />}
                    {g.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">API Key</label>
                    <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                  </div>
                  {g.name === 'PushinPay' && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Secret Key</label>
                      <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <AnimatedButton onClick={() => handleSaveConfig(g.name)} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">Salvar</AnimatedButton>
                  <button onClick={() => handleToggle(g)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors hover:scale-[1.03] active:scale-[0.97] transition-transform ${g.connected ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-chart-1/15 text-chart-1 hover:bg-chart-1/25'}`}>
                    {g.connected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
              </AnimatedCard>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-muted/50 border border-border rounded-xl p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-card-foreground mb-2">Dica</h3>
          <p className="text-sm text-muted-foreground">Configure ao menos um gateway PIX para começar a receber pagamentos automaticamente pelo seu bot. O dinheiro cai direto na conta do gateway escolhido.</p>
        </div>
      </div>
    </PageTransition>
  );
}

export default Gateways;

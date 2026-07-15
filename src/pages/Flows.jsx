import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Play, MessageSquare, CreditCard, Unlock, Target, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

function Flows() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState('basic');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    dispatch({ type: 'ADD_FLOW', payload: { id: helpers.uid(), name, type, steps: type === 'basic' ? 3 : 8 } });
    addActivity(`Fluxo ${name} criado`, 'success');
    addNotification('Fluxo criado', `${name} foi adicionado aos fluxos de vendas.`);
    setName('');
  };

  const handleDelete = (id) => {
    const flow = state.flows.find(f => f.id === id);
    dispatch({ type: 'DELETE_FLOW', payload: id });
    addActivity(`Fluxo ${flow.name} excluído`, 'warning');
  };

  const steps = [
    { icon: Play, title: 'Start', desc: 'Início da conversa' },
    { icon: MessageSquare, title: 'Mensagem', desc: 'Envia mensagem de boas-vindas' },
    { icon: CreditCard, title: 'Pagamento', desc: 'Gera cobrança PIX' },
    { icon: Unlock, title: 'Acesso', desc: 'Libera produto após pagamento' },
  ];

  const features = [
    { title: 'Remarketing', desc: 'Recuperar leads que não compraram', icon: Target },
    { title: 'Upsell', desc: 'Oferta adicional após compra', icon: TrendingUp },
    { title: 'Downsell', desc: 'Oferta alternativa menor', icon: TrendingDown },
    { title: 'Assinaturas', desc: 'Cobrança recorrente automática', icon: RefreshCw },
  ];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Fluxos de Vendas</h1>
            <p className="text-sm text-muted-foreground mt-1">Jornada do cliente no bot</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 mb-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Criar Novo Fluxo</h2>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do fluxo" className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all focus:scale-[1.01]" />
            <select value={type} onChange={e => setType(e.target.value)} className="px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
              <option value="basic">Básico</option>
              <option value="advanced">Avançado</option>
            </select>
            <AnimatedButton type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">Criar Fluxo</AnimatedButton>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {state.flows.map((flow, i) => (
            <div key={flow.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground">{flow.name}</h3>
                    <span className="text-xs text-muted-foreground uppercase">{flow.type}</span>
                  </div>
                  <button onClick={() => handleDelete(flow.id)} className="px-3 py-1 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Excluir</button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {steps.map((s, idx) => {
                    const Icon = s.icon;
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg transition-colors hover:-translate-y-0.5">
                          <Icon size={16} className="text-muted-foreground" />
                          <div>
                            <div className="text-xs font-medium text-card-foreground">{s.title}</div>
                            <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                          </div>
                        </div>
                        {idx < steps.length - 1 && <span className="text-muted-foreground">→</span>}
                      </React.Fragment>
                    );
                  })}
                </div>
              </AnimatedCard>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Recursos do Fluxo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="p-4 border border-border rounded-lg bg-muted/30 transition-colors hover:-translate-y-0.5 hover:border-ring animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <Icon size={20} className="mb-2 text-chart-2" />
                  <div className="font-medium text-card-foreground">{f.title}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Flows;

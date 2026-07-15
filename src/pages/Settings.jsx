import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Check } from 'lucide-react';

function Settings() {
  const { state, dispatch, addActivity, addNotification } = useApp();
  const [form, setForm] = useState({
    name: state.user.name,
    email: state.user.email,
    webhook: state.config.webhook,
    defaultGateway: state.config.defaultGateway,
    pixDiscount: state.config.pixDiscount,
  });
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_USER', payload: { name: form.name, email: form.email } });
    dispatch({ type: 'SET_CONFIG', payload: { webhook: form.webhook, defaultGateway: form.defaultGateway, pixDiscount: Number(form.pixDiscount) } });
    addActivity('Configurações salvas', 'info');
    addNotification('Configações atualizadas', 'Suas preferências foram salvas.');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_DATA' });
    window.location.reload();
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize seu painel Zeze</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
              <h2 className="text-lg font-bold text-card-foreground mb-4">Conta</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: 'Nome', key: 'name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Webhook URL', key: 'webhook', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-card-foreground mb-1">{field.label}</label>
                    <input type={field.type} value={form[field.key]} onChange={e => setForm({ ...form, [field.key]: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Gateway Padrão</label>
                  <select value={form.defaultGateway} onChange={e => setForm({ ...form, defaultGateway: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                    {state.gateways.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Desconto PIX (%)</label>
                  <input type="number" value={form.pixDiscount} onChange={e => setForm({ ...form, pixDiscount: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                </div>
                <div className="flex items-center gap-3">
                  <AnimatedButton type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center gap-2">
                    {saved && <Check size={16} />}
                    Salvar Configurações
                  </AnimatedButton>
                  {saved && <span className="text-sm text-chart-1 animate-fade-in">Salvo!</span>}
                </div>
              </form>
            </AnimatedCard>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
              <h2 className="text-lg font-bold text-card-foreground mb-4">Dados</h2>
              <p className="text-sm text-muted-foreground mb-4">Todos os dados são armazenados localmente no navegador. Use o botão abaixo para limpar tudo e começar do zero.</p>
              {!confirmReset ? (
                <div className="animate-fade-in">
                  <AnimatedButton onClick={() => setConfirmReset(true)} className="px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-semibold rounded-lg transition-colors">Resetar Todos os Dados</AnimatedButton>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg animate-fade-in">
                  <span className="text-sm text-destructive">Tem certeza? Isso apaga tudo.</span>
                  <AnimatedButton onClick={handleReset} className="px-3 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold rounded-lg">Sim, apagar</AnimatedButton>
                  <AnimatedButton onClick={() => setConfirmReset(false)} className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold rounded-lg">Cancelar</AnimatedButton>
                </div>
              )}
            </AnimatedCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Settings;

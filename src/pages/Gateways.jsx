import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Check, X, Shield, CreditCard, QrCode, Plus, Trash2, DollarSign, Settings } from 'lucide-react';

function Gateways() {
  const { state, dispatch, addActivity, addNotification } = useApp();
  const [configs, setConfigs] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newGateway, setNewGateway] = useState({ name: '', type: 'PIX', apiKey: '', secretKey: '' });

  const gatewayIcons = { PIX: QrCode, 'PIX / Cartão': Shield, Cartão: CreditCard, Crypto: DollarSign };

  const handleToggle = (g) => {
    dispatch({ type: 'TOGGLE_GATEWAY', payload: g.name });
    const connected = !g.connected;
    addActivity(`Gateway ${g.name} ${connected ? 'conectado' : 'desconectado'}`, 'warning');
    if (connected) addNotification('Gateway conectado', `${g.name} está pronto.`);
  };

  const handleSaveConfig = (name) => {
    addActivity(`Configurações do ${name} salvas`, 'success');
    addNotification('Gateway configurado', `Credenciais do ${name} atualizadas.`);
    setConfigs({ ...configs, [name]: { ...configs[name], saved: true } });
  };

  const handleAddGateway = (e) => {
    e.preventDefault();
    if (!newGateway.name) return;
    dispatch({ type: 'ADD_GATEWAY', payload: { name: newGateway.name, connected: false, type: newGateway.type } });
    addActivity(`Gateway ${newGateway.name} adicionado`, 'success');
    setShowAdd(false);
    setNewGateway({ name: '', type: 'PIX', apiKey: '', secretKey: '' });
  };

  const handleRemoveGateway = (name) => {
    dispatch({ type: 'REMOVE_GATEWAY', payload: name });
    addActivity(`Gateway ${name} removido`, 'warning');
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Gateways de Pagamento</h1>
            <p className="text-sm text-muted-foreground mt-1">Conecte gateways PIX, cartão e cripto</p>
          </div>
          <AnimatedButton onClick={() => setShowAdd(!showAdd)} className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg flex items-center gap-2">
            <Plus size={16} /> {showAdd ? 'Cancelar' : 'Novo Gateway'}
          </AnimatedButton>
        </div>

        {showAdd && (
          <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-card-foreground mb-4">Adicionar Gateway</h3>
            <form onSubmit={handleAddGateway} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                <input value={newGateway.name} onChange={e => setNewGateway({ ...newGateway, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: GerenciaNet" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Tipo</label>
                <select value={newGateway.type} onChange={e => setNewGateway({ ...newGateway, type: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                  <option value="PIX">PIX</option>
                  <option value="PIX / Cartão">PIX / Cartão</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Crypto">Criptomoeda</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">API Key</label>
                <input value={newGateway.apiKey} onChange={e => setNewGateway({ ...newGateway, apiKey: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Secret Key</label>
                <input value={newGateway.secretKey} onChange={e => setNewGateway({ ...newGateway, secretKey: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
              </div>
              <div className="md:col-span-4">
                <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Adicionar</AnimatedButton>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {state.gateways.length === 0 ? (
            <div className="md:col-span-2 bg-card rounded-xl border border-border p-12 text-center">
              <Shield size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Nenhum gateway configurado. Adicione um gateway para começar.</p>
            </div>
          ) : state.gateways.map((g, i) => {
            const Icon = gatewayIcons[g.type] || Shield;
            return (
              <div key={g.name} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-card-foreground">{g.name}</h3>
                        <p className="text-sm text-muted-foreground">{g.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${g.connected ? 'bg-chart-1/15 text-chart-1' : 'bg-muted text-muted-foreground'}`}>
                        {g.connected ? <Check size={12} /> : <X size={12} />}
                        {g.connected ? 'Conectado' : 'Desconectado'}
                      </span>
                      <button onClick={() => handleRemoveGateway(g.name)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">API Key</label>
                      <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Secret Key</label>
                      <input type="password" placeholder="••••••••••••" className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Chave PIX (para gateway PIX)</label>
                      <input placeholder="CPF, CNPJ, email ou telefone" className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <AnimatedButton onClick={() => handleSaveConfig(g.name)} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg flex items-center gap-1"><Settings size={14} /> Salvar</AnimatedButton>
                    <button onClick={() => handleToggle(g)} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${g.connected ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' : 'bg-chart-1/15 text-chart-1 hover:bg-chart-1/25'}`}>
                      {g.connected ? 'Desconectar' : 'Conectar'}
                    </button>
                  </div>
                </AnimatedCard>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-muted/50 border border-border rounded-xl p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-card-foreground mb-2">Dica</h3>
          <p className="text-sm text-muted-foreground">Configure ao menos um gateway PIX para receber pagamentos automaticamente. O dinheiro cai direto na conta do gateway escolhido. Gateways populares: PushinPay, GerenciaNet, Mercado Pago, Stripe.</p>
        </div>
      </div>
    </PageTransition>
  );
}

export default Gateways;

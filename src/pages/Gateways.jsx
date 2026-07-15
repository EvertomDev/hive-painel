import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import {
  Check, X, Shield, CreditCard, QrCode, Plus, Trash2, DollarSign,
  Settings, ChevronDown, ChevronUp, Wallet, Globe, Zap, Wifi, Lock,
  Search, Filter, Clock, RefreshCw, Key, ExternalLink, Copy, CheckCheck
} from 'lucide-react';

const TYPE_ICONS = { PIX: QrCode, 'PIX / Cartão': Shield, Cartão: CreditCard, Crypto: DollarSign };
const TYPE_COLORS = { PIX: 'text-blue-500', 'PIX / Cartão': 'text-purple-500', Cartão: 'text-emerald-500', Crypto: 'text-orange-500' };
const TYPE_BG = { PIX: 'bg-blue-500/10', 'PIX / Cartão': 'bg-purple-500/10', Cartão: 'bg-emerald-500/10', Crypto: 'bg-orange-500/10' };

const GATEWAY_SUGGESTIONS = [
  'PagCi Wallet', 'PushinPay', 'SyncPay', 'Oasyfy', 'VizzionPay', 'OmegaPay', 'SigiloPay',
  'Paradise', 'HooPay', 'Freepay', 'AmploPay', 'TriboPay', 'AtomoPay', 'IronPay', 'WiinPay',
  'NXGate', 'AxenPay', 'VeoPag', 'Mercado Pago PIX', 'Mercado Pago Cartão', 'PixGateIP',
  'Duck', 'Bestfy', 'Stripe',
];

function getFieldLabel(key) {
  const labels = {
    apiKey: 'API Key',
    clientId: 'Client ID',
    token: 'Token de Acesso',
    secretKey: 'Secret Key',
    clientSecret: 'Client Secret',
    email: 'Email (notificações)',
    webhookUrl: 'Webhook URL',
    pixKey: 'Chave PIX',
    cpf: 'CPF/CNPJ',
  };
  return labels[key] || key;
}

function getFieldType(key) {
  if (key.includes('Key') || key.includes('Secret') || key.includes('Token')) return 'password';
  return 'text';
}

function getGatewayFieldKeys(name) {
  const n = name.toLowerCase();
  if (['stripe'].some(k => n.includes(k))) return ['secretKey', 'email'];
  if (['pushinpay', 'axenpay', 'paradise', 'mercadopago', 'mercado pago'].some(k => n.includes(k))) return ['token', 'email', 'webhookUrl'];
  if (['syncpay', 'nxgate', 'sigilopay', 'pagciwallet', 'duck', 'wiinpay', 'veopag', 'vizzionpay', 'amplopay']
    .some(k => n.includes(k))) return ['clientId', 'clientSecret', 'webhookUrl'];
  if (['gerencianet', 'efi'].some(k => n.includes(k))) return ['clientId', 'clientSecret', 'cpf', 'pixKey', 'webhookUrl'];
  if (['freepay', 'bestfy', 'oasyfy', 'omegapay', 'hoopay'].some(k => n.includes(k))) return ['apiKey', 'secretKey', 'webhookUrl'];
  if (['tribopay', 'atomopay', 'ironpay', 'pixgateip'].some(k => n.includes(k))) return ['apiKey', 'webhookUrl'];
  return ['apiKey', 'secretKey', 'webhookUrl'];
}

function GatewayCard({ gateway, index, configs, editFields, expanded, setExpanded, handleFieldChange, handleSaveConfig, handleToggle, handleRemoveGateway }) {
  const Icon = TYPE_ICONS[gateway.type] || Shield;
  const isOpen = expanded === gateway.name;
  const fields = getGatewayFieldKeys(gateway.name);

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      <AnimatedCard className={`bg-card rounded-xl border transition-all duration-300 ${
        gateway.connected ? 'border-chart-1/30 shadow-lg shadow-chart-1/5' : 'border-border hover:border-muted-foreground/20'
      } p-5 h-full`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl ${TYPE_BG[gateway.type] || 'bg-muted'} flex items-center justify-center`}>
              <Icon size={22} className={TYPE_COLORS[gateway.type] || 'text-muted-foreground'} />
            </div>
            <div>
              <h3 className="text-base font-bold text-card-foreground flex items-center gap-2">
                {gateway.name}
                {gateway.connected && <span className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_BG[gateway.type] || 'bg-muted'} ${TYPE_COLORS[gateway.type] || 'text-muted-foreground'}`}>
                {gateway.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              gateway.connected ? 'bg-chart-1/15 text-chart-1' : 'bg-muted text-muted-foreground'
            }`}>
              {gateway.connected ? <><Check size={10} /> Conectado</> : <><X size={10} /> Offline</>}
            </span>
            <button onClick={() => handleRemoveGateway(gateway.name)}
              className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Config Toggle */}
        <button onClick={() => setExpanded(isOpen ? null : gateway.name)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isOpen
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border'
          }`}>
          <Settings size={15} />
          {isOpen ? 'Fechar Configuração' : 'Configurar Gateway'}
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Config Panel */}
        {isOpen && (
          <div className="mt-4 space-y-3 animate-slide-down">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-1"><Key size={11} /> Credenciais</p>
              <div className="space-y-2.5">
                {fields.map(field => (
                  <div key={field}>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">{getFieldLabel(field)}</label>
                    <input
                      type={getFieldType(field)}
                      placeholder={`••••••••••••`}
                      value={editFields[gateway.name]?.[field] !== undefined ? editFields[gateway.name][field] : ''}
                      onChange={e => handleFieldChange(gateway.name, field, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <AnimatedButton onClick={() => handleSaveConfig(gateway.name)}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5">
                <CheckCheck size={15} /> Salvar
              </AnimatedButton>
              <button onClick={() => handleToggle(gateway)}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  gateway.connected
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20'
                    : 'bg-chart-1/15 text-chart-1 hover:bg-chart-1/25 border border-chart-1/20'
                }`}>
                {gateway.connected ? <><X size={15} /> Desconectar</> : <><Zap size={15} /> Conectar</>}
              </button>
            </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}

function Gateways() {
  const { state, dispatch, addActivity, addNotification } = useApp();
  const [configs, setConfigs] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newGateway, setNewGateway] = useState({ name: '', type: 'PIX', apiKey: '', secretKey: '', email: '', webhookUrl: '' });
  const [expanded, setExpanded] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleFieldChange = (name, field, value) => {
    setEditFields(prev => ({ ...prev, [name]: { ...prev[name], [field]: value } }));
  };

  const handleSaveConfig = (name) => {
    addActivity(`Configurações do ${name} salvas`, 'success');
    addNotification('Gateway configurado', `Credenciais do ${name} atualizadas.`);
    const savedFields = { ...configs[name], ...(editFields[name] || {}), saved: true };
    setConfigs({ ...configs, [name]: savedFields });
    setEditFields(prev => ({ ...prev, [name]: savedFields }));
  };

  const handleToggle = (g) => {
    dispatch({ type: 'TOGGLE_GATEWAY', payload: g.name });
    const connected = !g.connected;
    addActivity(`Gateway ${g.name} ${connected ? 'conectado' : 'desconectado'}`, 'warning');
    if (connected) addNotification('Gateway conectado', `${g.name} está pronto.`);
  };

  const handleAddGateway = (e) => {
    e.preventDefault();
    if (!newGateway.name) return;
    dispatch({ type: 'ADD_GATEWAY', payload: { name: newGateway.name, connected: false, type: newGateway.type } });
    addActivity(`Gateway ${newGateway.name} adicionado`, 'success');
    setShowAdd(false);
    setNewGateway({ name: '', type: 'PIX', apiKey: '', secretKey: '', email: '', webhookUrl: '' });
  };

  const handleRemoveGateway = (name) => {
    dispatch({ type: 'REMOVE_GATEWAY', payload: name });
    addActivity(`Gateway ${name} removido`, 'warning');
  };

  const filteredGateways = state.gateways.filter(g => {
    if (filterType !== 'all' && g.type !== filterType) return false;
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredSuggestions = GATEWAY_SUGGESTIONS.filter(s =>
    !state.gateways.some(g => g.name.toLowerCase() === s.toLowerCase()) &&
    s.toLowerCase().includes(newGateway.name.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold flex items-center gap-3">
              <Wallet size={28} className="text-primary" />
              Gateways
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {state.gateways.filter(g => g.connected).length} conectados · {state.gateways.length} no total
            </p>
          </div>
          <AnimatedButton onClick={() => setShowAdd(!showAdd)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
              showAdd ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}>
            <Plus size={16} /> {showAdd ? 'Cancelar' : 'Novo Gateway'}
          </AnimatedButton>
        </div>

        {/* Add Gateway Form */}
        {showAdd && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-8 animate-slide-down shadow-lg">
            <h3 className="text-lg font-bold text-card-foreground mb-5 flex items-center gap-2"><Plus size={18} className="text-primary" /> Adicionar Gateway</h3>
            <form onSubmit={handleAddGateway}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nome do Gateway</label>
                  <input value={newGateway.name}
                    onChange={e => { setNewGateway({ ...newGateway, name: e.target.value }); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none"
                    placeholder="Ex: SigiloPay" />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredSuggestions.map(s => (
                        <button key={s} type="button"
                          onMouseDown={() => { setNewGateway({ ...newGateway, name: s }); setShowSuggestions(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-card-foreground hover:bg-muted transition-colors flex items-center gap-2">
                          <Globe size={14} className="text-muted-foreground" /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                  <select value={newGateway.type} onChange={e => setNewGateway({ ...newGateway, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                    <option value="PIX">PIX</option>
                    <option value="PIX / Cartão">PIX / Cartão</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Crypto">Criptomoeda</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">API Key / Token</label>
                  <input value={newGateway.apiKey} onChange={e => setNewGateway({ ...newGateway, apiKey: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Secret Key</label>
                  <input value={newGateway.secretKey} onChange={e => setNewGateway({ ...newGateway, secretKey: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email (notificações)</label>
                  <input value={newGateway.email} onChange={e => setNewGateway({ ...newGateway, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="admin@exemplo.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Webhook URL</label>
                  <input value={newGateway.webhookUrl} onChange={e => setNewGateway({ ...newGateway, webhookUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none"
                    placeholder="https://seusite.com/api/gateway/webhook/nome" />
                </div>
              </div>
              <AnimatedButton type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all flex items-center gap-2">
                <Plus size={16} /> Adicionar Gateway
              </AnimatedButton>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-muted/60 rounded-xl p-1 border border-border">
            {['all', 'PIX', 'PIX / Cartão', 'Cartão', 'Crypto'].map(type => (
              <button key={type} onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === type ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {type === 'all' ? 'Todos' : type}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none"
              placeholder="Buscar gateway..." />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw size={12} />
            {filteredGateways.length} de {state.gateways.length}
          </div>
        </div>

        {/* Gateway Grid */}
        {filteredGateways.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-2">
              {searchQuery ? 'Nenhum gateway encontrado para esta busca.' : 'Nenhum gateway configurado.'}
            </p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              {searchQuery ? 'Tente outro termo ou limpe a busca.' : 'Adicione seu primeiro gateway para começar a receber pagamentos.'}
            </p>
            {!searchQuery && (
              <AnimatedButton onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto">
                <Plus size={16} /> Adicionar Gateway
              </AnimatedButton>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredGateways.map((g, i) => (
              <GatewayCard
                key={g.name}
                gateway={g}
                index={i}
                configs={configs}
                editFields={editFields}
                expanded={expanded}
                setExpanded={setExpanded}
                handleFieldChange={handleFieldChange}
                handleSaveConfig={handleSaveConfig}
                handleToggle={handleToggle}
                handleRemoveGateway={handleRemoveGateway}
              />
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-10 bg-gradient-to-r from-muted/80 to-muted/40 border border-border rounded-2xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Globe size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-card-foreground mb-1">24 Gateways Suportados</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PagCi Wallet, PushinPay, SyncPay, Oasyfy, VizzionPay, OmegaPay, SigiloPay,
                Paradise, HooPay, Freepay, AmploPay, TriboPay, AtomoPay, IronPay, WiinPay,
                NXGate, AxenPay, VeoPag, Mercado Pago, PixGateIP, Duck, Bestfy, Stripe.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2 flex items-center gap-1">
                <ExternalLink size={11} /> Configure o webhook como <code className="bg-background px-2 py-0.5 rounded text-[11px] font-mono">/api/gateway/webhook/nomedogateway</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Gateways;

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import {
  Check, X, Plus, Trash2, Copy, Zap, Globe, Search, RefreshCw,
  Wallet, QrCode, CreditCard, Shield, DollarSign, CheckCheck, CopyCheck,
} from 'lucide-react';

const TYPE_ICONS = { PIX: QrCode, 'PIX / Cartão': Shield, Cartão: CreditCard, Crypto: DollarSign };
const TYPE_COLORS = { PIX: 'text-blue-400', 'PIX / Cartão': 'text-purple-400', Cartão: 'text-emerald-400', Crypto: 'text-orange-400' };
const TYPE_BG = { PIX: 'bg-blue-500/10', 'PIX / Cartão': 'bg-purple-500/10', Cartão: 'bg-emerald-500/10', Crypto: 'bg-orange-500/10' };

const GATEWAY_BRANDS = {
  'PagCi Wallet': '#8B5CF6',
  'PushinPay': '#06B6D4',
  'SyncPay': '#F59E0B',
  'Oasyfy': '#EC4899',
  'VizzionPay': '#6366F1',
  'OmegaPay': '#14B8A6',
  'SigiloPay': '#3B82F6',
  'Paradise': '#F97316',
  'HooPay': '#10B981',
  'Freepay': '#A855F7',
  'AmploPay': '#EF4444',
  'TriboPay': '#84CC16',
  'AtomoPay': '#0EA5E9',
  'IronPay': '#64748B',
  'WiinPay': '#D946EF',
  'NXGate': '#22C55E',
  'AxenPay': '#EAB308',
  'VeoPag': '#06B6D4',
  'Mercado Pago PIX': '#00B5E2',
  'Mercado Pago Cartão': '#00B5E2',
  'PixGateIP': '#8B5CF6',
  'Duck': '#F59E0B',
  'Bestfy': '#10B981',
  'Stripe': '#635BFF',
};

const GATEWAY_LOGO_STYLES = {
  'PagCi Wallet': 'PW',
  'PushinPay': 'PP',
  'SyncPay': 'SY',
  'Oasyfy': 'OA',
  'VizzionPay': 'VZ',
  'OmegaPay': 'OM',
  'SigiloPay': 'SG',
  'Paradise': 'PA',
  'HooPay': 'HP',
  'Freepay': 'FP',
  'AmploPay': 'AM',
  'TriboPay': 'TP',
  'AtomoPay': 'AT',
  'IronPay': 'IR',
  'WiinPay': 'WI',
  'NXGate': 'NX',
  'AxenPay': 'AX',
  'VeoPag': 'VP',
  'Mercado Pago PIX': 'MP',
  'Mercado Pago Cartão': 'MC',
  'PixGateIP': 'PI',
  'Duck': 'DK',
  'Bestfy': 'BF',
  'Stripe': 'ST',
};

const GATEWAY_SUGGESTIONS = Object.keys(GATEWAY_BRANDS);

function getFieldLabel(key) {
  const labels = {
    apiKey: 'API Key', clientId: 'Client ID', token: 'Token de Acesso',
    secretKey: 'Secret Key', clientSecret: 'Client Secret', email: 'Email (notificações)',
    webhookUrl: 'Webhook URL', pixKey: 'Chave PIX', cpf: 'CPF/CNPJ',
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
  if (['pushinpay', 'axenpay', 'paradise', 'mercadopago'].some(k => n.includes(k))) return ['token', 'email'];
  if (['syncpay', 'nxgate', 'sigilopay', 'pagciwallet', 'duck', 'wiinpay', 'veopag', 'vizzionpay', 'amplopay'].some(k => n.includes(k))) return ['clientId', 'clientSecret'];
  if (['gerencianet', 'efi'].some(k => n.includes(k))) return ['clientId', 'clientSecret', 'cpf', 'pixKey'];
  if (['freepay', 'bestfy', 'oasyfy', 'omegapay', 'hoopay'].some(k => n.includes(k))) return ['apiKey', 'secretKey'];
  if (['tribopay', 'atomopay', 'ironpay', 'pixgateip'].some(k => n.includes(k))) return ['apiKey'];
  return ['apiKey', 'secretKey'];
}

const webhookBase = '/api/gateway/webhook';

function GatewayCard({ gateway, index, expanded, setExpanded, editFields, handleFieldChange, handleSaveConfig, handleToggle, handleRemoveGateway, handleConsultBalance, consulting }) {
  const isOpen = expanded === gateway.name;
  const fields = getGatewayFieldKeys(gateway.name);
  const color = GATEWAY_BRANDS[gateway.name] || '#3B82F6';
  const initials = GATEWAY_LOGO_STYLES[gateway.name] || gateway.name.substring(0, 2).toUpperCase();
  const webhookUrl = `${webhookBase}/${gateway.name.toLowerCase().replace(/\s+/g, '')}`;
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleConnect() {
    setConnecting(true);
    handleSaveConfig(gateway.name);
    await new Promise(r => setTimeout(r, 400));
    handleToggle(gateway);
    await new Promise(r => setTimeout(r, 300));
    await handleConsultBalance(gateway.name);
    setConnecting(false);
  }

  const hasConfig = editFields[gateway.name]?.saved;

  return (
    <div className="animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      <GlassCard className={`p-5 transition-all duration-300 ${gateway.connected ? 'ring-1 ring-[var(--brand-500)]/30' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg" style={{ backgroundColor: color }}>
              {initials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {gateway.name}
                {gateway.connected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_BG[gateway.type]} ${TYPE_COLORS[gateway.type]}`}>
                  {gateway.type}
                </span>
                {hasConfig && <span className="text-[10px] text-emerald-400/60">✓ configurado</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gateway.connected && gateway.balance !== undefined && (
              <div className="text-right">
                <div className="text-xs font-bold text-white">R$ {gateway.balance.toFixed(2)}</div>
                <div className="text-[9px] text-[#52525b]">saldo</div>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                gateway.connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-[#52525b]'
              }`}>
                {gateway.connected ? <><Check size={9} /> Online</> : <><X size={9} /> Offline</>}
              </span>
              <button onClick={() => handleRemoveGateway(gateway.name)}
                className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => setExpanded(isOpen ? null : gateway.name)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08]">
          {isOpen ? 'Fechar' : 'Configurar Credenciais'}
        </button>

        {isOpen && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-2">Credenciais</p>
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 mb-3">
                <code className="text-[10px] font-mono text-[#a1a1aa] truncate mr-2">{webhookUrl}</code>
                <button onClick={copyWebhook}
                  className="p-1 rounded-md text-[#52525b] hover:text-white hover:bg-white/[0.06] transition-colors shrink-0">
                  {copied ? <CopyCheck size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
              <div className="space-y-2.5">
                {fields.map(field => (
                  <div key={field}>
                    <label className="block text-[10px] font-medium text-[#a1a1aa] mb-1">{getFieldLabel(field)}</label>
                    <input type={getFieldType(field)} placeholder="••••••••••••"
                      value={editFields[gateway.name]?.[field] !== undefined ? editFields[gateway.name][field] : ''}
                      onChange={e => handleFieldChange(gateway.name, field, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]" />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleConnect} disabled={connecting}
              className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-wait bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20">
              {connecting ? 'Conectando...' : gateway.connected ? <><X size={13} /> Desconectar</> : <><Zap size={13} /> Conectar</>}
            </button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Gateways() {
  const { state, dispatch, addActivity, addNotification } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newGateway, setNewGateway] = useState({ name: '', type: 'PIX' });
  const [expanded, setExpanded] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [consulting, setConsulting] = useState({});

  const handleConsultBalance = async (name) => {
    setConsulting(prev => ({ ...prev, [name]: true }));
    try {
      const g = state.gateways.find(g => g.name === name);
      const gwKey = name.toLowerCase().replace(/\s+/g, '');
      const credentials = editFields[name] || {};
      const res = await fetch('/api/gateway/balance/' + gwKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (data.ok && data.balance !== undefined) {
        dispatch({ type: 'UPDATE_GATEWAY_BALANCE', payload: { name, balance: data.balance } });
        addActivity(`Saldo ${name}: R$ ${data.balance.toFixed(2)}`, 'info');
      } else {
        addActivity(`Saldo ${name}: indisponível`, 'warning');
      }
    } catch {
      addActivity(`Erro ao consultar saldo: ${name}`, 'warning');
    }
    setConsulting(prev => ({ ...prev, [name]: false }));
  };

  const handleFieldChange = (name, field, value) => {
    setEditFields(prev => ({ ...prev, [name]: { ...prev[name], [field]: value } }));
  };
  const handleSaveConfig = (name) => {
    addActivity(`Configurações do ${name} salvas`, 'success');
    addNotification('Gateway configurado', `Credenciais do ${name} atualizadas.`);
    setEditFields(prev => ({ ...prev, [name]: { ...prev[name], saved: true } }));
  };
  const handleToggle = (g) => {
    dispatch({ type: 'TOGGLE_GATEWAY', payload: g.name });
    addActivity(`Gateway ${g.name} ${!g.connected ? 'conectado' : 'desconectado'}`, 'warning');
    if (!g.connected) addNotification('Gateway conectado', `${g.name} está pronto.`);
  };
  const handleAddGateway = (e) => {
    e.preventDefault();
    if (!newGateway.name) return;
    dispatch({ type: 'ADD_GATEWAY', payload: { name: newGateway.name, connected: false, type: newGateway.type } });
    addActivity(`Gateway ${newGateway.name} adicionado`, 'success');
    setShowAdd(false);
    setNewGateway({ name: '', type: 'PIX' });
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

  const totalEarning = state.sales?.reduce((acc, s) => acc + (Number(s.value) || 0), 0) || 0;

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold flex items-center gap-3">
              <Wallet size={28} className="text-[var(--brand-500)]" />
              Gateways
            </h1>
            <p className="text-sm text-[#a1a1aa] mt-1">
              {state.gateways.filter(g => g.connected).length} conectados · {state.gateways.length} no total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdd(!showAdd)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
              showAdd ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white'
            }`}>
            <Plus size={16} /> {showAdd ? 'Cancelar' : 'Novo Gateway'}
          </button>
          </div>
        </div>

        {showAdd && (
          <div className="p-6 mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] animate-fade-in">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2"><Plus size={16} className="text-[var(--brand-500)]" /> Adicionar Gateway</h3>
            <form onSubmit={handleAddGateway}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="relative">
                  <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Nome</label>
                  <input value={newGateway.name}
                    onChange={e => { setNewGateway({ ...newGateway, name: e.target.value }); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
                    placeholder="Ex: SigiloPay" />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-[#1a1a22] border border-white/[0.08] rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                      {filteredSuggestions.map(s => (
                        <button key={s} type="button"
                          onMouseDown={() => { setNewGateway({ ...newGateway, name: s }); setShowSuggestions(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/[0.04] transition-colors flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: GATEWAY_BRANDS[s] || '#3B82F6' }}>
                            {GATEWAY_LOGO_STYLES[s] || s.substring(0, 2).toUpperCase()}
                          </span>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Tipo</label>
                  <select value={newGateway.type} onChange={e => setNewGateway({ ...newGateway, type: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)] appearance-none">
                    <option value="PIX">PIX</option>
                    <option value="PIX / Cartão">PIX / Cartão</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Crypto">Criptomoeda</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button type="submit"
                    className="px-6 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                    <Plus size={16} /> Adicionar Gateway
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.08]">
            {['all', 'PIX', 'PIX / Cartão', 'Cartão', 'Crypto'].map(type => (
              <button key={type} onClick={() => setFilterType(type)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterType === type ? 'bg-white/[0.08] text-white border border-white/[0.08]' : 'text-[#52525b] hover:text-white'
                }`}>
                {type === 'all' ? 'Todos' : type}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
              placeholder="Buscar gateway..." />
          </div>
          <div className="flex items-center gap-2 text-xs text-[#52525b]">
            <RefreshCw size={12} /> {filteredGateways.length} de {state.gateways.length}
          </div>
        </div>

        {filteredGateways.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Wallet size={28} className="text-[#52525b]" />
            </div>
            <p className="text-white/70 mb-2">
              {searchQuery ? 'Nenhum gateway encontrado.' : 'Nenhum gateway configurado.'}
            </p>
            <p className="text-sm text-[#52525b] mb-4">
              {searchQuery ? 'Tente outro termo.' : 'Adicione seu primeiro gateway para começar.'}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowAdd(true)}
                className="px-5 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto">
                <Plus size={16} /> Adicionar Gateway
              </button>
            )}
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredGateways.map((g, i) => (
              <GatewayCard
                key={g.name} gateway={g} index={i}
                editFields={editFields} expanded={expanded}
                setExpanded={setExpanded} handleFieldChange={handleFieldChange}
                handleSaveConfig={handleSaveConfig} handleToggle={handleToggle}
                handleRemoveGateway={handleRemoveGateway}
                handleConsultBalance={handleConsultBalance} consulting={consulting}
              />
            ))}
          </div>
        )}

      </div>
    </PageTransition>
  );
}

export default Gateways;

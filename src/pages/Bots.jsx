import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Loader2, Bot, Users, DollarSign, Settings, ShoppingCart, QrCode, Copy, Check, ExternalLink, Trash2, Play, Square, Send, RefreshCw, CreditCard, Shield, Info } from 'lucide-react';

const TABS = [
  { key: 'bots', label: 'Bots', icon: Bot },
  { key: 'groups', label: 'Grupos', icon: Users },
  { key: 'sales', label: 'Vendas', icon: DollarSign },
  { key: 'members', label: 'Membros', icon: Users },
  { key: 'pix', label: 'PIX', icon: QrCode },
];

function Bots() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [tab, setTab] = useState('bots');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [showBotForm, setShowBotForm] = useState(false);
  const [botForm, setBotForm] = useState({ name: '', token: '', status: 'active', welcomeMessage: '' });
  const [editingBotId, setEditingBotId] = useState(null);
  const [runningBots, setRunningBots] = useState({});
  const [botLogs, setBotLogs] = useState({});

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', price: '', inviteLink: '', preview: '', category: 'vip' });
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sendingLink, setSendingLink] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Bot handlers
  const handleValidateToken = async (token) => {
    try {
      const res = await fetch('/api/telegram/me', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
      });
      return await res.json();
    } catch { return { ok: false, error: 'Servidor offline' }; }
  };

  const handleBotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!botForm.name || !botForm.token) return setError('Preencha nome e token.');
    setLoading(true);
    const validation = await handleValidateToken(botForm.token);
    setLoading(false);
    if (!validation.ok) {
      setError(validation.error || 'Token inválido.');
      return;
    }
    if (editingBotId) {
      dispatch({ type: 'UPDATE_BOT', payload: { id: editingBotId, data: { ...botForm, username: validation.result.username } } });
      addActivity(`Bot ${botForm.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_BOT', payload: { id: helpers.uid(), ...botForm, username: validation.result.username, validatedAt: new Date().toISOString(), createdAt: helpers.today() } });
      addActivity(`Bot ${botForm.name} criado`, 'success');
      addNotification('Bot criado', `Bot ${botForm.name} validado com sucesso.`);
    }
    setBotForm({ name: '', token: '', status: 'active', welcomeMessage: '' });
    setEditingBotId(null);
    setShowBotForm(false);
  };

  const handleStartBot = async (bot) => {
    const botGroups = state.groups.filter(g => g.active);
    setLoading(true);
    try {
      const res = await fetch('/api/content/start-bot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bot.name,
          token: bot.token,
          id: bot.id,
          groups: botGroups,
          pixConfig: {
            ...state.pixConfig,
            gateways: (() => {
              const gwMap = {};
              state.gateways.forEach(g => {
                const key = g.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
                gwMap[key] = {
                  apiKey: g.apiKey || '',
                  clientId: g.apiKey || '',
                  token: g.apiKey || '',
                  secretKey: g.secretKey || '',
                  clientSecret: g.secretKey || '',
                  email: g.email || '',
                  webhookUrl: g.webhookUrl || '',
                  pixKey: g.pixKey || state.pixConfig.pixKey || '',
                  cpf: g.cpf || '',
                  sandbox: g.sandbox || false,
                };
              });
              return gwMap;
            })(),
          },
        })
      });
      const data = await res.json();
      if (data.ok) {
        setRunningBots(prev => ({ ...prev, [bot.id]: true }));
        addActivity(`Bot ${bot.name} iniciado`, 'success');
        addNotification('Bot ativo', `${bot.name} está rodando!`);
      } else {
        setError(data.error || 'Erro ao iniciar bot');
      }
    } catch (e) {
      setError('Servidor offline');
    }
    setLoading(false);
  };

  const handleStopBot = async (botId, botName) => {
    try {
      await fetch('/api/content/stop-bot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: botId })
      });
      setRunningBots(prev => ({ ...prev, [botId]: false }));
      addActivity(`Bot ${botName} parado`, 'warning');
    } catch {}
  };

  const handleSendGroupLink = async (order) => {
    if (!order.chatId || !order.groupId) return;
    setSendingLink(order.paymentId);
    const group = state.groups.find(g => g.id === order.groupId);
    if (!group || !group.inviteLink) {
      setError('Grupo não tem link de convite.');
      setSendingLink(null);
      return;
    }
    try {
      const res = await fetch('/api/content/send-group-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: order.botId, chatId: order.chatId, inviteLink: group.inviteLink })
      });
      const data = await res.json();
      if (data.ok) {
        dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, data: { status: 'delivered', deliveredAt: new Date().toISOString() } } });
        dispatch({ type: 'ADD_MEMBER', payload: { groupId: order.groupId, name: order.customerName, contact: order.customerContact, chatId: order.chatId, value: order.value, status: 'active' } });
        dispatch({ type: 'UPDATE_GROUP', payload: { id: order.groupId, data: { members: (group.members || 0) + 1 } } });
        addActivity(`Link enviado para ${order.customerName}`, 'success');
        addNotification('Acesso liberado', `${order.customerName} entrou no grupo ${order.groupName}`);
      } else {
        setError(data.error || 'Erro ao enviar link');
      }
    } catch { setError('Servidor offline'); }
    setSendingLink(null);
  };

  const handleApprovePayment = (order) => {
    dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, data: { status: 'approved' } } });
    addNotification('Pagamento confirmado', `Pagamento de ${order.customerName} confirmado.`);
    handleSendGroupLink(order);
  };

  // Group handlers
  const handleGroupSubmit = (e) => {
    e.preventDefault();
    if (!groupForm.name || !groupForm.price || !groupForm.inviteLink) {
      return setError('Preencha nome, preço e link do grupo.');
    }
    const data = {
      ...groupForm,
      price: parseFloat(groupForm.price) || 0,
      members: 0,
      active: true,
      createdAt: helpers.today(),
    };
    if (editingGroupId) {
      dispatch({ type: 'UPDATE_GROUP', payload: { id: editingGroupId, data } });
      addActivity(`Grupo ${groupForm.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_GROUP', payload: { id: helpers.uid(), ...data } });
      addActivity(`Grupo ${groupForm.name} criado`, 'success');
    }
    setGroupForm({ name: '', description: '', price: '', inviteLink: '', preview: '', category: 'vip' });
    setEditingGroupId(null);
    setShowGroupForm(false);
    setError('');
  };

  const handleEditGroup = (group) => {
    setGroupForm({ name: group.name, description: group.description || '', price: String(group.price), inviteLink: group.inviteLink, preview: group.preview || '', category: group.category || 'vip' });
    setEditingGroupId(group.id);
    setShowGroupForm(true);
  };

  const handleToggleGroup = (group) => {
    dispatch({ type: 'UPDATE_GROUP', payload: { id: group.id, data: { active: !group.active } } });
    addActivity(`Grupo ${group.name} ${group.active ? 'desativado' : 'ativado'}`, 'warning');
  };

  const handleDeleteGroup = (id, name) => {
    dispatch({ type: 'DELETE_GROUP', payload: id });
    addActivity(`Grupo ${name} excluído`, 'warning');
  };

  const filteredGroups = state.groups.filter(g => {
    if (selectedGroup !== 'todos' && g.category !== selectedGroup) return false;
    if (searchTerm && !g.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalSales = state.orders.filter(o => o.status === 'approved' || o.status === 'delivered').reduce((a, o) => a + Number(o.value), 0);

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        {/* Header */}
        <div className="sm:flex sm:justify-between sm:items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Venda de Grupos</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema completo de venda de acesso a grupos Telegram</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Bots Ativos', value: Object.values(runningBots).filter(Boolean).length, icon: Bot, color: 'text-chart-1' },
            { label: 'Grupos', value: state.groups.filter(g => g.active).length, icon: Users, color: 'text-chart-2' },
            { label: 'Vendas (R$)', value: helpers.formatMoney(totalSales), icon: DollarSign, color: 'text-chart-3' },
            { label: 'Membros', value: state.members.length, icon: Users, color: 'text-chart-4' },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center gap-3">
                <stat.icon size={20} className={stat.color} />
                <div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                  <div className="text-lg font-bold text-card-foreground">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 overflow-x-auto animate-fade-in">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${tab === t.key ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-card-foreground'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">{error}</div>
        )}

        {/* Tab: Bots */}
        {tab === 'bots' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Seus Bots</h2>
              <AnimatedButton onClick={() => { setShowBotForm(!showBotForm); setEditingBotId(null); setBotForm({ name: '', token: '', status: 'active', welcomeMessage: '' }); setError(''); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                {showBotForm ? 'Cancelar' : 'Novo Bot'}
              </AnimatedButton>
            </div>

            {showBotForm && (
              <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                <h3 className="text-lg font-bold text-card-foreground mb-4">{editingBotId ? 'Editar Bot' : 'Novo Bot de Vendas'}</h3>
                <form onSubmit={handleBotSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Bot</label>
                    <input value={botForm.name} onChange={e => setBotForm({ ...botForm, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Ex: Bot Vendas VIP" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Token do Telegram</label>
                    <input value={botForm.token} onChange={e => setBotForm({ ...botForm, token: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Cole o token do BotFather" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Mensagem de Boas-vindas (opcional)</label>
                    <textarea value={botForm.welcomeMessage} onChange={e => setBotForm({ ...botForm, welcomeMessage: e.target.value })} rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all resize-none"
                      placeholder="Mensagem personalizada que aparece quando alguém inicia o bot..." />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <AnimatedButton type="submit" disabled={loading} className="px-5 py-2 bg-primary disabled:opacity-60 text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
                      {loading && <Loader2 size={16} className="animate-spin" />}
                      {loading ? 'Validando...' : editingBotId ? 'Salvar' : 'Criar Bot'}
                    </AnimatedButton>
                  </div>
                </form>
              </div>
            )}

            {state.bots.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
                <Bot size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Nenhum bot cadastrado. Crie um bot no BotFather e adicione aqui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {state.bots.map((bot, i) => (
                  <div key={bot.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <AnimatedCard className="bg-card rounded-xl border border-border p-5 h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-card-foreground">{bot.name}</h3>
                          <p className="text-xs text-muted-foreground">@{bot.username || 'desconhecido'}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${runningBots[bot.id] ? 'bg-chart-1/15 text-chart-1' : bot.status === 'active' ? 'bg-chart-2/15 text-chart-2' : 'bg-destructive/15 text-destructive'}`}>
                          {runningBots[bot.id] ? 'Rodando' : bot.status === 'active' ? 'Parado' : 'Inativo'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3 font-mono truncate">Token: {bot.token.slice(0, 8)}...{bot.token.slice(-4)}</div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => { setEditingBotId(bot.id); setBotForm({ name: bot.name, token: bot.token, status: bot.status, welcomeMessage: bot.welcomeMessage || '' }); setShowBotForm(true); }}
                          className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg">Editar</button>
                        {runningBots[bot.id] ? (
                          <button onClick={() => handleStopBot(bot.id, bot.name)}
                            className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg flex items-center gap-1"><Square size={12} /> Parar</button>
                        ) : (
                          <button onClick={() => handleStartBot(bot)}
                            className="px-3 py-1.5 text-xs font-medium bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 rounded-lg flex items-center gap-1"><Play size={12} /> Iniciar</button>
                        )}
                        <button onClick={() => { dispatch({ type: 'DELETE_BOT', payload: bot.id }); addActivity(`Bot ${bot.name} excluído`, 'warning'); }}
                          className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg ml-auto"><Trash2 size={12} /></button>
                      </div>
                    </AnimatedCard>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Groups */}
        {tab === 'groups' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                {['todos', 'vip', 'combo', 'free'].map(cat => (
                  <button key={cat} onClick={() => setSelectedGroup(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${selectedGroup === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {cat === 'todos' ? 'Todos' : cat === 'vip' ? '💎 VIP' : cat === 'combo' ? '📦 Combo' : '🎁 Free'}
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowGroupForm(!showGroupForm); setEditingGroupId(null); setGroupForm({ name: '', description: '', price: '', inviteLink: '', preview: '', category: 'vip' }); setError(''); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg whitespace-nowrap">
                {showGroupForm ? 'Cancelar' : '+ Novo Grupo'}
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar grupo..." className="w-full max-w-xs px-4 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
            </div>

            {showGroupForm && (
              <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                <h3 className="text-lg font-bold text-card-foreground mb-4">{editingGroupId ? 'Editar Grupo' : 'Novo Grupo'}</h3>
                <form onSubmit={handleGroupSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Grupo</label>
                    <input value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: VIP Premium 🔥" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Descrição</label>
                    <textarea value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} rows={2}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" placeholder="Descrição do grupo..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" min="0" value={groupForm.price} onChange={e => setGroupForm({ ...groupForm, price: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="29.90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Categoria</label>
                    <select value={groupForm.category} onChange={e => setGroupForm({ ...groupForm, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      <option value="vip">💎 VIP</option>
                      <option value="combo">📦 Combo</option>
                      <option value="free">🎁 Free</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Link de Convite do Grupo</label>
                    <input value={groupForm.inviteLink} onChange={e => setGroupForm({ ...groupForm, inviteLink: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://t.me/+AbCdEf123" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Texto de Destaque</label>
                    <input value={groupForm.preview} onChange={e => setGroupForm({ ...groupForm, preview: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="🔥 Mais vendido!" />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">
                      {editingGroupId ? 'Salvar' : 'Criar Grupo'}
                    </AnimatedButton>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGroups.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 bg-card rounded-xl border border-border p-12 text-center">
                  <p className="text-muted-foreground">Nenhum grupo encontrado.</p>
                </div>
              ) : filteredGroups.map((group, i) => (
                <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <AnimatedCard className="bg-card rounded-xl border border-border p-5 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-card-foreground">{group.name}</h3>
                        <p className="text-xs text-muted-foreground">{group.description}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${group.active ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                        {group.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {group.preview && <p className="text-xs mb-2 text-chart-3">{group.preview}</p>}
                    <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-border/50">
                      <div className="text-center">
                        <div className="text-xl font-bold text-card-foreground">{helpers.formatMoney(group.price)}</div>
                        <div className="text-xs text-muted-foreground">Preço</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-card-foreground">{group.members || 0}</div>
                        <div className="text-xs text-muted-foreground">Membros</div>
                      </div>
                    </div>
                    {group.inviteLink && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-background rounded-lg">
                        <span className="text-xs text-muted-foreground truncate flex-1">{group.inviteLink}</span>
                        <button onClick={() => copyToClipboard(group.inviteLink, group.id)} className="p-1 hover:bg-secondary rounded transition-colors">
                          {copiedId === group.id ? <Check size={14} className="text-chart-1" /> : <Copy size={14} className="text-muted-foreground" />}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEditGroup(group)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg">Editar</button>
                      <button onClick={() => handleToggleGroup(group)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg">{group.active ? 'Desativar' : 'Ativar'}</button>
                      <button onClick={() => window.open(group.inviteLink, '_blank')} className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg flex items-center gap-1"><ExternalLink size={12} /> Abrir</button>
                      <button onClick={() => handleDeleteGroup(group.id, group.name)} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg ml-auto"><Trash2 size={12} /></button>
                    </div>
                  </AnimatedCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Sales */}
        {tab === 'sales' && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Pedidos Recebidos</h2>
              <span className="text-sm text-muted-foreground">Total: {helpers.formatMoney(totalSales)}</span>
            </div>

            {state.orders.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
                <ShoppingCart size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Nenhum pedido ainda.</p>
                <p className="text-xs text-muted-foreground">Os pedidos aparecerão aqui quando clientes comprarem pelos bots.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...state.orders].reverse().map((order, i) => (
                  <div key={order.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="font-medium text-card-foreground">{order.customerName}</span>
                        <span className="text-sm text-muted-foreground ml-2">— {order.productName || order.groupName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-card-foreground">{helpers.formatMoney(order.value)}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'delivered' ? 'bg-chart-1/15 text-chart-1' : order.status === 'approved' ? 'bg-chart-2/15 text-chart-2' : order.status === 'pending' ? 'bg-chart-4/15 text-chart-4' : 'bg-destructive/15 text-destructive'}`}>
                          {order.status === 'delivered' ? '✅ Entregue' : order.status === 'approved' ? '💰 Aprovado' : order.status === 'pending' ? '⏳ Pendente' : '❌ Cancelado'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      <span>📱 {order.customerContact || '—'}</span>
                      <span>🆔 {order.chatId || '—'}</span>
                      <span>📅 {new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    {expandedOrder === order.id && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
                        {order.status === 'pending' && (
                          <button onClick={() => handleApprovePayment(order)}
                            className="px-3 py-1.5 text-xs font-medium bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 rounded-lg flex items-center gap-1">
                            ✅ Confirmar Pagamento
                          </button>
                        )}
                        {(order.status === 'approved' || order.status === 'pending') && (
                          <button onClick={() => handleSendGroupLink(order)} disabled={sendingLink === order.paymentId}
                            className="px-3 py-1.5 text-xs font-medium bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 rounded-lg flex items-center gap-1">
                            {sendingLink === order.paymentId ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Enviar Link do Grupo
                          </button>
                        )}
                        <button onClick={() => copyToClipboard(order.chatId || '', 'chat-' + order.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg flex items-center gap-1">
                          <Copy size={12} /> Copiar ChatID
                        </button>
                      </div>
                    )}
                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="text-xs text-primary mt-2 hover:underline">
                      {expandedOrder === order.id ? 'Recolher' : 'Ações'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Members */}
        {tab === 'members' && (
          <div>
            <h2 className="text-lg font-bold text-card-foreground mb-4">Membros ({state.members.length})</h2>

            {state.members.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
                <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum membro cadastrado ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Nome</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Contato</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Grupo</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Valor</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Data</th>
                      <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.members.map((m, i) => {
                      const group = state.groups.find(g => g.id === m.groupId);
                      return (
                        <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 text-card-foreground">{m.name}</td>
                          <td className="py-3 px-2 text-muted-foreground">{m.contact}</td>
                          <td className="py-3 px-2 text-muted-foreground">{group?.name || '—'}</td>
                          <td className="py-3 px-2 text-card-foreground font-medium">{helpers.formatMoney(m.value)}</td>
                          <td className="py-3 px-2 text-muted-foreground">{new Date(m.purchasedAt).toLocaleDateString('pt-BR')}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'active' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                              {m.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: PIX Config */}
        {tab === 'pix' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Configuração de Pagamentos</h2>
              <a href="/gateways" className="text-sm text-primary hover:underline flex items-center gap-1"><Settings size={14} /> Gerenciar Gateways</a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AnimatedCard className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2"><QrCode size={18} /> Gateway PIX Ativo</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Gateway para receber pagamentos</label>
                      <select value={state.pixConfig.gateway || 'static'} onChange={e => dispatch({ type: 'SET_PIX_CONFIG', payload: { gateway: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                        <option value="static">PIX Estático (QR Code local)</option>
                        {state.gateways.filter(g => g.type.includes('PIX')).map(g => (
                          <option key={g.name} value={g.name.toLowerCase().replace(/\s+/g, '_')}>
                            {g.name} {g.connected ? '✅' : '❌'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Chave PIX</label>
                      <input value={state.pixConfig.pixKey} onChange={e => dispatch({ type: 'SET_PIX_CONFIG', payload: { pixKey: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="CPF, CNPJ, email ou telefone" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Titular</label>
                      <input value={state.pixConfig.merchantName} onChange={e => dispatch({ type: 'SET_PIX_CONFIG', payload: { merchantName: e.target.value } })}
                        className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Zeze Content" />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2"><CreditCard size={18} /> Gateways Disponíveis</h3>
                  {state.gateways.filter(g => g.type.includes('PIX')).length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">Nenhum gateway PIX configurado.</p>
                      <a href="/gateways" className="text-sm text-primary hover:underline">Configurar gateways →</a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {state.gateways.filter(g => g.type.includes('PIX')).map(g => (
                        <div key={g.name} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                          <div className="flex items-center gap-3">
                            <Shield size={18} className={g.connected ? 'text-chart-1' : 'text-muted-foreground'} />
                            <div>
                              <span className="text-sm font-medium text-card-foreground">{g.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">{g.type}</span>
                            </div>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${g.connected ? 'bg-chart-1/15 text-chart-1' : 'bg-muted text-muted-foreground'}`}>
                            {g.connected ? 'Conectado' : 'Desconectado'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedCard>
              </div>

              <div className="space-y-4">
                <AnimatedCard className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-card-foreground mb-3 flex items-center gap-2"><Info size={18} /> Status Pix</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gateway Ativo:</span>
                      <span className="text-card-foreground font-medium">
                        {state.pixConfig.gateway === 'static' ? 'QR Code Local' : state.pixConfig.gateway}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chave PIX:</span>
                      <span className="text-card-foreground font-medium text-xs truncate max-w-[140px]">{state.pixConfig.pixKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vendas via Bot:</span>
                      <span className="text-card-foreground font-medium">{state.orders.length}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground mt-2">
                      💡 Configure a chave PIX correta e escolha um gateway conectado para receber pagamentos automaticamente.
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-bold text-card-foreground mb-3">Últimas Transações</h3>
                  {state.orders.filter(o => o.status === 'pending' || o.status === 'approved').length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma transação recente.</p>
                  ) : (
                    <div className="space-y-2">
                      {state.orders.filter(o => o.status === 'pending' || o.status === 'approved').slice(0, 5).map(o => (
                        <div key={o.id} className="flex items-center justify-between text-xs">
                          <span className="text-card-foreground truncate max-w-[120px]">{o.customerName}</span>
                          <span className={`font-medium ${o.status === 'approved' ? 'text-chart-1' : 'text-chart-4'}`}>
                            {helpers.formatMoney(o.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default Bots;

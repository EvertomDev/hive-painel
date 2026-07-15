import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Search, Filter, ChevronDown, ChevronUp, UserPlus, Edit3, Trash2, Send, X, MessageCircle, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';

function Clientes() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', telegram: '', product: '', status: 'active' });
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const combined = [
    ...state.clients.map(c => ({ ...c, source: 'client' })),
    ...state.members.map(m => {
      const group = state.groups.find(g => g.id === m.groupId);
      return {
        id: m.id,
        name: m.name,
        telegram: m.contact,
        product: group?.name || 'Membro',
        status: m.status,
        date: m.purchasedAt,
        source: 'member',
        memberValue: m.value,
      };
    }),
  ];

  const filtered = combined
    .filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && !c.telegram?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

  const totalSpent = (name) => state.orders
    .filter(o => o.customerName?.toLowerCase() === name?.toLowerCase() && (o.status === 'approved' || o.status === 'delivered'))
    .reduce((a, o) => a + Number(o.value), 0);

  const totalLeads = combined.length;
  const activeMembers = state.members.filter(m => m.status === 'active').length;
  const conversionRate = totalLeads > 0 ? ((activeMembers / totalLeads) * 100).toFixed(1) : '0.0';
  const totalSpentAll = state.orders.filter(o => o.status === 'approved' || o.status === 'delivered').reduce((a, o) => a + Number(o.value), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.telegram) return;
    if (editingId) {
      dispatch({ type: 'UPDATE_CLIENT', payload: { id: editingId, data: { ...form } } });
      addActivity(`Cliente ${form.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_CLIENT', payload: { id: helpers.uid(), ...form, date: helpers.today() } });
      addActivity(`Cliente ${form.name} cadastrado`, 'success');
      addNotification('Novo cliente', `${form.name} foi cadastrado na base.`);
    }
    setForm({ name: '', telegram: '', product: '', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, telegram: c.telegram, product: c.product || '', status: c.status });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const c = combined.find(x => x.id === id);
    dispatch({ type: 'DELETE_CLIENT', payload: id });
    addActivity(`Cliente ${c?.name} excluído`, 'warning');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">Base de leads e compradores</p>
          </div>
          <AnimatedButton onClick={() => { setForm({ name: '', telegram: '', product: '', status: 'active' }); setEditingId(null); setShowForm(!showForm); }}
            className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
            <UserPlus size={16} className="mr-1" /> {showForm ? 'Cancelar' : 'Novo Cliente'}
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-chart-1' },
            { label: 'Membros Ativos', value: activeMembers, icon: Users, color: 'text-chart-2' },
            { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-chart-3' },
            { label: 'Total Gasto', value: helpers.formatMoney(totalSpentAll), icon: DollarSign, color: 'text-chart-4' },
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

        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou contato..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
            <option value="date">Data</option>
            <option value="name">Nome</option>
          </select>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-card-foreground mb-4">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Telegram / WhatsApp</label>
                <input value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="@usuario" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Produto</label>
                <input value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Produto comprado" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div className="md:col-span-4 flex gap-3">
                <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">{editingId ? 'Salvar' : 'Cadastrar'}</AnimatedButton>
                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
              <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum cliente ou membro encontrado.</p>
            </div>
          ) : filtered.map((c, i) => {
            const spent = totalSpent(c.name);
            const orders = state.orders.filter(o => o.customerName?.toLowerCase() === c.name?.toLowerCase());
            const isExpanded = expandedId === c.id;
            return (
              <div key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                <AnimatedCard className="bg-card rounded-xl border border-border p-5 h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-card-foreground truncate">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.telegram}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium shrink-0 ${c.status === 'active' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                      {c.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3 py-3 border-y border-border/50 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Produto</span>
                      <p className="text-card-foreground font-medium truncate">{c.product || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Total Gasto</span>
                      <p className="text-card-foreground font-medium">{helpers.formatMoney(spent)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Cadastro</span>
                      <p className="text-card-foreground">{c.date ? helpers.formatDate(c.date) : '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Pedidos</span>
                      <p className="text-card-foreground">{orders.length}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleEdit(c)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg flex items-center gap-1"><Edit3 size={12} /> Editar</button>
                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
                    <button onClick={() => window.open(`https://t.me/${c.telegram?.replace('@', '')}`, '_blank')} className="px-3 py-1.5 text-xs font-medium bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 rounded-lg flex items-center gap-1"><Send size={12} /> Mensagem</button>
                    <button onClick={() => setExpandedId(isExpanded ? null : c.id)} className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg flex items-center gap-1 ml-auto">
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {isExpanded ? 'Fechar' : 'Histórico'}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/50 animate-fade-in">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Compras Realizadas</h4>
                      {orders.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhuma compra encontrada.</p>
                      ) : (
                        <div className="space-y-2">
                          {orders.map(o => (
                            <div key={o.id} className="flex items-center justify-between p-2 bg-background rounded-lg text-xs">
                              <div>
                                <span className="text-card-foreground font-medium">{o.groupName || o.productName || '—'}</span>
                                <span className="text-muted-foreground ml-2">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-card-foreground">{helpers.formatMoney(o.value)}</span>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${o.status === 'delivered' ? 'bg-chart-1/15 text-chart-1' : o.status === 'approved' ? 'bg-chart-2/15 text-chart-2' : o.status === 'pending' ? 'bg-chart-4/15 text-chart-4' : 'bg-destructive/15 text-destructive'}`}>
                                  {o.status === 'delivered' ? 'Entregue' : o.status === 'approved' ? 'Aprovado' : o.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </AnimatedCard>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}

export default Clientes;

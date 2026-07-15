import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { DollarSign, Clock, XCircle, TrendingUp, Search, Filter, Edit2, Trash2, CheckCircle, Plus, X } from 'lucide-react';

const tabs = [
  { key: 'all', label: 'Todas' },
  { key: 'receitas', label: 'Receitas' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'canceladas', label: 'Canceladas' },
];

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-chart-1/15 text-chart-1',
    delivered: 'bg-chart-2/15 text-chart-2',
    pending: 'bg-chart-3/15 text-chart-3',
    cancelled: 'bg-destructive/15 text-destructive',
  };
  const labels = {
    approved: 'Aprovado',
    delivered: 'Entregue',
    pending: 'Pendente',
    cancelled: 'Cancelado',
  };
  return <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
}

const emptyForm = {
  type: 'sale',
  product: '',
  clientName: '',
  customerName: '',
  value: '',
  gateway: '',
  status: 'approved',
  date: '',
};

function Financeiro() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filterGateway, setFilterGateway] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);

  const transactions = useMemo(() => {
    const mapped = [
      ...state.sales.map(s => ({
        ...s,
        source: 'sale',
        transactionId: s.id,
        clientDisplay: s.clientName,
        productDisplay: s.product,
        gatewayDisplay: s.gateway,
        statusDisplay: s.status,
        dateDisplay: s.date,
        valueNum: Number(s.value),
      })),
      ...state.orders.map(o => ({
        ...o,
        source: 'order',
        transactionId: o.id,
        clientDisplay: o.customerName || '—',
        productDisplay: o.botName || o.groupName || '—',
        gatewayDisplay: o.paymentId ? 'PIX' : '—',
        statusDisplay: o.status,
        dateDisplay: o.createdAt ? o.createdAt.split('T')[0] : '',
        valueNum: Number(o.value),
      })),
    ].sort((a, b) => new Date(b.dateDisplay) - new Date(a.dateDisplay));
    return mapped;
  }, [state.sales, state.orders]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchTab = tab === 'all'
        || (tab === 'receitas' && (t.statusDisplay === 'approved' || t.statusDisplay === 'delivered'))
        || (tab === 'pendentes' && t.statusDisplay === 'pending')
        || (tab === 'canceladas' && t.statusDisplay === 'cancelled');
      const matchSearch = !search || t.clientDisplay?.toLowerCase().includes(search.toLowerCase()) || t.productDisplay?.toLowerCase().includes(search.toLowerCase()) || t.transactionId?.toLowerCase().includes(search.toLowerCase());
      const matchGateway = !filterGateway || t.gatewayDisplay?.toLowerCase().includes(filterGateway.toLowerCase());
      const matchStatus = !filterStatus || t.statusDisplay === filterStatus;
      const matchDate = (!dateStart || t.dateDisplay >= dateStart) && (!dateEnd || t.dateDisplay <= dateEnd);
      return matchTab && matchSearch && matchGateway && matchStatus && matchDate;
    });
  }, [transactions, tab, search, filterGateway, filterStatus, dateStart, dateEnd]);

  const totalRevenue = useMemo(() =>
    transactions.filter(t => t.statusDisplay === 'approved' || t.statusDisplay === 'delivered').reduce((a, t) => a + t.valueNum, 0),
  [transactions]);

  const totalPending = useMemo(() =>
    transactions.filter(t => t.statusDisplay === 'pending').reduce((a, t) => a + t.valueNum, 0),
  [transactions]);

  const totalCancelled = useMemo(() =>
    transactions.filter(t => t.statusDisplay === 'cancelled').reduce((a, t) => a + t.valueNum, 0),
  [transactions]);

  const dailyAvg = useMemo(() => {
    const approved = transactions.filter(t => t.statusDisplay === 'approved' || t.statusDisplay === 'delivered');
    if (approved.length === 0) return 0;
    const dates = [...new Set(approved.map(t => t.dateDisplay))];
    return dates.length > 0 ? totalRevenue / dates.length : 0;
  }, [transactions, totalRevenue]);

  const resetForm = () => {
    setForm({ ...emptyForm, date: helpers.today() });
    setEditingId(null);
    setEditingType(null);
    setShowForm(false);
  };

  const handleEdit = (transaction) => {
    if (transaction.source === 'sale') {
      const sale = state.sales.find(s => s.id === transaction.id);
      if (sale) {
        setForm({ type: 'sale', product: sale.product, clientName: sale.clientName, customerName: '', value: String(sale.value), gateway: sale.gateway, status: sale.status, date: sale.date });
        setEditingId(sale.id);
        setEditingType('sale');
        setShowForm(true);
      }
    } else {
      const order = state.orders.find(o => o.id === transaction.id);
      if (order) {
        setForm({ type: 'order', product: '', clientName: '', customerName: order.customerName, value: String(order.value), gateway: order.paymentId ? 'PIX' : '', status: order.status, date: order.createdAt ? order.createdAt.split('T')[0] : helpers.today() });
        setEditingId(order.id);
        setEditingType('order');
        setShowForm(true);
      }
    }
  };

  const handleDelete = (transaction) => {
    if (transaction.source === 'sale') {
      const sale = state.sales.find(s => s.id === transaction.id);
      dispatch({ type: 'DELETE_SALE', payload: transaction.id });
      addActivity(`Venda ${sale?.product || ''} excluída do financeiro`, 'warning');
    } else {
      const order = state.orders.find(o => o.id === transaction.id);
      dispatch({ type: 'UPDATE_ORDER', payload: { id: transaction.id, data: { status: 'cancelled' } } });
      addActivity(`Pedido ${order?.botName || ''} cancelado no financeiro`, 'warning');
    }
  };

  const handleConfirmPayment = (transaction) => {
    if (transaction.source === 'sale') {
      dispatch({ type: 'UPDATE_SALE', payload: { id: transaction.id, data: { status: 'approved' } } });
      addActivity(`Pagamento confirmado para venda ${transaction.productDisplay}`, 'success');
      addNotification('Pagamento confirmado', `Venda de ${transaction.productDisplay} foi aprovada.`);
    } else {
      dispatch({ type: 'UPDATE_ORDER', payload: { id: transaction.id, data: { status: 'delivered' } } });
      addActivity(`Pagamento confirmado para pedido ${transaction.productDisplay}`, 'success');
      addNotification('Pagamento confirmado', `Pedido de ${transaction.productDisplay} foi entregue.`);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      if (editingType === 'sale') {
        dispatch({ type: 'UPDATE_SALE', payload: { id: editingId, data: { product: form.product, clientName: form.clientName, value: parseFloat(form.value), gateway: form.gateway, status: form.status, date: form.date } } });
        addActivity(`Transação ${form.product} atualizada`, 'info');
      } else {
        dispatch({ type: 'UPDATE_ORDER', payload: { id: editingId, data: { customerName: form.customerName, value: parseFloat(form.value), status: form.status } } });
        addActivity(`Transação atualizada`, 'info');
      }
    } else {
      const data = {
        id: helpers.uid(),
        product: form.product,
        clientName: form.clientName,
        value: parseFloat(form.value),
        gateway: form.gateway || state.config.defaultGateway,
        status: form.status,
        date: form.date || helpers.today(),
        botId: '',
      };
      dispatch({ type: 'ADD_SALE', payload: data });
      addActivity(`Nova receita de ${helpers.formatMoney(data.value)} registrada`, 'success');
      addNotification('Nova transação', `Receita de ${helpers.formatMoney(data.value)} registrada no financeiro.`);
    }
    resetForm();
  };

  const summaryCards = [
    { label: 'Receita Total', value: helpers.formatMoney(totalRevenue), icon: DollarSign, color: 'text-chart-1', detail: `${transactions.filter(t => t.statusDisplay === 'approved' || t.statusDisplay === 'delivered').length} transações` },
    { label: 'Pendente', value: helpers.formatMoney(totalPending), icon: Clock, color: 'text-chart-3', detail: `${transactions.filter(t => t.statusDisplay === 'pending').length} aguardando` },
    { label: 'Cancelado', value: helpers.formatMoney(totalCancelled), icon: XCircle, color: 'text-destructive', detail: `${transactions.filter(t => t.statusDisplay === 'cancelled').length} cancelados` },
    { label: 'Receita Média Diária', value: helpers.formatMoney(dailyAvg), icon: TrendingUp, color: 'text-chart-2', detail: 'média por dia com vendas' },
  ];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Financeiro</h1>
            <p className="text-sm text-muted-foreground mt-1">Receitas e transações</p>
          </div>
          <AnimatedButton onClick={() => { resetForm(); setShowForm(!showForm); }} className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
            {showForm ? 'Cancelar' : <span className="flex items-center gap-1.5"><Plus size={16} />Nova Transação</span>}
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, idx) => (
            <AnimatedCard key={card.label} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <card.icon size={22} className={card.color} />
                <span className="text-[10px] text-muted-foreground">{card.detail}</span>
              </div>
              <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
            </AnimatedCard>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${tab === t.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por ID, cliente ou produto..." className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground" />
          </div>
          <div className="w-px h-6 bg-border hidden sm:block"></div>
          <select value={filterGateway} onChange={e => setFilterGateway(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-ring outline-none">
            <option value="">Todos gateways</option>
            <option value="pix">PIX</option>
            <option value="cartão">Cartão</option>
            {state.gateways.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-ring outline-none">
            <option value="">Todos status</option>
            <option value="approved">Aprovado</option>
            <option value="delivered">Entregue</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-ring outline-none" title="Data inicial" />
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-input text-foreground text-xs focus:ring-2 focus:ring-ring outline-none" title="Data final" />
          <Filter size={16} className="text-muted-foreground shrink-0" />
        </div>

        {showForm && (
          <div className="overflow-hidden mb-6 animate-fade-in">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-card-foreground">{editingId ? 'Editar Transação' : 'Nova Transação'}</h2>
                <button onClick={resetForm} className="p-1 text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Produto</label>
                  <input value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Ex: Curso" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Cliente</label>
                  <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Nome do cliente" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="0,00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Gateway</label>
                  <select value={form.gateway} onChange={e => setForm({ ...form, gateway: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                    <option value="">Selecione</option>
                    {state.gateways.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                    <option value="PIX">PIX</option>
                    <option value="Cartão">Cartão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                    <option value="approved">Aprovado</option>
                    <option value="delivered">Entregue</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Data</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                </div>
                <div className="md:col-span-4 flex gap-3">
                  <AnimatedButton type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">
                    {editingId ? 'Salvar Alterações' : 'Registrar Transação'}
                  </AnimatedButton>
                  <button type="button" onClick={resetForm} className="px-5 py-2 bg-muted text-muted-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors">Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AnimatedCard className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Produto / Grupo</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Gateway</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">Nenhuma transação encontrada</td></tr>
                ) : filteredTransactions.map((t, i) => (
                  <tr key={t.transactionId + t.source} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{t.transactionId?.slice(0, 8) || '—'}</td>
                    <td className="px-6 py-4 font-medium text-card-foreground">{t.clientDisplay}</td>
                    <td className="px-6 py-4 text-muted-foreground">{t.productDisplay}</td>
                    <td className="px-6 py-4 font-medium text-card-foreground">{helpers.formatMoney(t.valueNum)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${t.gatewayDisplay === 'PIX' || t.gatewayDisplay?.toLowerCase().includes('pix') ? 'bg-chart-2/15 text-chart-2' : 'bg-muted text-muted-foreground'}`}>
                        {t.gatewayDisplay || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={t.statusDisplay} /></td>
                    <td className="px-6 py-4 text-muted-foreground">{t.dateDisplay ? helpers.formatDate(t.dateDisplay) : '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleEdit(t)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        {t.statusDisplay === 'pending' && (
                          <button onClick={() => handleConfirmPayment(t)} className="p-1.5 text-chart-1 hover:bg-chart-1/10 rounded-lg transition-colors" title="Confirmar pagamento">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(t)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Excluir / Cancelar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}

export default Financeiro;

import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';

function Sales() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product: '', clientName: '', value: '', gateway: state.config.defaultGateway, status: 'approved', date: helpers.today(), botId: '' });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product || !form.clientName || !form.value) return;
    const data = { ...form, value: parseFloat(form.value) };
    if (editingId) {
      dispatch({ type: 'UPDATE_SALE', payload: { id: editingId, data } });
      addActivity(`Venda ${data.product} atualizada`, 'info');
    } else {
      dispatch({ type: 'ADD_SALE', payload: { id: helpers.uid(), ...data } });
      addActivity(`Venda ${data.product} registrada`, 'success');
      addNotification('Nova venda', `${data.product} vendido para ${data.clientName} por ${helpers.formatMoney(data.value)}.`);
    }
    resetForm();
  };

  const resetForm = () => {
    setForm({ product: '', clientName: '', value: '', gateway: state.config.defaultGateway, status: 'approved', date: helpers.today(), botId: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (sale) => {
    setForm({ product: sale.product, clientName: sale.clientName, value: sale.value, gateway: sale.gateway, status: sale.status, date: sale.date, botId: sale.botId || '' });
    setEditingId(sale.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const sale = state.sales.find(s => s.id === id);
    dispatch({ type: 'DELETE_SALE', payload: id });
    addActivity(`Venda ${sale.product} excluída`, 'warning');
  };

  const sorted = [...state.sales].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Vendas</h1>
            <p className="text-sm text-muted-foreground mt-1">Controle todas as suas vendas</p>
          </div>
          <AnimatedButton onClick={() => { resetForm(); setShowForm(!showForm); }} className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
            {showForm ? 'Cancelar' : 'Nova Venda'}
          </AnimatedButton>
        </div>

        {showForm && (
          <div className="overflow-hidden mb-6 animate-fade-in">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4">{editingId ? 'Editar Venda' : 'Nova Venda'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Produto</label>
                  <input value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Ex: Curso DS" />
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
                    {state.gateways.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                    <option value="approved">Aprovado</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Data</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
                </div>
                <div className="md:col-span-3">
                  <AnimatedButton type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">{editingId ? 'Salvar' : 'Registrar Venda'}</AnimatedButton>
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
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Gateway</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">Nenhuma venda registrada</td></tr>
                ) : sorted.map((s, i) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-6 py-4 font-medium text-card-foreground">{s.product}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.clientName}</td>
                    <td className="px-6 py-4 font-medium text-card-foreground">{helpers.formatMoney(s.value)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.gateway}</td>
                    <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground">{helpers.formatDate(s.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(s)} className="px-3 py-1 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Editar</button>
                        <button onClick={() => handleDelete(s.id)} className="px-3 py-1 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Excluir</button>
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

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-chart-1/15 text-chart-1',
    pending: 'bg-chart-3/15 text-chart-3',
    cancelled: 'bg-destructive/15 text-destructive',
  };
  const labels = { approved: 'Aprovado', pending: 'Pendente', cancelled: 'Cancelado' };
  return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{labels[status] || status}</span>;
}

export default Sales;

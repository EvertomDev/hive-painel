import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';

function Clients() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', telegram: '', product: '', status: 'active' });
  const [editingId, setEditingId] = useState(null);

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
    resetForm();
  };

  const resetForm = () => {
    setForm({ name: '', telegram: '', product: '', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, telegram: client.telegram, product: client.product, status: client.status });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const client = state.clients.find(c => c.id === id);
    dispatch({ type: 'DELETE_CLIENT', payload: id });
    addActivity(`Cliente ${client.name} excluído`, 'warning');
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">Base de leads e compradores</p>
          </div>
          <AnimatedButton onClick={() => { resetForm(); setShowForm(!showForm); }} className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
            {showForm ? 'Cancelar' : 'Novo Cliente'}
          </AnimatedButton>
        </div>

        {showForm && (
          <div className="overflow-hidden mb-6 animate-fade-in">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Nome completo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Telegram</label>
                  <input value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="@usuario" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Produto</label>
                  <input value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Produto comprado" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all">
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div className="md:col-span-4">
                  <AnimatedButton type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors">{editingId ? 'Salvar' : 'Cadastrar Cliente'}</AnimatedButton>
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
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Telegram</th>
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Cadastro</th>
                  <th className="px-6 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {state.clients.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Nenhum cliente cadastrado</td></tr>
                ) : state.clients.map((c, i) => (
                  <tr key={c.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td className="px-6 py-4 font-medium text-card-foreground">{c.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.telegram}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.product}</td>
                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground">{helpers.formatDate(c.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)} className="px-3 py-1 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Editar</button>
                        <button onClick={() => handleDelete(c.id)} className="px-3 py-1 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Excluir</button>
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
  const style = status === 'active'
    ? 'bg-chart-1/15 text-chart-1'
    : 'bg-destructive/15 text-destructive';
  return <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${style}`}>{status === 'active' ? 'Ativo' : 'Inativo'}</span>;
}

export default Clients;

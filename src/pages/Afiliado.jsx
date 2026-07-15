import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Users, DollarSign, Copy, Check, UserPlus, Edit3, Trash2, Link, Percent, CreditCard, TrendingUp } from 'lucide-react';

const STORAGE_KEY = 'zeze-afiliados';

function Afiliado() {
  const { helpers, addActivity, addNotification } = useApp();
  const [afiliados, setAfiliados] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rate: '10', status: 'active' });
  const [editingId, setEditingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('zeze-afiliados');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAfiliados(parsed.afiliados || []);
        setPayouts(parsed.payouts || []);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zeze-afiliados', JSON.stringify({ afiliados, payouts }));
  }, [afiliados, payouts]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    const code = form.name.toLowerCase().replace(/\s+/g, '').slice(0, 8) + Math.random().toString(36).substr(2, 4);
    const link = `https://t.me/zeze_bot?start=${code}`;
    if (editingId) {
      setAfiliados(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
      addActivity(`Afiliado ${form.name} atualizado`, 'info');
    } else {
      setAfiliados(prev => [...prev, { id: helpers.uid(), code, link, sales: 0, commissionGenerated: 0, commissionPaid: 0, ...form, rate: parseFloat(form.rate) || 10, createdAt: helpers.today() }]);
      addActivity(`Afiliado ${form.name} cadastrado`, 'success');
      addNotification('Novo afiliado', `${form.name} foi cadastrado no sistema.`);
    }
    setForm({ name: '', rate: '10', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  };

  const totalAfiliados = afiliados.length;
  const totalPaid = afiliados.reduce((a, af) => a + (af.commissionPaid || 0), 0);
  const totalPending = afiliados.reduce((a, af) => a + ((af.commissionGenerated || 0) - (af.commissionPaid || 0)), 0);

  const handleMarkPaid = (id) => {
    setAfiliados(prev => prev.map(a => a.id === id ? { ...a, commissionPaid: a.commissionGenerated } : a));
    setPayouts(prev => prev.filter(p => p.id !== id));
    addActivity('Comissão marcada como paga', 'success');
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Afiliados</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema de comissões</p>
          </div>
          <AnimatedButton onClick={() => { setForm({ name: '', rate: '10', status: 'active' }); setEditingId(null); setShowForm(!showForm); }}
            className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
            {showForm ? 'Cancelar' : '+ Novo Afiliado'}
          </AnimatedButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Afiliados', value: totalAfiliados, icon: Users, color: 'text-chart-1' },
            { label: 'Comissões Pagas', value: helpers.formatMoney(totalPaid), icon: DollarSign, color: 'text-chart-2' },
            { label: 'Comissões Pendentes', value: helpers.formatMoney(totalPending), icon: DollarSign, color: 'text-chart-3' },
            { label: 'Taxa Padrão', value: '10%', icon: Percent, color: 'text-chart-4' },
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

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-card-foreground mb-4">{editingId ? 'Editar Afiliado' : 'Novo Afiliado'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Nome do afiliado" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Taxa de Comissão (%)</label>
                <input type="number" step="0.1" min="0" max="100" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div className="md:col-span-3 flex gap-3">
                <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">{editingId ? 'Salvar' : 'Cadastrar'}</AnimatedButton>
              </div>
            </form>
          </div>
        )}

        {afiliados.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
            <Users size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Nenhum afiliado cadastrado.</p>
            <p className="text-xs text-muted-foreground">Clique em "+ Novo Afiliado" para começar. Os afiliados recebem um código único e link de indicação automáticos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Nome</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Código</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Link</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Vendas</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Comissão Gerada</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Comissão Paga</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {afiliados.map((af, i) => (
                    <tr key={af.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                      <td className="py-3 px-2 text-card-foreground font-medium">{af.name}</td>
                      <td className="py-3 px-2 text-muted-foreground font-mono text-xs">{af.code}</td>
                      <td className="py-3 px-2">
                        <button onClick={() => copyToClipboard(af.link, af.id)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                          {copiedId === af.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedId === af.id ? 'Copiado!' : 'Copiar Link'}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-card-foreground">{af.sales || 0}</td>
                      <td className="py-3 px-2 text-card-foreground">{helpers.formatMoney(af.commissionGenerated || 0)}</td>
                      <td className="py-3 px-2 text-card-foreground">{helpers.formatMoney(af.commissionPaid || 0)}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${af.status === 'active' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                          {af.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button onClick={() => { setForm({ name: af.name, rate: String(af.rate), status: af.status }); setEditingId(af.id); setShowForm(true); }}
                            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"><Edit3 size={14} /></button>
                          <button onClick={() => { setAfiliados(prev => prev.filter(x => x.id !== af.id)); addActivity(`Afiliado ${af.name} excluído`, 'warning'); }}
                            className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AnimatedCard className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2"><DollarSign size={18} /> Comissões Pendentes</h3>
              {afiliados.filter(af => (af.commissionGenerated || 0) > (af.commissionPaid || 0)).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma comissão pendente no momento.</p>
              ) : (
                <div className="space-y-3">
                  {afiliados.filter(af => (af.commissionGenerated || 0) > (af.commissionPaid || 0)).map(af => {
                    const pending = (af.commissionGenerated || 0) - (af.commissionPaid || 0);
                    return (
                      <div key={af.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div>
                          <p className="font-medium text-card-foreground">{af.name}</p>
                          <p className="text-xs text-muted-foreground">Pendente: {helpers.formatMoney(pending)}</p>
                        </div>
                        <AnimatedButton onClick={() => handleMarkPaid(af.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-chart-1/10 hover:bg-chart-1/20 text-chart-1 rounded-lg flex items-center gap-1">
                          <Check size={12} /> Marcar como Pago
                        </AnimatedButton>
                      </div>
                    );
                  })}
                </div>
              )}
            </AnimatedCard>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

export default Afiliado;

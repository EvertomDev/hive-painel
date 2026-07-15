import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Line, Doughnut } from 'react-chartjs-2';
import { PageTransition, AnimatedCard, PulseDot } from '../components/ui/AnimatedContainer';

function Dashboard() {
  const { state, helpers } = useApp();

  const activeBots = state.bots.filter(b => b.status === 'active').length;
  const approvedSales = state.sales.filter(s => s.status === 'approved');
  const totalRevenue = approvedSales.reduce((a, s) => a + Number(s.value), 0);
  const pendingSales = state.sales.filter(s => s.status === 'pending').length;
  const totalClients = state.clients.length;

  const recentSales = [...state.sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = {
    labels: last7.map(d => d.slice(5)),
    datasets: [{
      label: 'Vendas (R$)',
      data: last7.map(day => approvedSales.filter(s => s.date === day).reduce((a, s) => a + Number(s.value), 0)),
      borderColor: 'var(--chart-2)',
      backgroundColor: 'rgba(0,0,0,0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: 'var(--chart-2)',
    }]
  };

  const statusData = {
    labels: ['Aprovado', 'Pendente', 'Cancelado'],
    datasets: [{
      data: [
        state.sales.filter(s => s.status === 'approved').length,
        state.sales.filter(s => s.status === 'pending').length,
        state.sales.filter(s => s.status === 'cancelled').length,
      ],
      backgroundColor: ['var(--chart-1)', 'var(--chart-3)', 'var(--destructive)'],
      borderWidth: 0,
    }]
  };

  const statCards = [
    { label: 'Bots Ativos', value: activeBots, icon: BotIcon },
    { label: 'Faturamento', value: helpers.formatMoney(totalRevenue), icon: MoneyIcon },
    { label: 'Clientes', value: totalClients, icon: UsersIcon },
    { label: 'Vendas Pendentes', value: pendingSales, icon: ClockIcon },
  ];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão geral do seu negócio no Telegram</p>
          </div>
          <div className="flex gap-2">
            <Link to="/bots" className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all hover:scale-[1.02]">Novo Bot</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <AnimatedCard key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <card.icon />
              </div>
              <div className="text-3xl font-bold text-card-foreground mb-1">{card.value}</div>
              <div className="text-sm text-muted-foreground">{card.label}</div>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Vendas dos últimos 7 dias</h2>
            <div className="h-64">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} />
            </div>
          </AnimatedCard>
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Status das Vendas</h2>
            <div className="h-48 flex items-center justify-center">
              <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Últimas Vendas</h2>
              <Link to="/vendas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ver todas</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-2 font-medium">Produto</th>
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Valor</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.length === 0 ? (
                    <tr><td colSpan="4" className="py-4 text-muted-foreground text-center">Nenhuma venda registrada</td></tr>
                  ) : recentSales.map(s => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 text-card-foreground font-medium">{s.product}</td>
                      <td className="py-3 text-muted-foreground">{s.clientName}</td>
                      <td className="py-3 text-card-foreground font-medium">{helpers.formatMoney(s.value)}</td>
                      <td className="py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedCard>

          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Atividade Recente</h2>
              {state.activities.some(a => a.type === 'success') && <PulseDot className="text-chart-1" />}
            </div>
            <div className="space-y-4">
              {state.activities.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma atividade recente</p>
              ) : state.activities.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${a.type === 'success' ? 'bg-chart-1' : a.type === 'warning' ? 'bg-chart-3' : 'bg-chart-2'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-card-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleTimeString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>
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

function BotIcon() {
  return <svg className="w-8 h-8 text-chart-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>;
}

function MoneyIcon() {
  return <svg className="w-8 h-8 text-chart-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
}

function UsersIcon() {
  return <svg className="w-8 h-8 text-chart-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}

function ClockIcon() {
  return <svg className="w-8 h-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

export default Dashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Line, Doughnut } from 'react-chartjs-2';
import { PageTransition, AnimatedCard, PulseDot } from '../components/ui/AnimatedContainer';
import { PlatformIcon, getPlatformMeta } from '../components/accounts/PlatformIcon';
import { Bot, DollarSign, Users, Clock, Monitor, MessageCircle, Activity, Wifi, WifiOff } from 'lucide-react';

function Dashboard() {
  const { state, helpers } = useApp();

  const activeBots = state.bots.filter(b => b.status === 'active').length;
  const approvedSales = state.sales.filter(s => s.status === 'approved');
  const totalRevenue = approvedSales.reduce((a, s) => a + Number(s.value), 0);
  const pendingSales = state.sales.filter(s => s.status === 'pending').length;
  const totalClients = state.clients.length;
  const accountsOnline = state.accounts.filter(a => a.status === 'online').length;
  const accountsOffline = state.accounts.filter(a => a.status !== 'online').length;
  const msgAccounts = state.accounts.filter(a => ['telegram', 'whatsapp'].includes(a.platform)).length;

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

  const accountPlatformData = {
    labels: [...new Set(state.accounts.map(a => getPlatformMeta(a.platform).label))],
    datasets: [{
      data: [...new Set(state.accounts.map(a => a.platform))].map(p => state.accounts.filter(a => a.platform === p).length),
      backgroundColor: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', '#8b5cf6', '#ec4899', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const statCards = [
    { label: 'Bots Ativos', value: activeBots, icon: Bot, color: 'text-chart-2', link: '/bots' },
    { label: 'Faturamento', value: helpers.formatMoney(totalRevenue), icon: DollarSign, color: 'text-chart-1', link: '/vendas' },
    { label: 'Contas Online', value: `${accountsOnline}/${state.accounts.length}`, icon: Wifi, color: 'text-chart-1', link: '/contas' },
    { label: 'Mensageiros', value: msgAccounts, icon: MessageCircle, color: 'text-chart-2', link: '/mensagens' },
  ];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão geral do seu negócio</p>
          </div>
          <div className="flex gap-2">
            <Link to="/contas" className="inline-block px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-all hover:scale-[1.02]">Nova Conta</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <Link key={idx} to={card.link}>
              <AnimatedCard className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <card.icon size={28} className={card.color} />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <div className="text-3xl font-bold text-card-foreground">{card.value}</div>
              </AnimatedCard>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Vendas dos últimos 7 dias</h2>
            <div className="h-64">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } } }} />
            </div>
          </AnimatedCard>
          <div className="space-y-6">
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4">Status das Vendas</h2>
              <div className="h-40 flex items-center justify-center">
                <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </AnimatedCard>
            <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4">Plataformas</h2>
              <div className="h-40 flex items-center justify-center">
                {state.accounts.length > 0 ? (
                  <Doughnut data={accountPlatformData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
                )}
              </div>
            </AnimatedCard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Contas</h2>
              <Link to="/contas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gerenciar</Link>
            </div>
            <div className="space-y-3">
              {state.accounts.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma conta integrada</p>
              ) : state.accounts.slice(0, 5).map(acc => (
                <div key={acc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                      {acc.photo ? <img src={acc.photo} alt="" className="w-full h-full object-cover" /> : <PlatformIcon platform={acc.platform} size={16} />}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card ${acc.status === 'online' ? 'bg-chart-1' : 'bg-muted-foreground'}`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">{acc.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {getPlatformMeta(acc.platform).label}
                      {acc.status === 'online' ? <Wifi size={10} className="text-chart-1" /> : <WifiOff size={10} />}
                    </p>
                  </div>
                  <Link to="/contas" className="px-2 py-1 text-[10px] font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">Abrir</Link>
                </div>
              ))}
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
              ) : state.activities.slice(0, 8).map(a => (
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

export default Dashboard;

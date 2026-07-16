import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Line, Doughnut } from 'react-chartjs-2';
import { PageTransition, AnimatedCard, PulseDot } from '../components/ui/AnimatedContainer';
import { Bot, DollarSign, Users, Clock, Monitor, Activity, ShoppingCart } from 'lucide-react';

function Dashboard() {
  const { state, helpers } = useApp();

  const activeBots = state.bots.filter(b => b.status === 'active').length;
  const approvedSales = state.sales.filter(s => s.status === 'approved');
  const totalRevenue = approvedSales.reduce((a, s) => a + Number(s.value), 0) + state.orders.filter(o => o.status === 'delivered' || o.status === 'approved').reduce((a, o) => a + Number(o.value), 0);
  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  const totalMembers = state.members.length;

  const recentSales = [...state.sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  const recentOrders = [...state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

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
        state.sales.filter(s => s.status === 'approved').length + state.orders.filter(o => o.status === 'delivered' || o.status === 'approved').length,
        state.sales.filter(s => s.status === 'pending').length + state.orders.filter(o => o.status === 'pending').length,
        state.sales.filter(s => s.status === 'cancelled').length,
      ],
      backgroundColor: ['var(--chart-1)', 'var(--chart-3)', 'var(--destructive)'],
      borderWidth: 0,
    }]
  };

  const statCards = [
    { label: 'Bots Ativos', value: activeBots, icon: Bot, color: 'text-chart-2', link: '/bots' },
    { label: 'Faturamento', value: helpers.formatMoney(totalRevenue), icon: DollarSign, color: 'text-chart-1', link: '/bots' },
    { label: 'Membros', value: totalMembers, icon: Users, color: 'text-chart-3', link: '/bots' },
    { label: 'Pedidos Pendentes', value: pendingOrders, icon: ShoppingCart, color: 'text-chart-4', link: '/bots' },
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
            <Link to="/bots" className="inline-block px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-lg transition-all hover:scale-[1.02]">Gerenciar Bots</Link>
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard } from '../components/ui/AnimatedContainer';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { TrendingUp, ShoppingCart, Users, Percent, DollarSign, Download, FileText, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const periods = [{ key: 'today', label: 'Hoje' }, { key: '7d', label: '7 dias' }, { key: '30d', label: '30 dias' }, { key: 'custom', label: 'Personalizado' }];

function Analises() {
  const { state, helpers } = useApp();
  const [period, setPeriod] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateFilter = useMemo(() => {
    const now = new Date();
    if (period === 'today') {
      const d = now.toISOString().split('T')[0];
      return { start: d, end: d };
    }
    if (period === '7d') {
      const s = new Date(now); s.setDate(s.getDate() - 6);
      return { start: s.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
    }
    if (period === '30d') {
      const s = new Date(now); s.setDate(s.getDate() - 29);
      return { start: s.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
    }
    return { start: customStart || '2000-01-01', end: customEnd || '2099-12-31' };
  }, [period, customStart, customEnd]);

  const filteredSales = useMemo(() =>
    state.sales.filter(s => s.date >= dateFilter.start && s.date <= dateFilter.end),
    [state.sales, dateFilter]
  );

  const filteredOrders = useMemo(() =>
    state.orders.filter(o => {
      const d = o.createdAt ? o.createdAt.split('T')[0] : '';
      return d >= dateFilter.start && d <= dateFilter.end;
    }),
    [state.orders, dateFilter]
  );

  const approvedSales = useMemo(() => filteredSales.filter(s => s.status === 'approved'), [filteredSales]);
  const approvedOrders = useMemo(() => filteredOrders.filter(o => o.status === 'delivered' || o.status === 'approved'), [filteredOrders]);

  const totalRevenue = useMemo(() =>
    approvedSales.reduce((a, s) => a + Number(s.value), 0) +
    approvedOrders.reduce((a, o) => a + Number(o.value), 0),
  [approvedSales, approvedOrders]);

  const totalOrders = filteredOrders.length + filteredSales.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const conversion = filteredSales.length + filteredOrders.length > 0
    ? ((approvedSales.length + approvedOrders.length) / (filteredSales.length + filteredOrders.length) * 100).toFixed(1)
    : '0.0';
  const activeMembers = state.members.filter(m => m.status === 'active').length;

  const dayLabels = useMemo(() => {
    const days = [];
    const start = new Date(dateFilter.start);
    const end = new Date(dateFilter.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, [dateFilter]);

  const lineChartData = {
    labels: dayLabels.map(d => {
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [{
      label: 'Faturamento (R$)',
      data: dayLabels.map(day =>
        approvedSales.filter(s => s.date === day).reduce((a, s) => a + Number(s.value), 0) +
        approvedOrders.filter(o => (o.createdAt ? o.createdAt.split('T')[0] : '') === day).reduce((a, o) => a + Number(o.value), 0)
      ),
      borderColor: 'var(--chart-1)',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: 'var(--chart-1)',
    }, {
      label: 'Vendas (qtd)',
      data: dayLabels.map(day =>
        filteredSales.filter(s => s.date === day).length +
        filteredOrders.filter(o => (o.createdAt ? o.createdAt.split('T')[0] : '') === day).length
      ),
      borderColor: 'var(--chart-2)',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: 'var(--chart-2)',
      yAxisID: 'y1',
    }]
  };

  const productGroups = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      const key = s.product || 'Sem produto';
      map[key] = (map[key] || 0) + Number(s.value);
    });
    filteredOrders.forEach(o => {
      const key = o.botName || o.groupName || 'Sem grupo';
      map[key] = (map[key] || 0) + Number(o.value);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filteredSales, filteredOrders]);

  const barChartData = {
    labels: productGroups.map(([name]) => name.length > 18 ? name.slice(0, 16) + '...' : name),
    datasets: [{
      label: 'R$',
      data: productGroups.map(([, value]) => value),
      backgroundColor: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#f97316', '#6366f1'],
      borderRadius: 6,
    }]
  };

  const gatewayData = useMemo(() => {
    const map = {};
    filteredSales.forEach(s => {
      const key = s.gateway || 'Indefinido';
      map[key] = (map[key] || 0) + Number(s.value);
    });
    filteredOrders.forEach(o => {
      const key = 'Pedido';
      map[key] = (map[key] || 0) + Number(o.value);
    });
    if (Object.keys(map).length === 0) map['Nenhum'] = 1;
    return map;
  }, [filteredSales, filteredOrders]);

  const doughnutData = {
    labels: Object.keys(gatewayData),
    datasets: [{
      data: Object.values(gatewayData),
      backgroundColor: ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', '#8b5cf6', '#ec4899', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6, padding: 16, color: 'var(--muted-foreground)' } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: 'var(--muted-foreground)' } },
      y1: { beginAtZero: true, position: 'right', grid: { display: false }, ticks: { color: 'var(--muted-foreground)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--muted-foreground)' } }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { color: 'var(--muted-foreground)' } },
      x: { grid: { display: false }, ticks: { color: 'var(--muted-foreground)' } }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, padding: 12, color: 'var(--muted-foreground)' } } }
  };

  const stats = [
    { label: 'Faturamento Total', value: helpers.formatMoney(totalRevenue), icon: DollarSign, color: 'text-chart-1', detail: `${approvedSales.length + approvedOrders.length} vendas` },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingCart, color: 'text-chart-2', detail: `${filteredOrders.length} pedidos` },
    { label: 'Ticket Médio', value: helpers.formatMoney(avgTicket), icon: TrendingUp, color: 'text-chart-3', detail: 'por transação' },
    { label: 'Conversão', value: `${conversion}%`, icon: Percent, color: 'text-chart-4', detail: 'aprovados / total' },
    { label: 'Membros Ativos', value: activeMembers, icon: Users, color: 'text-primary', detail: `${state.members.length} total` },
  ];

  const recentActivities = [...state.activities].slice(0, 10);

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Análises</h1>
            <p className="text-sm text-muted-foreground mt-1">Métricas e relatórios do negócio</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${period === p.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {period === 'custom' && (
          <div className="flex flex-wrap gap-3 items-center mb-6 p-4 bg-card rounded-xl border border-border animate-fade-in">
            <label className="text-sm text-muted-foreground">De:</label>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
            <label className="text-sm text-muted-foreground">Até:</label>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-input text-foreground text-sm focus:ring-2 focus:ring-ring outline-none" />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((card, idx) => (
            <AnimatedCard key={card.label} className="bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <card.icon size={24} className={card.color} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{card.detail}</span>
              </div>
              <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
            </AnimatedCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatedCard className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Faturamento ao longo do período</h2>
            <div className="h-72">
              <Line data={lineChartData} options={lineOptions} />
            </div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Vendas por Produto / Grupo</h2>
            <div className="h-72">
              {productGroups.length > 0 ? (
                <Bar data={barChartData} options={barOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhum dado no período</div>
              )}
            </div>
          </AnimatedCard>
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Distribuição por Gateway</h2>
            <div className="h-72 flex items-center justify-center">
              {Object.keys(gatewayData).length > 0 && Object.keys(gatewayData)[0] !== 'Nenhum' ? (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              ) : (
                <div className="text-center text-muted-foreground text-sm">Nenhum dado no período</div>
              )}
            </div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Atividades Recentes</h2>
              <Activity size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">Nenhuma atividade registrada</p>
              ) : recentActivities.map((a, i) => (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === 'success' ? 'bg-chart-1' : a.type === 'warning' ? 'bg-chart-3' : a.type === 'error' ? 'bg-destructive' : 'bg-chart-2'}`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{new Date(a.time).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
          <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-card-foreground mb-4">Exportar Relatórios</h2>
            <div className="space-y-3">
              <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/30 text-muted-foreground text-sm font-medium transition-colors cursor-not-allowed opacity-60">
                <FileText size={18} />
                <span>Relatório Completo (PDF)</span>
              </button>
              <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/30 text-muted-foreground text-sm font-medium transition-colors cursor-not-allowed opacity-60">
                <Download size={18} />
                <span>Exportar CSV</span>
              </button>
              <button disabled className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-muted/30 text-muted-foreground text-sm font-medium transition-colors cursor-not-allowed opacity-60">
                <TrendingUp size={18} />
                <span>Relatório de Vendas</span>
              </button>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">Disponível em breve</p>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}

export default Analises;

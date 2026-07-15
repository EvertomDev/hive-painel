import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Loader2 } from 'lucide-react';

function Bots() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', token: '', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [testBot, setTestBot] = useState(null);
  const [testChatId, setTestChatId] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  const handleValidateToken = async (token) => {
    try {
      const res = await fetch('/api/telegram/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await res.json();
    } catch (e) {
      return { ok: false, error: 'Servidor offline' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.token) return setError('Preencha nome e token.');

    setLoading(true);
    const validation = await handleValidateToken(form.token);
    setLoading(false);

    if (!validation.ok) {
      setError(validation.error || 'Token inválido ou servidor offline. Verifique o token do BotFather.');
      return;
    }

    if (editingId) {
      dispatch({ type: 'UPDATE_BOT', payload: { id: editingId, data: { ...form, username: validation.result.username, validatedAt: new Date().toISOString() } } });
      addActivity(`Bot ${form.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_BOT', payload: { id: helpers.uid(), ...form, username: validation.result.username, validatedAt: new Date().toISOString(), createdAt: helpers.today() } });
      addActivity(`Bot ${form.name} criado e validado`, 'success');
      addNotification('Bot criado', `O bot ${form.name} foi validado com sucesso.`);
    }
    setForm({ name: '', token: '', status: 'active' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (bot) => {
    setForm({ name: bot.name, token: bot.token, status: bot.status });
    setEditingId(bot.id);
    setShowForm(true);
  };

  const handleToggle = (bot) => {
    const newStatus = bot.status === 'active' ? 'inactive' : 'active';
    dispatch({ type: 'UPDATE_BOT', payload: { id: bot.id, data: { status: newStatus } } });
    addActivity(`Bot ${bot.name} ${newStatus === 'active' ? 'ativado' : 'desativado'}`, 'warning');
  };

  const handleDelete = (id) => {
    const bot = state.bots.find(b => b.id === id);
    dispatch({ type: 'DELETE_BOT', payload: id });
    addActivity(`Bot ${bot.name} excluído`, 'warning');
  };

  const handleTestMessage = async (bot) => {
    if (!testChatId) return;
    setTestLoading(true);
    try {
      const res = await fetch('/api/telegram/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: bot.token, chatId: testChatId, text: `Olá! Esta é uma mensagem de teste do ${bot.name} via Zeze.` })
      });
      const data = await res.json();
      if (data.ok) {
        addActivity(`Mensagem de teste enviada pelo ${bot.name}`, 'success');
        addNotification('Mensagem enviada', `Mensagem de teste enviada pelo ${bot.name}.`);
      } else setError(data.error || 'Erro ao enviar mensagem');
    } catch (e) {
      setError('Não foi possível enviar mensagem de teste.');
    }
    setTestLoading(false);
    setTestChatId('');
    setTestBot(null);
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Meus Bots</h1>
            <p className="text-sm text-muted-foreground mt-1">Gerencie seus bots do Telegram</p>
          </div>
          <AnimatedButton onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', token: '', status: 'active' }); setError(''); }} className="mt-4 sm:mt-0 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition-colors">
            {showForm ? 'Cancelar' : 'Novo Bot'}
          </AnimatedButton>
        </div>

        {showForm && (
          <div className="overflow-hidden mb-6 animate-fade-in">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-bold text-card-foreground mb-4">{editingId ? 'Editar Bot' : 'Novo Bot'}</h2>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Bot</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Ex: Bot Vendas DS" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">Token do Telegram</label>
                  <input value={form.token} onChange={e => setForm({ ...form, token: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" placeholder="Cole o token do BotFather" />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <AnimatedButton type="submit" disabled={loading} className="px-5 py-2 bg-primary disabled:opacity-60 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {loading ? 'Validando...' : editingId ? 'Salvar Alterações' : 'Criar Bot'}
                  </AnimatedButton>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.bots.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
              <p className="text-muted-foreground mb-4">Nenhum bot cadastrado ainda.</p>
              <AnimatedButton onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">Criar primeiro bot</AnimatedButton>
            </div>
          ) : state.bots.map((bot, i) => {
            const botSales = state.sales.filter(s => s.botId === bot.id && s.status === 'approved').reduce((a, s) => a + Number(s.value), 0);
            return (
              <div key={bot.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">{bot.name}</h3>
                      <p className="text-sm text-muted-foreground">@{bot.username || 'desconhecido'}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${bot.status === 'active' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                      {bot.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4 font-mono truncate">Token: {bot.token.slice(0, 8)}...{bot.token.slice(-4)}</div>
                  <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-border/50">
                    <div className="text-center">
                      <div className="text-xl font-bold text-card-foreground">{helpers.formatMoney(botSales)}</div>
                      <div className="text-xs text-muted-foreground">Vendas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-card-foreground">{bot.validatedAt ? 'OK' : '—'}</div>
                      <div className="text-xs text-muted-foreground">Validado</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleEdit(bot)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Editar</button>
                    <button onClick={() => handleToggle(bot)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">{bot.status === 'active' ? 'Desativar' : 'Ativar'}</button>
                    <button onClick={() => setTestBot(bot)} className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors hover:scale-105 active:scale-95 transition-transform">Teste</button>
                    <button onClick={() => handleDelete(bot.id)} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors ml-auto hover:scale-105 active:scale-95 transition-transform">Excluir</button>
                  </div>
                  {testBot && testBot.id === bot.id && (
                    <div className="mt-3 overflow-hidden animate-fade-in">
                      <div className="flex gap-2">
                        <input
                          value={testChatId}
                          onChange={e => setTestChatId(e.target.value)}
                          placeholder="Chat ID ou @username"
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none"
                        />
                        <button onClick={() => handleTestMessage(bot)} disabled={testLoading} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform">
                          {testLoading && <Loader2 size={12} className="animate-spin" />}
                          {testLoading ? 'Enviando...' : 'Enviar'}
                        </button>
                        <button onClick={() => { setTestBot(null); setTestChatId(''); }} className="px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:scale-105 active:scale-95 transition-transform">Cancelar</button>
                      </div>
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

export default Bots;

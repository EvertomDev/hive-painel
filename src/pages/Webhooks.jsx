import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Webhook, Plus, Copy, Check, Trash2, Send, RefreshCw, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

const STORAGE_KEY = 'hive-webhooks';
const EVENTS = [
  { key: 'novo_pedido', label: 'Novo pedido' },
  { key: 'pagamento_confirmado', label: 'Pagamento confirmado' },
  { key: 'novo_membro', label: 'Novo membro' },
  { key: 'novo_lead', label: 'Novo lead' },
  { key: 'bot_status', label: 'Bot iniciado/parado' },
];

function loadWebhooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return [
      { id: 'wh-1', name: 'Notificar Vendas', url: 'https://hooks.slack.com/services/T00/B00/xxx', events: ['novo_pedido', 'pagamento_confirmado'], secret: 'sk_' + Math.random().toString(36).substr(2, 16), lastRun: '2025-06-10 14:32', status: true, createdAt: '2025-01-10' },
      { id: 'wh-2', name: 'Webhook Leads', url: 'https://api.exemplo.com/webhook', events: ['novo_lead', 'novo_membro'], secret: 'sk_' + Math.random().toString(36).substr(2, 16), lastRun: '2025-06-09 09:15', status: true, createdAt: '2025-03-05' },
    ];
  } catch { return []; }
}

function saveWebhooks(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

const LOGS_KEY = 'hive-webhook-logs';
function loadLogs() {
  try { const raw = localStorage.getItem(LOGS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function saveLogs(data) { localStorage.setItem(LOGS_KEY, JSON.stringify(data)); }

function Webhooks() {
  const { addActivity, addNotification, helpers } = useApp();
  const [webhooks, setWebhooks] = useState(loadWebhooks);
  const [logs, setLogs] = useState(loadLogs);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [testingId, setTestingId] = useState(null);

  const [form, setForm] = useState({
    name: '', url: '', events: [], secret: 'sk_' + helpers.uid().substr(0, 16), status: true
  });

  useEffect(() => { saveWebhooks(webhooks); }, [webhooks]);
  useEffect(() => { saveLogs(logs); }, [logs]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleEvent = (key) => {
    setForm({ ...form, events: form.events.includes(key) ? form.events.filter(e => e !== key) : [...form.events, key] });
  };

  const handleAddWebhook = (e) => {
    e.preventDefault();
    if (!form.name || !form.url) return;
    setWebhooks([...webhooks, { id: helpers.uid(), ...form, lastRun: '-', createdAt: helpers.today() }]);
    setForm({ name: '', url: '', events: [], secret: 'sk_' + helpers.uid().substr(0, 16), status: true });
    setShowForm(false);
    addActivity(`Webhook ${form.name} criado`, 'success');
  };

  const handleToggleStatus = (id) => {
    setWebhooks(webhooks.map(w => w.id === id ? { ...w, status: !w.status } : w));
  };

  const handleDelete = (id) => {
    const item = webhooks.find(w => w.id === id);
    setWebhooks(webhooks.filter(w => w.id !== id));
    addActivity(`Webhook ${item?.name} excluído`, 'warning');
  };

  const handleTest = async (webhook) => {
    setTestingId(webhook.id);
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'Teste de webhook do Hive Painel', webhook: webhook.name },
    };
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(webhook.url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': webhook.secret || '' }, body: JSON.stringify(testPayload), signal: controller.signal
      });
      clearTimeout(timeout);
      const log = { id: helpers.uid(), webhookId: webhook.id, webhookName: webhook.name, event: 'test', timestamp: new Date().toISOString(), status: res.ok ? 'success' : 'error', response: `HTTP ${res.status}: ${res.statusText}` };
      setLogs([log, ...logs]);
      if (res.ok) {
        addActivity(`Teste do webhook ${webhook.name} bem-sucedido`, 'success');
      } else {
        addActivity(`Teste do webhook ${webhook.name} falhou (${res.status})`, 'warning');
      }
      setWebhooks(webhooks.map(w => w.id === webhook.id ? { ...w, lastRun: new Date().toLocaleString('pt-BR') } : w));
    } catch {
      const log = { id: helpers.uid(), webhookId: webhook.id, webhookName: webhook.name, event: 'test', timestamp: new Date().toISOString(), status: 'error', response: 'Erro de conexão ou timeout' };
      setLogs([log, ...logs]);
      addActivity(`Teste do webhook ${webhook.name} falhou - sem resposta`, 'error');
    }
    setTestingId(null);
  };

  const handleRegenerateSecret = () => {
    setForm({ ...form, secret: 'sk_' + helpers.uid().substr(0, 16) });
  };

  const clearLogs = () => {
    setLogs([]);
    addActivity('Logs limpos', 'info');
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Webhooks</h1>
            <p className="text-sm text-muted-foreground mt-1">Notificações externas</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Webhook List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2"><Webhook size={20} className="text-primary" /> Webhooks Configurados</h2>
              <AnimatedButton onClick={() => { setShowForm(!showForm); setForm({ name: '', url: '', events: [], secret: 'sk_' + helpers.uid().substr(0, 16), status: true }); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg flex items-center gap-2">
                {showForm ? 'Cancelar' : <><Plus size={14} /> Novo Webhook</>}
              </AnimatedButton>
            </div>

            {showForm && (
              <AnimatedCard className="bg-card rounded-xl border border-border p-6 mb-6">
                <h3 className="font-bold text-card-foreground mb-4">Adicionar Webhook</h3>
                <form onSubmit={handleAddWebhook} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: Notificar Vendas" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-card-foreground mb-1">URL Endpoint</label>
                      <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://seu-servidor.com/webhook" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Eventos</label>
                    <div className="flex flex-wrap gap-3">
                      {EVENTS.map(ev => (
                        <label key={ev.key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.events.includes(ev.key)} onChange={() => handleToggleEvent(ev.key)} className="rounded border-input" />
                          <span className="text-sm text-card-foreground">{ev.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1 flex items-center gap-2">Secret Token</label>
                    <div className="flex items-center gap-2">
                      <input value={form.secret} readOnly className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground font-mono text-sm" />
                      <button type="button" onClick={() => copyToClipboard(form.secret, 'secret-form')} className="p-2 hover:bg-secondary rounded transition-colors">
                        {copiedId === 'secret-form' ? <Check size={16} className="text-chart-1" /> : <Copy size={16} className="text-muted-foreground" />}
                      </button>
                      <button type="button" onClick={handleRegenerateSecret} className="p-2 hover:bg-secondary rounded transition-colors" title="Regenerar"><RefreshCw size={16} className="text-muted-foreground" /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.status} onChange={e => setForm({ ...form, status: e.target.checked })} className="rounded border-input" />
                      <span className="text-sm text-card-foreground">Ativo</span>
                    </label>
                  </div>

                  <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Criar Webhook</AnimatedButton>
                </form>
              </AnimatedCard>
            )}

            {webhooks.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Webhook size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum webhook configurado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Nome</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">URL</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Eventos</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Última execução</th>
                      <th className="text-center py-3 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-center py-3 px-3 text-muted-foreground font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map((w, i) => (
                      <tr key={w.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="py-3 px-3 text-card-foreground font-medium">{w.name}</td>
                        <td className="py-3 px-3 text-muted-foreground font-mono text-xs truncate max-w-[180px]">{w.url}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {w.events.map(ev => {
                              const evLabel = EVENTS.find(e => e.key === ev);
                              return <span key={ev} className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{evLabel?.label || ev}</span>;
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">{w.lastRun || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <button onClick={() => handleToggleStatus(w.id)} className="inline-flex items-center gap-1 text-sm">
                            {w.status ? <ToggleRight size={18} className="text-chart-1" /> : <ToggleLeft size={18} className="text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleTest(w)} disabled={testingId === w.id} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Testar">
                              {testingId === w.id ? <Loader2 size={14} className="animate-spin text-muted-foreground" /> : <Send size={14} className="text-muted-foreground" />}
                            </button>
                            <button onClick={() => copyToClipboard(w.secret || '', 'secret-' + w.id)} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Copiar Secret">
                              {copiedId === 'secret-' + w.id ? <Check size={14} className="text-chart-1" /> : <Copy size={14} className="text-muted-foreground" />}
                            </button>
                            <button onClick={() => handleDelete(w.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors" title="Excluir"><Trash2 size={14} className="text-destructive" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Logs Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Logs de Entrega</h2>
              {logs.length > 0 && (
                <button onClick={clearLogs} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-card-foreground transition-colors flex items-center gap-1"><Trash2 size={12} /> Limpar logs</button>
              )}
            </div>

            {logs.length === 0 ? (
              <AnimatedCard className="bg-card rounded-xl border border-border p-8 text-center">
                <RefreshCw size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhum log registrado. Use o botão de testar para enviar um payload.</p>
              </AnimatedCard>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={log.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                            {log.status === 'success' ? 'Sucesso' : 'Erro'}
                          </span>
                          <span className="text-sm font-medium text-card-foreground">{log.webhookName}</span>
                          <span className="text-xs text-muted-foreground">Evento: {log.event}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString('pt-BR')}</p>
                        {log.response && <p className="text-xs font-mono text-muted-foreground mt-1 bg-background p-2 rounded-lg">{log.response}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

export default Webhooks;

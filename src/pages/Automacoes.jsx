import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Bot, Share2, GitBranch, Target, Megaphone, Calendar, Send, Trash2, Plus, ExternalLink, Copy, Check, Smartphone, Monitor, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const SIDE_TABS = [
  { key: 'bots', label: 'Meus Robôs', icon: Bot },
  { key: 'fluxos', label: 'Fluxos', icon: GitBranch },
  { key: 'redirecionadores', label: 'Redirecionadores', icon: Share2 },
  { key: 'remarketing', label: 'Remarketing', icon: Target },
  { key: 'campanhas', label: 'Campanhas', icon: Megaphone },
  { key: 'postagens', label: 'Postagens', icon: Calendar },
  { key: 'envios', label: 'Envios', icon: Send },
];

const STORAGE_KEYS = {
  redirecionadores: 'hive-redirecionadores',
  remarketing: 'hive-remarketing',
  campanhas: 'hive-campanhas',
  postagens: 'hive-postagens',
};

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function Automacoes() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [activeTab, setActiveTab] = useState('bots');

  // Fluxos
  const [flowName, setFlowName] = useState('');
  const [flowType, setFlowType] = useState('basic');

  // Redirecionadores
  const [redirs, setRedirs] = useState(loadFromStorage(STORAGE_KEYS.redirecionadores));
  const [redirForm, setRedirForm] = useState({ nome: '', urlOriginal: '', urlDestino: '', status: true, urlMobile: '' });
  const [showRedirForm, setShowRedirForm] = useState(false);
  const [redirCloak, setRedirCloak] = useState(false);

  // Remarketing
  const [pixels, setPixels] = useState(loadFromStorage(STORAGE_KEYS.remarketing));
  const [pixelForm, setPixelForm] = useState({ nome: '', codigo: '', tipo: 'Facebook' });
  const [showPixelForm, setShowPixelForm] = useState(false);

  // Campanhas
  const [campanhas, setCampanhas] = useState(loadFromStorage(STORAGE_KEYS.campanhas));
  const [campForm, setCampForm] = useState({ nome: '', tipo: 'Bot', status: 'Ativa', cliques: 0, conversoes: 0 });
  const [showCampForm, setShowCampForm] = useState(false);

  // Postagens
  const [postagens, setPostagens] = useState(loadFromStorage(STORAGE_KEYS.postagens));
  const [postForm, setPostForm] = useState({ conteudo: '', plataforma: 'Telegram', data: '', hora: '', status: 'Agendado' });
  const [showPostForm, setShowPostForm] = useState(false);

  // Envios
  const [envioTarget, setEnvioTarget] = useState('todos');
  const [envioGrupo, setEnvioGrupo] = useState('');
  const [envioMensagem, setEnvioMensagem] = useState('');
  const [sendingProgress, setSendingProgress] = useState(null);

  useEffect(() => { saveToStorage(STORAGE_KEYS.redirecionadores, redirs); }, [redirs]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.remarketing, pixels); }, [pixels]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.campanhas, campanhas); }, [campanhas]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.postagens, postagens); }, [postagens]);

  // Fluxos handlers
  const handleAddFlow = (e) => {
    e.preventDefault();
    if (!flowName) return;
    dispatch({ type: 'ADD_FLOW', payload: { id: helpers.uid(), name: flowName, type: flowType, steps: flowType === 'basic' ? 3 : 8 } });
    addActivity(`Fluxo ${flowName} criado`, 'success');
    addNotification('Fluxo criado', `${flowName} foi adicionado.`);
    setFlowName('');
  };

  const handleDeleteFlow = (id) => {
    const flow = state.flows.find(f => f.id === id);
    dispatch({ type: 'DELETE_FLOW', payload: id });
    addActivity(`Fluxo ${flow?.name} excluído`, 'warning');
  };

  // Redirecionadores handlers
  const handleAddRedir = (e) => {
    e.preventDefault();
    if (!redirForm.nome || !redirForm.urlOriginal || !redirForm.urlDestino) return;
    const novo = { id: helpers.uid(), ...redirForm, cliques: 0, createdAt: helpers.today() };
    setRedirs([...redirs, novo]);
    setRedirForm({ nome: '', urlOriginal: '', urlDestino: '', status: true, urlMobile: '' });
    setShowRedirForm(false);
    addActivity(`Redirecionador ${redirForm.nome} criado`, 'success');
  };

  const handleRedirClick = (id) => {
    setRedirs(redirs.map(r => r.id === id ? { ...r, cliques: (r.cliques || 0) + 1 } : r));
  };

  const handleDeleteRedir = (id) => {
    const item = redirs.find(r => r.id === id);
    setRedirs(redirs.filter(r => r.id !== id));
    addActivity(`Redirecionador ${item?.nome} excluído`, 'warning');
  };

  // Remarketing handlers
  const handleAddPixel = (e) => {
    e.preventDefault();
    if (!pixelForm.nome || !pixelForm.codigo) return;
    setPixels([...pixels, { id: helpers.uid(), ...pixelForm, createdAt: helpers.today() }]);
    setPixelForm({ nome: '', codigo: '', tipo: 'Facebook' });
    setShowPixelForm(false);
    addActivity(`Pixel ${pixelForm.nome} adicionado`, 'success');
  };

  const handleDeletePixel = (id) => {
    const item = pixels.find(p => p.id === id);
    setPixels(pixels.filter(p => p.id !== id));
    addActivity(`Pixel ${item?.nome} removido`, 'warning');
  };

  // Campanhas handlers
  const handleAddCamp = (e) => {
    e.preventDefault();
    if (!campForm.nome) return;
    setCampanhas([...campanhas, { id: helpers.uid(), ...campForm, createdAt: helpers.today() }]);
    setCampForm({ nome: '', tipo: 'Bot', status: 'Ativa', cliques: 0, conversoes: 0 });
    setShowCampForm(false);
    addActivity(`Campanha ${campForm.nome} criada`, 'success');
  };

  const handleDeleteCamp = (id) => {
    const item = campanhas.find(c => c.id === id);
    setCampanhas(campanhas.filter(c => c.id !== id));
    addActivity(`Campanha ${item?.nome} excluída`, 'warning');
  };

  // Postagens handlers
  const handleAddPost = (e) => {
    e.preventDefault();
    if (!postForm.conteudo || !postForm.data || !postForm.hora) return;
    setPostagens([...postagens, { id: helpers.uid(), ...postForm, createdAt: helpers.today() }]);
    setPostForm({ conteudo: '', plataforma: 'Telegram', data: '', hora: '', status: 'Agendado' });
    setShowPostForm(false);
    addActivity('Postagem agendada', 'success');
  };

  const handleCancelPost = (id) => {
    setPostagens(postagens.map(p => p.id === id ? { ...p, status: 'Cancelado' } : p));
    addActivity('Postagem cancelada', 'warning');
  };

  // Envios handlers
  const handleSendBroadcast = async () => {
    if (!envioMensagem) return;
    let targetCount = 0;
    if (envioTarget === 'todos') targetCount = state.members.length || 10;
    else if (envioTarget === 'grupo') {
      const grupo = state.groups.find(g => g.id === envioGrupo);
      targetCount = grupo?.members || 5;
    } else targetCount = 5;

    setSendingProgress(0);
    for (let i = 1; i <= targetCount; i++) {
      await new Promise(r => setTimeout(r, 80));
      setSendingProgress(i);
    }
    addActivity(`Mensagem enviada para ${targetCount} contatos`, 'success');
    addNotification('Envio concluído', `Broadcast enviado para ${targetCount} contatos.`);
    setSendingProgress(null);
    setEnvioMensagem('');
  };

  const flowSteps = [
    { title: 'Start', desc: 'Início' },
    { title: 'Mensagem', desc: 'Boas-vindas' },
    { title: 'Pagamento', desc: 'Cobrança' },
    { title: 'Acesso', desc: 'Liberação' },
  ];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Automações</h1>
            <p className="text-sm text-muted-foreground mt-1">Central de automação e marketing</p>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <div className="bg-card rounded-xl border border-border p-2 space-y-1 sticky top-24">
              {SIDE_TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-card-foreground hover:bg-muted/50'}`}>
                    <Icon size={16} /> {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meus Robôs */}
            {activeTab === 'bots' && (
              <AnimatedCard className="bg-card rounded-xl border border-border p-8 text-center">
                <Bot size={48} className="mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-bold text-card-foreground mb-2">Gerenciar Bots</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Configure, inicie e monitore seus bots de vendas do Telegram.</p>
                <Link to="/bots" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all">
                  Gerenciar bots &rarr;
                </Link>
              </AnimatedCard>
            )}

            {/* Fluxos */}
            {activeTab === 'fluxos' && (
              <div>
                <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                  <h2 className="text-lg font-bold text-card-foreground mb-4">Criar Novo Fluxo</h2>
                  <form onSubmit={handleAddFlow} className="flex flex-col sm:flex-row gap-4">
                    <input value={flowName} onChange={e => setFlowName(e.target.value)} placeholder="Nome do fluxo" className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                    <select value={flowType} onChange={e => setFlowType(e.target.value)} className="px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      <option value="basic">Básico</option>
                      <option value="advanced">Avançado</option>
                    </select>
                    <AnimatedButton type="submit" className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg">Criar Fluxo</AnimatedButton>
                  </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {state.flows.length === 0 ? (
                    <div className="lg:col-span-2 bg-card rounded-xl border border-border p-12 text-center">
                      <GitBranch size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Nenhum fluxo criado ainda.</p>
                    </div>
                  ) : state.flows.map((flow, i) => (
                    <div key={flow.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <AnimatedCard className="bg-card rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold text-card-foreground">{flow.name}</h3>
                            <span className="text-xs text-muted-foreground uppercase">{flow.type}</span>
                          </div>
                          <button onClick={() => handleDeleteFlow(flow.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {flowSteps.map((s, idx) => (
                            <React.Fragment key={idx}>
                              <div className="px-3 py-2 bg-muted rounded-lg text-xs text-center">
                                <div className="font-medium text-card-foreground">{s.title}</div>
                                <div className="text-muted-foreground">{s.desc}</div>
                              </div>
                              {idx < flowSteps.length - 1 && <span className="text-muted-foreground text-xs">&rarr;</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </AnimatedCard>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redirecionadores */}
            {activeTab === 'redirecionadores' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-card-foreground">Redirecionadores</h2>
                  <AnimatedButton onClick={() => { setShowRedirForm(!showRedirForm); setRedirCloak(false); setRedirForm({ nome: '', urlOriginal: '', urlDestino: '', status: true, urlMobile: '' }); }}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                    {showRedirForm ? 'Cancelar' : 'Novo Redirecionador'}
                  </AnimatedButton>
                </div>

                {showRedirForm && (
                  <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                    <h3 className="font-bold text-card-foreground mb-4">Criar Redirecionador</h3>
                    <form onSubmit={handleAddRedir} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                        <input value={redirForm.nome} onChange={e => setRedirForm({ ...redirForm, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Meu link promocional" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">URL Original (curta)</label>
                        <input value={redirForm.urlOriginal} onChange={e => setRedirForm({ ...redirForm, urlOriginal: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="ex: hive.io/promo" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">URL de Destino</label>
                        <input value={redirForm.urlDestino} onChange={e => setRedirForm({ ...redirForm, urlDestino: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://seu-site.com/destino" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={redirCloak} onChange={e => setRedirCloak(e.target.checked)} className="rounded border-input" />
                          <span className="text-sm text-card-foreground">Cloaking por dispositivo (URL diferente para mobile)</span>
                        </label>
                      </div>
                      {redirCloak && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-card-foreground mb-1">URL para Mobile</label>
                          <input value={redirForm.urlMobile} onChange={e => setRedirForm({ ...redirForm, urlMobile: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://seu-site.com/mobile" />
                        </div>
                      )}
                      <div className="md:col-span-2 flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={redirForm.status} onChange={e => setRedirForm({ ...redirForm, status: e.target.checked })} className="rounded border-input" />
                          <span className="text-sm text-card-foreground">Ativo</span>
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Criar</AnimatedButton>
                      </div>
                    </form>
                  </div>
                )}

                {redirs.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Share2 size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum redirecionador cadastrado.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-3 text-muted-foreground font-medium">Nome</th>
                          <th className="text-left py-3 px-3 text-muted-foreground font-medium">URL Original</th>
                          <th className="text-left py-3 px-3 text-muted-foreground font-medium">URL Destino</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Cliques</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Status</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {redirs.map((r, i) => (
                          <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                            <td className="py-3 px-3 text-card-foreground font-medium">{r.nome}</td>
                            <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{r.urlOriginal}</td>
                            <td className="py-3 px-3 text-muted-foreground font-mono text-xs truncate max-w-[200px]">{r.urlDestino}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-bold text-card-foreground">{r.cliques || 0}</span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.status ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                                {r.status ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => { handleRedirClick(r.id); window.open(r.urlDestino, '_blank'); }} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Testar"><ExternalLink size={14} className="text-muted-foreground" /></button>
                                <button onClick={() => handleDeleteRedir(r.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors" title="Excluir"><Trash2 size={14} className="text-destructive" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Remarketing */}
            {activeTab === 'remarketing' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-card-foreground">Pixels de Remarketing</h2>
                  <AnimatedButton onClick={() => { setShowPixelForm(!showPixelForm); setPixelForm({ nome: '', codigo: '', tipo: 'Facebook' }); }}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                    {showPixelForm ? 'Cancelar' : 'Novo Pixel'}
                  </AnimatedButton>
                </div>

                {showPixelForm && (
                  <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                    <h3 className="font-bold text-card-foreground mb-4">Adicionar Pixel</h3>
                    <form onSubmit={handleAddPixel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                        <input value={pixelForm.nome} onChange={e => setPixelForm({ ...pixelForm, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: Pixel FB Vendas" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Tipo</label>
                        <select value={pixelForm.tipo} onChange={e => setPixelForm({ ...pixelForm, tipo: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                          <option value="Facebook">Facebook</option>
                          <option value="Google">Google Ads</option>
                          <option value="TikTok">TikTok</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-card-foreground mb-1">Código do Pixel</label>
                        <textarea value={pixelForm.codigo} onChange={e => setPixelForm({ ...pixelForm, codigo: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none font-mono text-xs" placeholder="Cole o código do pixel aqui..." />
                      </div>
                      <div className="md:col-span-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                        {pixelForm.tipo === 'Facebook' && 'Instruções: Vá ao Gerenciador de Anúncios &rarr; Eventos &rarr; Pixel &rarr; Copie o código base do pixel.'}
                        {pixelForm.tipo === 'Google' && 'Instruções: Acesse Google Ads &rarr; Ferramentas &rarr; Gerenciador de Públicos-alvo &rarr; Tag do Google &rarr; Copie o snippet.'}
                        {pixelForm.tipo === 'TikTok' && 'Instruções: Acesse TikTok Ads Manager &rarr; Eventos &rarr; Pixel &rarr; Criar Pixel &rarr; Copie o código.'}
                      </div>
                      <div className="md:col-span-2">
                        <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Adicionar</AnimatedButton>
                      </div>
                    </form>
                  </div>
                )}

                {pixels.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Target size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum pixel cadastrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pixels.map((p, i) => (
                      <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <AnimatedCard className="bg-card rounded-xl border border-border p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-card-foreground">{p.nome}</h3>
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">{p.tipo}</span>
                            </div>
                            <button onClick={() => handleDeletePixel(p.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors"><Trash2 size={14} className="text-destructive" /></button>
                          </div>
                          <div className="p-3 bg-background rounded-lg font-mono text-xs text-muted-foreground break-all max-h-24 overflow-y-auto">{p.codigo}</div>
                        </AnimatedCard>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Campanhas */}
            {activeTab === 'campanhas' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-card-foreground">Campanhas</h2>
                  <AnimatedButton onClick={() => { setShowCampForm(!showCampForm); setCampForm({ nome: '', tipo: 'Bot', status: 'Ativa', cliques: 0, conversoes: 0 }); }}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                    {showCampForm ? 'Cancelar' : 'Nova Campanha'}
                  </AnimatedButton>
                </div>

                {showCampForm && (
                  <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                    <h3 className="font-bold text-card-foreground mb-4">Nova Campanha</h3>
                    <form onSubmit={handleAddCamp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-card-foreground mb-1">Nome da Campanha</label>
                        <input value={campForm.nome} onChange={e => setCampForm({ ...campForm, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: Lançamento Produto X" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Tipo</label>
                        <select value={campForm.tipo} onChange={e => setCampForm({ ...campForm, tipo: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                          <option value="Bot">Bot</option>
                          <option value="Fluxo">Fluxo</option>
                          <option value="Redirect">Redirect</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Status</label>
                        <select value={campForm.status} onChange={e => setCampForm({ ...campForm, status: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                          <option value="Ativa">Ativa</option>
                          <option value="Pausada">Pausada</option>
                          <option value="Finalizada">Finalizada</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Criar Campanha</AnimatedButton>
                      </div>
                    </form>
                  </div>
                )}

                {campanhas.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Megaphone size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma campanha cadastrada.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-3 text-muted-foreground font-medium">Nome</th>
                          <th className="text-left py-3 px-3 text-muted-foreground font-medium">Tipo</th>
                          <th className="text-left py-3 px-3 text-muted-foreground font-medium">Status</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Cliques</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Conversões</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Taxa</th>
                          <th className="text-center py-3 px-3 text-muted-foreground font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campanhas.map((c, i) => {
                          const taxa = c.cliques > 0 ? ((c.conversoes / c.cliques) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                              <td className="py-3 px-3 text-card-foreground font-medium">{c.nome}</td>
                              <td className="py-3 px-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{c.tipo}</span></td>
                              <td className="py-3 px-3">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.status === 'Ativa' ? 'bg-chart-1/15 text-chart-1' : c.status === 'Pausada' ? 'bg-chart-4/15 text-chart-4' : 'bg-destructive/15 text-destructive'}`}>{c.status}</span>
                              </td>
                              <td className="py-3 px-3 text-center text-card-foreground font-medium">{c.cliques}</td>
                              <td className="py-3 px-3 text-center text-card-foreground font-medium">{c.conversoes}</td>
                              <td className="py-3 px-3 text-center text-muted-foreground">{taxa}%</td>
                              <td className="py-3 px-3 text-center">
                                <button onClick={() => handleDeleteCamp(c.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors"><Trash2 size={14} className="text-destructive" /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Postagens */}
            {activeTab === 'postagens' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-card-foreground">Postagens Agendadas</h2>
                  <AnimatedButton onClick={() => { setShowPostForm(!showPostForm); setPostForm({ conteudo: '', plataforma: 'Telegram', data: '', hora: '', status: 'Agendado' }); }}
                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                    {showPostForm ? 'Cancelar' : 'Nova Postagem'}
                  </AnimatedButton>
                </div>

                {showPostForm && (
                  <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                    <h3 className="font-bold text-card-foreground mb-4">Agendar Postagem</h3>
                    <form onSubmit={handleAddPost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-card-foreground mb-1">Conteúdo</label>
                        <textarea value={postForm.conteudo} onChange={e => setPostForm({ ...postForm, conteudo: e.target.value })} rows={4} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" placeholder="Digite o texto da postagem..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Plataforma</label>
                        <select value={postForm.plataforma} onChange={e => setPostForm({ ...postForm, plataforma: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                          <option value="Telegram">Telegram</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-card-foreground mb-1">Data</label>
                          <input type="date" value={postForm.data} onChange={e => setPostForm({ ...postForm, data: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-card-foreground mb-1">Hora</label>
                          <input type="time" value={postForm.hora} onChange={e => setPostForm({ ...postForm, hora: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Agendar</AnimatedButton>
                      </div>
                    </form>
                  </div>
                )}

                {postagens.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Calendar size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhuma postagem agendada.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {postagens.map((p, i) => (
                      <div key={p.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in flex items-start justify-between gap-4" style={{ animationDelay: `${i * 30}ms` }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-card-foreground mb-2 whitespace-pre-wrap">{p.conteudo}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.plataforma === 'Telegram' ? 'bg-chart-3/15 text-chart-3' : 'bg-chart-2/15 text-chart-2'}`}>{p.plataforma}</span>
                            <span>{p.data} às {p.hora}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Agendado' ? 'bg-chart-4/15 text-chart-4' : p.status === 'Enviado' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>{p.status}</span>
                          </div>
                        </div>
                        {p.status === 'Agendado' && (
                          <button onClick={() => handleCancelPost(p.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg shrink-0 transition-colors"><Trash2 size={14} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Envios */}
            {activeTab === 'envios' && (
              <div>
                <h2 className="text-lg font-bold text-card-foreground mb-4">Disparo de Mensagens</h2>

                <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                  <h3 className="font-bold text-card-foreground mb-4">Nova Campanha de Envio</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-2">Público Alvo</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'todos', label: 'Todos membros' },
                          { key: 'grupo', label: 'Grupo específico' },
                          { key: 'lista', label: 'Lista personalizada' },
                        ].map(opt => (
                          <button key={opt.key} onClick={() => setEnvioTarget(opt.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${envioTarget === opt.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {envioTarget === 'grupo' && (
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Selecionar Grupo</label>
                        <select value={envioGrupo} onChange={e => setEnvioGrupo(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                          <option value="">Selecione...</option>
                          {state.groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.members || 0} membros)</option>)}
                        </select>
                      </div>
                    )}

                    {envioTarget === 'lista' && (
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">IDs / Contatos (um por linha)</label>
                        <textarea rows={4} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" placeholder="@contato1&#10;@contato2&#10;123456789" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-card-foreground mb-1">Mensagem</label>
                      <textarea value={envioMensagem} onChange={e => setEnvioMensagem(e.target.value)} rows={5} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" placeholder="Digite a mensagem que será enviada..." />
                    </div>

                    <AnimatedButton onClick={handleSendBroadcast} disabled={sendingProgress !== null || !envioMensagem}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
                      {sendingProgress !== null ? (
                        <><Loader2 size={16} className="animate-spin" /> Enviando {sendingProgress}...</>
                      ) : (
                        <><Send size={16} /> Enviar</>
                      )}
                    </AnimatedButton>

                    {sendingProgress !== null && (
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-200" style={{ width: `${Math.min(100, (sendingProgress / (state.members.length || 10)) * 100)}%` }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Automacoes;

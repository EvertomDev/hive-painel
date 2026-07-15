import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Hash, Link, Copy, Check, Trash2, Plus, ToggleLeft, ToggleRight, ExternalLink, Info } from 'lucide-react';

const STORAGE_KEY_PIXELS = 'zeze-pixels';
const STORAGE_KEY_UTM = 'zeze-utm-history';

function loadPixels() {
  try { const raw = localStorage.getItem(STORAGE_KEY_PIXELS); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function savePixels(data) { localStorage.setItem(STORAGE_KEY_PIXELS, JSON.stringify(data)); }

function loadUtmHistory() {
  try { const raw = localStorage.getItem(STORAGE_KEY_UTM); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

function saveUtmHistory(data) { localStorage.setItem(STORAGE_KEY_UTM, JSON.stringify(data)); }

const PLATFORMS = ['Facebook', 'Google', 'TikTok'];

function Trackeamento() {
  const { addActivity, helpers } = useApp();
  const [pixels, setPixels] = useState(loadPixels);
  const [showPixelForm, setShowPixelForm] = useState(false);
  const [pixelForm, setPixelForm] = useState({ nome: '', plataforma: 'Facebook', codigo: '', ativo: true });
  const [copiedId, setCopiedId] = useState(null);

  const [urlBase, setUrlBase] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [utmHistory, setUtmHistory] = useState(loadUtmHistory);

  useEffect(() => { savePixels(pixels); }, [pixels]);
  useEffect(() => { saveUtmHistory(utmHistory); }, [utmHistory]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddPixel = (e) => {
    e.preventDefault();
    if (!pixelForm.nome || !pixelForm.codigo) return;
    setPixels([...pixels, { id: helpers.uid(), ...pixelForm, createdAt: helpers.today() }]);
    setPixelForm({ nome: '', plataforma: 'Facebook', codigo: '', ativo: true });
    setShowPixelForm(false);
    addActivity(`Pixel ${pixelForm.nome} adicionado`, 'success');
  };

  const handleTogglePixel = (id) => {
    setPixels(pixels.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
  };

  const handleDeletePixel = (id) => {
    const item = pixels.find(p => p.id === id);
    setPixels(pixels.filter(p => p.id !== id));
    addActivity(`Pixel ${item?.nome} removido`, 'warning');
  };

  const handleGenerateUtm = () => {
    if (!urlBase) return;
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);
    const fullUrl = urlBase + (params.toString() ? (urlBase.includes('?') ? '&' : '?') + params.toString() : '');
    setGeneratedUrl(fullUrl);
    const entry = { id: helpers.uid(), url: fullUrl, base: urlBase, source: utmSource, medium: utmMedium, campaign: utmCampaign, term: utmTerm, content: utmContent, createdAt: helpers.today() };
    setUtmHistory([entry, ...utmHistory]);
    addActivity('Link UTM gerado', 'success');
  };

  const handleDeleteUtm = (id) => {
    setUtmHistory(utmHistory.filter(h => h.id !== id));
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Trackeamento</h1>
            <p className="text-sm text-muted-foreground mt-1">Pixels e UTM</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 1: Pixels de Rastreamento */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2"><Hash size={20} className="text-primary" /> Pixels de Rastreamento</h2>
              <AnimatedButton onClick={() => { setShowPixelForm(!showPixelForm); setPixelForm({ nome: '', plataforma: 'Facebook', codigo: '', ativo: true }); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                {showPixelForm ? 'Cancelar' : <><Plus size={14} /> Novo Pixel</>}
              </AnimatedButton>
            </div>

            {showPixelForm && (
              <AnimatedCard className="bg-card rounded-xl border border-border p-6 mb-6">
                <h3 className="font-bold text-card-foreground mb-4">Adicionar Pixel</h3>
                <form onSubmit={handleAddPixel} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                    <input value={pixelForm.nome} onChange={e => setPixelForm({ ...pixelForm, nome: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: Pixel FB Vendas" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Plataforma</label>
                    <select value={pixelForm.plataforma} onChange={e => setPixelForm({ ...pixelForm, plataforma: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Código / Pixel ID</label>
                    <textarea value={pixelForm.codigo} onChange={e => setPixelForm({ ...pixelForm, codigo: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none font-mono text-xs" placeholder="Cole o código do pixel ou ID..." />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pixelForm.ativo} onChange={e => setPixelForm({ ...pixelForm, ativo: e.target.checked })} className="rounded border-input" />
                      <span className="text-sm text-card-foreground">Ativo</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">Adicionar Pixel</AnimatedButton>
                  </div>
                </form>
              </AnimatedCard>
            )}

            {pixels.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Hash size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum pixel cadastrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Nome</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Plataforma</th>
                      <th className="text-left py-3 px-3 text-muted-foreground font-medium">Código / Pixel ID</th>
                      <th className="text-center py-3 px-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-center py-3 px-3 text-muted-foreground font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pixels.map((p, i) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="py-3 px-3 text-card-foreground font-medium">{p.nome}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{p.plataforma}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground font-mono text-xs truncate max-w-[200px]">{p.codigo}</td>
                        <td className="py-3 px-3 text-center">
                          <button onClick={() => handleTogglePixel(p.id)} className="inline-flex items-center gap-1 text-sm">
                            {p.ativo ? <ToggleRight size={18} className="text-chart-1" /> : <ToggleLeft size={18} className="text-muted-foreground" />}
                            <span className={`text-xs font-medium ${p.ativo ? 'text-chart-1' : 'text-muted-foreground'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button onClick={() => handleDeletePixel(p.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors"><Trash2 size={14} className="text-destructive" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Section 2: Links UTM */}
          <section>
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><Link size={20} className="text-primary" /> Links UTM</h2>

            <AnimatedCard className="bg-card rounded-xl border border-border p-6 mb-6">
              <h3 className="font-bold text-card-foreground mb-4">Construtor de URL</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-1">URL Base</label>
                  <input value={urlBase} onChange={e => setUrlBase(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://seusite.com/pagina" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">utm_source</label>
                    <input value={utmSource} onChange={e => setUtmSource(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="google, facebook..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">utm_medium</label>
                    <input value={utmMedium} onChange={e => setUtmMedium(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="cpc, email, social..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">utm_campaign</label>
                    <input value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Nome da campanha" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">utm_term</label>
                    <input value={utmTerm} onChange={e => setUtmTerm(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Palavra-chave" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">utm_content</label>
                    <input value={utmContent} onChange={e => setUtmContent(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Anúncio A/B" />
                  </div>
                </div>
                <AnimatedButton onClick={handleGenerateUtm} disabled={!urlBase} className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg">Gerar Link UTM</AnimatedButton>

                {generatedUrl && (
                  <div className="p-4 bg-background rounded-xl border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">Link gerado:</p>
                        <p className="text-sm font-mono text-card-foreground break-all">{generatedUrl}</p>
                      </div>
                      <AnimatedButton onClick={() => copyToClipboard(generatedUrl, 'utm-generated')} className="p-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg shrink-0">
                        {copiedId === 'utm-generated' ? <Check size={16} /> : <Copy size={16} />}
                      </AnimatedButton>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedCard>

            <h3 className="font-semibold text-card-foreground mb-3">Histórico de Links UTM</h3>
            {utmHistory.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Link size={32} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhum link UTM gerado ainda.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {utmHistory.map((h, i) => (
                  <div key={h.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in flex items-start justify-between gap-3" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">{h.createdAt}</p>
                      <p className="text-sm font-mono text-card-foreground break-all">{h.url}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {h.source && <span className="text-xs px-2 py-0.5 rounded-full bg-chart-1/10 text-chart-1">source: {h.source}</span>}
                        {h.medium && <span className="text-xs px-2 py-0.5 rounded-full bg-chart-2/10 text-chart-2">medium: {h.medium}</span>}
                        {h.campaign && <span className="text-xs px-2 py-0.5 rounded-full bg-chart-3/10 text-chart-3">campaign: {h.campaign}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyToClipboard(h.url, 'utm-' + h.id)} className="p-1.5 hover:bg-secondary rounded transition-colors">
                        {copiedId === 'utm-' + h.id ? <Check size={14} className="text-chart-1" /> : <Copy size={14} className="text-muted-foreground" />}
                      </button>
                      <button onClick={() => handleDeleteUtm(h.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors"><Trash2 size={14} className="text-destructive" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Instruções */}
          <section>
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><Info size={20} className="text-primary" /> Instruções</h2>
            <AnimatedCard className="bg-card rounded-xl border border-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-card-foreground mb-3 flex items-center gap-2"><Hash size={16} className="text-primary" /> Pixels de Rastreamento</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong className="text-card-foreground">Facebook Pixel:</strong> Vá ao Gerenciador de Anúncios &rarr; Eventos &rarr; Pixel &rarr; Copie o ID ou código base.</li>
                    <li><strong className="text-card-foreground">Google Ads:</strong> Acesse Google Ads &rarr; Ferramentas &rarr; Gerenciador de Públicos-alvo &rarr; Tag do Google &rarr; Copie o snippet.</li>
                    <li><strong className="text-card-foreground">TikTok Pixel:</strong> Acesse TikTok Ads Manager &rarr; Eventos &rarr; Pixel &rarr; Criar Pixel &rarr; Copie o código.</li>
                    <li>Cole o código na página de checkout ou nas páginas de conversão do seu funil.</li>
                    <li>Mantenha os pixels ativos apenas para as plataformas que você está utilizando.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-card-foreground mb-3 flex items-center gap-2"><Link size={16} className="text-primary" /> Parâmetros UTM</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><strong className="text-card-foreground">utm_source:</strong> Identifica a origem do tráfego (ex: google, facebook, newsletter).</li>
                    <li><strong className="text-card-foreground">utm_medium:</strong> Meio de marketing (ex: cpc, email, social, banner).</li>
                    <li><strong className="text-card-foreground">utm_campaign:</strong> Nome da campanha (ex: promocao_janeiro, lancamento_produto).</li>
                    <li><strong className="text-card-foreground">utm_term:</strong> Palavra-chave alvo (usado principalmente em campanhas de busca paga).</li>
                    <li><strong className="text-card-foreground">utm_content:</strong> Diferencia anúncios ou links dentro da mesma campanha (testes A/B).</li>
                    <li>Use o construtor acima para gerar URLs completas com todos os parâmetros.</li>
                  </ul>
                </div>
              </div>
            </AnimatedCard>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}

export default Trackeamento;

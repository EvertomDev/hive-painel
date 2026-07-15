import React, { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Link, Copy, Check, Plus, Trash2, ExternalLink, Smartphone, Image, Palette, GripVertical, Eye, Share2, Edit3 } from 'lucide-react';

const STORAGE_KEY = 'zeze-biolinks';

function loadBiolinks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return [
      {
        id: 'sample-1', name: 'Meu Link na Bio', slug: 'meubio', photo: '', bio: 'Criador de conteúdo digital | Marketing | Transformando ideias em resultados 🚀',
        links: [
          { id: 'sl-1', name: 'Meu Canal no Telegram', url: 'https://t.me/meucanal' },
          { id: 'sl-2', name: 'Instagram', url: 'https://instagram.com/meuperfil' },
          { id: 'sl-3', name: 'Site Oficial', url: 'https://meusite.com' },
        ], theme: '#7C3AED', visits: 1247, status: true, createdAt: '2025-01-15'
      },
      {
        id: 'sample-2', name: 'Promoções', slug: 'promo', photo: '', bio: 'Aproveite as melhores ofertas! 🔥',
        links: [
          { id: 'sl-4', name: 'Oferta 1 - Curso Completo', url: 'https://meusite.com/curso' },
          { id: 'sl-5', name: 'Grupo VIP Grátis', url: 'https://t.me/grupo_vip' },
        ], theme: '#EF4444', visits: 873, status: true, createdAt: '2025-02-20'
      },
    ];
  } catch { return []; }
}

function saveBiolinks(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function BioLink() {
  const { addActivity, addNotification, helpers } = useApp();
  const [biolinks, setBiolinks] = useState(loadBiolinks);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    name: '', slug: '', photo: '', bio: '', links: [{ id: helpers.uid(), name: '', url: '' }], theme: '#7C3AED', status: true
  });

  useEffect(() => { saveBiolinks(biolinks); }, [biolinks]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', photo: '', bio: '', links: [{ id: helpers.uid(), name: '', url: '' }], theme: '#7C3AED', status: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (bio) => {
    setForm({ ...bio, links: bio.links.map(l => ({ ...l })) });
    setEditingId(bio.id);
    setShowForm(true);
  };

  const handleAddLink = () => {
    setForm({ ...form, links: [...form.links, { id: helpers.uid(), name: '', url: '' }] });
  };

  const handleRemoveLink = (linkId) => {
    if (form.links.length <= 1) return;
    setForm({ ...form, links: form.links.filter(l => l.id !== linkId) });
  };

  const handleLinkChange = (linkId, field, value) => {
    setForm({ ...form, links: form.links.map(l => l.id === linkId ? { ...l, [field]: value } : l) });
  };

  const handleMoveLink = (index, direction) => {
    const newLinks = [...form.links];
    const target = index + direction;
    if (target < 0 || target >= newLinks.length) return;
    [newLinks[index], newLinks[target]] = [newLinks[target], newLinks[index]];
    setForm({ ...form, links: newLinks });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    if (biolinks.some(b => b.slug === form.slug && b.id !== editingId)) {
      addNotification('Slug já em uso', 'Este slug já está sendo utilizado por outra página.');
      return;
    }
    if (editingId) {
      setBiolinks(biolinks.map(b => b.id === editingId ? { ...b, ...form } : b));
      addActivity(`Página ${form.name} atualizada`, 'success');
    } else {
      const novo = { id: helpers.uid(), ...form, visits: 0, createdAt: helpers.today() };
      setBiolinks([...biolinks, novo]);
      addActivity(`Página ${form.name} criada`, 'success');
    }
    resetForm();
  };

  const handleToggleStatus = (id) => {
    setBiolinks(biolinks.map(b => b.id === id ? { ...b, status: !b.status } : b));
  };

  const handleDelete = (id) => {
    const item = biolinks.find(b => b.id === id);
    setBiolinks(biolinks.filter(b => b.id !== id));
    addActivity(`Página ${item?.name} excluída`, 'warning');
  };

  const isEditing = editingId !== null;
  const previewBio = showForm ? form : null;

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Bio Link</h1>
            <p className="text-sm text-muted-foreground mt-1">Páginas de bio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: List + Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Bio Pages List */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-card-foreground">Suas Páginas</h2>
                <AnimatedButton onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg flex items-center gap-2">
                  <Plus size={14} /> Nova Página
                </AnimatedButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {biolinks.map((bio, i) => (
                  <div key={bio.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <AnimatedCard className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-start gap-3">
                        {bio.photo ? (
                          <img src={bio.photo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: bio.theme }}>{bio.name.charAt(0)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-card-foreground truncate">{bio.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">zeze.io/{bio.slug}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Eye size={12} /> {bio.visits || 0}</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${bio.status ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>{bio.status ? 'Ativo' : 'Inativo'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border">
                        <button onClick={() => handleEdit(bio)} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Editar"><Edit3 size={14} className="text-muted-foreground" /></button>
                        <button onClick={() => copyToClipboard(`https://zeze.io/${bio.slug}`, 'share-' + bio.id)} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Compartilhar">
                          {copiedId === 'share-' + bio.id ? <Check size={14} className="text-chart-1" /> : <Share2 size={14} className="text-muted-foreground" />}
                        </button>
                        <button onClick={() => handleToggleStatus(bio.id)} className="p-1.5 hover:bg-secondary rounded transition-colors" title={bio.status ? 'Desativar' : 'Ativar'}>
                          {bio.status ? <Eye size={14} className="text-chart-1" /> : <Eye size={14} className="text-muted-foreground" />}
                        </button>
                        <button onClick={() => handleDelete(bio.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors ml-auto" title="Excluir"><Trash2 size={14} className="text-destructive" /></button>
                      </div>
                    </AnimatedCard>
                  </div>
                ))}
              </div>
            </section>

            {/* Create/Edit Form */}
            {showForm && (
              <section>
                <h2 className="text-lg font-bold text-card-foreground mb-4">{isEditing ? 'Editar Página' : 'Criar Nova Página'}</h2>
                <AnimatedCard className="bg-card rounded-xl border border-border p-6">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Nome da Página</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: Meu Link na Bio" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1">Slug (username)</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">zeze.io/</span>
                          <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })} className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="meubio" />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-card-foreground mb-1">URL da Foto de Perfil</label>
                        <input value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://..." />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-card-foreground mb-1">Texto da Bio</label>
                        <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" placeholder="Conte um pouco sobre você..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-card-foreground mb-1 flex items-center gap-2"><Palette size={14} /> Cor do Tema</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} className="w-12 h-10 rounded-lg border border-input cursor-pointer bg-transparent" />
                          <input value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none font-mono text-sm" />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={form.status} onChange={e => setForm({ ...form, status: e.target.checked })} className="rounded border-input" />
                          <span className="text-sm text-card-foreground">Página ativa</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-card-foreground">Links</label>
                        <AnimatedButton type="button" onClick={handleAddLink} className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium rounded-lg flex items-center gap-1"><Plus size={12} /> Adicionar Link</AnimatedButton>
                      </div>
                      <div className="space-y-2">
                        {form.links.map((link, idx) => (
                          <div key={link.id} className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
                            <div className="flex flex-col gap-0.5">
                              <button type="button" onClick={() => handleMoveLink(idx, -1)} disabled={idx === 0} className="p-0.5 hover:bg-secondary rounded disabled:opacity-30"><GripVertical size={12} className="text-muted-foreground rotate-180" /></button>
                              <button type="button" onClick={() => handleMoveLink(idx, 1)} disabled={idx === form.links.length - 1} className="p-0.5 hover:bg-secondary rounded disabled:opacity-30"><GripVertical size={12} className="text-muted-foreground" /></button>
                            </div>
                            <input value={link.name} onChange={e => handleLinkChange(link.id, 'name', e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none text-sm" placeholder="Nome do link" />
                            <input value={link.url} onChange={e => handleLinkChange(link.id, 'url', e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none text-sm" placeholder="https://..." />
                            <button type="button" onClick={() => handleRemoveLink(link.id)} className="p-1.5 hover:bg-destructive/10 rounded transition-colors"><Trash2 size={14} className="text-destructive" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">{isEditing ? 'Salvar Alterações' : 'Criar Página'}</AnimatedButton>
                      <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors">Cancelar</button>
                    </div>
                  </form>
                </AnimatedCard>
              </section>
            )}
          </div>

          {/* Right: Preview Panel */}
          <div className="xl:col-span-1">
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><Smartphone size={20} className="text-primary" /> Pré-visualização</h2>
            <div className="sticky top-24">
              {previewBio ? (
                <AnimatedCard className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="max-w-[320px] mx-auto" style={{ backgroundColor: previewBio.theme + '10' }}>
                    <div className="p-6 text-center" style={{ background: `linear-gradient(180deg, ${previewBio.theme}20 0%, transparent 100%)` }}>
                      {previewBio.photo ? (
                        <img src={previewBio.photo} alt="" className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-md" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md" style={{ backgroundColor: previewBio.theme }}>{previewBio.name.charAt(0)}</div>
                      )}
                      <h3 className="text-lg font-bold text-card-foreground mt-3">{previewBio.name}</h3>
                      {previewBio.bio && <p className="text-sm text-muted-foreground mt-1">{previewBio.bio}</p>}
                    </div>

                    <div className="px-6 pb-6 space-y-3">
                      {previewBio.links.map((link, idx) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                          className="block w-full py-3 px-4 rounded-xl text-center font-medium text-white transition-all hover:brightness-110 shadow-sm"
                          style={{ backgroundColor: previewBio.theme }}>
                          {link.name || 'Link ' + (idx + 1)}
                        </a>
                      ))}
                    </div>

                    <div className="px-6 py-3 text-center border-t border-border">
                      <p className="text-xs text-muted-foreground">zeze.io/{previewBio.slug}</p>
                    </div>
                  </div>
                </AnimatedCard>
              ) : (
                <AnimatedCard className="bg-card rounded-xl border border-border p-12 text-center">
                  <Smartphone size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Crie ou edite uma página para ver a pré-visualização.</p>
                </AnimatedCard>
              )}

              {previewBio && (
                <AnimatedButton onClick={() => copyToClipboard(`https://zeze.io/${previewBio.slug}`, 'preview-share')} className="w-full mt-4 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2">
                  {copiedId === 'preview-share' ? <><Check size={16} /> Copiado!</> : <><Share2 size={16} /> Compartilhar Página</>}
                </AnimatedButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default BioLink;

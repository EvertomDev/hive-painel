import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { FolderKanban, Plus, X, ExternalLink, Settings, Trash2, Search, Globe, Gamepad2, Ticket, Sparkles } from 'lucide-react';

const TYPE_ICONS = { jogo: Gamepad2, rifa: Ticket, raspadinha: Sparkles, servico: Settings };
const TYPE_COLORS = { jogo: 'text-blue-400', rifa: 'text-purple-400', raspadinha: 'text-orange-400', servico: 'text-emerald-400' };
const TYPE_BG = { jogo: 'bg-blue-500/10', rifa: 'bg-purple-500/10', raspadinha: 'bg-orange-500/10', servico: 'bg-emerald-500/10' };

const PROJECT_TYPES = [
  { value: 'jogo', label: 'Jogo', icon: '🎮' },
  { value: 'rifa', label: 'Rifa', icon: '🎫' },
  { value: 'raspadinha', label: 'Raspadinha', icon: '🎰' },
  { value: 'servico', label: 'Serviço', icon: '⚙️' },
];

function ProjectCard({ project, onEdit, onDelete }) {
  const Icon = TYPE_ICONS[project.type] || Settings;
  const color = TYPE_COLORS[project.type] || 'text-gray-400';
  const bg = TYPE_BG[project.type] || 'bg-gray-500/10';

  return (
    <GlassCard className="p-5 transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bg}`}>
            {project.icon || '📁'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{project.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${bg} ${color}`}>
                {project.type}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                project.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-[#52525b]'
              }`}>
                {project.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(project)}
            className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-white/[0.06] transition-colors">
            <Settings size={13} />
          </button>
          <button onClick={() => onDelete(project.id)}
            className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-xs text-[#a1a1aa] mb-4 line-clamp-2">{project.description}</p>

      <div className="space-y-2">
        {project.domain && (
          <div className="flex items-center gap-2 text-xs">
            <Globe size={11} className="text-[#52525b] shrink-0" />
            <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer"
              className="text-[var(--brand-400)] hover:underline truncate">{project.domain}</a>
            <ExternalLink size={9} className="text-[#52525b] shrink-0" />
          </div>
        )}
        {project.adminUrl && (
          <div className="flex items-center gap-2 text-xs">
            <Settings size={11} className="text-[#52525b] shrink-0" />
            <a href={project.adminUrl} target="_blank" rel="noopener noreferrer"
              className="text-[var(--brand-400)] hover:underline truncate">{project.adminUrl}</a>
            <ExternalLink size={9} className="text-[#52525b] shrink-0" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState(project || {
    name: '', type: 'jogo', description: '', domain: '', adminUrl: '', status: 'active', icon: '🎮',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111118] rounded-2xl border border-white/[0.08] p-6 w-full max-w-md animate-fade-in shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">{project ? 'Editar Projeto' : 'Novo Projeto'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#52525b] hover:text-white hover:bg-white/[0.06]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Nome</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
              placeholder="Ex: Helix Jump" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Tipo</label>
              <select value={form.type} onChange={e => {
                const t = PROJECT_TYPES.find(p => p.value === e.target.value);
                setForm({ ...form, type: e.target.value, icon: t?.icon || '📁' });
              }}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)] appearance-none">
                {PROJECT_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)] appearance-none">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Descrição</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
              placeholder="Descreva o projeto..." />
          </div>

          <div>
            <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Domínio</label>
            <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
              placeholder="ex: jogohelix.com.br" />
          </div>

          <div>
            <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">URL do Painel Admin</label>
            <input value={form.adminUrl} onChange={e => setForm({ ...form, adminUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
              placeholder="https://admin.jogohelix.com.br" />
          </div>

          <button type="submit"
            className="w-full py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all">
            {project ? 'Salvar' : 'Criar Projeto'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Projetos() {
  const { state, dispatch, addActivity, addNotification } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const projects = (state.projects || []).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form) => {
    if (editing) {
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: editing.id, data: form } });
      addActivity(`Projeto ${form.name} atualizado`, 'success');
    } else {
      dispatch({ type: 'ADD_PROJECT', payload: { ...form, id: Date.now().toString(36) + Math.random().toString(36).substr(2, 6) } });
      addActivity(`Projeto ${form.name} criado`, 'success');
      addNotification('Novo projeto', `${form.name} foi adicionado.`);
    }
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    const p = projects.find(p => p.id === id);
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    addActivity(`Projeto ${p?.name} removido`, 'warning');
  };

  const handleEdit = (project) => {
    setEditing(project);
    setShowModal(true);
  };

  const activeCount = (state.projects || []).filter(p => p.status === 'active').length;

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold flex items-center gap-3">
              <FolderKanban size={28} className="text-[var(--brand-500)]" />
              Projetos
            </h1>
            <p className="text-sm text-[#a1a1aa] mt-1">
              {activeCount} ativos · {projects.length} no total
            </p>
          </div>
          <button onClick={() => { setEditing(null); setShowModal(true); }}
            className="px-5 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all">
            <Plus size={16} /> Novo Projeto
          </button>
        </div>

        <div className="relative max-w-xs mb-6">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
            placeholder="Buscar projeto..." />
        </div>

        {projects.length === 0 ? (
          <GlassCard className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <FolderKanban size={28} className="text-[#52525b]" />
            </div>
            <p className="text-white/70 mb-2">Nenhum projeto encontrado.</p>
            <p className="text-sm text-[#52525b] mb-4">Adicione seu primeiro projeto para começar.</p>
            <button onClick={() => { setEditing(null); setShowModal(true); }}
              className="px-5 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2 mx-auto">
              <Plus size={16} /> Novo Projeto
            </button>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <ProjectCard project={p} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <ProjectModal project={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={handleSave} />
        )}
      </div>
    </PageTransition>
  );
}

export default Projetos;

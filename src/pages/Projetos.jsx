import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { FolderKanban, Plus, X, ExternalLink, Settings, Trash2, Search, Globe, Gamepad2, Ticket, Sparkles, BarChart3, Users, DollarSign, Copy, Check, Zap, Link as LinkIcon, Eye } from 'lucide-react';

const PROJECTS_DEFAULT = [
  {
    id: 'helix',
    name: 'Helix Jump',
    type: 'jogo',
    description: 'Jogo arcade com depósito via SigiloPay. Sistema completo com saque manual, cupons e afiliados.',
    icon: '🎮',
    domain: '',
    adminUrl: '',
    webhookUrl: '/api/sigilopay_webhook.php',
    status: 'active',
    stats: { users: 0, revenue: 0, deposits: 0 },
    settings: { sigilopayPublicKey: '', sigilopaySecretKey: '' },
  },
  {
    id: 'rifa',
    name: 'Rifa Online',
    type: 'rifa',
    description: 'Sistema de rifas com pagamento PIX via SigiloPay.woocommerce.',
    icon: '🎫',
    domain: '',
    adminUrl: '',
    webhookUrl: '',
    status: 'active',
    stats: { users: 0, revenue: 0, raffles: 0 },
    settings: {},
  },
  {
    id: 'raspadinha',
    name: 'Raspadinha',
    type: 'raspadinha',
    description: 'Raspadinha digital com prêmios e gateway de pagamento integrado.',
    icon: '🎰',
    domain: '',
    adminUrl: '',
    webhookUrl: '',
    status: 'inactive',
    stats: { users: 0, revenue: 0, cards: 0 },
    settings: {},
  },
];

const TYPE_COLORS = { jogo: 'text-blue-400', rifa: 'text-purple-400', raspadinha: 'text-orange-400' };
const TYPE_BG = { jogo: 'bg-blue-500/10', rifa: 'bg-purple-500/10', raspadinha: 'bg-orange-500/10' };

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-[10px] text-[#a1a1aa] uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function ProjectAdmin({ project, onClose, onSave }) {
  const [tab, setTab] = useState('dashboard');
  const [form, setForm] = useState({ ...project });
  const [copied, setCopied] = useState(null);

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111118] rounded-2xl border border-white/[0.08] w-full max-w-3xl max-h-[85vh] overflow-hidden animate-fade-in shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{project.icon}</span>
            <div>
              <h3 className="text-base font-bold text-white">{project.name}</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_BG[project.type]} ${TYPE_COLORS[project.type]}`}>
                {project.type}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {project.domain && (
              <a href={`https://${project.domain}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--brand-500)]/15 text-[var(--brand-400)] hover:bg-[var(--brand-500)]/25 transition-colors flex items-center gap-1.5">
                <Eye size={12} /> Ver Site
              </a>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-white/[0.06]">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-white/[0.06]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'links', label: 'Links & Webhook', icon: LinkIcon },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t.id ? 'bg-white/[0.08] text-white' : 'text-[#52525b] hover:text-white hover:bg-white/[0.04]'
              }`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === 'dashboard' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <StatCard icon={Users} label="Usuários" value={project.stats?.users || 0} color="bg-blue-500/15 text-blue-400" />
                <StatCard icon={DollarSign} label="Receita" value={`R$ ${(project.stats?.revenue || 0).toFixed(2)}`} color="bg-emerald-500/15 text-emerald-400" />
                <StatCard icon={Zap} label={project.type === 'rifa' ? 'Rifas' : project.type === 'raspadinha' ? 'Raspadinhas' : 'Depósitos'} value={project.stats?.deposits || project.stats?.raffles || project.stats?.cards || 0} color="bg-purple-500/15 text-purple-400" />
              </div>

              <GlassCard className="p-4">
                <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Atividade Recente</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Sistema inicializado</span>
                    <span className="ml-auto text-[#52525b]">agora</span>
                  </div>
                </div>
                <p className="text-[10px] text-[#52525b] mt-3">Os dados reais aparecem aqui quando o jogo estiver hospedado e conectado.</p>
              </GlassCard>

              {project.type === 'jogo' && (
                <GlassCard className="p-4">
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Sobre o Helix Jump</h4>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Jogo arcade com sistema de depósito via SigiloPay. Os usuários jogam, acumulam saldo e podem sacar.
                    O saque é manual — você aprova pelo painel admin do jogo.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">PHP + MySQL</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">SigiloPay</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400">Saque Manual</span>
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Nome</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]" />
              </div>
              <div>
                <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Domínio</label>
                <input value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
                  placeholder="ex: helixjump.com.br" />
              </div>
              <div>
                <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">URL do Painel Admin</label>
                <input value={form.adminUrl} onChange={e => setForm({ ...form, adminUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
                  placeholder="https://helixjump.com.br/admin" />
              </div>
              <div>
                <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)] appearance-none">
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>

              {project.type === 'jogo' && (
                <>
                  <div className="h-px bg-white/[0.06] my-2" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Chaves SigiloPay</h4>
                  <div>
                    <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Public Key</label>
                    <input type="password" value={form.settings?.sigilopayPublicKey || ''} 
                      onChange={e => setForm({ ...form, settings: { ...form.settings, sigilopayPublicKey: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
                      placeholder="Sua public key da SigiloPay" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#a1a1aa] uppercase tracking-wider font-semibold mb-1.5">Secret Key</label>
                    <input type="password" value={form.settings?.sigilopaySecretKey || ''}
                      onChange={e => setForm({ ...form, settings: { ...form.settings, sigilopaySecretKey: e.target.value } })}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
                      placeholder="Sua secret key da SigiloPay" />
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'links' && (
            <div className="space-y-4">
              <GlassCard className="p-4">
                <h4 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">URLs Importantes</h4>
                <div className="space-y-3">
                  {project.domain && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <div className="text-[10px] text-[#a1a1aa] uppercase">Site do Jogo</div>
                        <div className="text-xs text-white font-mono">https://{project.domain}</div>
                      </div>
                      <button onClick={() => copyText(`https://${project.domain}`, 'site')}
                        className="p-1.5 rounded-md text-[#52525b] hover:text-white hover:bg-white/[0.06]">
                        {copied === 'site' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                  {project.adminUrl && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <div className="text-[10px] text-[#a1a1aa] uppercase">Painel Admin</div>
                        <div className="text-xs text-white font-mono">{project.adminUrl}</div>
                      </div>
                      <button onClick={() => copyText(project.adminUrl, 'admin')}
                        className="p-1.5 rounded-md text-[#52525b] hover:text-white hover:bg-white/[0.06]">
                        {copied === 'admin' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                  {project.webhookUrl && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <div className="text-[10px] text-[#a1a1aa] uppercase">Webhook URL (SigiloPay)</div>
                        <div className="text-xs text-white font-mono">{project.domain ? `https://${project.domain}${project.webhookUrl}` : project.webhookUrl}</div>
                      </div>
                      <button onClick={() => copyText(project.domain ? `https://${project.domain}${project.webhookUrl}` : project.webhookUrl, 'webhook')}
                        className="p-1.5 rounded-md text-[#52525b] hover:text-white hover:bg-white/[0.06]">
                        {copied === 'webhook' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>

              {project.type === 'jogo' && (
                <GlassCard className="p-4">
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Como configurar</h4>
                  <ol className="text-xs text-[#a1a1aa] space-y-2 list-decimal list-inside">
                    <li>Hospede os arquivos do Helix Jump em uma hospedagem PHP + MySQL</li>
                    <li>Importe o <code className="text-[var(--brand-400)]">bancodedados.sql</code> no phpMyAdmin</li>
                    <li>Configure o <code className="text-[var(--brand-400)]">config.php</code> com os dados do banco</li>
                    <li>Cadastre suas chaves SigiloPay no painel admin do jogo</li>
                    <li>Cadastre o webhook na SigiloPay com a URL acima</li>
                    <li>Teste com um depósito real</li>
                  </ol>
                </GlassCard>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-white/[0.04] text-[#a1a1aa] hover:text-white hover:bg-white/[0.08] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white transition-all">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

function Projetos() {
  const { state, dispatch, addActivity } = useApp();
  const [adminProject, setAdminProject] = useState(null);
  const [search, setSearch] = useState('');

  const projects = (state.projects || PROJECTS_DEFAULT).filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveProject = (form) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: form.id, data: form } });
    addActivity(`Projeto ${form.name} atualizado`, 'success');
  };

  const activeCount = projects.filter(p => p.status === 'active').length;

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
        </div>

        <div className="relative max-w-xs mb-6">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]"
            placeholder="Buscar projeto..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
              <GlassCard className="p-5 transition-all duration-300 hover:scale-[1.01]">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${TYPE_BG[p.type] || 'bg-gray-500/10'}`}>
                      {p.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{p.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_BG[p.type]} ${TYPE_COLORS[p.type]}`}>
                          {p.type}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          p.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.06] text-[#52525b]'
                        }`}>
                          {p.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#a1a1aa] mb-4 line-clamp-2">{p.description}</p>

                <div className="space-y-2 mb-4">
                  {p.domain && (
                    <div className="flex items-center gap-2 text-xs">
                      <Globe size={11} className="text-[#52525b] shrink-0" />
                      <span className="text-[#a1a1aa] truncate">{p.domain}</span>
                    </div>
                  )}
                  {p.adminUrl && (
                    <div className="flex items-center gap-2 text-xs">
                      <Settings size={11} className="text-[#52525b] shrink-0" />
                      <span className="text-[#a1a1aa] truncate">{p.adminUrl}</span>
                    </div>
                  )}
                </div>

                <button onClick={() => setAdminProject(p)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 bg-[var(--brand-500)]/15 text-[var(--brand-400)] hover:bg-[var(--brand-500)]/25 border border-[var(--brand-500)]/20">
                  <Settings size={13} /> Painel Admin
                </button>
              </GlassCard>
            </div>
          ))}
        </div>

        {adminProject && (
          <ProjectAdmin project={adminProject} onClose={() => setAdminProject(null)} onSave={handleSaveProject} />
        )}
      </div>
    </PageTransition>
  );
}

export default Projetos;

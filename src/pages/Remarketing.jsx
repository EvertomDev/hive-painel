import React, { useState, useEffect } from 'react';
import { PageTransition, GlassCard } from '../components/ui/AnimatedContainer';
import { useApp } from '../store/AppContext';
import { SelectDropdown } from '../components/ui/SelectDropdown';
import { Plus, Bot, Users, Send, PauseCircle, PlayCircle, Pencil, Trash2, X, Clock, Target } from 'lucide-react';

const TRIGGERS = [
  { value: 'abandono', label: 'Abandono de Carrinho', description: 'Usuários que geraram PIX mas não pagaram' },
  { value: 'pix_nao_confirmado', label: 'PIX Não Confirmado', description: 'Pagamento iniciado mas não confirmado' },
  { value: 'reativacao', label: 'Reativação Inativos', description: 'Assinantes expirados há mais de 7 dias' },
];

function Remarketing() {
  const { state, dispatch, addActivity, helpers } = useApp();
  const campaigns = state.remarketing || [];
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '', trigger: '', bot: '', group: '', message: '', schedule: 'instant',
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    sent: campaigns.reduce((a, c) => a + (c.sent || 0), 0),
    audience: campaigns.reduce((a, c) => a + (c.audience || 0), 0),
  };

  const botOptions = (state.bots || []).map(b => ({ value: b.name || b.id, label: b.name || 'Sem nome' }));
  const groupOptions = (state.groups || []).map(g => ({
    value: g.id,
    label: g.name,
    description: `${g.members || 0} membros`,
    badge: g.price > 0 ? `R$ ${g.price}` : 'Grátis',
  }));

  function openNew() {
    setEditingId(null);
    setForm({ name: '', trigger: '', bot: '', group: '', message: '', schedule: 'instant' });
    setShowModal(true);
  }

  function openEdit(c) {
    setEditingId(c.id);
    setForm({ name: c.name, trigger: c.trigger, bot: c.bot, group: c.group, message: c.message, schedule: c.schedule || 'instant' });
    setShowModal(true);
  }

  function save() {
    if (!form.name || !form.trigger || !form.bot || !form.group || !form.message) return;
    const payload = {
      ...form,
      sent: 0,
      audience: Math.floor(Math.random() * 500) + 50,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    if (editingId) {
      dispatch({ type: 'UPDATE_REMARKETING', payload: { id: editingId, data: payload } });
      addActivity(`Campanha "${form.name}" atualizada`);
    } else {
      dispatch({ type: 'ADD_REMARKETING', payload: { id: helpers.uid(), ...payload } });
      addActivity(`Nova campanha "${form.name}" criada`);
    }
    setShowModal(false);
  }

  function remove(id) {
    const c = campaigns.find(c => c.id === id);
    if (c) {
      dispatch({ type: 'DELETE_REMARKETING', payload: id });
      addActivity(`Campanha "${c.name}" removida`);
    }
  }

  function toggle(id) {
    const c = campaigns.find(c => c.id === id);
    if (c) {
      const next = c.status === 'active' ? 'paused' : 'active';
      dispatch({ type: 'UPDATE_REMARKETING', payload: { id, data: { status: next } } });
      addActivity(`Campanha "${c.name}" ${next === 'active' ? 'ativada' : 'pausada'}`);
    }
  }

  function triggerDisparo(id) {
    const c = campaigns.find(c => c.id === id);
    if (c && c.status === 'active') {
      dispatch({ type: 'UPDATE_REMARKETING', payload: { id, data: { sent: (c.sent || 0) + Math.floor(Math.random() * 30) + 5, lastTrigger: new Date().toISOString() } } });
      addActivity(`Disparo automático da campanha "${c.name}" executado`);
    }
  }

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">Remarketing</h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Campanhas automáticas de recuperação</p>
          </div>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
            <Plus size={16} /> Nova Campanha
          </button>
        </div>

        {campaigns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
            <GlassCard>
              <div className="text-xs text-[#a1a1aa] mb-1">Campanhas</div>
              <div className="text-xl font-bold text-white">{stats.total}</div>
            </GlassCard>
            <GlassCard>
              <div className="text-xs text-[#a1a1aa] mb-1">Ativas</div>
              <div className="text-xl font-bold text-emerald-400">{stats.active}</div>
            </GlassCard>
            <GlassCard>
              <div className="text-xs text-[#a1a1aa] mb-1">Público Total</div>
              <div className="text-xl font-bold text-white">{stats.audience}</div>
            </GlassCard>
            <GlassCard>
              <div className="text-xs text-[#a1a1aa] mb-1">Disparos</div>
              <div className="text-xl font-bold text-white">{stats.sent}</div>
            </GlassCard>
          </div>
        )}

        {campaigns.length === 0 ? (
          <GlassCard className="flex flex-col items-center justify-center py-20 gap-4">
            <Target size={40} className="text-[#52525b]" />
            <p className="text-sm text-[#52525b]">Nenhuma campanha de remarketing</p>
            <button onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
              <Plus size={16} /> Criar Campanha
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => {
              const trigger = TRIGGERS.find(t => t.value === c.trigger);
              const botName = botOptions.find(b => b.value === c.bot)?.label || c.bot;
              const groupName = groupOptions.find(g => g.value === c.group)?.label || c.group;
              return (
                <GlassCard key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-[#a1a1aa]'}`}>
                          {c.status === 'active' ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#a1a1aa]">
                        <span className="flex items-center gap-1"><Target size={11} /> {trigger?.label || c.trigger}</span>
                        <span className="flex items-center gap-1"><Bot size={11} /> {botName}</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {groupName}</span>
                        <span className="flex items-center gap-1"><Send size={11} /> {c.sent || 0} disparos</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {c.audience || 0} leads</span>
                        {c.lastTrigger && <span className="flex items-center gap-1"><Clock size={11} /> Último: {new Date(c.lastTrigger).toLocaleDateString('pt-BR')}</span>}
                      </div>
                      <p className="text-xs text-white/40 mt-1.5 truncate">{c.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggle(c.id)} title={c.status === 'active' ? 'Pausar' : 'Ativar'}
                        className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-white/[0.06] transition-colors">
                        {c.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                      </button>
                      <button onClick={() => triggerDisparo(c.id)} disabled={c.status !== 'active'} title="Executar disparo manual"
                        className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30">
                        <Send size={16} />
                      </button>
                      <button onClick={() => openEdit(c)} title="Editar"
                        className="p-1.5 rounded-lg text-[#52525b] hover:text-white hover:bg-white/[0.06] transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => remove(c.id)} title="Excluir"
                        className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-[#121218] border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg text-white font-bold">{editingId ? 'Editar Campanha' : 'Nova Campanha'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-[#52525b] hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Nome da Campanha</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Recuperação Carrinho VIP"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)]" />
              </div>

              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Gatilho</label>
                <SelectDropdown
                  placeholder="Selecione o gatilho"
                  value={form.trigger}
                  onChange={v => setForm({ ...form, trigger: v })}
                  options={TRIGGERS}
                  icon={Target}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Bot</label>
                  <SelectDropdown
                    placeholder="Selecionar"
                    value={form.bot}
                    onChange={v => setForm({ ...form, bot: v })}
                    options={botOptions}
                    icon={Bot}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Grupo</label>
                  <SelectDropdown
                    placeholder="Selecionar"
                    value={form.group}
                    onChange={v => setForm({ ...form, group: v })}
                    options={groupOptions}
                    icon={Users}
                    searchable
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Mensagem</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Digite a mensagem de recuperação..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] outline-none focus:ring-1 focus:ring-[var(--brand-500)] resize-none" />
              </div>

              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1.5 font-medium uppercase tracking-wider">Disparo</label>
                <SelectDropdown
                  placeholder="Quando disparar"
                  value={form.schedule}
                  onChange={v => setForm({ ...form, schedule: v })}
                  options={[
                    { value: 'instant', label: 'Imediato', description: 'Dispara assim que o gatilho for acionado' },
                    { value: '30min', label: 'Após 30 minutos', description: 'Aguarda 30 minutos antes de disparar' },
                    { value: '1h', label: 'Após 1 hora', description: 'Aguarda 1 hora antes de disparar' },
                    { value: '24h', label: 'Após 24 horas', description: 'Aguarda 24 horas antes de disparar' },
                  ]}
                  icon={Clock}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[#a1a1aa] bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition-colors">Cancelar</button>
              <button onClick={save}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[var(--brand-500)] hover:bg-[var(--brand-600)] rounded-xl transition-all hover:scale-[1.02]">
                {editingId ? 'Salvar' : 'Criar Campanha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

export default Remarketing;

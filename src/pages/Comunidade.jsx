import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { Users, UserPlus, MessageCircle, Copy, Check, Edit3, Trash2, ToggleLeft, ToggleRight, ExternalLink, Send, Loader2, Ban } from 'lucide-react';

const TABS = [
  { key: 'grupos', label: 'Grupos', icon: Users },
  { key: 'membros', label: 'Membros', icon: Users },
  { key: 'transmissao', label: 'Transmissão', icon: MessageCircle },
];

function Comunidade() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [tab, setTab] = useState('grupos');
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('todos');

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', description: '', price: '', inviteLink: '', category: 'vip' });
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [memberForm, setMemberForm] = useState({ name: '', contact: '', groupId: '', value: '', status: 'active' });
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [broadcastGroup, setBroadcastGroup] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastCount, setBroadcastCount] = useState(0);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    if (!groupForm.name || !groupForm.price || !groupForm.inviteLink) return;
    const data = { ...groupForm, price: parseFloat(groupForm.price) || 0, members: 0, active: true, createdAt: helpers.today() };
    if (editingGroupId) {
      dispatch({ type: 'UPDATE_GROUP', payload: { id: editingGroupId, data } });
      addActivity(`Grupo ${groupForm.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_GROUP', payload: { id: helpers.uid(), ...data } });
      addActivity(`Grupo ${groupForm.name} criado`, 'success');
    }
    setGroupForm({ name: '', description: '', price: '', inviteLink: '', category: 'vip' });
    setEditingGroupId(null);
    setShowGroupForm(false);
  };

  const handleEditGroup = (g) => {
    setGroupForm({ name: g.name, description: g.description || '', price: String(g.price), inviteLink: g.inviteLink, category: g.category || 'vip' });
    setEditingGroupId(g.id);
    setShowGroupForm(true);
  };

  const handleToggleGroup = (g) => {
    dispatch({ type: 'UPDATE_GROUP', payload: { id: g.id, data: { active: !g.active } } });
    addActivity(`Grupo ${g.name} ${g.active ? 'desativado' : 'ativado'}`, 'warning');
  };

  const handleDeleteGroup = (id, name) => {
    dispatch({ type: 'DELETE_GROUP', payload: id });
    addActivity(`Grupo ${name} excluído`, 'warning');
  };

  const handleMemberSubmit = (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.contact) return;
    if (editingMemberId) {
      dispatch({ type: 'UPDATE_MEMBER', payload: { id: editingMemberId, data: memberForm } });
      addActivity(`Membro ${memberForm.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_MEMBER', payload: { id: helpers.uid(), ...memberForm, value: parseFloat(memberForm.value) || 0, purchasedAt: helpers.today(), status: 'active' } });
      addActivity(`Membro ${memberForm.name} adicionado`, 'success');
    }
    setMemberForm({ name: '', contact: '', groupId: '', value: '', status: 'active' });
    setEditingMemberId(null);
    setShowMemberForm(false);
  };

  const handleDeleteMember = (id) => {
    dispatch({ type: 'DELETE_MEMBER', payload: id });
    addActivity('Membro removido', 'warning');
  };

  const handleBroadcast = () => {
    if (!broadcastGroup || !broadcastMessage.trim()) return;
    const members = state.members.filter(m => m.groupId === broadcastGroup);
    setBroadcastCount(members.length);
    setBroadcastSent(true);
    addActivity(`Mensagem enviada para ${members.length} membros`, 'success');
    addNotification('Transmissão', `Mensagem enviada para ${members.length} membros.`);
  };

  const filteredGroups = state.groups.filter(g => {
    if (searchTerm && !g.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredMembers = state.members.filter(m => {
    if (groupFilter !== 'todos' && m.groupId !== groupFilter) return false;
    if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase()) && !m.contact.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Comunidade</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestão de grupos e membros</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 overflow-x-auto animate-fade-in">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${tab === t.key ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-card-foreground'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'grupos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Grupos ({state.groups.length})</h2>
              <AnimatedButton onClick={() => { setShowGroupForm(!showGroupForm); setEditingGroupId(null); setGroupForm({ name: '', description: '', price: '', inviteLink: '', category: 'vip' }); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                {showGroupForm ? 'Cancelar' : '+ Novo Grupo'}
              </AnimatedButton>
            </div>

            <div className="flex gap-2 mb-4">
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar grupo..." className="w-full max-w-xs px-4 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
            </div>

            {showGroupForm && (
              <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                <h3 className="text-lg font-bold text-card-foreground mb-4">{editingGroupId ? 'Editar Grupo' : 'Novo Grupo'}</h3>
                <form onSubmit={handleGroupSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Nome do Grupo</label>
                    <input value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Ex: VIP Premium 🔥" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Descrição</label>
                    <textarea value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} rows={2} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" placeholder="Descrição do grupo..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Preço (R$)</label>
                    <input type="number" step="0.01" min="0" value={groupForm.price} onChange={e => setGroupForm({ ...groupForm, price: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="29.90" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Categoria</label>
                    <select value={groupForm.category} onChange={e => setGroupForm({ ...groupForm, category: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      <option value="vip">VIP</option>
                      <option value="combo">Combo</option>
                      <option value="free">Free</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-card-foreground mb-1">Link de Convite</label>
                    <input value={groupForm.inviteLink} onChange={e => setGroupForm({ ...groupForm, inviteLink: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="https://t.me/+AbCdEf123" />
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">{editingGroupId ? 'Salvar' : 'Criar Grupo'}</AnimatedButton>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGroups.length === 0 ? (
                <div className="md:col-span-2 xl:col-span-3 bg-card rounded-xl border border-border p-12 text-center">
                  <p className="text-muted-foreground">Nenhum grupo encontrado.</p>
                </div>
              ) : filteredGroups.map((g, i) => (
                <div key={g.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <AnimatedCard className="bg-card rounded-xl border border-border p-5 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-card-foreground">{g.name}</h3>
                        <p className="text-xs text-muted-foreground">{g.description}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${g.active ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                        {g.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4 py-3 border-y border-border/50">
                      <div className="text-center">
                        <div className="text-xl font-bold text-card-foreground">{helpers.formatMoney(g.price)}</div>
                        <div className="text-xs text-muted-foreground">Preço</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-card-foreground">{g.members || 0}</div>
                        <div className="text-xs text-muted-foreground">Membros</div>
                      </div>
                    </div>
                    {g.inviteLink && (
                      <div className="flex items-center gap-2 mb-3 p-2 bg-background rounded-lg">
                        <span className="text-xs text-muted-foreground truncate flex-1">{g.inviteLink}</span>
                        <button onClick={() => copyToClipboard(g.inviteLink, g.id)} className="p-1 hover:bg-secondary rounded transition-colors">
                          {copiedId === g.id ? <Check size={14} className="text-chart-1" /> : <Copy size={14} className="text-muted-foreground" />}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleEditGroup(g)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg flex items-center gap-1"><Edit3 size={12} /> Editar</button>
                      <button onClick={() => handleToggleGroup(g)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg flex items-center gap-1">
                        {g.active ? <ToggleLeft size={12} /> : <ToggleRight size={12} />} {g.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => copyToClipboard(g.inviteLink, 'copy-' + g.id)} className="px-3 py-1.5 text-xs font-medium bg-chart-2/10 hover:bg-chart-2/20 text-chart-2 rounded-lg flex items-center gap-1">
                        {copiedId === 'copy-' + g.id ? <Check size={12} /> : <Copy size={12} />} Copiar Link
                      </button>
                      <button onClick={() => handleDeleteGroup(g.id, g.name)} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg ml-auto"><Trash2 size={12} /></button>
                    </div>
                  </AnimatedCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'membros' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-card-foreground">Membros ({state.members.length})</h2>
              <AnimatedButton onClick={() => { setShowMemberForm(!showMemberForm); setEditingMemberId(null); setMemberForm({ name: '', contact: '', groupId: '', value: '', status: 'active' }); }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg">
                {showMemberForm ? 'Cancelar' : '+ Novo Membro'}
              </AnimatedButton>
            </div>

            <div className="flex gap-2 mb-4">
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar membro..." className="w-full max-w-xs px-4 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
              <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                <option value="todos">Todos os grupos</option>
                {state.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            {showMemberForm && (
              <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
                <h3 className="text-lg font-bold text-card-foreground mb-4">{editingMemberId ? 'Editar Membro' : 'Novo Membro'}</h3>
                <form onSubmit={handleMemberSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Nome</label>
                    <input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="Nome" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Contato</label>
                    <input value={memberForm.contact} onChange={e => setMemberForm({ ...memberForm, contact: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="@contato" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Grupo</label>
                    <select value={memberForm.groupId} onChange={e => setMemberForm({ ...memberForm, groupId: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      <option value="">Selecione...</option>
                      {state.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Valor Pago (R$)</label>
                    <input type="number" step="0.01" min="0" value={memberForm.value} onChange={e => setMemberForm({ ...memberForm, value: e.target.value })} className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" placeholder="29.90" />
                  </div>
                  <div className="md:col-span-3 flex gap-3">
                    <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg">{editingMemberId ? 'Salvar' : 'Adicionar'}</AnimatedButton>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Nome</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Grupo</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Contato</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Valor</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Data</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr><td colSpan="7" className="py-8 text-center text-muted-foreground">Nenhum membro encontrado.</td></tr>
                  ) : filteredMembers.map((m, i) => (
                    <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 20}ms` }}>
                      <td className="py-3 px-2 text-card-foreground font-medium">{m.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{state.groups.find(g => g.id === m.groupId)?.name || '—'}</td>
                      <td className="py-3 px-2 text-muted-foreground">{m.contact}</td>
                      <td className="py-3 px-2 text-card-foreground">{helpers.formatMoney(m.value)}</td>
                      <td className="py-3 px-2 text-muted-foreground">{new Date(m.purchasedAt).toLocaleDateString('pt-BR')}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${m.status === 'active' ? 'bg-chart-1/15 text-chart-1' : 'bg-destructive/15 text-destructive'}`}>
                          {m.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <button onClick={() => { setMemberForm({ name: m.name, contact: m.contact, groupId: m.groupId, value: String(m.value), status: m.status }); setEditingMemberId(m.id); setShowMemberForm(true); }}
                            className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground"><Edit3 size={14} /></button>
                          <button onClick={() => handleDeleteMember(m.id)} className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                          <button onClick={() => { dispatch({ type: 'UPDATE_MEMBER', payload: { id: m.id, data: { status: m.status === 'active' ? 'blocked' : 'active' } } }); addActivity(`Membro ${m.name} ${m.status === 'active' ? 'bloqueado' : 'desbloqueado'}`, 'warning'); }}
                            className="p-1.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"><Ban size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'transmissao' && (
            <div>
              <h2 className="text-lg font-bold text-card-foreground mb-4">Transmissão de Mensagens</h2>
              <AnimatedCard className="bg-card rounded-xl border border-border p-6 max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Selecionar Grupo</label>
                    <select value={broadcastGroup} onChange={e => { setBroadcastGroup(e.target.value); setBroadcastSent(false); }}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                      <option value="">Selecione um grupo...</option>
                      {state.groups.filter(g => g.active).map(g => (
                        <option key={g.id} value={g.id}>{g.name} ({g.members || 0} membros)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-1">Mensagem</label>
                    <textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} rows={5}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none"
                      placeholder="Digite a mensagem que será enviada para todos os membros do grupo..." />
                  </div>
                  <AnimatedButton onClick={handleBroadcast} disabled={!broadcastGroup || !broadcastMessage.trim()}
                    className="px-5 py-2 bg-primary disabled:opacity-60 text-primary-foreground font-semibold rounded-lg flex items-center gap-2">
                    <Send size={16} /> Enviar Transmissão
                  </AnimatedButton>
                  {broadcastSent && (
                    <div className="p-3 rounded-lg bg-chart-1/10 text-chart-1 text-sm animate-fade-in">
                      Mensagem enviada com sucesso para {broadcastCount} membro(s)!
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </div>
          )}
        </div>
      </PageTransition>
    );
  }

  export default Comunidade;
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard } from '../components/ui/AnimatedContainer';
import { FlowEditor } from '../components/FlowEditor';
import { MessageSquare, CreditCard, Unlock, Target, RefreshCw, ArrowRight, Plus, Trash2, Copy, X, Bot, CheckCircle, Clock, AlertTriangle, Settings, Image, Users, Link, ShoppingBag, Workflow } from 'lucide-react';

const flowTypeLabels = { venda: 'Venda', lead: 'Lead', suporte: 'Suporte', remarketing: 'Remarketing' };
const flowTypeIcons = { venda: ShoppingBag, lead: Target, suporte: MessageSquare, remarketing: RefreshCw };

const nodeColors = {
  start: '#3B82F6', message: '#22c55e', image: '#a855f7', payment: '#f59e0b',
  condition: '#f97316', group: '#06b6d4', webhook: '#ec4899', delay: '#eab308',
  redirect: '#6366f1', end: '#3B82F6',
};

function Flows() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'venda' });
  const [editingId, setEditingId] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (editingId) {
      dispatch({ type: 'UPDATE_FLOW', payload: { id: editingId, data: { ...form } } });
      addActivity(`Fluxo ${form.name} atualizado`, 'info');
    } else {
      dispatch({ type: 'ADD_FLOW', payload: { id: helpers.uid(), ...form, nodes: [], edges: [], steps: 0 } });
      addActivity(`Fluxo ${form.name} criado`, 'success');
      addNotification('Fluxo criado', `${form.name} foi adicionado.`);
    }
    setForm({ name: '', type: 'venda' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (flow) => {
    setForm({ name: flow.name, type: flow.type });
    setEditingId(flow.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const flow = state.flows.find(f => f.id === id);
    dispatch({ type: 'DELETE_FLOW', payload: id });
    addActivity(`Fluxo ${flow?.name} excluído`, 'warning');
  };

  const handleDuplicateFlow = (flow) => {
    dispatch({ type: 'ADD_FLOW', payload: { ...flow, id: helpers.uid(), name: flow.name + ' (cópia)' } });
    addActivity(`Fluxo ${flow.name} duplicado`, 'info');
  };

  const handleSaveFlow = (updatedFlow) => {
    dispatch({ type: 'UPDATE_FLOW', payload: { id: updatedFlow.id, data: { nodes: updatedFlow.nodes, edges: updatedFlow.edges, steps: updatedFlow.linearSteps?.length || updatedFlow.nodes?.length || 0 } } });
    addActivity(`Fluxo ${updatedFlow.name} salvo`, 'success');
    addNotification('Fluxo salvo', `${updatedFlow.name} foi atualizado.`);
  };

  const flowTypes = ['venda', 'lead', 'suporte', 'remarketing'];

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-white font-bold">Meus Fluxos</h1>
            <p className="text-sm text-[#a1a1aa] mt-1">Editor visual de jornadas do cliente</p>
          </div>
          {!selectedFlow && (
            <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', type: 'venda' }); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02]">
              <Plus size={16} /> {showForm ? 'Cancelar' : 'Novo Fluxo'}
            </button>
          )}
        </div>

        {showForm && !selectedFlow && (
          <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Fluxo' : 'Novo Fluxo'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do fluxo"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-[#52525b] focus:ring-2 focus:ring-[var(--brand-500)] outline-none text-sm" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-2 focus:ring-[var(--brand-500)] outline-none text-sm">
                {flowTypes.map(t => <option key={t} value={t}>{flowTypeLabels[t]}</option>)}
              </select>
              <button type="submit" className="px-5 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white font-semibold rounded-xl text-sm transition-all whitespace-nowrap">
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </form>
          </div>
        )}

        {selectedFlow ? (
          <FlowEditor
            flow={selectedFlow}
            onSave={handleSaveFlow}
            onBack={() => setSelectedFlow(null)}
          />
        ) : (
          <>
            {state.flows.length === 0 ? (
              <div className="glass-card rounded-2xl p-16 text-center animate-fade-in">
                <Workflow size={56} className="mx-auto mb-4 text-[#52525b]" />
                <p className="text-[#a1a1aa] mb-2">Nenhum fluxo criado.</p>
                <p className="text-xs text-[#52525b] mb-6">Crie fluxos visuais no estilo n8n para automatizar vendas, capturar leads e gerenciar grupos.</p>
                <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-sm font-semibold rounded-xl transition-all">
                  Criar Primeiro Fluxo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                {state.flows.map((flow, i) => {
                  const Icon = flowTypeIcons[flow.type] || Workflow;
                  const nodes = flow.nodes || [];
                  const edgeCount = flow.edges?.length || 0;
                  return (
                    <div key={flow.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="glass-card-hover rounded-2xl p-5 cursor-pointer group"
                        onClick={() => setSelectedFlow(flow)}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                              <Icon size={20} className="text-[var(--brand-500)]" />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white group-hover:text-[var(--brand-500)] transition-colors">{flow.name}</h3>
                              <span className="text-xs text-[#a1a1aa]">{flowTypeLabels[flow.type] || flow.type}</span>
                            </div>
                          </div>
                          <ArrowRight size={18} className="text-[#52525b] group-hover:text-[var(--brand-500)] group-hover:translate-x-1 transition-all" />
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5">
                              {nodes.slice(0, 4).map((n, ni) => (
                                <div key={n.id || ni} className="w-5 h-5 rounded-md border border-[#050505] flex items-center justify-center"
                                  style={{ background: `${nodeColors[n.data?.nodeType] || '#3B82F6'}25`, zIndex: 4 - ni }}>
                                  <div className="w-2 h-2 rounded-full" style={{ background: nodeColors[n.data?.nodeType] || '#3B82F6' }} />
                                </div>
                              ))}
                            </div>
                            <span className="text-xs text-[#52525b] ml-1">{nodes.length > 4 ? `${nodes.length} nós` : `${nodes.length} nós`}</span>
                          </div>
                          <span className="text-[10px] text-[#52525b]">{edgeCount} conexões</span>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(flow); }} className="px-3 py-1.5 text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] rounded-lg flex items-center gap-1 transition-all">
                            <Settings size={11} /> Editar
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicateFlow(flow); }} className="px-3 py-1.5 text-[11px] font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#a1a1aa] rounded-lg flex items-center gap-1 transition-all">
                            <Copy size={11} /> Duplicar
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(flow.id); }} className="px-3 py-1.5 text-[11px] font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center gap-1 ml-auto transition-all">
                            <Trash2 size={11} /> Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="glass-card rounded-2xl p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-white mb-5">Modelos de Fluxo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: 'venda', icon: ShoppingBag, label: 'Venda', desc: 'Venda de acesso a grupos e conteúdo automaticamente' },
                  { type: 'lead', icon: Target, label: 'Captura de Leads', desc: 'Colete contatos e qualifique leads' },
                  { type: 'suporte', icon: MessageSquare, label: 'Suporte', desc: 'Atendimento automatizado com bot' },
                  { type: 'remarketing', icon: RefreshCw, label: 'Remarketing', desc: 'Recupere clientes que não compraram' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.type} className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-[var(--border-brand)] hover:bg-white/[0.04] transition-all cursor-pointer animate-fade-in"
                      onClick={() => { setForm({ name: '', type: f.type }); setShowForm(true); }}>
                      <Icon size={24} className="text-[var(--brand-500)] mb-3" />
                      <div className="font-semibold text-white text-sm">{f.label}</div>
                      <div className="text-xs text-[#a1a1aa] mt-1">{f.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}

export default Flows;

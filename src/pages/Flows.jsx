import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard, AnimatedButton } from '../components/ui/AnimatedContainer';
import { MessageSquare, CreditCard, Unlock, Target, TrendingUp, TrendingDown, RefreshCw, ArrowRight, Plus, Trash2, GripVertical, Copy, Save, Eye, X, Bot, Link, CheckCircle, Clock, AlertTriangle, Settings, FileText, Image, Users, Send, ShoppingBag } from 'lucide-react';

const NODE_TYPES = [
  { type: 'start', label: 'Início', icon: Bot, color: 'text-chart-1' },
  { type: 'message', label: 'Mensagem', icon: MessageSquare, color: 'text-chart-2' },
  { type: 'image', label: 'Imagem', icon: Image, color: 'text-chart-3' },
  { type: 'payment', label: 'Pagamento', icon: CreditCard, color: 'text-chart-4' },
  { type: 'condition', label: 'Condição', icon: AlertTriangle, color: 'text-orange-500' },
  { type: 'group', label: 'Grupo', icon: Users, color: 'text-purple-500' },
  { type: 'webhook', label: 'Webhook', icon: Link, color: 'text-pink-500' },
  { type: 'delay', label: 'Atraso', icon: Clock, color: 'text-yellow-500' },
  { type: 'redirect', label: 'Redirecionar', icon: ArrowRight, color: 'text-blue-500' },
  { type: 'end', label: 'Final', icon: CheckCircle, color: 'text-chart-1' },
];

const STEP_TEMPLATES = {
  start: { icon: Bot, title: 'Início', config: { message: 'Bem-vindo ao fluxo!' } },
  message: { icon: MessageSquare, title: 'Mensagem', config: { text: '', buttons: [] } },
  image: { icon: Image, title: 'Imagem', config: { url: '', caption: '' } },
  payment: { icon: CreditCard, title: 'Pagamento', config: { amount: '', product: '', gateway: 'PIX' } },
  condition: { icon: AlertTriangle, title: 'Condição', config: { type: 'pagou', trueStep: '', falseStep: '' } },
  group: { icon: Users, title: 'Grupo', config: { groupId: '', action: 'add' } },
  webhook: { icon: Link, title: 'Webhook', config: { url: '', method: 'POST' } },
  delay: { icon: Clock, title: 'Atraso', config: { seconds: 60 } },
  redirect: { icon: ArrowRight, title: 'Redirecionar', config: { targetStep: '' } },
  end: { icon: CheckCircle, title: 'Final', config: { message: 'Fluxo finalizado!' } },
};

function Flows() {
  const { state, dispatch, addActivity, addNotification, helpers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'venda' });
  const [editingId, setEditingId] = useState(null);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [editedSteps, setEditedSteps] = useState(null);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [stepForm, setStepForm] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    if (editingId) {
      dispatch({ type: 'UPDATE_FLOW', payload: { id: editingId, data: { ...form, steps: steps.length } } });
      addActivity(`Fluxo ${form.name} atualizado`, 'info');
    } else {
      const newId = helpers.uid();
      dispatch({ type: 'ADD_FLOW', payload: { id: newId, ...form, steps: steps.length, nodes: [] } });
      addActivity(`Fluxo ${form.name} criado`, 'success');
      addNotification('Fluxo criado', `${form.name} foi adicionado.`);
    }
    setForm({ name: '', type: 'venda' });
    setEditingId(null);
    setShowForm(false);
    setSteps([]);
  };

  const handleEdit = (flow) => {
    setForm({ name: flow.name, type: flow.type });
    setEditingId(flow.id);
    setSteps(flow.nodes || []);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const flow = state.flows.find(f => f.id === id);
    dispatch({ type: 'DELETE_FLOW', payload: id });
    addActivity(`Fluxo ${flow.name} excluído`, 'warning');
  };

  const handleSelectFlow = (flow) => {
    setSelectedFlow(flow);
    setSteps(flow.nodes?.length > 0 ? flow.nodes : [
      { id: helpers.uid(), type: 'start', config: { message: 'Bem-vindo!' }, label: 'Início' },
      { id: helpers.uid(), type: 'message', config: { text: 'Confira nossos grupos VIP!', buttons: ['Ver catálogo', 'Falar com suporte'] }, label: 'Mensagem' },
      { id: helpers.uid(), type: 'payment', config: { amount: '29.90', product: 'Grupo VIP', gateway: 'PIX' }, label: 'Pagamento' },
      { id: helpers.uid(), type: 'group', config: { groupId: '', action: 'add' }, label: 'Grupo' },
      { id: helpers.uid(), type: 'end', config: { message: 'Acesso liberado com sucesso!' }, label: 'Final' },
    ]);
    setEditedSteps(null);
  };

  const handleAddNode = (type) => {
    const template = STEP_TEMPLATES[type];
    if (!template) return;
    const newStep = {
      id: helpers.uid(),
      type,
      config: { ...template.config },
      label: template.title,
    };
    const newSteps = [...steps];
    const insertAt = dragIdx !== null ? dragIdx : steps.length;
    newSteps.splice(insertAt + 1, 0, newStep);
    setSteps(newSteps);
    setShowNodePicker(false);
    setDragIdx(null);
  };

  const handleRemoveNode = (idx) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleMoveNode = (from, to) => {
    const newSteps = [...steps];
    const [removed] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, removed);
    setSteps(newSteps);
    setDragIdx(null);
  };

  const handleSaveFlow = () => {
    if (!selectedFlow) return;
    const flowData = { nodes: steps };
    dispatch({ type: 'UPDATE_FLOW', payload: { id: selectedFlow.id, data: flowData } });
    addActivity(`Fluxo ${selectedFlow.name} salvo`, 'success');
    addNotification('Fluxo salvo', `${selectedFlow.name} foi atualizado.`);
    setSelectedFlow(null);
    setSteps([]);
  };

  const handleEditStep = (idx) => {
    setEditingStep(idx);
    setStepForm({ ...steps[idx].config, label: steps[idx].label });
  };

  const handleSaveStep = () => {
    if (editingStep === null) return;
    const newSteps = [...steps];
    newSteps[editingStep] = { ...newSteps[editingStep], config: { ...stepForm }, label: stepForm.label || newSteps[editingStep].label };
    setSteps(newSteps);
    setEditingStep(null);
    setStepForm({});
  };

  const handleDuplicateFlow = (flow) => {
    const newId = helpers.uid();
    dispatch({ type: 'ADD_FLOW', payload: { ...flow, id: newId, name: flow.name + ' (cópia)' } });
    addActivity(`Fluxo ${flow.name} duplicado`, 'info');
  };

  const flowTemplates = ['venda', 'lead', 'suporte', 'remarketing'];
  const flowTypeLabels = { venda: '💰 Venda', lead: '🎯 Lead', suporte: '🛟 Suporte', remarketing: '🔄 Remarketing' };

  const NodeIcon = ({ type, size = 16, className = '' }) => {
    const nt = NODE_TYPES.find(n => n.type === type);
    if (!nt) return <MessageSquare size={size} className={className} />;
    const Icon = nt.icon;
    return <Icon size={size} className={`${nt.color} ${className}`} />;
  };

  return (
    <PageTransition>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <div className="sm:flex sm:justify-between sm:items-center mb-8 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl text-card-foreground font-bold">Fluxos de Vendas</h1>
            <p className="text-sm text-muted-foreground mt-1">Construtor visual de jornadas do cliente</p>
          </div>
          {selectedFlow ? (
            <div className="flex gap-2">
              <AnimatedButton onClick={() => { setSelectedFlow(null); setSteps([]); }}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold rounded-lg flex items-center gap-1"><X size={16} /> Voltar</AnimatedButton>
              <AnimatedButton onClick={handleSaveFlow}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg flex items-center gap-1"><Save size={16} /> Salvar Fluxo</AnimatedButton>
            </div>
          ) : (
            <AnimatedButton onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', type: 'venda' }); }}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg flex items-center gap-2"><Plus size={16} /> {showForm ? 'Cancelar' : 'Novo Fluxo'}</AnimatedButton>
          )}
        </div>

        {showForm && !selectedFlow && (
          <div className="bg-card rounded-xl border border-border p-6 mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-card-foreground mb-4">{editingId ? 'Editar Fluxo' : 'Novo Fluxo'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do fluxo"
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="px-4 py-2 rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                {flowTemplates.map(t => <option key={t} value={t}>{flowTypeLabels[t]}</option>)}
              </select>
              <AnimatedButton type="submit" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg whitespace-nowrap">
                {editingId ? 'Salvar' : 'Criar'}
              </AnimatedButton>
            </form>
          </div>
        )}

        {selectedFlow ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                    <NodeIcon type={steps[0]?.type} size={20} />
                    {selectedFlow.name}
                  </h2>
                  <span className="text-xs text-muted-foreground">{steps.length} etapas</span>
                </div>

                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                      {editingStep === idx ? (
                        <div className="bg-muted border border-border rounded-xl p-4">
                          <h4 className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
                            <NodeIcon type={step.type} size={16} />
                            Editar: {step.label}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Nome da etapa</label>
                              <input value={stepForm.label || ''} onChange={e => setStepForm({ ...stepForm, label: e.target.value })}
                                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                            </div>
                            {step.type === 'message' && (
                              <div className="md:col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1">Texto da mensagem</label>
                                <textarea value={stepForm.text || ''} onChange={e => setStepForm({ ...stepForm, text: e.target.value })} rows={3}
                                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none resize-none" />
                              </div>
                            )}
                            {step.type === 'payment' && (
                              <>
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1">Valor (R$)</label>
                                  <input value={stepForm.amount || ''} onChange={e => setStepForm({ ...stepForm, amount: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                                </div>
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1">Produto</label>
                                  <input value={stepForm.product || ''} onChange={e => setStepForm({ ...stepForm, product: e.target.value })}
                                    className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                                </div>
                              </>
                            )}
                            {step.type === 'group' && (
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Grupo</label>
                                <select value={stepForm.groupId || ''} onChange={e => setStepForm({ ...stepForm, groupId: e.target.value })}
                                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none">
                                  <option value="">Selecione...</option>
                                  {state.groups.filter(g => g.active).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                              </div>
                            )}
                            {step.type === 'delay' && (
                              <div>
                                <label className="block text-xs text-muted-foreground mb-1">Segundos de atraso</label>
                                <input type="number" value={stepForm.seconds || 60} onChange={e => setStepForm({ ...stepForm, seconds: parseInt(e.target.value) || 60 })}
                                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-input text-foreground focus:ring-2 focus:ring-ring outline-none" />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <AnimatedButton onClick={handleSaveStep} className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg">Concluído</AnimatedButton>
                            <button onClick={() => setEditingStep(null)} className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-lg">Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          draggable
                          onDragStart={() => setDragIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => { if (dragIdx !== null && dragIdx !== idx) handleMoveNode(dragIdx, idx); }}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${dragIdx === idx ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                          <div className="cursor-grab text-muted-foreground hover:text-foreground">
                            <GripVertical size={16} />
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <NodeIcon type={step.type} size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-card-foreground truncate">{step.label}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {step.type === 'start' && 'Início do fluxo'}
                              {step.type === 'message' && (step.config.text || 'Mensagem de texto')}
                              {step.type === 'image' && 'Envio de imagem'}
                              {step.type === 'payment' && `Cobrança de R$ ${step.config.amount || '0,00'}`}
                              {step.type === 'condition' && `Condição: ${step.config.type}`}
                              {step.type === 'group' && 'Liberar grupo'}
                              {step.type === 'webhook' && `Webhook: ${step.config.url || 'configurar'}`}
                              {step.type === 'delay' && `Aguardar ${step.config.seconds || 60}s`}
                              {step.type === 'redirect' && `Ir para etapa`}
                              {step.type === 'end' && 'Final do fluxo'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEditStep(idx)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Settings size={14} /></button>
                            <button onClick={() => handleRemoveNode(idx)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      )}
                      {idx < steps.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowRight size={16} className="text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  {showNodePicker ? (
                    <div className="bg-muted rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-card-foreground">Adicionar etapa</h4>
                        <button onClick={() => { setShowNodePicker(false); setDragIdx(null); }} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {NODE_TYPES.map(nt => {
                          const Icon = nt.icon;
                          return (
                            <button key={nt.type} onClick={() => handleAddNode(nt.type)}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
                              <Icon size={20} className={nt.color} />
                              <span className="text-xs text-card-foreground">{nt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <AnimatedButton onClick={() => { setShowNodePicker(true); setDragIdx(steps.length - 1); }}
                      className="w-full py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border-2 border-dashed border-border hover:border-primary/50">
                      <Plus size={16} /> Adicionar Etapa
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <h3 className="text-sm font-bold text-card-foreground mb-3">Informações</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Fluxo:</span><span className="text-card-foreground">{selectedFlow.name}</span></div>
                  <div className="flex justify-between"><span>Tipo:</span><span className="text-card-foreground">{flowTypeLabels[selectedFlow.type]}</span></div>
                  <div className="flex justify-between"><span>Etapas:</span><span className="text-card-foreground">{steps.length}</span></div>
                  <div className="flex justify-between"><span>Status:</span><span className="text-chart-1">Rascunho</span></div>
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <h3 className="text-sm font-bold text-card-foreground mb-3">Legenda</h3>
                <div className="space-y-1.5">
                  {NODE_TYPES.map(nt => {
                    const Icon = nt.icon;
                    return (
                      <div key={nt.type} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon size={12} className={nt.color} /> {nt.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {state.flows.length === 0 ? (
                <div className="lg:col-span-2 bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
                  <Bot size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Nenhum fluxo de venda criado.</p>
                  <p className="text-xs text-muted-foreground mb-4">Crie fluxos automatizados para vender acesso a grupos, capturar leads e muito mais.</p>
                  <AnimatedButton onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg">Criar Primeiro Fluxo</AnimatedButton>
                </div>
              ) : state.flows.map((flow, i) => {
                const flowType = flowTypeLabels[flow.type] || flow.type;
                const nodes = flow.nodes || [];
                return (
                  <div key={flow.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <AnimatedCard className="bg-card rounded-xl border border-border p-6 shadow-sm h-full hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => handleSelectFlow(flow)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            {flow.type === 'venda' ? <ShoppingBag size={20} className="text-chart-1" /> :
                             flow.type === 'lead' ? <Target size={20} className="text-chart-2" /> :
                             flow.type === 'suporte' ? <MessageSquare size={20} className="text-chart-3" /> :
                             <RefreshCw size={20} className="text-chart-4" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">{flow.name}</h3>
                            <span className="text-xs text-muted-foreground">{flowType}</span>
                          </div>
                        </div>
                        <ArrowRight size={20} className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        {nodes.length > 0 ? nodes.slice(0, 4).map((n, ni) => (
                          <div key={n.id || ni} className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md">
                            <NodeIcon type={n.type} size={12} />
                            <span className="text-[10px] text-muted-foreground">{n.label || n.type}</span>
                          </div>
                        )) : (
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"><Bot size={12} className="text-chart-1" /><span className="text-[10px] text-muted-foreground">Início</span></div>
                            <ArrowRight size={12} className="text-muted-foreground/50" />
                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"><MessageSquare size={12} className="text-chart-2" /><span className="text-[10px] text-muted-foreground">Mensagem</span></div>
                            <ArrowRight size={12} className="text-muted-foreground/50" />
                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"><CreditCard size={12} className="text-chart-4" /><span className="text-[10px] text-muted-foreground">Pagamento</span></div>
                            <ArrowRight size={12} className="text-muted-foreground/50" />
                            <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md"><Unlock size={12} className="text-chart-3" /><span className="text-[10px] text-muted-foreground">Acesso</span></div>
                          </div>
                        )}
                        {nodes.length > 4 && <span className="text-[10px] text-muted-foreground">+{nodes.length - 4}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
                        <span>{flow.steps || nodes.length || 0} etapas</span>
                        {flow.criadoEm && <span>Criado {helpers.formatDate(flow.criadoEm)}</span>}
                      </div>
                      <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleEdit(flow)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg flex items-center gap-1"><Settings size={12} /> Editar</button>
                        <button onClick={() => handleDuplicateFlow(flow)} className="px-3 py-1.5 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg flex items-center gap-1"><Copy size={12} /> Duplicar</button>
                        <button onClick={() => handleDelete(flow.id)} className="px-3 py-1.5 text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg flex items-center gap-1 ml-auto"><Trash2 size={12} /> Excluir</button>
                      </div>
                    </AnimatedCard>
                  </div>
                );
              })}
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm animate-fade-in">
              <h2 className="text-lg font-bold text-card-foreground mb-4">Tipos de Fluxo</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { type: 'venda', icon: ShoppingBag, label: 'Venda', desc: 'Venda de acesso a grupos e conteúdo automaticamente', color: 'text-chart-1' },
                  { type: 'lead', icon: Target, label: 'Captura de Leads', desc: 'Colete contatos e qualifique leads', color: 'text-chart-2' },
                  { type: 'suporte', icon: MessageSquare, label: 'Suporte', desc: 'Atendimento automatizado com bot', color: 'text-chart-3' },
                  { type: 'remarketing', icon: RefreshCw, label: 'Remarketing', desc: 'Recupereclientesque nãocompraram', color: 'text-chart-4' },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.type} className="p-4 border border-border rounded-lg bg-muted/30 hover:border-primary/30 transition-all animate-fade-in cursor-pointer"
                      style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() => { setForm({ name: '', type: f.type }); setShowForm(true); }}>
                      <Icon size={24} className={`mb-2 ${f.color}`} />
                      <div className="font-medium text-card-foreground">{f.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
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

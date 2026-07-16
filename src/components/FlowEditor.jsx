import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, MessageSquare, CreditCard, Users, Link, Clock, CheckCircle, AlertTriangle, ArrowRight, ImageIcon, X, GripVertical, Settings, Trash2, Save } from 'lucide-react';

const nodeTypesConfig = {
  start: { label: 'Início', icon: Play, color: '#3B82F6', inputs: 0, outputs: 1 },
  message: { label: 'Mensagem', icon: MessageSquare, color: '#22c55e', inputs: 1, outputs: 1 },
  image: { label: 'Imagem', icon: ImageIcon, color: '#a855f7', inputs: 1, outputs: 1 },
  payment: { label: 'Pagamento', icon: CreditCard, color: '#f59e0b', inputs: 1, outputs: 1 },
  condition: { label: 'Condição', icon: AlertTriangle, color: '#f97316', inputs: 1, outputs: 2 },
  group: { label: 'Grupo', icon: Users, color: '#06b6d4', inputs: 1, outputs: 1 },
  webhook: { label: 'Webhook', icon: Link, color: '#ec4899', inputs: 1, outputs: 1 },
  delay: { label: 'Atraso', icon: Clock, color: '#eab308', inputs: 1, outputs: 1 },
  redirect: { label: 'Redirecionar', icon: ArrowRight, color: '#6366f1', inputs: 1, outputs: 1 },
  end: { label: 'Final', icon: CheckCircle, color: '#3B82F6', inputs: 1, outputs: 0 },
};

const defaultConfig = {
  start: { message: 'Bem-vindo ao fluxo!' },
  message: { text: '', buttons: [] },
  image: { url: '', caption: '' },
  payment: { amount: '', product: '', gateway: 'PIX' },
  condition: { type: 'pagou' },
  group: { groupId: '', action: 'add' },
  webhook: { url: '', method: 'POST' },
  delay: { seconds: 60 },
  redirect: { targetStep: '' },
  end: { message: 'Fluxo finalizado!' },
};

function CustomNode({ id, data, selected }) {
  const config = nodeTypesConfig[data.nodeType] || nodeTypesConfig.message;
  const Icon = config.icon;
  const hasError = data.nodeType === 'payment' && (!data.config?.amount || !data.config?.product);
  const isComplete = data.nodeType === 'end' || (data.nodeType === 'message' && data.config?.text);

  return (
    <div className={`relative rounded-xl border transition-all duration-200 min-w-[200px] ${
      selected ? 'border-[var(--brand-500)] shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-white/[0.08]'
    } ${hasError ? 'border-red-500/50' : ''}`}
      style={{ background: 'rgba(20,20,25,0.95)' }}>
      {config.inputs > 0 && (
        <Handle type="target" position={Position.Left}
          className="!w-3 !h-3 !border-2 !border-[#050505] !bg-[var(--brand-500)]" />
      )}
      {Array.from({ length: config.outputs }).map((_, i) => (
        <Handle key={i} type="source" position={Position.Right}
          style={{ top: `${((i + 1) * 100) / (config.outputs + 1)}%` }}
          className="!w-3 !h-3 !border-2 !border-[#050505] !bg-[var(--brand-500)]" />
      ))}

      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${config.color}20` }}>
          <Icon size={14} style={{ color: config.color }} />
        </div>
        <span className="text-xs font-semibold text-white">{data.label || config.label}</span>
      </div>

      <div className="px-3.5 py-2.5">
        {data.nodeType === 'start' && <p className="text-[11px] text-[#a1a1aa]">{data.config?.message || 'Início'}</p>}
        {data.nodeType === 'message' && (
          <p className="text-[11px] text-[#a1a1aa] truncate max-w-[180px]">{data.config?.text || 'Clique para editar'}</p>
        )}
        {data.nodeType === 'payment' && (
          <div className="space-y-0.5">
            <p className="text-[11px] text-[#a1a1aa]">{data.config?.product || 'Produto não definido'}</p>
            {data.config?.amount && <p className="text-xs font-semibold text-[#f59e0b]">R$ {data.config.amount}</p>}
          </div>
        )}
        {data.nodeType === 'group' && <p className="text-[11px] text-[#a1a1aa]">{data.config?.groupId ? 'Grupo configurado' : 'Selecionar grupo'}</p>}
        {data.nodeType === 'delay' && <p className="text-[11px] text-[#a1a1aa]">{data.config?.seconds || 60}s de atraso</p>}
        {data.nodeType === 'condition' && <p className="text-[11px] text-[#a1a1aa]">Pagou / Não pagou</p>}
        {data.nodeType === 'end' && <p className="text-[11px] text-[#a1a1aa]">{data.config?.message || 'Finalizado'}</p>}
        {data.nodeType === 'webhook' && <p className="text-[11px] text-[#a1a1aa] truncate max-w-[180px]">{data.config?.url || 'URL não definida'}</p>}
        {data.nodeType === 'image' && <p className="text-[11px] text-[#a1a1aa]">{data.config?.url ? 'Imagem configurada' : 'Adicionar imagem'}</p>}
        {data.nodeType === 'redirect' && <p className="text-[11px] text-[#a1a1aa]">Redirecionar etapa</p>}
      </div>

      {isComplete && (
        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle size={8} className="text-white" />
        </div>
      )}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

const defaultEdgeOptions = {
  style: { stroke: 'rgba(59, 130, 246, 0.3)', strokeWidth: 2 },
  type: 'smoothstep',
  animated: true,
};

function FlowEditorCanvas({ flow, onSave, onBack }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConfig, setNodeConfig] = useState({});
  const [rfInstance, setRfInstance] = useState(null);

  useEffect(() => {
    if (flow?.nodes?.length > 0) {
      setNodes(flow.nodes);
      setEdges(flow.edges || []);
    } else {
      const startNode = {
        id: 'start',
        type: 'custom',
        position: { x: 50, y: 200 },
        data: { nodeType: 'start', label: 'Início', config: { message: 'Bem-vindo!' } },
      };
      const msgNode = {
        id: 'msg-1',
        type: 'custom',
        position: { x: 350, y: 200 },
        data: { nodeType: 'message', label: 'Mensagem', config: { text: 'Confira nossos grupos VIP!', buttons: ['Ver catálogo'] } },
      };
      setNodes([startNode, msgNode]);
      setEdges([{ id: 'e-start-msg', source: 'start', target: 'msg-1', ...defaultEdgeOptions }]);
    }
  }, [flow?.id]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
  }, [setEdges]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !nodeTypesConfig[type]) return;
    const position = rfInstance?.screenToFlowPosition({ x: event.clientX, y: event.clientY }) || { x: 0, y: 0 };
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type: 'custom',
      position,
      data: { nodeType: type, label: nodeTypesConfig[type].label, config: { ...defaultConfig[type] } },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [rfInstance, setNodes]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
    setNodeConfig({ ...node.data.config, label: node.data.label });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSaveNodeConfig = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.map((n) => {
      if (n.id === selectedNode.id) {
        return { ...n, data: { ...n.data, config: { ...nodeConfig }, label: nodeConfig.label || n.data.label } };
      }
      return n;
    }));
    setSelectedNode(null);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  };

  const handleSave = () => {
    if (!flow) return;
    onSave({ ...flow, nodes, edges });
  };

  const handleExportToLinear = () => {
    const sorted = topologicalSort(nodes, edges);
    onSave({ ...flow, nodes: sorted, edges, linearSteps: sorted.map((n, i) => ({
      id: n.id,
      type: n.data.nodeType,
      config: n.data.config,
      label: n.data.label,
      order: i,
    })) });
    onBack();
  };

  return (
    <div className="flex gap-0 h-[calc(100vh-180px)] min-h-[500px]">
      <div className="w-[220px] shrink-0 bg-white/[0.02] border-r border-white/[0.06] p-3 overflow-y-auto">
        <h3 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3 px-2">Nós</h3>
        <div className="space-y-1">
          {Object.entries(nodeTypesConfig).map(([type, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', type);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all text-sm"
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${cfg.color}20` }}>
                  <Icon size={12} style={{ color: cfg.color }} />
                </div>
                <span>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          minZoom={0.3}
          maxZoom={2}
          deleteKeyCode={['Backspace', 'Delete']}
          style={{ background: '#0a0a0f' }}
        >
          <Background color="rgba(255,255,255,0.03)" gap={24} />
          <Controls className="!bg-[#1a1a22] !border-white/[0.06] !rounded-xl [&_button]:!text-[#a1a1aa] [&_button]:!border-white/[0.06] [&_button:hover]:!bg-white/[0.06]" />
          <MiniMap
            nodeColor={() => 'rgba(59,130,246,0.3)'}
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: '#1a1a22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
          />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="w-[280px] shrink-0 bg-white/[0.02] border-l border-white/[0.06] p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Configurar</h3>
            <button onClick={() => setSelectedNode(null)} className="text-[#a1a1aa] hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#a1a1aa] mb-1">Nome</label>
              <input value={nodeConfig.label || ''} onChange={e => setNodeConfig({ ...nodeConfig, label: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
            </div>

            {selectedNode.data.nodeType === 'message' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">Texto da mensagem</label>
                <textarea value={nodeConfig.text || ''} onChange={e => setNodeConfig({ ...nodeConfig, text: e.target.value })} rows={4}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none resize-none" />
              </div>
            )}

            {selectedNode.data.nodeType === 'payment' && (
              <>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1">Produto</label>
                  <input value={nodeConfig.product || ''} onChange={e => setNodeConfig({ ...nodeConfig, product: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1">Valor (R$)</label>
                  <input value={nodeConfig.amount || ''} onChange={e => setNodeConfig({ ...nodeConfig, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1">Gateway</label>
                  <select value={nodeConfig.gateway || 'PIX'} onChange={e => setNodeConfig({ ...nodeConfig, gateway: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none">
                    <option>PIX</option>
                    <option>Cartão</option>
                  </select>
                </div>
              </>
            )}

            {selectedNode.data.nodeType === 'group' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">Grupo</label>
                <input value={nodeConfig.groupId || ''} onChange={e => setNodeConfig({ ...nodeConfig, groupId: e.target.value })}
                  placeholder="ID do grupo"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
              </div>
            )}

            {selectedNode.data.nodeType === 'delay' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">Atraso (segundos)</label>
                <input type="number" value={nodeConfig.seconds || 60} onChange={e => setNodeConfig({ ...nodeConfig, seconds: parseInt(e.target.value) || 60 })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
              </div>
            )}

            {selectedNode.data.nodeType === 'webhook' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">URL do Webhook</label>
                <input value={nodeConfig.url || ''} onChange={e => setNodeConfig({ ...nodeConfig, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
              </div>
            )}

            {selectedNode.data.nodeType === 'start' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">Mensagem inicial</label>
                <textarea value={nodeConfig.message || ''} onChange={e => setNodeConfig({ ...nodeConfig, message: e.target.value })} rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none resize-none" />
              </div>
            )}

            {selectedNode.data.nodeType === 'end' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">Mensagem final</label>
                <textarea value={nodeConfig.message || ''} onChange={e => setNodeConfig({ ...nodeConfig, message: e.target.value })} rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none resize-none" />
              </div>
            )}

            {selectedNode.data.nodeType === 'image' && (
              <>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1">URL da imagem</label>
                  <input value={nodeConfig.url || ''} onChange={e => setNodeConfig({ ...nodeConfig, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#a1a1aa] mb-1">Legenda</label>
                  <input value={nodeConfig.caption || ''} onChange={e => setNodeConfig({ ...nodeConfig, caption: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
                </div>
              </>
            )}

            {selectedNode.data.nodeType === 'redirect' && (
              <div>
                <label className="block text-[11px] text-[#a1a1aa] mb-1">Etapa destino</label>
                <input value={nodeConfig.targetStep || ''} onChange={e => setNodeConfig({ ...nodeConfig, targetStep: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.04] border border-white/[0.08] text-white focus:ring-1 focus:ring-[var(--brand-500)] outline-none" />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={handleSaveNodeConfig}
              className="flex-1 px-3 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5">
              <Save size={12} /> Aplicar
            </button>
            <button onClick={handleDeleteNode}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5">
              <Trash2 size={12} /> Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function topologicalSort(nodes, edges) {
  const adj = {};
  const inDeg = {};
  nodes.forEach(n => { adj[n.id] = []; inDeg[n.id] = 0; });
  edges.forEach(e => { adj[e.source]?.push(e.target); inDeg[e.target] = (inDeg[e.target] || 0) + 1; });
  const queue = nodes.filter(n => !inDeg[n.id]).map(n => n.id);
  const sorted = [];
  while (queue.length) {
    const u = queue.shift();
    const node = nodes.find(n => n.id === u);
    if (node) sorted.push(node);
    adj[u]?.forEach(v => { inDeg[v]--; if (!inDeg[v]) queue.push(v); });
  }
  nodes.forEach(n => { if (!sorted.find(s => s.id === n.id)) sorted.push(n); });
  return sorted;
}

function FlowEditor({ flow, onSave, onBack }) {
  return (
    <ReactFlowProvider>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0a0a0f]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-[#a1a1aa] hover:text-white transition-colors">
            <X size={18} />
          </button>
          <h2 className="text-sm font-semibold text-white">{flow?.name || 'Novo Fluxo'}</h2>
        </div>
        <button onClick={() => {
          if (!flow) return;
          const sorted = topologicalSort(
            flow.nodes || [],
            flow.edges || []
          );
          onSave({ ...flow, nodes: sorted, edges: flow.edges || [], linearSteps: sorted.map((n, i) => ({
            id: n.id,
            type: n.data.nodeType,
            config: n.data.config,
            label: n.data.label,
            order: i,
          })) });
          onBack();
        }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white text-xs font-semibold rounded-lg transition-all">
          <Save size={14} /> Salvar Fluxo
        </button>
      </div>
      <FlowEditorCanvas flow={flow} onSave={onSave} onBack={onBack} />
    </ReactFlowProvider>
  );
}

export { FlowEditor, topologicalSort };

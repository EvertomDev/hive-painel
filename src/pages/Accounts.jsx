import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard } from '../components/ui/AnimatedContainer';
import { PlatformIcon, getPlatformMeta } from '../components/accounts/PlatformIcon';
import { AccountModal } from '../components/accounts/AccountModal';
import { AccountWebView } from '../components/accounts/AccountWebView';
import { SearchInput } from '../components/shared/SearchInput';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Search, Plus, Star, X, Edit2, Trash2, Filter, Folder, Heart, MessageCircle, ExternalLink, CheckSquare, Square, ChevronDown, ChevronRight, Clock, Activity, Tag, Copy, CheckCheck } from 'lucide-react';

const platforms = [
  { key: 'all', label: 'Todas' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'discord', label: 'Discord' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X' },
];

const statusLabels = {
  online: { text: 'Online', color: 'bg-chart-1' },
  offline: { text: 'Offline', color: 'bg-muted-foreground' },
  connecting: { text: 'Conectando', color: 'bg-chart-3' },
};

function Accounts() {
  const { state, dispatch, addActivity } = useApp();
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [openAccounts, setOpenAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [modalAccount, setModalAccount] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());
  const [showTimeline, setShowTimeline] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(state.accounts.map(a => a.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [state.accounts]);

  const filteredAccounts = useMemo(() => {
    return state.accounts.filter(a => {
      const matchesSearch = (a.name + ' ' + a.identifier + ' ' + a.tags.join(' ')).toLowerCase().includes(search.toLowerCase());
      const matchesPlatform = filterPlatform === 'all' || a.platform === filterPlatform;
      const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
      const matchesFavorite = !showFavorites || a.favorite;
      return matchesSearch && matchesPlatform && matchesCategory && matchesFavorite;
    });
  }, [state.accounts, search, filterPlatform, filterCategory, showFavorites]);

  const groupedAccounts = useMemo(() => {
    const groups = {};
    filteredAccounts.forEach(a => {
      const cat = a.category || 'Sem categoria';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    });
    const order = ['Favoritos', 'Suporte', 'Vendas', 'Marketing', 'Pessoal'];
    return Object.entries(groups).sort(([a], [b]) => {
      const ia = order.indexOf(a), ib = order.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [filteredAccounts]);

  const openAccount = (account) => {
    if (!openAccounts.find(o => o.id === account.id)) {
      setOpenAccounts([...openAccounts, account]);
    }
    setActiveTab(account.id);
  };

  const closeAccount = (id, e) => {
    e?.stopPropagation();
    const next = openAccounts.filter(o => o.id !== id);
    setOpenAccounts(next);
    if (activeTab === id) setActiveTab(next.length ? next[next.length - 1].id : null);
  };

  const handleDelete = (account) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: account.id });
    addActivity(`Conta ${account.name} removida`, 'warning');
    setOpenAccounts(openAccounts.filter(o => o.id !== account.id));
    if (activeTab === account.id) setActiveTab(null);
    setConfirmDelete(null);
  };

  const handleToggleFavorite = (account, e) => {
    e?.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE_ACCOUNT', payload: account.id });
  };

  const handleOpenExternal = (account, e) => {
    e?.stopPropagation();
    window.open(getPlatformMeta(account.platform).url, '_blank');
  };

  const toggleBulk = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAccounts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAccounts.map(a => a.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => {
      dispatch({ type: 'DELETE_ACCOUNT', payload: id });
    });
    addActivity(`${selectedIds.size} conta(s) removidas em lote`, 'warning');
    setOpenAccounts(openAccounts.filter(o => !selectedIds.has(o.id)));
    setSelectedIds(new Set());
    setBulkMode(false);
  };

  const handleCopyIdentifier = (text, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    addActivity('Identificador copiado', 'success');
  };

  const toggleCategory = (cat) => {
    const next = new Set(collapsedCategories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setCollapsedCategories(next);
  };

  const favoriteAccounts = filteredAccounts.filter(a => a.favorite);

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <div className="w-80 flex flex-col border-r border-border bg-card shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-card-foreground">Contas Integradas</h1>
                <p className="text-xs text-muted-foreground">{state.accounts.length} conta(s) ÔÇó {state.accounts.filter(a => a.status === 'online').length} online</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setBulkMode(!bulkMode)} className={`p-2 rounded-lg transition-colors ${bulkMode ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`} title="Modo lote">
                  <CheckSquare size={18} />
                </button>
                <button onClick={() => setModalAccount({})} className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors" title="Adicionar conta">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar contas..." className="mb-3" />

            <div className="flex flex-wrap gap-2">
              <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="px-2 py-1.5 rounded-lg bg-background border border-input text-xs text-foreground focus:ring-2 focus:ring-ring outline-none">
                {platforms.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-2 py-1.5 rounded-lg bg-background border border-input text-xs text-foreground focus:ring-2 focus:ring-ring outline-none">
                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Todas categorias' : c}</option>)}
              </select>
              <button onClick={() => setShowFavorites(!showFavorites)} className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${showFavorites ? 'bg-chart-1/15 text-chart-1' : 'bg-background border border-input text-muted-foreground'}`}>
                <Star size={12} className={showFavorites ? 'fill-current' : ''} />
                Favoritos
              </button>
            </div>
          </div>

          {bulkMode && selectedIds.size > 0 && (
            <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between animate-fade-in">
              <span className="text-xs font-medium text-primary">{selectedIds.size} selecionada(s)</span>
              <div className="flex gap-1">
                <button onClick={() => setConfirmDelete({ bulk: true })} className="px-2 py-1 text-xs font-medium bg-destructive/15 text-destructive rounded-md hover:bg-destructive/25 transition-colors">
                  <Trash2 size={12} className="inline mr-1" />Excluir
                </button>
                <button onClick={() => { setSelectedIds(new Set()); setBulkMode(false); }} className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors">
                  <X size={12} className="inline mr-1" />Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {bulkMode && (
              <button onClick={toggleSelectAll} className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
                {selectedIds.size === filteredAccounts.length ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
                {selectedIds.size === filteredAccounts.length ? 'Desmarcar todas' : `Selecionar todas (${filteredAccounts.length})`}
              </button>
            )}

            {filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                Nenhuma conta encontrada
                <button onClick={() => { setSearch(''); setFilterPlatform('all'); setFilterCategory('all'); setShowFavorites(false); }} className="block mx-auto mt-2 text-xs text-primary hover:underline">Limpar filtros</button>
              </div>
            ) : (
              groupedAccounts.map(([category, accounts]) => (
                <div key={category}>
                  <button onClick={() => toggleCategory(category)} className="flex items-center gap-2 px-2 py-1.5 w-full text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
                    {collapsedCategories.has(category) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    <Folder size={12} />
                    {category === 'Sem categoria' ? 'Sem categoria' : category}
                    <span className="ml-auto text-[10px] font-normal opacity-60">{accounts.length}</span>
                  </button>
                  {!collapsedCategories.has(category) && (
                    <div className="space-y-1.5 mt-1">
                      {accounts.map(account => (
                        <div key={account.id} className="group relative">
                          <div onClick={() => { if (!bulkMode) openAccount(account); }} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeTab === account.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-muted/50'} ${bulkMode ? 'pl-10' : ''}`}>
                            {bulkMode && (
                              <button onClick={(e) => { e.stopPropagation(); toggleBulk(account.id); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                {selectedIds.has(account.id) ? <CheckSquare size={16} className="text-primary" /> : <Square size={16} />}
                              </button>
                            )}
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                {account.photo ? (
                                  <img src={account.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <PlatformIcon platform={account.platform} size={20} />
                                )}
                              </div>
                              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${statusLabels[account.status]?.color || 'bg-muted-foreground'}`}></span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-semibold text-card-foreground truncate">{account.name}</h3>
                                {account.favorite && <Star size={12} className="text-chart-1 fill-current shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                {account.identifier}
                                <button onClick={e => handleCopyIdentifier(account.identifier, e)} className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-all">
                                  <Copy size={10} />
                                </button>
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{getPlatformMeta(account.platform).label}</span>
                                {account.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{account.category}</span>}
                                {account.notes && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-chart-3/10 text-chart-3" title={account.notes}>!</span>}
                              </div>
                            </div>
                            {!bulkMode && (
                              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={e => handleToggleFavorite(account, e)} className="p-1 text-muted-foreground hover:text-chart-1 hover:bg-muted rounded transition-colors">
                                  <Star size={14} className={account.favorite ? 'fill-current text-chart-1' : ''} />
                                </button>
                                <button onClick={e => { e.stopPropagation(); setModalAccount(account); }} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={e => { e.stopPropagation(); setConfirmDelete(account); }} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors">
                                  <Trash2 size={14} />
                                </button>
                                <button onClick={e => handleOpenExternal(account, e)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                                  <ExternalLink size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                          {showTimeline === account.id && (
                            <div className="ml-13 mt-1 pl-4 border-l-2 border-border/50 space-y-1.5 py-2 animate-fade-in">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Activity size={10} />
                                Criada em {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Tag size={10} />
                                Tags: {account.tags?.join(', ') || 'nenhuma'}
                              </div>
                              {account.notes && (
                                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <MessageCircle size={10} className="mt-0.5" />
                                  {account.notes}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {openAccounts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Central de Contas"
              description="Selecione uma conta na barra lateral para abrir a plataforma integrada, ou adicione uma nova conta."
              action={
                <button onClick={() => setModalAccount({})} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
                  <Plus size={18} />
                  Adicionar Conta
                </button>
              }
            />
          ) : (
            <>
              <div className="flex items-center gap-1 px-2 py-2 border-b border-border bg-card overflow-x-auto">
                {openAccounts.map(account => {
                  const meta = getPlatformMeta(account.platform);
                  const isActive = activeTab === account.id;
                  return (
                    <button key={account.id} onClick={() => setActiveTab(account.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                      <span style={{ color: isActive ? 'currentColor' : meta.color }}>
                        <PlatformIcon platform={account.platform} size={14} />
                      </span>
                      <span className="truncate max-w-[120px]">{account.name}</span>
                      <span onClick={e => closeAccount(account.id, e)} className="ml-1 p-0.5 hover:bg-black/10 rounded transition-colors">
                        <X size={12} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 p-4 min-h-0">
                {openAccounts.map(account => (
                  <div key={account.id} className={`h-full ${activeTab === account.id ? 'block' : 'hidden'}`}>
                    <AccountWebView account={account} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {modalAccount !== null && (
        <AccountModal account={modalAccount.id ? modalAccount : null} onClose={() => setModalAccount(null)} />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete?.bulk ? `Excluir ${selectedIds.size} contas?` : `Excluir ${confirmDelete?.name}?`}
        message={confirmDelete?.bulk ? `Tem certeza que deseja excluir ${selectedIds.size} contas? Esta a├º├úo n├úo pode ser desfeita.` : `Tem certeza que deseja excluir a conta ${confirmDelete?.name}? Esta a├º├úo n├úo pode ser desfeita.`}
        variant="danger"
        confirmLabel={confirmDelete?.bulk ? `Excluir ${selectedIds.size}` : 'Excluir'}
        onConfirm={() => confirmDelete?.bulk ? handleBulkDelete() : handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </PageTransition>
  );
}

export default Accounts;

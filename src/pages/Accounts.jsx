import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PageTransition, AnimatedCard } from '../components/ui/AnimatedContainer';
import { PlatformIcon, getPlatformMeta } from '../components/accounts/PlatformIcon';
import { AccountModal } from '../components/accounts/AccountModal';
import { AccountWebView } from '../components/accounts/AccountWebView';
import { Search, Plus, Star, X, Edit2, Trash2, Filter, Folder, Heart, MessageCircle, ExternalLink } from 'lucide-react';

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
    if (activeTab === id) {
      setActiveTab(next.length ? next[next.length - 1].id : null);
    }
  };

  const handleDelete = (account) => {
    if (!window.confirm(`Tem certeza que deseja excluir a conta ${account.name}?`)) return;
    dispatch({ type: 'DELETE_ACCOUNT', payload: account.id });
    addActivity(`Conta ${account.name} removida`, 'warning');
    setOpenAccounts(openAccounts.filter(o => o.id !== account.id));
    if (activeTab === account.id) setActiveTab(null);
  };

  const handleToggleFavorite = (account, e) => {
    e?.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE_ACCOUNT', payload: account.id });
  };

  const handleOpenExternal = (account, e) => {
    e?.stopPropagation();
    window.open(getPlatformMeta(account.platform).url, '_blank');
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar de contas */}
        <div className="w-80 flex flex-col border-r border-border bg-card shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-card-foreground">Contas Integradas</h1>
                <p className="text-xs text-muted-foreground">{state.accounts.length} conta(s) cadastrada(s)</p>
              </div>
              <button onClick={() => setModalAccount({})} className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors" title="Adicionar conta">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar contas..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-input text-sm text-foreground focus:ring-2 focus:ring-ring outline-none transition-all" />
            </div>

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

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                Nenhuma conta encontrada
              </div>
            ) : filteredAccounts.map(account => (
              <div
                key={account.id}
                onClick={() => openAccount(account)}
                className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${activeTab === account.id ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:bg-muted/50'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                    {account.photo ? (
                      <img src={account.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <PlatformIcon platform={account.platform} size={20} />
                    )}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${statusLabels[account.status].color}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-card-foreground truncate">{account.name}</h3>
                    {account.favorite && <Star size={12} className="text-chart-1 fill-current shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{account.identifier}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{getPlatformMeta(account.platform).label}</span>
                    {account.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{account.category}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => handleToggleFavorite(account, e)} className="p-1 text-muted-foreground hover:text-chart-1 hover:bg-muted rounded transition-colors">
                    <Star size={14} className={account.favorite ? 'fill-current text-chart-1' : ''} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setModalAccount(account); }} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={e => handleOpenExternal(account, e)} className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área principal com abas */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {openAccounts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <AnimatedCard className="max-w-md text-center p-8 bg-card rounded-2xl border border-border shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-card-foreground mb-2">Central de Contas</h2>
                <p className="text-sm text-muted-foreground mb-6">Selecione uma conta na barra lateral para abrir a plataforma integrada, ou adicione uma nova conta.</p>
                <button onClick={() => setModalAccount({})} className="px-5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
                  <Plus size={18} />
                  Adicionar Conta
                </button>
              </AnimatedCard>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-1 px-2 py-2 border-b border-border bg-card overflow-x-auto">
                {openAccounts.map(account => {
                  const meta = getPlatformMeta(account.platform);
                  const isActive = activeTab === account.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => setActiveTab(account.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
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

              {/* WebView */}
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
    </PageTransition>
  );
}

export default Accounts;

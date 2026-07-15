import React, { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'zeze-dashboard-data';

const today = () => new Date().toISOString().split('T')[0];
const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

const initialState = {
  user: { name: 'Zeze Admin', email: 'admin@zeze.com', plan: 'PRO' },
  config: {
    webhook: 'https://zeze.com.br/webhook',
    defaultGateway: 'PushinPay',
    pixDiscount: 0,
  },
  bots: [],
  clients: [],
  sales: [],
  activities: [],
  notifications: [
    { id: uid(), title: 'Bem-vindo ao Zeze', message: 'Configure seu primeiro bot para começar.', read: false, time: new Date().toISOString() },
  ],
  gateways: [
    { name: 'PushinPay', connected: true, type: 'PIX' },
    { name: 'SyncPay', connected: false, type: 'PIX / Cartão' },
    { name: 'Mercado Pago', connected: false, type: 'PIX / Cartão' },
    { name: 'Stripe', connected: false, type: 'Cartão' },
  ],
  flows: [
    { id: uid(), name: 'Fluxo Básico', type: 'basic', steps: 3 },
    { id: uid(), name: 'Fluxo Avançado', type: 'advanced', steps: 8 },
  ],
  accounts: [
    { id: uid(), name: 'Suporte Telegram', platform: 'telegram', identifier: '@suporte', photo: '', status: 'online', tags: ['suporte'], category: 'Suporte', notes: 'Conta principal de suporte', favorite: true, createdAt: today() },
  ],
  accountCategories: ['Suporte', 'Vendas', 'Marketing', 'Pessoal'],
  accountFolders: ['Favoritos', 'Trabalho'],
  groups: [
    { id: uid(), name: 'VIP Premium 🔥', description: 'Grupo com conteúdo exclusivo atualizado toda semana', price: 29.90, inviteLink: 'https://t.me/+Exemplo', members: 47, preview: '🔥 Mais vendido!', category: 'vip', active: true, createdAt: today() },
    { id: uid(), name: 'Pack Completo', description: 'Acesso a TODOS os grupos + bônus exclusivos', price: 49.90, inviteLink: 'https://t.me/+Exemplo2', members: 23, preview: '⭐ Completo!', category: 'combo', active: true, createdAt: today() },
    { id: uid(), name: 'Grupo Free', description: 'Amostra grátis com conteúdo básico', price: 0, inviteLink: 'https://t.me/+Exemplo3', members: 120, preview: '🎁 Grátis!', category: 'free', active: true, createdAt: today() },
  ],
  groupCategories: ['todos', 'vip', 'combo', 'free'],
  members: [
    { id: uid(), groupId: '', name: 'João', contact: '@joao123', chatId: '123456', purchasedAt: today(), value: 29.90, status: 'active' },
  ],
  orders: [],
  pixConfig: {
    pixKey: 'zeze@pix.com',
    merchantName: 'Zeze Content',
    gateway: 'static',
    mercadopagoToken: '',
    mercadopagoEmail: '',
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
        return {
          ...initialState,
          ...parsed,
          notifications: parsed.notifications || initialState.notifications,
          gateways: parsed.gateways || initialState.gateways,
          flows: parsed.flows || initialState.flows,
          accounts: parsed.accounts || initialState.accounts,
          accountCategories: parsed.accountCategories || initialState.accountCategories,
          accountFolders: parsed.accountFolders || initialState.accountFolders,
          orders: parsed.orders || initialState.orders,
          deliveries: parsed.deliveries || initialState.deliveries,
          groups: parsed.groups || initialState.groups,
          groupCategories: parsed.groupCategories || initialState.groupCategories,
          members: parsed.members || initialState.members,
          pixConfig: { ...initialState.pixConfig, ...(parsed.pixConfig || {}) },
          config: { ...initialState.config, ...(parsed.config || {}) },
          user: { ...initialState.user, ...(parsed.user || {}) },
        };
    }
  } catch (e) { console.error(e); }
  return initialState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? { ...p, ...action.payload.data } : p) };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, { ...action.payload, id: uid(), createdAt: new Date().toISOString() }] };
    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? { ...o, ...action.payload.data } : o) };
    case 'ADD_DELIVERY':
      return { ...state, deliveries: [...state.deliveries, { ...action.payload, id: uid(), createdAt: new Date().toISOString() }] };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    case 'UPDATE_GROUP':
      return { ...state, groups: state.groups.map(g => g.id === action.payload.id ? { ...g, ...action.payload.data } : g) };
    case 'DELETE_GROUP':
      return { ...state, groups: state.groups.filter(g => g.id !== action.payload) };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, { ...action.payload, id: uid(), purchasedAt: today() }] };
    case 'UPDATE_MEMBER':
      return { ...state, members: state.members.map(m => m.id === action.payload.id ? { ...m, ...action.payload.data } : m) };
    case 'DELETE_MEMBER':
      return { ...state, members: state.members.filter(m => m.id !== action.payload) };
    case 'ADD_GATEWAY':
      return { ...state, gateways: [...state.gateways, action.payload] };
    case 'REMOVE_GATEWAY':
      return { ...state, gateways: state.gateways.filter(g => g.name !== action.payload) };
    case 'SET_PIX_CONFIG':
      return { ...state, pixConfig: { ...state.pixConfig, ...action.payload } };
    case 'HYDRATE':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'SET_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'ADD_BOT':
      return { ...state, bots: [...state.bots, action.payload] };
    case 'UPDATE_BOT':
      return { ...state, bots: state.bots.map(b => b.id === action.payload.id ? { ...b, ...action.payload.data } : b) };
    case 'DELETE_BOT':
      return { ...state, bots: state.bots.filter(b => b.id !== action.payload) };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? { ...c, ...action.payload.data } : c) };
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) };
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    case 'UPDATE_SALE':
      return { ...state, sales: state.sales.map(s => s.id === action.payload.id ? { ...s, ...action.payload.data } : s) };
    case 'DELETE_SALE':
      return { ...state, sales: state.sales.filter(s => s.id !== action.payload) };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities].slice(0, 50) };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications].slice(0, 50) };
    case 'READ_NOTIFICATION':
      return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };
    case 'READ_ALL_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'DELETE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    case 'TOGGLE_GATEWAY':
      return { ...state, gateways: state.gateways.map(g => g.name === action.payload ? { ...g, connected: !g.connected } : g) };
    case 'ADD_FLOW':
      return { ...state, flows: [...state.flows, { ...action.payload, criadoEm: new Date().toISOString() }] };
    case 'UPDATE_FLOW':
      return { ...state, flows: state.flows.map(f => f.id === action.payload.id ? { ...f, ...action.payload.data } : f) };
    case 'DELETE_FLOW':
      return { ...state, flows: state.flows.filter(f => f.id !== action.payload) };
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, action.payload] };
    case 'UPDATE_ACCOUNT':
      return { ...state, accounts: state.accounts.map(a => a.id === action.payload.id ? { ...a, ...action.payload.data } : a) };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter(a => a.id !== action.payload) };
    case 'TOGGLE_FAVORITE_ACCOUNT':
      return { ...state, accounts: state.accounts.map(a => a.id === action.payload ? { ...a, favorite: !a.favorite } : a) };
    case 'SET_ACCOUNT_CATEGORIES':
      return { ...state, accountCategories: action.payload };
    case 'RESET_DATA':
      localStorage.removeItem(STORAGE_KEY);
      return { ...initialState, activities: [{ id: uid(), text: 'Dados resetados', type: 'warning', time: new Date().toISOString() }] };
    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, loadState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addActivity = (text, type = 'info') => {
    dispatch({ type: 'ADD_ACTIVITY', payload: { id: uid(), text, type, time: new Date().toISOString() } });
  };

  const addNotification = (title, message) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: { id: uid(), title, message, read: false, time: new Date().toISOString() } });
  };

  const helpers = {
    formatMoney: (value) => 'R$ ' + Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formatDate: (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR'),
    uid,
    today,
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addActivity, addNotification, helpers }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

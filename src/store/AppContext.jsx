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
          config: { ...initialState.config, ...(parsed.config || {}) },
          user: { ...initialState.user, ...(parsed.user || {}) },
        };
    }
  } catch (e) { console.error(e); }
  return initialState;
}

function reducer(state, action) {
  switch (action.type) {
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
      return { ...state, flows: [...state.flows, action.payload] };
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

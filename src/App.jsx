import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig';

import { AppProvider, useApp } from './store/AppContext';
import Layout from './partials/Layout';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Gateways from './pages/Gateways';
import Flows from './pages/Flows';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Login from './pages/Login';

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  const isAuth = !!localStorage.getItem('zeze-auth');

  if (!isAuth) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="bots" element={<Bots />} />
        <Route path="vendas" element={<Sales />} />
        <Route path="clientes" element={<Clients />} />
        <Route path="gateways" element={<Gateways />} />
        <Route path="fluxos" element={<Flows />} />
        <Route path="contas" element={<Accounts />} />
        <Route path="configuracoes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;

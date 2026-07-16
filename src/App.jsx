import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './css/style.css';
import './charts/ChartjsConfig';

import { AppProvider, useApp } from './store/AppContext';
import Layout from './partials/Layout';
import Dashboard from './pages/Dashboard';
import Bots from './pages/Bots';
import Analises from './pages/Analises';
import Financeiro from './pages/Financeiro';
import Clients from './pages/Clients';
import Comunidade from './pages/Comunidade';
import Afiliado from './pages/Afiliado';
import Automacoes from './pages/Automacoes';
import Ferramentas from './pages/Ferramentas';
import Gateways from './pages/Gateways';
import Flows from './pages/Flows';
import Trackeamento from './pages/Trackeamento';
import Checkout from './pages/Checkout';
import BioLink from './pages/BioLink';
import Webhooks from './pages/Webhooks';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Accounts from './pages/Accounts';
import Redirecionadores from './pages/Redirecionadores';
import Remarketing from './pages/Remarketing';
import Postagens from './pages/Postagens';

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
          <Route path="analises" element={<Analises />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="clientes" element={<Clients />} />
          <Route path="comunidade" element={<Comunidade />} />
          <Route path="afiliado" element={<Afiliado />} />
          <Route path="automacoes" element={<Automacoes />} />
          <Route path="fluxos" element={<Flows />} />
          <Route path="redirecionadores" element={<Redirecionadores />} />
          <Route path="remarketing" element={<Remarketing />} />
          <Route path="postagens" element={<Postagens />} />
          <Route path="ferramentas" element={<Ferramentas />} />
          <Route path="gateways" element={<Gateways />} />
          <Route path="trackeamento" element={<Trackeamento />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="biolink" element={<BioLink />} />
          <Route path="webhooks" element={<Webhooks />} />
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

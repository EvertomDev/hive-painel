import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Bot, GitBranch, CreditCard, LayoutGrid } from 'lucide-react';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/automacoes', icon: Bot, label: 'Bots' },
  { path: '/fluxos', icon: GitBranch, label: 'Fluxos' },
  { path: '/gateways', icon: CreditCard, label: 'Gateways' },
  { path: null, icon: LayoutGrid, label: 'Mais', isDrawer: true },
];

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#050505]/90 backdrop-blur-xl border-t border-white/[0.06] safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {tabs.map((tab) => {
            const isActive = tab.path === '/' ? location.pathname === '/' : (tab.path && location.pathname.startsWith(tab.path));
            return (
              <button
                key={tab.label}
                onClick={() => {
                  if (tab.isDrawer) {
                    setDrawerOpen(true);
                  } else {
                    navigate(tab.path);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[56px] ${
                  isActive ? 'text-[var(--brand-500)]' : 'text-[#52525b] hover:text-[#a1a1aa]'
                }`}
              >
                <tab.icon size={20} />
                <span className="text-[9px] font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#050505] rounded-t-2xl border-t border-white/[0.06] p-4 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-sm font-semibold text-white">Navegação</span>
              <button onClick={() => setDrawerOpen(false)} className="text-[#a1a1aa] hover:text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { path: '/stories', label: 'Stories', icon: 'M8 3h.01M12 3h.01M16 3h.01M4 7h16M4 11h16M4 15h16M4 19h16' },
                { path: '/analises', label: 'Análises', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                { path: '/financeiro', label: 'Financeiro', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
                { path: '/clientes', label: 'Clientes', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8z' },
                { path: '/comunidade', label: 'Comunidade', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                { path: '/aulas', label: 'Aulas', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5m9 5l9-5' },
                { path: '/afiliado', label: 'Afiliado', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                { path: '/redirecionadores', label: 'Redirecionadores', icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' },
                { path: '/remarketing', label: 'Remarketing', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
                { path: '/postagens', label: 'Postagens', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                { path: '/ferramentas', label: 'Ferramentas', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
                { path: '/trackeamento', label: 'Trackeamento', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
                { path: '/roletahot', label: 'Roleta Hot', icon: 'M18 18v-6a6 6 0 00-12 0v6m12 0H6m12 0h3m-3 0h-3m-6 0H3m3 0h3M12 3v3' },
                { path: '/checkout', label: 'Checkout', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
                { path: '/biolink', label: 'Bio Link', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
                { path: '/webhooks', label: 'Webhooks', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
                { path: '/configuracoes', label: 'Configurações', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon.split(' ').map((d, i) => <path key={i} d={d} />)}
                  </svg>
                  <span className="text-[9px] font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MobileNav;

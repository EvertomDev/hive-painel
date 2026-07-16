import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const menuGroups = [
  {
    label: 'Principal', items: [
      { path: '/', label: 'Dashboard', badge: null, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { path: '/stories', label: 'Stories', badge: null, icon: 'M8 3h.01M12 3h.01M16 3h.01M4 7h16M4 11h16M4 15h16M4 19h16' },
      { path: '/analises', label: 'Análises', badge: null, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { path: '/financeiro', label: 'Financeiro', badge: 'sales', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
      { path: '/clientes', label: 'Clientes', badge: 'clients', icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm6.5-2.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75' },
      { path: '/comunidade', label: 'Comunidade', badge: null, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { path: '/aulas', label: 'Aulas', badge: null, icon: 'M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5m9 5l9-5' },
      { path: '/afiliado', label: 'Afiliado', badge: null, icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    ],
  },
  {
    label: 'Automações', items: [
      { path: '/automacoes', label: 'Meus Robôs', badge: 'bots', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' },
      { path: '/fluxos', label: 'Meus Fluxos', badge: 'flows', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
      { path: '/redirecionadores', label: 'Redirecionadores', badge: null, icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' },
      { path: '/remarketing', label: 'Remarketing', badge: null, icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
      { path: '/postagens', label: 'Postagens', badge: null, icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
      { path: '/ferramentas', label: 'Ferramentas', badge: null, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ],
  },
  {
    label: 'Integrações', items: [
      { path: '/gateways', label: 'Gateways', badge: 'gateways', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { path: '/trackeamento', label: 'Trackeamento', badge: null, icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
      { path: '/roletahot', label: 'Roleta Hot', badge: null, icon: 'M18 18v-6a6 6 0 00-12 0v6m12 0H6m12 0h3m-3 0h-3m-6 0H3m3 0h3M12 3v3' },
      { path: '/checkout', label: 'Checkout', badge: null, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
      { path: '/biolink', label: 'Bio Link', badge: null, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
      { path: '/webhooks', label: 'Webhooks', badge: null, icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    ],
  },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { state } = useApp();
  const location = useLocation();

  const badges = useMemo(() => ({
    bots: state.bots.length,
    sales: state.orders.filter(o => o.status === 'pending').length,
    clients: state.members.length,
    gateways: state.gateways.filter(g => !g.connected).length,
    flows: state.flows.length,
  }), [state]);

  const NavIcon = ({ d }) => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {d.split(' ').map((path, i) => <path key={i} d={path} />)}
    </svg>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile sidebar (full) */}
      <div className={`flex flex-col fixed lg:hidden z-50 left-0 top-0 h-full w-64 bg-[#050505] border-r border-white/[0.06] transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] flex items-center justify-center text-white font-bold text-sm">Z</div>
            <span className="text-base font-bold text-white">Zeze</span>
          </div>
          <button className="text-[#a1a1aa] hover:text-white" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-6 scrollbar-none">
          {menuGroups.map((group) => (
            <div key={group.label} className="mb-1">
              <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#52525b]">{group.label}</div>
              <div className="space-y-[1px]">
                {group.items.map((item) => {
                  const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                  const badge = item.badge ? badges[item.badge] : null;
                  return (
                    <NavLink key={item.path} end={item.path === '/'} to={item.path} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-[7px] rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive ? 'bg-white/[0.06] text-white' : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.03]'
                      }`}>
                      <span className={`shrink-0 transition-colors duration-150 ${isActive ? 'text-[var(--brand-500)]' : 'group-hover:text-[var(--brand-500)]'}`}>
                        <NavIcon d={item.icon} />
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge !== null && badge > 0 && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                          isActive ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)]' : 'bg-white/[0.06] text-[#a1a1aa]'
                        }`}>{badge > 99 ? '99+' : badge}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop sidebar (icon-only, 70px) */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen border-r flex-col w-[70px] z-20 bg-[#050505] border-white/[0.06]">
        {/* Beam animation */}
        <div className="absolute top-0 bottom-0 right-0 w-px bg-white/[0.04] overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--brand-500)] to-transparent animate-[beam-drop_5s_cubic-bezier(0.4,0,0.2,1)_infinite_2s]"></div>
        </div>

        {/* Logo */}
        <div className="pt-5 pb-4 flex items-center justify-center px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[var(--brand-500)]/20">Z</div>
        </div>

        {/* Nav items */}
        <div className="relative flex-1 min-h-0">
          <nav className="h-full overflow-y-auto pb-6 scrollbar-none px-2">
            {menuGroups.map((group) => (
              <div key={group.label} className="mb-1">
                <ul className="space-y-[1px]">
                  {group.items.map((item) => {
                    const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                    const badge = item.badge ? badges[item.badge] : null;
                    return (
                      <li key={item.path}>
                        <NavLink end={item.path === '/'} to={item.path}
                          className={`w-full flex items-center justify-center gap-3 px-3 py-[7px] rounded-lg transition-all duration-150 group relative ${
                            isActive ? 'text-white bg-white/[0.06]' : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.03]'
                          }`}
                          title={item.label}>
                          <span className={`transition-colors duration-150 flex-shrink-0 relative ${isActive ? 'text-[var(--brand-500)]' : 'group-hover:text-[var(--brand-500)]'}`}>
                            <NavIcon d={item.icon} />
                          </span>
                          {badge !== null && badge > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--brand-500)]"></span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

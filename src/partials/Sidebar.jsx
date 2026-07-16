import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { LogOut, ChevronDown } from 'lucide-react';

const divider = <div className="h-px bg-white/[0.06] my-3" />;

const menuTop = [
  { path: '/', label: 'Dashboard', badge: null, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/afiliado', label: 'Afiliado', badge: null, icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm6.5-2.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75' },
];

const automacoesItems = [
  { path: '/automacoes', label: 'Meus Robôs', badge: 'bots', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' },
  { path: '/fluxos', label: 'Meus Fluxos', badge: 'flows', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1V5z' },
  { path: '/redirecionadores', label: 'Redirecionadores', badge: null, icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' },
  { path: '/remarketing', label: 'Remarketing', badge: null, icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
  { path: '/postagens', label: 'Postagens', badge: null, icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
  { path: '/ferramentas', label: 'Ferramentas', badge: null, icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

const integracoesItems = [
  { path: '/gateways', label: 'Gateways', badge: 'gateways', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { path: '/trackeamento', label: 'Trackeamento', badge: null, icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { path: '/checkout', label: 'Checkout', badge: null, icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
  { path: '/biolink', label: 'Bio Link', badge: null, icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { path: '/webhooks', label: 'Webhooks', badge: null, icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
];

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { state, addActivity } = useApp();
  const location = useLocation();

  const badges = useMemo(() => ({
    bots: state.bots.length,
    sales: state.orders.filter(o => o.status === 'pending').length,
    clients: state.members.length,
    gateways: state.gateways.filter(g => !g.connected).length,
    flows: state.flows.length,
  }), [state]);

  const NavIcon = ({ d }) => (
    <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {d.split(' ').map((path, i) => <path key={i} d={path} />)}
    </svg>
  );

  const NavItem = ({ item, isActive, onClick }) => {
    const badge = item.badge ? badges[item.badge] : null;
    return (
      <NavLink end={item.path === '/'} to={item.path} onClick={onClick}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 border border-transparent ${
          isActive
            ? 'bg-[var(--brand-500)]/10 text-[var(--brand-500)] border-[var(--brand-500)]/20'
            : 'text-white/50 hover:text-white hover:bg-white/[0.03] hover:border-white/[0.06]'
        }`}>
        <span className="shrink-0"><NavIcon d={item.icon} /></span>
        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
        {badge !== null && badge > 0 && (
          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
            isActive ? 'bg-[var(--brand-500)]/20 text-[var(--brand-500)]' : 'bg-white/[0.06] text-white/50'
          }`}>{badge > 99 ? '99+' : badge}</span>
        )}
      </NavLink>
    );
  };

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem('zeze-auth');
    window.location.href = '/';
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)} />

      <div className={`flex flex-col fixed lg:hidden z-50 left-0 top-0 h-full w-64 bg-[#050505] border-r border-white/[0.06] transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] flex items-center justify-center text-white font-bold text-xs">Z</div>
          <span className="text-base font-bold text-white">Zeze</span>
          <button className="ml-auto text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none">
          {menuTop.map(item => <NavItem key={item.path} item={item} isActive={isActive(item.path)} onClick={() => setSidebarOpen(false)} />)}
          {divider}
          <div className="px-3 py-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">Automações</div>
          {automacoesItems.map(item => <NavItem key={item.path} item={item} isActive={isActive(item.path)} onClick={() => setSidebarOpen(false)} />)}
          {divider}
          <div className="px-3 py-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">Integrações</div>
          {integracoesItems.map(item => <NavItem key={item.path} item={item} isActive={isActive(item.path)} onClick={() => setSidebarOpen(false)} />)}
        </div>
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/70">Z</div>
            <span className="text-sm font-medium text-white/70">Zeze Admin</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      <div className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col z-20 bg-[#050505] border-r border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-700)] flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-[var(--brand-500)]/20">Z</div>
          <span className="text-base font-bold text-white">Zeze</span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-none">
          {menuTop.map(item => <NavItem key={item.path} item={item} isActive={isActive(item.path)} />)}
          {divider}
          <div className="px-3 py-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">Automações</div>
          {automacoesItems.map(item => <NavItem key={item.path} item={item} isActive={isActive(item.path)} />)}
          {divider}
          <div className="px-3 py-2 text-[10px] text-white/40 font-bold uppercase tracking-wider">Integrações</div>
          {integracoesItems.map(item => <NavItem key={item.path} item={item} isActive={isActive(item.path)} />)}
        </div>

        <div className="border-t border-white/[0.06] p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/70">Z</div>
            <span className="text-sm font-medium text-white/70">Zeze Admin</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

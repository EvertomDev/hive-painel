import React from 'react';
import { useApp } from '../store/AppContext';
import { Settings, LogOut, Menu } from 'lucide-react';

function Header({ sidebarOpen, setSidebarOpen }) {
  const { state } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('zeze-auth');
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <button
            className="text-[#a1a1aa] hover:text-white lg:hidden transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => window.location.href = '/configuracoes'}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] transition-all"
              title="Configurações"
            >
              <Settings size={16} />
            </button>
            <div className="h-5 w-px bg-white/[0.06]"></div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] transition-all"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

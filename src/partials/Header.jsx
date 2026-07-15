import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { useThemeProvider } from '../utils/ThemeContext';
import { ExpandableTabs } from '../components/ui/ExpandableTabs';
import NotificationsPanel from '../components/NotificationsPanel';
import { User, Settings, Moon, Sun, LogOut } from 'lucide-react';

function Header({ sidebarOpen, setSidebarOpen }) {
  const { state } = useApp();
  const { currentTheme, changeCurrentTheme } = useThemeProvider();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('zeze-auth');
    window.location.href = '/';
  };

  const toggleTheme = () => {
    changeCurrentTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const userTabs = [
    { icon: User, title: 'Perfil', onClick: () => window.location.href = '/configuracoes' },
    { icon: Settings, title: 'Preferências', onClick: () => window.location.href = '/configuracoes' },
    { icon: currentTheme === 'dark' ? Sun : Moon, title: currentTheme === 'dark' ? 'Claro' : 'Escuro', onClick: toggleTheme },
    { icon: LogOut, title: 'Sair', onClick: handleLogout },
  ];

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border animate-fade-in">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            className="text-muted-foreground hover:text-foreground lg:hidden transition-transform hover:scale-105 active:scale-95"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <NotificationsPanel open={notifOpen} setOpen={setNotifOpen} />
            <div className="h-6 w-px bg-border hidden sm:block"></div>
            <ExpandableTabs
              tabs={userTabs.map(t => ({ icon: t.icon, title: t.title }))}
              onChange={(index) => {
                if (index !== null) userTabs[index].onClick();
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

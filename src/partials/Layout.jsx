import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#050505]"></div>
        <div className="absolute inset-0 grid-bg"></div>
        <div className="absolute inset-0 noise-bg opacity-[0.015]"></div>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col lg:ml-[70px]">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default Layout;

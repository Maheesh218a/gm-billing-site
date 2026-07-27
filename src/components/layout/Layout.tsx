import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}

      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
      </div>

      <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen && !isMobile ? 'lg:ml-64 print:ml-0' : 'ml-0'}`}>
        <div className="print:hidden">
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0 overflow-x-hidden print:overflow-visible print:bg-white">
          <div
            className="max-w-7xl mx-auto h-full print:max-w-none print:w-full print:m-0"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

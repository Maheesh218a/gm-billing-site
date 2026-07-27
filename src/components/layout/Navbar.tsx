import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { userProfile, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 h-16">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {currentTime.format('dddd, DD MMM YYYY')}
            </span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 ml-2">
              {currentTime.format('hh:mm A')}
            </span>
          </div>
        </div>

        {/* Center - Search (Hidden on small screens) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search invoices, customers, vehicles..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-gray-800"></span>
          </button>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent dark:hover:border-gray-600 transition-all"
            >
              <div className="flex flex-col items-end hidden sm:flex mr-1">
                <span className="text-sm font-semibold text-gray-700 dark:text-white leading-none mb-1">
                  {userProfile?.name || 'Administrator'}
                </span>
                <span className="text-xs text-primary dark:text-blue-400 font-medium leading-none uppercase">
                  {userProfile?.role || 'Admin'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {(userProfile?.name || 'A')[0].toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 py-1 origin-top-right animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 sm:hidden">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{userProfile?.name || 'Administrator'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{userProfile?.email}</p>
                  </div>
                  <button onClick={() => { setDropdownOpen(false); /* navigate to profile */ }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    Your Profile
                  </button>
                  <button onClick={() => { setDropdownOpen(false); /* navigate to settings */ }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button 
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

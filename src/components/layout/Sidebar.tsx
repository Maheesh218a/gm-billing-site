import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  Users, 
  Car, 
  Contact, 
  CreditCard, 
  BarChart3, 
  FileSignature, 
  DatabaseBackup, 
  Settings, 
  ScrollText, 
  UserCircle,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMobile: boolean;
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Create Invoice', path: '/invoices/create', icon: FileText },
  { name: 'Invoice History', path: '/invoices/history', icon: History },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Vehicles', path: '/vehicles', icon: Car },
  { name: 'Drivers', path: '/drivers', icon: Contact },
  { name: 'Payments', path: '/payments', icon: CreditCard },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Templates', path: '/templates', icon: FileSignature },
  { name: 'Backup', path: '/backup', icon: DatabaseBackup },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Logs', path: '/logs', icon: ScrollText },
  { name: 'Profile', path: '/profile', icon: UserCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isMobile }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleClose = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl lg:shadow-none flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            GM
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white truncate">
            GM Billing
          </span>
        </div>
        {isMobile && (
          <button onClick={handleClose} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

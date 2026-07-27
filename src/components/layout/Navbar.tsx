import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Moon, Sun, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { invoiceService } from '../../services/invoice.service';
import { customerService } from '../../services/customer.service';
import { vehicleService } from '../../services/vehicle.service';
import dayjs from 'dayjs';

interface NavbarProps {
  toggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [allData, setAllData] = useState({ invoices: [] as any[], customers: [] as any[], vehicles: [] as any[] });
  
  useEffect(() => {
    // Load data for global search
    const unsubI = invoiceService.subscribeToInvoices(data => setAllData(prev => ({ ...prev, invoices: data })));
    const unsubC = customerService.subscribeToCustomers(data => setAllData(prev => ({ ...prev, customers: data })));
    const unsubV = vehicleService.subscribeToVehicles(data => setAllData(prev => ({ ...prev, vehicles: data })));
    
    return () => { unsubI(); unsubC(); unsubV(); };
  }, []);

  const searchResults = {
    invoices: allData.invoices.filter(i => 
      i.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3),
    customers: allData.customers.filter(c => 
      c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobileNumber?.includes(searchQuery)
    ).slice(0, 3),
    vehicles: allData.vehicles.filter(v => 
      v.vehicleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  };

  const hasResults = searchResults.invoices.length > 0 || searchResults.customers.length > 0 || searchResults.vehicles.length > 0;

  // Notifications Logic
  const pendingInvoices = allData.invoices.filter(i => i.status === 'Pending' || (i.outstandingBalance && i.outstandingBalance > 0));
  const displayNotifications = pendingInvoices.slice(0, 5);
  const unreadCount = pendingInvoices.length;

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
        <div className="hidden md:flex flex-1 max-w-xl mx-4 relative">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              placeholder="Search invoices, customers, vehicles..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
            />
          </div>

          {/* Search Dropdown */}
          {showSearch && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="max-h-96 overflow-y-auto p-2">
                {!hasResults ? (
                  <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
                ) : (
                  <>
                    {/* Invoices */}
                    {searchResults.invoices.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoices</div>
                        {searchResults.invoices.map(inv => (
                          <button key={inv.id} onClick={() => navigate(`/invoices/${inv.id}`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                              <p className="text-xs text-gray-500">{inv.customerName}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{inv.status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customers</div>
                        {searchResults.customers.map(cus => (
                          <button key={cus.id} onClick={() => navigate(`/customers/${cus.id}`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{cus.fullName}</p>
                              <p className="text-xs text-gray-500">{cus.mobileNumber}</p>
                            </div>
                            <span className="text-xs text-primary">{cus.customerType}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Vehicles */}
                    {searchResults.vehicles.length > 0 && (
                      <div>
                        <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicles</div>
                        {searchResults.vehicles.map(veh => (
                          <button key={veh.id} onClick={() => navigate(`/vehicles/${veh.id}`)} className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{veh.vehicleName}</p>
                              <p className="text-xs text-gray-500">{veh.registrationNumber}</p>
                            </div>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400">{veh.vehicleType}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => { setNotificationsOpen(!notificationsOpen); setDropdownOpen(false); }}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 relative "
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white dark:border-gray-800"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {unreadCount === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                        <Bell className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                        <p>You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {displayNotifications.map(inv => (
                          <div 
                            key={inv.id} 
                            onClick={() => { setNotificationsOpen(false); navigate(`/invoices/${inv.id}`); }}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors flex gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold">!</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">Pending payment for {inv.customerName}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Invoice {inv.invoiceNumber} • LKR {inv.outstandingBalance?.toLocaleString() || inv.total?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <button onClick={() => { setNotificationsOpen(false); navigate('/invoices'); }} className="text-xs font-medium text-primary hover:text-blue-600 w-full text-center">
                      View all invoices
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 "
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotificationsOpen(false); }}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent dark:hover:border-gray-600 "
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
                  <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    Your Profile
                  </button>
                  <button onClick={() => { setDropdownOpen(false); navigate('/settings'); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button 
                    onClick={async () => { 
                      setDropdownOpen(false); 
                      try { await logout(); navigate('/login'); } catch (e) { console.error(e) } 
                    }}
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

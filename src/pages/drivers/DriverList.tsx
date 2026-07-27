import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash, FileText, Contact } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { driverService } from '../../services/driver.service';
import type { Driver } from '../../services/driver.service';
import toast from 'react-hot-toast';

export const DriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = driverService.subscribeToDrivers((data) => {
      setDrivers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredDrivers = drivers.filter(d => 
    d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery) ||
    d.nic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${name}?`)) {
      try {
        await driverService.deleteDriver(id);
        toast.success(`${name} has been deactivated.`);
      } catch (error) {
        toast.error('Failed to deactivate driver.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your drivers and their assignments</p>
        </div>
        <Button leftIcon={<Plus className="w-5 h-5" />} onClick={() => navigate('/drivers/create')}>
          Add Driver
        </Button>
      </div>

      <Card className="p-4">
        <Input 
          placeholder="Search by name, phone, or NIC..." 
          leftIcon={<Search className="w-5 h-5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      <Card premium className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading drivers...</td></tr>
              ) : filteredDrivers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No drivers found.</td></tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 ">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                          {driver.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{driver.fullName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">NIC: {driver.nic}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {driver.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.status === 'Available' ? 'bg-green-100 text-green-800' :
                        driver.status === 'Busy' ? 'bg-blue-100 text-blue-800' :
                        driver.status === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/drivers/${driver.id}`)} className="text-gray-400 hover:text-primary p-1">
                          <FileText className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate(`/drivers/${driver.id}/edit`)} className="text-gray-400 hover:text-blue-500 p-1">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(driver.id!, driver.fullName)} className="text-gray-400 hover:text-danger p-1">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DriverList;

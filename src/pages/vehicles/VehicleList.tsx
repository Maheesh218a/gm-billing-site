import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash, FileText, Car } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { vehicleService, Vehicle } from '../../services/vehicle.service';
import toast from 'react-hot-toast';

export const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = vehicleService.subscribeToVehicles((data) => {
      setVehicles(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredVehicles = vehicles.filter(v => 
    v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to deactivate ${name}?`)) {
      try {
        await vehicleService.deleteVehicle(id);
        toast.success(`${name} has been deactivated.`);
      } catch (error) {
        toast.error('Failed to deactivate vehicle.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your fleet and financials</p>
        </div>
        <Button leftIcon={<Plus className="w-5 h-5" />} onClick={() => navigate('/vehicles/create')}>
          Add Vehicle
        </Button>
      </div>

      <Card className="p-4">
        <Input 
          placeholder="Search by vehicle number, brand, or model..." 
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading vehicles...</td></tr>
              ) : filteredVehicles.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No vehicles found.</td></tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.vehicleNumber}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{vehicle.brand} {vehicle.model} ({vehicle.year})</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {vehicle.vehicleType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                        vehicle.status === 'Booked' ? 'bg-blue-100 text-blue-800' :
                        vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/vehicles/${vehicle.id}`)} className="text-gray-400 hover:text-primary p-1">
                          <FileText className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)} className="text-gray-400 hover:text-blue-500 p-1">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(vehicle.id!, vehicle.vehicleNumber)} className="text-gray-400 hover:text-danger p-1">
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

export default VehicleList;

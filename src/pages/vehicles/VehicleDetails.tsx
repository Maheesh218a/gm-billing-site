import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Car, Settings, Calendar, DollarSign, Activity, FileText } from 'lucide-react';
import { vehicleService } from '../../services/vehicle.service';
import type { Vehicle } from '../../services/vehicle.service';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const VehicleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchVehicle = async () => {
        try {
          const data = await vehicleService.getVehicle(id);
          setVehicle(data);
        } catch (error) {
          toast.error('Failed to load vehicle profile');
        } finally {
          setLoading(false);
        }
      };
      fetchVehicle();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (!vehicle) {
    return <div className="p-8 text-center text-gray-500">Vehicle not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/vehicles')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {vehicle.brand} {vehicle.model}
              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                vehicle.status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                vehicle.status === 'Booked' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                vehicle.status === 'Maintenance' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {vehicle.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{vehicle.registrationNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<Edit className="w-4 h-4" />} onClick={() => navigate(`/vehicles/${id}/edit`)}>
            Edit Vehicle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card premium>
            <CardBody className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Car className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{vehicle.vehicleNumber}</div>
                    <div className="text-xs text-gray-500">System Number</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <Car className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{vehicle.vehicleType}</div>
                    <div className="text-xs text-gray-500">Category</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{vehicle.transmission} - {vehicle.fuelType}</div>
                    <div className="text-xs text-gray-500">Specs</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Analytics & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg shadow-indigo-500/20">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><Activity className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-indigo-100 text-sm font-medium">Mileage</p>
                  <p className="text-2xl font-bold">{vehicle.mileage?.toLocaleString() || 0} km</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><DollarSign className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Monthly Rev.</p>
                  <p className="text-2xl font-bold">LKR {(vehicle.monthlyRevenue || 0).toLocaleString()}</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg shadow-purple-500/20">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><Calendar className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-purple-100 text-sm font-medium">Year</p>
                  <p className="text-2xl font-bold">{vehicle.year}</p>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card premium>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Additional Information</h3>
            </div>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Vehicle Details</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Color</dt><dd className="font-medium text-gray-900 dark:text-white">{vehicle.color}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Seat Capacity</dt><dd className="font-medium text-gray-900 dark:text-white">{vehicle.seatCapacity} Seats</dd></div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Financial & Dates</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Purchase Price</dt><dd className="font-medium text-gray-900 dark:text-white">LKR {(vehicle.purchasePrice || 0).toLocaleString()}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Insurance Expiry</dt><dd className="font-medium text-gray-900 dark:text-white">{vehicle.insuranceExpiry || 'Not Set'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">License Expiry</dt><dd className="font-medium text-gray-900 dark:text-white">{vehicle.revenueLicenseExpiry || 'Not Set'}</dd></div>
                  </dl>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

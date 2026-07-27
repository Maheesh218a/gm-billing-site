import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Phone, MapPin, Calendar, DollarSign, Activity, Truck } from 'lucide-react';
import { driverService } from '../../services/driver.service';
import type { Driver } from '../../services/driver.service';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const DriverDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchDriver = async () => {
        try {
          const data = await driverService.getDriver(id);
          setDriver(data);
        } catch (error) {
          toast.error('Failed to load driver profile');
        } finally {
          setLoading(false);
        }
      };
      fetchDriver();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (!driver) {
    return <div className="p-8 text-center text-gray-500">Driver not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/drivers')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 "
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {driver.fullName}
              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                driver.status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                driver.status === 'Busy' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                driver.status === 'Leave' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {driver.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">NIC: {driver.nic}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button leftIcon={<Edit className="w-4 h-4" />} onClick={() => navigate(`/drivers/${id}/edit`)}>
            Edit Driver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card premium>
            <CardBody className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{driver.phone}</div>
                    <div className="text-xs text-gray-500">Primary Phone</div>
                  </div>
                </div>
                
                {driver.whatsapp && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{driver.whatsapp}</div>
                      <div className="text-xs text-gray-500">WhatsApp</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{driver.address || 'N/A'}</div>
                    <div className="text-xs text-gray-500">Address</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Analytics & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg shadow-green-500/20">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><Truck className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed Trips</p>
                  <p className="text-2xl font-bold">{driver.completedTrips || 0}</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><DollarSign className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Revenue Gen.</p>
                  <p className="text-2xl font-bold">LKR {(driver.revenueGenerated || 0).toLocaleString()}</p>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg shadow-teal-500/20">
              <CardBody className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl"><Calendar className="w-6 h-6 text-white" /></div>
                <div>
                  <p className="text-teal-100 text-sm font-medium">Joining Date</p>
                  <p className="text-2xl font-bold">{new Date(driver.joiningDate).toLocaleDateString()}</p>
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
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">License & Identity</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">License Number</dt><dd className="font-medium text-gray-900 dark:text-white">{driver.licenseNumber}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">License Expiry</dt><dd className="font-medium text-gray-900 dark:text-white">{driver.licenseExpiry}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Experience</dt><dd className="font-medium text-gray-900 dark:text-white">{driver.experience || 'N/A'}</dd></div>
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Emergency & Health</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Emergency Contact</dt><dd className="font-medium text-gray-900 dark:text-white">{driver.emergencyContact || 'N/A'}</dd></div>
                    <div className="flex justify-between"><dt className="text-gray-600 dark:text-gray-400">Blood Group</dt><dd className="font-medium text-gray-900 dark:text-white">{driver.bloodGroup || 'N/A'}</dd></div>
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

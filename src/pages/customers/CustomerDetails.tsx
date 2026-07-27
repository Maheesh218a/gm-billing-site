import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Upload, FileText, Calendar, DollarSign, Activity } from 'lucide-react';
import { customerService, Customer } from '../../services/customer.service';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const data = await customerService.getCustomer(id);
          setCustomer(data);
        } catch (error) {
          toast.error('Failed to load customer profile');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-gray-500">Customer not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {customer.fullName}
              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                customer.status === 'Blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {customer.status}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customer Profile & Analytics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
            Upload Docs
          </Button>
          <Button leftIcon={<Edit className="w-4 h-4" />} onClick={() => navigate(`/customers/${id}/edit`)}>
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card premium>
            <CardBody className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-4xl text-white font-bold shadow-lg">
                  {customer.fullName.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{customer.mobileNumber}</div>
                    <div className="text-xs text-gray-500">Mobile</div>
                  </div>
                </div>
                {customer.whatsappNumber && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{customer.whatsappNumber}</div>
                      <div className="text-xs text-gray-500">WhatsApp</div>
                    </div>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{customer.email}</div>
                      <div className="text-xs text-gray-500">Email</div>
                    </div>
                  </div>
                )}
                {(customer.address || customer.city) && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {customer.address} {customer.city && `, ${customer.city}`} {customer.country && `, ${customer.country}`}
                      </div>
                      <div className="text-xs text-gray-500">Address</div>
                    </div>
                  </div>
                )}
                {customer.nic && (
                  <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{customer.nic}</div>
                      <div className="text-xs text-gray-500">NIC / Passport</div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
          
          {customer.specialNotes && (
            <Card>
              <CardBody>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Special Notes</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-100 dark:border-yellow-900/50">
                  {customer.specialNotes}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Analytics & History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card premium className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 border-blue-100 dark:border-gray-700">
              <CardBody className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      LKR {(customer.lifetimeRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card premium className="bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-800 border-red-100 dark:border-gray-700">
              <CardBody className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding</p>
                    <p className="text-2xl font-bold text-danger mt-1">
                      LKR {(customer.outstandingBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card premium className="bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-800 border-green-100 dark:border-gray-700">
              <CardBody className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {customer.totalBookings || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Invoices & Bookings Tabs Placeholder */}
          <Card premium className="min-h-[400px]">
            <CardBody>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">History & Documents</h3>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No history available yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Invoices and bookings will appear here.</p>
                </div>
              </div>
            </CardBody>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;

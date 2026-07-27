import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { customerService } from '../../services/customer.service';
import type { Customer } from '../../services/customer.service';
import toast from 'react-hot-toast';

export const CustomerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Customer>({
    defaultValues: {
      status: 'Active',
      customerType: 'Regular'
    }
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchCustomer = async () => {
        try {
          const data = await customerService.getCustomer(id);
          if (data) reset(data);
          else {
            toast.error('Customer not found');
            navigate('/customers');
          }
        } catch (error) {
          toast.error('Error fetching customer details');
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data: Customer) => {
    setIsSaving(true);
    try {
      if (isEdit && id) {
        await customerService.updateCustomer(id, data);
        toast.success('Customer updated successfully');
      } else {
        await customerService.createCustomer(data);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card premium>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name *"
                placeholder="John Doe"
                {...register('fullName', { required: 'Full name is required' })}
                error={errors.fullName?.message}
              />
              <Input
                label="Mobile Number *"
                placeholder="07xxxxxxxx"
                {...register('mobileNumber', { 
                  required: 'Mobile number is required',
                  pattern: { value: /^07\d{8}$/, message: 'Invalid Sri Lankan mobile number format (07xxxxxxxx)' }
                })}
                error={errors.mobileNumber?.message}
              />
              <Input
                label="WhatsApp Number"
                placeholder="07xxxxxxxx"
                {...register('whatsappNumber', {
                  pattern: { value: /^07\d{8}$/, message: 'Invalid mobile number format' }
                })}
                error={errors.whatsappNumber?.message}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                {...register('email', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
                })}
                error={errors.email?.message}
              />
              <Input
                label="NIC / Passport"
                placeholder="1990xxxxxxV"
                {...register('nic')}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Type
                </label>
                <select
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white transition-colors"
                  {...register('customerType')}
                >
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Travel Agency">Travel Agency</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  placeholder="No. 123, Street Name"
                  {...register('address')}
                />
              </div>
              
              <Input
                label="City"
                placeholder="Colombo"
                {...register('city')}
              />
              <Input
                label="Country"
                placeholder="Sri Lanka"
                {...register('country')}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Special Notes
                </label>
                <textarea
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white transition-colors h-24 resize-none"
                  placeholder="Any special preferences or notes..."
                  {...register('specialNotes')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white transition-colors"
                  {...register('status')}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate('/customers')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                {isEdit ? 'Save Changes' : 'Create Customer'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  );
};

export default CustomerForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { driverService } from '../../services/driver.service';
import type { Driver } from '../../services/driver.service';
import toast from 'react-hot-toast';

export const DriverForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: {
      status: 'Available'
    }
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      await driverService.createDriver(data);
      toast.success("Driver added successfully!");
      navigate('/drivers');
    } catch (error: any) {
      toast.error(error.message || "Failed to add driver");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/drivers')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Driver</h1>
        </div>
      </div>

      <Card premium>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Driver Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input 
                  label="Full Name *" 
                  placeholder="e.g. Nimal Perera" 
                  {...register('fullName', { required: 'Name is required' })} 
                />
                {errors.fullName && <p className="mt-1 text-sm text-danger">{errors.fullName.message as string}</p>}
              </div>

              <div>
                <Input 
                  label="Mobile Number *" 
                  placeholder="e.g. 0771234567" 
                  {...register('phone', { required: 'Mobile is required' })} 
                />
                {errors.phone && <p className="mt-1 text-sm text-danger">{errors.phone.message as string}</p>}
              </div>

              <div>
                <Input 
                  label="NIC" 
                  placeholder="e.g. 901234567V" 
                  {...register('nic')} 
                />
              </div>

              <div>
                <Input 
                  label="License Number" 
                  placeholder="e.g. B123456" 
                  {...register('licenseNumber')} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select 
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white"
                  {...register('status')}
                >
                  <option value="Available">Available</option>
                  <option value="Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Driver
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default DriverForm;

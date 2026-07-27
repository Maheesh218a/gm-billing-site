import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { vehicleService } from '../../services/vehicle.service';
import type { Vehicle } from '../../services/vehicle.service';
import toast from 'react-hot-toast';

export const VehicleForm: React.FC = () => {
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
      await vehicleService.createVehicle(data);
      toast.success("Vehicle added successfully!");
      navigate('/vehicles');
    } catch (error: any) {
      toast.error(error.message || "Failed to add vehicle");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/vehicles')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 ">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Vehicle</h1>
        </div>
      </div>

      <Card premium>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input 
                  label="Vehicle Number *" 
                  placeholder="e.g. WP CAA-1234" 
                  {...register('vehicleNumber', { required: 'Vehicle Number is required' })} 
                />
                {errors.vehicleNumber && <p className="mt-1 text-sm text-danger">{errors.vehicleNumber.message as string}</p>}
              </div>
              
              <div>
                <Input 
                  label="Type" 
                  placeholder="e.g. Car, Van, Bus" 
                  {...register('vehicleType')} 
                />
              </div>

              <div>
                <Input 
                  label="Brand" 
                  placeholder="e.g. Toyota" 
                  {...register('brand')} 
                />
              </div>

              <div>
                <Input 
                  label="Model" 
                  placeholder="e.g. Prius" 
                  {...register('model')} 
                />
              </div>

              <div>
                <Input 
                  label="Year" 
                  placeholder="e.g. 2018" 
                  {...register('year')} 
                />
              </div>

              <div>
                <Input 
                  label="Color" 
                  placeholder="e.g. White" 
                  {...register('color')} 
                />
              </div>

              <div>
                <Input 
                  type="number"
                  label="Seating Capacity" 
                  placeholder="e.g. 4" 
                  {...register('seatCapacity', { valueAsNumber: true })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select 
                  className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white"
                  {...register('status')}
                >
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Vehicle
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default VehicleForm;

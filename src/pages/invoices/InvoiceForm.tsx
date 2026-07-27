import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { invoiceService, Invoice } from '../../services/invoice.service';
import { customerService, Customer } from '../../services/customer.service';
import { vehicleService, Vehicle } from '../../services/vehicle.service';
import { driverService, Driver } from '../../services/driver.service';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { register, control, handleSubmit, watch, setValue } = useForm<Invoice>({
    defaultValues: {
      status: 'Pending',
      items: [{ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, amount: 0 }],
      discount: 0,
      tax: 0,
      paidAmount: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchItems = watch("items");
  const watchDiscount = watch("discount");
  const watchTax = watch("tax");
  const watchPaidAmount = watch("paidAmount");
  const watchCustomerId = watch("customerId");

  useEffect(() => {
    // Load dropdown data
    const unsubC = customerService.subscribeToCustomers(setCustomers);
    const unsubV = vehicleService.subscribeToVehicles(setVehicles);
    const unsubD = driverService.subscribeToDrivers(setDrivers);
    return () => { unsubC(); unsubV(); unsubD(); };
  }, []);

  useEffect(() => {
    // Auto-update customer name when customerId changes
    const selectedCustomer = customers.find(c => c.id === watchCustomerId);
    if (selectedCustomer) {
      setValue("customerName", selectedCustomer.fullName);
    }
  }, [watchCustomerId, customers, setValue]);

  // Calculate totals
  useEffect(() => {
    const subtotal = watchItems.reduce((sum, item) => {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount + item.tax;
      return sum + itemTotal;
    }, 0);
    
    const grandTotal = subtotal - (Number(watchDiscount) || 0) + (Number(watchTax) || 0);
    const balance = grandTotal - (Number(watchPaidAmount) || 0);
    
    setValue("subtotal", subtotal);
    setValue("grandTotal", grandTotal);
    setValue("balance", balance);

    // Update individual item amounts
    watchItems.forEach((item, index) => {
      const amt = (item.quantity * item.unitPrice) - item.discount + item.tax;
      if (item.amount !== amt) setValue(`items.${index}.amount`, amt);
    });
  }, [watchItems, watchDiscount, watchTax, watchPaidAmount, setValue]);

  const watchSubtotal = watch("subtotal");
  const watchGrandTotal = watch("grandTotal");
  const watchBalance = watch("balance");

  const onSubmit = async (data: Invoice) => {
    if (!data.customerId) {
      toast.error("Please select a customer.");
      return;
    }
    
    setIsSaving(true);
    try {
      data.createdBy = userProfile?.name || 'Unknown User';
      const id = await invoiceService.createInvoice(data);
      toast.success("Invoice created successfully!");
      navigate(`/invoices/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
        </div>
        <Button type="button" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />} onClick={handleSubmit(onSubmit)}>
          Save Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card premium>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer & Trip Details</h2></CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer *</label>
                  <select className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white" {...register('customerId', { required: true })}>
                    <option value="">Select a customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} - {c.mobileNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
                  <select className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white" {...register('vehicleId')}>
                    <option value="">Select a vehicle...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.brand})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Driver</label>
                  <select className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white" {...register('driverId')}>
                    <option value="">Select a driver...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <Input label="Journey Type" placeholder="e.g. Airport Drop, Wedding Hire" {...register('journeyType')} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Input type="date" label="Pickup Date" {...register('pickupDate')} />
                <Input type="time" label="Pickup Time" {...register('pickupTime')} />
                <Input label="Pickup Location" {...register('pickupLocation')} />
                <Input label="Drop Location" {...register('dropLocation')} />
              </div>
            </CardBody>
          </Card>

          <Card premium>
            <CardHeader><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Items</h2></CardHeader>
            <CardBody>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl relative group">
                    <div className="flex-1 w-full">
                      <Input placeholder="Description (e.g. Transport Charges)" {...register(`items.${index}.description` as const, { required: true })} />
                    </div>
                    <div className="w-full md:w-24">
                      <Input type="number" placeholder="Qty" {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="w-full md:w-32">
                      <Input type="number" placeholder="Unit Price" {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="w-full md:w-24">
                      <Input type="number" placeholder="Discount" {...register(`items.${index}.discount` as const, { valueAsNumber: true })} />
                    </div>
                    <div className="w-full md:w-32 pt-2 md:pt-0 font-semibold text-right dark:text-white">
                      LKR {watchItems[index]?.amount?.toLocaleString() || 0}
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(index)} className="text-danger hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-4" leftIcon={<Plus className="w-4 h-4" />} onClick={() => append({ id: uuidv4(), description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0, amount: 0 })}>
                Add Line Item
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar Totals */}
        <div className="lg:col-span-1 space-y-6">
          <Card premium className="sticky top-20">
            <CardHeader><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Summary</h2></CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">LKR {(watchSubtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 gap-4">
                <span>Total Discount</span>
                <Input type="number" className="w-24 text-right" {...register('discount', { valueAsNumber: true })} />
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 gap-4">
                <span>Total Tax</span>
                <Input type="number" className="w-24 text-right" {...register('tax', { valueAsNumber: true })} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Grand Total</span>
                <span className="text-xl font-bold text-primary dark:text-blue-400">LKR {(watchGrandTotal || 0).toLocaleString()}</span>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount (LKR)</label>
                  <Input type="number" {...register('paidAmount', { valueAsNumber: true })} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white">Balance Due</span>
                  <span className={`font-bold ${watchBalance > 0 ? 'text-danger' : 'text-green-500'}`}>LKR {(watchBalance || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Status</label>
                <select className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white" {...register('status')}>
                  <option value="Pending">Pending</option>
                  <option value="Advance Paid">Advance Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <Button type="button" fullWidth isLoading={isSaving} onClick={handleSubmit(onSubmit)}>
                Save Invoice
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;

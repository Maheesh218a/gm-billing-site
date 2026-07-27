import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { settingsService } from '../services/settings.service';
import type { AppSettings } from '../services/settings.service';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Save, User, Building, Bell, Shield, Paintbrush } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, reset } = useForm<AppSettings>({
    defaultValues: {
      profile: { firstName: 'Admin', lastName: 'User', email: 'admin@gmbilling.com', phone: '+94 77 123 4567' },
      company: { 
        companyName: 'GM Transportation', 
        registrationNumber: 'PV 123456', 
        address: 'No. 123, Luxury Road, Colombo 03', 
        contactEmail: 'info@gmbilling.com', 
        contactPhone: '+94 11 234 5678',
        invoiceFooterNotes: 'Thank you for your business. Please make payments to Bank of Ceylon, A/C: 12345678.'
      }
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await settingsService.getSettings();
      if (data) {
        reset(data);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data: AppSettings) => {
    setIsSaving(true);
    try {
      await settingsService.updateSettings(data);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and company preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Tabs Sidebar */}
        <Card className="w-full md:w-64 flex-shrink-0">
          <div className="p-2 flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                activeTab === 'profile' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <User className="w-5 h-5" /> Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                activeTab === 'company' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Building className="w-5 h-5" /> Company Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                activeTab === 'notifications' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Bell className="w-5 h-5" /> Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                activeTab === 'security' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Shield className="w-5 h-5" /> Security
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                activeTab === 'appearance' ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Paintbrush className="w-5 h-5" /> Appearance
            </button>
          </div>
        </Card>

        {/* Tab Content */}
        <div className="flex-1 w-full">
          {activeTab === 'profile' && (
            <Card premium>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-400 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                    A
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Profile Photo</h3>
                    <p className="text-sm text-gray-500 mb-3">JPG, GIF or PNG. Max size of 800K</p>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" {...register('profile.firstName')} />
                  <Input label="Last Name" {...register('profile.lastName')} />
                  <Input label="Email Address" type="email" {...register('profile.email')} />
                  <Input label="Phone Number" {...register('profile.phone')} />
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>Save Changes</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'company' && (
            <Card premium>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Company Profile</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Input label="Company Name" {...register('company.companyName')} />
                  <Input label="Registration Number" {...register('company.registrationNumber')} />
                  <Input label="Address" {...register('company.address')} />
                  <div className="grid grid-cols-2 gap-6">
                    <Input label="Contact Email" {...register('company.contactEmail')} />
                    <Input label="Contact Phone" {...register('company.contactPhone')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Footer Notes</label>
                    <textarea 
                      className="block w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 focus:ring-primary focus:border-primary text-sm dark:text-white h-24 resize-none"
                      {...register('company.invoiceFooterNotes')}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>Save Company Profile</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card premium>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {[
                  { title: 'New Booking Alerts', desc: 'Receive notifications when a new booking is created.' },
                  { title: 'Payment Reminders', desc: 'Alerts for overdue invoices and upcoming payments.' },
                  { title: 'Vehicle Maintenance', desc: 'Get notified when a vehicle needs maintenance or licensing.' },
                  { title: 'Daily Summary', desc: 'Receive a daily email summary of revenue and trips.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={idx < 3} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
                <div className="flex justify-end pt-4">
                  <Button type="button" isLoading={isSaving}>Save Preferences</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Other tabs can be similarly implemented */}
          {(activeTab === 'security' || activeTab === 'appearance') && (
            <Card premium>
              <CardBody className="py-12 text-center text-gray-500">
                This section is under construction.
              </CardBody>
            </Card>
          )}

        </div>
      </div>
    </form>
  );
};

export default Settings;

import React, { useState } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Download, Database, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export const Backup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(localStorage.getItem('lastBackupDate'));

  const handleBackup = async () => {
    setIsBackingUp(true);
    const backupData: Record<string, any> = {};
    
    try {
      const collectionsToBackup = ['invoices', 'customers', 'vehicles', 'drivers', 'payments'];
      
      for (const colName of collectionsToBackup) {
        const querySnapshot = await getDocs(collection(db, colName));
        backupData[colName] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to standard ISO strings for the backup
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : doc.data().updatedAt,
        }));
      }

      // Create a Blob and trigger download
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `gm_billing_backup_${dayjs().format('YYYY-MM-DD_HH-mm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      setLastBackup(now);
      localStorage.setItem('lastBackupDate', now);
      
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Failed to generate backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Backup</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Export your data securely to your local device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card premium>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Export Data</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Download a complete JSON backup of all your system data including Customers, Invoices, Vehicles, and Drivers. You can use this file to restore your data in case of an emergency.
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Estimated Size</span>
                <span className="text-sm text-gray-500">&lt; 5 MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Format</span>
                <span className="text-sm text-gray-500">JSON (.json)</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleBackup} 
              isLoading={isBackingUp}
              leftIcon={<Download className="w-5 h-5" />}
            >
              {isBackingUp ? 'Generating Backup...' : 'Download Full Backup'}
            </Button>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Backup Status</h3>
                  {lastBackup ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last backup was created <span className="font-medium text-gray-700 dark:text-gray-200">{dayjs(lastBackup).fromNow()}</span>
                      <br/>({dayjs(lastBackup).format('MMM D, YYYY h:mm A')})
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No recent backup found on this device.
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Automated Backups</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Your database (Google Firebase) automatically runs daily cloud backups. This manual export is only necessary if you want an offline copy.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Backup;

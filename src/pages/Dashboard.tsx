import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Users, FileText, AlertCircle, Car, TrendingUp } from 'lucide-react';
import { invoiceService } from '../services/invoice.service';
import type { Invoice } from '../services/invoice.service';
import { customerService } from '../services/customer.service';
import { vehicleService } from '../services/vehicle.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    pendingInvoices: 0,
    activeCustomers: 0,
    activeVehicles: 0,
  });
  
  const [invoiceData, setInvoiceData] = useState<number[]>([0,0,0,0,0,0]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let customersCount = 0;
      let vehiclesCount = 0;
      
      const monthlyInvoices = [0, 0, 0, 0, 0, 0];
      const now = dayjs();
      
      const unsubI = invoiceService.subscribeToInvoices(invoices => {
        const invoicesCount = invoices.length;
        const pendingCount = invoices.filter(i => i.status !== 'Paid').length;
        
        // Reset monthly counts before recalculating
        monthlyInvoices.fill(0);

        invoices.forEach(inv => {
          if (inv.createdAt) {
            const invDate = dayjs(inv.createdAt.toDate());
            const monthDiff = now.diff(invDate, 'month');
            if (monthDiff >= 0 && monthDiff < 6) {
              monthlyInvoices[5 - monthDiff] += 1;
            }
          }
        });

        // Get 5 most recent invoices
        const recent = [...invoices].sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
          const dateB = b.createdAt ? b.createdAt.toMillis() : 0;
          return dateB - dateA;
        }).slice(0, 5);
        
        setInvoiceData([...monthlyInvoices]);
        setRecentInvoices(recent);
        setStats(prev => ({ ...prev, totalInvoices: invoicesCount, pendingInvoices: pendingCount }));
      });
      
      const unsubC = customerService.subscribeToCustomers(customers => {
        customersCount = customers.filter(c => c.status === 'Active').length;
        setStats(prev => ({ ...prev, activeCustomers: customersCount }));
      });

      const unsubV = vehicleService.subscribeToVehicles(vehicles => {
        vehiclesCount = vehicles.filter(v => v.status !== 'Inactive').length;
        setStats(prev => ({ ...prev, activeVehicles: vehiclesCount }));
        setLoading(false);
      });
      
      return () => { unsubI(); unsubC(); unsubV(); };
    };
    
    fetchData();
  }, []);

  const chartData = {
    labels: Array.from({length: 6}, (_, i) => dayjs().subtract(5 - i, 'month').format('MMM')),
    datasets: [
      {
        label: 'Invoices Created',
        data: invoiceData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };
  
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { borderDash: [5, 5] },
        ticks: { stepSize: 1 } 
      },
      x: { grid: { display: false } }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card premium className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 border-blue-100 dark:border-gray-700">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalInvoices}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Total invoices generated</span>
            </div>
          </CardBody>
        </Card>

        <Card premium className="bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-800 border-red-100 dark:border-gray-700">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Invoices</p>
                <p className="text-2xl font-bold text-danger mt-2">{stats.pendingInvoices}</p>
              </div>
              <div className="p-3 bg-red-100 text-red-600 rounded-xl dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Invoices awaiting payment</span>
            </div>
          </CardBody>
        </Card>

        <Card premium>
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeCustomers}</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl dark:bg-purple-900/30 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card premium>
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Fleet</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeVehicles}</p>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl dark:bg-indigo-900/30 dark:text-indigo-400">
                <Car className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card premium className="lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Invoices Overview</h3>
          </div>
          <CardBody>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardBody>
        </Card>
        
        <Card premium>
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
          </div>
          <CardBody className="space-y-4">
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent invoices found.</p>
            ) : (
              recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {inv.customerName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      #{inv.invoiceNumber}
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded-full shrink-0 ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {inv.status}
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

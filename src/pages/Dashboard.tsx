import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { Users, FileText, CreditCard, DollarSign, TrendingUp, TrendingDown, Car } from 'lucide-react';
import { invoiceService } from '../services/invoice.service';
import type { Invoice } from '../services/invoice.service';
import { customerService } from '../services/customer.service';
import type { Customer } from '../services/customer.service';
import { vehicleService } from '../services/vehicle.service';
import type { Vehicle } from '../services/vehicle.service';
import { paymentService } from '../services/payment.service';
import type { Payment } from '../services/payment.service';
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
import { Line, Bar } from 'react-chartjs-2';
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
    totalRevenue: 0,
    outstandingBalance: 0,
    totalInvoices: 0,
    activeCustomers: 0,
    activeVehicles: 0,
    revenueGrowth: 0,
  });
  
  const [revenueData, setRevenueData] = useState<number[]>([0,0,0,0,0,0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let totalRevenue = 0;
      let totalOutstanding = 0;
      let invoicesCount = 0;
      let customersCount = 0;
      let vehiclesCount = 0;
      
      const monthlyRev = [0, 0, 0, 0, 0, 0];
      const now = dayjs();
      
      const unsubI = invoiceService.subscribeToInvoices(invoices => {
        invoicesCount = invoices.length;
        totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0);
        
        // Calculate last 6 months revenue from invoices (using paid amount or grand total if Paid)
        invoices.forEach(inv => {
          if (inv.createdAt) {
            const invDate = dayjs(inv.createdAt.toDate());
            const monthDiff = now.diff(invDate, 'month');
            if (monthDiff >= 0 && monthDiff < 6) {
              monthlyRev[5 - monthDiff] += inv.paidAmount || 0;
            }
          }
        });
        setRevenueData([...monthlyRev]);
        setStats(prev => ({ ...prev, totalInvoices: invoicesCount, outstandingBalance: totalOutstanding }));
      });
      
      const unsubP = paymentService.subscribeToPayments(payments => {
        totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        setStats(prev => ({ ...prev, totalRevenue }));
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
      
      return () => { unsubI(); unsubP(); unsubC(); unsubV(); };
    };
    
    fetchData();
  }, []);

  const chartData = {
    labels: Array.from({length: 6}, (_, i) => dayjs().subtract(5 - i, 'month').format('MMM')),
    datasets: [
      {
        label: 'Revenue (LKR)',
        data: revenueData,
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
      y: { beginAtZero: true, grid: { borderDash: [5, 5] } },
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
        <Card premium className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 border-blue-100 dark:border-gray-700 ">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">LKR {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">+12.5%</span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </CardBody>
        </Card>

        <Card premium className="bg-gradient-to-br from-red-50 to-white dark:from-gray-800 dark:to-gray-800 border-red-100 dark:border-gray-700 ">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding Balance</p>
                <p className="text-2xl font-bold text-danger mt-2">LKR {stats.outstandingBalance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 text-red-600 rounded-xl dark:bg-red-900/30 dark:text-red-400">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Total unpaid invoices</span>
            </div>
          </CardBody>
        </Card>

        <Card premium className="">
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
        
        <Card premium className="">
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
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
          </div>
          <CardBody>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardBody>
        </Card>
        
        <Card premium>
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Invoice Created</p>
                <p className="text-xs text-gray-500">Invoice #GM-20231015-001</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Received</p>
                <p className="text-xs text-gray-500">LKR 45,000 via Bank Transfer</p>
              </div>
            </div>
            {/* More activity items can go here */}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

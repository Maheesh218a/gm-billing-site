import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { FileText, MapPin, Users, TrendingUp, Activity } from 'lucide-react';
import { invoiceService } from '../services/invoice.service';
import type { Invoice } from '../services/invoice.service';
import { customerService } from '../services/customer.service';
import type { Customer } from '../services/customer.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Reports = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let invoicesLoaded = false;
    let customersLoaded = false;

    const checkLoading = () => {
      if (invoicesLoaded && customersLoaded) {
        setLoading(false);
      }
    };

    const unsubI = invoiceService.subscribeToInvoices((data) => {
      setInvoices(data);
      invoicesLoaded = true;
      checkLoading();
    });

    const unsubC = customerService.subscribeToCustomers((data) => {
      setCustomers(data);
      customersLoaded = true;
      checkLoading();
    });

    return () => {
      unsubI();
      unsubC();
    };
  }, []);

  // --- Calculations ---

  // 1. Total Trips
  const totalTrips = invoices.length;

  // 2. Most frequent locations
  const getMostFrequent = (items: (string | undefined)[]) => {
    const counts: Record<string, number> = {};
    let maxItem = 'N/A';
    let maxCount = 0;
    
    items.forEach(item => {
      if (!item) return;
      const normalized = item.trim();
      if (!normalized) return;
      
      counts[normalized] = (counts[normalized] || 0) + 1;
      if (counts[normalized] > maxCount) {
        maxCount = counts[normalized];
        maxItem = normalized;
      }
    });
    return maxItem;
  };

  const topPickup = getMostFrequent(invoices.map(i => i.pickupLocation));
  const topDrop = getMostFrequent(invoices.map(i => i.dropLocation));

  // 3. Trips Over Time (Last 6 Months)
  const monthlyTrips = [0, 0, 0, 0, 0, 0];
  const now = dayjs();
  
  invoices.forEach(inv => {
    if (inv.createdAt) {
      const invDate = dayjs(inv.createdAt.toDate());
      const monthDiff = now.diff(invDate, 'month');
      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyTrips[5 - monthDiff] += 1;
      }
    }
  });

  const barChartData = {
    labels: Array.from({length: 6}, (_, i) => dayjs().subtract(5 - i, 'month').format('MMM')),
    datasets: [
      {
        label: 'Number of Trips',
        data: monthlyTrips,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1 } 
      }
    }
  };

  // 4. Trip Status Distribution
  const pendingCount = invoices.filter(i => i.status !== 'Paid').length;
  const paidCount = invoices.filter(i => i.status === 'Paid').length;

  const doughnutData = {
    labels: ['Completed (Paid)', 'Pending'],
    datasets: [
      {
        data: [paidCount, pendingCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // Green
          'rgba(245, 158, 11, 0.8)', // Orange
        ],
        borderWidth: 0,
      }
    ]
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  // 5. Top Customers by Trip Count
  const customerTripCounts: Record<string, number> = {};
  invoices.forEach(inv => {
    if (inv.customerId) {
      customerTripCounts[inv.customerId] = (customerTripCounts[inv.customerId] || 0) + 1;
    }
  });

  const topCustomers = Object.entries(customerTripCounts)
    .map(([customerId, count]) => {
      const customer = customers.find(c => c.id === customerId);
      return {
        id: customerId,
        name: customer ? customer.name : 'Unknown Customer',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading reports...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Operational Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyze your trips, locations, and customer activity.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card premium className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-800 border-blue-100 dark:border-gray-700">
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trips / Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalTrips}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl dark:bg-blue-900/30 dark:text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card premium>
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{customers.filter(c => c.status === 'Active').length}</p>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Pickup Area</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-2 truncate max-w-[150px]" title={topPickup}>{topPickup}</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-xl dark:bg-green-900/30 dark:text-green-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card premium>
          <CardBody className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Drop Area</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-2 truncate max-w-[150px]" title={topDrop}>{topDrop}</p>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-xl dark:bg-orange-900/30 dark:text-orange-400 shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card premium className="lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Trips Over Time (Last 6 Months)</h3>
          </div>
          <CardBody>
            <div className="h-80">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </CardBody>
        </Card>

        <Card premium>
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Trip Status Overview</h3>
          </div>
          <CardBody>
            <div className="h-80 flex flex-col justify-center">
              {totalTrips === 0 ? (
                <p className="text-center text-gray-500">No trips available</p>
              ) : (
                <Doughnut data={doughnutData} options={doughnutOptions} />
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card premium>
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Most Active Customers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {topCustomers.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-gray-500">No customer data available</td>
                </tr>
              ) : (
                topCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-700 dark:text-gray-300">
                      {customer.count}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;

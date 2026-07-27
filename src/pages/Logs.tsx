import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { invoiceService } from '../services/invoice.service';
import { customerService } from '../services/customer.service';
import { FileText, User, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const Logs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let invoices: any[] = [];
    let customers: any[] = [];
    let isSubscribed = true;

    const processLogs = () => {
      const combinedLogs: any[] = [];
      
      invoices.forEach(inv => {
        if (inv.createdAt) {
          combinedLogs.push({
            id: `inv-${inv.id}`,
            type: 'invoice',
            title: `Invoice ${inv.invoiceNumber} Generated`,
            description: `Billed to ${inv.customerName} for LKR ${(inv.total || 0).toLocaleString()}`,
            date: inv.createdAt?.toDate ? inv.createdAt.toDate() : new Date(inv.createdAt),
            icon: FileText,
            color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
            link: `/invoices/${inv.id}`
          });
        }
      });

      customers.forEach(cus => {
        if (cus.createdAt) {
          combinedLogs.push({
            id: `cus-${cus.id}`,
            type: 'customer',
            title: `New Customer Added`,
            description: `${cus.fullName} registered as a ${cus.customerType} client`,
            date: cus.createdAt?.toDate ? cus.createdAt.toDate() : new Date(cus.createdAt),
            icon: User,
            color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
            link: `/customers/${cus.id}`
          });
        }
      });

      // Sort by date descending
      combinedLogs.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      if (isSubscribed) {
        setLogs(combinedLogs);
        setLoading(false);
      }
    };

    const unsubI = invoiceService.subscribeToInvoices(data => {
      invoices = data;
      processLogs();
    });
    
    const unsubC = customerService.subscribeToCustomers(data => {
      customers = data;
      processLogs();
    });

    return () => {
      isSubscribed = false;
      unsubI();
      unsubC();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Activity Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all major actions across your billing system.</p>
      </div>
      
      <Card premium>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Clock className="w-8 h-8 mb-2 animate-spin text-gray-300" />
              Loading activity logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activity logs found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {logs.map((log) => (
                <div key={log.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${log.color}`}>
                      <log.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {log.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {log.description}
                          </p>
                        </div>
                        <div className="flex items-center text-xs text-gray-400 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {dayjs(log.date).fromNow()}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button 
                          onClick={() => navigate(log.link)}
                          className="inline-flex items-center text-xs font-medium text-primary hover:text-blue-700 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Details <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Logs;

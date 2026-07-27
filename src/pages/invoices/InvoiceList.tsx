import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash, FileText, Download, Printer } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { invoiceService } from '../../services/invoice.service';
import type { Invoice } from '../../services/invoice.service';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export const InvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = invoiceService.subscribeToInvoices((data) => {
      setInvoices(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all your billing and invoices</p>
        </div>
        <Button leftIcon={<Plus className="w-5 h-5" />} onClick={() => navigate('/invoices/create')}>
          Create Invoice
        </Button>
      </div>

      <Card className="p-4">
        <Input 
          placeholder="Search by invoice number or customer name..." 
          leftIcon={<Search className="w-5 h-5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      <Card premium className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Info</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading invoices...</td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 ">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {invoice.createdAt ? dayjs(invoice.createdAt.toDate()).format('DD MMM YYYY, hh:mm A') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">LKR {invoice.grandTotal.toLocaleString()}</div>
                      {invoice.balance > 0 && (
                        <div className="text-xs text-danger font-medium mt-0.5">Due: LKR {invoice.balance.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        invoice.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/invoices/${invoice.id}`)} className="text-gray-400 hover:text-primary p-1" title="View">
                          <FileText className="w-5 h-5" />
                        </button>
                        <button onClick={() => navigate(`/invoices/${invoice.id}/edit`)} className="text-gray-400 hover:text-primary p-1" title="Edit">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-500 p-1" title="Download PDF">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1" title="Print">
                          <Printer className="w-5 h-5" />
                        </button>
                      </div>
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

export default InvoiceList;

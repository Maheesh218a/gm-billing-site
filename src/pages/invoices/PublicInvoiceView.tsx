import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import type { Invoice } from '../../services/invoice.service';
import { CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

export const PublicInvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        try {
          const invoices = await new Promise<Invoice[]>((resolve) => {
            const unsub = invoiceService.subscribeToInvoices((data) => {
              resolve(data);
              unsub();
            });
          });
          const found = invoices.find(i => i.id === id);
          if (found) setInvoice(found);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Verifying invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">!</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invoice</h1>
          <p className="text-gray-500">We could not verify this invoice in our system. It may have been deleted or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verified Invoice</h1>
            <p className="text-gray-500 mt-2">This is a digitally verified authentic invoice issued by GM Transportation.</p>
          </div>

          <div className="border-t border-gray-100 pt-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Invoice Number</p>
                <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Billed To</p>
                <p className="font-semibold text-gray-900">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Issued</p>
                <p className="font-semibold text-gray-900">{dayjs(invoice.createdAt?.toDate()).format('DD MMM YYYY')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Grand Total</p>
                <p className="font-bold text-gray-900">LKR {(invoice.grandTotal || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Balance Due</p>
                <p className={`font-bold ${invoice.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  LKR {(invoice.balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            Powered by GM Billing System
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoiceView;

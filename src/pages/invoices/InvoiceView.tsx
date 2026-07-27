import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import type { Invoice } from '../../services/invoice.service';
import { ArrowLeft, Download, Printer, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

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
          else toast.error('Invoice not found');
        } catch (error) {
          toast.error('Failed to load invoice');
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !invoice) return;
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded!', { id: toastId });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading invoice...</div>;
  if (!invoice) return <div className="p-8 text-center text-gray-500">Invoice not found.</div>;

  const verificationUrl = `${window.location.origin}/verify/${invoice.id}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/invoices')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 ">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Share2 className="w-4 h-4" />}>Share</Button>
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>Print</Button>
          <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadPDF}>Download PDF</Button>
        </div>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0" ref={invoiceRef}>
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8">
          <div>
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
              GM
            </div>
            <h2 className="text-2xl font-bold text-gray-900">GM Transportation</h2>
            <p className="text-gray-500 text-sm mt-1">No. 123, Luxury Road, Colombo 03</p>
            <p className="text-gray-500 text-sm">Tel: +94 77 123 4567 | info@gmbilling.com</p>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">INVOICE</h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">#{invoice.invoiceNumber}</p>
            <p className="text-gray-500 text-sm">Date: {dayjs(invoice.createdAt?.toDate()).format('DD MMM YYYY')}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold uppercase tracking-wider">
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Customer & Trip Details */}
        <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-200">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
            <p className="text-lg font-bold text-gray-900">{invoice.customerName}</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Trip Details</h3>
            {invoice.pickupDate && <p className="text-sm text-gray-700"><span className="font-medium">Date:</span> {dayjs(invoice.pickupDate).format('DD MMM YYYY')}</p>}
            {invoice.pickupLocation && <p className="text-sm text-gray-700"><span className="font-medium">Pickup:</span> {invoice.pickupLocation}</p>}
            {invoice.dropLocation && <p className="text-sm text-gray-700"><span className="font-medium">Drop:</span> {invoice.dropLocation}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-sm font-bold text-gray-900">Description</th>
                <th className="py-3 text-sm font-bold text-gray-900 text-right">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-700">{item.description}</td>
                  <td className="py-4 text-sm text-gray-900 font-medium text-right">{(item.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Footer */}
        <div className="flex justify-between items-start pt-4">
          <div className="w-1/2 pr-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scan to Verify</h3>
            <div className="p-2 bg-white border border-gray-200 rounded-lg inline-block">
              <QRCode value={verificationUrl} size={80} level="M" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Scan this QR code to verify the authenticity of this invoice online.</p>
          </div>
          
          <div className="w-1/2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>LKR {(invoice.subtotal || 0).toLocaleString()}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="text-danger">- LKR {(invoice.discount || 0).toLocaleString()}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>+ LKR {(invoice.tax || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span>LKR {(invoice.grandTotal || 0).toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 pt-3">
                <span>Amount Paid</span>
                <span>LKR {(invoice.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-danger">
                <span>Balance Due</span>
                <span>LKR {(invoice.balance || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Stamp */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end">
          <div>
            <p className="text-sm font-medium text-gray-900">{invoice.createdBy}</p>
            <p className="text-xs text-gray-500">Authorized Signature</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            Thank you for your business!
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceView;

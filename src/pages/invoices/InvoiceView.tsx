import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoice.service';
import type { Invoice } from '../../services/invoice.service';
import { settingsService } from '../../services/settings.service';
import type { AppSettings } from '../../services/settings.service';
import { customerService } from '../../services/customer.service';
import type { Customer } from '../../services/customer.service';
import { ArrowLeft, Download, Printer, Share2, Edit, Globe, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import QRCode from 'react-qr-code';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

import GMLogo from '../../assets/GM_Logo.png';
import QRGoogleReview from '../../assets/QR-Google Review.png';
import QRGMWebSite from '../../assets/QR-GM Web Site.png';

export const InvoiceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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
          if (found) {
            setInvoice(found);
            const appSettings = await settingsService.getSettings();
            setSettings(appSettings);
            try {
              const cust = await customerService.getCustomer(found.customerId);
              setCustomer(cust);
            } catch (e) {
              console.error(e);
            }
          }
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
      const imgData = await htmlToImage.toPng(invoiceRef.current, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const img = new window.Image();
      img.src = imgData;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded!', { id: toastId });
    } catch (error) {
      console.error('PDF Generation Error:', error);
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
          {invoice.status !== 'Paid' && (
            <Button variant="outline" leftIcon={<Edit className="w-4 h-4" />} onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>Edit</Button>
          )}
          <Button variant="outline" leftIcon={<Share2 className="w-4 h-4" />}>Share</Button>
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>Print</Button>
          <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadPDF}>Download PDF</Button>
        </div>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 relative overflow-hidden" ref={invoiceRef}>
        
        {invoice.status === 'Paid' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-8 border-red-500 text-red-500 font-black text-6xl md:text-8xl py-4 px-12 rounded-2xl opacity-20 pointer-events-none select-none z-10 print:opacity-30">
            PAID
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8">
          <div>
            <div className="mb-2">
              <img src={GMLogo} alt="GM Logo" className="h-20 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{settings?.company?.companyName || 'GM Transportation'}</h2>
            <p className="text-gray-500 text-sm mt-1">{settings?.company?.address || 'No. 123, Luxury Road, Colombo 03'}</p>
            <p className="text-gray-500 text-sm">
              Tel: {settings?.company?.contactPhone || '+94 77 123 4567'} | {settings?.company?.contactEmail || 'info@gmbilling.com'}
            </p>
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
            {customer?.mobileNumber && <p className="text-sm font-medium text-gray-700 mt-1">{customer.mobileNumber}</p>}
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
                  <td className="py-4 text-sm text-gray-900 font-medium text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Footer */}
        <div className="flex justify-between items-start pt-4">
          <div className="w-1/2 pr-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Please Review Us</h3>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="p-1 bg-white border border-gray-200 rounded-lg shrink-0">
                <img src={QRGoogleReview} alt="Google Review QR" className="w-20 h-20 object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Satisfied with our service?</p>
                <p className="text-xs text-gray-600 mt-1">Scan this QR code to share your feedback on Google. We appreciate your support!</p>
              </div>
            </div>
          </div>
          
          <div className="w-1/2">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>LKR {formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="text-danger">- LKR {formatCurrency(invoice.discount)}</span>
                </div>
              )}
              {invoice.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>+ LKR {formatCurrency(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Grand Total</span>
                <span>LKR {formatCurrency(invoice.grandTotal)}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 pt-3">
                <span>Amount Paid</span>
                <span>LKR {formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-danger">
                <span>Balance Due</span>
                <span>LKR {formatCurrency(invoice.balance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Stamp */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end">
          <div>
            <p className="text-sm font-medium text-gray-900">GM Super Service</p>
            <p className="text-xs text-gray-500">Authorized Signature</p>
          </div>
          <div className="text-right text-xs text-gray-500 max-w-sm whitespace-pre-line font-medium italic">
            {settings?.company?.invoiceFooterNotes || 'Thank you for your business!'}
          </div>
        </div>

        {/* Footer Connections */}
        <div className="mt-12 pt-6 border-t border-dashed border-gray-200 bg-gray-50 -mx-8 sm:-mx-12 -mb-8 sm:-mb-12 px-8 sm:px-12 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <a href="https://web.facebook.com/gmsuperservice" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 text-sm font-medium">
              <div className="w-5 h-5 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <span>GM Super Service</span>
            </a>
            <a href="https://wa.me/94773181037" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-green-500 text-sm font-medium">
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span>077 318 1037</span>
            </a>
            <a href="https://www.tiktok.com/@gm.super.service" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-black text-sm font-medium">
              <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 448 512"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>
              </div>
              <span>@gm.super.service</span>
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Visit Our Website</p>
              <p className="text-sm font-medium text-gray-900">Scan QR Code</p>
            </div>
            <div className="p-1.5 bg-white border border-gray-200 rounded-md">
              <img src={QRGMWebSite} alt="Website QR" className="w-12 h-12 object-contain" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceView;

import { collection, doc, addDoc, updateDoc, getDoc, query, orderBy, serverTimestamp, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Payment {
  id?: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
  referenceNumber?: string; // Cheque number or Bank ref
  
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  notes?: string;
  
  createdBy: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'payments';

export const paymentService = {
  createPayment: async (paymentData: Partial<Payment>): Promise<string> => {
    let newDocRefId = '';

    await runTransaction(db, async (transaction) => {
      // 1. Get Invoice
      const invoiceRef = doc(db, 'invoices', paymentData.invoiceId!);
      const invoiceDoc = await transaction.get(invoiceRef);
      if (!invoiceDoc.exists()) throw new Error("Invoice not found.");
      
      const invoice = invoiceDoc.data();
      const currentPaid = invoice.paidAmount || 0;
      const amountToPay = paymentData.amount || 0;
      
      if (amountToPay <= 0) throw new Error("Payment amount must be greater than 0.");
      
      const newPaidAmount = currentPaid + amountToPay;
      const newBalance = invoice.grandTotal - newPaidAmount;
      
      let newInvoiceStatus = invoice.status;
      if (newBalance <= 0) newInvoiceStatus = 'Paid';
      else if (newPaidAmount > 0 && newBalance > 0) {
        if (invoice.status === 'Pending') newInvoiceStatus = 'Advance Paid';
        else newInvoiceStatus = 'Partially Paid';
      }

      // 2. Get Customer
      const customerRef = doc(db, 'customers', paymentData.customerId!);
      const customerDoc = await transaction.get(customerRef);
      if (!customerDoc.exists()) throw new Error("Customer not found.");
      
      const customer = customerDoc.data();
      const lifetimeRevenue = customer.lifetimeRevenue || 0;
      const outstandingBalance = customer.outstandingBalance || 0;
      
      // 3. Create Payment Document
      const newPaymentRef = doc(collection(db, COLLECTION_NAME));
      newDocRefId = newPaymentRef.id;
      transaction.set(newPaymentRef, {
        ...paymentData,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      // 4. Update Invoice
      transaction.update(invoiceRef, {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newInvoiceStatus,
        updatedAt: serverTimestamp(),
      });

      // 5. Update Customer Financials
      transaction.update(customerRef, {
        lifetimeRevenue: lifetimeRevenue + amountToPay,
        outstandingBalance: outstandingBalance - amountToPay,
        updatedAt: serverTimestamp(),
      });
    });

    return newDocRefId;
  },

  subscribeToPayments: (callback: (payments: Payment[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
      callback(payments);
    });
  }
};

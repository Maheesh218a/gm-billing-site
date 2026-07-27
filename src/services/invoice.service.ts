import { collection, doc, runTransaction, query, where, getDocs, getDoc, orderBy, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import dayjs from 'dayjs';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  amount: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  
  customerId: string;
  customerName: string;
  
  vehicleId?: string;
  driverId?: string;
  
  // Trip details
  pickupDate?: string;
  pickupTime?: string;
  dropDate?: string;
  dropTime?: string;
  pickupLocation?: string;
  dropLocation?: string;
  journeyType?: string;
  
  // Financials
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  
  // Payment
  paidAmount: number;
  balance: number;
  status: 'Pending' | 'Advance Paid' | 'Paid' | 'Cancelled' | 'Refunded' | 'Partially Paid';
  
  specialNotes?: string;
  createdBy: string;
  
  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'invoices';
const COUNTER_COLLECTION = 'invoiceCounter';

export const invoiceService = {
  // Generate ID: GM-YYYYMMDD-00001
  generateInvoiceNumber: async (): Promise<string> => {
    const today = dayjs().format('YYYYMMDD');
    const counterRef = doc(db, COUNTER_COLLECTION, today);
    
    let nextSequence = 1;

    await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { sequence: 1 });
        nextSequence = 1;
      } else {
        nextSequence = counterDoc.data().sequence + 1;
        transaction.update(counterRef, { sequence: nextSequence });
      }
    });

    return `GM-${today}-${nextSequence.toString().padStart(5, '0')}`;
  },

  createInvoice: async (invoiceData: Partial<Invoice>): Promise<string> => {
    const today = dayjs().format('YYYYMMDD');
    const counterRef = doc(db, COUNTER_COLLECTION, today);
    
    let generatedInvoiceNumber = '';
    let newDocRefId = '';

    await runTransaction(db, async (transaction) => {
      // --- ALL READS MUST COME FIRST ---
      
      // 1. Get next sequence
      const counterDoc = await transaction.get(counterRef);
      
      // 2. Get customer if applicable
      let customerDoc = null;
      let customerRef = null;
      if (invoiceData.customerId) {
        customerRef = doc(db, 'customers', invoiceData.customerId);
        customerDoc = await transaction.get(customerRef);
      }

      // --- ALL WRITES MUST COME AFTER READS ---
      
      let nextSequence = 1;
      if (!counterDoc.exists()) {
        transaction.set(counterRef, { sequence: 1 });
      } else {
        nextSequence = counterDoc.data().sequence + 1;
        transaction.update(counterRef, { sequence: nextSequence });
      }
      
      generatedInvoiceNumber = `GM-${today}-${nextSequence.toString().padStart(5, '0')}`;
      
      // 3. Create invoice document
      const newInvoiceRef = doc(collection(db, COLLECTION_NAME));
      newDocRefId = newInvoiceRef.id;
      
      transaction.set(newInvoiceRef, {
        ...invoiceData,
        invoiceNumber: generatedInvoiceNumber,
        paidAmount: invoiceData.paidAmount || 0,
        balance: (invoiceData.grandTotal || 0) - (invoiceData.paidAmount || 0),
        status: invoiceData.status || 'Pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // 4. Update customer balance
      if (customerDoc && customerDoc.exists() && customerRef) {
        const currentBalance = customerDoc.data().outstandingBalance || 0;
        const currentBookings = customerDoc.data().totalBookings || 0;
        const newBalance = currentBalance + ((invoiceData.grandTotal || 0) - (invoiceData.paidAmount || 0));
        
        transaction.update(customerRef, {
          outstandingBalance: newBalance,
          totalBookings: currentBookings + 1,
          lastBookingDate: serverTimestamp()
        });
      }
    });

    return newDocRefId;
  },
  
  updateInvoice: async (id: string, invoiceData: Partial<Invoice>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...invoiceData,
      updatedAt: serverTimestamp()
    });
  },

  getInvoiceById: async (id: string): Promise<Invoice | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Invoice;
    }
    return null;
  },

  updateInvoiceStatus: async (id: string, status: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  },

  subscribeToInvoices: (callback: (invoices: Invoice[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
      callback(invoices);
    });
  }
};

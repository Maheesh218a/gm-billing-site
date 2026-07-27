import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Customer {
  id?: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  email?: string;
  nic?: string;
  address?: string;
  city?: string;
  country?: string;
  customerType: 'VIP' | 'Regular' | 'Corporate' | 'Wedding' | 'Travel Agency';
  status: 'Active' | 'Inactive' | 'Blocked';
  specialNotes?: string;
  
  // Analytics fields
  createdAt?: any;
  updatedAt?: any;
  lastBookingDate?: any;
  lifetimeRevenue?: number;
  outstandingBalance?: number;
  totalBookings?: number;
}

const COLLECTION_NAME = 'customers';

export const customerService = {
  
  // Create Customer with duplicate check (Mobile Number)
  createCustomer: async (customerData: Partial<Customer>): Promise<string> => {
    // Duplicate Detection
    if (customerData.mobileNumber) {
      const q = query(collection(db, COLLECTION_NAME), where("mobileNumber", "==", customerData.mobileNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("A customer with this mobile number already exists.");
      }
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...customerData,
      lifetimeRevenue: 0,
      outstandingBalance: 0,
      totalBookings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Update Customer
  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<void> => {
    // Check duplicate if mobile number is being updated
    if (customerData.mobileNumber) {
      const q = query(collection(db, COLLECTION_NAME), where("mobileNumber", "==", customerData.mobileNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        if (existingDoc.id !== id) {
          throw new Error("A customer with this mobile number already exists.");
        }
      }
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...customerData,
      updatedAt: serverTimestamp(),
    });
  },

  // Soft Delete
  deleteCustomer: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'Inactive',
      deletedAt: serverTimestamp(),
    });
  },

  // Get Customer by ID
  getCustomer: async (id: string): Promise<Customer | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
  },

  // Subscribe to all active customers
  subscribeToCustomers: (callback: (customers: Customer[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      // filter out soft-deleted/inactive if needed, but for now return all
      callback(customers);
    });
  }
};

import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Driver {
  id?: string;
  fullName: string;
  nic: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  experience?: string;
  joiningDate: string;
  
  status: 'Available' | 'Busy' | 'Leave' | 'Inactive';
  
  assignedVehicleId?: string;
  
  // Analytics
  completedTrips?: number;
  revenueGenerated?: number;
  rating?: number;

  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'drivers';

export const driverService = {
  createDriver: async (driverData: Partial<Driver>): Promise<string> => {
    // Duplicate Detection (NIC or License)
    if (driverData.nic) {
      const q = query(collection(db, COLLECTION_NAME), where("nic", "==", driverData.nic));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("A driver with this NIC already exists.");
      }
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...driverData,
      completedTrips: 0,
      revenueGenerated: 0,
      rating: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateDriver: async (id: string, driverData: Partial<Driver>): Promise<void> => {
    if (driverData.nic) {
      const q = query(collection(db, COLLECTION_NAME), where("nic", "==", driverData.nic));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        if (existingDoc.id !== id) {
          throw new Error("A driver with this NIC already exists.");
        }
      }
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...driverData,
      updatedAt: serverTimestamp(),
    });
  },

  deleteDriver: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'Inactive',
      deletedAt: serverTimestamp(),
    });
  },

  getDriver: async (id: string): Promise<Driver | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Driver;
    }
    return null;
  },

  subscribeToDrivers: (callback: (drivers: Driver[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
      callback(drivers);
    });
  }
};

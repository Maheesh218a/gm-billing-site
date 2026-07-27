import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Vehicle {
  id?: string;
  vehicleNumber: string;
  registrationNumber: string;
  vehicleType: 'Car' | 'Van' | 'Bus' | 'SUV' | 'Luxury' | 'Wedding Car';
  brand: string;
  model: string;
  year: number;
  color: string;
  seatCapacity: number;
  fuelType: string;
  transmission: string;
  mileage: number;
  
  status: 'Available' | 'Booked' | 'Maintenance' | 'Inactive';
  
  // Financials
  purchasePrice?: number;
  insuranceCost?: number;
  monthlyRevenue?: number;
  fuelCost?: number;
  maintenanceCost?: number;
  netProfit?: number;

  // Alerts & Dates
  insuranceExpiry?: string;
  revenueLicenseExpiry?: string;
  emissionTestExpiry?: string;
  maintenanceDue?: string;

  createdAt?: any;
  updatedAt?: any;
}

const COLLECTION_NAME = 'vehicles';

export const vehicleService = {
  createVehicle: async (vehicleData: Partial<Vehicle>): Promise<string> => {
    // Duplicate Detection (vehicleNumber)
    if (vehicleData.vehicleNumber) {
      const q = query(collection(db, COLLECTION_NAME), where("vehicleNumber", "==", vehicleData.vehicleNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("A vehicle with this number already exists.");
      }
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...vehicleData,
      monthlyRevenue: 0,
      fuelCost: 0,
      maintenanceCost: 0,
      netProfit: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  updateVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<void> => {
    if (vehicleData.vehicleNumber) {
      const q = query(collection(db, COLLECTION_NAME), where("vehicleNumber", "==", vehicleData.vehicleNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        if (existingDoc.id !== id) {
          throw new Error("A vehicle with this number already exists.");
        }
      }
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...vehicleData,
      updatedAt: serverTimestamp(),
    });
  },

  deleteVehicle: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      status: 'Inactive',
      deletedAt: serverTimestamp(),
    });
  },

  getVehicle: async (id: string): Promise<Vehicle | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Vehicle;
    }
    return null;
  },

  subscribeToVehicles: (callback: (vehicles: Vehicle[]) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vehicle));
      callback(vehicles);
    });
  }
};

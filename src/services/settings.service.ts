import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface CompanySettings {
  companyName: string;
  registrationNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  invoiceFooterNotes: string;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AppSettings {
  company: CompanySettings;
  profile: ProfileSettings;
}

const SETTINGS_DOC_ID = 'appSettings';
const COLLECTION_NAME = 'settings';

export const settingsService = {
  getSettings: async (): Promise<AppSettings | null> => {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppSettings;
    }
    return null;
  },
  
  updateSettings: async (settings: Partial<AppSettings>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  }
};

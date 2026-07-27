import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyC-9jgoWl-nIfXku3hKNM0xR50eofHt-C8",
  authDomain: "gm-billing-site.firebaseapp.com",
  projectId: "gm-billing-site",
  storageBucket: "gm-billing-site.firebasestorage.app",
  messagingSenderId: "927888726673",
  appId: "1:927888726673:web:a37749848aef7ec4bb7d30",
  measurementId: "G-769JCPRGXD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;

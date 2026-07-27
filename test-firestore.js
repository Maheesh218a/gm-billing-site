import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-9jgoWl-nIfXku3hKNM0xR50eofHt-C8",
  authDomain: "gm-billing-site.firebaseapp.com",
  projectId: "gm-billing-site",
  storageBucket: "gm-billing-site.firebasestorage.app",
  messagingSenderId: "927888726673",
  appId: "1:927888726673:web:a37749848aef7ec4bb7d30",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const docRef = doc(db, 'settings', 'appSettings');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("DATA IN FIRESTORE:");
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("DOCUMENT DOES NOT EXIST");
  }
  process.exit(0);
}

check().catch(console.error);

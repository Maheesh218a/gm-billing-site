import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

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

async function update() {
  const docRef = doc(db, 'settings', 'appSettings');
  await updateDoc(docRef, {
    "company.companyName": "TEST COMPANY NAME"
  });
  console.log("Updated to TEST COMPANY NAME");
  process.exit(0);
}

update().catch(console.error);

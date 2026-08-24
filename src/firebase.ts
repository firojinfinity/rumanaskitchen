import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCgXK40B0reErNObrXf3U1P69xNBVxusBA",
  authDomain: "rumana-s-kitchen.firebaseapp.com",
  projectId: "rumana-s-kitchen",
  storageBucket: "rumana-s-kitchen.firebasestorage.app",
  messagingSenderId: "505289422679",
  appId: "1:505289422679:web:7d0f2dae761db0d21c7012",
  measurementId: "G-HCF2SNMVWJ"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

// src/lib/firebase.js
import { initializeApp } from "firebase/app";

import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,  // ✅ Asegúrate de importar esto
  signOut 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACoY_-J3GI9H4ZjCnC0TNnCLKn3YJS-d0",
  authDomain: "piscina-duran.firebaseapp.com",
  projectId: "piscina-duran",
  storageBucket: "piscina-duran.firebasestorage.app",
  messagingSenderId: "434191260855",
  appId: "1:434191260855:web:b424cada5b150f02ea0132"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut }; // ✅ Exporta signInWithPopup aquí
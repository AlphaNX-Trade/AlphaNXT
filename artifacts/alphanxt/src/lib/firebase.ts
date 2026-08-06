import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBiGqfzLZwG3N1Nv4L4ezMaErBmv0FpkxM",
  authDomain: "alphanxt-40c0f.firebaseapp.com",
  projectId: "alphanxt-40c0f",
  storageBucket: "alphanxt-40c0f.firebasestorage.app",
  messagingSenderId: "877735817260",
  appId: "1:877735817260:web:de8cdab926dbf352eda189",
  measurementId: "G-80TJ62MD2Q"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable Analytics only if supported
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});
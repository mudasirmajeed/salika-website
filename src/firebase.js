import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3IAN6cITe7zr7jQVduh-_D6QRSlrGhCM",
  authDomain: "salika-website.firebaseapp.com",
  projectId: "salika-website",
  storageBucket: "salika-website.firebasestorage.app",
  messagingSenderId: "945166374389",
  appId: "1:945166374389:web:992e469a14452178053cbc",
  measurementId: "G-ZTCF0DNSNT"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
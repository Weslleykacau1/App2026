// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIWdU2kFVwonxVXH2IR0vwV5cY-dUFago",
  authDomain: "tridriver-a556b.firebaseapp.com",
  projectId: "tridriver-a556b",
  storageBucket: "tridriver-a556b.appspot.com",
  messagingSenderId: "14830579345",
  appId: "1:14830579345:web:e9809a6c305404cd5a5930",
  measurementId: "G-CH96EJDLXM"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

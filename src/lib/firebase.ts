// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Replace this with your own Firebase configuration
// For more information on how to get this, visit:
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyB1E5IAVYmFsClrFx4s5k65Iv8HnJvJxIY",
  authDomain: "chronocanvas-nakny.firebaseapp.com",
  projectId: "chronocanvas-nakny",
  storageBucket: "chronocanvas-nakny.firebasestorage.app",
  messagingSenderId: "1092336481608",
  appId: "1:1092336481608:web:6806ada9653c2b8b602f7d"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

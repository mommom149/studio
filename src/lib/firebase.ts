// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARq7RSI7_wpk12ibkzHXofRGY9WuimsNk",
  authDomain: "neobridge-7fb43.firebaseapp.com",
  projectId: "neobridge-7fb43",
  storageBucket: "neobridge-7fb43.appspot.com",
  messagingSenderId: "33795675177",
  appId: "1:33795675177:web:8677262b51a7c2a4c33838"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };

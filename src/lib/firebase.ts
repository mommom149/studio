// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCPjJ3cHwTuIIMI8s07B1cYlouDsAWmS4c",
  authDomain: "neobridge-w4lc9.firebaseapp.com",
  projectId: "neobridge-w4lc9",
  storageBucket: "neobridge-w4lc9.appspot.com",
  messagingSenderId: "124550718816",
  appId: "1:124550718816:web:11a06e76d59087a8a7ea05"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

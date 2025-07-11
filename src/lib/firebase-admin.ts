import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPjJ3cHwTuIIMI8s07B1cYlouDsAWmS4c",
  authDomain: "neobridge-w4lc9.firebaseapp.com",
  projectId: "neobridge-w4lc9",
  storageBucket: "neobridge-w4lc9.appspot.com",
  messagingSenderId: "124550718816",
  appId: "1:124550718816:web:11a06e76d59087a8a7ea05"
};

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: firebaseConfig.storageBucket,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
     if (e.code === 'missing-private-key') {
        console.warn("Firebase Admin SDK initialization skipped: Missing service account key. This is expected in client-side rendering.");
     } else {
        console.error("Firebase Admin SDK initialization error:", e);
     }
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

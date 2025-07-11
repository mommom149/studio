import admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

const firebaseConfig = {
  apiKey: "AIzaSyCPjJ3cHwTuIIMI8s07B1cYlouDsAWmS4c",
  authDomain: "neobridge-w4lc9.firebaseapp.com",
  projectId: "neobridge-w4lc9",
  storageBucket: "neobridge-w4lc9.appspot.com",
  messagingSenderId: "124550718816",
  appId: "1:124550718816:web:11a06e76d59087a8a7ea05"
};

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Check if we're on the server and have the service account key
if (serviceAccountKey && !getApps().length) {
  try {
    initializeApp({
      credential: cert(JSON.parse(serviceAccountKey)),
      storageBucket: firebaseConfig.storageBucket,
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error("Firebase Admin SDK initialization error:", e.message);
  }
}

// Ensure we don't export non-initialized services, which would cause runtime errors.
// If initialization failed, these will throw an error upon access.
const adminDb = getApps().length > 0 ? admin.firestore() : null;
const adminAuth = getApps().length > 0 ? admin.auth() : null;
const adminStorage = getApps().length > 0 ? admin.storage() : null;

// Throw a clear error if the services are not available when they are imported.
if (typeof window === 'undefined' && (!adminDb || !adminAuth || !adminStorage)) {
  if (!serviceAccountKey) {
     console.error("FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK could not be initialized.");
  }
}

export { adminDb, adminAuth, adminStorage };

import admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

console.log("ENV:", process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? "Loaded" : "Missing");


if (serviceAccountKey && !getApps().length) {
    const parsedKey = JSON.parse(serviceAccountKey);

    // fix private_key newlines
    parsedKey.private_key = parsedKey.private_key.replace(/\\n/g, "\n");
  try {
    initializeApp({
      credential: cert(parsedKey),
      // storageBucket: "neobridge-w4lc9.appspot.com",
    });
    console.log("✅ Firebase Admin SDK initialized successfully.");
  } catch (e: any) {
    console.error("❌ Firebase Admin SDK initialization error:", e.message);
  }
}

// Services
const adminDb = getApps().length > 0 ? admin.firestore() : null;
const adminAuth = getApps().length > 0 ? admin.auth() : null;
const adminStorage = getApps().length > 0 ? admin.storage() : null;

// Guard for server-side only
if (typeof window === "undefined" && (!adminDb || !adminAuth || !adminStorage)) {
  if (!serviceAccountKey) {
    console.error(
      "❌ FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK could not be initialized."
    );
  }
}

export { adminDb, adminAuth, adminStorage };

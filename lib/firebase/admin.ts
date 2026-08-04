import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  // Falls back to Application Default Credentials (used on Firebase-hosted
  // Cloud Functions/Cloud Run runtimes, where ADC is provided automatically).
  return initializeApp();
}

let adminDbInstance: Firestore | null = null;
let adminAuthInstance: Auth | null = null;

export function getAdminDb(): Firestore {
  if (!adminDbInstance) {
    adminDbInstance = getFirestore(getAdminApp());
  }
  return adminDbInstance;
}

export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getAdminApp());
  }
  return adminAuthInstance;
}

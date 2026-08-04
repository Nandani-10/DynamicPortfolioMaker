import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

interface ServiceAccountJson {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

/**
 * Reads credentials from FIREBASE_SERVICE_ACCOUNT — the full service account
 * JSON that Firebase Console hands you, used as-is. This is the same value the
 * deploy workflow needs, so one secret covers both.
 */
function credentialsFromServiceAccountJson() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;

  let parsed: ServiceAccountJson;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON — ignoring it.");
    return null;
  }

  const projectId = parsed.project_id;
  const clientEmail = parsed.client_email;
  const privateKey = parsed.private_key?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;

  return { projectId, clientEmail, privateKey };
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const credentials = credentialsFromServiceAccountJson();

  if (credentials) {
    return initializeApp({
      credential: cert(credentials),
      projectId: credentials.projectId,
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

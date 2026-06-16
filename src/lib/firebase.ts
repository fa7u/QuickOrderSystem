import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// @ts-ignore
import firebaseConfigRaw from "../../firebase-applet-config.json";

// Handle both standard JSON import and Vite's potential default wrapping
const rawConfig = (firebaseConfigRaw as any).default || firebaseConfigRaw;

// Allow overriding via environment variables (very useful for Vercel and local production builds)
const env = (import.meta as any).env || {};
const envConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DB_ID,
};

const hasEnvConfig = !!envConfig.apiKey;
const firebaseConfig = hasEnvConfig ? envConfig : rawConfig;

let db: any;
let auth: any;

try {
  if (firebaseConfig && (firebaseConfig.apiKey || firebaseConfig.default?.apiKey)) {
    const config = firebaseConfig.default || firebaseConfig;
    const app = initializeApp(config);
    
    // Explicitly use the databaseId from config if available
    const dbId = config.firestoreDatabaseId || config.databaseId;
    
    // Enable persistent local cache with multi-tab support to heavily minimize Firestore read billing
    const firestoreSettings = {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    };

    if (dbId) {
      db = initializeFirestore(app, firestoreSettings, dbId);
    } else {
      db = initializeFirestore(app, firestoreSettings);
    }
    
    auth = getAuth(app);
  } else {
    console.warn("Invalid Firebase configuration structure.");
  }
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

// Validate Connection to Firestore on initial boot
async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { db, auth, googleProvider, firebaseConfig };

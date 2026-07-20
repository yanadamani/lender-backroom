// lib/firebase.js
//
// Placeholder Firebase config. Access control (auth, OTP, sessions) is
// deliberately left out of this scaffold — see README. This file exists so
// the admin panel below has somewhere to eventually persist lenders/cards
// instead of the in-memory mock store it uses today.
//
// Fill these in from the Firebase console when this app is wired to a real
// project. Until then, admin/page.js and lib/mockStore.js use an in-memory
// store so the scaffold runs with zero config.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
};

export function getDb() {
  if (!firebaseConfig.projectId) return null; // not configured yet
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getFirestore(app);
}

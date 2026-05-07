#!/usr/bin/env node

/**
 * Check Firestore collections and document counts
 * Usage: node scripts/check-firestore.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { readFileSync, existsSync } from "node:fs";

// load .env
if (existsSync(".env")) {
  const env = readFileSync(".env", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    process.env[key.trim()] ??= valueParts.join("=").trim();
  }
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.projectId) {
  console.error('Missing Firebase config in .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = ["stations", "chargers", "slots", "bookings", "payments", "users"];

async function check() {
  console.log(`Checking Firestore for project: ${firebaseConfig.projectId}\n`);
  for (const name of COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, name));
      console.log(`${name}: ${snap.size} documents`);
    } catch (err) {
      console.log(`${name}: error reading collection (${err.code || err.message})`);
    }
  }
}

check().catch((e)=>{
  console.error('Check failed:', e.message || e);
  process.exit(1);
});

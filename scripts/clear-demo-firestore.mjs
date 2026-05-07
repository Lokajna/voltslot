#!/usr/bin/env node

/**
 * Clear Demo Firestore Data
 * Removes demo bookings/payments/users while keeping `stations`, `chargers`, and `slots`.
 * Usage: node scripts/clear-demo-firestore.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { readFileSync, existsSync } from "node:fs";

// Load .env
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
  console.error("Missing Firebase configuration in .env");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TO_CLEAR = ["bookings", "payments", "users"];

async function clearCollection(name) {
  console.log(`\nClearing collection: ${name}`);
  const colRef = collection(db, name);
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) {
    console.log(`  ✓ ${name} is already empty`);
    return;
  }

  const docs = [];
  snapshot.forEach((d) => docs.push(d));

  // commit in batches of 450 (safe under 500 limit)
  const chunkSize = 450;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + chunkSize);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    console.log(`  Deleted ${chunk.length} documents from ${name}`);
  }
}

async function main() {
  try {
    console.log(`Starting demo data removal for project: ${firebaseConfig.projectId}`);
    for (const coll of TO_CLEAR) {
      await clearCollection(coll);
    }
    console.log('\nDone. Retained collections: stations, chargers');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing demo data:', err.message || err);
    process.exit(1);
  }
}

main();

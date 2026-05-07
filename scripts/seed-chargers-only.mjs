#!/usr/bin/env node

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, Timestamp } from "firebase/firestore";
import { readFileSync, existsSync } from "node:fs";

// Load .env if present
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
  console.error("Missing Firebase config in .env. Set VITE_FIREBASE_PROJECT_ID and other keys.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRICE_NORMAL = 2;
const PRICE_FAST = 5;

const MOCK_CHARGERS = [
  { id: '22222222-2222-2222-2222-222222222201', name: 'MYP-N1', location: 'Parking Bay A', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111101' },
  { id: '22222222-2222-2222-2222-222222222202', name: 'MYP-N2', location: 'Parking Bay B', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111101' },
  { id: '22222222-2222-2222-2222-222222222203', name: 'MYP-F1', location: 'Main Entrance', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111101' },
  { id: '22222222-2222-2222-2222-222222222204', name: 'MYP-F2', location: 'East Wing', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111101' },
  { id: '22222222-2222-2222-2222-222222222205', name: 'VJN-N1', location: 'Ground Floor', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111102' },
  { id: '22222222-2222-2222-2222-222222222206', name: 'VJN-N2', location: 'Visitor Parking', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111102' },
  { id: '22222222-2222-2222-2222-222222222207', name: 'VJN-F1', location: 'Basement Level', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111102' },
  { id: '22222222-2222-2222-2222-222222222248', name: 'VJN-F2', location: 'Level 1 Parking', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111102' },
  { id: '22222222-2222-2222-2222-222222222208', name: 'KVP-N1', location: 'Block A', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111103' },
  { id: '22222222-2222-2222-2222-222222222209', name: 'KVP-F1', location: 'Block B', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111103' },
  { id: '22222222-2222-2222-2222-222222222210', name: 'KVP-F2', location: 'Basement', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111103' },
  { id: '22222222-2222-2222-2222-222222222211', name: 'HBL-N1', location: 'Rear Parking', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111104' },
  { id: '22222222-2222-2222-2222-222222222212', name: 'HBL-N2', location: 'Side Bay', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111104' },
  { id: '22222222-2222-2222-2222-222222222213', name: 'HBL-F1', location: 'Main Gate', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111104' },
  { id: '22222222-2222-2222-2222-222222222214', name: 'HBL-F2', location: 'Loading Zone', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111104' },
  { id: '22222222-2222-2222-2222-222222222215', name: 'SRS-N1', location: 'North Side', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111105' },
  { id: '22222222-2222-2222-2222-222222222216', name: 'SRS-N2', location: 'Library Side', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111105' },
  { id: '22222222-2222-2222-2222-222222222217', name: 'SRS-F1', location: 'South Side', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111105' },
  { id: '22222222-2222-2222-2222-222222222218', name: 'GKL-N1', location: 'Zone 1', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111106' },
  { id: '22222222-2222-2222-2222-222222222219', name: 'GKL-F1', location: 'Zone 2', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111106' },
  { id: '22222222-2222-2222-2222-222222222220', name: 'GKL-F2', location: 'Visitor Spot', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111106' },
  { id: '22222222-2222-2222-2222-222222222221', name: 'JPN-N1', location: 'East Entry', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111107' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'JPN-N2', location: 'Park Side', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111107' },
  { id: '22222222-2222-2222-2222-222222222223', name: 'JPN-F1', location: 'West Entry', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111107' },
  { id: '22222222-2222-2222-2222-222222222224', name: 'JPN-F2', location: 'South Entry', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111107' },
  { id: '22222222-2222-2222-2222-222222222225', name: 'INF-N1', location: 'Gate 1 Parking', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111108' },
  { id: '22222222-2222-2222-2222-222222222226', name: 'INF-N2', location: 'Visitor Lot', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111108' },
  { id: '22222222-2222-2222-2222-222222222227', name: 'INF-F1', location: 'Gate 3 Parking', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111108' },
  { id: '22222222-2222-2222-2222-222222222228', name: 'CHM-N1', location: 'Base Parking', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111109' },
  { id: '22222222-2222-2222-2222-222222222229', name: 'CHM-F1', location: 'Top Parking', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111109' },
  { id: '22222222-2222-2222-2222-222222222230', name: 'CHM-F2', location: 'Temple View', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111109' },
  { id: '22222222-2222-2222-2222-222222222231', name: 'JLP-N1', location: 'Main Road', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111110' },
  { id: '22222222-2222-2222-2222-222222222232', name: 'JLP-N2', location: 'Circle Side', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111110' },
  { id: '22222222-2222-2222-2222-222222222233', name: 'JLP-F1', location: 'Back Lane', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111110' },
  { id: '22222222-2222-2222-2222-222222222234', name: 'JLP-F2', location: 'Mall Entry', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111110' },
  { id: '22222222-2222-2222-2222-222222222235', name: 'DVR-N1', location: 'Market East', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111111' },
  { id: '22222222-2222-2222-2222-222222222236', name: 'DVR-N2', location: 'Market South', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111111' },
  { id: '22222222-2222-2222-2222-222222222237', name: 'DVR-F1', location: 'Market West', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111111' },
  { id: '22222222-2222-2222-2222-222222222238', name: 'BGD-N1', location: 'Entrance A', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111112' },
  { id: '22222222-2222-2222-2222-222222222239', name: 'BGD-F1', location: 'Entrance B', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111112' },
  { id: '22222222-2222-2222-2222-222222222240', name: 'BGD-F2', location: 'Ring Road', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111112' },
  { id: '22222222-2222-2222-2222-222222222241', name: 'HTG-N1', location: 'Bay 1', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111113' },
  { id: '22222222-2222-2222-2222-222222222242', name: 'HTG-N2', location: 'Bay 3', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111113' },
  { id: '22222222-2222-2222-2222-222222222243', name: 'HTG-F1', location: 'Bay 2', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111113' },
  { id: '22222222-2222-2222-2222-222222222244', name: 'HTG-F2', location: 'Bay 4', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111113' },
  { id: '22222222-2222-2222-2222-222222222245', name: 'SDN-N1', location: 'North Wing', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111114' },
  { id: '22222222-2222-2222-2222-222222222246', name: 'SDN-N2', location: 'Main Gate', status: 'available', power_kw: 7.4, charger_type: 'normal', price_per_min: PRICE_NORMAL, station_id: '11111111-1111-1111-1111-111111111114' },
  { id: '22222222-2222-2222-2222-222222222247', name: 'SDN-F1', location: 'South Wing', status: 'available', power_kw: 50, charger_type: 'fast', price_per_min: PRICE_FAST, station_id: '11111111-1111-1111-1111-111111111114' },
];

async function seedChargersOnly() {
  try {
    console.log('\n🔌 Seeding chargers (no other collections will be modified)...');
    const batch = writeBatch(db);
    const col = collection(db, 'chargers');
    MOCK_CHARGERS.forEach((c) => {
      const ref = doc(col, c.id);
      batch.set(ref, { ...c, created_at: Timestamp.now().toDate().toISOString() });
    });
    await batch.commit();
    console.log(`   ✓ Inserted/updated ${MOCK_CHARGERS.length} chargers`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding chargers:', err?.message ?? err);
    process.exit(1);
  }
}

seedChargersOnly();

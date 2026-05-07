#!/usr/bin/env node

/**
 * Firestore Seed Script for Smart Slot Charge
 * Populates Firestore with collections: stations, chargers, slots, bookings, payments, users
 * 
 * Usage:
 *   npm run seed:firebase
 * 
 * This script seeds the database with realistic data for demonstration.
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { readFileSync, existsSync } from "node:fs";

// Load .env file manually
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
  console.error("❌ Missing Firebase config. Check your .env file.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRICE_NORMAL = 2; // ₹2/min → ₹120/hr
const PRICE_FAST = 5;   // ₹5/min → ₹300/hr

const STATIONS = [
  { id: "11111111-1111-1111-1111-111111111101", name: "VoltSlot Mysore Palace", address: "Sayyaji Rao Rd, Agrahara, Mysore", latitude: 12.3052, longitude: 76.6552, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111102", name: "VoltSlot Vijayanagar", address: "Vijayanagar 1st Stage, Mysore", latitude: 12.3174, longitude: 76.6132, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111103", name: "VoltSlot Kuvempunagar", address: "Kuvempunagar Main Rd, Mysore", latitude: 12.2958, longitude: 76.6394, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111104", name: "VoltSlot Hebbal", address: "Hebbal Industrial Area, Mysore", latitude: 12.338, longitude: 76.648, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111105", name: "VoltSlot Saraswathipuram", address: "Saraswathipuram, Mysore", latitude: 12.312, longitude: 76.6345, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111106", name: "VoltSlot Gokulam", address: "Gokulam 3rd Stage, Mysore", latitude: 12.323, longitude: 76.635, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111107", name: "VoltSlot JP Nagar", address: "JP Nagar, near Ring Road, Mysore", latitude: 12.285, longitude: 76.665, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111108", name: "VoltSlot Infosys Campus", address: "Infosys Campus, Hebbal, Mysore", latitude: 12.346, longitude: 76.616, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111109", name: "VoltSlot Chamundi Hill", address: "Chamundi Hill Rd, Mysore", latitude: 12.2724, longitude: 76.67, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111110", name: "VoltSlot Jayalakshmipuram", address: "Jayalakshmipuram, Mysore", latitude: 12.311, longitude: 76.647, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111111", name: "VoltSlot Devaraja Market", address: "Devaraja Urs Rd, Mysore", latitude: 12.308, longitude: 76.654, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111112", name: "VoltSlot Bogadi", address: "Bogadi Main Rd, Mysore", latitude: 12.278, longitude: 76.62, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111113", name: "VoltSlot Hootagalli", address: "Hootagalli Industrial Area, Mysore", latitude: 12.355, longitude: 76.598, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111114", name: "VoltSlot Siddarthanagar", address: "Siddarthanagar, Mysore", latitude: 12.29, longitude: 76.61, total_chargers: 3 },
];

// Sample chargers across stations
const CHARGERS = [
  // Mysore Palace (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222201", name: "MYP-N1", location: "Parking Bay A", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111101" },
  { id: "22222222-2222-2222-2222-222222222202", name: "MYP-N2", location: "Parking Bay B", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111101" },
  { id: "22222222-2222-2222-2222-222222222203", name: "MYP-F1", location: "Main Entrance", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111101" },
  { id: "22222222-2222-2222-2222-222222222204", name: "MYP-F2", location: "East Wing", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111101" },
  // Vijayanagar (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222205", name: "VJN-N1", location: "Ground Floor", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111102" },
  { id: "22222222-2222-2222-2222-222222222206", name: "VJN-N2", location: "Visitor Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111102" },
  { id: "22222222-2222-2222-2222-222222222207", name: "VJN-F1", location: "Basement Level", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111102" },
  { id: "22222222-2222-2222-2222-222222222248", name: "VJN-F2", location: "Level 1 Parking", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111102" },
  // Kuvempunagar (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222208", name: "KVP-N1", location: "Block A", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111103" },
  { id: "22222222-2222-2222-2222-222222222209", name: "KVP-F1", location: "Block B", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111103" },
  { id: "22222222-2222-2222-2222-222222222210", name: "KVP-F2", location: "Basement", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111103" },
  // Hebbal (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222211", name: "HBL-N1", location: "Rear Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111104" },
  { id: "22222222-2222-2222-2222-222222222212", name: "HBL-N2", location: "Side Bay", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111104" },
  { id: "22222222-2222-2222-2222-222222222213", name: "HBL-F1", location: "Main Gate", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111104" },
  { id: "22222222-2222-2222-2222-222222222214", name: "HBL-F2", location: "Loading Zone", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111104" },
  // Saraswathipuram (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222215", name: "SRS-N1", location: "North Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111105" },
  { id: "22222222-2222-2222-2222-222222222216", name: "SRS-N2", location: "Library Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111105" },
  { id: "22222222-2222-2222-2222-222222222217", name: "SRS-F1", location: "South Side", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111105" },
  // Gokulam (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222218", name: "GKL-N1", location: "Zone 1", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111106" },
  { id: "22222222-2222-2222-2222-222222222219", name: "GKL-F1", location: "Zone 2", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111106" },
  { id: "22222222-2222-2222-2222-222222222220", name: "GKL-F2", location: "Visitor Spot", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111106" },
  // JP Nagar (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222221", name: "JPN-N1", location: "East Entry", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111107" },
  { id: "22222222-2222-2222-2222-222222222222", name: "JPN-N2", location: "Park Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111107" },
  { id: "22222222-2222-2222-2222-222222222223", name: "JPN-F1", location: "West Entry", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111107" },
  { id: "22222222-2222-2222-2222-222222222224", name: "JPN-F2", location: "South Entry", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111107" },
  // Infosys (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222225", name: "INF-N1", location: "Gate 1 Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111108" },
  { id: "22222222-2222-2222-2222-222222222226", name: "INF-N2", location: "Visitor Lot", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111108" },
  { id: "22222222-2222-2222-2222-222222222227", name: "INF-F1", location: "Gate 3 Parking", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111108" },
  // Chamundi Hill (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222228", name: "CHM-N1", location: "Base Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111109" },
  { id: "22222222-2222-2222-2222-222222222229", name: "CHM-F1", location: "Top Parking", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111109" },
  { id: "22222222-2222-2222-2222-222222222230", name: "CHM-F2", location: "Temple View", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111109" },
  // Jayalakshmipuram (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222231", name: "JLP-N1", location: "Main Road", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111110" },
  { id: "22222222-2222-2222-2222-222222222232", name: "JLP-N2", location: "Circle Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111110" },
  { id: "22222222-2222-2222-2222-222222222233", name: "JLP-F1", location: "Back Lane", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111110" },
  { id: "22222222-2222-2222-2222-222222222234", name: "JLP-F2", location: "Mall Entry", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111110" },
  // Devaraja Market (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222235", name: "DVR-N1", location: "Market East", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111111" },
  { id: "22222222-2222-2222-2222-222222222236", name: "DVR-N2", location: "Market South", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111111" },
  { id: "22222222-2222-2222-2222-222222222237", name: "DVR-F1", location: "Market West", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111111" },
  // Bogadi (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222238", name: "BGD-N1", location: "Entrance A", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111112" },
  { id: "22222222-2222-2222-2222-222222222239", name: "BGD-F1", location: "Entrance B", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111112" },
  { id: "22222222-2222-2222-2222-222222222240", name: "BGD-F2", location: "Ring Road", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111112" },
  // Hootagalli (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222241", name: "HTG-N1", location: "Bay 1", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111113" },
  { id: "22222222-2222-2222-2222-222222222242", name: "HTG-N2", location: "Bay 3", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111113" },
  { id: "22222222-2222-2222-2222-222222222243", name: "HTG-F1", location: "Bay 2", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111113" },
  { id: "22222222-2222-2222-2222-222222222244", name: "HTG-F2", location: "Bay 4", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111113" },
  // Siddarthanagar (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222245", name: "SDN-N1", location: "North Wing", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111114" },
  { id: "22222222-2222-2222-2222-222222222246", name: "SDN-N2", location: "Main Gate", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111114" },
  { id: "22222222-2222-2222-2222-222222222247", name: "SDN-F1", location: "South Wing", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111114" },
];

function addMinutes(time, mins) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function isoDate(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split("T")[0];
}

function withCreatedAt(record) {
  return {
    ...record,
    created_at: Timestamp.now().toDate().toISOString(),
  };
}

async function writeInBatches(collectionName, records) {
  let batch = writeBatch(db);
  let count = 0;

  for (const record of records) {
    batch.set(doc(db, collectionName, record.id), record);
    count += 1;

    if (count >= 400) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }
}

function buildSlots() {
  const slots = [];
  const slotStartMinutes = 0;
  const slotEndMinutes = 24 * 60;

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const dateStr = isoDate(dayOffset);

    for (let minutes = slotStartMinutes; minutes < slotEndMinutes; minutes += 30) {
      const startTime = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      const endTime = addMinutes(startTime, 30);

      for (const station of STATIONS) {
        slots.push({
          id: `${dateStr}-${station.id}-${startTime.replace(":", "")}-${endTime.replace(":", "")}`,
          station_id: station.id,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          status: "available",
          created_at: Timestamp.now().toDate().toISOString(),
        });
      }
    }
  }

  return slots;
}

async function seed() {
  try {
    console.log("\n🚀 Starting Firestore Seed (stations, chargers, slots)\n");

    console.log("  📍 Stations...");
    await writeInBatches("stations", STATIONS.map(withCreatedAt));
    console.log(`     ✓ ${STATIONS.length} stations written`);

    console.log("  🔌 Chargers...");
    await writeInBatches("chargers", CHARGERS.map(withCreatedAt));
    console.log(`     ✓ ${CHARGERS.length} chargers written`);

    console.log("  ⏰ Slots...");
    const slots = buildSlots();
    await writeInBatches("slots", slots);
    console.log(`     ✓ ${slots.length} slots written`);

    console.log("\n✅ Seeding complete!\n");
    console.log("📊 Collections created:");
    console.log("   • stations (14 locations across Mysore)");
    console.log("   • chargers (available at each station)");
    console.log("   • slots (30-min intervals for 7 days)");
    console.log("   • users/bookings/payments intentionally left empty");
    console.log("\n🎯 View these in Firebase Console!");
    console.log(`   📍 Project: ${firebaseConfig.projectId}\n`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

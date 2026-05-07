#!/usr/bin/env node

/**
 * Firestore Seed Script for Smart Slot Charge
 * Populates Firestore with collections: stations, chargers, slots, bookings, payments, users
 * 
 * Usage:
 *   node seed_firestore.js
 * 
 * Requires environment variables:
 *   VITE_FIREBASE_API_KEY
 *   VITE_FIREBASE_AUTH_DOMAIN
 *   VITE_FIREBASE_PROJECT_ID
 *   VITE_FIREBASE_STORAGE_BUCKET
 *   VITE_FIREBASE_MESSAGING_SENDER_ID
 *   VITE_FIREBASE_APP_ID
 *   VITE_FIREBASE_MEASUREMENT_ID
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  writeBatch,
  getDocs,
  deleteDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRICE_NORMAL = 2; // ₹2/min for Normal (7.4 kW AC) → ₹120/hr
const PRICE_FAST = 5; // ₹5/min for Fast (50 kW DC) → ₹300/hr

// 14 Mysore stations
const MOCK_STATIONS = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    name: 'VoltSlot Mysore Palace',
    address: 'Sayyaji Rao Rd, Agrahara, Mysore',
    latitude: 12.3052,
    longitude: 76.6552,
    total_chargers: 4,
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    name: 'VoltSlot Vijayanagar',
    address: 'Vijayanagar 1st Stage, Mysore',
    latitude: 12.3174,
    longitude: 76.6132,
    total_chargers: 4,
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    name: 'VoltSlot Kuvempunagar',
    address: 'Kuvempunagar Main Rd, Mysore',
    latitude: 12.2958,
    longitude: 76.6394,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    name: 'VoltSlot Hebbal',
    address: 'Hebbal Industrial Area, Mysore',
    latitude: 12.338,
    longitude: 76.648,
    total_chargers: 4,
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    name: 'VoltSlot Saraswathipuram',
    address: 'Saraswathipuram, Mysore',
    latitude: 12.312,
    longitude: 76.6345,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    name: 'VoltSlot Gokulam',
    address: 'Gokulam 3rd Stage, Mysore',
    latitude: 12.323,
    longitude: 76.635,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    name: 'VoltSlot JP Nagar',
    address: 'JP Nagar, near Ring Road, Mysore',
    latitude: 12.285,
    longitude: 76.665,
    total_chargers: 4,
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    name: 'VoltSlot Infosys Campus',
    address: 'Infosys Campus, Hebbal, Mysore',
    latitude: 12.346,
    longitude: 76.616,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111109',
    name: 'VoltSlot Chamundi Hill',
    address: 'Chamundi Hill Rd, Mysore',
    latitude: 12.2724,
    longitude: 76.67,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111110',
    name: 'VoltSlot Jayalakshmipuram',
    address: 'Jayalakshmipuram, Mysore',
    latitude: 12.311,
    longitude: 76.647,
    total_chargers: 4,
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'VoltSlot Devaraja Market',
    address: 'Devaraja Urs Rd, Mysore',
    latitude: 12.308,
    longitude: 76.654,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    name: 'VoltSlot Bogadi',
    address: 'Bogadi Main Rd, Mysore',
    latitude: 12.278,
    longitude: 76.62,
    total_chargers: 3,
  },
  {
    id: '11111111-1111-1111-1111-111111111113',
    name: 'VoltSlot Hootagalli',
    address: 'Hootagalli Industrial Area, Mysore',
    latitude: 12.355,
    longitude: 76.598,
    total_chargers: 4,
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    name: 'VoltSlot Siddarthanagar',
    address: 'Siddarthanagar, Mysore',
    latitude: 12.29,
    longitude: 76.61,
    total_chargers: 3,
  },
];

// Sample chargers per station
const MOCK_CHARGERS = [
  // Mysore Palace (2 normal, 2 fast)
  {
    id: '22222222-2222-2222-2222-222222222201',
    name: 'MYP-N1',
    location: 'Parking Bay A',
    status: 'available',
    power_kw: 7.4,
    charger_type: 'normal',
    price_per_min: PRICE_NORMAL,
    station_id: '11111111-1111-1111-1111-111111111101',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    name: 'MYP-N2',
    location: 'Parking Bay B',
    status: 'available',
    power_kw: 7.4,
    charger_type: 'normal',
    price_per_min: PRICE_NORMAL,
    station_id: '11111111-1111-1111-1111-111111111101',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    name: 'MYP-F1',
    location: 'Main Entrance',
    status: 'available',
    power_kw: 50,
    charger_type: 'fast',
    price_per_min: PRICE_FAST,
    station_id: '11111111-1111-1111-1111-111111111101',
  },
  {
    id: '22222222-2222-2222-2222-222222222204',
    name: 'MYP-F2',
    location: 'East Wing',
    status: 'available',
    power_kw: 50,
    charger_type: 'fast',
    price_per_min: PRICE_FAST,
    station_id: '11111111-1111-1111-1111-111111111101',
  },
  // Vijayanagar (2 normal, 2 fast)
  {
    id: '22222222-2222-2222-2222-222222222205',
    name: 'VJN-N1',
    location: 'Ground Floor',
    status: 'available',
    power_kw: 7.4,
    charger_type: 'normal',
    price_per_min: PRICE_NORMAL,
    station_id: '11111111-1111-1111-1111-111111111102',
  },
  {
    id: '22222222-2222-2222-2222-222222222206',
    name: 'VJN-N2',
    location: 'Visitor Parking',
    status: 'available',
    power_kw: 7.4,
    charger_type: 'normal',
    price_per_min: PRICE_NORMAL,
    station_id: '11111111-1111-1111-1111-111111111102',
  },
  {
    id: '22222222-2222-2222-2222-222222222207',
    name: 'VJN-F1',
    location: 'Basement Level',
    status: 'available',
    power_kw: 50,
    charger_type: 'fast',
    price_per_min: PRICE_FAST,
    station_id: '11111111-1111-1111-1111-111111111102',
  },
  {
    id: '22222222-2222-2222-2222-222222222248',
    name: 'VJN-F2',
    location: 'Level 1 Parking',
    status: 'available',
    power_kw: 50,
    charger_type: 'fast',
    price_per_min: PRICE_FAST,
    station_id: '11111111-1111-1111-1111-111111111102',
  },
];

async function clearCollection(collectionName) {
  console.log(`\n🗑️  Clearing existing ${collectionName} collection...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const batch = writeBatch(db);
  let count = 0;

  snapshot.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  if (count > 0) {
    await batch.commit();
    console.log(`   ✓ Deleted ${count} documents from ${collectionName}`);
  } else {
    console.log(`   ✓ Collection was empty`);
  }
}

async function seedStations() {
  console.log('\n📍 Seeding Stations...');
  const batch = writeBatch(db);
  const stationsCol = collection(db, 'stations');

  MOCK_STATIONS.forEach((station) => {
    const docRef = doc(stationsCol, station.id);
    batch.set(docRef, {
      ...station,
      created_at: Timestamp.now().toDate().toISOString(),
    });
  });

  await batch.commit();
  console.log(`   ✓ Created ${MOCK_STATIONS.length} stations`);
}

async function seedChargers() {
  console.log('\n🔌 Seeding Chargers...');
  const batch = writeBatch(db);
  const chargersCol = collection(db, 'chargers');

  MOCK_CHARGERS.forEach((charger) => {
    const docRef = doc(chargersCol, charger.id);
    batch.set(docRef, charger);
  });

  await batch.commit();
  console.log(`   ✓ Created ${MOCK_CHARGERS.length} chargers`);
}

async function seedSlots() {
  console.log('\n⏰ Seeding Slots for next 7 days...');
  const batch = writeBatch(db);
  const slotsCol = collection(db, 'slots');
  let slotCount = 0;

  // Generate slots for next 7 days, every 30 minutes
  const today = new Date();
  const chargerIds = MOCK_CHARGERS.map((c) => c.id);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const slotDate = new Date(today);
    slotDate.setDate(slotDate.getDate() + dayOffset);
    const dateStr = slotDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Generate 30-min slots from 6 AM to 10 PM
    for (let hour = 6; hour < 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMin = minute === 30 ? 0 : 30;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

        // Create a slot for each charger
        chargerIds.forEach((chargerId) => {
          const slotId = `${dateStr}-${chargerId}-${startTime.replace(':', '')}-${endTime.replace(':', '')}`;
          const docRef = doc(slotsCol, slotId);

          batch.set(docRef, {
            id: slotId,
            charger_id: chargerId,
            station_id: MOCK_CHARGERS.find((c) => c.id === chargerId)?.station_id,
            date: dateStr,
            start_time: startTime,
            end_time: endTime,
            status: 'available',
            created_at: Timestamp.now().toDate().toISOString(),
          });

          slotCount++;
        });
      }
    }
  }

  await batch.commit();
  console.log(`   ✓ Created ${slotCount} slots (30-min intervals × chargers × 7 days)`);
}

async function seedUsers() {
  console.log('\n👤 Seeding Sample Users...');

  const sampleUsers = [
    {
      id: 'user-demo-001',
      fullName: 'Rahul Kumar',
      email: 'rahul@example.com',
      role: 'user',
      created_at: Timestamp.now().toDate().toISOString(),
    },
    {
      id: 'user-demo-002',
      fullName: 'Priya Singh',
      email: 'priya@example.com',
      role: 'user',
      created_at: Timestamp.now().toDate().toISOString(),
    },
  ];

  const batch = writeBatch(db);
  const usersCol = collection(db, 'users');

  sampleUsers.forEach((user) => {
    const docRef = doc(usersCol, user.id);
    batch.set(docRef, user);
  });

  await batch.commit();
  console.log(`   ✓ Created ${sampleUsers.length} sample users`);
}

async function seedBookingsAndPayments() {
  console.log('\n📅 Seeding Sample Bookings & Payments...');

  // Create a sample booking from today at 10:00 AM for 1 hour on first charger
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const bookingId = `booking-demo-${Date.now()}`;
  const paymentId = `payment-demo-${Date.now()}`;

  const booking = {
    id: bookingId,
    user_id: 'user-demo-001',
    charger_id: MOCK_CHARGERS[0].id,
    station_id: MOCK_CHARGERS[0].station_id,
    date: dateStr,
    start_time: '10:00',
    end_time: '11:00',
    duration_min: 60,
    status: 'active',
    payment_status: 'paid',
    amount: 120, // ₹2/min × 60 min
    charger_type: MOCK_CHARGERS[0].charger_type,
    created_at: Timestamp.now().toDate().toISOString(),
  };

  const payment = {
    id: paymentId,
    booking_id: bookingId,
    amount: 120,
    status: 'paid',
    transaction_id: `TXN-${Date.now()}`,
    payment_method: 'demo_upi',
    created_at: Timestamp.now().toDate().toISOString(),
  };

  const batch = writeBatch(db);
  const bookingsRef = doc(collection(db, 'bookings'), bookingId);
  const paymentsRef = doc(collection(db, 'payments'), paymentId);

  batch.set(bookingsRef, booking);
  batch.set(paymentsRef, payment);

  await batch.commit();
  console.log(`   ✓ Created 1 sample booking and payment`);
}

async function main() {
  try {
    console.log('\n🚀 Starting Firestore Seed Script...');
    console.log(`📦 Project ID: ${process.env.VITE_FIREBASE_PROJECT_ID}`);

    // Clear existing data
    await clearCollection('stations');
    await clearCollection('chargers');
    await clearCollection('slots');
    await clearCollection('users');
    await clearCollection('bookings');
    await clearCollection('payments');

    // Seed collections
    await seedStations();
    await seedChargers();
    await seedSlots();
    await seedUsers();
    await seedBookingsAndPayments();

    console.log('\n✅ Firestore seeding completed successfully!');
    console.log('\n📊 Collections created:');
    console.log('   • stations (14 locations)');
    console.log('   • chargers (sample chargers)');
    console.log('   • slots (7 days × 32 slots/day × chargers)');
    console.log('   • users (2 demo users)');
    console.log('   • bookings (1 sample booking)');
    console.log('   • payments (1 sample payment)');
    console.log('\n🎯 You can now view these in Firebase Console!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message);
    process.exit(1);
  }
}

main();

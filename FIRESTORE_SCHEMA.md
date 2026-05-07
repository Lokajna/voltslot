# Firestore Database Schema - Smart Slot Charge

This document describes the Firestore collections and data structure for the Smart Slot Charge EV charging booking platform.

## Overview

The database uses **Google Cloud Firestore** (NoSQL document database) with the following collections:

1. **stations** - EV charging station locations
2. **chargers** - Physical charging equipment at stations
3. **slots** - Time slots for charger availability
4. **bookings** - User booking records
5. **payments** - Payment transaction records
6. **users** - User profile information

## Collections Schema

### 1. `stations` Collection

Represents physical EV charging stations across Mysore.

**Document ID**: UUID (e.g., `11111111-1111-1111-1111-111111111101`)

**Fields**:
```
{
  name: string,                 // "VoltSlot Mysore Palace"
  address: string,              // "Sayyaji Rao Rd, Agrahara, Mysore"
  latitude: number,             // 12.3052
  longitude: number,            // 76.6552
  total_chargers: number,       // 4
  created_at: string (ISO)      // "2026-05-06T10:30:00Z"
}
```

**Example**:
```json
{
  "id": "11111111-1111-1111-1111-111111111101",
  "name": "VoltSlot Mysore Palace",
  "address": "Sayyaji Rao Rd, Agrahara, Mysore",
  "latitude": 12.3052,
  "longitude": 76.6552,
  "total_chargers": 4,
  "created_at": "2026-05-06T10:30:00Z"
}
```

**Total Records**: 14 stations (all in Mysore)

---

### 2. `chargers` Collection

Physical charging equipment installed at each station.

**Document ID**: UUID (e.g., `22222222-2222-2222-2222-222222222201`)

**Fields**:
```
{
  id: string,                   // Unique charger ID
  name: string,                 // "MYP-N1" (station code + type)
  location: string,             // "Parking Bay A"
  status: enum,                 // "available" | "in-use" | "maintenance"
  power_kw: number,             // 7.4 (normal) or 50 (fast)
  charger_type: enum,           // "normal" | "fast"
  price_per_min: number,        // 2 (₹/min normal) or 5 (₹/min fast)
  station_id: string            // Foreign key to stations
}
```

**Charger Types**:
- **Normal (7.4 kW AC)**: ₹2/min → ₹120/hr
- **Fast (50 kW DC)**: ₹5/min → ₹300/hr

**Example**:
```json
{
  "id": "22222222-2222-2222-2222-222222222201",
  "name": "MYP-N1",
  "location": "Parking Bay A",
  "status": "available",
  "power_kw": 7.4,
  "charger_type": "normal",
  "price_per_min": 2,
  "station_id": "11111111-1111-1111-1111-111111111101"
}
```

**Total Records**: ~40+ chargers (multiple per station)

---

### 3. `slots` Collection

Time slots representing charger availability. Generated for each charger in 30-minute intervals.

**Document ID**: Composite key (e.g., `2026-05-06-22222222-2222-2222-2222-222222222201-1000-1030`)

**Fields**:
```
{
  id: string,                   // Unique slot identifier
  charger_id: string,           // Foreign key to chargers
  station_id: string,           // Foreign key to stations
  date: string,                 // "2026-05-06" (YYYY-MM-DD)
  start_time: string,           // "10:00" (HH:MM)
  end_time: string,             // "10:30" (HH:MM)
  status: enum,                 // "available" | "booked"
  created_at: string (ISO)      // "2026-05-06T10:30:00Z"
}
```

**Example**:
```json
{
  "id": "2026-05-06-22222222-2222-2222-2222-222222222201-1000-1030",
  "charger_id": "22222222-2222-2222-2222-222222222201",
  "station_id": "11111111-1111-1111-1111-111111111101",
  "date": "2026-05-06",
  "start_time": "10:00",
  "end_time": "10:30",
  "status": "available",
  "created_at": "2026-05-06T10:30:00Z"
}
```

**Slot Coverage**:
- Time: 6:00 AM to 10:00 PM (16 hours)
- Interval: 30 minutes
- Duration: 7 days (next week)
- **Total Records**: ~3,200+ slots (40 chargers × 32 slots/day × 7 days)

---

### 4. `bookings` Collection

Records user reservations for charging sessions.

**Document ID**: UUID with timestamp (e.g., `booking-demo-1704528600000`)

**Fields**:
```
{
  id: string,                   // Booking ID
  user_id: string,              // Foreign key to users
  charger_id: string,           // Foreign key to chargers
  station_id: string,           // Foreign key to stations
  date: string,                 // "2026-05-06" (booking date)
  start_time: string,           // "10:00" (HH:MM)
  end_time: string,             // "11:00" (HH:MM)
  duration_min: number,         // 60
  status: enum,                 // "active" | "completed" | "cancelled"
  payment_status: enum,         // "pending" | "paid" | "refunded"
  amount: number,               // Total cost in ₹
  charger_type: enum,           // "normal" | "fast"
  created_at: string (ISO)      // "2026-05-06T10:30:00Z"
}
```

**Example**:
```json
{
  "id": "booking-demo-1704528600000",
  "user_id": "user-demo-001",
  "charger_id": "22222222-2222-2222-2222-222222222201",
  "station_id": "11111111-1111-1111-1111-111111111101",
  "date": "2026-05-06",
  "start_time": "10:00",
  "end_time": "11:00",
  "duration_min": 60,
  "status": "active",
  "payment_status": "paid",
  "amount": 120,
  "charger_type": "normal",
  "created_at": "2026-05-06T10:30:00Z"
}
```

**Sample Data**: 1 demo booking provided by default

---

### 5. `payments` Collection

Payment transaction records linked to bookings.

**Document ID**: UUID with timestamp (e.g., `payment-demo-1704528600000`)

**Fields**:
```
{
  id: string,                   // Payment ID
  booking_id: string,           // Foreign key to bookings
  amount: number,               // Payment amount in ₹
  status: enum,                 // "pending" | "paid" | "refunded"
  transaction_id: string,       // Unique transaction identifier
  payment_method: string,       // "demo_upi" | "credit_card" | etc.
  created_at: string (ISO)      // "2026-05-06T10:30:00Z"
}
```

**Example**:
```json
{
  "id": "payment-demo-1704528600000",
  "booking_id": "booking-demo-1704528600000",
  "amount": 120,
  "status": "paid",
  "transaction_id": "TXN-1704528600000",
  "payment_method": "demo_upi",
  "created_at": "2026-05-06T10:30:00Z"
}
```

**Sample Data**: 1 demo payment provided by default

---

### 6. `users` Collection

User profile information.

**Document ID**: UUID (e.g., `user-demo-001`)

**Fields**:
```
{
  id: string,                   // User ID
  fullName: string,             // "Rahul Kumar"
  email: string,                // "rahul@example.com"
  role: enum,                   // "user"
  created_at: string (ISO)      // "2026-05-06T10:30:00Z"
}
```

**Example**:
```json
{
  "id": "user-demo-001",
  "fullName": "Rahul Kumar",
  "email": "rahul@example.com",
  "role": "user",
  "created_at": "2026-05-06T10:30:00Z"
}
```

**Sample Data**: 2 demo users provided by default

---

## Key Relationships

### Foreign Keys (Relationships)

```
bookings.user_id       → users.id
bookings.charger_id    → chargers.id
bookings.station_id    → stations.id

payments.booking_id    → bookings.id

chargers.station_id    → stations.id

slots.charger_id       → chargers.id
slots.station_id       → stations.id
```

### Indexes (Recommended for Performance)

1. **bookings**: 
   - `user_id` + `date`
   - `status` + `payment_status`

2. **slots**: 
   - `station_id` + `date` + `status`
   - `charger_id` + `date` + `status`

3. **payments**: 
   - `booking_id`
   - `status` + `created_at`

---

## Seeding the Database

### Step 1: Set Up Environment

Ensure your `.env` file contains Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 2: Run the Seed Script

```bash
npm run seed:firebase
```

**Expected Output**:
```
🚀 Starting Firestore Seed

🗑️  Clearing existing data:
  Clearing stations...
  Clearing chargers...
  Clearing slots...
  Clearing users...
  Clearing bookings...
  Clearing payments...

📝 Creating collections:

  📍 Stations...
     ✓ 14 stations created
  🔌 Chargers...
     ✓ 40 chargers created
  ⏰ Slots (7 days)...
     ✓ 3200 slots created
  👤 Users...
     ✓ 2 users created
  📅 Bookings & Payments...
     ✓ 1 booking and payment created

✅ Seeding complete!

📊 Collections created:
   • stations (14 locations across Mysore)
   • chargers (available at each station)
   • slots (30-min intervals for 7 days)
   • users (2 demo accounts)
   • bookings (1 sample booking)
   • payments (1 sample payment)

🎯 View these in Firebase Console!
   📍 Project: your_project_id
```

---

## Viewing in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on each collection to view the documents

---

## Data Statistics

| Collection | Document Count | Sample |
|-----------|----------------|---------|
| **stations** | 14 | All Mysore locations |
| **chargers** | 40+ | Normal & Fast chargers per station |
| **slots** | ~3,200 | 7 days × 32 slots/day × chargers |
| **users** | 2 | Demo users for testing |
| **bookings** | 1+ | Sample demo booking |
| **payments** | 1+ | Sample demo payment |
| **Total** | **~3,257+** | Full working dataset |

---

## Security Rules (To Be Configured)

For production, add these Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only read their own user documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Users can create bookings for themselves
    match /bookings/{bookingId} {
      allow create: if request.auth.uid == request.resource.data.user_id;
      allow read: if request.auth.uid == resource.data.user_id;
      allow update: if request.auth.uid == resource.data.user_id;
    }
    
    // Payments are read-only for users
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Public read access to stations, chargers, and slots
    match /stations/{document=**} {
      allow read: if request.auth != null;
    }
    
    match /chargers/{document=**} {
      allow read: if request.auth != null;
    }
    
    match /slots/{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

---

## Notes

- All timestamps are stored in ISO 8601 format (`YYYY-MM-DDTHH:MM:SSZ`)
- Prices are in Indian Rupees (₹)
- Times are in 24-hour format (HH:MM)
- The database is optimized for real-time queries using Firestore listeners
- Slots are pre-generated for 7 days to avoid runtime overhead
- Demo bookings are created to test the payment and notification flows

---

**Document Version**: 1.0  
**Last Updated**: May 6, 2026  
**Database**: Google Cloud Firestore (NoSQL)

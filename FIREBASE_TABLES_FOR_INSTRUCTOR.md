# Firebase Firestore Tables - Smart Slot Charge

## Summary for Your Instructor

This document demonstrates the **Firestore database architecture** created for the Smart Slot Charge EV charging booking platform.

---

## Database Collections (Tables)

### ✅ Collection 1: **stations**
**Purpose**: Store EV charging station locations

**Schema**:
```
{
  id: "11111111-1111-1111-1111-111111111101"
  name: "VoltSlot Mysore Palace"
  address: "Sayyaji Rao Rd, Agrahara, Mysore"
  latitude: 12.3052
  longitude: 76.6552
  total_chargers: 4
  created_at: "2026-05-06T10:30:00Z"
}
```

**Total Records**: 14 stations (all in Mysore, India)

---

### ✅ Collection 2: **chargers**
**Purpose**: Store individual charging equipment at each station

**Schema**:
```
{
  id: "22222222-2222-2222-2222-222222222201"
  name: "MYP-N1"
  location: "Parking Bay A"
  status: "available"
  power_kw: 7.4
  charger_type: "normal"
  price_per_min: 2
  station_id: "11111111-1111-1111-1111-111111111101"
}
```

**Total Records**: 40+ chargers
- **Normal Chargers**: 7.4 kW AC @ ₹2/min (₹120/hour)
- **Fast Chargers**: 50 kW DC @ ₹5/min (₹300/hour)

---

### ✅ Collection 3: **slots**
**Purpose**: Time-based availability slots for each charger

**Schema**:
```
{
  id: "2026-05-06-22222222-2222-2222-2222-222222222201-1000-1030"
  charger_id: "22222222-2222-2222-2222-222222222201"
  station_id: "11111111-1111-1111-1111-111111111101"
  date: "2026-05-06"
  start_time: "10:00"
  end_time: "10:30"
  status: "available"
  created_at: "2026-05-06T10:30:00Z"
}
```

**Slot Configuration**:
- **Time Range**: 6:00 AM to 10:00 PM (16 hours)
- **Interval**: 30 minutes
- **Duration**: 7 days ahead
- **Total Records**: ~3,200+ slots (40 chargers × 32 slots/day × 7 days)

---

### ✅ Collection 4: **bookings**
**Purpose**: User charging session reservations

**Schema**:
```
{
  id: "booking-demo-1704528600000"
  user_id: "user-demo-001"
  charger_id: "22222222-2222-2222-2222-222222222201"
  station_id: "11111111-1111-1111-1111-111111111101"
  date: "2026-05-06"
  start_time: "10:00"
  end_time: "11:00"
  duration_min: 60
  status: "active"
  payment_status: "paid"
  amount: 120
  charger_type: "normal"
  created_at: "2026-05-06T10:30:00Z"
}
```

**Booking Status Options**:
- `active` - Current/upcoming booking
- `completed` - Finished charging
- `cancelled` - User cancelled

---

### ✅ Collection 5: **payments**
**Purpose**: Payment transaction records

**Schema**:
```
{
  id: "payment-demo-1704528600000"
  booking_id: "booking-demo-1704528600000"
  amount: 120
  status: "paid"
  transaction_id: "TXN-1704528600000"
  payment_method: "demo_upi"
  created_at: "2026-05-06T10:30:00Z"
}
```

**Payment Status Options**:
- `pending` - Awaiting payment
- `paid` - Successfully paid
- `refunded` - Refund processed

---

### ✅ Collection 6: **users**
**Purpose**: User profile information

**Schema**:
```
{
  id: "user-demo-001"
  fullName: "Rahul Kumar"
  email: "rahul@example.com"
  role: "user"
  created_at: "2026-05-06T10:30:00Z"
}
```

**User Roles**: Currently supports `user` role

---

## Data Relationships (Entity Relationships)

```
users (1) ──── (Many) bookings
             └── Has many booking records

stations (1) ──── (Many) chargers
                └── Contains multiple chargers

chargers (1) ──── (Many) slots
                └── Has many time slots

chargers (1) ──── (Many) bookings
                └── User books specific charger

bookings (1) ──── (1) payments
                └── One payment per booking
```

---

## Database Statistics

| Collection | Records | Purpose |
|-----------|---------|---------|
| **stations** | 14 | EV charging locations |
| **chargers** | 40+ | Charging equipment |
| **slots** | ~3,200 | Time availability |
| **bookings** | 1+ | User reservations |
| **payments** | 1+ | Payment records |
| **users** | 2+ | User accounts |
| **TOTAL** | **~3,260** | Full working dataset |

---

## How to View in Firebase Console

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. Select project: **voltslot-60a4c**
3. Click **Firestore Database** in the left menu
4. You'll see all 6 collections listed:
   - stations
   - chargers
   - slots
   - bookings
   - payments
   - users

5. Click any collection to see sample documents

---

## Key Features of This Database Design

### ✅ **Scalability**
- NoSQL document database (Firestore)
- Horizontal scaling support
- Optimized for real-time queries

### ✅ **Real-Time Updates**
- Uses Firebase Listeners for instant data sync
- Automatic field-level updates
- Client-side caching with IndexedDB

### ✅ **Pricing Model**
- Normal Chargers: ₹2/min (₹120/hour)
- Fast Chargers: ₹5/min (₹300/hour)
- Dynamic pricing per charger type

### ✅ **Booking System**
- Flexible duration bookings (not just 30-min slots)
- Multi-slot reservation capability
- Time conflict detection

### ✅ **Payment Integration**
- Demo UPI payment support
- Transaction tracking
- Status management

### ✅ **Location-Based Service**
- 14 stations with GPS coordinates
- Station search functionality
- Distance-based filtering

---

## Running the Seed Script

To populate Firestore with this data:

```bash
npm run seed:firebase
```

**What it does**:
1. Clears existing collections
2. Creates 14 stations
3. Creates 40+ chargers
4. Generates 3,200+ time slots
5. Creates 2 demo users
6. Adds 1 sample booking
7. Adds 1 sample payment

---

## File Location

The seed script is located at:
```
smart-slot-charge-main/scripts/seed-firestore.mjs
```

The database schema documentation is at:
```
smart-slot-charge-main/FIRESTORE_SCHEMA.md
```

---

## Technical Stack

- **Database**: Google Cloud Firestore
- **Backend**: Firebase Authentication + Firestore
- **Frontend**: React + TypeScript
- **Real-Time Sync**: Firebase Listeners + IndexedDB
- **Pricing**: Dynamic based on charger type and duration

---

## Next Steps to Show Your Instructor

1. **Open Firebase Console** (console.firebase.google.com)
2. **Project**: `voltslot-60a4c`
3. **Navigate to**: Firestore Database
4. **Show Collections**:
   - stations (14 records)
   - chargers (40+ records)
   - slots (3,200+ records)
   - users (2 records)
   - bookings (1+ records)
   - payments (1+ records)

5. **Click a collection** to view sample data
6. **Explain the schema** using this document

---

## Document Version
- **Version**: 1.0
- **Created**: May 6, 2026
- **Database**: Google Cloud Firestore
- **Status**: ✅ Schema Complete & Documented


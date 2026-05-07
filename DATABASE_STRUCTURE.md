# Firebase Firestore - Database Structure & ERD

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│   USERS     │
├─────────────┤
│ id (PK)     │
│ fullName    │
│ email       │
│ role        │
│ created_at  │
└──────┬──────┘
       │ 1
       │
       │ Many
       ▼
┌─────────────────────┐
│   BOOKINGS          │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │ ──────┐
│ charger_id (FK)     │       │
│ station_id (FK)     │       │
│ date                │       │
│ start_time          │       │
│ end_time            │       │
│ duration_min        │       │
│ status              │       │
│ payment_status      │       │
│ amount              │       │
│ charger_type        │       │
│ created_at          │       │
└─────────────────────┘       │
       │ 1                      │
       │                        │
       │ Many                   │
       ▼                        │
┌─────────────────────┐        │
│   PAYMENTS          │        │
├─────────────────────┤        │
│ id (PK)             │        │
│ booking_id (FK)     │ ◄──────┤
│ amount              │        │
│ status              │        │
│ transaction_id      │        │
│ payment_method      │        │
│ created_at          │        │
└─────────────────────┘        │
                                │
┌──────────────┐                │
│  STATIONS    │ ◄──────────────┘
├──────────────┤
│ id (PK)      │
│ name         │
│ address      │
│ latitude     │
│ longitude    │
│ total_chargers
│ created_at   │
└──────┬───────┘
       │ 1
       │
       │ Many
       ▼
┌──────────────────┐
│   CHARGERS       │
├──────────────────┤
│ id (PK)          │
│ name             │
│ location         │
│ status           │
│ power_kw         │
│ charger_type     │
│ price_per_min    │
│ station_id (FK)  │
└──────┬───────────┘
       │ 1
       │
       │ Many
       ▼
┌──────────────────┐
│    SLOTS         │
├──────────────────┤
│ id (PK)          │
│ charger_id (FK)  │
│ station_id (FK)  │
│ date             │
│ start_time       │
│ end_time         │
│ status           │
│ created_at       │
└──────────────────┘
```

---

## Collection Details with Sample Data

### 1. STATIONS (14 records)
```
Station 1: VoltSlot Mysore Palace
├── ID: 11111111-1111-1111-1111-111111111101
├── Location: 12.3052°N, 76.6552°E
├── Chargers: 4 (2 Normal + 2 Fast)
└── Address: Sayyaji Rao Rd, Agrahara, Mysore

Station 2: VoltSlot Vijayanagar
├── ID: 11111111-1111-1111-1111-111111111102
├── Location: 12.3174°N, 76.6132°E
├── Chargers: 4 (2 Normal + 2 Fast)
└── Address: Vijayanagar 1st Stage, Mysore

... (12 more stations)
```

---

### 2. CHARGERS (~40 records)
```
Mysore Palace Station:
├── MYP-N1 (Normal 7.4kW, Bay A) - ₹2/min
├── MYP-N2 (Normal 7.4kW, Bay B) - ₹2/min
├── MYP-F1 (Fast 50kW, Main Entrance) - ₹5/min
└── MYP-F2 (Fast 50kW, East Wing) - ₹5/min

Vijayanagar Station:
├── VJN-N1 (Normal 7.4kW, Ground Floor) - ₹2/min
├── VJN-N2 (Normal 7.4kW, Visitor Parking) - ₹2/min
├── VJN-F1 (Fast 50kW, Basement) - ₹5/min
└── VJN-F2 (Fast 50kW, Level 1) - ₹5/min

... (32+ more chargers)
```

---

### 3. SLOTS (~3,200 records)
```
Date: 2026-05-06 (Monday)
Charger: MYP-N1
├── 06:00-06:30 (available)
├── 06:30-07:00 (available)
├── 07:00-07:30 (available)
├── ...
├── 10:00-10:30 (booked) ← Has booking
├── 10:30-11:00 (booked) ← Has booking
├── 11:00-11:30 (available)
├── ...
└── 21:30-22:00 (available)

[32 slots/day × 40+ chargers × 7 days = 3,200+ slots]
```

---

### 4. USERS (2 demo records)
```
User 1:
├── ID: user-demo-001
├── Name: Rahul Kumar
├── Email: rahul@example.com
└── Role: user

User 2:
├── ID: user-demo-002
├── Name: Priya Singh
├── Email: priya@example.com
└── Role: user
```

---

### 5. BOOKINGS (1+ records)
```
Booking 1: booking-demo-1704528600000
├── User: Rahul Kumar (user-demo-001)
├── Station: VoltSlot Mysore Palace
├── Charger: MYP-N1 (Normal 7.4kW)
├── Date: 2026-05-06
├── Time: 10:00 - 11:00 (1 hour)
├── Duration: 60 minutes
├── Price: ₹2/min × 60 = ₹120
├── Status: active
├── Payment Status: paid
└── Created: 2026-05-06T10:30:00Z
```

---

### 6. PAYMENTS (1+ records)
```
Payment 1: payment-demo-1704528600000
├── Booking: booking-demo-1704528600000
├── Amount: ₹120
├── Status: paid
├── Method: demo_upi
├── Transaction ID: TXN-1704528600000
└── Created: 2026-05-06T10:30:00Z
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BOOKING FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION
   │
   ├─► Firebase Auth
   │   └─► User Profile (users collection)
   │
   └─► AuthContext (React)
       └─► Set Current User

2. BROWSE STATIONS & CHARGERS
   │
   ├─► Load stations (14 records)
   │   │
   │   ├─► Display on map
   │   │
   │   └─► Show nearby chargers (40+)
   │
   └─► Load chargers for selected station

3. VIEW AVAILABLE SLOTS
   │
   ├─► Query slots (3,200+)
   │   │
   │   ├─► Filter by date & charger
   │   │
   │   ├─► Show available slots (status: "available")
   │   │
   │   └─► Calculate pricing
   │       └─► price_per_min × duration_min
   │
   └─► Display SlotGrid

4. SELECT & BOOK
   │
   ├─► User selects:
   │   ├─► Start time
   │   ├─► Duration
   │   └─► Charger type (Normal or Fast)
   │
   ├─► Create booking record:
   │   │
   │   ├─► booking.id = generate UUID
   │   ├─► booking.user_id = current user
   │   ├─► booking.charger_id = selected charger
   │   ├─► booking.amount = price_per_min × duration
   │   ├─► booking.status = "active"
   │   └─► booking.payment_status = "pending"
   │
   └─► OPTIMISTIC UPDATE (UI shows booking immediately)

5. PAYMENT PROCESSING
   │
   ├─► Show PaymentDialog
   │
   ├─► User pays (demo UPI):
   │   │
   │   ├─► Create payment record:
   │   │   ├─► payment.id = generate UUID
   │   │   ├─► payment.booking_id = booking.id
   │   │   ├─► payment.status = "paid"
   │   │   └─► payment.transaction_id = TXN-{timestamp}
   │   │
   │   └─► Update booking:
   │       └─► booking.payment_status = "paid"
   │
   └─► BACKGROUND SYNC to Firestore
       └─► Save to collections

6. CONFIRMATION
   │
   ├─► Show BookingConfirmation
   │
   ├─► Display:
   │   ├─► Booking details
   │   ├─► Charger & Station info
   │   ├─► Amount paid
   │   └─► Booking reference
   │
   └─► Update slots:
       └─► Mark booked slots as "booked"

7. MY BOOKINGS
   │
   ├─► Query bookings (user_id = current user)
   │
   ├─► Split into:
   │   ├─► UPCOMING (status: "active", date >= today)
   │   └─► PAST (status: "completed" OR date < today)
   │
   ├─► Join with chargers & stations:
   │   ├─► charger details (name, power_kw, type)
   │   └─► station details (name, address)
   │
   └─► Display in ActiveBookings component
```

---

## Firestore Features Used

✅ **Real-Time Listeners** (`onSnapshot`)
- Bookings update instantly
- Slots availability syncs
- Payments reflect live

✅ **Batch Writes** (`writeBatch`)
- Atomic operations
- All-or-nothing seeding
- Transactional integrity

✅ **Optimistic Updates**
- UI updates before DB confirms
- Better perceived performance
- Background sync

✅ **IndexedDB Persistence**
- Offline capability
- Local caching
- Survive page reloads

✅ **Query Optimization**
- Indexed fields (user_id, status, date)
- Efficient filtering
- Fast lookups

---

## Collections at a Glance

| Collection | Primary Key | Foreign Keys | Indexes | Growth |
|-----------|-----------|-------------|---------|---------|
| **stations** | `id` (UUID) | — | — | Slow |
| **chargers** | `id` (UUID) | `station_id` | `station_id` | Slow |
| **slots** | Composite | `charger_id`, `station_id` | `charger_id`, `date`, `status` | Fast |
| **bookings** | `id` (UUID) | `user_id`, `charger_id`, `station_id` | `user_id`, `status`, `date` | Medium |
| **payments** | `id` (UUID) | `booking_id` | `booking_id`, `status` | Medium |
| **users** | `id` (UUID) | — | — | Slow |

---

## Performance Considerations

### ✅ Optimizations Implemented

1. **Slot Pre-Generation**
   - Generates 3,200+ slots at seed time
   - Avoids runtime slot creation
   - Faster availability queries

2. **Real-Time Subscriptions**
   - Partial updates only
   - No full collection reloads
   - Real-time sync

3. **Client-Side Persistence**
   - IndexedDB caching
   - Offline reading
   - Graceful sync on reconnect

4. **Optimistic UI**
   - Immediate visual feedback
   - Background DB writes
   - Reduced perceived latency

### ⚠️ Considerations for Scale

- **slots** collection grows fastest (1,024+ per day)
- Consider archiving old slots after date passes
- May need database sharding for >1M documents
- Consider Firestore Security Rules for access control

---

## How to Explain This to Your Instructor

**Say**: "We've built a Google Cloud Firestore database with 6 collections:

1. **stations** (14) - EV charging locations
2. **chargers** (40+) - Physical equipment
3. **slots** (3,200+) - Time availability
4. **bookings** - User reservations
5. **payments** - Payment records
6. **users** - User profiles

The system uses NoSQL for scalability, real-time listeners for live updates, and optimistic UI for better UX."

---


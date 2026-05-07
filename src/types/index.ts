export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user';
}

export type ChargerType = 'normal' | 'fast';

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_chargers: number;
  created_at?: string;
}

export interface Charger {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance';
  power_kw: number;
  charger_type: ChargerType;
  price_per_min: number; // ₹ per minute
  station_id?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  chargerId: string;
  stationId: string;
  date: string;
  status: 'available' | 'booked' | 'unavailable';
  bookedBy?: string;
  remainingSlots?: number;
  chargerType?: ChargerType;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  user_id: string;
  charger_id: string;
  station_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  status: 'active' | 'completed' | 'cancelled';
  payment_status: PaymentStatus;
  amount: number;
  charger_type: ChargerType;
  created_at: string;
  // joined
  chargers?: { name: string; location: string; power_kw: number; charger_type?: ChargerType } | null;
  stations?: { name: string; address: string } | null;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  transaction_id: string;
  created_at: string;
}


 /* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Booking, Charger, ChargerType, Station, TimeSlot, Payment } from "@/types";
import { format } from "date-fns";

export interface DBSlot {
  id: string;
  station_id: string;
  start_time: string;
  end_time: string;
  date?: string;
}

// Pricing per minute
const PRICE_NORMAL = 2;  // ₹2/min for Normal (7.4 kW AC) → ₹120/hr
const PRICE_FAST = 5;    // ₹5/min for Fast (50 kW DC) → ₹300/hr

// 14 Mysore stations
const MOCK_STATIONS: Station[] = [
  { id: "11111111-1111-1111-1111-111111111101", name: "VoltSlot Mysore Palace", address: "Sayyaji Rao Rd, Agrahara, Mysore", latitude: 12.3052, longitude: 76.6552, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111102", name: "VoltSlot Vijayanagar", address: "Vijayanagar 1st Stage, Mysore", latitude: 12.3174, longitude: 76.6132, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111103", name: "VoltSlot Kuvempunagar", address: "Kuvempunagar Main Rd, Mysore", latitude: 12.2958, longitude: 76.6394, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111104", name: "VoltSlot Hebbal", address: "Hebbal Industrial Area, Mysore", latitude: 12.3380, longitude: 76.6480, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111105", name: "VoltSlot Saraswathipuram", address: "Saraswathipuram, Mysore", latitude: 12.3120, longitude: 76.6345, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111106", name: "VoltSlot Gokulam", address: "Gokulam 3rd Stage, Mysore", latitude: 12.3230, longitude: 76.6350, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111107", name: "VoltSlot JP Nagar", address: "JP Nagar, near Ring Road, Mysore", latitude: 12.2850, longitude: 76.6650, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111108", name: "VoltSlot Infosys Campus", address: "Infosys Campus, Hebbal, Mysore", latitude: 12.3460, longitude: 76.6160, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111109", name: "VoltSlot Chamundi Hill", address: "Chamundi Hill Rd, Mysore", latitude: 12.2724, longitude: 76.6700, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111110", name: "VoltSlot Jayalakshmipuram", address: "Jayalakshmipuram, Mysore", latitude: 12.3110, longitude: 76.6470, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111111", name: "VoltSlot Devaraja Market", address: "Devaraja Urs Rd, Mysore", latitude: 12.3080, longitude: 76.6540, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111112", name: "VoltSlot Bogadi", address: "Bogadi Main Rd, Mysore", latitude: 12.2780, longitude: 76.6200, total_chargers: 3 },
  { id: "11111111-1111-1111-1111-111111111113", name: "VoltSlot Hootagalli", address: "Hootagalli Industrial Area, Mysore", latitude: 12.3550, longitude: 76.5980, total_chargers: 4 },
  { id: "11111111-1111-1111-1111-111111111114", name: "VoltSlot Siddarthanagar", address: "Siddarthanagar, Mysore", latitude: 12.2900, longitude: 76.6100, total_chargers: 3 },
];

// Each station gets a mix of Normal and Fast chargers
const MOCK_CHARGERS: Charger[] = [
  // s001 Mysore Palace (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222201", name: "MYP-N1", location: "Parking Bay A", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111101" },
  { id: "22222222-2222-2222-2222-222222222202", name: "MYP-N2", location: "Parking Bay B", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111101" },
  { id: "22222222-2222-2222-2222-222222222203", name: "MYP-F1", location: "Main Entrance", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111101" },
  { id: "22222222-2222-2222-2222-222222222204", name: "MYP-F2", location: "East Wing", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111101" },
  // s002 Vijayanagar (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222205", name: "VJN-N1", location: "Ground Floor", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111102" },
  { id: "22222222-2222-2222-2222-222222222206", name: "VJN-N2", location: "Visitor Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111102" },
  { id: "22222222-2222-2222-2222-222222222207", name: "VJN-F1", location: "Basement Level", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111102" },
  { id: "22222222-2222-2222-2222-222222222248", name: "VJN-F2", location: "Level 1 Parking", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111102" },
  // s003 Kuvempunagar (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222208", name: "KVP-N1", location: "Block A", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111103" },
  { id: "22222222-2222-2222-2222-222222222209", name: "KVP-F1", location: "Block B", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111103" },
  { id: "22222222-2222-2222-2222-222222222210", name: "KVP-F2", location: "Basement", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111103" },
  // s004 Hebbal (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222211", name: "HBL-N1", location: "Rear Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111104" },
  { id: "22222222-2222-2222-2222-222222222212", name: "HBL-N2", location: "Side Bay", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111104" },
  { id: "22222222-2222-2222-2222-222222222213", name: "HBL-F1", location: "Main Gate", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111104" },
  { id: "22222222-2222-2222-2222-222222222214", name: "HBL-F2", location: "Loading Zone", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111104" },
  // s005 Saraswathipuram (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222215", name: "SRS-N1", location: "North Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111105" },
  { id: "22222222-2222-2222-2222-222222222216", name: "SRS-N2", location: "Library Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111105" },
  { id: "22222222-2222-2222-2222-222222222217", name: "SRS-F1", location: "South Side", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111105" },
  // s006 Gokulam (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222218", name: "GKL-N1", location: "Zone 1", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111106" },
  { id: "22222222-2222-2222-2222-222222222219", name: "GKL-F1", location: "Zone 2", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111106" },
  { id: "22222222-2222-2222-2222-222222222220", name: "GKL-F2", location: "Visitor Spot", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111106" },
  // s007 JP Nagar (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222221", name: "JPN-N1", location: "East Entry", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111107" },
  { id: "22222222-2222-2222-2222-222222222222", name: "JPN-N2", location: "Park Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111107" },
  { id: "22222222-2222-2222-2222-222222222223", name: "JPN-F1", location: "West Entry", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111107" },
  { id: "22222222-2222-2222-2222-222222222224", name: "JPN-F2", location: "South Entry", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111107" },
  // s008 Infosys (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222225", name: "INF-N1", location: "Gate 1 Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111108" },
  { id: "22222222-2222-2222-2222-222222222226", name: "INF-N2", location: "Visitor Lot", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111108" },
  { id: "22222222-2222-2222-2222-222222222227", name: "INF-F1", location: "Gate 3 Parking", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111108" },
  // s009 Chamundi Hill (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222228", name: "CHM-N1", location: "Base Parking", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111109" },
  { id: "22222222-2222-2222-2222-222222222229", name: "CHM-F1", location: "Top Parking", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111109" },
  { id: "22222222-2222-2222-2222-222222222230", name: "CHM-F2", location: "Temple View", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111109" },
  // s010 Jayalakshmipuram (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222231", name: "JLP-N1", location: "Main Road", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111110" },
  { id: "22222222-2222-2222-2222-222222222232", name: "JLP-N2", location: "Circle Side", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111110" },
  { id: "22222222-2222-2222-2222-222222222233", name: "JLP-F1", location: "Back Lane", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111110" },
  { id: "22222222-2222-2222-2222-222222222234", name: "JLP-F2", location: "Mall Entry", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111110" },
  // s011 Devaraja Market (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222235", name: "DVR-N1", location: "Market East", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111111" },
  { id: "22222222-2222-2222-2222-222222222236", name: "DVR-N2", location: "Market South", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111111" },
  { id: "22222222-2222-2222-2222-222222222237", name: "DVR-F1", location: "Market West", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111111" },
  // s012 Bogadi (1 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222238", name: "BGD-N1", location: "Entrance A", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111112" },
  { id: "22222222-2222-2222-2222-222222222239", name: "BGD-F1", location: "Entrance B", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111112" },
  { id: "22222222-2222-2222-2222-222222222240", name: "BGD-F2", location: "Ring Road", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111112" },
  // s013 Hootagalli (2 normal, 2 fast)
  { id: "22222222-2222-2222-2222-222222222241", name: "HTG-N1", location: "Bay 1", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111113" },
  { id: "22222222-2222-2222-2222-222222222242", name: "HTG-N2", location: "Bay 3", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111113" },
  { id: "22222222-2222-2222-2222-222222222243", name: "HTG-F1", location: "Bay 2", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111113" },
  { id: "22222222-2222-2222-2222-222222222244", name: "HTG-F2", location: "Bay 4", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111113" },
  // s014 Siddarthanagar (2 normal, 1 fast)
  { id: "22222222-2222-2222-2222-222222222245", name: "SDN-N1", location: "North Wing", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111114" },
  { id: "22222222-2222-2222-2222-222222222246", name: "SDN-N2", location: "Main Gate", status: "available", power_kw: 7.4, charger_type: "normal", price_per_min: PRICE_NORMAL, station_id: "11111111-1111-1111-1111-111111111114" },
  { id: "22222222-2222-2222-2222-222222222247", name: "SDN-F1", location: "South Wing", status: "available", power_kw: 50, charger_type: "fast", price_per_min: PRICE_FAST, station_id: "11111111-1111-1111-1111-111111111114" },
];

interface BookingContextType {
  bookings: Booking[];
  payments: Payment[];
  chargers: Charger[];
  stations: Station[];
  loading: boolean;
  refresh: () => Promise<void>;
  getSlots: (date: string, chargerId: string) => TimeSlot[];
  getStationSlots: (date: string, stationId: string, chargerType: ChargerType, durationMin: number) => TimeSlot[];
  bookSlot: (slot: TimeSlot, durationMin: number, chargerType: ChargerType, paymentStatus?: 'paid' | 'pending') => Promise<{ ok: boolean; error?: string; bookingId?: string; amount?: number }>;
  cancelBooking: (id: string) => Promise<void>;
  searchStations: (query: string) => Station[];
  getAvailableStations: (date: string, time: string) => Station[];
  getStationChargerCounts: (stationId: string) => { normal: number; fast: number; normalAvail: number; fastAvail: number };
  computePrice: (chargerType: ChargerType, durationMin: number) => number;
  addCharger: (chargerData: Omit<Charger, 'id' | 'created_at' | 'updated_at'>) => Promise<{ ok: boolean; error?: string; data?: Charger }>;
  usingMockData: boolean;
}

const BookingContext = createContext<BookingContextType>({} as BookingContextType);
export const useBooking = () => useContext(BookingContext);

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return Date.parse(startA) < Date.parse(endB) && Date.parse(endA) > Date.parse(startB);
}

function isExpiredSlot(date: string, startTime: string): boolean {
  const today = format(new Date(), "yyyy-MM-dd");
  if (date !== today) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  return startHours * 60 + startMinutes <= currentMinutes;
}

// Add minutes to a time string like "06:00" → "07:30"
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Convert a DB time (either 'HH:MM' or full ISO) into ISO string and human time
function toIso(value: string, date: string): string {
  if (!value) return '';
  if (value.includes('T')) return value;
  // assume value is 'HH:MM' -> attach date without forcing UTC
  return `${date}T${value}:00`;
}

function timeFromIso(iso: string): string {
  if (iso.includes('T')) return iso.split('T')[1].slice(0, 5);
  return iso;
}

function enrichBooking(
  booking: Booking,
  stationsList: Station[],
  chargersList: Charger[],
): Booking {
  const station = stationsList.find((item) => item.id === booking.station_id);
  const charger = chargersList.find((item) => item.id === booking.charger_id);

  return {
    ...booking,
    stations: station ? { name: station.name, address: station.address } : booking.stations ?? null,
    chargers: charger
      ? {
          name: charger.name,
          location: charger.location,
          power_kw: charger.power_kw,
          charger_type: charger.charger_type,
        }
      : booking.chargers ?? null,
  };
}

const MOCK_SLOTS: DBSlot[] = [];
MOCK_STATIONS.forEach((s) => {
  // generate slots for the full day, from 00:00 up to 23:30
  for (let t = 0; t < 24 * 60; t += 30) {
    const start = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
    const end = addMinutes(start, 30);
    MOCK_SLOTS.push({ id: crypto.randomUUID(), station_id: s.id, start_time: start, end_time: end });
  }
});

function buildSlots(date: string, chargerId: string, bookings: Booking[], dbSlots: DBSlot[], chargers: Charger[]): TimeSlot[] {
  const charger = chargers.find(c => c.id === chargerId);
  if (!charger) return [];
  const out: TimeSlot[] = [];
  const stationSlots = dbSlots
    .filter((s) => s.station_id === charger.station_id)
    .filter((s) => !s.date || s.date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  for (const dbSlot of stationSlots) {
    const startIso = toIso(dbSlot.start_time, date);
    const endIso = dbSlot.end_time ? toIso(dbSlot.end_time, date) : new Date(Date.parse(startIso) + 30 * 60000).toISOString();
    const slotExpired = isExpiredSlot(date, timeFromIso(startIso));
    const hasBooking = bookings.some((b) => {
      if (b.charger_id !== chargerId || b.date !== date || b.status !== "active") return false;
      const bStart = toIso(b.start_time ?? '', b.date ?? date);
      const bEnd = toIso(b.end_time ?? '', b.date ?? date);
      return Date.parse(startIso) < Date.parse(bEnd) && Date.parse(endIso) > Date.parse(bStart);
    });
    out.push({
      id: dbSlot.id,
      startTime: timeFromIso(startIso),
      endTime: timeFromIso(endIso),
      chargerId,
      date,
      stationId: charger.station_id,
      status: slotExpired ? "unavailable" : hasBooking ? "booked" : "available",
      remainingSlots: slotExpired ? 0 : hasBooking ? 0 : 1,
    });
  }
  return out;
}

function buildStationSlots(date: string, stationId: string, chargers: Charger[], bookings: Booking[], chargerType: ChargerType, durationMin: number, dbSlots: DBSlot[]): TimeSlot[] {
  const stationChargers = chargers.filter((c) => c.station_id === stationId && c.status !== "maintenance" && c.charger_type === chargerType);
  if (stationChargers.length === 0) return [];

  const out: TimeSlot[] = [];
  const stationSlots = dbSlots
    .filter((s) => s.station_id === stationId)
    .filter((s) => !s.date || s.date === date)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  for (const dbSlot of stationSlots) {
    const startIso = toIso(dbSlot.start_time, date);
    const endIso = dbSlot.end_time ? toIso(dbSlot.end_time, date) : new Date(Date.parse(startIso) + durationMin * 60000).toISOString();
    const slotStart = timeFromIso(startIso);
    const slotExpired = isExpiredSlot(date, slotStart);
    const [startHours, startMinutes] = slotStart.split(":").map(Number);
    const exceedsDay = startHours * 60 + startMinutes + durationMin > 24 * 60;

    const availableChargers = stationChargers.filter((c) => {
      const hasConflict = bookings.some((b) => {
        if (b.charger_id !== c.id || b.date !== date || b.status !== "active") return false;
        const bStart = toIso(b.start_time ?? '', b.date ?? date);
        const bEnd = toIso(b.end_time ?? '', b.date ?? date);
        return Date.parse(startIso) < Date.parse(bEnd) && Date.parse(endIso) > Date.parse(bStart);
      });
      return !hasConflict;
    });

    const status = slotExpired || exceedsDay
      ? "unavailable"
      : availableChargers.length > 0
        ? "available"
        : "booked";

    out.push({
      id: dbSlot.id,
      startTime: slotStart,
      endTime: timeFromIso(endIso),
      chargerId: availableChargers[0]?.id ?? stationChargers[0].id,
      stationId,
      date,
      status,
      remainingSlots: status === "available" ? availableChargers.length : 0,
      chargerType,
    });
  }
  return out;
}

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [dbSlots, setDbSlots] = useState<DBSlot[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const hydrateCollections = useCallback(async () => {
    const [stSnap, chSnap, slSnap, bkSnap, pySnap] = await Promise.all([
      getDocs(query(collection(db, "stations"), orderBy("name"))),
      getDocs(query(collection(db, "chargers"), orderBy("name"))),
      getDocs(collection(db, "slots")),
      getDocs(collection(db, "bookings")),
      getDocs(collection(db, "payments")),
    ]);

    const stationsData = stSnap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      address: d.data().address || "",
      latitude: d.data().location?.latitude ?? d.data().latitude,
      longitude: d.data().location?.longitude ?? d.data().longitude,
      total_chargers: d.data().totalChargers ?? d.data().total_chargers ?? 0,
    })) as Station[];

    const chargersData = chSnap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      location: d.data().location || "",
      status: d.data().status || "available",
      power_kw: d.data().powerKw ?? d.data().power_kw ?? 7.4,
      charger_type: d.data().chargerType ?? d.data().charger_type ?? "normal",
      price_per_min: d.data().pricePerMin ?? d.data().price_per_min ?? PRICE_NORMAL,
      station_id: d.data().stationId ?? d.data().station_id,
    })) as Charger[];

    const slotsData = slSnap.docs.map((d) => ({
      id: d.id,
      station_id: d.data().stationId ?? d.data().station_id,
      start_time: d.data().startTime ?? d.data().start_time,
      end_time: d.data().endTime ?? d.data().end_time,
      date: d.data().date,
    })) as DBSlot[];

    const bookingsData = bkSnap.docs.map((d) => ({
      id: d.id,
      user_id: d.data().userId,
      charger_id: d.data().chargerId,
      station_id: d.data().stationId,
      date: d.data().date,
      start_time: d.data().startTime,
      end_time: d.data().endTime,
      duration_min: d.data().durationMin,
      status: d.data().status,
      payment_status: d.data().paymentStatus,
      amount: d.data().amount,
      charger_type: d.data().chargerType,
      created_at: d.data().createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    })) as Booking[];

    const paymentsData = pySnap.docs.map((d) => ({
      id: d.id,
      booking_id: d.data().bookingId,
      amount: d.data().amount,
      status: d.data().status,
      transaction_id: d.data().transactionId,
      created_at: d.data().createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    })) as Payment[];

    return {
      stationsData,
      chargersData,
      slotsData,
      bookingsData: bookingsData.map((booking) => enrichBooking(booking, stationsData, chargersData)),
      paymentsData,
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { stationsData, chargersData, slotsData, bookingsData, paymentsData } = await hydrateCollections();

      if (stationsData.length === 0 || chargersData.length === 0 || slotsData.length === 0) {
        setStations(MOCK_STATIONS);
        setChargers(MOCK_CHARGERS);
        setDbSlots(MOCK_SLOTS);
        setUsingMockData(true);
      } else {
        setStations(stationsData);
        setChargers(chargersData);
        setDbSlots(slotsData);
        setUsingMockData(false);
      }
      setBookings(bookingsData);
      setPayments(paymentsData);
    } catch {
      setStations(MOCK_STATIONS);
      setChargers(MOCK_CHARGERS);
      setDbSlots(MOCK_SLOTS);
      setUsingMockData(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const rawBookings = snap.docs.map((d) => ({
        id: d.id,
        user_id: d.data().userId,
        charger_id: d.data().chargerId,
        station_id: d.data().stationId,
        date: d.data().date,
        start_time: d.data().startTime,
        end_time: d.data().endTime,
        duration_min: d.data().durationMin,
        status: d.data().status,
        payment_status: d.data().paymentStatus,
        amount: d.data().amount,
        charger_type: d.data().chargerType,
        created_at: d.data().createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      })) as Booking[];
      setBookings(rawBookings.map((booking) => enrichBooking(booking, stations, chargers)));
      setUsingMockData(false);
    });
    const unsubSlots = onSnapshot(collection(db, "slots"), (snap) => {
      setDbSlots(snap.docs.map((d) => ({
        id: d.id,
        station_id: d.data().stationId ?? d.data().station_id,
        start_time: d.data().startTime ?? d.data().start_time,
        end_time: d.data().endTime ?? d.data().end_time,
        date: d.data().date,
      })) as DBSlot[]);
      setUsingMockData(false);
    });
    const unsubStations = onSnapshot(collection(db, "stations"), (snap) => {
      const stationsData = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        address: d.data().address || "",
        latitude: d.data().location?.latitude ?? d.data().latitude,
        longitude: d.data().location?.longitude ?? d.data().longitude,
        total_chargers: d.data().totalChargers ?? d.data().total_chargers ?? 0,
      })) as Station[];
      if (stationsData.length) {
        setStations(stationsData);
        setBookings((currentBookings) => currentBookings.map((booking) => enrichBooking(booking, stationsData, chargers)));
        setUsingMockData(false);
      }
    });
    const unsubChargers = onSnapshot(collection(db, "chargers"), (snap) => {
      const chargersData = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        location: d.data().location || "",
        status: d.data().status || "available",
        power_kw: d.data().powerKw ?? d.data().power_kw ?? 7.4,
        charger_type: d.data().chargerType ?? d.data().charger_type ?? "normal",
        price_per_min: d.data().pricePerMin ?? d.data().price_per_min ?? PRICE_NORMAL,
        station_id: d.data().stationId ?? d.data().station_id,
      })) as Charger[];
      if (chargersData.length) {
        setChargers(chargersData);
        setBookings((currentBookings) => currentBookings.map((booking) => enrichBooking(booking, stations, chargersData)));
        setUsingMockData(false);
      }
    });
    const unsubPayments = onSnapshot(collection(db, "payments"), (snap) => {
      setPayments(snap.docs.map((d) => ({
        id: d.id,
        booking_id: d.data().bookingId,
        amount: d.data().amount,
        status: d.data().status,
        transaction_id: d.data().transactionId,
        created_at: d.data().createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      })) as Payment[]);
      setUsingMockData(false);
    });
    return () => {
      unsubBookings();
      unsubSlots();
      unsubStations();
      unsubChargers();
      unsubPayments();
    };
  }, [refresh]);

  const getSlots = (date: string, chargerId: string) => buildSlots(date, chargerId, bookings, dbSlots, chargers);
  const getStationSlots = (date: string, stationId: string, chargerType: ChargerType, durationMin: number) => buildStationSlots(date, stationId, chargers, bookings, chargerType, durationMin, dbSlots);

  const computePrice = (chargerType: ChargerType, durationMin: number): number => {
    const rate = chargerType === "fast" ? PRICE_FAST : PRICE_NORMAL;
    return rate * durationMin;
  };

  const getStationChargerCounts = (stationId: string) => {
    const all = chargers.filter((c) => c.station_id === stationId && c.status !== "maintenance");
    const normal = all.filter((c) => c.charger_type === "normal");
    const fast = all.filter((c) => c.charger_type === "fast");
    return {
      normal: normal.length,
      fast: fast.length,
      normalAvail: normal.filter((c) => c.status === "available").length,
      fastAvail: fast.filter((c) => c.status === "available").length,
    };
  };

  const bookSlot = async (slot: TimeSlot, durationMin: number, chargerType: ChargerType, paymentStatus: 'paid' | 'pending' = 'paid') => {
    if (!user) return { ok: false, error: "Not signed in" };
    if (isExpiredSlot(slot.date, slot.startTime)) {
      return { ok: false, error: "This slot has already passed" };
    }

    // Find the right charger for this type at this station
    const stChargers = chargers.filter(c => c.station_id === slot.stationId && c.charger_type === chargerType && c.status !== "maintenance");
    const availableCharger = stChargers.find(c =>
      !bookings.some(b => {
        if (b.charger_id !== c.id || b.date !== slot.date || b.status !== "active") return false;
        const endTime = addMinutes(slot.startTime, durationMin);
        return slot.startTime < b.end_time && endTime > b.start_time;
      })
    );
    if (!availableCharger) return { ok: false, error: "No charger available for this time" };

    const endTime = addMinutes(slot.startTime, durationMin);
    const amount = computePrice(chargerType, durationMin);

    const bookingId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();
    const newBooking: Booking = {
      id: bookingId, user_id: user.id, charger_id: availableCharger.id,
      station_id: slot.stationId, date: slot.date,
      start_time: slot.startTime, end_time: endTime,
      duration_min: durationMin, charger_type: chargerType,
      status: "active", payment_status: paymentStatus, amount,
      created_at: new Date().toISOString(),
      chargers: { name: availableCharger.name, location: availableCharger.location, power_kw: availableCharger.power_kw, charger_type: chargerType },
      stations: stations.find(s => s.id === slot.stationId) ? { name: stations.find(s => s.id === slot.stationId)!.name, address: stations.find(s => s.id === slot.stationId)!.address } : null,
    };
    const payment: Payment = {
      id: paymentId,
      booking_id: bookingId,
      amount,
      status: paymentStatus === 'paid' ? 'paid' : 'pending',
      transaction_id: paymentId,
      created_at: new Date().toISOString(),
    };
    const station = stations.find(s => s.id === slot.stationId);
    const currentCount = bookings.filter((b) => {
      if (b.station_id !== slot.stationId || b.date !== slot.date || b.status !== "active") return false;
      const bookingStart = `${b.date}T${b.start_time}:00Z`;
      const bookingEnd = `${b.date}T${b.end_time}:00Z`;
      return overlaps(`${slot.date}T${slot.startTime}:00Z`, `${slot.date}T${endTime}:00Z`, bookingStart, bookingEnd);
    }).length;
    const capacity = station?.total_chargers ?? 1;
    if (currentCount >= capacity) {
      return { ok: false, error: "Slot is full" };
    }

    if (usingMockData) {
      setBookings(prev => [newBooking, ...prev]);
      setPayments(prev => [payment, ...prev]);
      return { ok: true, bookingId, amount };
    }

    setBookings(prev => [newBooking, ...prev]);
    setPayments(prev => [payment, ...prev]);

    void (async () => {
      try {
        await setDoc(doc(db, "bookings", bookingId), {
          userId: user.id,
          stationId: slot.stationId,
          slotId: slot.id,
          chargerId: availableCharger.id,
          date: slot.date,
          startTime: slot.startTime,
          endTime,
          durationMin,
          chargerType,
          status: "active",
          paymentStatus: paymentStatus === "paid" ? "paid" : "pending",
          amount,
          createdAt: serverTimestamp(),
        });
        await setDoc(doc(db, "payments", paymentId), {
          bookingId,
          amount,
          status: paymentStatus === "paid" ? "paid" : "pending",
          transactionId: payment.transaction_id,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Background booking sync failed:", err);
      }
    })();

    return { ok: true, bookingId, amount };
  };

  const cancelBooking = async (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b));
  };

  const addCharger = async (chargerData: Omit<Charger, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { ok: false, error: "Not signed in" };

    const newCharger: Charger = {
      ...chargerData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Charger;
    if (usingMockData) {
      setChargers(prev => [...prev, newCharger]);
      setStations(prev => prev.map(s => 
        s.id === chargerData.station_id ? { ...s, total_chargers: (s.total_chargers || 0) + 1 } : s
      ));
      return { ok: true, data: newCharger };
    }
    try {
      await addDoc(collection(db, "chargers"), {
        name: chargerData.name,
        location: chargerData.location,
        status: chargerData.status,
        powerKw: chargerData.power_kw,
        chargerType: chargerData.charger_type,
        pricePerMin: chargerData.price_per_min,
        stationId: chargerData.station_id,
        createdAt: serverTimestamp(),
      });
      await refresh();
      return { ok: true, data: newCharger };
    } catch (err: any) {
      return { ok: false, error: err?.message || "Failed to add charger" };
    }
  };

  const searchStations = (query: string): Station[] => {
    if (!query.trim()) return stations;
    const q = query.toLowerCase();
    return stations.filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
  };

  const getAvailableStations = (date: string, time: string): Station[] => {
    return stations.filter((s) => {
      const sc = chargers.filter((c) => c.station_id === s.id && c.status !== "maintenance");
      if (sc.length === 0) return false;
      const bc = sc.filter((c) => bookings.some((b) => b.charger_id === c.id && b.date === date && b.start_time <= time && b.end_time > time && b.status === "active")).length;
      return bc < sc.length;
    });
  };

  return (
    <BookingContext.Provider value={{
      bookings, payments, chargers, stations, loading, refresh,
      getSlots, getStationSlots, bookSlot, cancelBooking,
      searchStations, getAvailableStations, getStationChargerCounts,
      computePrice, addCharger, usingMockData,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

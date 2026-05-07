import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBooking } from "@/contexts/BookingContext";
import { cn } from "@/lib/utils";
import { X, Zap, Rocket, Clock, MapPin, Minus, Plus, CalendarDays, ChevronUp, ChevronDown } from "lucide-react";
import { Station, ChargerType, TimeSlot } from "@/types";
import PaymentDialog from "./PaymentDialog";
import BookingConfirmation from "./BookingConfirmation";

interface StationBottomSheetProps {
  station: Station;
  onClose: () => void;
  onSwitchStation?: (station: Station) => void;
  onViewBookings?: () => void;
}

const StationBottomSheet: React.FC<StationBottomSheetProps> = ({ station, onClose, onSwitchStation, onViewBookings }) => {
  const { getStationSlots, getStationChargerCounts, computePrice } = useBooking();
  const [date, setDate] = useState<Date>(new Date());
  const [chargerType, setChargerType] = useState<ChargerType>("normal");
  const [durationMin, setDurationMin] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ bookingId: string; slot: TimeSlot } | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");
  const counts = getStationChargerCounts(station.id);
  const slots = getStationSlots(dateStr, station.id, chargerType, durationMin);
  const price = computePrice(chargerType, durationMin);

  const availableSlotCount = useMemo(
    () => slots.filter((slot) => slot.status === "available").length,
    [slots],
  );

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status !== "available") return;
    setSelectedSlot(slot);
    setPaymentOpen(true);
  };

  const handlePaymentSuccess = (bookingId: string) => {
    setPaymentOpen(false);
    if (selectedSlot) setConfirmationData({ bookingId, slot: selectedSlot });
    setSelectedSlot(null);
  };

  if (confirmationData) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[1000] max-h-[85vh] overflow-y-auto bg-card border-t-2 border-primary rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <BookingConfirmation
            bookingId={confirmationData.bookingId}
            station={station}
            slot={confirmationData.slot}
            onViewBookings={() => {
              onClose();
              if (onViewBookings) onViewBookings();
            }}
            onBookAnother={() => setConfirmationData(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[999] backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[1000] max-h-[85vh] overflow-y-auto bg-card border-t-2 border-primary rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="sticky top-0 bg-card z-10 rounded-t-3xl">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Header */}
          <div className="px-6 pb-4 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{station.name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {station.address}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {counts.normal > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Zap className="h-3 w-3" /> {counts.normalAvail}/{counts.normal} Normal
                  </Badge>
                )}
                {counts.fast > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20">
                    <Rocket className="h-3 w-3" /> {counts.fastAvail}/{counts.fast} Fast
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                {expanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
              </button>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="px-6 pb-6 space-y-5">
            {/* Charger Type Selector */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Charger Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChargerType("normal")}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-left",
                    chargerType === "normal"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border hover:border-blue-500/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-sm">Normal</span>
                  </div>
                  <p className="text-xs text-muted-foreground">7.4 kW AC • ~25 km/hr</p>
                  <p className="text-sm font-bold text-blue-500 mt-1">₹2/min</p>
                </button>
                <button
                  onClick={() => setChargerType("fast")}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-left",
                    chargerType === "fast"
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-border hover:border-amber-500/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Rocket className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-sm">Fast</span>
                  </div>
                  <p className="text-xs text-muted-foreground">50 kW DC • ~200 km/hr</p>
                  <p className="text-sm font-bold text-amber-500 mt-1">₹5/min</p>
                </button>
              </div>
            </div>

            {/* Duration Picker */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Duration</label>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 border border-border">
                <button
                  onClick={() => setDurationMin(Math.max(30, durationMin - 30))}
                  disabled={durationMin <= 30}
                  className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold">{durationMin}</span>
                  <span className="text-sm text-muted-foreground ml-1">min</span>
                  <p className="text-xs text-muted-foreground">
                    {durationMin >= 60
                      ? (durationMin % 60 === 0
                        ? `${durationMin / 60}h`
                        : `${(durationMin / 60).toFixed(1)}h`)
                      : `${durationMin}m`}
                  </p>
                </div>
                <button
                  onClick={() => setDurationMin(Math.min(180, durationMin + 30))}
                  disabled={durationMin >= 180}
                  className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-between mt-2 px-1">
                {[30, 60, 90, 120, 150, 180].map((d) => {
                  const label = d >= 60 ? (d % 60 === 0 ? `${d / 60}h` : `${(d / 60).toFixed(1)}h`) : `${d}m`;
                  return (
                    <button
                      key={d}
                      onClick={() => setDurationMin(d)}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md transition-colors",
                        durationMin === d ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 text-sm font-medium w-full p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform", showCalendar && "rotate-180")} />
              </button>
              {showCalendar && (
                <div className="mt-2 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { if (d) { setDate(d); setShowCalendar(false); } }}
                    className="p-3 rounded-xl border border-border"
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>
              )}
            </div>

            {/* Time Slots */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                Select Start Time
              </label>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No {chargerType} chargers at this station.</p>
              ) : (
                <>
                  {availableSlotCount === 0 && (
                    <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                      No start time is available for the selected {durationMin} minute duration.
                    </div>
                  )}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {slots.map((slot) => {
                      const isAvailable = slot.status === "available";
                      const label = slot.status === "available" ? `${slot.remainingSlots ?? 0} left` : slot.status === "booked" ? "Booked" : "Unavailable";
                      return (
                        <button
                          key={slot.id}
                          disabled={!isAvailable}
                          onClick={() => handleSlotClick(slot)}
                          className={cn(
                            "py-2.5 px-1 rounded-lg border text-center transition-all duration-150",
                            isAvailable
                              ? chargerType === "fast"
                                ? "border-amber-500/20 hover:border-amber-500 hover:bg-amber-500/10 cursor-pointer"
                                : "border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 cursor-pointer"
                              : "border-border/50 opacity-35 cursor-not-allowed bg-muted/30",
                          )}
                        >
                          <span className="text-xs font-semibold block">{slot.startTime}</span>
                          <span className={cn(
                            "text-[9px] font-medium",
                            isAvailable ? (chargerType === "fast" ? "text-amber-500" : "text-blue-500") : "text-destructive",
                          )}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Price Summary Bar */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {chargerType === "fast" ? "Fast" : "Normal"} • {durationMin} min
                      </p>
                      <p className="text-2xl font-extrabold text-primary">₹{price}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>₹{chargerType === "fast" ? 5 : 2}/min × {durationMin} min</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      {selectedSlot && (
        <PaymentDialog
          open={paymentOpen}
          onOpenChange={setPaymentOpen}
          station={station}
          slot={selectedSlot}
          chargerType={chargerType}
          durationMin={durationMin}
          totalPrice={price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default StationBottomSheet;

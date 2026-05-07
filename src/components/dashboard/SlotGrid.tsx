import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBooking } from "@/contexts/BookingContext";
import { cn } from "@/lib/utils";
import { CalendarDays, MapPin, ArrowLeft, Zap, Rocket, Minus, Plus } from "lucide-react";
import { Station, TimeSlot, ChargerType } from "@/types";
import PaymentDialog from "./PaymentDialog";
import BookingConfirmation from "./BookingConfirmation";

interface SlotGridProps {
  station?: Station | null;
  onBack?: () => void;
  onViewBookings?: () => void;
}

const SlotGrid: React.FC<SlotGridProps> = ({ station, onBack, onViewBookings }) => {
  const [date, setDate] = useState<Date>(new Date());
  const { getStationSlots, getStationChargerCounts, computePrice, chargers } = useBooking();
  const [chargerType, setChargerType] = useState<ChargerType>("normal");
  const [durationMin, setDurationMin] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ bookingId: string; slot: TimeSlot } | null>(null);

  const dateStr = format(date, "yyyy-MM-dd");
  const slots = useMemo(() => station ? getStationSlots(dateStr, station.id, chargerType, durationMin) : [], [station, dateStr, chargerType, durationMin, getStationSlots]);
  const counts = station ? getStationChargerCounts(station.id) : { normal: 0, fast: 0, normalAvail: 0, fastAvail: 0 };
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

  if (confirmationData && station) {
    return (
      <BookingConfirmation
        bookingId={confirmationData.bookingId}
        station={station}
        slot={confirmationData.slot}
        onViewBookings={() => { setConfirmationData(null); onViewBookings?.(); }}
        onBookAnother={() => setConfirmationData(null)}
      />
    );
  }

  if (!station) {
    return (
      <Card className="rounded-2xl border-border">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Select a Station</h3>
          <p className="text-muted-foreground text-sm mb-4">Choose a station from the map to view available slots.</p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Map
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
              Book a Charging Slot
            </CardTitle>
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> Map
              </Button>
            )}
          </div>
          {/* Station Info */}
          <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base">{station.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{station.address}</p>
              </div>
              <div className="flex gap-1.5">
                {counts.normal > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Zap className="h-3 w-3" /> {counts.normal} Normal
                  </Badge>
                )}
                {counts.fast > 0 && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20">
                    <Rocket className="h-3 w-3" /> {counts.fast} Fast
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Charger Type */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setChargerType("normal")}
              className={cn("p-3 rounded-xl border-2 text-left transition-all",
                chargerType === "normal" ? "border-blue-500 bg-blue-500/10" : "border-border hover:border-blue-500/30"
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-sm">Normal</span>
              </div>
              <p className="text-xs text-muted-foreground">7.4 kW • ₹2/min</p>
            </button>
            <button
              onClick={() => setChargerType("fast")}
              className={cn("p-3 rounded-xl border-2 text-left transition-all",
                chargerType === "fast" ? "border-amber-500 bg-amber-500/10" : "border-border hover:border-amber-500/30"
              )}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Rocket className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-sm">Fast</span>
              </div>
              <p className="text-xs text-muted-foreground">50 kW • ₹5/min</p>
            </button>
          </div>

          {/* Duration */}
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <button onClick={() => setDurationMin(Math.max(30, durationMin - 30))} disabled={durationMin <= 30} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center disabled:opacity-30">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-xl font-bold">{durationMin} min</span>
              <p className="text-xs text-muted-foreground">
                {durationMin >= 60
                  ? (durationMin % 60 === 0 ? `${durationMin / 60}h` : `${(durationMin / 60).toFixed(1)}h`)
                  : `${durationMin}m`}
              </p>
            </div>
            <button onClick={() => setDurationMin(Math.min(180, durationMin + 30))} disabled={durationMin >= 180} className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center disabled:opacity-30">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid lg:grid-cols-[auto_1fr] gap-6">
            <div>
              <Calendar
                mode="single" selected={date}
                onSelect={(d) => d && setDate(d)}
                className="p-3 rounded-xl border border-border"
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">
                  📅 {format(date, "EEEE, MMMM d, yyyy")}
                </p>
                <span className="text-lg font-extrabold text-primary">₹{price}</span>
              </div>

              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No {chargerType} chargers at this station.</p>
              ) : (
                <>
                  {availableSlotCount === 0 && (
                    <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                      No start time is available for the selected {durationMin} minute duration.
                    </div>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5">
                    {slots.map((slot) => {
                      const isAvailable = slot.status === "available";
                      const label = slot.status === "available" ? `${slot.remainingSlots ?? 0} left` : slot.status === "booked" ? "Booked" : "Unavailable";
                      return (
                        <button
                          key={slot.id}
                          disabled={!isAvailable}
                          onClick={() => handleSlotClick(slot)}
                          className={cn(
                            "p-2.5 rounded-xl border text-center transition-all duration-200",
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
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSlot && (
        <PaymentDialog
          open={paymentOpen} onOpenChange={setPaymentOpen}
          station={station} slot={selectedSlot}
          chargerType={chargerType} durationMin={durationMin} totalPrice={price}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default SlotGrid;

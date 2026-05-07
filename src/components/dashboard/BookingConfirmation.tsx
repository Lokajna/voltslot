import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MapPin, Clock, CreditCard, Hash, ArrowRight, CalendarPlus, Zap, Rocket } from "lucide-react";
import { Station, TimeSlot } from "@/types";
import { useBooking } from "@/contexts/BookingContext";
import { motion } from "framer-motion";

interface BookingConfirmationProps {
  bookingId: string;
  station: Station;
  slot: TimeSlot;
  onViewBookings: () => void;
  onBookAnother: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  bookingId, station, slot, onViewBookings, onBookAnother,
}) => {
  const { bookings } = useBooking();
  // Find the booking to get actual details
  const booking = bookings.find(b => b.id === bookingId);
  const chargerType = booking?.charger_type || slot.chargerType || "normal";
  const durationMin = booking?.duration_min || 60;
  const amount = booking?.amount || 0;

  const TypeIcon = chargerType === "fast" ? Rocket : Zap;
  const typeColor = chargerType === "fast" ? "text-amber-500" : "text-blue-500";
  const typeLabel = chargerType === "fast" ? "Fast (50 kW DC)" : "Normal (7.4 kW AC)";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="max-w-md w-full rounded-2xl border-border shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Success Header */}
          <div className="bg-primary p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-8 w-24 h-24 rounded-full border border-white/20" />
              <div className="absolute bottom-2 right-6 w-16 h-16 rounded-full border border-white/15" />
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 relative z-10" />
            </motion.div>
            <h2 className="text-2xl font-extrabold mb-1 relative z-10">Booking Confirmed!</h2>
            <p className="text-white/70 text-sm relative z-10">Your charging slot has been reserved</p>
          </div>

          <CardContent className="p-6 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4 text-primary shrink-0" />
                <span className="text-muted-foreground">Booking ID</span>
                <span className="ml-auto font-mono font-bold text-xs bg-muted px-2.5 py-1 rounded-lg">{bookingId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div><p className="font-semibold">{station.name}</p><p className="text-muted-foreground text-xs">{station.address}</p></div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TypeIcon className={`h-4 w-4 shrink-0 ${typeColor}`} />
                <span>{typeLabel}</span>
                <Badge variant="outline" className={`ml-auto text-[10px] font-semibold ${chargerType === "fast" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}`}>
                  {chargerType === "fast" ? "Fast" : "Normal"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>{slot.date} • {slot.startTime} – {booking?.end_time || slot.endTime}</span>
                <span className="text-muted-foreground text-xs ml-auto">{durationMin} min</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold">₹{amount} paid</span>
                <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 font-semibold" variant="outline">
                  Confirmed
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button onClick={onViewBookings} className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11 font-semibold shadow-lg shadow-primary/20">
                View My Bookings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={onBookAnother} className="w-full rounded-xl h-11">
                <CalendarPlus className="mr-2 h-4 w-4" /> Book Another Slot
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;

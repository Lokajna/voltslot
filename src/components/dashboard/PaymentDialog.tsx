import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useBooking } from "@/contexts/BookingContext";
import { Station, TimeSlot, ChargerType } from "@/types";
import { CreditCard, MapPin, Clock, Loader2, ShieldCheck, Zap, Rocket } from "lucide-react";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  station: Station;
  slot: TimeSlot;
  chargerType: ChargerType;
  durationMin: number;
  totalPrice: number;
  onSuccess: (bookingId: string) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ open, onOpenChange, station, slot, chargerType, durationMin, totalPrice, onSuccess }) => {
  const { bookSlot } = useBooking();
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState("");

  const formatUpi = (v: string) => v.trim();

  // Compute end time
  const [h, m] = slot.startTime.split(":").map(Number);
  const endTotal = h * 60 + m + durationMin;
  const endTime = `${String(Math.floor(endTotal / 60) % 24).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;

  const isFormValid = upiId.trim().length > 3 && upiId.includes("@");

  const handlePay = async () => {
    if (!isFormValid) {
      toast.error("Enter a valid UPI ID first.");
      return;
    }

    try {
      setProcessing(true);
      const result = await Promise.race([
        bookSlot(slot, durationMin, chargerType, "paid"),
        new Promise<{ ok: false; error: string }>((_, reject) =>
          setTimeout(() => reject(new Error("Payment is taking too long. Please try again.")), 10000),
        ),
      ]);
      if (result.ok && result.bookingId) {
        setUpiId("");
        onSuccess(result.bookingId);
        toast.success("Payment successful!");
      } else {
        console.error('Booking failed:', result.error);
        toast.error(result.error || "Failed to complete payment.");
      }
    } catch (err: any) {
      console.error('Unexpected error in handlePay:', err);
      toast.error(err?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const TypeIcon = chargerType === "fast" ? Rocket : Zap;
  const typeColor = chargerType === "fast" ? "text-amber-500" : "text-blue-500";
  const typeLabel = chargerType === "fast" ? "Fast Charging (50 kW DC)" : "Normal Charging (7.4 kW AC)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border z-[1100]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            Complete Payment
          </DialogTitle>
          <DialogDescription>Review your booking and complete payment</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Booking Summary */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Booking Summary</h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div><p className="font-semibold">{station.name}</p><p className="text-muted-foreground text-xs">{station.address}</p></div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <TypeIcon className={`h-4 w-4 shrink-0 ${typeColor}`} />
                <span>{typeLabel}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>{slot.date} • {slot.startTime} – {endTime} ({durationMin} min)</span>
              </div>
            </div>
            <Separator className="opacity-50" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold">Total Amount</span>
                <p className="text-xs text-muted-foreground">₹{chargerType === "fast" ? 5 : 2}/min × {durationMin} min</p>
              </div>
              <span className="text-xl font-extrabold text-primary">₹{totalPrice}</span>
            </div>
          </div>

            {/* UPI Payment */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="upi-id" className="text-xs font-medium">UPI ID</Label>
              <Input id="upi-id" placeholder="example@bank" value={upiId} onChange={(e) => setUpiId(formatUpi(e.target.value))} className="rounded-xl h-11" />
              <p className="text-xs text-muted-foreground mt-1">Enter your UPI ID (e.g., yourid@bank). We simulate UPI payment in demo mode.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <span>Demo UPI payment — no real charges will be made</span>
          </div>

          <Button onClick={handlePay} disabled={processing || !isFormValid} className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/25">
            {processing ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Processing...</>
            ) : (
              <>Pay ₹{totalPrice}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

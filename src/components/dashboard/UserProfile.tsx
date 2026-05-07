import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, Shield, CalendarCheck, CalendarX, LogOut, Zap } from "lucide-react";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const { bookings } = useBooking();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((b) => b.status === "active").length;
    const cancelled = bookings.filter((b) => b.status === "cancelled").length;
    const totalSpent = bookings
      .filter((b) => b.payment_status === "paid" && b.status !== "cancelled")
      .reduce((s, b) => s + (b.amount ?? 0), 0);
    return { total, active, cancelled, totalSpent };
  }, [bookings]);

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Card className="rounded-2xl border-border shadow-xl shadow-primary/5 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-4 left-8 w-32 h-32 rounded-full border border-white/20" />
            <div className="absolute bottom-2 right-10 w-20 h-20 rounded-full border border-white/15" />
          </div>
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-3xl font-extrabold text-white border-2 border-white/30 relative z-10">
            {(user.fullName || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-extrabold text-white relative z-10">{user.fullName || "User"}</h2>
          <p className="text-white/60 text-sm relative z-10">{user.email}</p>
        </div>

        <CardContent className="p-6 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <UserIcon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Name</span>
              <span className="ml-auto font-semibold">{user.fullName || "—"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Email</span>
              <span className="ml-auto font-semibold truncate max-w-[180px]">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary" className="ml-auto capitalize font-semibold">{user.role}</Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <CalendarCheck className="h-5 w-5 text-primary" />, value: stats.total, label: "Total Bookings" },
                { icon: <Zap className="h-5 w-5 text-amber-500" />, value: stats.active, label: "Active" },
                { icon: <CalendarX className="h-5 w-5 text-destructive" />, value: stats.cancelled, label: "Cancelled" },
                { icon: <span className="text-lg text-primary">₹</span>, value: stats.totalSpent, label: "Total Spent" },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-lg font-extrabold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <Button
            variant="destructive"
            onClick={async () => { await logout(); navigate("/"); }}
            className="w-full rounded-xl h-11"
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;

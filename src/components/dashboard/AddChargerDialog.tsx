import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { toast } from "sonner";
import { ChargerType } from "@/types";

export function AddChargerDialog() {
  const { stations, addCharger } = useBooking();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    station_id: '',
    charger_type: 'normal' as ChargerType,
    power_kw: 7.4,
    price_per_min: 2,
    status: 'available' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.station_id) {
      toast.error("Please select a station");
      return;
    }

    setLoading(true);
    const result = await addCharger(formData);
    setLoading(false);

    if (result.ok) {
      toast.success("Charger added successfully!");
      setOpen(false);
      setFormData({
        name: '',
        location: '',
        station_id: '',
        charger_type: 'normal',
        power_kw: 7.4,
        price_per_min: 2,
        status: 'available'
      });
    } else {
      toast.error(result.error || "Failed to add charger");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Charger
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add New Charger</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="station">Station</Label>
            <Select 
              value={formData.station_id} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, station_id: val }))}
            >
              <SelectTrigger id="station" className="rounded-xl">
                <SelectValue placeholder="Select a station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Charger Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. VJN-F2" 
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.charger_type} 
                onValueChange={(val: ChargerType) => setFormData(prev => ({ 
                  ...prev, 
                  charger_type: val,
                  power_kw: val === 'fast' ? 50 : 7.4,
                  price_per_min: val === 'fast' ? 5 : 2
                }))}
              >
                <SelectTrigger id="type" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (AC)</SelectItem>
                  <SelectItem value="fast">Fast (DC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location within Station</Label>
            <Input 
              id="location" 
              placeholder="e.g. Ground Floor, Bay 4" 
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="power">Power (kW)</Label>
              <Input 
                id="power" 
                type="number"
                step="0.1"
                value={formData.power_kw}
                onChange={e => setFormData(prev => ({ ...prev, power_kw: parseFloat(e.target.value) }))}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹/min)</Label>
              <Input 
                id="price" 
                type="number"
                step="0.1"
                value={formData.price_per_min}
                onChange={e => setFormData(prev => ({ ...prev, price_per_min: parseFloat(e.target.value) }))}
                className="rounded-xl"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full rounded-xl">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Adding..." : "Confirm Add Charger"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

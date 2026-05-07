import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBooking } from "@/contexts/BookingContext";
import { Station } from "@/types";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface StationSearchProps {
  onResults: (stations: Station[] | undefined) => void;
}

const StationSearch: React.FC<StationSearchProps> = ({ onResults }) => {
  const { searchStations, stations, chargers } = useBooking();
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const handleSearch = (value: string, filterAvailableOnly: boolean) => {
    setQuery(value);
    if (!value.trim() && !filterAvailableOnly) {
      onResults(undefined);
      return;
    }
    let results = value.trim() ? searchStations(value) : [...stations];
    if (filterAvailableOnly) {
      results = results.filter((s) => {
        const sChargers = chargers.filter((c) => c.station_id === s.id && c.status !== "maintenance");
        return sChargers.some((c) => c.status === "available");
      });
    }
    onResults(results);
  };

  const handleClear = () => { setQuery(""); setAvailableOnly(false); onResults(undefined); };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="station-search-input"
          placeholder="Search stations by name or city..."
          value={query}
          onChange={(e) => handleSearch(e.target.value, availableOnly)}
          className="pl-10 pr-10 h-11 rounded-xl bg-card border-border focus-visible:ring-primary/30"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-card border border-border">
        <Switch
          id="available-filter"
          checked={availableOnly}
          onCheckedChange={(checked) => { setAvailableOnly(checked); handleSearch(query, checked); }}
        />
        <Label htmlFor="available-filter" className="text-sm cursor-pointer whitespace-nowrap select-none">
          Available only
        </Label>
      </div>
    </div>
  );
};

export default StationSearch;

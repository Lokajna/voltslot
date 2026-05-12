/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useBooking } from "@/contexts/BookingContext";
import { Station } from "@/types";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createStationIcon = (hasNormal: boolean, hasFast: boolean) => {
  const color = hasFast && hasNormal ? "#22c55e" : hasFast ? "#f59e0b" : "#3b82f6";
  const glow = hasFast && hasNormal ? "rgba(34,197,94,0.4)" : hasFast ? "rgba(245,158,11,0.4)" : "rgba(59,130,246,0.4)";
  return L.divIcon({
    className: "custom-station-marker",
    html: `<div style="
      width: 38px; height: 38px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px ${glow}, 0 2px 4px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

const createUserLocationIcon = () => {
  return L.divIcon({
    className: "user-location-marker",
    html: `<div class="user-location-pulse"></div><div class="user-location-dot"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

function FitBounds({ stations }: { stations: Station[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (stations.length === 0) return;
    const bounds = L.latLngBounds(stations.map((s) => [s.latitude, s.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [stations, map]);
  return null;
}

interface StationMapProps {
  onSelectStation: (station: Station) => void;
  filteredStations?: Station[];
  height?: string;
}

const StationMap: React.FC<StationMapProps> = ({ onSelectStation, filteredStations, height = "100%" }) => {
  const { stations, chargers } = useBooking();
  const displayStations = filteredStations ?? stations;
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const stationMeta = useMemo(() => {
    const map: Record<string, { hasNormal: boolean; hasFast: boolean }> = {};
    for (const station of displayStations) {
      const sc = chargers.filter((c) => c.station_id === station.id && c.status !== "maintenance");
      map[station.id] = {
        hasNormal: sc.some((c) => c.charger_type === "normal"),
        hasFast: sc.some((c) => c.charger_type === "fast"),
      };
    }
    return map;
  }, [displayStations, chargers]);

  if (stations.length === 0) {
    return (
      <div className="flex items-center justify-center bg-card rounded-2xl border border-border" style={{ height }}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary animate-pulse">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <p className="text-muted-foreground font-medium">Locating stations...</p>
        </div>
      </div>
    );
  }

  const center: [number, number] = [12.3150, 76.6400]; // Mysore center

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stations={displayStations} />
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={Math.max(userLocation.accuracy, 12)}
              pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.12, weight: 1 }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserLocationIcon()}
              zIndexOffset={1000}
            />
          </>
        )}
        {displayStations.map((station) => {
          const meta = stationMeta[station.id] ?? { hasNormal: true, hasFast: false };
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={createStationIcon(meta.hasNormal, meta.hasFast)}
              eventHandlers={{ click: () => onSelectStation(station) }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default StationMap;

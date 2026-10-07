"use client";

import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DemandBadge } from "@/components/DemandBadge";
import type { DemandLevel } from "@/lib/types";

export type MapStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  currentDemand: number;
  predictedDemand: number;
  demandLevel: DemandLevel;
};

const levelColor: Record<DemandLevel, string> = {
  LOW: "#34d399",
  MEDIUM: "#fbbf24",
  HIGH: "#fb923c",
  "OVER CAPACITY": "#fb7185",
};

export function NetworkMap({
  stops,
  path = [],
}: {
  stops: MapStop[];
  path?: string[];
}) {
  const pathCoords = path
    .map((id) => stops.find((s) => s.id === id))
    .filter((s): s is MapStop => Boolean(s))
    .map((s) => [s.lat, s.lng] as [number, number]);

  return (
    <MapContainer
      center={[19.03, 72.86]}
      zoom={12}
      className="h-[420px] w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pathCoords.length > 1 ? (
        <Polyline positions={pathCoords} pathOptions={{ color: "#22d3ee", weight: 5 }} />
      ) : null}
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={10}
          pathOptions={{
            color: levelColor[stop.demandLevel],
            fillColor: levelColor[stop.demandLevel],
            fillOpacity: 0.85,
          }}
        >
          <Popup>
            <div className="min-w-44 text-slate-900">
              <p className="font-semibold">{stop.name}</p>
              <p className="text-xs text-slate-600">Demo stop · not official data</p>
              <p className="mt-2 text-sm">Current demand: {stop.currentDemand}</p>
              <p className="text-sm">Predicted demand: {stop.predictedDemand}</p>
              <div className="mt-2">
                <DemandBadge level={stop.demandLevel} />
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

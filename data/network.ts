import type { GraphEdge, RouteInfo, Stop } from "@/lib/types";

export const DATASET_NOTICE =
  "Synthetic dataset created for academic demonstration. Stop names are Mumbai-inspired demo locations, not official transport data.";

export const stops: Stop[] = [
  { id: "colaba", name: "Colaba Demo Pier", lat: 18.9067, lng: 72.8147, area: "South" },
  { id: "gateway", name: "Gateway Demo Hub", lat: 18.922, lng: 72.8347, area: "South" },
  { id: "churchgate", name: "Churchgate Demo", lat: 18.935, lng: 72.8272, area: "South" },
  { id: "marine", name: "Marine Drive Demo", lat: 18.9432, lng: 72.8234, area: "South" },
  { id: "worli", name: "Worli Demo", lat: 19.0176, lng: 72.8162, area: "Central" },
  { id: "dadar", name: "Dadar Demo", lat: 19.0178, lng: 72.8478, area: "Central" },
  { id: "bkc", name: "BKC Demo", lat: 19.0602, lng: 72.8671, area: "Central" },
  { id: "bandra", name: "Bandra Demo", lat: 19.0596, lng: 72.8295, area: "West" },
  { id: "juhu", name: "Juhu Demo", lat: 19.1076, lng: 72.8263, area: "West" },
  { id: "andheri", name: "Andheri Demo", lat: 19.1197, lng: 72.8468, area: "West" },
  { id: "kurla", name: "Kurla Demo", lat: 19.0726, lng: 72.884, area: "East" },
  { id: "powai", name: "Powai Demo", lat: 19.1176, lng: 72.9059, area: "East" },
];

export const routes: RouteInfo[] = [
  {
    id: "R1",
    name: "R1 Coastal Express",
    color: "#22d3ee",
    stopIds: ["colaba", "gateway", "churchgate", "marine", "worli", "bandra", "juhu"],
    capacity: 55,
  },
  {
    id: "R2",
    name: "R2 Central Link",
    color: "#a78bfa",
    stopIds: ["gateway", "dadar", "kurla", "powai"],
    capacity: 60,
  },
  {
    id: "R3",
    name: "R3 Western Connector",
    color: "#34d399",
    stopIds: ["churchgate", "dadar", "bandra", "andheri"],
    capacity: 50,
  },
  {
    id: "R4",
    name: "R4 Airport Corridor",
    color: "#fbbf24",
    stopIds: ["bkc", "kurla", "andheri", "powai"],
    capacity: 50,
  },
  {
    id: "R5",
    name: "R5 Harbour Loop",
    color: "#fb7185",
    stopIds: ["colaba", "gateway", "bkc", "kurla"],
    capacity: 45,
  },
  {
    id: "R6",
    name: "R6 Suburban",
    color: "#60a5fa",
    stopIds: ["juhu", "andheri", "powai"],
    capacity: 40,
  },
];

export const edges: GraphEdge[] = [
  { from: "colaba", to: "gateway", distanceKm: 3.2, minutes: 12 },
  { from: "gateway", to: "churchgate", distanceKm: 1.8, minutes: 8 },
  { from: "churchgate", to: "marine", distanceKm: 1.1, minutes: 6 },
  { from: "marine", to: "worli", distanceKm: 8.6, minutes: 22 },
  { from: "worli", to: "bandra", distanceKm: 6.4, minutes: 18 },
  { from: "bandra", to: "juhu", distanceKm: 6.1, minutes: 16 },
  { from: "gateway", to: "dadar", distanceKm: 11.4, minutes: 28 },
  { from: "dadar", to: "kurla", distanceKm: 6.8, minutes: 18 },
  { from: "kurla", to: "powai", distanceKm: 7.2, minutes: 20 },
  { from: "churchgate", to: "dadar", distanceKm: 10.2, minutes: 24 },
  { from: "dadar", to: "bandra", distanceKm: 6.0, minutes: 16 },
  { from: "bandra", to: "andheri", distanceKm: 8.4, minutes: 22 },
  { from: "bkc", to: "kurla", distanceKm: 3.4, minutes: 12 },
  { from: "kurla", to: "andheri", distanceKm: 8.1, minutes: 22 },
  { from: "andheri", to: "powai", distanceKm: 7.6, minutes: 20 },
  { from: "gateway", to: "bkc", distanceKm: 16.2, minutes: 34 },
  { from: "juhu", to: "andheri", distanceKm: 3.8, minutes: 12 },
  { from: "worli", to: "dadar", distanceKm: 4.1, minutes: 14 },
  { from: "bkc", to: "bandra", distanceKm: 4.6, minutes: 14 },
];

export const undirectedEdges: GraphEdge[] = edges.flatMap((edge) => [
  edge,
  {
    from: edge.to,
    to: edge.from,
    distanceKm: edge.distanceKm,
    minutes: edge.minutes,
  },
]);

export function getStop(id: string) {
  return stops.find((s) => s.id === id);
}

export function getRoute(id: string) {
  return routes.find((r) => r.id === id);
}

export type Weather = "Clear" | "Cloudy" | "Rain" | "Heavy Rain";
export type Traffic = "Low" | "Moderate" | "High";
export type DemandLevel = "LOW" | "MEDIUM" | "HIGH" | "OVER CAPACITY";

export type TripRecord = {
  id: string;
  date: string;
  time: string;
  hour: number;
  weekday: string;
  is_weekend: boolean;
  route: string;
  route_id: string;
  stop: string;
  stop_id: string;
  passenger_count: number;
  vehicle_capacity: number;
  weather: Weather;
  traffic: Traffic;
  is_holiday: boolean;
  special_event: boolean;
};

export type Stop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  area: string;
};

export type RouteInfo = {
  id: string;
  name: string;
  color: string;
  stopIds: string[];
  capacity: number;
};

export type GraphEdge = {
  from: string;
  to: string;
  distanceKm: number;
  minutes: number;
};

export type PredictionInput = {
  routeId: string;
  stopId: string;
  date: string;
  time: string;
  weather: Weather;
  traffic: Traffic;
  isHoliday: boolean;
  specialEvent: boolean;
};

export type PredictionResult = {
  predictedPassengers: number;
  capacity: number;
  utilization: number;
  demandLevel: DemandLevel;
  recommendation: string;
  confidence: string;
  sampleSize: number;
  method: string;
};

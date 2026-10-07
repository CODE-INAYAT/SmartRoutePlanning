import trips from "@/data/trips.json";
import type { DemandLevel, TripRecord } from "@/lib/types";

export const tripRecords = trips as TripRecord[];

export function mean(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function utilization(passengers: number, capacity: number) {
  if (!capacity) return 0;
  return (passengers / capacity) * 100;
}

export function demandLevel(passengers: number, capacity: number): DemandLevel {
  const u = utilization(passengers, capacity);
  if (u >= 95) return "OVER CAPACITY";
  if (u >= 70) return "HIGH";
  if (u >= 40) return "MEDIUM";
  return "LOW";
}

export function recommendationFor(level: DemandLevel, utilizationPct: number) {
  if (level === "OVER CAPACITY") {
    return "Overcrowding risk. Add a vehicle and increase frequency immediately.";
  }
  if (level === "HIGH") {
    return "High demand expected. Increase vehicle frequency during this period.";
  }
  if (level === "MEDIUM") {
    return utilizationPct >= 60
      ? "Moderate-to-busy demand. Monitor overcrowding and keep a standby vehicle ready."
      : "Stable demand. Maintain the current schedule and watch peak transfers.";
  }
  return "Low demand expected. Reduce frequency slightly and consider an alternative feeder route.";
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

export function formatPct(value: number) {
  return `${value.toFixed(1)}%`;
}

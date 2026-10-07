import { getRoute, getStop } from "@/data/network";
import { demandLevel, mean, recommendationFor, tripRecords, utilization } from "@/lib/dataset";
import type { PredictionInput, PredictionResult, TripRecord } from "@/lib/types";

function hourFromTime(time: string) {
  const hour = Number(time.slice(0, 2));
  return Number.isFinite(hour) ? hour : 8;
}

function isWeekendDate(date: string) {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

function similarityWeight(row: TripRecord, input: PredictionInput, hour: number, weekend: boolean) {
  let weight = 0.4;
  if (row.route_id === input.routeId) weight += 2.2;
  if (row.stop_id === input.stopId) weight += 2.4;
  if (row.hour === hour) weight += 3.2;
  else if (Math.abs(row.hour - hour) === 1) weight += 1.2;
  if (row.is_weekend === weekend) weight += 1.1;
  if (row.weather === input.weather) weight += 0.8;
  if (row.traffic === input.traffic) weight += 0.5;
  if (row.is_holiday === input.isHoliday) weight += 0.9;
  if (row.special_event === input.specialEvent) weight += 0.7;
  return weight;
}

export function predictDemand(input: PredictionInput): PredictionResult {
  const route = getRoute(input.routeId);
  const stop = getStop(input.stopId);
  const hour = hourFromTime(input.time);
  const weekend = isWeekendDate(input.date);
  const capacity = route?.capacity ?? 50;

  let weightedSum = 0;
  let weightTotal = 0;
  let sampleSize = 0;

  for (const row of tripRecords) {
    const w = similarityWeight(row, input, hour, weekend);
    if (w < 3.5) continue;
    weightedSum += row.passenger_count * w;
    weightTotal += w;
    sampleSize += 1;
  }

  let predicted =
    weightTotal > 0
      ? weightedSum / weightTotal
      : mean(tripRecords.map((r) => r.passenger_count));

  const closeMatches = tripRecords.filter(
    (row) =>
      row.route_id === input.routeId &&
      row.stop_id === input.stopId &&
      row.hour === hour
  );

  if (closeMatches.length >= 8) {
    predicted = 0.65 * mean(closeMatches.map((r) => r.passenger_count)) + 0.35 * predicted;
  }

  if (input.weather === "Rain") predicted *= 1.08;
  if (input.weather === "Heavy Rain") predicted *= 0.94;
  if (input.traffic === "High") predicted *= 1.05;
  if (input.isHoliday && !weekend) predicted *= 0.82;
  if (input.specialEvent) predicted *= 1.28;

  const predictedPassengers = Math.max(3, Math.round(predicted));
  const util = utilization(predictedPassengers, capacity);
  const level = demandLevel(predictedPassengers, capacity);

  return {
    predictedPassengers,
    capacity,
    utilization: util,
    demandLevel: level,
    recommendation: recommendationFor(level, util),
    confidence: sampleSize > 180 ? "High" : sampleSize > 60 ? "Moderate" : "Limited",
    sampleSize,
    method: `Weighted historical similarity on ${stop?.name ?? "stop"} / ${route?.name ?? "route"} (hour ${hour}).`,
  };
}

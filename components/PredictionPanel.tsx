"use client";

import { useMemo, useState } from "react";
import { DemandBadge } from "@/components/DemandBadge";
import { Card } from "@/components/ui";
import { routes, stops } from "@/data/network";
import type { PredictionResult, Traffic, Weather } from "@/lib/types";

const weathers: Weather[] = ["Clear", "Cloudy", "Rain", "Heavy Rain"];
const trafficLevels: Traffic[] = ["Low", "Moderate", "High"];

export function PredictionPanel() {
  const [routeId, setRouteId] = useState(routes[0].id);
  const routeStops = useMemo(
    () => stops.filter((s) => routes.find((r) => r.id === routeId)?.stopIds.includes(s.id)),
    [routeId]
  );
  const [stopId, setStopId] = useState(routeStops[0]?.id ?? stops[0].id);
  const [date, setDate] = useState("2026-09-08");
  const [time, setTime] = useState("08:00");
  const [weather, setWeather] = useState<Weather>("Clear");
  const [traffic, setTraffic] = useState<Traffic>("High");
  const [isHoliday, setIsHoliday] = useState(false);
  const [specialEvent, setSpecialEvent] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId,
          stopId,
          date,
          time,
          weather,
          traffic,
          isHoliday,
          specialEvent,
        }),
      });
      if (!response.ok) throw new Error("Prediction failed");
      setResult((await response.json()) as PredictionResult);
    } catch {
      setError("Could not generate a prediction. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <h3 className="text-sm font-semibold text-slate-200">Prediction inputs</h3>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Route
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={routeId}
              onChange={(e) => {
                const next = e.target.value;
                setRouteId(next);
                const first = stops.find((s) =>
                  routes.find((r) => r.id === next)?.stopIds.includes(s.id)
                );
                if (first) setStopId(first.id);
              }}
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Stop
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={stopId}
              onChange={(e) => setStopId(e.target.value)}
            >
              {routeStops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="text-sm">
            Time
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {["06:00", "07:00", "08:00", "09:00", "12:00", "17:00", "18:00", "19:00", "21:00"].map(
                (t) => (
                  <option key={t}>{t}</option>
                )
              )}
            </select>
          </label>
          <label className="text-sm">
            Weather
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={weather}
              onChange={(e) => setWeather(e.target.value as Weather)}
            >
              {weathers.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Traffic
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={traffic}
              onChange={(e) => setTraffic(e.target.value as Traffic)}
            >
              {trafficLevels.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm sm:mt-7">
            <input
              type="checkbox"
              checked={isHoliday}
              onChange={(e) => setIsHoliday(e.target.checked)}
            />
            Holiday
          </label>
          <label className="flex items-center gap-2 text-sm sm:mt-7">
            <input
              type="checkbox"
              checked={specialEvent}
              onChange={(e) => setSpecialEvent(e.target.checked)}
            />
            Special event
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {loading ? "Predicting…" : "Predict demand"}
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-slate-200">Predicted passenger demand</h3>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {!result && !error ? (
          <p className="mt-8 text-sm text-slate-400">
            Choose scenario details and run a prediction. Results are computed from the historical
            synthetic dataset using weighted similarity, not hardcoded values.
          </p>
        ) : null}
        {result ? (
          <div className="mt-4 space-y-4">
            <p className="text-4xl font-semibold">{result.predictedPassengers}</p>
            <p className="text-sm text-slate-400">passengers expected at this stop / trip slice</p>
            <DemandBadge level={result.demandLevel} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-slate-400">Vehicle capacity</p>
                <p className="text-lg font-medium">{result.capacity}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-slate-400">Utilization</p>
                <p className="text-lg font-medium">{result.utilization.toFixed(1)}%</p>
              </div>
            </div>
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">
              {result.recommendation}
            </div>
            <p className="text-xs text-slate-500">
              {result.method} Confidence: {result.confidence} (n={result.sampleSize} similar records).
            </p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

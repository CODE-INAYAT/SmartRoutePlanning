"use client";

import { useState } from "react";
import { DemandBadge } from "@/components/DemandBadge";
import { NetworkMapLoader } from "@/components/NetworkMapLoader";
import { Card } from "@/components/ui";
import { stops } from "@/data/network";
import type { PathResult } from "@/lib/routing";
import type { MapStop } from "@/components/NetworkMap";

type PlanResponse = {
  shortest: PathResult | null;
  demandAware: PathResult | null;
  startName: string;
  endName: string;
};

export function RoutePlanner({ mapStops }: { mapStops: MapStop[] }) {
  const [startId, setStartId] = useState("colaba");
  const [endId, setEndId] = useState("powai");
  const [demandAware, setDemandAware] = useState(false);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const active = demandAware ? plan?.demandAware : plan?.shortest;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startId, endId }),
      });
      if (!response.ok) throw new Error("Routing failed");
      setPlan((await response.json()) as PlanResponse);
    } catch {
      setError("Could not calculate a route between these stops.");
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4">
          <label className="text-sm">
            Start stop
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Destination stop
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-[#0c1220] px-3 py-2"
              value={endId}
              onChange={(e) => setEndId(e.target.value)}
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm md:mt-7">
            <input
              type="checkbox"
              checked={demandAware}
              onChange={(e) => setDemandAware(e.target.checked)}
            />
            Demand-aware route
          </label>
          <div className="md:mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {loading ? "Calculating…" : "Find route"}
            </button>
          </div>
        </form>
      </Card>

      <NetworkMapLoader stops={mapStops} path={active?.path ?? []} />

      {error ? (
        <Card>
          <p className="text-sm text-rose-300">{error}</p>
        </Card>
      ) : null}

      {!plan && !error ? (
        <Card>
          <p className="text-sm text-slate-400">
            Select a start and destination. The planner runs Dijkstra on the demo network. Enable
            demand-aware routing to penalize historically crowded stops.
          </p>
        </Card>
      ) : null}

      {plan && !active ? (
        <Card>
          <p className="text-sm text-slate-400">No path was found between these demonstration stops.</p>
        </Card>
      ) : null}

      {active ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Suggested route</p>
            <p className="mt-2 text-sm leading-relaxed">
              {active.path
                .map((id) => mapStops.find((s) => s.id === id)?.name ?? id)
                .join(" → ")}
            </p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Distance / time</p>
            <p className="mt-2 text-2xl font-semibold">{active.distanceKm} km</p>
            <p className="text-sm text-slate-400">{active.minutes} min estimated</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-wide text-slate-400">Mode</p>
            <p className="mt-2 text-lg font-medium">
              {demandAware ? "Demand-aware" : "Shortest path"}
            </p>
            <p className="text-sm text-slate-400">
              Avg demand along path: {Math.round(active.demandScore)} passengers
            </p>
          </Card>
          <Card className="lg:col-span-3">
            <p className="mb-3 text-sm font-semibold">Demand level along route</p>
            {active.segments.length === 0 ? (
              <p className="text-sm text-slate-400">Start and destination are the same stop.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-2">From</th>
                      <th>To</th>
                      <th>Km</th>
                      <th>Min</th>
                      <th>Avg demand</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.segments.map((seg) => (
                      <tr key={`${seg.from}-${seg.to}`} className="border-t border-white/10">
                        <td className="py-2">{mapStops.find((s) => s.id === seg.from)?.name}</td>
                        <td>{mapStops.find((s) => s.id === seg.to)?.name}</td>
                        <td>{seg.distanceKm}</td>
                        <td>{seg.minutes}</td>
                        <td>{seg.avgPassengers}</td>
                        <td>
                          <DemandBadge level={seg.demandLevel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

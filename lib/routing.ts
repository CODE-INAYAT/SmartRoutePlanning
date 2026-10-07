import { undirectedEdges } from "@/data/network";
import { demandLevel, mean, tripRecords } from "@/lib/dataset";
import { getRoute, getStop } from "@/data/network";
import type { DemandLevel } from "@/lib/types";

export type PathResult = {
  path: string[];
  distanceKm: number;
  minutes: number;
  demandScore: number;
  segments: {
    from: string;
    to: string;
    distanceKm: number;
    minutes: number;
    demandLevel: DemandLevel;
    avgPassengers: number;
  }[];
};

function adjacency() {
  const map = new Map<string, { to: string; distanceKm: number; minutes: number }[]>();
  for (const edge of undirectedEdges) {
    const list = map.get(edge.from) ?? [];
    list.push({ to: edge.to, distanceKm: edge.distanceKm, minutes: edge.minutes });
    map.set(edge.from, list);
  }
  return map;
}

function stopDemandLookup() {
  const map = new Map<string, number>();
  for (const stopId of new Set(tripRecords.map((r) => r.stop_id))) {
    map.set(
      stopId,
      mean(tripRecords.filter((r) => r.stop_id === stopId).map((r) => r.passenger_count))
    );
  }
  return map;
}

const graph = adjacency();
const avgDemandByStop = stopDemandLookup();

function dijkstra(start: string, goal: string, demandAware: boolean): PathResult | null {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  dist.set(start, 0);
  prev.set(start, null);

  while (visited.size < graph.size) {
    let current: string | null = null;
    let best = Infinity;
    for (const [node, value] of dist) {
      if (!visited.has(node) && value < best) {
        best = value;
        current = node;
      }
    }
    if (current === null) break;
    if (current === goal) break;
    visited.add(current);

    for (const edge of graph.get(current) ?? []) {
      const demand = avgDemandByStop.get(edge.to) ?? 20;
      const demandPenalty = demandAware ? 1 + Math.min(demand / 80, 0.85) : 1;
      const cost = edge.distanceKm * demandPenalty;
      const next = (dist.get(current) ?? Infinity) + cost;
      if (next < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, next);
        prev.set(edge.to, current);
      }
    }
  }

  if (!prev.has(goal) && start !== goal) return null;

  const path: string[] = [];
  let node: string | null = goal;
  while (node) {
    path.unshift(node);
    node = prev.get(node) ?? null;
  }
  if (path[0] !== start) return null;

  const segments = [];
  let distanceKm = 0;
  let minutes = 0;
  let demandScore = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = (graph.get(from) ?? []).find((e) => e.to === to);
    if (!edge) continue;
    const avgPassengers = mean(
      tripRecords
        .filter((r) => r.stop_id === from || r.stop_id === to)
        .map((r) => r.passenger_count)
    );
    const routeCapacity =
      getRoute(
        tripRecords.find((r) => r.stop_id === from)?.route_id ?? "R1"
      )?.capacity ?? 50;
    segments.push({
      from,
      to,
      distanceKm: edge.distanceKm,
      minutes: edge.minutes,
      demandLevel: demandLevel(avgPassengers, routeCapacity),
      avgPassengers: Math.round(avgPassengers),
    });
    distanceKm += edge.distanceKm;
    minutes += edge.minutes;
    demandScore += avgPassengers;
  }

  return {
    path,
    distanceKm: Number(distanceKm.toFixed(1)),
    minutes,
    demandScore: path.length ? demandScore / Math.max(path.length - 1, 1) : 0,
    segments,
  };
}

export function planRoute(startId: string, endId: string) {
  if (startId === endId) {
    const stop = getStop(startId);
    return {
      shortest: {
        path: [startId],
        distanceKm: 0,
        minutes: 0,
        demandScore: avgDemandByStop.get(startId) ?? 0,
        segments: [],
      } satisfies PathResult,
      demandAware: {
        path: [startId],
        distanceKm: 0,
        minutes: 0,
        demandScore: avgDemandByStop.get(startId) ?? 0,
        segments: [],
      } satisfies PathResult,
      startName: stop?.name ?? startId,
      endName: stop?.name ?? endId,
    };
  }

  return {
    shortest: dijkstra(startId, endId, false),
    demandAware: dijkstra(startId, endId, true),
    startName: getStop(startId)?.name ?? startId,
    endName: getStop(endId)?.name ?? endId,
  };
}

export function stopDemandSnapshot() {
  return [...avgDemandByStop.entries()].map(([id, avg]) => {
    const stop = getStop(id);
    const peak = Math.max(
      ...tripRecords.filter((r) => r.stop_id === id).map((r) => r.passenger_count)
    );
    const capacity =
      getRoute(tripRecords.find((r) => r.stop_id === id)?.route_id ?? "R1")?.capacity ?? 50;
    return {
      id,
      name: stop?.name ?? id,
      lat: stop?.lat ?? 0,
      lng: stop?.lng ?? 0,
      currentDemand: Math.round(avg),
      predictedDemand: Math.round(avg * 1.04),
      demandLevel: demandLevel(avg, capacity),
      peak,
    };
  });
}

import { routes } from "@/data/network";
import { demandLevel, mean, recommendationFor, tripRecords, utilization } from "@/lib/dataset";
import { predictDemand } from "@/lib/predict";

function groupSum(key: (row: (typeof tripRecords)[number]) => string) {
  const map = new Map<string, number[]>();
  for (const row of tripRecords) {
    const k = key(row);
    const list = map.get(k) ?? [];
    list.push(row.passenger_count);
    map.set(k, list);
  }
  return [...map.entries()]
    .map(([name, values]) => ({
      name,
      total: values.reduce((a, b) => a + b, 0),
      avg: mean(values),
      count: values.length,
    }))
    .sort((a, b) => b.total - a.total);
}

export function dashboardStats() {
  const passengers = tripRecords.map((r) => r.passenger_count);
  const totalPassengers = passengers.reduce((a, b) => a + b, 0);
  const avgDemand = mean(passengers);
  const byHour = groupSum((r) => String(r.hour).padStart(2, "0") + ":00");
  const byRoute = groupSum((r) => r.route);
  const peakHour = byHour[0];
  const busiestRoute = byRoute[0];
  const avgUtilization = mean(
    tripRecords.map((r) => utilization(r.passenger_count, r.vehicle_capacity))
  );

  const byDate = groupSum((r) => r.date).sort((a, b) => a.name.localeCompare(b.name));
  const weekday = tripRecords.filter((r) => !r.is_weekend);
  const weekend = tripRecords.filter((r) => r.is_weekend);

  return {
    totalPassengers,
    avgDemand,
    peakHour: peakHour?.name ?? "—",
    peakHourAvg: peakHour?.avg ?? 0,
    busiestRoute: busiestRoute?.name ?? "—",
    busiestRouteTotal: busiestRoute?.total ?? 0,
    avgUtilization,
    demandOverTime: byDate.map((d) => ({ date: d.name, passengers: d.total })),
    demandByHour: [...byHour].sort((a, b) => a.name.localeCompare(b.name)).map((h) => ({
      hour: h.name,
      passengers: Math.round(h.avg),
    })),
    demandByRoute: byRoute.map((r) => ({
      route: r.name.replace(/^\w+\s/, ""),
      fullName: r.name,
      passengers: r.total,
      avg: r.avg,
    })),
    weekdayVsWeekend: [
      { name: "Weekday", passengers: Math.round(mean(weekday.map((r) => r.passenger_count))) },
      { name: "Weekend", passengers: Math.round(mean(weekend.map((r) => r.passenger_count))) },
    ],
    recordCount: tripRecords.length,
  };
}

export function analyticsBundle() {
  const passengers = tripRecords.map((r) => r.passenger_count);
  const byRoute = groupSum((r) => r.route);
  const byStop = groupSum((r) => r.stop);
  const byHour = groupSum((r) => String(r.hour).padStart(2, "0") + ":00");

  const weather = groupSum((r) => r.weather).map((w) => ({
    name: w.name,
    avgDemand: Number(w.avg.toFixed(1)),
  }));

  const traffic = ["Low", "Moderate", "High"].map((level) => {
    const rows = tripRecords.filter((r) => r.traffic === level);
    return {
      name: level,
      avgDemand: Number(mean(rows.map((r) => r.passenger_count)).toFixed(1)),
      estimatedMinutes: Number(
        (14 + (level === "High" ? 9 : level === "Moderate" ? 4 : 0) + (mean(rows.map((r) => r.passenger_count)) / 20)).toFixed(1)
      ),
    };
  });

  const weekday = tripRecords.filter((r) => !r.is_weekend);
  const weekend = tripRecords.filter((r) => r.is_weekend);
  const holiday = tripRecords.filter((r) => r.is_holiday);
  const normal = tripRecords.filter((r) => !r.is_holiday);
  const event = tripRecords.filter((r) => r.special_event);
  const noEvent = tripRecords.filter((r) => !r.special_event);

  const baseline = mean(passengers);
  const highHours = [...byHour].sort((a, b) => b.avg - a.avg).slice(0, 4);

  const samplePredictions = routes.slice(0, 4).map((route) => {
    const stopId = route.stopIds[Math.min(1, route.stopIds.length - 1)];
    const result = predictDemand({
      routeId: route.id,
      stopId,
      date: "2026-09-08",
      time: "08:00",
      weather: "Clear",
      traffic: "High",
      isHoliday: false,
      specialEvent: false,
    });
    return {
      label: `${route.id} · 08:00`,
      predicted: result.predictedPassengers,
      level: result.demandLevel,
    };
  });

  const trend = groupSum((r) => r.date)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d) => ({ date: d.name.slice(5), avg: Number(d.avg.toFixed(1)) }));

  const prescriptions = byRoute.slice(0, 6).map((route) => {
    const sample = tripRecords.find((r) => r.route === route.name);
    const cap = sample?.vehicle_capacity ?? 50;
    const util = utilization(route.avg, cap);
    const level = demandLevel(route.avg, cap);
    return {
      route: route.name,
      avg: Number(route.avg.toFixed(1)),
      utilization: util,
      level,
      action: recommendationFor(level, util),
    };
  });

  return {
    descriptive: {
      averageDemand: mean(passengers),
      maxDemand: Math.max(...passengers),
      minDemand: Math.min(...passengers),
      busiestRoutes: byRoute.slice(0, 5),
      busiestStops: byStop.slice(0, 5),
      peakHours: [...byHour].sort((a, b) => b.avg - a.avg).slice(0, 5),
    },
    diagnostic: {
      weather,
      traffic,
      weekdayAvg: mean(weekday.map((r) => r.passenger_count)),
      weekendAvg: mean(weekend.map((r) => r.passenger_count)),
      holidayAvg: mean(holiday.map((r) => r.passenger_count)),
      normalAvg: mean(normal.map((r) => r.passenger_count)),
      eventAvg: event.length ? mean(event.map((r) => r.passenger_count)) : 0,
      noEventAvg: mean(noEvent.map((r) => r.passenger_count)),
      insights: [
        `Rainy conditions change average boarding versus clear days by ${
          (weather.find((w) => w.name === "Rain")?.avgDemand ?? baseline) - (weather.find((w) => w.name === "Clear")?.avgDemand ?? baseline)
        > 0 ? "an increase" : "a decrease"} of ${Math.abs(
          (weather.find((w) => w.name === "Rain")?.avgDemand ?? 0) -
            (weather.find((w) => w.name === "Clear")?.avgDemand ?? 0)
        ).toFixed(1)} passengers.`,
        `High traffic is associated with slower estimated segment times (${traffic.find((t) => t.name === "High")?.estimatedMinutes ?? "—"} min) versus low traffic (${traffic.find((t) => t.name === "Low")?.estimatedMinutes ?? "—"} min).`,
        `Weekday average demand is ${mean(weekday.map((r) => r.passenger_count)).toFixed(1)} vs weekend ${mean(weekend.map((r) => r.passenger_count)).toFixed(1)}.`,
        `Holiday records average ${mean(holiday.map((r) => r.passenger_count)).toFixed(1)} passengers compared with ${mean(normal.map((r) => r.passenger_count)).toFixed(1)} on non-holiday days.`,
        `Special-event records average ${mean(event.map((r) => r.passenger_count)).toFixed(1)} passengers, versus ${mean(noEvent.map((r) => r.passenger_count)).toFixed(1)} without events.`,
      ],
    },
    predictive: {
      samplePredictions,
      trend,
      highDemandPeriods: highHours.map((h) => ({
        period: h.name,
        avg: Number(h.avg.toFixed(1)),
      })),
    },
    prescriptive: prescriptions,
  };
}

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const stops = [
  { id: "colaba", name: "Colaba Demo Pier" },
  { id: "gateway", name: "Gateway Demo Hub" },
  { id: "churchgate", name: "Churchgate Demo" },
  { id: "marine", name: "Marine Drive Demo" },
  { id: "worli", name: "Worli Demo" },
  { id: "dadar", name: "Dadar Demo" },
  { id: "bkc", name: "BKC Demo" },
  { id: "bandra", name: "Bandra Demo" },
  { id: "juhu", name: "Juhu Demo" },
  { id: "andheri", name: "Andheri Demo" },
  { id: "kurla", name: "Kurla Demo" },
  { id: "powai", name: "Powai Demo" },
];

const routes = [
  {
    id: "R1",
    name: "R1 Coastal Express",
    stopIds: ["colaba", "gateway", "churchgate", "marine", "worli", "bandra", "juhu"],
    capacity: 55,
    demandScale: 1.15,
  },
  {
    id: "R2",
    name: "R2 Central Link",
    stopIds: ["gateway", "dadar", "kurla", "powai"],
    capacity: 60,
    demandScale: 1.25,
  },
  {
    id: "R3",
    name: "R3 Western Connector",
    stopIds: ["churchgate", "dadar", "bandra", "andheri"],
    capacity: 50,
    demandScale: 1.2,
  },
  {
    id: "R4",
    name: "R4 Airport Corridor",
    stopIds: ["bkc", "kurla", "andheri", "powai"],
    capacity: 50,
    demandScale: 0.95,
  },
  {
    id: "R5",
    name: "R5 Harbour Loop",
    stopIds: ["colaba", "gateway", "bkc", "kurla"],
    capacity: 45,
    demandScale: 0.9,
  },
  {
    id: "R6",
    name: "R6 Suburban",
    stopIds: ["juhu", "andheri", "powai"],
    capacity: 40,
    demandScale: 0.85,
  },
];

const stopDemand = {
  colaba: 0.72,
  gateway: 1.18,
  churchgate: 1.22,
  marine: 0.88,
  worli: 0.82,
  dadar: 1.35,
  bkc: 1.08,
  bandra: 1.12,
  juhu: 0.78,
  andheri: 1.28,
  kurla: 1.05,
  powai: 0.8,
};

const holidays = new Set(["2026-07-04", "2026-08-15", "2026-08-19"]);
const eventDays = {
  "2026-07-11": new Set(["juhu", "bandra"]),
  "2026-07-18": new Set(["bkc"]),
  "2026-07-25": new Set(["gateway", "colaba"]),
  "2026-08-01": new Set(["andheri"]),
  "2026-08-08": new Set(["juhu"]),
  "2026-08-15": new Set(["gateway", "marine"]),
  "2026-08-22": new Set(["bkc", "dadar"]),
  "2026-08-29": new Set(["powai"]),
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260906);

function hourProfile(hour) {
  const peaks = { 7: 1.35, 8: 1.55, 9: 1.42, 17: 1.38, 18: 1.52, 19: 1.28 };
  if (peaks[hour]) return peaks[hour];
  if (hour <= 6 || hour >= 21) return 0.38;
  if (hour >= 10 && hour <= 15) return 0.72;
  return 0.9;
}

function weatherForDay(month, r) {
  if (month === 7) {
    if (r < 0.18) return "Heavy Rain";
    if (r < 0.48) return "Rain";
    if (r < 0.78) return "Cloudy";
    return "Clear";
  }
  if (r < 0.1) return "Heavy Rain";
  if (r < 0.32) return "Rain";
  if (r < 0.62) return "Cloudy";
  return "Clear";
}

function trafficFor(hour, isWeekend, weather, r) {
  let score = 0.35 + r * 0.4;
  if (hour === 8 || hour === 9 || hour === 18) score += 0.35;
  else if (hour === 7 || hour === 17 || hour === 19) score += 0.22;
  if (isWeekend) score -= 0.18;
  if (weather === "Rain") score += 0.12;
  if (weather === "Heavy Rain") score += 0.22;
  if (score > 0.72) return "High";
  if (score > 0.45) return "Moderate";
  return "Low";
}

function datesBetween(start, end) {
  const out = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const hours = [6, 7, 8, 9, 12, 17, 18, 19, 21];
const dates = datesBetween("2026-07-06T00:00:00Z", "2026-08-23T00:00:00Z");

const records = [];
let n = 0;

for (const date of dates) {
  const dt = new Date(`${date}T00:00:00Z`);
  const weekday = weekdays[dt.getUTCDay()];
  const isWeekend = dt.getUTCDay() === 0 || dt.getUTCDay() === 6;
  const isHoliday = holidays.has(date);
  const month = Number(date.slice(5, 7));
  const dayWeather = weatherForDay(month, rand());

  for (const hour of hours) {
    for (const route of routes) {
      const sampledStops = [
        route.stopIds[(hour + Number(date.slice(-2)) + route.stopIds.length) % route.stopIds.length],
      ];
      if (hour >= 17 && hour <= 19 && eventDays[date]) {
        for (const sid of eventDays[date]) {
          if (route.stopIds.includes(sid) && !sampledStops.includes(sid)) sampledStops.push(sid);
        }
      }

      for (const stopId of sampledStops) {
        const stop = stops.find((s) => s.id === stopId);
        let demand =
          32 *
          route.demandScale *
          stopDemand[stopId] *
          hourProfile(hour);

        if (isWeekend) {
          demand *= hour >= 17 || hour === 12 ? 0.95 : 0.72;
          if (["juhu", "marine", "colaba"].includes(stopId)) demand *= 1.18;
        } else if (hour === 8 || hour === 9 || hour === 18) {
          demand *= 1.08;
        }

        if (isHoliday) {
          demand *= ["juhu", "marine", "gateway", "colaba"].includes(stopId)
            ? 1.12
            : 0.68;
        }

        const specialEvent = Boolean(
          eventDays[date]?.has(stopId) && (hour >= 17 && hour <= 19)
        );
        if (specialEvent) demand *= 1.45;

        if (dayWeather === "Rain") demand *= 1.12;
        if (dayWeather === "Heavy Rain") demand *= 0.92;
        if (dayWeather === "Cloudy") demand *= 1.03;

        const traffic = trafficFor(hour, isWeekend, dayWeather, rand());
        if (traffic === "High") demand *= 1.06;
        if (traffic === "Low") demand *= 0.97;

        demand *= 0.88 + rand() * 0.24;
        const passengerCount = Math.max(
          6,
          Math.min(route.capacity + 12, Math.round(demand))
        );

        records.push({
          id: `T${++n}`,
          date,
          time: `${String(hour).padStart(2, "0")}:00`,
          hour,
          weekday,
          is_weekend: isWeekend,
          route: route.name,
          route_id: route.id,
          stop: stop.name,
          stop_id: stopId,
          passenger_count: passengerCount,
          vehicle_capacity: route.capacity,
          weather: dayWeather,
          traffic,
          is_holiday: isHoliday,
          special_event: specialEvent,
        });
      }
    }
  }
}

const outPath = join(__dirname, "..", "data", "trips.json");
writeFileSync(outPath, JSON.stringify(records));
console.log(`Wrote ${records.length} records to data/trips.json`);

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "#0c1220",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#e2e8f0",
};

export function DemandTimeChart({ data }: { data: { date: string; passengers: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} minTickGap={24} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="passengers" stroke="#22d3ee" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function HourChart({ data }: { data: { hour: string; passengers: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="hour" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="passengers" fill="#38bdf8" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RouteChart({
  data,
}: {
  data: { route: string; passengers: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis type="category" dataKey="route" width={110} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="passengers" fill="#a78bfa" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeekendChart({
  data,
}: {
  data: { name: string; passengers: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="passengers" name="Avg passengers" fill="#34d399" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({
  data,
  xKey,
  yKey,
  color = "#fbbf24",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: { date: string; avg: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
        <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} minTickGap={16} />
        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="avg" stroke="#fb7185" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

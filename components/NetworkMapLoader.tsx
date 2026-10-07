"use client";

import dynamic from "next/dynamic";
import type { MapStop } from "@/components/NetworkMap";

const Map = dynamic(() => import("@/components/NetworkMap").then((m) => m.NetworkMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] items-center justify-center rounded-xl border border-white/10 bg-[#0c1220] text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

export function NetworkMapLoader({
  stops,
  path,
}: {
  stops: MapStop[];
  path?: string[];
}) {
  return <Map stops={stops} path={path} />;
}

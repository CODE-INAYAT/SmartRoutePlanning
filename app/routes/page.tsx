import { RoutePlanner } from "@/components/RoutePlanner";
import { PageHeader } from "@/components/ui";
import { DATASET_NOTICE } from "@/data/network";
import { stopDemandSnapshot } from "@/lib/routing";

export default function RoutesPage() {
  const mapStops = stopDemandSnapshot();

  return (
    <>
      <PageHeader
        title="Route planning"
        subtitle="Plan a trip on the 12-stop demonstration network. Shortest path uses Dijkstra on distance. Demand-aware routing adds a penalty for historically crowded stops."
      />
      <p className="mb-6 text-xs text-slate-500">{DATASET_NOTICE}</p>
      <RoutePlanner mapStops={mapStops} />
    </>
  );
}

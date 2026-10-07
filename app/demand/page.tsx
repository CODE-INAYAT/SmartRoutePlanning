import { PredictionPanel } from "@/components/PredictionPanel";
import { PageHeader } from "@/components/ui";
import { DATASET_NOTICE } from "@/data/network";

export default function DemandPage() {
  return (
    <>
      <PageHeader
        title="Demand prediction"
        subtitle="Enter a route, stop, and operating scenario. The model scores similar historical records and applies weather, traffic, holiday, and event weights."
      />
      <p className="mb-6 text-xs text-slate-500">{DATASET_NOTICE}</p>
      <PredictionPanel />
    </>
  );
}

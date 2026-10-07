import {
  DemandTimeChart,
  HourChart,
  RouteChart,
  WeekendChart,
} from "@/components/Charts";
import { Card, KpiCard, PageHeader } from "@/components/ui";
import { DATASET_NOTICE } from "@/data/network";
import { dashboardStats } from "@/lib/analytics";
import { formatNumber, formatPct, tripRecords } from "@/lib/dataset";

export default function DashboardPage() {
  const stats = dashboardStats();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Descriptive view of historical boarding demand across the demonstration network. All KPIs and charts are computed from the local synthetic dataset."
      />
      <p className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-100">
        {DATASET_NOTICE} Records in use: {formatNumber(tripRecords.length)}.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Total passengers"
          value={formatNumber(stats.totalPassengers)}
          hint="Sum of recorded boardings"
        />
        <KpiCard
          label="Average demand"
          value={formatNumber(stats.avgDemand)}
          hint="Mean passengers per record"
        />
        <KpiCard
          label="Peak hour"
          value={stats.peakHour}
          hint={`Avg ${formatNumber(stats.peakHourAvg)} passengers`}
        />
        <KpiCard
          label="Busiest route"
          value={stats.busiestRoute.replace(/^R\d+\s/, "")}
          hint={`${formatNumber(stats.busiestRouteTotal)} boardings`}
        />
        <KpiCard
          label="Avg vehicle utilization"
          value={formatPct(stats.avgUtilization)}
          hint="Passengers ÷ vehicle capacity"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Passenger demand over time</h3>
          <DemandTimeChart data={stats.demandOverTime} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Demand by hour</h3>
          <HourChart data={stats.demandByHour} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Demand by route</h3>
          <RouteChart data={stats.demandByRoute} />
        </Card>
        <Card>
          <h3 className="mb-3 text-sm font-semibold">Weekday vs weekend demand</h3>
          <WeekendChart data={stats.weekdayVsWeekend} />
        </Card>
      </div>
    </>
  );
}

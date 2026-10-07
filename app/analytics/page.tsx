import { DemandBadge } from "@/components/DemandBadge";
import { SimpleBarChart, TrendChart } from "@/components/Charts";
import { Card, KpiCard, PageHeader } from "@/components/ui";
import { analyticsBundle } from "@/lib/analytics";
import { formatNumber, formatPct } from "@/lib/dataset";

export default function AnalyticsPage() {
  const data = analyticsBundle();

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Four layers of analysis computed from the synthetic boarding dataset: descriptive, diagnostic, predictive, and prescriptive."
      />

      <section className="mb-10">
        <h3 className="mb-4 text-lg font-semibold">Descriptive analytics</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Average demand" value={formatNumber(data.descriptive.averageDemand)} />
          <KpiCard label="Maximum demand" value={formatNumber(data.descriptive.maxDemand)} />
          <KpiCard label="Minimum demand" value={formatNumber(data.descriptive.minDemand)} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card>
            <p className="mb-3 text-sm font-semibold">Busiest routes</p>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-1">Route</th>
                  <th>Avg</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.descriptive.busiestRoutes.map((row) => (
                  <tr key={row.name} className="border-t border-white/10">
                    <td className="py-2">{row.name}</td>
                    <td>{row.avg.toFixed(1)}</td>
                    <td>{formatNumber(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold">Busiest stops</p>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-1">Stop</th>
                  <th>Avg</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.descriptive.busiestStops.map((row) => (
                  <tr key={row.name} className="border-t border-white/10">
                    <td className="py-2">{row.name}</td>
                    <td>{row.avg.toFixed(1)}</td>
                    <td>{formatNumber(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold">Peak hours</p>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-1">Hour</th>
                  <th>Avg demand</th>
                </tr>
              </thead>
              <tbody>
                {data.descriptive.peakHours.map((row) => (
                  <tr key={row.name} className="border-t border-white/10">
                    <td className="py-2">{row.name}</td>
                    <td>{row.avg.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="mb-4 text-lg font-semibold">Diagnostic analytics</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-3 text-sm font-semibold">Effect of weather on demand</p>
            <SimpleBarChart data={data.diagnostic.weather} xKey="name" yKey="avgDemand" color="#38bdf8" />
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold">Traffic vs estimated travel time</p>
            <SimpleBarChart
              data={data.diagnostic.traffic}
              xKey="name"
              yKey="estimatedMinutes"
              color="#fb923c"
            />
          </Card>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Weekday avg"
            value={data.diagnostic.weekdayAvg.toFixed(1)}
            hint="Passengers per record"
          />
          <KpiCard
            label="Weekend avg"
            value={data.diagnostic.weekendAvg.toFixed(1)}
            hint="Passengers per record"
          />
          <KpiCard
            label="Holiday avg"
            value={data.diagnostic.holidayAvg.toFixed(1)}
            hint={`Normal day ${data.diagnostic.normalAvg.toFixed(1)}`}
          />
          <KpiCard
            label="Special-event avg"
            value={data.diagnostic.eventAvg.toFixed(1)}
            hint={`No event ${data.diagnostic.noEventAvg.toFixed(1)}`}
          />
        </div>
        <Card className="mt-4">
          <p className="mb-3 text-sm font-semibold">Insights generated from the dataset</p>
          <ul className="space-y-2 text-sm text-slate-300">
            {data.diagnostic.insights.map((insight) => (
              <li key={insight} className="rounded-lg bg-white/5 px-3 py-2">
                {insight}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mb-10">
        <h3 className="mb-4 text-lg font-semibold">Predictive analytics</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="mb-3 text-sm font-semibold">Sample weekday 08:00 predictions</p>
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-1">Scenario</th>
                  <th>Predicted</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {data.predictive.samplePredictions.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <td className="py-2">{row.label}</td>
                    <td>{row.predicted}</td>
                    <td>
                      <DemandBadge level={row.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card>
            <p className="mb-3 text-sm font-semibold">Demand trend (daily average)</p>
            <TrendChart data={data.predictive.trend} />
          </Card>
        </div>
        <Card className="mt-4">
          <p className="mb-3 text-sm font-semibold">High-demand periods</p>
          <div className="flex flex-wrap gap-2">
            {data.predictive.highDemandPeriods.map((period) => (
              <span
                key={period.period}
                className="rounded-full bg-orange-400/15 px-3 py-1 text-sm text-orange-200"
              >
                {period.period} · avg {period.avg}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Prescriptive analytics</h3>
        <Card>
          <p className="mb-3 text-sm text-slate-400">
            Actions are derived from average utilization on each route (increase frequency, add a
            vehicle, reduce frequency, or monitor overcrowding).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="py-2">Route</th>
                  <th>Avg demand</th>
                  <th>Utilization</th>
                  <th>Level</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {data.prescriptive.map((row) => (
                  <tr key={row.route} className="border-t border-white/10">
                    <td className="py-2">{row.route}</td>
                    <td>{row.avg}</td>
                    <td>{formatPct(row.utilization)}</td>
                    <td>
                      <DemandBadge level={row.level} />
                    </td>
                    <td className="max-w-md text-slate-300">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </>
  );
}

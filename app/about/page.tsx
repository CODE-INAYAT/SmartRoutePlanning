import { Card, PageHeader } from "@/components/ui";
import { DATASET_NOTICE } from "@/data/network";
import { tripRecords } from "@/lib/dataset";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About this project"
        subtitle="Smart Public Transport Demand Prediction and Route Planning System — a college demonstration for Data Analytics in Education, Entertainment and Hospitality."
      />

      <Card className="mb-6">
        <h3 className="text-sm font-semibold">Dataset and case study</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Public transport is the main case study. The app uses {tripRecords.length.toLocaleString("en-IN")}{" "}
          synthetic trip records stored locally as JSON. {DATASET_NOTICE}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          The workflow is: historical transport data → analytics → demand prediction → demand
          level → route analysis → smart recommendation.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold">How the project maps to analytics techniques</h3>
          <dl className="mt-4 space-y-3 text-sm text-slate-300">
            <div>
              <dt className="font-medium text-white">Data collection</dt>
              <dd>
                A generator builds realistic boarding records (date, time, route, stop, passengers,
                capacity, weather, traffic, holiday, special event) with peak hours, weekends, and
                weather effects.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white">Data cleaning</dt>
              <dd>
                Records are typed, hours are parsed from timestamps, and utilization is only
                computed when vehicle capacity is present.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white">Exploratory data analysis</dt>
              <dd>
                Dashboard charts explore demand over time, by hour, by route, and weekday versus
                weekend before modelling.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white">Descriptive analytics</dt>
              <dd>Totals, averages, peak hours, busiest routes/stops, and utilization describe what happened.</dd>
            </div>
            <div>
              <dt className="font-medium text-white">Diagnostic analytics</dt>
              <dd>
                Grouped comparisons explain why demand changes: weather, traffic, holidays, weekends,
                and special events.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white">Predictive analytics</dt>
              <dd>
                A weighted historical-similarity model estimates passengers for a chosen scenario and
                classifies demand as LOW, MEDIUM, HIGH, or OVER CAPACITY.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white">Prescriptive analytics</dt>
              <dd>
                Utilization thresholds recommend increasing frequency, adding a vehicle, reducing
                service, monitoring overcrowding, or preferring an alternative path.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white">Data visualization</dt>
              <dd>Recharts and a Leaflet map present KPIs, trends, and stop-level demand.</dd>
            </div>
            <div>
              <dt className="font-medium text-white">Decision making</dt>
              <dd>
                Operators can test a peak-hour scenario, inspect overcrowding risk, then plan a
                shortest or demand-aware route.
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold">Transfer to education, entertainment, and hospitality</h3>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">
            <p>
              <span className="font-medium text-white">Education.</span> The same pipeline can
              forecast student attendance by hour, campus, and event day. Descriptive charts show
              peak lecture slots; diagnostics separate exam weeks from holidays; predictions
              support classroom and staff allocation; prescriptions suggest opening extra sections
              or reducing unused rooms.
            </p>
            <p>
              <span className="font-medium text-white">Entertainment.</span> Event attendance can
              be treated like boarding demand. Weather, weekday, and special-event flags become
              concert or match features. Predictions inform gate staffing and shuttle frequency;
              demand-aware routing is analogous to steering crowds toward less congested entrances.
            </p>
            <p>
              <span className="font-medium text-white">Hospitality.</span> Guest arrivals and F&amp;B
              covers follow the same demand curve. Hotels can forecast occupancy, diagnose the
              effect of holidays, predict dinner-hour load, and prescribe staffing or room-block
              changes. Vehicle utilization here maps to table or room utilization.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}

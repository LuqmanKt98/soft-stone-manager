import { PageHeader } from "@/components/dashboard/page-header";
import { TrackingClient } from "@/components/tracking/tracking-client";
import { getTrucks, getPayments } from "@/lib/data";
import { buildSeries, lastNDays, lastNWeeks, lastNMonths } from "@/lib/aggregations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tracking" };

export default async function TrackingPage() {
  const [trucks, payments] = await Promise.all([getTrucks(), getPayments()]);

  const d = lastNDays(30);
  const w = lastNWeeks(12);
  const mo = lastNMonths(12);

  const daily = buildSeries(trucks, payments, "day", d.start, d.end);
  const weekly = buildSeries(trucks, payments, "week", w.start, w.end);
  const monthly = buildSeries(trucks, payments, "month", mo.start, mo.end);

  return (
    <div>
      <PageHeader
        title="Tracking"
        description="Daily, weekly and monthly performance at a glance."
      />
      <TrackingClient daily={daily} weekly={weekly} monthly={monthly} />
    </div>
  );
}

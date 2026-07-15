import Link from "next/link";
import { CalendarRange, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
        eyebrow="Insights"
        title="Tracking"
        description="Daily, weekly and monthly performance at a glance."
      />
      {trucks.length === 0 && payments.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarRange}
            title="Nothing to track yet"
            description="Once you add truck trips and payments, this page breaks them down by day, week and month."
            action={
              <Link href="/trucks">
                <Button>
                  <Plus className="h-4 w-4" /> Add your first trip
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <TrackingClient daily={daily} weekly={weekly} monthly={monthly} />
      )}
    </div>
  );
}

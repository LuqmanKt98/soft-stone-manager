import Link from "next/link";
import { TrendingUp, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AnalyticsClient,
  type TruckPerf,
  type OutstandingPoint,
} from "@/components/analytics/analytics-client";
import { getTrucks, getPayments } from "@/lib/data";
import {
  buildSeries,
  lastNWeeks,
  lastNMonths,
  materialBreakdown,
} from "@/lib/aggregations";
import { computeTruckRow } from "@/lib/calculations";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [trucks, payments] = await Promise.all([getTrucks(), getPayments()]);

  const w = lastNWeeks(12);
  const mo = lastNMonths(12);
  const weekly = buildSeries(trucks, payments, "week", w.start, w.end);
  const monthly = buildSeries(trucks, payments, "month", mo.start, mo.end);

  // Cumulative outstanding from monthly series
  let cumBilled = 0;
  let cumReceived = 0;
  const outstanding: OutstandingPoint[] = monthly.map((p) => {
    cumBilled += p.revenue;
    cumReceived += p.payments;
    return {
      label: p.label,
      billed: cumBilled,
      received: cumReceived,
      outstanding: cumBilled - cumReceived,
    };
  });

  const materialPerf = materialBreakdown(trucks);

  // Truck performance
  const truckMap = new Map<string, TruckPerf>();
  for (const t of trucks) {
    const f = computeTruckRow(t);
    const cur =
      truckMap.get(t.truckNumber) ??
      { truckNumber: t.truckNumber, trips: 0, tons: 0, revenue: 0, netProfit: 0 };
    cur.trips += 1;
    cur.tons += f.tons;
    cur.revenue += f.salesRevenue;
    cur.netProfit += f.netProfit;
    truckMap.set(t.truckNumber, cur);
  }
  const truckPerf = Array.from(truckMap.values())
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 10);

  if (trucks.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="Insights"
          title="Analytics"
          description="Business insights: trends, comparisons and performance."
        />
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="No analytics yet"
            description="Add truck trips and payments to unlock revenue trends, profit analysis, transportation savings and performance comparisons."
            action={
              <Link href="/trucks">
                <Button>
                  <Plus className="h-4 w-4" /> Add your first trip
                </Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Business insights: trends, comparisons and performance."
      />
      <AnalyticsClient
        monthly={monthly}
        weekly={weekly}
        materialPerf={materialPerf}
        truckPerf={truckPerf}
        outstanding={outstanding}
      />
    </div>
  );
}

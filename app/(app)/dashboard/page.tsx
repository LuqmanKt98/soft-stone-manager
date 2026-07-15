import Link from "next/link";
import { subDays, subWeeks, subMonths } from "date-fns";
import {
  Banknote,
  TrendingUp,
  Wallet,
  Coins,
  Truck as TruckIcon,
  Scale,
  PiggyBank,
  Receipt,
  CalendarDays,
  CalendarRange,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllData } from "@/lib/data";
import { computeDashboard, periodMetrics } from "@/lib/metrics";
import { computeTruckRow } from "@/lib/calculations";
import {
  buildSeries,
  lastNDays,
  lastNWeeks,
  lastNMonths,
  materialBreakdown,
} from "@/lib/aggregations";
import { formatPKR, formatTons, formatDate, formatNumber } from "@/lib/format";
import type { DonutDatum } from "@/components/charts";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

function pctDelta(cur: number, prev: number): number | undefined {
  if (!prev) return undefined;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

export default async function DashboardPage() {
  const { trucks, payments } = await getAllData();
  const now = new Date();
  const m = computeDashboard(trucks, payments, now);

  // Deltas vs previous comparable period
  const yesterday = subDays(now, 1);
  const prevDay = periodMetrics(
    trucks,
    payments,
    new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
    new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59),
  );
  const prevWeek = computeDashboard(trucks, payments, subWeeks(now, 1)).week;
  const prevMonth = computeDashboard(trucks, payments, subMonths(now, 1)).month;

  const daily = buildSeries(trucks, payments, "day", ...toRange(lastNDays(30)));
  const weekly = buildSeries(trucks, payments, "week", ...toRange(lastNWeeks(12)));
  const monthly = buildSeries(trucks, payments, "month", ...toRange(lastNMonths(12)));

  const a = m.allTime;
  const expenseBreakdown: DonutDatum[] = [
    { name: "Purchase", value: a.purchaseCost, color: "var(--chart-1)" },
    { name: "Transport", value: a.transportPaid, color: "var(--chart-6)" },
    { name: "Loading", value: a.loadingCost, color: "var(--chart-4)" },
    { name: "Boarding", value: a.boardingCost, color: "var(--chart-7)" },
    { name: "Other", value: a.otherExpenses, color: "var(--chart-3)" },
  ].filter((d) => d.value > 0);

  const materialMix: DonutDatum[] = materialBreakdown(trucks).map((mm, i) => ({
    name: mm.material,
    value: mm.revenue,
    color: i === 0 ? "var(--chart-1)" : "var(--chart-5)",
  }));

  const recentTrucks = trucks.slice(0, 6);
  const recentPayments = payments.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Overview · ${formatDate(now)}`}
      />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={formatPKR(m.today.totals.salesRevenue)}
          icon={Banknote}
          accent="primary"
          delta={
            pctDelta(m.today.totals.salesRevenue, prevDay.totals.salesRevenue) !== undefined
              ? { value: pctDelta(m.today.totals.salesRevenue, prevDay.totals.salesRevenue)! }
              : undefined
          }
          hint="vs yesterday"
        />
        <StatCard
          label="Today's Profit / Loss"
          value={formatPKR(m.today.totals.netProfit)}
          icon={TrendingUp}
          accent={m.today.totals.netProfit >= 0 ? "chart-2" : "destructive"}
          tone={m.today.totals.netProfit >= 0 ? "positive" : "negative"}
          hint={`${m.today.totals.truckCount} trips today`}
        />
        <StatCard
          label="Weekly Sales"
          value={formatPKR(m.week.totals.salesRevenue)}
          icon={CalendarDays}
          accent="chart-5"
          delta={
            pctDelta(m.week.totals.salesRevenue, prevWeek.totals.salesRevenue) !== undefined
              ? { value: pctDelta(m.week.totals.salesRevenue, prevWeek.totals.salesRevenue)! }
              : undefined
          }
          hint="vs last week"
        />
        <StatCard
          label="Monthly Sales"
          value={formatPKR(m.month.totals.salesRevenue)}
          icon={CalendarRange}
          accent="chart-7"
          delta={
            pctDelta(m.month.totals.salesRevenue, prevMonth.totals.salesRevenue) !== undefined
              ? { value: pctDelta(m.month.totals.salesRevenue, prevMonth.totals.salesRevenue)! }
              : undefined
          }
          hint="vs last month"
        />
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Outstanding Balance"
          value={formatPKR(m.outstanding)}
          icon={Receipt}
          accent={m.outstanding > 0 ? "chart-6" : "success"}
          hint="Receivable from company"
        />
        <StatCard
          label="Payments Received"
          value={formatPKR(m.paymentsReceivedAllTime)}
          icon={Wallet}
          accent="chart-2"
          hint="All time"
        />
        <StatCard
          label="Net Profit"
          value={formatPKR(a.netProfit)}
          icon={PiggyBank}
          accent={a.netProfit >= 0 ? "chart-2" : "destructive"}
          tone={a.netProfit >= 0 ? "positive" : "negative"}
          hint="All time"
        />
        <StatCard
          label="Transportation Savings"
          value={formatPKR(a.transportSavings)}
          icon={Coins}
          accent="chart-5"
          hint="Negotiated vs company rate"
        />
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Tons Delivered"
          value={formatTons(a.totalTons)}
          icon={Scale}
          accent="chart-4"
        />
        <StatCard
          label="Total Truck Trips"
          value={formatNumber(a.truckCount)}
          icon={TruckIcon}
          accent="primary"
        />
        <StatCard
          label="Purchase Cost"
          value={formatPKR(a.purchaseCost)}
          icon={ShoppingCart}
          accent="chart-6"
          hint="All time"
        />
        <StatCard
          label="Selling Revenue"
          value={formatPKR(a.salesRevenue)}
          icon={Banknote}
          accent="chart-2"
          hint="All time"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        daily={daily}
        weekly={weekly}
        monthly={monthly}
        expenseBreakdown={expenseBreakdown}
        materialMix={materialMix}
      />

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Truck Trips</CardTitle>
            <Link
              href="/trucks"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTrucks.length === 0 ? (
              <EmptyRow text="No truck trips yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Truck</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Net Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrucks.map((t) => {
                    const f = computeTruckRow(t);
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatDate(t.date)}
                        </TableCell>
                        <TableCell className="font-medium">{t.truckNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{t.materialType}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular font-medium text-success">
                          {formatPKR(f.netProfit)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Payments</CardTitle>
            <Link
              href="/payments"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentPayments.length === 0 ? (
              <EmptyRow text="No payments recorded yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(p.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{p.method}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-muted-foreground">
                        {p.reference || "—"}
                      </TableCell>
                      <TableCell className="text-right tabular font-medium">
                        {formatPKR(Number(p.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function toRange(r: { start: Date; end: Date }): [Date, Date] {
  return [r.start, r.end];
}

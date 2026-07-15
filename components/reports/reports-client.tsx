"use client";

import * as React from "react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek,
  subDays,
  differenceInDays,
} from "date-fns";
import { FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  AreaTrend,
  Donut,
  ChartLegend,
  type DonutDatum,
} from "@/components/charts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeTotals, sumPayments, computeTruckRow } from "@/lib/calculations";
import { filterTrucks, filterPayments } from "@/lib/metrics";
import { buildSeries, materialBreakdown, type Granularity } from "@/lib/aggregations";
import { formatPKR, formatDate, formatTons, toISODate, parseISODate } from "@/lib/format";
import { exportReportPDF } from "@/lib/export/pdf";
import { exportReportExcel } from "@/lib/export/excel";
import type { ReportData, MaterialSummary } from "@/lib/export/types";
import type { Truck, Payment, Settings } from "@/db/schema";
import {
  Banknote,
  TrendingUp,
  Coins,
  Wallet,
  Receipt,
  ShoppingCart,
} from "lucide-react";

type Preset =
  | "this-month"
  | "last-month"
  | "last-7"
  | "last-30"
  | "this-week"
  | "this-year"
  | "all"
  | "custom";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-7", label: "Last 7 Days" },
  { value: "last-30", label: "Last 30 Days" },
  { value: "this-week", label: "This Week" },
  { value: "this-year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

function presetRange(preset: Preset, allTrucks: Truck[]): { start: Date; end: Date } {
  const now = new Date();
  switch (preset) {
    case "this-month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last-month": {
      const d = subMonths(now, 1);
      return { start: startOfMonth(d), end: endOfMonth(d) };
    }
    case "last-7":
      return { start: subDays(now, 6), end: now };
    case "last-30":
      return { start: subDays(now, 29), end: now };
    case "this-week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "this-year":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "all": {
      const dates = allTrucks.map((t) => parseISODate(t.date));
      const min = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : subDays(now, 30);
      return { start: min, end: now };
    }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

function pickGranularity(start: Date, end: Date): Granularity {
  const days = differenceInDays(end, start);
  if (days <= 45) return "day";
  if (days <= 200) return "week";
  return "month";
}

export function ReportsClient({
  trucks,
  payments,
  settings,
}: {
  trucks: Truck[];
  payments: Payment[];
  settings: Settings;
}) {
  const [preset, setPreset] = React.useState<Preset>("this-month");
  const [customStart, setCustomStart] = React.useState(toISODate(startOfMonth(new Date())));
  const [customEnd, setCustomEnd] = React.useState(toISODate(new Date()));
  const [busy, setBusy] = React.useState<"pdf" | "excel" | null>(null);

  const { start, end } =
    preset === "custom"
      ? { start: parseISODate(customStart), end: parseISODate(customEnd) }
      : presetRange(preset, trucks);

  const rangeTrucks = filterTrucks(trucks, start, end);
  const rangePayments = filterPayments(payments, start, end);
  const totals = computeTotals(rangeTrucks);
  const paymentsReceived = sumPayments(rangePayments);
  const periodOutstanding = totals.salesRevenue - paymentsReceived;

  const overallOutstanding =
    computeTotals(trucks).salesRevenue - sumPayments(payments);

  const granularity = pickGranularity(start, end);
  const series = buildSeries(rangeTrucks, rangePayments, granularity, start, end);

  const material: MaterialSummary[] = materialBreakdown(rangeTrucks).map((m) => ({
    material: m.material,
    trucks: m.trucks,
    tons: m.tons,
    revenue: m.revenue,
    netProfit: m.netProfit,
  }));

  const expenseBreakdown: DonutDatum[] = [
    { name: "Purchase", value: totals.purchaseCost, color: "var(--chart-1)" },
    { name: "Transport", value: totals.transportPaid, color: "var(--chart-6)" },
    { name: "Loading", value: totals.loadingCost, color: "var(--chart-4)" },
    { name: "Boarding", value: totals.boardingCost, color: "var(--chart-7)" },
    { name: "Other", value: totals.otherExpenses, color: "var(--chart-3)" },
  ].filter((d) => d.value > 0);

  const rangeLabel = `${formatDate(start)} — ${formatDate(end)}`;

  function buildReportData(): ReportData {
    return {
      businessName: settings.businessName,
      rangeLabel: `${PRESETS.find((p) => p.value === preset)?.label ?? "Custom"} · ${rangeLabel}`,
      start: toISODate(start),
      end: toISODate(end),
      generatedAt: new Date().toLocaleString("en-PK"),
      totals,
      paymentsReceived,
      periodOutstanding,
      overallOutstanding,
      trucks: rangeTrucks,
      payments: rangePayments,
      material,
    };
  }

  async function handlePDF() {
    setBusy("pdf");
    try {
      await exportReportPDF(buildReportData());
    } finally {
      setBusy(null);
    }
  }
  async function handleExcel() {
    setBusy("excel");
    try {
      await exportReportExcel(buildReportData());
    } finally {
      setBusy(null);
    }
  }

  const expenseTotal = expenseBreakdown.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Report Period
              </label>
              <Select
                value={preset}
                onChange={(e) => setPreset(e.target.value as Preset)}
                className="sm:w-48"
              >
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
            {preset === "custom" && (
              <div className="flex gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">From</label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">To</label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePDF} disabled={busy !== null}>
              {busy === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExcel} disabled={busy !== null}>
              {busy === "excel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{rangeLabel}</Badge>
        <span>{totals.truckCount} trips · {rangePayments.length} payments</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 stagger">
        <StatCard label="Revenue" value={formatPKR(totals.salesRevenue)} icon={Banknote} accent="primary" />
        <StatCard label="Purchase Cost" value={formatPKR(totals.purchaseCost)} icon={ShoppingCart} accent="chart-6" />
        <StatCard
          label="Net Profit"
          value={formatPKR(totals.netProfit)}
          icon={TrendingUp}
          accent={totals.netProfit >= 0 ? "chart-2" : "destructive"}
          tone={totals.netProfit >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Transport Savings" value={formatPKR(totals.transportSavings)} icon={Coins} accent="chart-5" />
        <StatCard label="Payments Received" value={formatPKR(paymentsReceived)} icon={Wallet} accent="chart-2" />
        <StatCard label="Outstanding (all-time)" value={formatPKR(overallOutstanding)} icon={Receipt} accent="chart-6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue, Profit & Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {series.length ? (
              <AreaTrend
                data={series}
                xKey="label"
                series={[
                  { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
                  { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
                  { key: "payments", name: "Payments", color: "var(--chart-4)" },
                ]}
              />
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseBreakdown.length ? (
              <>
                <Donut
                  data={expenseBreakdown}
                  centerValue={formatPKR(expenseTotal, { compact: true })}
                  centerLabel="Total"
                />
                <ChartLegend items={expenseBreakdown} />
              </>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Material summary */}
      <Card>
        <CardHeader>
          <CardTitle>Material Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {material.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Tons</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {material.map((m) => (
                  <TableRow key={m.material}>
                    <TableCell>
                      <Badge variant="secondary">{m.material}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular">{m.trucks}</TableCell>
                    <TableCell className="text-right tabular">{formatTons(m.tons)}</TableCell>
                    <TableCell className="text-right tabular">{formatPKR(m.revenue)}</TableCell>
                    <TableCell className="text-right tabular font-medium text-success">
                      {formatPKR(m.netProfit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No trips in this period.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Truck summary */}
      <Card>
        <CardHeader>
          <CardTitle>Truck Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rangeTrucks.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Tons</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rangeTrucks.map((tr) => {
                  const f = computeTruckRow(tr);
                  return (
                    <TableRow key={tr.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(tr.date)}
                      </TableCell>
                      <TableCell className="font-medium">{tr.truckNumber}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{tr.materialType}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular">{formatTons(f.tons)}</TableCell>
                      <TableCell className="text-right tabular">{formatPKR(f.salesRevenue)}</TableCell>
                      <TableCell className="text-right tabular text-chart-5">
                        {formatPKR(f.transportSavings)}
                      </TableCell>
                      <TableCell className="text-right tabular font-medium text-success">
                        {formatPKR(f.netProfit)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No trips in this period.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
      No data for this period.
    </div>
  );
}

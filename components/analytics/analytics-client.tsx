"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaTrend,
  LineTrend,
  Bars,
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
import { formatPKR, formatTons, formatNumber } from "@/lib/format";
import type { SeriesPoint } from "@/lib/aggregations";

export interface MaterialPerf {
  material: string;
  revenue: number;
  netProfit: number;
  tons: number;
  trucks: number;
}
export interface TruckPerf {
  truckNumber: string;
  trips: number;
  tons: number;
  revenue: number;
  netProfit: number;
}
export interface OutstandingPoint {
  label: string;
  billed: number;
  received: number;
  outstanding: number;
  [key: string]: string | number;
}

export function AnalyticsClient({
  monthly,
  weekly,
  materialPerf,
  truckPerf,
  outstanding,
}: {
  monthly: SeriesPoint[];
  weekly: SeriesPoint[];
  materialPerf: MaterialPerf[];
  truckPerf: TruckPerf[];
  outstanding: OutstandingPoint[];
}) {
  const materialMix: DonutDatum[] = materialPerf.map((m, i) => ({
    name: m.material,
    value: m.netProfit,
    color: i === 0 ? "var(--chart-1)" : "var(--chart-5)",
  }));
  const materialProfitTotal = materialPerf.reduce((a, b) => a + b.netProfit, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Revenue Growth" description="Monthly revenue and net profit">
        <AreaTrend
          data={monthly}
          xKey="label"
          series={[
            { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
            { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
          ]}
        />
      </ChartCard>

      <ChartCard title="Profit Trend" description="Gross vs net profit by month">
        <LineTrend
          data={monthly}
          xKey="label"
          series={[
            { key: "grossProfit", name: "Gross Profit", color: "var(--chart-7)" },
            { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
          ]}
        />
      </ChartCard>

      <ChartCard title="Expense Trend" description="Purchase, transport & other costs">
        <Bars
          data={monthly}
          xKey="label"
          stacked
          series={[
            { key: "purchaseCost", name: "Purchase", color: "var(--chart-1)" },
            { key: "transportPaid", name: "Transport", color: "var(--chart-6)" },
            { key: "expenses", name: "Loading/Boarding/Other", color: "var(--chart-4)" },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Transportation Savings"
        description="Monthly savings from negotiated rates"
      >
        <Bars
          data={monthly}
          xKey="label"
          series={[
            { key: "transportSavings", name: "Transport Savings", color: "var(--chart-5)" },
          ]}
        />
      </ChartCard>

      <ChartCard
        title="Outstanding Payment Trend"
        description="Cumulative receivable over time"
      >
        <LineTrend
          data={outstanding}
          xKey="label"
          series={[
            { key: "outstanding", name: "Outstanding", color: "var(--chart-6)" },
            { key: "received", name: "Received (cum.)", color: "var(--chart-2)" },
          ]}
        />
      </ChartCard>

      <ChartCard title="Weekly Comparison" description="Revenue vs net profit by week">
        <Bars
          data={weekly}
          xKey="label"
          series={[
            { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
            { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
          ]}
        />
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle>Material Performance</CardTitle>
          <CardDescription>Net profit contribution by material</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Donut
            data={materialMix}
            centerValue={formatPKR(materialProfitTotal, { compact: true })}
            centerLabel="Net profit"
          />
          <ChartLegend items={materialMix} />
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
              {materialPerf.map((m) => (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Truck Performance</CardTitle>
          <CardDescription>Top trucks by net profit</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {truckPerf.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No data yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Tons</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {truckPerf.map((t) => (
                  <TableRow key={t.truckNumber}>
                    <TableCell className="font-medium">{t.truckNumber}</TableCell>
                    <TableCell className="text-right tabular">{formatNumber(t.trips)}</TableCell>
                    <TableCell className="text-right tabular">{formatTons(t.tons)}</TableCell>
                    <TableCell className="text-right tabular">{formatPKR(t.revenue)}</TableCell>
                    <TableCell className="text-right tabular font-medium text-success">
                      {formatPKR(t.netProfit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

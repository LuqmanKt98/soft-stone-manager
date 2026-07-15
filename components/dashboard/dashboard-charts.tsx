"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaTrend,
  Bars,
  Donut,
  ChartLegend,
  type SeriesConfig,
  type DonutDatum,
} from "@/components/charts";
import type { SeriesPoint } from "@/lib/aggregations";
import { formatPKR } from "@/lib/format";

const trendSeries: SeriesConfig[] = [
  { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
  { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
  { key: "payments", name: "Payments Received", color: "var(--chart-4)" },
];

export function DashboardCharts({
  daily,
  weekly,
  monthly,
  expenseBreakdown,
  materialMix,
}: {
  daily: SeriesPoint[];
  weekly: SeriesPoint[];
  monthly: SeriesPoint[];
  expenseBreakdown: DonutDatum[];
  materialMix: DonutDatum[];
}) {
  const expenseTotal = expenseBreakdown.reduce((a, b) => a + b.value, 0);
  const materialTotal = materialMix.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Revenue, Profit & Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <AreaTrend data={daily} xKey="label" series={trendSeries} />
            </TabsContent>
            <TabsContent value="weekly">
              <AreaTrend data={weekly} xKey="label" series={trendSeries} />
            </TabsContent>
            <TabsContent value="monthly">
              <AreaTrend data={monthly} xKey="label" series={trendSeries} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Donut
            data={expenseBreakdown}
            centerValue={formatPKR(expenseTotal, { compact: true })}
            centerLabel="Total cost"
          />
          <ChartLegend items={expenseBreakdown} />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Bars
            data={weekly}
            xKey="label"
            series={[
              { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
              { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
              { key: "transportSavings", name: "Transport Savings", color: "var(--chart-5)" },
            ]}
            height={280}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Material Mix (Revenue)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Donut
            data={materialMix}
            centerValue={formatPKR(materialTotal, { compact: true })}
            centerLabel="Revenue"
          />
          <ChartLegend items={materialMix} />
        </CardContent>
      </Card>
    </div>
  );
}

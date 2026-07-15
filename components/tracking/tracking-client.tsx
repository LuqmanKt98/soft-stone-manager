"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bars } from "@/components/charts";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPKR, formatTons, formatNumber } from "@/lib/format";
import type { SeriesPoint } from "@/lib/aggregations";

interface Summary {
  trucks: number;
  tons: number;
  revenue: number;
  totalExpenses: number;
  netProfit: number;
  payments: number;
  outstanding: number;
  transportSavings: number;
}

function summarize(points: SeriesPoint[]): Summary {
  return points.reduce<Summary>(
    (a, p) => ({
      trucks: a.trucks + p.trucks,
      tons: a.tons + p.tons,
      revenue: a.revenue + p.revenue,
      totalExpenses: a.totalExpenses + p.totalExpenses,
      netProfit: a.netProfit + p.netProfit,
      payments: a.payments + p.payments,
      outstanding: a.outstanding + (p.revenue - p.payments),
      transportSavings: a.transportSavings + p.transportSavings,
    }),
    {
      trucks: 0,
      tons: 0,
      revenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      payments: 0,
      outstanding: 0,
      transportSavings: 0,
    },
  );
}

const barSeries = [
  { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
  { key: "totalExpenses", name: "Expenses", color: "var(--chart-6)" },
  { key: "netProfit", name: "Net Profit", color: "var(--chart-2)" },
];

export function TrackingClient({
  daily,
  weekly,
  monthly,
}: {
  daily: SeriesPoint[];
  weekly: SeriesPoint[];
  monthly: SeriesPoint[];
}) {
  return (
    <Tabs defaultValue="daily">
      <TabsList>
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
      </TabsList>

      <TabsContent value="daily">
        <TrackingView title="Daily Tracking" points={daily} periodLabel="Day" />
      </TabsContent>
      <TabsContent value="weekly">
        <TrackingView title="Weekly Tracking" points={weekly} periodLabel="Week of" />
      </TabsContent>
      <TabsContent value="monthly">
        <TrackingView title="Monthly Tracking" points={monthly} periodLabel="Month" />
      </TabsContent>
    </Tabs>
  );
}

function TrackingView({
  title,
  points,
  periodLabel,
}: {
  title: string;
  points: SeriesPoint[];
  periodLabel: string;
}) {
  const s = summarize(points);
  // most recent first for the table
  const rows = [...points].reverse().filter((p) => p.trucks > 0 || p.payments > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
        <Mini label="Total Trips" value={formatNumber(s.trucks)} />
        <Mini label="Total Tons" value={formatTons(s.tons)} />
        <Mini label="Total Revenue" value={formatPKR(s.revenue, { compact: true })} />
        <Mini label="Total Expenses" value={formatPKR(s.totalExpenses, { compact: true })} />
        <Mini
          label="Net Profit"
          value={formatPKR(s.netProfit, { compact: true })}
          tone={s.netProfit >= 0 ? "positive" : "negative"}
        />
        <Mini label="Payments Received" value={formatPKR(s.payments, { compact: true })} />
        <Mini label="Outstanding" value={formatPKR(s.outstanding, { compact: true })} />
        <Mini
          label="Transport Savings"
          value={formatPKR(s.transportSavings, { compact: true })}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title} — Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Bars data={points} xKey="label" series={barSeries} height={300} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No activity in this period yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{periodLabel}</TableHead>
                  <TableHead className="text-right">Trips</TableHead>
                  <TableHead className="text-right">Tons</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Net Profit</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.key}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {p.label}
                    </TableCell>
                    <TableCell className="text-right tabular">{p.trucks}</TableCell>
                    <TableCell className="text-right tabular">
                      {formatTons(p.tons)}
                    </TableCell>
                    <TableCell className="text-right tabular">
                      {formatPKR(p.revenue)}
                    </TableCell>
                    <TableCell className="text-right tabular text-muted-foreground">
                      {formatPKR(p.totalExpenses)}
                    </TableCell>
                    <TableCell className="text-right tabular font-medium text-success">
                      {formatPKR(p.netProfit)}
                    </TableCell>
                    <TableCell className="text-right tabular text-chart-2">
                      {formatPKR(p.payments)}
                    </TableCell>
                    <TableCell className="text-right tabular text-chart-6">
                      {formatPKR(p.revenue - p.payments)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {s.trucks}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatTons(s.tons)}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatPKR(s.revenue)}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatPKR(s.totalExpenses)}
                  </TableCell>
                  <TableCell className="text-right tabular font-semibold text-success">
                    {formatPKR(s.netProfit)}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatPKR(s.payments)}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatPKR(s.outstanding)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold tabular ${
          tone === "positive"
            ? "text-success"
            : tone === "negative"
              ? "text-destructive"
              : ""
        }`}
      >
        {value}
      </p>
    </Card>
  );
}

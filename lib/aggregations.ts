import {
  startOfWeek,
  startOfMonth,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import type { Truck, Payment } from "@/db/schema";
import { computeTruckRow } from "./calculations";
import { parseISODate, toISODate } from "./format";

export type Granularity = "day" | "week" | "month";

export interface SeriesPoint {
  key: string;
  label: string;
  date: Date;
  revenue: number;
  purchaseCost: number;
  grossProfit: number;
  netProfit: number;
  transportSavings: number;
  transportPaid: number;
  expenses: number; // additional (loading + boarding + other)
  totalExpenses: number; // purchase + transport paid + additional (cash out)
  tons: number;
  trucks: number;
  payments: number; // payments received in this bucket
  // Index signature so points can flow directly into the generic chart props.
  [key: string]: string | number | Date;
}

function emptyPoint(date: Date, key: string, label: string): SeriesPoint {
  return {
    key,
    label,
    date,
    revenue: 0,
    purchaseCost: 0,
    grossProfit: 0,
    netProfit: 0,
    transportSavings: 0,
    transportPaid: 0,
    expenses: 0,
    totalExpenses: 0,
    tons: 0,
    trucks: 0,
    payments: 0,
  };
}

function bucketStart(d: Date, g: Granularity): Date {
  if (g === "week") return startOfWeek(d, { weekStartsOn: 1 });
  if (g === "month") return startOfMonth(d);
  return d;
}

function bucketKey(d: Date, g: Granularity): string {
  return toISODate(bucketStart(d, g));
}

function bucketLabel(d: Date, g: Granularity): string {
  if (g === "week") return `${format(d, "dd MMM")}`;
  if (g === "month") return format(d, "MMM yyyy");
  return format(d, "dd MMM");
}

/**
 * Build a continuous time series between start and end (inclusive), filling
 * empty buckets so charts don't have gaps.
 */
export function buildSeries(
  trucks: Truck[],
  payments: Payment[],
  granularity: Granularity,
  start: Date,
  end: Date,
): SeriesPoint[] {
  const buckets = new Map<string, SeriesPoint>();

  let intervals: Date[];
  if (granularity === "week") {
    intervals = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
  } else if (granularity === "month") {
    intervals = eachMonthOfInterval({ start, end });
  } else {
    intervals = eachDayOfInterval({ start, end });
  }
  for (const d of intervals) {
    const bs = bucketStart(d, granularity);
    const key = bucketKey(bs, granularity);
    buckets.set(key, emptyPoint(bs, key, bucketLabel(bs, granularity)));
  }

  for (const t of trucks) {
    const d = parseISODate(t.date);
    if (d < start || d > end) continue;
    const key = bucketKey(d, granularity);
    const point = buckets.get(key);
    if (!point) continue;
    const f = computeTruckRow(t);
    point.revenue += f.salesRevenue;
    point.purchaseCost += f.purchaseCost;
    point.grossProfit += f.grossProfit;
    point.netProfit += f.netProfit;
    point.transportSavings += f.transportSavings;
    point.transportPaid += f.transportPaid;
    point.expenses += f.additionalExpenses;
    point.totalExpenses += f.purchaseCost + f.transportPaid + f.additionalExpenses;
    point.tons += f.tons;
    point.trucks += 1;
  }

  for (const p of payments) {
    const d = parseISODate(p.date);
    if (d < start || d > end) continue;
    const key = bucketKey(d, granularity);
    const point = buckets.get(key);
    if (!point) continue;
    point.payments += Number(p.amount) || 0;
  }

  return Array.from(buckets.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}

/** Convenience windows relative to "today". */
export function lastNDays(n: number): { start: Date; end: Date } {
  const end = new Date();
  return { start: subDays(end, n - 1), end };
}

export function lastNWeeks(n: number): { start: Date; end: Date } {
  const end = new Date();
  return { start: startOfWeek(subWeeks(end, n - 1), { weekStartsOn: 1 }), end };
}

export function lastNMonths(n: number): { start: Date; end: Date } {
  const end = new Date();
  return { start: startOfMonth(subMonths(end, n - 1)), end };
}

/** Material-type breakdown for pie / performance comparison. */
export function materialBreakdown(trucks: Truck[]) {
  const map = new Map<string, { material: string; revenue: number; netProfit: number; tons: number; trucks: number }>();
  for (const t of trucks) {
    const f = computeTruckRow(t);
    const cur =
      map.get(t.materialType) ??
      { material: t.materialType, revenue: 0, netProfit: 0, tons: 0, trucks: 0 };
    cur.revenue += f.salesRevenue;
    cur.netProfit += f.netProfit;
    cur.tons += f.tons;
    cur.trucks += 1;
    map.set(t.materialType, cur);
  }
  return Array.from(map.values());
}

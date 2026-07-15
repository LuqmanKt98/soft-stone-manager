import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import type { Truck, Payment } from "@/db/schema";
import {
  computeTotals,
  sumPayments,
  type Totals,
} from "./calculations";
import { parseISODate, toISODate } from "./format";

export function filterTrucks(trucks: Truck[], start: Date, end: Date): Truck[] {
  return trucks.filter((t) =>
    isWithinInterval(parseISODate(t.date), { start, end }),
  );
}

export function filterPayments(payments: Payment[], start: Date, end: Date): Payment[] {
  return payments.filter((p) =>
    isWithinInterval(parseISODate(p.date), { start, end }),
  );
}

export interface PeriodMetrics {
  totals: Totals;
  paymentsReceived: number;
}

export function periodMetrics(
  trucks: Truck[],
  payments: Payment[],
  start: Date,
  end: Date,
): PeriodMetrics {
  const t = filterTrucks(trucks, start, end);
  const p = filterPayments(payments, start, end);
  return { totals: computeTotals(t), paymentsReceived: sumPayments(p) };
}

export interface DashboardMetrics {
  today: PeriodMetrics;
  week: PeriodMetrics;
  month: PeriodMetrics;
  allTime: Totals;
  paymentsReceivedAllTime: number;
  outstanding: number;
  weekOutstanding: number; // week billed - week received
  monthOutstanding: number;
}

export function computeDashboard(
  trucks: Truck[],
  payments: Payment[],
  now = new Date(),
): DashboardMetrics {
  const todayStart = parseISODate(toISODate(now));
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const wStart = startOfWeek(now, { weekStartsOn: 1 });
  const wEnd = endOfWeek(now, { weekStartsOn: 1 });
  const mStart = startOfMonth(now);
  const mEnd = endOfMonth(now);

  const today = periodMetrics(trucks, payments, todayStart, todayEnd);
  const week = periodMetrics(trucks, payments, wStart, wEnd);
  const month = periodMetrics(trucks, payments, mStart, mEnd);

  const allTime = computeTotals(trucks);
  const paymentsReceivedAllTime = sumPayments(payments);

  return {
    today,
    week,
    month,
    allTime,
    paymentsReceivedAllTime,
    outstanding: allTime.salesRevenue - paymentsReceivedAllTime,
    weekOutstanding: week.totals.salesRevenue - week.paymentsReceived,
    monthOutstanding: month.totals.salesRevenue - month.paymentsReceived,
  };
}

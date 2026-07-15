import type { Truck, Payment } from "@/db/schema";

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  FINANCIAL MODEL  (single source of truth for every money figure)
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  Per ton the business buys at `purchaseRate` and sells at `sellingRate`.
 *  Transport is billed at the company's official `companyRentalRate`, but the
 *  owner negotiates a lower `actualRentalRate` and keeps the difference.
 *
 *    purchaseCost        = tons × purchaseRate
 *    salesRevenue        = tons × sellingRate
 *    grossProfit         = salesRevenue − purchaseCost
 *
 *    transportCost       = tons × companyRentalRate     (full / official)
 *    transportPaid       = tons × actualRentalRate      (what is actually paid)
 *    transportSavings    = tons × (companyRentalRate − actualRentalRate)
 *    netTransportExpense = transportPaid                (= cost − savings)
 *
 *    additionalExpenses  = loadingCost + boardingCost + otherExpenses
 *
 *    netProfit           = grossProfit + transportSavings − additionalExpenses
 *
 *  Rationale: transport is charged to the buyer at the company rate, so the
 *  negotiated saving is real income to the owner. Loading / boarding / other
 *  are out-of-pocket per-truck costs that reduce profit.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface TruckInput {
  tons: number;
  purchaseRate: number;
  sellingRate: number;
  companyRentalRate: number;
  actualRentalRate: number;
  loadingCost: number;
  boardingCost: number;
  otherExpenses: number;
}

export interface TruckFinancials {
  tons: number;
  purchaseCost: number;
  salesRevenue: number;
  grossProfit: number;
  transportCost: number;
  transportPaid: number;
  transportSavings: number;
  netTransportExpense: number;
  loadingCost: number;
  boardingCost: number;
  otherExpenses: number;
  additionalExpenses: number;
  netProfit: number;
}

const n = (v: string | number | null | undefined): number => {
  if (v == null) return 0;
  const parsed = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Convert a DB truck row (numeric columns arrive as strings) to numbers. */
export function toTruckInput(t: Truck): TruckInput {
  return {
    tons: n(t.tons),
    purchaseRate: n(t.purchaseRate),
    sellingRate: n(t.sellingRate),
    companyRentalRate: n(t.companyRentalRate),
    actualRentalRate: n(t.actualRentalRate),
    loadingCost: n(t.loadingCost),
    boardingCost: n(t.boardingCost),
    otherExpenses: n(t.otherExpenses),
  };
}

export function computeTruck(input: TruckInput): TruckFinancials {
  const purchaseCost = input.tons * input.purchaseRate;
  const salesRevenue = input.tons * input.sellingRate;
  const grossProfit = salesRevenue - purchaseCost;

  const transportCost = input.tons * input.companyRentalRate;
  const transportPaid = input.tons * input.actualRentalRate;
  const transportSavings = transportCost - transportPaid;

  const additionalExpenses =
    input.loadingCost + input.boardingCost + input.otherExpenses;

  const netProfit = grossProfit + transportSavings - additionalExpenses;

  return {
    tons: input.tons,
    purchaseCost,
    salesRevenue,
    grossProfit,
    transportCost,
    transportPaid,
    transportSavings,
    netTransportExpense: transportPaid,
    loadingCost: input.loadingCost,
    boardingCost: input.boardingCost,
    otherExpenses: input.otherExpenses,
    additionalExpenses,
    netProfit,
  };
}

export function computeTruckRow(t: Truck): TruckFinancials {
  return computeTruck(toTruckInput(t));
}

export interface Totals {
  truckCount: number;
  totalTons: number;
  purchaseCost: number;
  salesRevenue: number;
  grossProfit: number;
  transportCost: number;
  transportPaid: number;
  transportSavings: number;
  loadingCost: number;
  boardingCost: number;
  otherExpenses: number;
  additionalExpenses: number;
  netProfit: number;
}

export function emptyTotals(): Totals {
  return {
    truckCount: 0,
    totalTons: 0,
    purchaseCost: 0,
    salesRevenue: 0,
    grossProfit: 0,
    transportCost: 0,
    transportPaid: 0,
    transportSavings: 0,
    loadingCost: 0,
    boardingCost: 0,
    otherExpenses: 0,
    additionalExpenses: 0,
    netProfit: 0,
  };
}

export function computeTotals(trucks: Truck[]): Totals {
  const t = emptyTotals();
  t.truckCount = trucks.length;
  for (const truck of trucks) {
    const f = computeTruckRow(truck);
    t.totalTons += f.tons;
    t.purchaseCost += f.purchaseCost;
    t.salesRevenue += f.salesRevenue;
    t.grossProfit += f.grossProfit;
    t.transportCost += f.transportCost;
    t.transportPaid += f.transportPaid;
    t.transportSavings += f.transportSavings;
    t.loadingCost += f.loadingCost;
    t.boardingCost += f.boardingCost;
    t.otherExpenses += f.otherExpenses;
    t.additionalExpenses += f.additionalExpenses;
    t.netProfit += f.netProfit;
  }
  return t;
}

export function sumPayments(payments: Payment[]): number {
  return payments.reduce((acc, p) => acc + n(p.amount), 0);
}

/**
 * Receivables ledger: the company is billed the full sales revenue and pays
 * over time. Outstanding = everything billed − everything received.
 */
export function computeOutstanding(
  allTrucks: Truck[],
  allPayments: Payment[],
): { billed: number; received: number; outstanding: number } {
  const billed = computeTotals(allTrucks).salesRevenue;
  const received = sumPayments(allPayments);
  return { billed, received, outstanding: billed - received };
}

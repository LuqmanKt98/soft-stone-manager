import type { Totals } from "@/lib/calculations";
import type { Truck, Payment } from "@/db/schema";

export interface MaterialSummary {
  material: string;
  trucks: number;
  tons: number;
  revenue: number;
  netProfit: number;
}

export interface ReportData {
  businessName: string;
  rangeLabel: string;
  start: string;
  end: string;
  generatedAt: string;
  totals: Totals;
  paymentsReceived: number;
  periodOutstanding: number;
  overallOutstanding: number;
  trucks: Truck[];
  payments: Payment[];
  material: MaterialSummary[];
}

import "server-only";
import { db } from "@/db";
import { trucks, payments, settings, customers } from "@/db/schema";
import { desc, gte, lte, and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import type { Truck, Payment, Settings } from "@/db/schema";

export async function getTrucks(): Promise<Truck[]> {
  return db.select().from(trucks).orderBy(desc(trucks.date), desc(trucks.id));
}

export async function getTrucksBetween(start: string, end: string): Promise<Truck[]> {
  return db
    .select()
    .from(trucks)
    .where(and(gte(trucks.date, start), lte(trucks.date, end)))
    .orderBy(desc(trucks.date), desc(trucks.id));
}

export async function getPayments(): Promise<Payment[]> {
  return db.select().from(payments).orderBy(desc(payments.date), desc(payments.id));
}

export async function getPaymentsBetween(start: string, end: string): Promise<Payment[]> {
  return db
    .select()
    .from(payments)
    .where(and(gte(payments.date, start), lte(payments.date, end)))
    .orderBy(desc(payments.date), desc(payments.id));
}

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  businessName: "Soft Stone Traders",
  purchaseRate: "6200",
  sellingRate: "7200",
  companyRentalRate: "3800",
  actualRentalRate: "2700",
  updatedAt: new Date(),
};

export async function getSettings(): Promise<Settings> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1);
    return rows[0] ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getCustomers() {
  return db.select().from(customers).orderBy(customers.name);
}

/** Everything the dashboard / analytics needs in a single round-trip pair. */
export async function getAllData(): Promise<{
  trucks: Truck[];
  payments: Payment[];
  settings: Settings;
}> {
  const [t, p, s] = await Promise.all([getTrucks(), getPayments(), getSettings()]);
  return { trucks: t, payments: p, settings: s };
}

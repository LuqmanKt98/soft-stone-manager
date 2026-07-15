"use server";

import { db } from "@/db";
import { trucks, payments, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true; id?: number } | { ok: false; error: string };

function num(v: unknown, fallback = 0): number {
  if (v === "" || v == null) return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  return String(v ?? "").trim();
}

export interface TruckInputDTO {
  date: string;
  truckNumber: string;
  driverName?: string;
  materialType: "100-I" | "100-W";
  tons: number | string;
  purchaseRate: number | string;
  sellingRate: number | string;
  companyRentalRate: number | string;
  actualRentalRate: number | string;
  loadingCost: number | string;
  boardingCost: number | string;
  otherExpenses: number | string;
  notes?: string;
}

function validateTruck(input: TruckInputDTO): string | null {
  if (!str(input.date)) return "Date is required.";
  if (!str(input.truckNumber)) return "Truck number is required.";
  if (input.materialType !== "100-I" && input.materialType !== "100-W")
    return "Select a valid material type.";
  if (num(input.tons) <= 0) return "Tons must be greater than 0.";
  if (num(input.sellingRate) < 0 || num(input.purchaseRate) < 0)
    return "Rates cannot be negative.";
  return null;
}

function truckValues(input: TruckInputDTO) {
  return {
    date: str(input.date),
    truckNumber: str(input.truckNumber),
    driverName: str(input.driverName) || null,
    materialType: input.materialType,
    tons: String(num(input.tons)),
    purchaseRate: String(num(input.purchaseRate)),
    sellingRate: String(num(input.sellingRate)),
    companyRentalRate: String(num(input.companyRentalRate)),
    actualRentalRate: String(num(input.actualRentalRate)),
    loadingCost: String(num(input.loadingCost)),
    boardingCost: String(num(input.boardingCost)),
    otherExpenses: String(num(input.otherExpenses)),
    notes: str(input.notes) || null,
  };
}

export async function createTruck(input: TruckInputDTO): Promise<ActionResult> {
  const err = validateTruck(input);
  if (err) return { ok: false, error: err };
  try {
    const [row] = await db.insert(trucks).values(truckValues(input)).returning({ id: trucks.id });
    revalidatePath("/", "layout");
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save truck." };
  }
}

export async function updateTruck(id: number, input: TruckInputDTO): Promise<ActionResult> {
  const err = validateTruck(input);
  if (err) return { ok: false, error: err };
  try {
    await db
      .update(trucks)
      .set({ ...truckValues(input), updatedAt: new Date() })
      .where(eq(trucks.id, id));
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to update truck." };
  }
}

export async function deleteTruck(id: number): Promise<ActionResult> {
  try {
    await db.delete(trucks).where(eq(trucks.id, id));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete truck." };
  }
}

export interface PaymentInputDTO {
  date: string;
  amount: number | string;
  method: "Cash" | "Bank Transfer" | "Cheque" | "Online" | "Other";
  reference?: string;
  notes?: string;
}

export async function createPayment(input: PaymentInputDTO): Promise<ActionResult> {
  if (!str(input.date)) return { ok: false, error: "Date is required." };
  if (num(input.amount) <= 0) return { ok: false, error: "Amount must be greater than 0." };
  try {
    const [row] = await db
      .insert(payments)
      .values({
        date: str(input.date),
        amount: String(num(input.amount)),
        method: input.method,
        reference: str(input.reference) || null,
        notes: str(input.notes) || null,
      })
      .returning({ id: payments.id });
    revalidatePath("/", "layout");
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save payment." };
  }
}

export async function deletePayment(id: number): Promise<ActionResult> {
  try {
    await db.delete(payments).where(eq(payments.id, id));
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete payment." };
  }
}

export interface SettingsInputDTO {
  businessName: string;
  purchaseRate: number | string;
  sellingRate: number | string;
  companyRentalRate: number | string;
  actualRentalRate: number | string;
}

export async function updateSettings(input: SettingsInputDTO): Promise<ActionResult> {
  try {
    await db
      .insert(settings)
      .values({
        id: 1,
        businessName: str(input.businessName) || "Soft Stone Traders",
        purchaseRate: String(num(input.purchaseRate, 6200)),
        sellingRate: String(num(input.sellingRate, 7200)),
        companyRentalRate: String(num(input.companyRentalRate, 3800)),
        actualRentalRate: String(num(input.actualRentalRate, 2700)),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: settings.id,
        set: {
          businessName: str(input.businessName) || "Soft Stone Traders",
          purchaseRate: String(num(input.purchaseRate, 6200)),
          sellingRate: String(num(input.sellingRate, 7200)),
          companyRentalRate: String(num(input.companyRentalRate, 3800)),
          actualRentalRate: String(num(input.actualRentalRate, 2700)),
          updatedAt: new Date(),
        },
      });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save settings." };
  }
}

/** Danger zone — wipe all operational data (keeps settings + customers). */
export async function clearAllData(): Promise<ActionResult> {
  try {
    await db.delete(payments);
    await db.delete(trucks);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to clear data." };
  }
}

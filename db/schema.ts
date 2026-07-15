import {
  pgTable,
  serial,
  text,
  numeric,
  date,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

/**
 * Soft Stone Business — normalized schema.
 *
 * Tables:
 *  - customers : who we supply to (single default customer today, multi-tenant ready)
 *  - trucks    : one row per truck trip; the core operational + financial record
 *  - payments  : money received against the receivables ledger
 *  - settings  : default rates / business profile (single row, id = 1)
 *
 * Money is stored as numeric(…) for exact precision. Drizzle returns numeric
 * columns as strings — the calculation layer (lib/calculations.ts) parses them.
 */

export const materialTypeEnum = pgEnum("material_type", ["100-I", "100-W"]);

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trucks = pgTable("trucks", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  truckNumber: text("truck_number").notNull(),
  driverName: text("driver_name"),
  materialType: materialTypeEnum("material_type").notNull(),
  tons: numeric("tons", { precision: 10, scale: 2 }).notNull(),

  // Rates (PKR per ton)
  purchaseRate: numeric("purchase_rate", { precision: 12, scale: 2 }).notNull(),
  sellingRate: numeric("selling_rate", { precision: 12, scale: 2 }).notNull(),
  companyRentalRate: numeric("company_rental_rate", { precision: 12, scale: 2 }).notNull(),
  actualRentalRate: numeric("actual_rental_rate", { precision: 12, scale: 2 }).notNull(),

  // Per-truck flat costs (PKR)
  loadingCost: numeric("loading_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  boardingCost: numeric("boarding_cost", { precision: 12, scale: 2 }).notNull().default("0"),
  otherExpenses: numeric("other_expenses", { precision: 12, scale: 2 }).notNull().default("0"),

  notes: text("notes"),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentMethodEnum = pgEnum("payment_method", [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Online",
  "Other",
]);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull().default("Bank Transfer"),
  reference: text("reference"),
  notes: text("notes"),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  businessName: text("business_name").notNull().default("Soft Stone Traders"),
  purchaseRate: numeric("purchase_rate", { precision: 12, scale: 2 }).notNull().default("6200"),
  sellingRate: numeric("selling_rate", { precision: 12, scale: 2 }).notNull().default("7200"),
  companyRentalRate: numeric("company_rental_rate", { precision: 12, scale: 2 }).notNull().default("3800"),
  actualRentalRate: numeric("actual_rental_rate", { precision: 12, scale: 2 }).notNull().default("2700"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Truck = typeof trucks.$inferSelect;
export type NewTruck = typeof trucks.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type Customer = typeof customers.$inferSelect;

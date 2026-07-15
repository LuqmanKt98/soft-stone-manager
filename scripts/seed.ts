import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as schema from "../db/schema";
import { customers, settings, trucks, payments } from "../db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const WITH_DEMO = process.argv.includes("--demo");

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("Seeding essentials…");

  // Settings (single row id=1)
  await db
    .insert(settings)
    .values({ id: 1 })
    .onConflictDoNothing({ target: settings.id });

  // Default customer
  const existing = await db.select().from(customers).limit(1);
  let customerId: number;
  if (existing.length === 0) {
    const [c] = await db
      .insert(customers)
      .values({ name: "Main Company", notes: "Default buyer" })
      .returning();
    customerId = c.id;
  } else {
    customerId = existing[0].id;
  }
  console.log(`✓ settings + customer (#${customerId}) ready`);

  if (!WITH_DEMO) {
    console.log("Done (no demo data). Pass --demo to add sample records.");
    return;
  }

  // Guard: don't duplicate demo data
  const truckCount = await db.select({ c: sql<number>`count(*)` }).from(trucks);
  if (Number(truckCount[0].c) > 0) {
    console.log("Trucks already exist — skipping demo insert.");
    return;
  }

  console.log("Inserting demo trucks + payments…");
  const today = new Date();
  const materials: ("100-I" | "100-W")[] = ["100-I", "100-W"];
  const truckRows = [];
  for (let i = 0; i < 26; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - Math.floor(i * 1.3));
    const tons = 40 + Math.round(Math.random() * 2 * 10) / 10; // 40–42
    const actual = 2600 + Math.round(Math.random() * 100);
    truckRows.push({
      date: iso(d),
      truckNumber: `LES-${1000 + Math.floor(Math.random() * 8999)}`,
      driverName: ["Aslam", "Rafiq", "Nadeem", "Kashif", "Imran"][i % 5],
      materialType: materials[i % 2],
      tons: tons.toFixed(2),
      purchaseRate: "6200",
      sellingRate: "7200",
      companyRentalRate: "3800",
      actualRentalRate: String(actual),
      loadingCost: String(3000 + Math.floor(Math.random() * 2000)),
      boardingCost: String(3000 + Math.floor(Math.random() * 2000)),
      otherExpenses: String(Math.floor(Math.random() * 1500)),
      customerId,
    });
  }
  await db.insert(trucks).values(truckRows);

  const paymentRows = [
    { daysAgo: 2, amount: "1300000", method: "Bank Transfer" as const },
    { daysAgo: 9, amount: "1250000", method: "Bank Transfer" as const },
    { daysAgo: 16, amount: "1400000", method: "Cheque" as const },
    { daysAgo: 24, amount: "1200000", method: "Bank Transfer" as const },
  ].map((p) => {
    const d = new Date(today);
    d.setDate(today.getDate() - p.daysAgo);
    return {
      date: iso(d),
      amount: p.amount,
      method: p.method,
      reference: "Weekly settlement",
      customerId,
    };
  });
  await db.insert(payments).values(paymentRows);

  console.log(`✓ Inserted ${truckRows.length} trucks and ${paymentRows.length} payments`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

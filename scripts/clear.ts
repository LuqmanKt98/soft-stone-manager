import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { trucks, payments } from "../db/schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

async function main() {
  const p = await db.delete(payments).returning({ id: payments.id });
  const t = await db.delete(trucks).returning({ id: trucks.id });
  console.log(`Deleted ${t.length} trucks and ${p.length} payments. Database is clean.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

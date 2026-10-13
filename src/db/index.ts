import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

/** True when no real Postgres is configured — use demo-data instead */
export const isDemoMode = !databaseUrl || process.env.DEMO_MODE === "1";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (!isDemoMode) {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = drizzle(pool);
} else {
  console.warn(
    "[Mabelle Bump] DEMO MODE — no DATABASE_URL. Using built-in demo data (no Postgres needed)."
  );
}

export { pool, db };

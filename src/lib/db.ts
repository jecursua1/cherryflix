import { Pool } from "pg";

// Reuse a single pool across hot-reloads / serverless invocations.
const globalForPool = globalThis as unknown as { _cherryPool?: Pool };

export const pool =
  globalForPool._cherryPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon (and most managed Postgres) require SSL. Local Postgres does not.
    ssl:
      process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")
        ? { rejectUnauthorized: false }
        : false,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForPool._cherryPool = pool;

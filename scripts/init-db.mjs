// One-time database setup for Cherryflix.
//
//   1. Put your Neon connection string in .env.local as DATABASE_URL=...
//   2. Run:  node --env-file=.env.local scripts/init-db.mjs
//
// Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).

import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error(
    "❌ DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/init-db.mjs"
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

const SQL = `
-- Auth.js (PostgresAdapter) tables --------------------------------------
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  PRIMARY KEY (id)
);

-- Cherryflix members / invite allowlist ---------------------------------
CREATE TABLE IF NOT EXISTS invites (
  email TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'invited',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  last_seen TIMESTAMPTZ
);

-- Member profile + live "now watching" presence
ALTER TABLE invites ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS now_watching_id TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS now_watching_title TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS now_watching_at TIMESTAMPTZ;

-- Per-member watch history
CREATE TABLE IF NOT EXISTS watch_events (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  watch_id TEXT NOT NULL,
  title_slug TEXT,
  title_name TEXT,
  episode_label TEXT,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS watch_events_email_time
  ON watch_events (email, watched_at DESC);

-- Per-member watch time accumulated per day (seconds)
CREATE TABLE IF NOT EXISTS watch_time (
  email TEXT NOT NULL,
  day DATE NOT NULL,
  seconds INT NOT NULL DEFAULT 0,
  PRIMARY KEY (email, day)
);
`;

try {
  await pool.query(SQL);
  console.log("✅ Cherryflix database ready.");
} catch (err) {
  console.error("❌ Failed to initialize database:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}

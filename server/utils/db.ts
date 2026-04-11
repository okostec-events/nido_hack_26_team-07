import postgres from "postgres";
import { createError } from "h3";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let sqlClient: postgres.Sql | null = null;
let schemaReadyPromise: Promise<void> | null = null;

const readValueFromEnvFile = (key: string): string | null => {
  const envFiles = [".env", ".env.local"];

  for (const file of envFiles) {
    const absolutePath = resolve(process.cwd(), file);
    if (!existsSync(absolutePath)) {
      continue;
    }

    const lines = readFileSync(absolutePath, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const candidateKey = trimmed.slice(0, separatorIndex).trim();
      if (candidateKey !== key) {
        continue;
      }

      let rawValue = trimmed.slice(separatorIndex + 1).trim();
      const quoted =
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"));
      if (quoted) {
        rawValue = rawValue.slice(1, -1);
      }

      if (rawValue.length > 0) {
        return rawValue;
      }
    }
  }

  return null;
};

const resolveConnectionString = (): string => {
  const envConnection =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_PRISMA_URL;

  if (envConnection) {
    return envConnection;
  }

  const fileConnection =
    readValueFromEnvFile("DATABASE_URL") ??
    readValueFromEnvFile("POSTGRES_URL") ??
    readValueFromEnvFile("POSTGRES_PRISMA_URL");

  if (fileConnection) {
    return fileConnection;
  }

  throw createError({
    statusCode: 500,
    statusMessage: "DATABASE_URL is not configured",
  });
};

export const getDb = (): postgres.Sql => {
  if (sqlClient) {
    return sqlClient;
  }

  sqlClient = postgres(resolveConnectionString(), {
    prepare: false,
  });

  return sqlClient;
};

const createSchema = async (): Promise<void> => {
  const db = getDb();

  await db`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      arrival_month TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS user_checklist_items (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_index INTEGER NOT NULL CHECK(item_index >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, item_index)
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS user_housing_favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      listing_id TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, listing_id)
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS user_onboarding (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      country_of_origin TEXT NOT NULL,
      immigration_status TEXT NOT NULL,
      primary_goal TEXT NOT NULL,
      timeline_weeks INTEGER NOT NULL CHECK (timeline_weeks > 0),
      needs_housing BOOLEAN NOT NULL,
      needs_paperwork BOOLEAN NOT NULL,
      needs_bookings BOOLEAN NOT NULL,
      profile_json TEXT NOT NULL DEFAULT '{}',
      generation_meta_json TEXT NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS user_roadmap_steps (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      step_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      goal TEXT NOT NULL,
      requirements_text TEXT NOT NULL,
      explanation TEXT NOT NULL,
      external_links_text TEXT NOT NULL,
      dependency_ids_text TEXT NOT NULL,
      warning_text TEXT,
      step_data_json TEXT NOT NULL DEFAULT '{}',
      step_order INTEGER NOT NULL,
      status TEXT NOT NULL,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, step_id)
    )
  `;

  await db`
    ALTER TABLE user_onboarding
    ADD COLUMN IF NOT EXISTS profile_json TEXT NOT NULL DEFAULT '{}'
  `;

  await db`
    ALTER TABLE user_onboarding
    ADD COLUMN IF NOT EXISTS generation_meta_json TEXT NOT NULL DEFAULT '{}'
  `;

  await db`
    ALTER TABLE user_roadmap_steps
    ADD COLUMN IF NOT EXISTS step_data_json TEXT NOT NULL DEFAULT '{}'
  `;

  await db`
    ALTER TABLE user_onboarding
    ADD COLUMN IF NOT EXISTS housing_json TEXT NOT NULL DEFAULT '{}'
  `;

  await db`
    CREATE INDEX IF NOT EXISTS auth_sessions_user_idx
    ON auth_sessions(user_id)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS auth_sessions_expires_idx
    ON auth_sessions(expires_at)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS user_roadmap_steps_order_idx
    ON user_roadmap_steps(user_id, step_order)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS user_roadmap_steps_status_idx
    ON user_roadmap_steps(user_id, status)
  `;
};

export const ensureSchema = async (): Promise<void> => {
  if (!schemaReadyPromise) {
    schemaReadyPromise = createSchema();
  }

  await schemaReadyPromise;
};

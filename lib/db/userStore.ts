import { getDbOrNull } from "@/lib/db/postgres";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "google" | "apple" | "email";
  providerId?: string;
  type?: string;
  venueName?: string;
  city?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

/**
 * Upserts a user in PostgreSQL database (public.users table).
 * If PostgreSQL is not connected or configured, returns the payload cleanly so the app can function smoothly.
 */
export async function syncUserToDb(user: {
  email: string;
  name: string;
  avatar?: string;
  provider?: "google" | "apple" | "email";
  providerId?: string;
  type?: string;
  venueName?: string;
  city?: string;
}): Promise<UserRecord> {
  const db = getDbOrNull();
  const provider = user.provider || "google";
  const avatar = user.avatar || "";
  const providerId = user.providerId || "";
  const type = user.type || "Discoteca / Club";
  const venueName = user.venueName || "Cubic Club";
  const city = user.city || "Quito";

  if (!db) {
    // Return mock saved record if DB is not available in local environment
    return {
      id: `usr_${Date.now()}`,
      email: user.email,
      name: user.name,
      avatar,
      provider,
      providerId,
      type,
      venueName,
      city,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  }

  try {
    // Ensure table exists safely
    await db`
      create table if not exists public.users (
        id uuid primary key default gen_random_uuid(),
        email text not null unique,
        name text not null,
        avatar text default '',
        provider text not null default 'google',
        provider_id text default '',
        type text default 'usuario',
        venue_name text default '',
        city text default 'Quito',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        last_login_at timestamptz not null default now()
      );
    `;

    const rows = await db<
      {
        id: string;
        email: string;
        name: string;
        avatar: string;
        provider: string;
        provider_id: string;
        type: string;
        venue_name: string;
        city: string;
        created_at: Date;
        last_login_at: Date;
      }[]
    >`
      insert into public.users (
        email, name, avatar, provider, provider_id, type, venue_name, city, last_login_at, updated_at
      ) values (
        ${user.email}, ${user.name}, ${avatar}, ${provider}, ${providerId}, ${type}, ${venueName}, ${city}, now(), now()
      )
      on conflict (email) do update set
        name = excluded.name,
        avatar = excluded.avatar,
        provider = excluded.provider,
        provider_id = excluded.provider_id,
        type = excluded.type,
        venue_name = excluded.venue_name,
        city = excluded.city,
        last_login_at = now(),
        updated_at = now()
      returning *;
    `;

    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        avatar: row.avatar,
        provider: row.provider as "google" | "apple" | "email",
        providerId: row.provider_id,
        type: row.type,
        venueName: row.venue_name,
        city: row.city,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error("Error saving user to PostgreSQL:", err);
  }

  return {
    id: `usr_${Date.now()}`,
    email: user.email,
    name: user.name,
    avatar,
    provider,
    providerId,
    type,
    venueName,
    city,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
}

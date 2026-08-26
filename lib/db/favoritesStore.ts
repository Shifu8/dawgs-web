import { getDbOrNull } from "@/lib/db/postgres";

/**
 * Gets array of favorited event IDs for a given user email from PostgreSQL database.
 */
export async function getUserFavoritesFromDb(userEmail: string): Promise<string[]> {
  const db = getDbOrNull();
  if (!db || !userEmail) return [];

  try {
    // Ensure user_favorites table exists safely
    await db`
      create table if not exists public.user_favorites (
        id uuid primary key default gen_random_uuid(),
        user_email text not null,
        event_id text not null,
        created_at timestamptz not null default now(),
        unique(user_email, event_id)
      );
    `;

    const rows = await db<{ event_id: string }[]>`
      select event_id from public.user_favorites
      where user_email = ${userEmail.trim().toLowerCase()}
      order by created_at desc;
    `;

    return rows.map((r) => r.event_id);
  } catch (err) {
    console.error("Error fetching user favorites from PostgreSQL:", err);
    return [];
  }
}

/**
 * Adds or removes a favorite event ID for a given user in PostgreSQL database.
 */
export async function toggleUserFavoriteInDb(
  userEmail: string,
  eventId: string,
  isFavorite: boolean
): Promise<string[]> {
  const db = getDbOrNull();
  const cleanEmail = userEmail.trim().toLowerCase();

  if (!db || !cleanEmail || !eventId) {
    return [];
  }

  try {
    await db`
      create table if not exists public.user_favorites (
        id uuid primary key default gen_random_uuid(),
        user_email text not null,
        event_id text not null,
        created_at timestamptz not null default now(),
        unique(user_email, event_id)
      );
    `;

    if (isFavorite) {
      await db`
        insert into public.user_favorites (user_email, event_id, created_at)
        values (${cleanEmail}, ${eventId}, now())
        on conflict (user_email, event_id) do nothing;
      `;
    } else {
      await db`
        delete from public.user_favorites
        where user_email = ${cleanEmail} and event_id = ${eventId};
      `;
    }

    return await getUserFavoritesFromDb(cleanEmail);
  } catch (err) {
    console.error("Error toggling favorite in PostgreSQL:", err);
    return [];
  }
}

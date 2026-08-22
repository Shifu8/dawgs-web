/**
 * Seed PostgreSQL script for AWS Deployment
 * Usage: npx tsx scripts/seed_postgres_events.ts
 */

import { getDbOrNull } from "../lib/db/postgres";
import fs from "fs";
import path from "path";

async function seed() {
  const db = getDbOrNull();
  if (!db) {
    console.error("❌ DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  console.log("⚡ Executing schema SQL...");
  const schemaSql = fs.readFileSync(path.join(process.cwd(), "database/schema.sql"), "utf-8");
  await db.unsafe(schemaSql);
  console.log("✅ Database schema initialized successfully.");

  console.log("📦 Seeding events from data/events.json into PostgreSQL...");
  const eventsRaw = fs.readFileSync(path.join(process.cwd(), "data/events.json"), "utf-8");
  const events = JSON.parse(eventsRaw);

  for (const e of events) {
    const id = e.id || e.slug;
    await db`
      INSERT INTO public.events (
        id, title, subtitle, location, date, time, price, image_url, description, status, is_featured
      ) VALUES (
        ${id}, ${e.title}, ${e.subtitle || ""}, ${e.location || ""}, ${e.date || ""},
        ${e.time || ""}, ${e.price || 0}, ${e.imageUrl || e.poster || ""},
        ${e.description || ""}, ${e.status || "active"}, ${e.isFeatured || false}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        location = EXCLUDED.location,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        price = EXCLUDED.price,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured,
        updated_at = NOW();
    `;
  }

  console.log(`🎉 Successfully seeded ${events.length} events into PostgreSQL database!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});

import { NextResponse } from "next/server";
import { getUserFavoritesFromDb, toggleUserFavoriteInDb } from "@/lib/db/favoritesStore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await getUserFavoritesFromDb(email);
    return NextResponse.json({ success: true, favorites });
  } catch (err) {
    console.error("API GET /api/users/favorites Error:", err);
    return NextResponse.json({ favorites: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, eventId, isFavorite } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email válido es requerido" }, { status: 400 });
    }

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "eventId es requerido" }, { status: 400 });
    }

    const updatedFavorites = await toggleUserFavoriteInDb(email, eventId, Boolean(isFavorite));
    return NextResponse.json({ success: true, favorites: updatedFavorites });
  } catch (err) {
    console.error("API POST /api/users/favorites Error:", err);
    return NextResponse.json({ error: "Error procesando favorito" }, { status: 500 });
  }
}

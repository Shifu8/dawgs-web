import { NextResponse } from "next/server";
import { syncUserToDb } from "@/lib/db/userStore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, avatar, provider, providerId, type, venueName, city } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email válido es requerido" }, { status: 400 });
    }

    const nameStr = typeof name === "string" && name.trim() ? name.trim() : email.split("@")[0];

    const savedUser = await syncUserToDb({
      email: email.trim().toLowerCase(),
      name: nameStr,
      avatar: typeof avatar === "string" ? avatar : "",
      provider: provider === "apple" ? "apple" : provider === "email" ? "email" : "google",
      providerId: typeof providerId === "string" ? providerId : "",
      type: typeof type === "string" ? type : "Discoteca / Club",
      venueName: typeof venueName === "string" ? venueName : "Cubic Club",
      city: typeof city === "string" ? city : "Quito",
    });

    return NextResponse.json({ success: true, user: savedUser });
  } catch (err) {
    console.error("API /api/users/sync Error:", err);
    return NextResponse.json({ error: "Error procesando usuario" }, { status: 500 });
  }
}

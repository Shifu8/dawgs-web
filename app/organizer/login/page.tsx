"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function OrganizerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/organizers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || data?.detail || "Credenciales incorrectas.");
        return;
      }

      if (!data) {
        setError("Respuesta del servidor no válida. Intenta de nuevo.");
        return;
      }

      localStorage.setItem("organizer_token", data.access_token);
      localStorage.setItem("organizer_refresh", data.refresh_token);
      localStorage.setItem("organizer_profile", JSON.stringify(data.organizer));
      router.push("/organizer/dashboard");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-5 left-5 text-zinc-600 hover:text-white transition text-xs font-black uppercase tracking-widest flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver
      </button>

      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-xl font-black tracking-widest text-white mb-6">
            NOW<span className="text-zinc-500">4GO</span>
          </div>
          <h1 className="text-2xl font-black text-white">Bienvenido de vuelta</h1>
          <p className="text-zinc-600 text-sm mt-1">Panel de Organizadores</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
              required
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-zinc-100 transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="text-center text-xs text-zinc-600 pt-2">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/organizer/register")}
              className="text-zinc-400 hover:text-white transition font-semibold"
            >
              Crear cuenta gratis
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

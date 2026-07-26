"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TurnstileWidget from "@/frontend/components/TurnstileWidget";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const [form, setForm] = useState({
    org_name: "",
    display_name: "",
    city: "Loja",
    email: "",
    password: "",
    confirm_password: "",
    bio: "",
    instagram: "",
    website: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleNext = () => {
    if (!form.org_name.trim()) return setError("El nombre de tu organización es requerido.");
    if (!form.display_name.trim()) return setError("El nombre para mostrar es requerido.");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) return setError("El email es requerido.");
    if (form.password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (form.password !== form.confirm_password) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    try {
      // Note: In production, get real Turnstile token from widget
      const res = await fetch(`${BACKEND_URL}/api/v1/organizers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: form.org_name,
          display_name: form.display_name,
          city: form.city,
          email: form.email,
          password: form.password,
          bio: form.bio || undefined,
          instagram: form.instagram || undefined,
          website: form.website || undefined,
          turnstile_token: turnstileToken || "dev-token",
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || data?.detail || `Error al registrarse (${res.status}). Intenta de nuevo.`);
        return;
      }

      if (!data) {
        setError("Respuesta del servidor no válida. Intenta de nuevo.");
        return;
      }

      // Store tokens
      localStorage.setItem("organizer_token", data.access_token);
      localStorage.setItem("organizer_refresh", data.refresh_token);
      localStorage.setItem("organizer_profile", JSON.stringify(data.organizer));

      router.push("/organizer/dashboard");
    } catch {
      setError("Error de conexión. Verifica que el servidor backend esté en ejecución.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
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

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-xl font-black tracking-widest text-white mb-1">
            NOW<span className="text-zinc-500">4GO</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-4">Crea tu cuenta de organizador</h1>
          <p className="text-zinc-600 text-sm mt-1">Publica y gestiona eventos en Ecuador</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 h-[2px] rounded-full" style={{
              background: s <= step ? "#fff" : "#27272a"
            }} />
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                Paso 1 — Sobre tu organización
              </p>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Nombre de la Organización / Promotora *
                </label>
                <input
                  type="text"
                  name="org_name"
                  value={form.org_name}
                  onChange={handleChange}
                  placeholder="Ej: Asteria Events, Trap House Crew..."
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Nombre para Mostrar *
                </label>
                <input
                  type="text"
                  name="display_name"
                  value={form.display_name}
                  onChange={handleChange}
                  placeholder="Ej: Asteria Events Loja"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Ciudad principal
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30 transition"
                >
                  {["Loja", "Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Ibarra", "Riobamba", "Esmeraldas"].map(c => (
                    <option key={c} value={c} className="bg-zinc-900">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Descripción (opcional)
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre tu organización..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="@usuario"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-zinc-600 hover:text-white transition text-[10px] font-black uppercase tracking-wider mb-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Paso anterior
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">
                Paso 2 — Credenciales de acceso
              </p>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Contraseña * (mín. 8 caracteres)
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/30 transition"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Cloudflare Turnstile Captcha */}
              <div className="flex justify-center my-3 min-h-[65px] w-full">
                <TurnstileWidget
                  action="organizer_register"
                  variant="visible"
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setError("");
                  }}
                  onExpire={() => setTurnstileToken("")}
                  onError={() => setTurnstileToken("dev-token")}
                />
              </div>
            </>
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-zinc-100 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : step === 1 ? "Continuar →" : "Crear Cuenta"}
          </button>

          <p className="text-center text-xs text-zinc-600">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/organizer/login")}
              className="text-zinc-400 hover:text-white transition font-semibold"
            >
              Iniciar sesión
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  Ticket,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Mail,
  MapPin,
  Building2,
  Smartphone,
  ChevronDown,
} from "lucide-react";
import TurnstileWidget from "@/frontend/components/TurnstileWidget";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const goHomeInstantly = () => {
    try {
      sessionStorage.setItem("skip_stormgo_loader", "true");
    } catch (e) {}
    router.push("/?skipLoader=1");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#7c3aed] via-[#8b5cf6] to-[#5b21b6] text-white selection:bg-white selection:text-purple-950 font-sans overflow-x-hidden">
      {/* Background Decorative Wave SVG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1440 1200" preserveAspectRatio="none" fill="none">
          <path d="M-100 150 C 300 20, 700 350, 1540 80" stroke="white" strokeWidth="60" opacity="0.15" />
          <path d="M-50 320 C 400 80, 900 480, 1500 220" stroke="#c2d902" strokeWidth="40" opacity="0.25" />
          <path d="M-80 620 C 350 420, 950 780, 1520 540" stroke="white" strokeWidth="55" opacity="0.15" />
        </svg>
      </div>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/15 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        {/* Top Left StormGo Brand Logo (Click to return Home instantly) */}
        <button
          onClick={goHomeInstantly}
          className="group flex items-center gap-2.5 outline-none hover:scale-105 transition-all duration-300 cursor-pointer select-none"
          aria-label="Volver al Home"
        >
          {/* Cool Cloud Mascot SVG */}
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-full h-full select-none drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 68 C15 68, 10 58, 15 48 C10 38, 20 28, 32 30 C38 18, 55 15, 65 24 C75 16, 88 24, 88 36 C95 44, 92 58, 82 68 Z" fill="#ffffff" stroke="#1e1b4b" strokeWidth="6" strokeLinejoin="round" />
              <path d="M30 32 L44 30" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
              <path d="M56 30 L70 32" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
              <path d="M24 44 C24 44, 46 38, 50 46 C54 38, 76 44, 76 44 L72 58 C72 58, 54 62, 50 56 C46 62, 28 58, 28 58 Z" fill="#111111" stroke="#1e1b4b" strokeWidth="4" strokeLinejoin="round" />
              <line x1="30" y1="46" x2="42" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="56" y1="46" x2="68" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-sm font-black uppercase tracking-tight text-white leading-none group-hover:text-[#c2d902] transition-colors">
              StormGo
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/70 leading-none mt-0.5 flex items-center gap-1">
              <ArrowLeft className="w-2.5 h-2.5" /> Home
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#c2d902] text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
            ORGANIZADORES
          </span>
          <button
            onClick={() => router.push("/organizer/login")}
            className="px-4 py-1.5 rounded-full border border-white/40 bg-white/10 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition cursor-pointer shadow-md"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pt-12 sm:pt-16 pb-8 text-center select-none">
        {/* Launch Promo Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c2d902]/60 bg-[#c2d902]/20 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#c2d902] shadow-[0_0_25px_rgba(194,217,2,0.4)] mb-6">
          <Sparkles className="w-4 h-4 text-[#c2d902] animate-pulse" />
          <span>0% COMISIÓN POR ESTE MES DE LANZAMIENTO</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] drop-shadow-xl max-w-4xl mx-auto">
          Con <span className="text-[#c2d902] underline decoration-[#c2d902]/60">StormGo</span> el organizador disfruta de su propio evento
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-white/90 font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
          Publica tus conciertos, festivales o fiestas en Ecuador. Durante este mes <strong className="text-white underline">no cobramos comisión</strong>: el 100% de lo recaudado por la venta de tus entradas es íntegro para ti.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollToForm}
            className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#c2d902] text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#b0c700] active:scale-95 transition-all shadow-[0_10px_35px_rgba(194,217,2,0.5)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CARGA TU EVENTO</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>

          <a
            href="https://wa.me/593988831372?text=Hola%20StormGo,%20quiero%20agendar%20una%20demo%20para%20publicar%20mi%20evento."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-7 py-4 rounded-full border-2 border-white/40 bg-black/30 text-white font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <MessageCircle className="w-4 h-4 text-[#c2d902]" />
            <span>Agenda una Demo</span>
          </a>
        </div>
      </section>

      {/* Feature Cards Grid (Inspired by Reference Images) */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-[28px] border border-white/20 bg-black/40 p-6 backdrop-blur-xl hover:border-[#c2d902] transition duration-300 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-[#c2d902]/20 border border-[#c2d902]/40 flex items-center justify-center text-[#c2d902] mb-4 shadow-md">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-snug">
                Configuración personalizada de tickets
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-white/90 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#c2d902] font-black text-sm">•</span>
                  <span>Preventas, etapas y add-ons de consumición.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c2d902] font-black text-sm">•</span>
                  <span>Funciones avanzadas para eventos bajo invitación.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-[28px] border border-white/20 bg-black/40 p-6 backdrop-blur-xl hover:border-[#c2d902] transition duration-300 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white mb-4 shadow-md">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-snug">
                Data y automatización
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-white/90 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#c2d902] font-black text-sm">•</span>
                  <span>Procesos automatizados para tu área contable y de facturación.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#c2d902] font-black text-sm">•</span>
                  <span>Reportes pormenorizados en tiempo real.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-[28px] border border-white/20 bg-black/40 p-6 backdrop-blur-xl hover:border-[#c2d902] transition duration-300 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-4 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-snug">
                Seguridad y control de accesos
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-white/90 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-sm">•</span>
                  <span>Trazabilidad completa de ingresos y accesos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-sm">•</span>
                  <span>Herramientas y software de última generación para equipo de accesos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-black text-sm">•</span>
                  <span>Soporte especializado en las distintas categorías de eventos.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tap2Go Cashless Banner Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="rounded-[32px] border border-white/20 bg-gradient-to-r from-black/80 via-black/60 to-black/80 p-6 sm:p-8 backdrop-blur-2xl text-center space-y-3 shadow-2xl">
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Conoce <span className="text-[#c2d902]">Tap2Go</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
            El nuevo servicio <strong className="text-[#c2d902]">dual cashless</strong> de StormGo. Recargas previas online y en sitio con NFC, integradas con tu boletería en una sola plataforma.
          </p>
        </div>
      </section>

      {/* Main Registration Form Container */}
      <section ref={formRef} className="relative z-10 max-w-xl mx-auto px-4 py-12">
        <div className="rounded-[36px] border border-white/25 bg-black/85 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-white">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c2d902]">
              PASO A PASO
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
              Crea tu cuenta de organizador
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Empieza a publicar y gestionar tus eventos en minutos
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className="flex-1 h-1.5 rounded-full transition-all"
                style={{
                  background: s <= step ? "#c2d902" : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <form
            onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c2d902] mb-4">
                  Paso 1 — Sobre tu organización
                </p>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Nombre de la Organización / Promotora *
                  </label>
                  <div className="relative flex items-center">
                    <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="org_name"
                      value={form.org_name}
                      onChange={handleChange}
                      placeholder="Ej: Asteria Events, Trap House Crew..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Nombre para Mostrar *
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      name="display_name"
                      value={form.display_name}
                      onChange={handleChange}
                      placeholder="Ej: Asteria Events Loja"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Ciudad principal
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition appearance-none cursor-pointer"
                    >
                      {["Loja", "Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Ibarra", "Riobamba", "Esmeraldas"].map((c) => (
                        <option key={c} value={c} className="bg-zinc-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Cuéntanos brevemente sobre tu organización..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                      Instagram
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      placeholder="@usuario"
                      className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs font-medium focus:outline-none focus:border-[#c2d902] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs font-medium focus:outline-none focus:border-[#c2d902] transition"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition text-[10px] font-black uppercase tracking-wider mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Paso anterior</span>
                </button>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#c2d902] mb-4">
                  Paso 2 — Credenciales de acceso
                </p>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Email de acceso *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Contraseña * (mín. 8 caracteres)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-1.5">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#c2d902] transition"
                      required
                      autoComplete="new-password"
                    />
                  </div>
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
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#c2d902] text-black text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-[#b0c700] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(194,217,2,0.4)]"
            >
              {loading ? "Registrando..." : step === 1 ? "Continuar →" : "Crear Cuenta"}
            </button>

            <p className="text-center text-xs text-zinc-400 font-medium pt-2">
              ¿Ya tienes cuenta de organizador?{" "}
              <button
                type="button"
                onClick={() => router.push("/organizer/login")}
                className="text-[#c2d902] hover:underline transition font-black"
              >
                Iniciar sesión
              </button>
            </p>
          </form>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 py-10 px-4 text-center space-y-4">
        <span className="text-xl font-black uppercase tracking-tighter text-white block">
          STORM<span className="text-[#c2d902]">GO</span>
        </span>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-bold">
          <button
            onClick={goHomeInstantly}
            className="hover:text-white transition cursor-pointer"
          >
            Home
          </button>
          <a
            href="https://wa.me/593988831372"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition cursor-pointer"
          >
            Soporte al cliente
          </a>
          <a
            href="https://wa.me/593988831372"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition cursor-pointer"
          >
            Preguntas frecuentes
          </a>
          <button
            onClick={() => router.push("/")}
            className="hover:text-white transition cursor-pointer"
          >
            Términos y condiciones
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition"
            aria-label="Instagram"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
          <a
            href="https://wa.me/593988831372"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  );
}

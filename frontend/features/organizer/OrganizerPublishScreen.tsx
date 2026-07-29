"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Ticket,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Zap,
  Building2,
  Mail,
  Lock,
  User,
  MapPin,
  Globe,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  QrCode,
  Users,
  Award,
} from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function OrganizerPublishScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    org_name: "",
    display_name: "",
    city: "Loja",
    bio: "",
    instagram: "",
    website: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleNextStep = () => {
    if (!form.org_name.trim()) return setError("El nombre de tu organización es requerido.");
    if (!form.display_name.trim()) return setError("El nombre para mostrar es requerido.");
    setError("");
    setStep(2);
  };

  const scrollToForm = () => {
    const el = document.getElementById("register-form-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
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
          turnstile_token: "dev-token",
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || data?.detail || `Error al registrarse (${res.status}). Intenta de nuevo.`);
        return;
      }

      localStorage.setItem("organizer_token", data.access_token);
      localStorage.setItem("organizer_refresh", data.refresh_token);
      localStorage.setItem("organizer_profile", JSON.stringify(data.organizer));

      setSuccessMsg("¡Registro exitoso! Redirigiendo a tu panel de organizador...");
      setTimeout(() => {
        router.push("/organizer/dashboard");
      }, 1000);
    } catch {
      setError("Error de conexión con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      return setError("Por favor ingresa tu email y contraseña.");
    }

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

      localStorage.setItem("organizer_token", data.access_token);
      localStorage.setItem("organizer_refresh", data.refresh_token);
      localStorage.setItem("organizer_profile", JSON.stringify(data.organizer));

      setSuccessMsg("¡Sesión iniciada correctamente! Redirigiendo a tu panel...");
      setTimeout(() => {
        router.push("/organizer/dashboard");
      }, 1000);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 select-none text-white">
      
      {/* ══════════════════════════════════════════════════════
          1. HERO SaaS LANDING HEADER
          ══════════════════════════════════════════════════════ */}
      <div className="relative rounded-[36px] p-8 sm:p-14 text-center bg-gradient-to-b from-[#1c083b]/90 via-[#0d041e]/90 to-black/80 border border-purple-500/25 overflow-hidden shadow-[0_20px_80px_rgba(139,92,246,0.25)]">
        {/* Glow ambient spots */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-[#8b5cf6]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-[#c2d902]/15 blur-[100px]" />

        {/* Launch Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c2d902]/60 bg-[#c2d902]/15 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#c2d902] shadow-[0_0_25px_rgba(194,217,2,0.35)] mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#c2d902] animate-pulse" />
          <span>0% Comisión por Lanzamiento · Temporada 2026</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none max-w-4xl mx-auto drop-shadow-lg">
          CON <span className="text-[#c2d902] underline decoration-[#c2d902]/60">STORMGO</span> EL ORGANIZADOR DISFRUTA DE SU PROPIO EVENTO
        </h1>

        <p className="mt-5 text-sm sm:text-lg text-zinc-300 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow">
          Publica tus conciertos, festivales o fiestas en Ecuador. Durante este mes <strong className="text-white font-black underline decoration-[#c2d902]">no cobramos comisión</strong>: el 100% de lo recaudado por la venta de tus entradas es íntegro para ti.
        </p>

        {/* Live Stats Row */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <span className="text-2xl sm:text-4xl font-black text-[#c2d902] block">0%</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">Comisión de Venta</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <span className="text-2xl sm:text-4xl font-black text-white block">100%</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">Recaudación Directa</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <span className="text-2xl sm:text-4xl font-black text-[#8b5cf6] block">+50K</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">Entradas Validadas</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center">
            <span className="text-2xl sm:text-4xl font-black text-[#ff77a8] block">24/7</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400">Soporte en Sitio</span>
          </div>
        </div>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollToForm}
            className="py-4 px-8 rounded-full bg-[#c2d902] text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#b0c700] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(194,217,2,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Crear Cuenta de Organizador</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://wa.me/593988831372?text=Hola%20StormGo,%20deseo%20asesoria%20para%20publicar%20mi%20evento."
            target="_blank"
            rel="noopener noreferrer"
            className="py-4 px-8 rounded-full border border-white/30 bg-white/10 text-white font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-white hover:text-black hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <MessageCircle className="w-4 h-4 text-[#c2d902]" />
            <span>Agenda una Demo por WhatsApp</span>
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. FEATURE SHOWCASE GRID
          ══════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#c2d902] block">
            ECOSISTEMA INTEGRAL STORMGO
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Herramientas de Alta Precisión para tu Evento
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Configuración personalizada de tickets */}
          <div className="group relative rounded-3xl border border-white/15 bg-zinc-950/80 p-7 backdrop-blur-xl hover:border-[#c2d902] transition-all duration-500 flex flex-col justify-between shadow-2xl hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c2d902]/10 rounded-full blur-2xl group-hover:bg-[#c2d902]/20 transition-all" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-[#c2d902]/15 border border-[#c2d902]/40 flex items-center justify-center text-[#c2d902] mb-5 group-hover:scale-110 transition-transform">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#c2d902] block mb-1">Boletería Digital</span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-tight">
                Configuración personalizada de tickets
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-zinc-300 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c2d902] shrink-0 mt-0.5" />
                  <span>Preventas, etapas y add-ons de consumición.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c2d902] shrink-0 mt-0.5" />
                  <span>Funciones avanzadas para eventos bajo invitación.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#c2d902] shrink-0 mt-0.5" />
                  <span>Códigos de cortesía y pases VIP exclusivos.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Data y automatización */}
          <div className="group relative rounded-3xl border border-white/15 bg-zinc-950/80 p-7 backdrop-blur-xl hover:border-[#8b5cf6] transition-all duration-500 flex flex-col justify-between shadow-2xl hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl group-hover:bg-[#8b5cf6]/20 transition-all" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6] mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#8b5cf6] block mb-1">Inteligencia Contable</span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-tight">
                Data y automatización
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-zinc-300 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8b5cf6] shrink-0 mt-0.5" />
                  <span>Procesos automatizados para tu área contable y de facturación.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8b5cf6] shrink-0 mt-0.5" />
                  <span>Reportes pormenorizados en tiempo real.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8b5cf6] shrink-0 mt-0.5" />
                  <span>Métricas de conversión y analítica de público.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Seguridad y control de accesos */}
          <div className="group relative rounded-3xl border border-white/15 bg-zinc-950/80 p-7 backdrop-blur-xl hover:border-emerald-500 transition-all duration-500 flex flex-col justify-between shadow-2xl hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Puertas &amp; Accesos</span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-tight">
                Seguridad y control de accesos
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs text-zinc-300 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Trazabilidad completa de ingresos y accesos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Software de última generación para equipo de accesos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Soporte especializado en las distintas categorías de eventos.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 4: Conoce Tap2Go */}
          <div className="group relative rounded-3xl border border-white/15 bg-zinc-950/80 p-7 backdrop-blur-xl hover:border-[#ff77a8] transition-all duration-500 flex flex-col justify-between shadow-2xl hover:-translate-y-1.5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff77a8]/10 rounded-full blur-2xl group-hover:bg-[#ff77a8]/20 transition-all" />
            <div>
              <div className="h-12 w-12 rounded-2xl bg-[#ff77a8]/20 border border-[#ff77a8]/40 flex items-center justify-center text-[#ff77a8] mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#ff77a8] block mb-1">NFC Cashless</span>
              <h3 className="text-lg font-black uppercase text-white tracking-tight leading-tight">
                Conoce Tap2Go
              </h3>
              <p className="mt-4 text-xs text-zinc-300 font-medium leading-relaxed">
                El nuevo servicio dual cashless de StormGo. Recargas previas online y en sitio con NFC, integradas con tu boletería en una sola plataforma para consumo sin filas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          3. HOW IT WORKS / TIMELINE
          ══════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-white/15 bg-white/[0.02] p-8 sm:p-12 backdrop-blur-xl space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#8b5cf6]">
            PROCESO SIMPLE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
            3 Pasos para Empezar a Vender
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 relative">
            <span className="text-4xl font-black text-[#c2d902] block mb-2">01</span>
            <h4 className="text-base font-black uppercase text-white mb-1">Registra tu Promotora</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Completa el formulario de organizador con tus datos de contacto y nombre para mostrar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 relative">
            <span className="text-4xl font-black text-[#8b5cf6] block mb-2">02</span>
            <h4 className="text-base font-black uppercase text-white mb-1">Crea tu Evento</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Configura tus localidades, precios, imagen de poster y etapas de venta en minutos.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 relative">
            <span className="text-4xl font-black text-[#ff77a8] block mb-2">03</span>
            <h4 className="text-base font-black uppercase text-white mb-1">Vende &amp; Liquida</h4>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Tus clientes compran con ticket QR digital instantáneo y recibes tu recaudación directa.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          4. PASO A PASO INTERACTIVE FORM SECTION
          ══════════════════════════════════════════════════════ */}
      <div id="register-form-section" className="relative rounded-[36px] border border-purple-500/30 bg-gradient-to-b from-[#14062b] via-[#090214] to-black p-8 sm:p-12 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.8)] max-w-4xl mx-auto space-y-8">
        
        {/* Form Mode Selector Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-[0.2em] text-[#c2d902]">
            <Building2 className="w-4 h-4 text-[#c2d902]" />
            <span>PASO A PASO</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
            {mode === "register" ? "Crea tu cuenta de organizador" : "Iniciar Sesión de Organizador"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            {mode === "register"
              ? "Empieza a publicar y gestionar tus eventos en minutos"
              : "Accede a tu panel para publicar y gestionar tus eventos"}
          </p>

          {/* Mode Switch Pills */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex rounded-full bg-white/10 p-1 border border-white/15 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("register");
                  setStep(1);
                }}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  mode === "register"
                    ? "bg-[#c2d902] text-black shadow-lg scale-105"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Crear Cuenta
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-black shadow-lg scale-105"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold text-center">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold text-center">
            {successMsg}
          </div>
        )}

        {mode === "register" ? (
          /* ── REGISTER FORM ── */
          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            {step === 1 ? (
              /* Step 1: Sobre tu organización */
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                    Paso 1 — Sobre tu organización
                  </span>
                  <span className="text-xs font-bold text-[#c2d902] bg-[#c2d902]/10 border border-[#c2d902]/30 px-3 py-1 rounded-full">
                    Paso 1 de 2
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Nombre de la Organización / Promotora *
                  </label>
                  <div className="relative flex items-center">
                    <Building2 className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      name="org_name"
                      value={form.org_name}
                      onChange={handleChange}
                      placeholder="Ej: Asteria Events, Trap House Crew..."
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Nombre para Mostrar *
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      name="display_name"
                      value={form.display_name}
                      onChange={handleChange}
                      placeholder="Ej: Asteria Events Loja"
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Ciudad principal
                  </label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none z-10" />
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full bg-[#120824] border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition cursor-pointer"
                    >
                      <option value="Loja">Loja</option>
                      <option value="Quito">Quito</option>
                      <option value="Guayaquil">Guayaquil</option>
                      <option value="Cuenca">Cuenca</option>
                      <option value="Manta">Manta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Cuéntanos brevemente sobre tu organización..."
                    className="w-full bg-white/5 border border-white/15 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Instagram
                    </label>
                    <div className="relative flex items-center">
                      <span className="text-xs font-black text-zinc-400 absolute left-4 pointer-events-none">@</span>
                      <input
                        type="text"
                        name="instagram"
                        value={form.instagram}
                        onChange={handleChange}
                        placeholder="usuario"
                        className="w-full bg-white/5 border border-white/15 rounded-2xl pl-9 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                      Sitio Web
                    </label>
                    <div className="relative flex items-center">
                      <Globe className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                      <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full mt-4 py-4 rounded-2xl bg-[#c2d902] text-black font-black uppercase text-xs sm:text-sm tracking-wider hover:bg-[#b0c700] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Continuar al Paso 2</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Step 2: Credenciales de acceso */
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="text-xs font-black uppercase text-purple-300 tracking-wider">
                    Paso 2 — Credenciales de acceso
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-zinc-400 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver al Paso 1
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Email de la Organización *
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@tuorganizacion.com"
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Contraseña *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      required
                      className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-4 rounded-2xl bg-[#c2d902] text-black font-black uppercase text-xs sm:text-sm tracking-wider hover:bg-[#b0c700] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <span>{loading ? "Registrando..." : "Completar Registro & Empezar"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("login");
                }}
                className="text-xs font-bold text-zinc-400 hover:text-[#c2d902] transition cursor-pointer underline decoration-zinc-600 underline-offset-4"
              >
                ¿Ya tienes cuenta de organizador? Iniciar sesión
              </button>
            </div>
          </form>
        ) : (
          /* ── LOGIN FORM ── */
          <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in duration-300 max-w-lg mx-auto">
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Email de Organizador *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@tuorganizacion.com"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                Contraseña *
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#c2d902] focus:ring-1 focus:ring-[#c2d902] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 rounded-2xl bg-[#c2d902] text-black font-black uppercase text-xs sm:text-sm tracking-wider hover:bg-[#b0c700] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              <span>{loading ? "Iniciando sesión..." : "Ingresar a mi Panel"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMode("register");
                  setStep(1);
                }}
                className="text-xs font-bold text-zinc-400 hover:text-[#c2d902] transition cursor-pointer underline decoration-zinc-600 underline-offset-4"
              >
                ¿No tienes cuenta aún? Crear cuenta de organizador
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          5. TRUST & HELP FOOTER BANNER
          ══════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-white/15 bg-black/60 p-8 text-center space-y-4 max-w-3xl mx-auto">
        <h4 className="text-lg font-black uppercase text-white">¿Tienes preguntas o deseas atención personalizada?</h4>
        <p className="text-xs text-zinc-400 max-w-md mx-auto font-medium leading-relaxed">
          Nuestro equipo técnico te acompaña antes, durante y después de tu evento para garantizar una experiencia 100% exitosa.
        </p>
        <div className="pt-2 flex justify-center">
          <a
            href="https://wa.me/593988831372?text=Hola%20StormGo,%20requiero%20asesoria%20personalizada%20para%20un%20evento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/10 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition cursor-pointer backdrop-blur-md shadow-lg"
          >
            <MessageCircle className="w-4 h-4 text-[#c2d902]" />
            <span>Hablar con Soporte de Organizadores por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

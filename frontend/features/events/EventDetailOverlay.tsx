"use client";

/**
 * EventDetailOverlay — Next-Level StormGo Full-Screen Event Detail Experience.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  MapPin,
  Clock,
  Tag,
  Users,
  Music,
  Globe,
  Ticket,
  Shield,
  ExternalLink,
  User,
  Plus,
  Minus,
  ShoppingBag,
  X,
  CreditCard,
  Key,
  Settings,
  LogOut,
  Sparkles,
  Eye,
  Maximize2,
} from "lucide-react";
import type { Event } from "@/frontend/types/domain";

interface EventDetailOverlayProps {
  event: Event;
  allEvents: Event[];
  onClose: () => void;
  onBuy: (event: Event) => void;
  onSelectEvent: (event: Event) => void;
  onOpenDrinks?: () => void;
  isOpen?: boolean;
  isCheckoutOpen?: boolean;
}

const ROLE_ORDER = ["Headliner", "Supporting", "Guest", "DJ", "Live Act", "Surprise"] as const;

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map = {
    available: { label: "Disponible", cls: "border-emerald-500/30 bg-emerald-950/40 text-emerald-400" },
    "sold-out": { label: "Agotado", cls: "border-red-500/30 bg-red-950/40 text-red-400" },
    "coming-soon": { label: "Próximamente", cls: "border-white/10 bg-white/[0.03] text-zinc-400" },
  };
  const s = map[status as keyof typeof map] || map.available;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[8px] font-black uppercase tracking-[0.25em] ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "available" ? "bg-emerald-400 animate-pulse" : status === "sold-out" ? "bg-red-400" : "bg-zinc-500"}`} />
      {s.label}
    </span>
  );
}

const TICKET_TIERS = [
  { id: "gen", name: "General Access Mónaco", price: 15, desc: "Acceso a la pista general del evento.", status: "Disponible" },
  { id: "vip", name: "VIP Stage Mónaco", price: 30, desc: "Frente al escenario con barra preferencial.", status: "Disponible" },
  { id: "ultra", name: "Ultra Box + Botella", price: 60, desc: "Mesa reservada en Mónaco + 1 Botella Premium a elección.", status: "Disponible" },
];

export default function EventDetailOverlay({
  event,
  allEvents,
  onClose,
  onBuy,
  onSelectEvent,
  onOpenDrinks,
  isOpen = true,
  isCheckoutOpen = false,
}: EventDetailOverlayProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Ticket quantities state
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({
    "General Access Mónaco": 1,
    "VIP Stage Mónaco": 0,
    "Ultra Box + Botella": 0,
  });

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        y: "100%",
        opacity: 0,
        duration: 0.35,
        ease: "power3.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.45, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 50);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  const updateQuantity = (name: string, delta: number) => {
    setTicketCounts((prev) => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [name]: next };
    });
  };

  // Calculations
  const totalQuantity = Object.values(ticketCounts).reduce((a, b) => a + b, 0);
  const totalPrice = TICKET_TIERS.reduce((sum, tier) => sum + (ticketCounts[tier.name] || 0) * tier.price, 0);

  // Group lineup
  const groupedLineup = (event.detailedLineup || []).reduce(
    (acc, artist) => {
      if (!acc[artist.role]) acc[artist.role] = [];
      acc[artist.role]!.push(artist);
      return acc;
    },
    {} as Record<string, NonNullable<typeof event.detailedLineup>>
  );

  const sortedRoles = ROLE_ORDER.filter((r) => groupedLineup[r]?.length);
  const hasDrinks = event.drinks && event.drinks.length > 0;

  return (
    <div className="fixed inset-0 z-[300] bg-[#070709] overflow-hidden flex flex-col font-sans">
      {/* ─── FIXED TOP HEADER BAR ─── */}
      <header className="h-16 w-full bg-black/90 border-b border-white/10 flex items-center justify-between px-6 z-[350] shrink-0 backdrop-blur-xl">
        {/* Left: StormGo Logo Button (Clean Logo matching screenshot) */}
        <button
          type="button"
          onClick={() => {
            handleClose();
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }}
          className="group flex items-center gap-2 hover:scale-105 transition-all duration-300 cursor-pointer"
          aria-label="StormGo Inicio"
        >
          <div className="w-7 h-7 shrink-0">
            <svg className="w-full h-full select-none drop-shadow-md" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 68 C15 68, 10 58, 15 48 C10 38, 20 28, 32 30 C38 18, 55 15, 65 24 C75 16, 88 24, 88 36 C95 44, 92 58, 82 68 Z" fill="#ffffff" stroke="#1e1b4b" strokeWidth="6" strokeLinejoin="round" />
              <path d="M30 32 L44 30" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
              <path d="M56 30 L70 32" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
              <path d="M24 44 C24 44, 46 38, 50 46 C54 38, 76 44, 76 44 L72 58 C72 58, 54 62, 50 56 C46 62, 28 58, 28 58 Z" fill="#111111" stroke="#1e1b4b" strokeWidth="4" strokeLinejoin="round" />
              <line x1="30" y1="46" x2="42" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              <line x1="56" y1="46" x2="68" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-white flex items-center leading-none">
            <span>Storm</span>
            <span className="text-[#c2d902]">Go</span>
          </span>
        </button>

        {/* Right: User Profile Icon Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className={`h-10 w-10 rounded-full border transition-all duration-300 cursor-pointer flex items-center justify-center ${
            isProfileMenuOpen
              ? "bg-[#c2d902] text-black border-[#c2d902] scale-105"
              : "border-white/20 bg-white/10 text-white hover:bg-white hover:text-black"
          }`}
          aria-label="Menú de Perfil"
        >
          <User className="h-5 w-5" />
        </button>
      </header>

      {/* ─── PROFILE SLIDE-OUT DROPDOWN MENU ─── */}
      <AnimatePresence>
        {isProfileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileMenuOpen(false)}
              className="fixed inset-0 z-[360] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-16 right-4 z-[370] w-72 rounded-3xl border border-white/20 bg-[#0d0d12]/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#c2d902] text-black font-black flex items-center justify-center text-sm">
                    SG
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">Mi Cuenta</h4>
                    <p className="text-[9px] font-bold text-zinc-400">usuario@stormgo.app</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { icon: <Ticket className="h-4 w-4 text-[#c2d902]" />, label: "Mis Entradas & Pases" },
                  { icon: <CreditCard className="h-4 w-4 text-emerald-400" />, label: "Historial de Compras" },
                  { icon: <Key className="h-4 w-4 text-purple-400" />, label: "Recuperar Entrada" },
                  { icon: <Settings className="h-4 w-4 text-zinc-400" />, label: "Ajustes de Cuenta" },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN SCROLLABLE CONTAINER ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 py-8">
          <div className="w-full space-y-12">

            {/* HERO BANNER CARD */}
            <div className="relative h-[48vh] min-h-[380px] max-h-[550px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                {event.poster ? (
                  <Image
                    src={event.poster}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    className="object-cover brightness-[0.7] scale-105"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Próximamente</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/40 to-transparent" />

                {/* Eye Icon Button to View Full Poster Artwork */}
                {event.poster && (
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/70 border border-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 cursor-pointer shadow-xl"
                    title="Ver afiche/banner completo"
                  >
                    <Eye className="h-4 w-4 text-[#c2d902]" />
                    <span className="hidden sm:inline">Ver Imagen Completa</span>
                  </button>
                )}

                {/* Hero Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  {event.organizer && (
                    <p className="text-[9px] font-black uppercase tracking-[0.45em] text-[#c2d902] mb-2">
                      {event.organizer} presenta
                    </p>
                  )}
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter text-white">
                    {event.title}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-zinc-300 mt-2">
                    {event.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 mt-4">
                    <StatusBadge status={event.status} />
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {event.dateLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/60 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {event.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── SELECCIÓN DE TICKETS ─── */}
              <div className="space-y-4">
                <SectionLabel>Selección de Tickets</SectionLabel>
                <div className="space-y-3 mt-4">
                  {TICKET_TIERS.map((tier) => {
                    const count = ticketCounts[tier.name] || 0;
                    return (
                      <div
                        key={tier.id}
                        className={`group relative overflow-hidden rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
                          count > 0
                            ? "border-[#c2d902] bg-[#c2d902]/[0.06] shadow-lg shadow-[#c2d902]/5 ring-1 ring-[#c2d902]/40"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-11 px-4 rounded-xl bg-[#c2d902] text-black font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                            ${tier.price}.00
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-black uppercase text-white tracking-wide group-hover:text-[#c2d902] transition-colors">
                              {tier.name}
                            </h4>
                            <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{tier.desc}</p>
                          </div>
                        </div>

                        {/* Quantity Counter Controls */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">
                            {tier.status}
                          </span>
                          <div className="flex items-center gap-2 bg-black/80 border border-white/15 rounded-full p-1 shadow-inner">
                            <button
                              type="button"
                              onClick={() => updateQuantity(tier.name, -1)}
                              disabled={count === 0}
                              className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-black text-white">{count}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(tier.name, 1)}
                              className="h-8 w-8 rounded-full bg-[#c2d902] text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer shadow-md"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── EVENT INFORMATION GRID ─── */}
              <div className="space-y-4">
                <SectionLabel>Información del Evento</SectionLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[
                    { icon: <Tag className="h-3.5 w-3.5" />, label: "Evento", value: event.title },
                    { icon: <Users className="h-3.5 w-3.5" />, label: "Artista Principal", value: event.detailedLineup?.find(a => a.role === "Headliner")?.name || event.lineup[0] },
                    { icon: <Clock className="h-3.5 w-3.5" />, label: "Hora", value: event.time || "22:00 HS" },
                    { icon: <MapPin className="h-3.5 w-3.5" />, label: "Ciudad", value: event.city },
                    { icon: <MapPin className="h-3.5 w-3.5" />, label: "Lugar / Venue", value: event.venue ? event.venue.split("·")[0].trim() : "Mónaco Night Club" },
                    { icon: <Music className="h-3.5 w-3.5" />, label: "Categoría", value: event.category || "Urban / Reggaeton" },
                    { icon: <Shield className="h-3.5 w-3.5" />, label: "Edad", value: event.ageRestriction || "+18 Obligatorio" },
                    { icon: <Ticket className="h-3.5 w-3.5" />, label: "Estado", value: event.status === "available" ? "Disponible" : "Agotado" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05]"
                    >
                      <div className="flex items-center text-zinc-500 mb-2 group-hover:text-zinc-300 transition-colors">
                        <span className="text-[7px] font-black uppercase tracking-[0.25em]">{item.label}</span>
                      </div>
                      <p className="text-[11px] font-black text-white uppercase tracking-wide leading-tight truncate">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recordatorio de Cédula */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md flex items-center gap-3 mt-3">
                  <Shield className="h-5 w-5 text-[#c2d902] shrink-0" />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-white">Cédula o Documento Físico Obligatorio</h4>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
                      Para ingresar al venue se requerirá presentar documento de identidad físico original.
                    </p>
                  </div>
                </div>
              </div>

              {/* ─── LINEUP ─── */}
              {sortedRoles.length > 0 && (
                <div className="space-y-4">
                  <SectionLabel>Lineup Oficial</SectionLabel>
                  <div className="mt-4 space-y-5">
                    {sortedRoles.map((role) => (
                      <div key={role}>
                        <p className="text-[8px] font-black uppercase tracking-[0.35em] text-zinc-500 mb-3">{role}</p>
                        <div className="flex flex-wrap gap-3">
                          {groupedLineup[role]!.map((artist) => (
                            <div
                              key={artist.name}
                              className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                            >
                              {artist.image && (
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10">
                                  <Image
                                    src={artist.image}
                                    alt={artist.name}
                                    fill
                                    sizes="40px"
                                    className="object-cover grayscale"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-wide">
                                  {artist.name}
                                </p>
                                <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                  {role}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── DRINKS & BAR SERVICE ─── */}
              {hasDrinks && (
                <div className="space-y-4">
                  <SectionLabel>Servicio de Bar & Botellas VIP</SectionLabel>
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
                    <div>
                      <h4 className="text-xs font-black uppercase text-white tracking-wider">
                        Carta de Licores Mónaco
                      </h4>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                        Whisky Old Parr, Tequila Don Julio, Vodka Absolut, Gin Tanqueray
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenDrinks?.()}
                      className="h-10 px-6 rounded-full border border-white/20 bg-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors duration-300 cursor-pointer shrink-0"
                    >
                      Ver Carta de Bar
                    </button>
                  </div>
                </div>
              )}

              {/* ─── UBICACIÓN ─── */}
              {event.venue && (
                <div className="space-y-4">
                  <SectionLabel>Ubicación & Dirección</SectionLabel>
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-white shrink-0" />
                        <h4 className="text-sm font-black uppercase text-white tracking-wide">
                          {event.venue.split("·")[0]?.trim() || event.venue}
                        </h4>
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-6">
                        {event.venue.includes("·")
                          ? event.venue.split("·").slice(1).join("·").trim()
                          : `${event.venue}, ${event.city}`}
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${event.venue}, ${event.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 h-10 px-6 rounded-full border border-white/20 bg-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition duration-300 shrink-0"
                    >
                      <span>Ver en Google Maps</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* ─── ANIMATED FLOATING CART WIDGET (LEVITATING ANIMATION & HIGHER POSITION) ─── */}
      <AnimatePresence>
        {totalQuantity > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed bottom-10 left-8 sm:bottom-12 sm:left-10 lg:bottom-16 lg:left-12 z-[400] max-w-xl w-[calc(100vw-4rem)] sm:w-auto"
          >
            {/* Floating Levitating Glass Card Container */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-3xl border border-white/25 bg-[#060608]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_60px_rgba(255,255,255,0.12)] flex items-center justify-between gap-5 md:scale-110 lg:scale-120 md:origin-bottom-left transition-transform"
            >
              
              <div className="flex items-center gap-4">
                {/* Poster Thumbnail */}
                {event.poster && (
                  <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-white/20 shrink-0 shadow-md hidden sm:block">
                    <Image
                      src={event.poster}
                      alt={event.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}

                {/* White Pill Number Badge */}
                <div className="h-12 w-12 rounded-2xl bg-white text-black font-black flex items-center justify-center text-xl shrink-0 shadow-lg shadow-white/10">
                  {totalQuantity}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide flex items-center gap-1.5">
                    <span>{totalQuantity === 1 ? "1 Entrada Seleccionada" : `${totalQuantity} Entradas Seleccionadas`}</span>
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-zinc-300 mt-0.5">
                    Total: <span className="text-[#c2d902] font-black text-sm sm:text-base">${totalPrice}.00 USD</span>
                  </p>
                </div>
              </div>

              {/* Fast Checkout CTA Button */}
              <button
                type="button"
                onClick={() => onBuy(event)}
                className="h-12 px-6 rounded-2xl bg-[#c2d902] text-black font-black uppercase text-xs tracking-[0.18em] hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer shadow-2xl flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Comprar</span>
                <span className="bg-black/15 px-2 py-0.5 rounded-md text-[10px]">${totalPrice}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─── FULL SCREEN POSTER LIGHTBOX MODAL ─── */}
      <AnimatePresence>
        {isLightboxOpen && event.poster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer z-[510]"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={event.poster}
                alt={event.title}
                width={1200}
                height={1200}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/15 select-none"
                priority
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#c2d902]">{children}</p>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

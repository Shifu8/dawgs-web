"use client";

/**
 * EventDetailOverlay — Mobile Photo Detail Inspired Event View.
 * Matches reference screenshot with top control bar (Back Arrow, Favorite Heart, Three Dots options menu),
 * full-bleed poster backdrop, location tag, title, date/time, verified organizer badge, and RESERVAR CTA.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MoreVertical,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CheckCircle2,
  BadgeCheck,
  Share2,
  Bookmark,
  X,
  ExternalLink,
} from "lucide-react";
import type { Event } from "@/frontend/types/domain";

interface EventDetailOverlayProps {
  event: Event;
  allEvents: Event[];
  onClose: () => void;
  onBuy: (event: Event) => void;
  onSelectEvent: (event: Event) => void;
  onOpenOrganizer?: (slug: string) => void;
  onOpenDrinks?: () => void;
  isOpen?: boolean;
  isCheckoutOpen?: boolean;
}

const TICKET_TIERS = [
  { id: "gen", name: "General Pass", price: 10, desc: "Acceso preferencial para la reserva del evento." },
  { id: "vip", name: "VIP Stage Pass", price: 20, desc: "Frente al escenario con servicio en mesa." },
  { id: "ultra", name: "Ultra Box + Botella", price: 50, desc: "Mesa reservada + 1 Botella Premium a elección." },
];

export default function EventDetailOverlay({
  event,
  onClose,
  onBuy,
  onOpenOrganizer,
}: EventDetailOverlayProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState("gen");

  const organizerSlug = (event.organizer || "Cubic").toLowerCase();

  return (
    <div className="fixed inset-0 z-[300] bg-black text-white overflow-y-auto no-scrollbar flex flex-col">
      
      {/* ─── 1. TOP FLOATING NAVIGATION BAR (MATCHING REFERENCE IMAGE) ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-md">
        {/* Left: Back Arrow Button [←] */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all cursor-pointer shadow-xl active:scale-95"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right Controls: Favorite Heart [♡] & Three Dots Menu [⋮] */}
        <div className="flex items-center gap-2">
          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center justify-center w-11 h-11 rounded-full border transition-all cursor-pointer shadow-xl active:scale-95 ${
              isFavorite
                ? "bg-red-500/20 border-red-500/40 text-red-400"
                : "bg-white/10 border-white/20 text-white hover:bg-white/25"
            }`}
            aria-label="Favorito"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>

          {/* Three Dots Options Button [⋮] */}
          <button
            type="button"
            onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all cursor-pointer shadow-xl active:scale-95"
            aria-label="Opciones"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── THREE DOTS OPTIONS DROPDOWN MENU ─── */}
      <AnimatePresence>
        {isOptionsMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOptionsMenuOpen(false)}
              className="fixed inset-0 z-[360] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="fixed top-16 right-4 z-[370] w-64 rounded-3xl border border-white/20 bg-zinc-950/95 backdrop-blur-2xl p-4 shadow-2xl space-y-2"
            >
              <button
                type="button"
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  if (navigator.share) {
                    navigator.share({ title: event.title, url: window.location.href });
                  }
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>Compartir Evento</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  onOpenOrganizer?.(organizerSlug);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase text-white hover:bg-white/10 transition cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>Ver Organizador ({event.organizer || "Cubic"})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOptionsMenuOpen(false);
                  setIsFavorite(!isFavorite);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold uppercase text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-pink-400" />
                <span>{isFavorite ? "Quitar de Favoritos" : "Guardar en Favoritos"}</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── 2. MAIN SCROLL CONTENT WITH FULL-BLEED POSTER ─── */}
      <div className="flex-1 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-16">

          {/* FULL BLEED POSTER BACKDROP CONTAINER */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full h-[520px] sm:h-[620px] rounded-[36px] overflow-hidden border border-white/15 shadow-2xl bg-zinc-950 cursor-pointer group"
          >
            <Image
              src={event.poster || "/images/now4go-hero-presentation-hd-v3.png"}
              alt={event.title}
              fill
              priority
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
            />

            {/* Ambient Dark Gradient Fade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* SUPERIMPOSED EVENT INFORMATION (MATCHING REFERENCE IMAGE) */}
            <div className="absolute bottom-6 inset-x-0 p-6 sm:p-8 flex flex-col items-start z-10 max-w-2xl">
              
              {/* Location Tag */}
              <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-1.5">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>{event.venue || "Cubic Loja"}</span>
              </div>

              {/* Main Event Title with Organizer Name */}
              <div className="mb-1">
                <span className="text-purple-400 font-extrabold uppercase text-xs sm:text-sm tracking-widest block mb-0.5">
                  {event.organizer || "Cubic"}
                </span>
                <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-none drop-shadow-2xl">
                  {event.title}
                </h1>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-2 text-zinc-200 text-xs sm:text-sm font-bold mt-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{event.dateLabel || "25 JUL 2026"} · 21:00 PM</span>
              </div>

              {/* DYNAMIC ORGANIZER CHECKMARK BADGE */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenOrganizer?.(organizerSlug);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black/80 border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all cursor-pointer shadow-lg active:scale-95 text-xs font-black uppercase text-white tracking-wider"
              >
                <span>{event.organizer || "Cubic"}</span>
                <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-500/20 shrink-0" />
              </button>
            </div>
          </div>

          {/* ─── 3. TICKET RESERVATION OPTIONS ─── */}
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Reservar Entradas &amp; Pases
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TICKET_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-4 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-purple-950/40 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.3)] scale-[1.02]"
                        : "bg-zinc-950 border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase text-white tracking-wider">{tier.name}</span>
                        <span className="text-sm font-black text-purple-400">${tier.price} USD</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        {tier.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBuy(event);
                      }}
                      className={`mt-4 w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 ${
                        isSelected
                          ? "bg-white text-black shadow-lg"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      RESERVAR
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ─── 4. FLOATING BOTTOM RESERVAR BAR ─── */}
      <div className="fixed bottom-4 inset-x-4 z-50 max-w-md mx-auto p-3.5 rounded-full bg-zinc-950/90 border border-white/20 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3">
        <div className="pl-3">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">Reserva tu Pase</span>
          <span className="text-sm font-black text-white">${event.price || 10} USD</span>
        </div>

        <button
          type="button"
          onClick={() => onBuy(event)}
          className="px-8 py-3 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Ticket className="w-4 h-4 text-purple-600" />
          <span>RESERVAR</span>
        </button>
      </div>

      {/* Lightbox Modal */}
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
              className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer z-[510]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={event.poster}
                alt={event.title}
                width={1000}
                height={1000}
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

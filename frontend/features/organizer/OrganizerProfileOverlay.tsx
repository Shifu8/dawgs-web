"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Calendar,
  ChevronLeft,
  MapPin,
  Share2,
  Ticket,
  X,
} from "lucide-react";
import type { Event } from "@/frontend/types/domain";

type OrganizerProfileOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  organizerName?: string;
  allEvents?: Event[];
  onSelectEvent?: (event: Event) => void;
  onBuyEvent?: (event: Event) => void;
};

export default function OrganizerProfileOverlay({
  isOpen,
  onClose,
  organizerName = "Cubic",
  allEvents = [],
  onSelectEvent,
}: OrganizerProfileOverlayProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  if (!isOpen) return null;

  // Filter events belonging to Cubic
  const cubicEvents = allEvents.filter((evt) => {
    const orgText = (evt.organizer || "" + evt.title).toLowerCase();
    return orgText.includes("cubic");
  });

  const displayEvents = cubicEvents.length > 0 ? cubicEvents : allEvents.slice(0, 6);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl overflow-y-auto no-scrollbar"
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Cubic Loja — 4GO",
                    url: "https://www.instagram.com/cubic_loja/",
                  });
                }
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
              aria-label="Compartir"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white hover:bg-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── CRISP CLEAR CUBIC COVER IMAGE BANNER ─── */}
        <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden -mt-16 bg-black flex items-center justify-center">
          <Image
            src="/images/cubic-official-logo.png"
            alt="Cubic Cover"
            fill
            priority
            className="object-contain object-center brightness-100 p-4"
          />
        </div>

        {/* ─── CUBIC TITLE & VERIFIED BADGE DIRECTLY BELOW COVER IMAGE ─── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-4 pb-6 flex flex-col items-center text-center">
          {/* Title + Verified Badge */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              CUBIC
            </h1>
            <BadgeCheck className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 fill-blue-500/20 shrink-0" />
          </div>

          {/* Action Buttons: Seguir & Instagram */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-7 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer active:scale-95 ${
                isFollowing
                  ? "bg-zinc-800 text-white border border-zinc-600"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {isFollowing ? "Siguiendo" : "Seguir"}
            </button>

            <a
              href="https://www.instagram.com/cubic_loja/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-bold tracking-wider transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 text-pink-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>@cubic_loja</span>
            </a>
          </div>

          {/* Quick Info Pill Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Av. Salvador Bustamante Celi, Loja
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Jueves, Viernes y Sábado
            </span>
          </div>
        </div>

        {/* ─── EVENTS IN A STRICT 2-COLUMN GRID LIST ─── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Eventos de Cubic
              </h2>
              <span className="text-xs font-bold text-zinc-300 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                {displayEvents.length} Eventos Activos
              </span>
            </div>

            {/* STRICT 2-COLUMN GRID LAYOUT FOR MOBILE AND DESKTOP */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {displayEvents.map((evt) => (
                <div
                  key={`cubic-grid-${evt.id}`}
                  onClick={() => {
                    onSelectEvent?.(evt);
                    onClose();
                  }}
                  className="group relative flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-500 transition-all duration-300 shadow-lg"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden">
                    <Image
                      src={evt.poster || "/images/cubic-official-logo.png"}
                      alt={evt.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-black shadow">
                      ${evt.price || 10} USD
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="p-3 flex flex-col justify-between flex-1 bg-[#09090b]">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">
                        Cubic Loja
                      </span>
                      <h3 className="text-xs font-bold uppercase text-white group-hover:text-zinc-200 transition-colors line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-medium line-clamp-1 mt-0.5">
                        {evt.subtitle || evt.dateLabel}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-zinc-400">{evt.dateLabel}</span>
                      <span className="text-[9px] font-bold text-white uppercase">Ver &rarr;</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

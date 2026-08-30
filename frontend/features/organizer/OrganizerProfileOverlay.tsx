"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Calendar,
  ChevronLeft,
  MapPin,
  Share2,
  Ticket,
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Tag,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import type { Event } from "@/frontend/types/domain";
import { getHdImageSrc, DEFAULT_HD_EVENT_POSTER } from "@/frontend/utils/hdImages";

type OrganizerProfileOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  organizerName?: string;
  allEvents?: Event[];
  onSelectEvent?: (event: Event) => void;
  onBuyEvent?: (event: Event) => void;
};

export type OrganizerProfile = {
  id: string;
  name: string;
  title: string;
  email: string;
  type: "Organizador" | "Discoteca / Club Nocturno";
  logo: string;
  instagramUrl: string;
  instagramHandle: string;
  location: string;
  schedule: string;
  description: string;
  followersCount: string;
};

export const ORGANIZER_DATA: Record<string, OrganizerProfile> = {
  cubic: {
    id: "cubic",
    name: "Cubic",
    title: "CUBIC LOJA",
    email: "mrshifu879@gmail.com",
    type: "Discoteca / Club Nocturno",
    logo: "/images/cubic-official-logo.png",
    instagramUrl: "https://www.instagram.com/cubic_loja/?hl=es",
    instagramHandle: "@cubic_loja",
    location: "Av. Salvador Bustamante Celi y Guayaquil, Loja",
    schedule: "Jueves, Viernes y Sábado",
    description: "El club nocturno líder en Loja. Experiencias audiovisuales sin precedentes, DJs invitados y la mejor vibra de la ciudad.",
    followersCount: "14.2K",
  },
  sata: {
    id: "sata",
    name: "Sata Music",
    title: "SATA MUSIC",
    email: "brandon.medina@unl.edu.ec",
    type: "Organizador",
    logo: "/images/sata-official-logo.jpg",
    instagramUrl: "https://www.instagram.com/sata_events/",
    instagramHandle: "@sata_events",
    location: "Loja, Ecuador",
    schedule: "Eventos Especiales & Conciertos",
    description: "Productora oficial de eventos underground, conciertos y fiestas exclusivas en Ecuador.",
    followersCount: "8.9K",
  },
};

export default function OrganizerProfileOverlay({
  isOpen,
  onClose,
  organizerName = "Cubic",
  allEvents = [],
  onSelectEvent,
}: OrganizerProfileOverlayProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const eventsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedSlug = (organizerName || "").toLowerCase().trim();
  const matchedKey = Object.keys(ORGANIZER_DATA).find(
    (k) =>
      k === normalizedSlug ||
      ORGANIZER_DATA[k].id.toLowerCase() === normalizedSlug ||
      ORGANIZER_DATA[k].name.toLowerCase() === normalizedSlug ||
      normalizedSlug.includes(ORGANIZER_DATA[k].id.toLowerCase()) ||
      ORGANIZER_DATA[k].id.toLowerCase().includes(normalizedSlug)
  );
  const key = matchedKey || "cubic";
  const org = ORGANIZER_DATA[key] || ORGANIZER_DATA.cubic;

  // Filter events belonging to this organizer
  const orgEvents = allEvents.filter((evt) => {
    const orgText = ((evt.organizer || "") + " " + (evt.venue || "") + " " + evt.title).toLowerCase();
    const searchTerms = [key, org.id.toLowerCase(), org.name.toLowerCase()];
    return searchTerms.some((term) => orgText.includes(term));
  });

  const displayEvents = orgEvents.length > 0 ? orgEvents : allEvents.slice(0, 6);

  // Dynamic vibrant background image from event poster or fallback
  const bgPosterSrc = getHdImageSrc(
    displayEvents[0]?.poster || (key === "cubic" ? "/images/trap_loud_event_1779161392003.png" : org.logo)
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 300) {
      setIsScrolledDown(true);
    } else {
      setIsScrolledDown(false);
    }
  };

  const scrollToTop = () => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToEvents = () => {
    if (eventsSectionRef.current) {
      eventsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[700] bg-[#101014] text-white flex flex-col select-none overflow-hidden"
      >
        {/* ─── ULTRA-VIVID AMBIENT EVENT COLOR BLUR BACKDROP (EXACT MATCH TO EVENT DETAIL PAGE) ─── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0e0d14]">
          <Image
            src={bgPosterSrc}
            alt={org.name}
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center scale-150 blur-[120px] saturate-200 brightness-110 opacity-75"
          />
          {/* Dark Gray Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#121218]/70 via-[#0e0d14]/85 to-[#0b0a10]" />
        </div>

        {/* ─── TOP FLOATING NAVIGATION BAR ─── */}
        <header className="fixed top-0 inset-x-0 z-[550] flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-[#0c0714]/90 via-[#0c0714]/50 to-transparent pointer-events-none">
          {/* Left: Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
            aria-label="Volver"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right: Share & Close */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${org.title} — 4GO`,
                    url: org.instagramUrl,
                  });
                }
              }}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
              aria-label="Compartir"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>



        {/* ─── FULL-PAGE MAIN SCROLLABLE CONTAINER ─── */}
        <div
          ref={mainContainerRef}
          onScroll={handleScroll}
          className="relative z-10 w-full h-full overflow-y-auto no-scrollbar pt-24 pb-24"
        >
          {/* ─── MAIN 2-COLUMN GRID (SAME ARCHITECTURE AS EVENT DETAIL PAGE) ─── */}
          <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* ─── LEFT COLUMN (ORGANIZER LOGO CARD + INSTAGRAM LINK + BADGES) ─── */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              {/* Profile Image / Logo Card */}
              <div className="relative w-full aspect-square max-w-[380px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/20 bg-black flex items-center justify-center p-8 group">
                <Image
                  src={org.logo}
                  alt={org.name}
                  fill
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-contain object-center brightness-105 p-6 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 pointer-events-none" />

                {/* Verified Badge Overlaid Bottom Left */}
                <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 bg-black/70 border border-white/20 backdrop-blur-md px-3 py-1 rounded-full z-10">
                  <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-500/20" />
                  <span className="text-[10px] font-black uppercase text-white tracking-wider">Verificado</span>
                </div>
              </div>

              {/* Instagram Official Handle Box */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-0.5 flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-pink-400 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-xs font-black text-white tracking-wide">
                      Instagram Oficial
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      {org.instagramHandle}
                    </span>
                  </div>
                </div>

                <a
                  href={org.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white text-white hover:text-black font-extrabold text-xs uppercase transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Visitar
                </a>
              </div>

              {/* Location & Schedule Pills */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{org.location}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                  <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{org.schedule}</span>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN (ORGANIZER HEADER + FOLLOW BOX + EVENTS GRID) ─── */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              
              {/* Name & Type Tag */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-sans drop-shadow-md">
                    {org.name}
                  </h1>
                  <BadgeCheck className="w-8 h-8 text-blue-400 fill-blue-500/20 shrink-0" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-zinc-200 tracking-tight">
                  {org.type}
                </p>
              </div>

              {/* ─── DARK FOLLOW STATS BOX WITH WHITE SEGUIR BUTTON ─── */}
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl backdrop-blur-2xl">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{org.followersCount}</span>
                    <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Seguidores</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium leading-normal">
                    Sigue a {org.name} para recibir notificaciones exclusivas de nuevos eventos y preventas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-9 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer shrink-0 text-center shadow-lg active:scale-95 ${
                    isFollowing
                      ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      : "bg-white hover:bg-zinc-200 text-black shadow-[0_0_25px_rgba(255,255,255,0.3)]"
                  }`}
                >
                  {isFollowing ? "SIGUIENDO" : "SEGUIR"}
                </button>
              </div>

              {/* ─── "Eventos de [Organizador]" (Strict 2-Column Grid Layout) ─── */}
              <div ref={eventsSectionRef} className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Eventos de {org.name}
                  </h2>
                  <span className="text-xs font-bold text-zinc-300 bg-white/10 px-3.5 py-1 rounded-full border border-white/15">
                    {displayEvents.length} Eventos Activos
                  </span>
                </div>

                {/* STRICT 2-COLUMN GRID MATCHING THE REST OF THE WEBSITE */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {displayEvents.map((evt) => (
                    <div
                      key={`org-grid-${evt.id}`}
                      onClick={() => {
                        onSelectEvent?.(evt);
                        onClose();
                      }}
                      className="group relative flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-pointer hover:border-zinc-500 transition-all duration-300 shadow-xl"
                    >
                      {/* Poster Thumbnail */}
                      <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden">
                        <Image
                          src={evt.poster || org.logo}
                          alt={evt.title}
                          fill
                          className="object-cover transition-transform duration-500"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-black shadow">
                          ${evt.price || 10} USD
                        </span>
                      </div>

                      {/* Text Details */}
                      <div className="p-3.5 flex flex-col justify-between flex-1 bg-[#09090b]">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider block">
                            {org.name}
                          </span>
                          <h3 className="text-xs font-bold uppercase text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                            {evt.title}
                          </h3>
                          <p className="text-[10px] text-zinc-400 font-medium line-clamp-1 mt-0.5">
                            {evt.subtitle || evt.dateLabel}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-zinc-400">{evt.dateLabel}</span>
                          <span className="text-[9px] font-bold text-white uppercase group-hover:translate-x-0.5 transition-transform">Ver &rarr;</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

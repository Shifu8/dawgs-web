"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Calendar,
  Ticket,
  X,
  BadgeCheck,
  ChevronRight,
  Lock,
  Sparkles,
  Play,
  Info,
  Megaphone,
  ShieldCheck,
  Tag,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  ExternalLink,
  DoorOpen,
} from "lucide-react";
import type { Event } from "@/frontend/types/domain";
import { DEFAULT_HD_EVENT_POSTER, getHdImageSrc } from "@/frontend/utils/hdImages";

interface EventDetailOverlayProps {
  event: Event;
  allEvents?: Event[];
  onClose: () => void;
  onBuy: (event: Event) => void;
  onSelectEvent?: (event: Event) => void;
  onOpenOrganizer?: (slug: string) => void;
  onOpenDrinks?: () => void;
  isOpen?: boolean;
  isCheckoutOpen?: boolean;
}

const DEFAULT_ORGANIZERS = [
  {
    id: "cubic",
    name: "CUBIC",
    type: "Discoteca",
    img: "/images/cubic-official-logo.png",
    instagramUrl: "https://instagram.com/cubic.ec",
  },
  {
    id: "sata",
    name: "SATA",
    type: "Organizador de eventos",
    img: "/images/sata-official-logo.jpg",
    instagramUrl: "https://instagram.com/sata.ec",
  },
];

export default function EventDetailOverlay({
  event,
  onClose,
  onBuy,
  onOpenOrganizer,
}: EventDetailOverlayProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [promoCodeText, setPromoCodeText] = useState("");
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [followedIds, setFollowedIds] = useState<Record<string, boolean>>({});
  const [isAddressCopied, setIsAddressCopied] = useState(false);

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const infoSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, []);

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

  const scrollToBottomInfo = () => {
    if (infoSectionRef.current) {
      infoSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleFollow = (id: string) => {
    setFollowedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const venueName = event.venue || "CUBIC";
  const venueAddress = (event as any).address || "Av. Salvador Bustamante Celi y Guayaquil, Loja, Ecuador";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venueName} ${venueAddress}`)}`;

  const copyAddressToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(venueAddress);
      setIsAddressCopied(true);
      setTimeout(() => setIsAddressCopied(false), 2000);
    }
  };

  const displayPrice = event.price === 0 ? "Gratis" : `${event.price || "79,99"} $`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] bg-[#0c0714] text-white flex flex-col select-none overflow-hidden"
    >
      {/* ─── ULTRA-VIVID AMBIENT POSTER COLOR BLUR BACKDROP ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0714]">
        <Image
          src={getHdImageSrc(event.poster || DEFAULT_HD_EVENT_POSTER)}
          alt={event.title}
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center scale-150 blur-[110px] saturate-200 brightness-110 opacity-75"
        />
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0c0714]/95" />
      </div>

      {/* ─── TOP NAVIGATION BAR ─── */}
      <header className="fixed top-0 inset-x-0 z-[350] flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-[#0c0714]/90 via-[#0c0714]/50 to-transparent pointer-events-none">
        {/* Left: Back Arrow Button [←] */}
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right Controls: Favorite Heart & Share */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: event.title, url: window.location.href });
              }
            }}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
            aria-label="Compartir"
          >
            <Share2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={`flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95 ${
              isFavorite
                ? "bg-red-500/30 border-red-500/50 text-red-400"
                : "bg-black/60 border-white/20 text-white hover:bg-white/20"
            }`}
            aria-label="Favorito"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
          </button>
        </div>
      </header>



      {/* ─── FULL-PAGE MAIN SCROLLABLE CONTAINER ─── */}
      <div
        ref={mainContainerRef}
        onScroll={handleScroll}
        className="relative z-10 w-full h-full overflow-y-auto no-scrollbar pt-24 pb-36"
      >
        {/* ─── MAIN 2-COLUMN GRID (DICE EXACT MATCHING SCREENSHOT) ─── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* ─── LEFT COLUMN (POSTER + AUDIO PLAYER + PROTECTION BADGES) ─── */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Poster Artwork Container */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full aspect-square max-w-[380px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-white/20 bg-zinc-950 cursor-pointer group"
            >
              <Image
                src={getHdImageSrc(event.poster || DEFAULT_HD_EVENT_POSTER)}
                alt={event.title}
                fill
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover object-center brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

              {/* Overlaid Action Buttons Bottom Right */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFavorite(!isFavorite);
                  }}
                  className={`w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-transform active:scale-95 ${
                    isFavorite
                      ? "bg-red-500/40 border-red-400 text-red-400"
                      : "bg-black/70 border-white/20 text-white hover:bg-black/90"
                  }`}
                  aria-label="Guardar favorito"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-400 text-red-400" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({ title: event.title, url: window.location.href });
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/90 transition-transform active:scale-95"
                  aria-label="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* "Tema más popular" (Music Preview Box) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
              <div className="flex flex-col space-y-0.5 max-w-[240px]">
                <span className="text-xs font-black text-white tracking-wide">
                  Tema más popular
                </span>
                <span className="text-xs text-zinc-300 font-medium truncate">
                  {(event as any).artistTrack || `${event.title} - Forever Young`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
                aria-label="Reproducir tema"
              >
                <Play className={`w-4 h-4 ml-0.5 ${isPlayingAudio ? "fill-white" : ""}`} />
              </button>
            </div>

            {/* 4GO Anti-Scalping Protection Badge */}
            <div className="space-y-2 pt-1">
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                4GO protege a fans y artistas de la reventa ilegal. Tus entradas se guardarán de forma segura en la app.
              </p>

              {/* ¿Tienes un código? Link */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPromoCodeInput(!showPromoCodeInput)}
                  className="text-xs font-bold text-white hover:underline cursor-pointer transition-colors"
                >
                  ¿Tienes un código?
                </button>

                {showPromoCodeInput && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={promoCodeText}
                      onChange={(e) => setPromoCodeText(e.target.value)}
                      placeholder="Ingresa tu código promo"
                      className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-yellow-400 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (promoCodeText.trim()) {
                          alert(`Código "${promoCodeText}" aplicado exitosamente.`);
                          setShowPromoCodeInput(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-yellow-400 text-black text-xs font-black uppercase hover:bg-yellow-300 transition cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (EVENT INFO + YELLOW COMPRAR TICKET BOX + CARTEL + SALA) ─── */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            {/* Title & Subtitle */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-sans drop-shadow-md">
                {event.title}
              </h1>
              <p className="text-xl sm:text-2xl font-bold text-zinc-200 tracking-tight">
                {event.subtitle || event.venue || "CUBIC LOJA"}
              </p>
            </div>

            {/* Date & Time Highlight (Yellow bold text exact match to screenshot) */}
            <div className="space-y-1">
              <p className="text-lg sm:text-xl font-bold text-yellow-400 tracking-tight">
                {event.dateLabel || "sáb, 19 sept, 22:00 GMT-5"}
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-zinc-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Fiesta / DJ</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{event.city || "Loja"}</span>
                </span>
              </div>
            </div>

            {/* ─── DARK TICKET PRICE BOX WITH YELLOW COMPRAR BUTTON ─── */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl backdrop-blur-2xl">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Desde {displayPrice}
                </div>
                <p className="text-xs text-zinc-400 font-medium leading-normal">
                  Este es el precio que pagarás. Sin sorpresas de última hora.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onBuy(event)}
                className="px-9 py-4 rounded-full bg-[#dfff28] hover:bg-[#cbf01a] text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 text-center shadow-md"
              >
                RESERVAR
              </button>
            </div>

            {/* ─── "Información" Section ─── */}
            <div ref={infoSectionRef} className="space-y-3 pt-4 border-t border-white/10">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Información
              </h2>
              <p className={`text-sm text-zinc-300 leading-relaxed font-medium ${!isExpandedDescription ? "line-clamp-4" : ""}`}>
                {event.description ||
                  `Llega la fiesta más esperada a CUBIC Loja. Presentado por SATA con barra libre, show audiovisual cinematográfico y la mejor música en vivo.`}
              </p>
              <button
                type="button"
                onClick={() => setIsExpandedDescription(!isExpandedDescription)}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                {isExpandedDescription ? "Leer menos" : "Leer más"}
              </button>
            </div>

            {/* ─── Event Badges / Icons (Exact Match to Screenshot) ─── */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                <Info className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>This is an 18+ event</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                <Megaphone className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Presented by {event.organizer || "CUBIC & SATA"}</span>
              </div>
              <div className="flex flex-col space-y-1 text-xs text-zinc-300 font-medium">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Puedes <strong>obtener un reembolso</strong> si:</span>
                </div>
                <ul className="pl-7 list-disc text-zinc-400 text-xs space-y-0.5">
                  <li>Este evento se reprograma o se cancela</li>
                </ul>
                <p className="pl-7 text-[11px] text-zinc-500 pt-1">
                  No puedes obtener un reembolso dentro de las 24 horas previas al inicio del evento.
                </p>
              </div>
            </div>

            {/* ─── "PROMOTOR" / Organizers & Promoters List ─── */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h2 className="text-2xl font-black text-white tracking-tight">
                PROMOTOR
              </h2>

              <div className="space-y-3">
                {DEFAULT_ORGANIZERS.map((org) => {
                  const isFollowing = !!followedIds[org.id];
                  return (
                    <div
                      key={org.id}
                      className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                    >
                      <div
                        onClick={() => onOpenOrganizer?.(org.id)}
                        className="flex items-center gap-3.5 cursor-pointer group"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 group-hover:border-yellow-400 bg-zinc-900 shrink-0 transition-colors">
                          <Image
                            src={org.img}
                            alt={org.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-extrabold text-white leading-tight group-hover:text-yellow-400 transition-colors">
                            {org.name}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">
                            {org.type}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          toggleFollow(org.id);
                          const instagramLink = (org as any).instagramUrl || "https://instagram.com/cubic.ec";
                          window.open(instagramLink, "_blank", "noopener,noreferrer");
                        }}
                        className="px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
                      >
                        SEGUIR
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── "Lugar" / Venue & Map Section ─── */}
            <div className="space-y-3 pt-6 border-t border-white/10">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">
                Lugar
              </span>
              
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white tracking-tight">
                    {venueName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                    <span>{venueAddress}</span>
                    <button
                      type="button"
                      onClick={copyAddressToClipboard}
                      className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
                      title="Copiar dirección"
                    >
                      {isAddressCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: ABRIR EN EL MAPA */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider border border-white/20 backdrop-blur-md transition cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                  <span>ABRIR EN EL MAPA</span>
                </a>
              </div>

              {/* Opening Doors Text */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium pt-2">
                <DoorOpen className="w-4 h-4 text-zinc-400" />
                <span>Apertura de puertas <strong>22:00 GMT-5</strong></span>
              </div>
            </div>

          </div>
        </div>
      </div>



      {/* Full Poster Lightbox */}
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
              className="absolute top-6 right-6 h-11 w-11 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all cursor-pointer z-[510]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Image
                src={getHdImageSrc(event.poster || DEFAULT_HD_EVENT_POSTER)}
                alt={event.title}
                width={1600}
                height={1600}
                quality={100}
                sizes="(max-width: 768px) 100vw, 85vw"
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-3xl shadow-2xl border border-white/15 select-none"
                priority
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

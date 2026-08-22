"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform, useDragControls } from "framer-motion";
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

const TICKET_PHASES = [
  {
    id: "prev1",
    name: "1ra Preventa",
    price: 5,
    status: "active",
    statusLabel: "Habilitado",
    urgentBadge: "¡Quedan pocos días para reservar a este precio!",
    desc: "Acceso preferencial garantizado. La tarifa más baja antes del cambio de fase.",
  },
  {
    id: "prev2",
    name: "2da Preventa",
    price: 10,
    status: "locked",
    statusLabel: "Pronto se habilita",
    urgentBadge: null,
    desc: "Se activará automáticamente al agotarse la 1ra Preventa ($5 USD).",
  },
  {
    id: "vip",
    name: "Pase VIP Stage",
    price: 20,
    status: "locked",
    statusLabel: "Próximamente",
    urgentBadge: null,
    desc: "Frente al escenario con mesa exclusiva y atención personalizada.",
  },
];

const CAST_MEMBERS = [
  { id: "c1", name: "Omar Courtz", role: "Headliner", img: "/images/omar_courtz_artist_1779161689015.png" },
  { id: "c2", name: "Yan Block", role: "Artist", img: "/images/yan_block_artist_1779161408288.png" },
  { id: "c3", name: "Roa", role: "Artist", img: "/images/roa_artist_1779161704881.png" },
  { id: "c4", name: "Anuel AA", role: "Special Guest", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80" },
];

export default function EventDetailOverlay({
  event,
  onClose,
  onBuy,
  onOpenOrganizer,
}: EventDetailOverlayProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isExpandedDescription, setIsExpandedDescription] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState("prev1");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [promoCodeText, setPromoCodeText] = useState("");

  const [isSheetCollapsed, setIsSheetCollapsed] = useState(true);
  const [collapseY, setCollapseY] = useState(550);
  const dragControls = useDragControls();

  const isSheetCollapsedRef = useRef(isSheetCollapsed);
  const lastCollapseTimeRef = useRef(0);
  const userGestureLockRef = useRef(0);

  useEffect(() => {
    isSheetCollapsedRef.current = isSheetCollapsed;
  }, [isSheetCollapsed]);

  const collapseSheet = () => {
    setIsSheetCollapsed(true);
    lastCollapseTimeRef.current = Date.now();
    userGestureLockRef.current = Date.now() + 550;
  };

  const expandSheet = () => {
    setIsSheetCollapsed(false);
    userGestureLockRef.current = Date.now() + 550;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCollapseY(Math.round(window.innerHeight * 0.75));
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [onClose]);

  // Real-time Motion Values for Dragging
  const sheetY = useMotionValue(0);
  const posterScale = useTransform(sheetY, [0, collapseY], [1.0, 1.05]);

  const organizerList =
    event.organizers && event.organizers.length > 0
      ? event.organizers
      : [event.organizer || "Factory Town"];

  const displayPrice = event.price === 0 ? "Gratis" : `${event.price || "79,99"} $`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] bg-[#0c0714] text-white flex flex-col overflow-y-auto no-scrollbar select-none"
    >
      {/* ─── DYNAMIC BLURRED BACKGROUND DERIVED FROM POSTER ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src={getHdImageSrc(event.poster || DEFAULT_HD_EVENT_POSTER)}
          alt={event.title}
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center blur-3xl opacity-30 scale-110 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0714]/80 via-[#0c0714]/90 to-[#0c0714]" />
      </div>

      {/* ─── TOP FLOATING NAVIGATION BAR ─── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-[#0c0714] via-[#0c0714]/80 to-transparent">
        {/* Left: Back Arrow Button [←] */}
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right Controls: Favorite Heart & Share */}
        <div className="flex items-center gap-2">
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

      {/* ─── MAIN 2-COLUMN LAYOUT (EXACT MATCHING USER SCREENSHOT) ─── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-24 pb-36 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        
        {/* ─── LEFT COLUMN (POSTER + AUDIO PLAYER + TRUST BADGES) ─── */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          {/* Poster Artwork Container */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full aspect-square max-w-[380px] mx-auto rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/15 bg-zinc-950 cursor-pointer group"
          >
            <Image
              src={getHdImageSrc(event.poster || DEFAULT_HD_EVENT_POSTER)}
              alt={event.title}
              fill
              priority
              quality={100}
              sizes="(max-width: 768px) 100vw, 380px"
              className="object-cover object-center brightness-105 group-hover:scale-105 transition-transform duration-500"
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
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

        {/* ─── RIGHT COLUMN (EVENT INFO + YELLOW COMPRAR TICKET BOX) ─── */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none font-sans drop-shadow-md">
              {event.title}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-zinc-200 tracking-tight">
              {event.subtitle || event.venue || "Factory Town"}
            </p>
          </div>

          {/* Date & Time Highlight (Yellow bold text exact match to screenshot) */}
          <div className="space-y-1">
            <p className="text-lg sm:text-xl font-bold text-yellow-400 tracking-tight">
              {event.dateLabel || "sáb, 19 sept, 22:00 GMT-4"}
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>DJ</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>{event.city || "Miami"}</span>
              </span>
            </div>
          </div>

          {/* ─── DARK TICKET PRICE BOX WITH YELLOW COMPRAR BUTTON (EXACT MATCH TO SCREENSHOT) ─── */}
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
              className="px-9 py-4 rounded-full bg-[#dfff28] hover:bg-[#cbf01a] text-black font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(223,255,40,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 text-center"
            >
              COMPRAR
            </button>
          </div>

          {/* ─── "Información" Section ─── */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Información
            </h2>
            <p className={`text-sm text-zinc-300 leading-relaxed font-medium ${!isExpandedDescription ? "line-clamp-4" : ""}`}>
              {event.description ||
                `${event.title} returns for a headline debut on Saturday with special guests, plus Close Friends Only. Limited VIP tables are available, contact our team to book.`}
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
              <span>Presented by {event.organizer || "Factory Town"}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
              <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Puedes obtener un reembolso si el evento es cancelado o reprogramado.</span>
            </div>
          </div>

        </div>
      </div>

      {/* ─── STICKY BOTTOM BUY BAR (PARALLEL STICKY BAR Preserved for Mobile & Desktop) ─── */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 border-t border-white/15 backdrop-blur-2xl px-6 py-4 flex items-center justify-between max-w-6xl mx-auto shadow-[0_-15px_40px_rgba(0,0,0,0.9)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            {event.title}
          </span>
          <span className="text-base sm:text-lg font-black text-white">
            Desde {displayPrice}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBuy(event)}
          className="px-8 py-3.5 rounded-full bg-[#dfff28] hover:bg-[#cbf01a] text-black font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(223,255,40,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          COMPRAR
        </button>
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

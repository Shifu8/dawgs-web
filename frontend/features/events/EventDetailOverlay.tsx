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
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(true);
  const [collapseY, setCollapseY] = useState(550);
  const dragControls = useDragControls();

  const isSheetCollapsedRef = useRef(isSheetCollapsed);
  useEffect(() => {
    isSheetCollapsedRef.current = isSheetCollapsed;
  }, [isSheetCollapsed]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCollapseY(Math.round(window.innerHeight * 0.75));
      document.body.style.overflow = "hidden";

      // Auto-expand sheet modal after half a second (500ms)
      const autoExpandTimer = setTimeout(() => {
        setIsSheetCollapsed(false);
      }, 500);

      let touchStartY = 0;

      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY > 8) {
          setIsSheetCollapsed(false);
        } else if (e.deltaY < -8) {
          if (isSheetCollapsedRef.current) {
            onClose();
          } else {
            setIsSheetCollapsed(true);
          }
        }
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length >= 1) {
          touchStartY = e.touches[0].clientY;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length >= 1) {
          const currentY = e.touches[0].clientY;
          const diffY = touchStartY - currentY; // positive = swiping up, negative = swiping down
          if (diffY > 25) {
            setIsSheetCollapsed(false);
          } else if (diffY < -25) {
            if (isSheetCollapsedRef.current) {
              onClose();
            } else {
              setIsSheetCollapsed(true);
            }
          }
        }
      };

      window.addEventListener("wheel", handleWheel, { passive: true });
      window.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });

      return () => {
        clearTimeout(autoExpandTimer);
        document.body.style.overflow = "";
        window.removeEventListener("wheel", handleWheel);
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [onClose]);

  // Real-time Motion Values for 1-to-1 Continuous Drag & Parallax Poster Motion
  const sheetY = useMotionValue(0);
  const posterScale = useTransform(sheetY, [0, collapseY], [1.0, 1.12]);
  const backdropOpacity = useTransform(sheetY, [0, collapseY], [0.85, 0.1]);

  const organizerList =
    event.organizers && event.organizers.length > 0
      ? event.organizers
      : [event.organizer || "Cubic"];

  const handleToggleSheet = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setIsSheetCollapsed((prev) => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] bg-black text-white flex flex-col overflow-hidden select-none"
    >
      {/* ─── 150MS BLACK EYE-BLINK SHUTTER FLASH ("PESTAÑAZO DE NEGRO") ─── */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="absolute inset-0 bg-black z-[450] pointer-events-none"
      />

      {/* ─── HERO POSTER & CONTENT ─── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full h-full flex flex-col overflow-hidden"
      >
      
      {/* ─── 1. TOP FLOATING NAVIGATION BAR ─── */}
      <header className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
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

      {/* ─── 2. HERO POSTER BACKDROP (DYNAMIC PARALLAX LINKED TO DRAG) ─── */}
      <motion.div
        onClick={() => {
          setIsSheetCollapsed((prev) => !prev);
        }}
        style={{ scale: posterScale }}
        className="relative w-full flex-1 bg-zinc-950 cursor-pointer overflow-hidden origin-top"
      >
        <Image
          src={getHdImageSrc(event.poster || DEFAULT_HD_EVENT_POSTER)}
          alt={event.title}
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center brightness-105 transition-all duration-300"
        />
        <motion.div
          style={{ opacity: backdropOpacity }}
          className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"
        />
      </motion.div>

      {/* ─── 3. REAL-TIME 1-TO-1 DRAGGABLE GLASSMORPHIC SHEET ─── */}
      <motion.div
        style={{ y: sheetY }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: collapseY }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.y > 60 || info.velocity.y > 100) {
            if (isSheetCollapsedRef.current) {
              onClose();
            } else {
              setIsSheetCollapsed(true);
            }
          } else if (info.offset.y < -60 || info.velocity.y < -100) {
            setIsSheetCollapsed(false);
          }
        }}
        animate={{ y: isSheetCollapsed ? collapseY : 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="absolute left-6 right-6 sm:left-8 sm:right-8 bottom-0 z-20 max-w-4xl mx-auto h-[82vh] flex flex-col"
      >
        <div className="flex-1 rounded-t-[36px] sm:rounded-t-3xl bg-gradient-to-b from-white/15 via-[#0b0614]/95 to-[#0b0614] border-t border-x border-white/25 backdrop-blur-3xl p-5 sm:p-7 shadow-[0_-25px_60px_rgba(0,0,0,0.95)] overflow-y-auto no-scrollbar space-y-4 pb-16">
          
          {/* DRAG HANDLE — touch & mouse draggable */}
          <div
            onPointerDown={(e) => {
              dragControls.start(e);
            }}
            onClick={handleToggleSheet}
            style={{ touchAction: "none" }}
            className="w-full pt-2 pb-5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none z-30 group"
          >
            <div className="w-12 h-1.5 bg-white/70 group-hover:bg-white active:bg-emerald-400 rounded-full shadow-md border border-white/20 transition-colors" />
          </div>

          {/* Centered Event Title & Subtitle */}
          <div className="text-center flex flex-col items-center justify-center space-y-1.5">
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight leading-tight text-center">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-zinc-300 tracking-wide uppercase text-center">
              {event.subtitle || event.venue || "CUBIC LOJA"}
            </p>
          </div>

          {/* Badges & Compact Info Pill Row (Fecha, Ubicación, Genre, Age, Organizers) - CENTERED */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold text-white">
              Fiesta / Trap
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold text-white">
              18+
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{event.dateLabel || "25 JUL 2026"}</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-extrabold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>{event.venue || "Cubic Loja"}</span>
            </span>
            {organizerList.map((orgName, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onOpenOrganizer?.(orgName.toLowerCase())}
                className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-white/20 transition cursor-pointer"
              >
                <span>{orgName.toUpperCase()}</span>
                <BadgeCheck className="w-4 h-4 text-blue-400 fill-blue-500/20 shrink-0" />
              </button>
            ))}
          </div>

          {/* Story Line / Description Section */}
          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <h3 className="text-xs font-extrabold uppercase text-white tracking-wider">
              STORY LINE
            </h3>
            <p className={`text-xs text-zinc-300 leading-relaxed font-medium ${!isExpandedDescription ? "line-clamp-2" : ""}`}>
              {event.description ||
                "La escena underground cobra vida con una experiencia audiovisual cinematográfica sin precedentes. Bajo retumbante, luces robóticas y barra libre de shots en un ambiente exclusivo."}
            </p>
            <button
              type="button"
              onClick={() => setIsExpandedDescription(!isExpandedDescription)}
              className="text-xs font-bold text-red-500 hover:text-red-400 cursor-pointer"
            >
              {isExpandedDescription ? "Ver menos" : "Más"}
            </button>
          </div>

          {/* Star Cast / Artistas Section */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <h3 className="text-xs font-extrabold uppercase text-white tracking-wider">
              Star Cast / Artistas
            </h3>
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
              {CAST_MEMBERS.map((member) => (
                <div key={member.id} className="flex flex-col items-center shrink-0 w-16 text-center space-y-1">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50 bg-zinc-900 shadow-md">
                    <Image
                      src={member.img}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="60px"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">
                    {member.name}
                  </span>
                  <span className="text-[8px] font-medium text-zinc-400 line-clamp-1">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Presale Phases (WITH RESERVAR ENTRADAS BUTTON INSIDE THE ACTIVE 1ST PRESALE CARD) */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase text-white tracking-wider">
                Fases de Reserva &amp; Entradas
              </h3>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Fase 1 Activa
              </span>
            </div>

            <div className="space-y-2.5">
              {TICKET_PHASES.map((phase) => {
                const isActive = phase.status === "active";
                const isSelected = selectedPhaseId === phase.id;

                return (
                  <div
                    key={phase.id}
                    onClick={() => {
                      if (isActive) setSelectedPhaseId(phase.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-pointer"
                          : "bg-white/5 border-white/20 hover:border-emerald-400 cursor-pointer"
                        : "bg-white/5 border-white/10 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-white">{phase.name}</span>
                        {isActive ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[9px] font-black uppercase">
                            Habilitado
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-400 text-[9px] font-bold uppercase flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            {phase.statusLabel}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-black ${isActive ? "text-emerald-400" : "text-zinc-500"}`}>
                        ${phase.price} USD
                      </span>
                    </div>

                    {isActive && phase.urgentBadge && (
                      <div className="mt-1.5 text-[10px] font-extrabold text-emerald-300 flex items-center gap-1">
                        <span>🔥</span>
                        <span>{phase.urgentBadge}</span>
                      </div>
                    )}

                    <p className="text-[10px] text-zinc-400 font-medium mt-1 leading-tight">
                      {phase.desc}
                    </p>

                    {/* VIVID NEON GREEN RESERVAR BUTTON INSIDE THE 1ST PRESALE CARD */}
                    {isActive && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBuy(event);
                        }}
                        className="mt-3.5 w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Ticket className="w-4 h-4 text-black" />
                        <span>RESERVAR ENTRADAS · ${phase.price} USD</span>
                        <ChevronRight className="w-4 h-4 text-black" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>

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
    </motion.div>
  );
}

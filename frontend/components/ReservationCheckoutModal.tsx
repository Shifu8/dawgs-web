"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Ticket, Check, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import type { Event } from "@/frontend/types/domain";

interface ReservationCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  userProfile: any;
  userLoggedIn: boolean;
  userReservations: Record<string, boolean>;
  onConfirmReservation: (eventId: string, tierId: string) => void;
  onOpenAuth: () => void;
  onViewMyReservations: () => void;
}

const getHdImageSrc = (src?: string) => {
  if (!src) return "/images/now4go-hero-presentation-hd-v3.png";
  if (src.includes("event_fisher") || src.includes("fisher")) return "/images/now4go-hero-presentation-hd-v3.png";
  if (src.includes("yan_block") || src.includes("trap-loud")) return "/images/yan_block_artist_1779161408288.png";
  if (src.includes("anuel")) return "/images/trap_loud_anuel_1778966415162.png";
  if (src.includes("brent")) return "/images/rnb_loud_brent_1778966427864.png";
  if (src.includes("bad_bunny")) return "/images/latin_loud_bad_bunny_1778966469259.png";
  return src;
};

export default function ReservationCheckoutModal({
  isOpen,
  onClose,
  event,
  userProfile,
  userLoggedIn,
  userReservations,
  onConfirmReservation,
  onOpenAuth,
  onViewMyReservations,
}: ReservationCheckoutModalProps) {
  const [selectedTier, setSelectedTier] = useState<"ga" | "vip">("ga");
  const [quantity, setQuantity] = useState<number>(0);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const activeEvent = event || {
    id: "fisher-factory-town",
    title: "FISHER",
    dateLabel: "SÁB, 26 SEPT, 22:00 GMT-5",
    venue: "CUBIC CLUB LOJA",
    poster: "/images/event_fisher.png",
    price: 0,
  };

  const isAlreadyReserved = Boolean(activeEvent?.id && userReservations[activeEvent.id]);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setShowLimitWarning(false);
      // Default to 1 selected if not already reserved
      setQuantity(isAlreadyReserved ? 0 : 1);
    }
  }, [isOpen, isAlreadyReserved, event?.id]);

  if (!isOpen) return null;

  const handleIncreaseQuantity = (tier: "ga" | "vip") => {
    if (isAlreadyReserved) return;
    setSelectedTier(tier);
    if (quantity >= 1) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }
    setQuantity(1);
  };

  const handleDecreaseQuantity = (tier: "ga" | "vip") => {
    if (isAlreadyReserved) return;
    setSelectedTier(tier);
    setQuantity(0);
  };

  const handleConfirm = () => {
    if (!userLoggedIn) {
      onOpenAuth();
      return;
    }

    if (activeEvent?.id) {
      onConfirmReservation(activeEvent.id, selectedTier);
      setIsSuccess(true);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[500] bg-[#0c0714] text-white flex flex-col select-none overflow-y-auto p-4 sm:p-6 md:p-8"
      >
        {/* ─── ULTRA-VIVID AMBIENT POSTER COLOR BLUR BACKDROP (EXACT 1:1 MATCH TO EVENT DETAIL OVERLAY) ─── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0714]">
          <Image
            src={getHdImageSrc(activeEvent.poster)}
            alt={activeEvent.title}
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover object-center scale-150 blur-[110px] saturate-200 brightness-110 opacity-75"
          />
          {/* Subtle Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0c0714]/95" />
        </div>

        {/* ─── TOP NAVIGATION HEADER BAR (FULL VIEWPORT EDGE-TO-EDGE) ─── */}
        <div className="relative z-10 w-full px-4 sm:px-8 py-4 flex items-center justify-between gap-4 border-b border-white/10">
          {/* Top Left: Circular Arrow Back Button (Exact match to EventDetailOverlay) */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Center: Step Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span className={isSuccess ? "text-zinc-500" : "text-white font-black"}>Reserva</span>
            <span>→</span>
            <span className={isSuccess ? "text-white font-black" : "text-zinc-500"}>Pase 4GO</span>
          </div>

          {/* Top Right: Code Promo + Close */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden md:inline-flex px-4 py-2 rounded-full bg-black/60 backdrop-blur-md hover:bg-white/20 border border-white/20 text-[11px] font-extrabold uppercase tracking-wider text-zinc-300 transition cursor-pointer"
            >
              ¿TIENES UN CÓDIGO?
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── MAIN CONTENT CONTAINER ─── */}
        <div className="relative z-10 flex-1 w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-8">
          {isSuccess ? (
            /* SUCCESS CONFIRMATION PASSHOLDER CARD */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xl mx-auto bg-zinc-900/90 backdrop-blur-2xl border border-emerald-500/30 rounded-[36px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest inline-block">
                  RESERVA CONFIRMADA EN PUERTA
                </span>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                  ¡TU LUGAR ESTÁ ASEGURADO!
                </h3>
                <p className="text-sm text-zinc-300 font-medium max-w-sm mx-auto">
                  Tu reserva para <strong className="text-white">{activeEvent.title}</strong> ha sido guardada exitosamente. Presenta tu identificación en puerta.
                </p>
              </div>

              {/* Mock QR Access Pass Badge */}
              <div className="bg-black/80 border border-white/15 rounded-3xl p-6 space-y-3 max-w-xs mx-auto text-center shadow-inner">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center">
                  <Image
                    src="/images/qr-banco-pichincha.png"
                    alt="QR Pase 4GO"
                    width={110}
                    height={110}
                    className="object-contain"
                  />
                </div>
                <div className="text-left space-y-0.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest block">TITULAR DEL PASE</span>
                  <p className="text-xs font-black text-white truncate">{userProfile?.name || "Brandon Medina"}</p>
                  <p className="text-[11px] font-medium text-zinc-300 truncate">{userProfile?.email || "brandon.medina@unl.edu.ec"}</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewMyReservations();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#dfff28] hover:bg-[#cbf01a] text-black font-black text-xs uppercase tracking-widest transition shadow-xl cursor-pointer"
                >
                  VER MIS RESERVAS
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer"
                >
                  CERRAR
                </button>
              </div>
            </motion.div>
          ) : (
            /* RESERVA SELECTION GRID (MATCHING SCREENSHOT 1 & 2) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: EVENT BANNER & TIER CARDS */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Event Summary Header (UNBOXED matching Image 2) */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border border-white/20 bg-zinc-950 shadow-2xl">
                    <Image
                      src={activeEvent.poster || "/images/event_fisher.png"}
                      alt={activeEvent.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight truncate drop-shadow-md">
                      {activeEvent.title}
                    </h2>
                    <p className="text-sm sm:text-base font-bold text-[#dfff28] truncate">
                      {activeEvent.dateLabel || "18 SEP 2026"} • {activeEvent.venue || "Factory Town • Miami"}
                    </p>
                  </div>
                </div>

                {/* Limit Warning Alert */}
                {showLimitWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Control de aforo: Máximo 1 reserva por cuenta de usuario.</span>
                  </motion.div>
                )}

                {/* Already Reserved Banner */}
                {isAlreadyReserved && (
                  <div className="p-4 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Ya tienes 1 reserva activa confirmada para este evento.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewMyReservations();
                      }}
                      className="px-4 py-2 rounded-full bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shrink-0 hover:bg-emerald-300 transition cursor-pointer"
                    >
                      VER PASE
                    </button>
                  </div>
                )}

                {/* TIER OPTION 1: GA ACCESO GENERAL */}
                <div
                  className={`relative p-6 rounded-3xl border transition-all backdrop-blur-xl ${selectedTier === "ga" && quantity > 0
                    ? "bg-zinc-900/90 border-[#dfff28] shadow-[0_0_30px_rgba(223,255,40,0.2)]"
                    : "bg-black/60 border-white/15 hover:border-white/30"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-widest text-zinc-300">
                        ACCESO INDIVIDUAL
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                        GA - Entrada General
                      </h3>
                      <p className="text-base sm:text-lg font-black text-white">
                        {activeEvent.price === 0 ? "0,00 $" : `${activeEvent.price || 10},00 $`}
                      </p>
                    </div>

                    {/* Quantity Counter Box (Matching Screenshot 1 & 2) */}
                    <div className="flex items-center gap-3 bg-zinc-950/80 border border-white/20 rounded-2xl p-1.5 shrink-0 shadow-lg">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQuantity("ga")}
                        disabled={isAlreadyReserved || (selectedTier === "ga" && quantity === 0)}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-black text-base flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed"
                      >
                        -
                      </button>

                      <div className="w-10 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-sm text-white">
                        <Ticket className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                        <span>{selectedTier === "ga" ? quantity : 0}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIncreaseQuantity("ga")}
                        disabled={isAlreadyReserved}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-black text-base flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-xs font-medium text-zinc-400 leading-relaxed">
                    - Acceso general individual al evento con reserva confirmada en lista de puerta.
                  </div>
                </div>

                {/* TIER OPTION 2: MESA VIP / ZONA EXCLUSIVA */}
                <div
                  className={`relative p-6 rounded-3xl border transition-all backdrop-blur-xl ${selectedTier === "vip" && quantity > 0
                    ? "bg-zinc-900/90 border-[#dfff28] shadow-[0_0_30px_rgba(223,255,40,0.2)]"
                    : "bg-black/60 border-white/15 hover:border-white/30"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black uppercase tracking-widest text-amber-300">
                        ZONA EXCLUSIVA [21+]
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                        Reserva Mesa VIP / Lounge
                      </h3>
                      <p className="text-base sm:text-lg font-black text-white">
                        Reserva Preferencial VIP
                      </p>
                    </div>

                    {/* Quantity Counter Box */}
                    <div className="flex items-center gap-3 bg-zinc-950/80 border border-white/20 rounded-2xl p-1.5 shrink-0 shadow-lg">
                      <button
                        type="button"
                        onClick={() => handleDecreaseQuantity("vip")}
                        disabled={isAlreadyReserved || (selectedTier === "vip" && quantity === 0)}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-black text-base flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed"
                      >
                        -
                      </button>

                      <div className="w-10 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-sm text-white">
                        <Ticket className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        <span>{selectedTier === "vip" ? quantity : 0}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleIncreaseQuantity("vip")}
                        disabled={isAlreadyReserved}
                        className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-black text-base flex items-center justify-center transition cursor-pointer disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-xs font-medium text-zinc-400 leading-relaxed">
                    - Reserva de espacio en zona VIP exclusiva con servicio prioritario en barra y atención personalizada.
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: FLOATING SUMMARY BOX (MATCHING SCREENSHOT 1 & 2) */}
              <div className="lg:col-span-5 space-y-4 text-left">
                {/* White Summary Card */}
                <div className="bg-white text-black rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 border border-white font-sans">
                  <div className="space-y-1 border-b border-zinc-200 pb-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-black">
                      {quantity} {quantity === 1 ? "reserva" : "reservas"}
                    </h3>
                    <p className="text-sm font-extrabold text-zinc-700">
                      Total – {quantity > 0 ? (activeEvent.price === 0 ? "0 $" : `${activeEvent.price || 10} $`) : "0 $"}
                    </p>
                  </div>

                  {/* Updates Checkbox (Matching Screenshot 2) */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-zinc-300 text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-zinc-700 leading-snug">
                      Deseo recibir correos electrónicos de 4GO con novedades sobre los próximos eventos y lanzamientos exclusivos.
                    </span>
                  </label>

                  {/* Primary Action Button (Acid yellow/green matching RESERVAR button in screenshot) */}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={quantity === 0 || !acceptTerms}
                    className="w-full py-4 rounded-full bg-[#dfff28] hover:bg-[#cbf01a] text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed"
                  >
                    {isAlreadyReserved
                      ? "YA TIENES 1 RESERVA CONFIRMADA"
                      : !userLoggedIn
                      ? "INICIAR SESIÓN Y CONFIRMAR"
                      : "CONFIRMAR RESERVA EN LISTA"}
                  </button>
                </div>

                {/* Below Box Notice (Matching Screenshot 1 & 2) */}
                <div className="bg-black/60 border border-white/15 backdrop-blur-xl rounded-2xl p-4 flex items-start gap-3 text-zinc-300 text-[11px] leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                  <p>
                    Reservando esta entrada, abrirás una cuenta o vincularás tu acceso y aceptarás nuestras <span className="underline text-white font-bold cursor-pointer">Condiciones de Uso</span> y <span className="underline text-white font-bold cursor-pointer">Política de Privacidad</span>. Procesamos tus datos de acuerdo con nuestra normativa.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Copyright */}
        <div className="relative z-10 w-full max-w-7xl mx-auto pt-4 border-t border-white/10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-bold text-zinc-400">
          <span>© 4GO 2026, all rights reserved</span>
          <span>Soporte &amp; Ayuda: soporte@4go.app</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

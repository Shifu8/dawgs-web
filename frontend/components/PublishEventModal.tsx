"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Sparkles, Ticket, BarChart3, ShieldCheck, ArrowRight, MessageCircle, Globe } from "lucide-react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

interface PublishEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PublishEventModal({ isOpen, onClose }: PublishEventModalProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isClosing && modalRef.current && backdropRef.current) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.killTweensOf([modalRef.current, backdropRef.current]);

      gsap.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduceMotion ? 0 : 0.24, ease: "power2.out" }
      );

      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          y: 20,
          scale: reduceMotion ? 1 : 1.05,
          filter: reduceMotion ? "none" : "blur(8px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: reduceMotion ? 0 : 0.45,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && !isClosing) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isClosing]);

  const handleClose = () => {
    if (isClosing) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !modalRef.current || !backdropRef.current) {
      setIsClosing(false);
      onClose();
      return;
    }

    setIsClosing(true);
    gsap.killTweensOf([modalRef.current, backdropRef.current]);

    gsap.to(backdropRef.current, {
      autoAlpha: 0,
      duration: 0.24,
      ease: "power2.inOut",
    });

    gsap.to(modalRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.92,
      filter: "blur(8px)",
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        setIsClosing(false);
        onClose();
      },
    });
  };

  const handleCargaTuEvento = () => {
    handleClose();
    router.push("/organizer/register");
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[640px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto no-scrollbar flex flex-col rounded-t-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#180833] via-[#0d041c] to-[#06020c] border border-purple-500/30 shadow-[0_30px_100px_rgba(139,92,246,0.35)] z-10 text-white"
      >
        {/* Top Floating Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer active:scale-90 shadow-md"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Hero Banner Section */}
        <div className="relative p-6 sm:p-8 pt-8 text-center bg-gradient-to-b from-purple-900/40 via-purple-900/10 to-transparent border-b border-white/10 overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#8b5cf6]/30 blur-3xl" />

          {/* Launch Offer Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c2d902]/50 bg-[#c2d902]/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#c2d902] shadow-[0_0_20px_rgba(194,217,2,0.3)] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#c2d902] animate-pulse" />
            <span>0% Comisión por Lanzamiento</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
            Con <span className="text-[#c2d902] underline decoration-[#c2d902]/50">StormGo</span> el organizador disfruta de su propio evento
          </h2>

          <p className="mt-3 text-xs sm:text-sm text-zinc-300 font-medium max-w-lg mx-auto leading-relaxed">
            Publica tus conciertos, festivales o fiestas en Ecuador. Durante este mes <strong className="text-white">no cobramos comisión</strong>: el 100% de lo recaudado por la venta de tus entradas es integro para ti.
          </p>

          {/* Action CTAs inside Hero Banner */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCargaTuEvento}
              className="w-full sm:w-auto py-3.5 px-8 rounded-full bg-[#c2d902] text-black font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#b0c700] active:scale-95 transition-all shadow-[0_0_25px_rgba(194,217,2,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Carga Tu Evento</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/593988831372?text=Hola%20StormGo,%20deseo%20agendar%20una%20demo%20para%20publicar%20mi%20evento."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-6 rounded-full border border-white/30 bg-white/10 text-white font-black text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#c2d902]" />
              <span>Agenda una Demo</span>
            </a>
          </div>
        </div>

        {/* Feature Cards Grid (Inspired by Reference Images) */}
        <div className="p-6 sm:p-8 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-purple-300 text-center mb-2">
            ¿Por qué elegir la plataforma StormGo?
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 backdrop-blur-md hover:border-[#c2d902]/50 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-xl bg-[#c2d902]/15 border border-[#c2d902]/30 flex items-center justify-center text-[#c2d902] mb-3">
                  <Ticket className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase text-white tracking-tight">
                  Configuración personalizada
                </h4>
                <ul className="mt-2 space-y-1 text-[10px] text-zinc-300 font-medium leading-relaxed">
                  <li className="flex items-start gap-1">
                    <span className="text-[#c2d902] font-bold">•</span>
                    <span>Preventas, etapas y add-ons.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-[#c2d902] font-bold">•</span>
                    <span>Entradas VIP y pases bajo invitación.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 backdrop-blur-md hover:border-[#c2d902]/50 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6] mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase text-white tracking-tight">
                  Data y automatización
                </h4>
                <ul className="mt-2 space-y-1 text-[10px] text-zinc-300 font-medium leading-relaxed">
                  <li className="flex items-start gap-1">
                    <span className="text-[#8b5cf6] font-bold">•</span>
                    <span>Reportes en tiempo real.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-[#8b5cf6] font-bold">•</span>
                    <span>Métricas avanzadas con Asistente IA.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 backdrop-blur-md hover:border-[#c2d902]/50 transition duration-300 flex flex-col justify-between">
              <div>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase text-white tracking-tight">
                  Seguridad y accesos
                </h4>
                <ul className="mt-2 space-y-1 text-[10px] text-zinc-300 font-medium leading-relaxed">
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Validación QR instantánea anti-fraude.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Trazabilidad completa de accesos.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Social Media inside Modal */}
        <div className="p-6 sm:p-8 pt-4 border-t border-white/10 bg-black/40 text-center space-y-3">
          <span className="text-sm font-black tracking-tight text-white uppercase block">
            StormGo
          </span>

          <div className="flex items-center justify-center gap-6 text-xs text-zinc-300 font-bold">
            <button
              type="button"
              onClick={() => {
                handleClose();
                window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Soporte al cliente
            </button>
            <button
              type="button"
              onClick={() => {
                handleClose();
                window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Preguntas frecuentes
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/593988831372"
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

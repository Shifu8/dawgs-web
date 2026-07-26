"use client";

import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { gsap } from "gsap";
import TicketRecovery from "@/frontend/features/access-drop/TicketRecovery";

interface TicketRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  eventName?: string;
}

export default function TicketRecoveryModal({
  isOpen,
  onClose,
  eventId,
  eventName = "Evento",
}: TicketRecoveryModalProps) {
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
          y: 18,
          scale: reduceMotion ? 1 : 1.14,
          filter: reduceMotion ? "none" : "blur(8px)",
          transformOrigin: "center bottom",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: reduceMotion ? 0 : 0.48,
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
      y: 18,
      scale: 0.82,
      filter: "blur(8px)",
      transformOrigin: "center bottom",
      duration: 0.34,
      ease: "power3.in",
      onComplete: () => {
        setIsClosing(false);
        onClose();
      },
    });
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/80 backdrop-blur-md sm:backdrop-blur-lg"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[550px] max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col rounded-t-[28px] sm:rounded-[32px] bg-[#060606] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] z-10"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/[0.06] flex items-start justify-between bg-gradient-to-b from-zinc-900/40 to-transparent shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[8px] font-black uppercase tracking-[0.25em] text-zinc-300">
              Recuperación de entrada
            </span>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-2.5">
              {eventName}
            </h3>
          </div>

          <button
            onClick={handleClose}
            type="button"
            aria-label="Cerrar modal de recuperación"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-400 hover:text-white hover:border-white/30 transition-all duration-300 cursor-pointer active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
          <TicketRecovery embedded={true} eventId={eventId} className="w-full" />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Calendar, Ticket, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import TicketRecovery from "@/frontend/features/access-drop/TicketRecovery";
import type { Event } from "@/frontend/types/domain";

interface TicketRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  eventName?: string;
  allEvents?: Event[];
}

export default function TicketRecoveryModal({
  isOpen,
  onClose,
  eventId,
  eventName = "Evento",
  allEvents = [],
}: TicketRecoveryModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventId || (allEvents[0]?.id ?? ""));
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventId) {
      setSelectedEventId(eventId);
    } else if (allEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(allEvents[0].id);
    }
  }, [eventId, allEvents]);

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
          scale: reduceMotion ? 1 : 1.08,
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
      scale: 0.88,
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

  const currentSelectedEvent = allEvents.find(e => e.id === selectedEventId);
  const displayTitle = currentSelectedEvent?.title || eventName;

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        onClick={handleClose}
      />

      {/* Modal Container — Styled with Web's Signature Purple & Black Luxury Theme */}
      <div
        ref={modalRef}
        className="relative w-full max-w-[560px] max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col rounded-t-[32px] sm:rounded-[36px] bg-gradient-to-b from-[#1c0b38] via-[#100624] to-[#070212] border border-purple-400/30 shadow-[0_30px_100px_rgba(139,92,246,0.3)] z-10 text-white"
      >
        {/* Header */}
        <div className="relative p-6 sm:p-7 border-b border-purple-500/20 flex flex-col gap-3 bg-gradient-to-b from-purple-900/30 to-transparent shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c2d902] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-black shadow-md">
                <Ticket className="w-3 h-3 text-black" />
                <span>Recuperación de Entrada</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-3">
                {displayTitle}
              </h3>
            </div>

            <button
              onClick={handleClose}
              type="button"
              aria-label="Cerrar modal de recuperación"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer active:scale-90 shadow-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Event Selector Dropdown */}
          {allEvents && allEvents.length > 0 && (
            <div className="mt-2 pt-3 border-t border-white/10">
              <label className="text-[9px] font-black uppercase tracking-widest text-purple-300 block mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#c2d902]" />
                <span>Seleccionar Evento a Recuperar:</span>
              </label>
              <div className="relative">
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-purple-400/40 bg-black/60 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white focus:border-[#c2d902] focus:outline-none cursor-pointer pr-10 shadow-inner"
                >
                  {allEvents.map((evt) => (
                    <option key={evt.id} value={evt.id} className="bg-[#120626] text-white font-bold py-1">
                      {evt.title} ({evt.city}) — {evt.dateLabel}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-3 text-purple-300">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable content container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar">
          <TicketRecovery embedded={true} eventId={selectedEventId} className="w-full" />
        </div>
      </div>
    </div>
  );
}

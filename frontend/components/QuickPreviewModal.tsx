"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { Event as EventItem } from "@/frontend/types/domain";

interface QuickPreviewModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickPreviewModal: React.FC<QuickPreviewModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handleGoToEventPage = () => {
    const slug = (event as any).slug || event.id;
    window.location.href = `/storm/${slug}`;
  };

  const tags = [
    "@reggaeton",
    "@trap",
    "@urban_music",
    "@fiesta_3d",
    "@vip_access"
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
        {/* Dark backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Translucent Glass Card Sheet (Matching User Reference Image 1) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[440px] rounded-[32px] sm:rounded-[36px] bg-black/80 backdrop-blur-2xl border border-white/20 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.85)] z-10 text-white overflow-hidden"
        >
          {/* Top Pill Handle — (Drag handle style from screenshot 1) */}
          <div className="w-12 h-1 rounded-full bg-white/40 mx-auto mb-4" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-xs font-bold text-white transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>

          {/* Poster & Header info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-white/15">
              {event.poster ? (
                <Image
                  src={event.poster}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-xl text-white">
                  {event.title.slice(0, 2)}
                </div>
              )}
            </div>

            <div className="flex-1 text-left min-w-0">
              <h3 className="text-xl font-black uppercase text-white leading-tight truncate">
                {event.title}
              </h3>
              <p className="text-xs font-semibold text-[#ff77a8] mt-0.5 truncate">
                @{((event as any).organizer || "now4go_official").toLowerCase().replace(/\s+/g, "_")}
              </p>
              <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                {event.city} · {event.dateLabel}
              </p>
            </div>
          </div>

          {/* Quick Description */}
          <div className="text-left my-4">
            <p className="text-xs font-normal text-zinc-200 leading-relaxed">
              {event.subtitle || "Experiencia inmersiva con lo mejor del Reggaeton, Trap Latino y música urbana en vivo. ¡Adquiere tu entrada oficial!"}
            </p>
          </div>

          {/* Stats Row (Matching User Screenshot 1: 521 Followers / 345 Following / 566 Creations) */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 my-4 text-center">
            <div>
              <p className="text-lg font-black text-white">1,240</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Asistirán</p>
            </div>
            <div>
              <p className="text-lg font-black text-[#84cc16]">${event.price} USD</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Precio Base</p>
            </div>
            <div>
              <p className="text-lg font-black text-[#ff77a8]">98%</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Vendidos</p>
            </div>
          </div>

          {/* Genre Pills (Matching User Screenshot 1: @bookreader, @foodie, etc.) */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-zinc-300 backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Primary CTA Button: "Ver Evento Oficial" */}
          <button
            type="button"
            onClick={handleGoToEventPage}
            className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-wider hover:bg-[#e10075] hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Ver Evento Oficial</span>
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

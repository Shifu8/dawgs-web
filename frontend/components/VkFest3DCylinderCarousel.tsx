"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export interface EventItem {
  id: string;
  title: string;
  subtitle?: string;
  venue?: string;
  dateLabel?: string;
  price?: number;
  poster?: string;
  organizer?: string;
}

interface VkFest3DCylinderCarouselProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export default function VkFest3DCylinderCarousel({
  events,
  onSelectEvent,
}: VkFest3DCylinderCarouselProps) {
  // Dense 3D ribbon with at least 14 cards
  const expandedEvents = useMemo(() => {
    let list = Array.isArray(events) && events.length > 0 ? [...events] : [];
    if (list.length === 0) return [];
    
    while (list.length < 14) {
      list = [...list, ...events];
    }
    return list.slice(0, 16).map((item, index) => ({
      ...item,
      uniqueId: `${item.id}-${index}`,
    }));
  }, [events]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play sliding to the right continuously
  useEffect(() => {
    if (isPaused || expandedEvents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % expandedEvents.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isPaused, expandedEvents.length]);

  if (expandedEvents.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden py-4 select-none bg-black/80 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Carousel Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-8 max-w-[1400px] mx-auto">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.25em] block mb-1">
            FESTIVAL SHOWCASE 3D
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight font-sans">
            Lineup &amp; Shows Destacados
          </h2>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + expandedEvents.length) % expandedEvents.length
              )
            }
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600/80 border border-white/20 flex items-center justify-center text-white text-base font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            title="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % expandedEvents.length)
            }
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-600/80 border border-white/20 flex items-center justify-center text-white text-base font-bold transition-all cursor-pointer shadow-lg active:scale-95"
            title="Siguiente"
          >
            ›
          </button>
        </div>
      </div>

      {/* 3D Curved Cylinder Panorama Stage (VK Fest & Streaming Style) */}
      <div className="relative w-full h-[390px] sm:h-[490px] flex items-center justify-center perspective-[1400px] overflow-hidden">
        <div className="relative w-full max-w-[1600px] h-full flex items-center justify-center transform-style-3d">
          {expandedEvents.map((evt, idx) => {
            const total = expandedEvents.length;
            let diff = (idx - currentIndex + total) % total;
            if (diff > total / 2) diff -= total;

            if (Math.abs(diff) > 4) return null;

            const isCenter = diff === 0;

            const rotateY = diff * -18;
            const translateX = diff * 185;
            const translateZ = -Math.abs(diff) * 45;
            const scale = isCenter ? 1.08 : Math.max(0.75, 0.95 - Math.abs(diff) * 0.08);
            const opacity = isCenter ? 1 : Math.max(0.4, 0.9 - Math.abs(diff) * 0.15);
            const zIndex = 50 - Math.abs(diff) * 8;

            return (
              <motion.div
                key={evt.uniqueId}
                onClick={() => onSelectEvent(evt)}
                animate={{
                  x: translateX,
                  z: translateZ,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ zIndex }}
                className={`absolute w-[220px] sm:w-[280px] h-[340px] sm:h-[440px] rounded-3xl overflow-hidden bg-zinc-950 border-2 transition-colors cursor-pointer group shadow-[0_20px_50px_rgba(0,0,0,0.9)] ${
                  isCenter
                    ? "border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/30"
                    : "border-white/20 hover:border-blue-400"
                }`}
              >
                {/* Poster Image */}
                <Image
                  src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                  alt={evt.title}
                  fill
                  priority={isCenter}
                  className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-110"
                  sizes="320px"
                />

                {/* Ambient Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                {/* Floating Glassmorphic Info Overlay (Matching Screenshot 1) */}
                <div className="absolute bottom-4 inset-x-3 p-3 rounded-2xl bg-zinc-950/85 border border-white/20 backdrop-blur-xl flex items-center justify-between shadow-2xl z-20">
                  <div className="flex-1 pr-2">
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight line-clamp-1">
                      {evt.title}
                    </h3>
                    <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">
                      Relice: {evt.dateLabel || "25 JUL"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer"
                    >
                      Receive
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

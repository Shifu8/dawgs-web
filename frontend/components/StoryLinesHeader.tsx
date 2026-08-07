"use client";

import React from "react";
import { motion } from "framer-motion";

export interface StoryScreen {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface StoryLinesHeaderProps {
  screens: StoryScreen[];
  activeScreen: number;
  onSelectScreen: (index: number) => void;
}

export default function StoryLinesHeader({
  screens,
  activeScreen,
  onSelectScreen,
}: StoryLinesHeaderProps) {
  return (
    <div className="w-full flex flex-col items-center select-none z-30">
      {/* ─── TOP STORIES-STYLE PROGRESS SEGMENT LINES (Directly floating on top of photo) ─── */}
      <div className="w-full flex items-center justify-between gap-1.5 py-0.5">
        {screens.map((screen, idx) => {
          const isActive = idx === activeScreen;
          const isPassed = idx < activeScreen;

          return (
            <button
              key={`story-line-${screen.id}`}
              type="button"
              onClick={() => onSelectScreen(idx)}
              aria-label={`Ir a pantalla ${screen.label}`}
              className="flex-1 py-1.5 group cursor-pointer focus:outline-none"
            >
              {/* Line Bar Container with Drop Shadow */}
              <div className="relative h-1.5 w-full rounded-full bg-white/25 backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:bg-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                <motion.div
                  initial={false}
                  animate={{
                    width: isActive ? "100%" : isPassed ? "100%" : "0%",
                    opacity: isActive ? 1 : isPassed ? 0.7 : 0,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    isActive
                      ? "bg-white shadow-[0_0_12px_rgba(255,255,255,1)]"
                      : "bg-white/80"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

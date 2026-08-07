/**
 * Autor: Brandon Medina
 * Fecha: 18/05/2026
 * Descripcion: Floating dock mobile glassmorphism con navegacion tipo app premium.
 */

"use client";

import { Home, Heart, Ticket, Compass } from "lucide-react";
import { motion } from "framer-motion";

export type MobileTabId = "inicio" | "favoritos" | "reservas" | "explorar";

type DockItem = {
  id: MobileTabId;
  label: string;
  icon: typeof Home;
};

const items: DockItem[] = [
  { id: "inicio", label: "Home", icon: Home },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "reservas", label: "Mis Reservas", icon: Ticket },
  { id: "explorar", label: "Explorar", icon: Compass },
];

type MobileDockProps = {
  activeTab?: string;
  onTabChange?: (tab: MobileTabId) => void;
  onSearchClick?: () => void;
};

export default function MobileDock({ activeTab = "inicio", onTabChange }: MobileDockProps) {
  return (
    <nav className="fixed inset-x-3 bottom-4 z-[70] mx-auto max-w-md rounded-full border border-white/15 bg-zinc-950/85 px-3 py-2 shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:hidden">
      <div className="flex items-center justify-around">
        {items.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              onClick={() => onTabChange?.(id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all duration-200 cursor-pointer ${
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
              aria-label={label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMobileCapsule"
                  className="absolute inset-0 bg-purple-600/30 border border-purple-400/40 rounded-full backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? "text-white" : "stroke-2"}`} />
              <span className={`text-[9px] font-bold mt-0.5 relative z-10 ${isActive ? "text-white" : "text-zinc-400"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

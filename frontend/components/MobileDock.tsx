/**
 * Autor: Brandon Medina
 * Fecha: 18/05/2026
 * Descripcion: Floating dock mobile glassmorphism con navegacion tipo app premium.
 */

"use client";

import { Home, Heart, Ticket, Compass } from "lucide-react";

export type MobileTabId = "inicio" | "favoritos" | "reservas" | "explorar";

type MobileDockProps = {
  activeTab?: string;
  onTabChange?: (tab: MobileTabId) => void;
  onSearchClick?: () => void;
};

export default function MobileDock({ activeTab = "inicio", onTabChange }: MobileDockProps) {
  // Mobile dock navbar removed per user request
  return null;
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, X } from "lucide-react";

const COOKIE_STORAGE_KEY = "4go_cookie_consent_v1";

export default function MobileCookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState<"banner" | "settings">("banner");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Cookie Categories State
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true & locked
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if user has already made a cookie choice
    const savedConsent = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!savedConsent) {
      // Delay slightly for smooth entering animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(fullConsent));
    setIsVisible(false);
  };

  const handleDenyNonEssential = () => {
    const minConsent = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(minConsent));
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(preferences));
    setIsVisible(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[700] md:hidden pointer-events-none flex flex-col justify-end">
        {/* Backdrop overlay only when in full settings modal view */}
        {view === "settings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setView("banner")}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto z-[705]"
          />
        )}

        {/* ─── PHOTO 1: INITIAL COOKIE BANNER (BOTTOM SHEET) ─── */}
        {view === "banner" && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-[710] pointer-events-auto w-full bg-white text-zinc-900 rounded-t-[32px] p-6 sm:p-7 shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-zinc-200 font-sans text-left space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Handle Drag Bar */}
            <div className="w-12 h-1.5 bg-zinc-300 rounded-full mx-auto mb-1" />

            {/* Title */}
            <h3 className="text-lg sm:text-xl font-extrabold text-zinc-950 tracking-tight">
              Sobre las cookies en este sitio web
            </h3>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed">
              Usamos cookies para recolectar y analizar información relacionada con el uso y desempeño de nuestro sitio web para poder proveer funcionalidades relacionadas con las redes sociales, y para mejorar y personalizar adecuadamente el contenido y publicidad en nuestro sitio web.{" "}
              <button
                type="button"
                onClick={() => setView("settings")}
                className="font-bold text-zinc-900 underline underline-offset-2 hover:text-black cursor-pointer"
              >
                Más información
              </button>
            </p>

            {/* Actions Stack */}
            <div className="pt-2 space-y-2.5">
              {/* Primary Black Button */}
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-zinc-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg cursor-pointer text-center"
              >
                Permitir todas las cookies
              </button>

              {/* Secondary Dark Gray Button */}
              <button
                type="button"
                onClick={() => setView("settings")}
                className="w-full py-3.5 px-6 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer text-center"
              >
                Configuración de cookies
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── PHOTO 2: COOKIES CONFIGURATION EXPANDED SHEET ─── */}
        {view === "settings" && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="relative z-[710] pointer-events-auto w-full bg-white text-zinc-900 rounded-t-[32px] p-6 sm:p-7 shadow-[0_-25px_70px_rgba(0,0,0,0.6)] border-t border-zinc-200 font-sans text-left space-y-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Header & Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-extrabold text-zinc-950 tracking-tight">
                  Sobre las cookies en este sitio web
                </h3>
                <button
                  type="button"
                  onClick={() => setView("banner")}
                  className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Navigation (Exact Match to Photo 2) */}
              <div className="border-b border-zinc-200 flex gap-6">
                <div className="pb-2 border-b-2 border-zinc-950 font-bold text-xs sm:text-sm text-zinc-950">
                  Categorías
                </div>
              </div>
            </div>

            {/* Explanation paragraph */}
            <p className="text-xs text-zinc-600 font-normal leading-relaxed">
              Las cookies utilizadas en este sitio web están categorizadas, y más adelante usted podrá leer sobre cada categoría y así habilitar o bloquear algunas o todas las respectivas cookies. Cuando se deshabilitan categorías que previamente estaban habilitadas, todas las cookies asignadas a esa categoría serán eliminadas de su navegador web. Adicionalmente, usted podrá ver una lista de cookies asignadas a cada categoría, e información detallada al respecto, en la declaración de cookies.{" "}
              <Link href="/cookie_settings" className="font-bold text-zinc-900 underline underline-offset-2">
                Más información
              </Link>
            </p>

            {/* Quick Batch Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="w-full py-3.5 px-6 rounded-full bg-zinc-800 hover:bg-zinc-900 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm cursor-pointer text-center"
              >
                Permitir todas las cookies
              </button>

              <button
                type="button"
                onClick={handleDenyNonEssential}
                className="w-full py-3.5 px-6 rounded-full bg-zinc-800 hover:bg-zinc-900 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-sm cursor-pointer text-center"
              >
                Denegar todo
              </button>
            </div>

            {/* Categories with switches (Photo 2 Styling) */}
            <div className="space-y-5 pt-3 border-t border-zinc-100">
              {/* 1. Cookies Estrictamente Necesarias */}
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3">
                  {/* Locked Active iOS Switch */}
                  <div className="w-12 h-6.5 rounded-full bg-zinc-950 p-0.5 flex items-center justify-end shrink-0 opacity-90 cursor-not-allowed">
                    <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-zinc-950">
                    Cookies estrictamente necesarias
                  </h4>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed pl-1">
                  Estas son cookies que se requieren para el funcionamiento de nuestra web. Incluyen, por ejemplo, cookies que le permiten acceder a áreas seguras de nuestra web, utilizar la cesta de la compra o utilizar servicios de facturación electrónica.
                </p>

                {/* Sub-providers accordion items */}
                <div className="space-y-1.5 pt-1 pl-1 text-xs text-zinc-700 font-bold">
                  <div
                    onClick={() => toggleSection("cookiehub")}
                    className="flex items-center gap-2 cursor-pointer select-none py-1 hover:text-black"
                  >
                    {expandedSections["cookiehub"] ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>4GO Security & Auth</span>
                  </div>
                  {expandedSections["cookiehub"] && (
                    <div className="pl-6 text-[11px] text-zinc-500 font-normal pb-1">
                      Gestiona la autenticación segura, tokens de sesión y prevención de ataques CSRF.
                    </div>
                  )}

                  <div
                    onClick={() => toggleSection("stripe")}
                    className="flex items-center gap-2 cursor-pointer select-none py-1 hover:text-black"
                  >
                    {expandedSections["stripe"] ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>Pasarela de Pago & Bancos</span>
                  </div>
                  {expandedSections["stripe"] && (
                    <div className="pl-6 text-[11px] text-zinc-500 font-normal pb-1">
                      Procesa transferencias bancarias y reservas de entradas de forma encriptada.
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Cookies Analíticas */}
              <div className="space-y-2 text-left pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        analytics: !prev.analytics,
                      }))
                    }
                    className={`w-12 h-6.5 rounded-full p-0.5 flex items-center transition-colors shrink-0 cursor-pointer ${
                      preferences.analytics ? "bg-zinc-950 justify-end" : "bg-zinc-300 justify-start"
                    }`}
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md transition-all" />
                  </button>
                  <h4 className="text-xs sm:text-sm font-black text-zinc-950">
                    Cookies analíticas y de rendimiento
                  </h4>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed pl-1">
                  Nos permiten reconocer y contar el número de visitantes y ver cómo se mueven los usuarios por nuestra web cuando la utilizan. Esto nos ayuda a mejorar el funcionamiento de los eventos y la rapidez del sistema.
                </p>
              </div>

              {/* 3. Cookies de Personalización & Marketing */}
              <div className="space-y-2 text-left pt-2 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        marketing: !prev.marketing,
                      }))
                    }
                    className={`w-12 h-6.5 rounded-full p-0.5 flex items-center transition-colors shrink-0 cursor-pointer ${
                      preferences.marketing ? "bg-zinc-950 justify-end" : "bg-zinc-300 justify-start"
                    }`}
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-white shadow-md transition-all" />
                  </button>
                  <h4 className="text-xs sm:text-sm font-black text-zinc-950">
                    Cookies de personalización
                  </h4>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed pl-1">
                  Se utilizan para registrar sus visitas a nuestro sitio web, las entradas consultadas y las discotecas seguidas para ofrecerle recomendaciones relevantes.
                </p>
              </div>
            </div>

            {/* Final Save Button */}
            <div className="pt-4 pb-2">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="w-full py-4 px-6 rounded-full bg-black hover:bg-zinc-800 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xl cursor-pointer text-center"
              >
                Guardar configuración
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

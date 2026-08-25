"use client";

import React, { useState } from "react";
import LegalLayout from "@/components/LegalLayout";
import { Check, Shield, Cookie, ToggleLeft, ToggleRight } from "lucide-react";

export default function CookieSettingsPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always active
    functional: true,
    analytics: true,
    marketing: false,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookie_preferences_4go", JSON.stringify(preferences));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <LegalLayout
      title="Configuración de Cookies"
      subtitle="Administra tus preferencias de cookies y privacidad en 4GO."
      activeTab="cookies"
    >
      <div className="space-y-6 text-sm sm:text-base">
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
          Última actualización: <span className="font-semibold text-zinc-900">25 de Agosto de 2026</span>
        </div>

        <p className="text-zinc-700 leading-relaxed">
          Las cookies son pequeños archivos de texto que se guardan en tu dispositivo para recordar tus preferencias, mantener activa tu sesión segura de usuario y optimizar la velocidad de navegación en nuestra plataforma.
        </p>

        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tus preferencias de cookies se han guardado exitosamente.</span>
          </div>
        )}

        {/* Cookie Categories Toggles */}
        <div className="space-y-4 pt-4">
          {/* Category 1: Essential */}
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-zinc-900">Cookies Estrictamente Necesarias</h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Requeridas para el funcionamiento básico del sitio, autenticación de sesión con Google y generación de pases de seguridad. No se pueden desactivar.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-200 text-zinc-700 text-xs font-bold shrink-0">
              Siempre Activas
            </span>
          </div>

          {/* Category 2: Functional */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 flex items-start justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-black" />
                <h3 className="text-base font-bold text-zinc-900">Cookies de Funcionalidad y Preferencias</h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Permiten recordar tus selecciones como el tema visual, la ciudad de preferencia y filtros de búsqueda de eventos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreferences((p) => ({ ...p, functional: !p.functional }))}
              className="text-black cursor-pointer shrink-0"
            >
              {preferences.functional ? (
                <ToggleRight className="w-9 h-9 text-black" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-zinc-400" />
              )}
            </button>
          </div>

          {/* Category 3: Analytics */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 flex items-start justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-black" />
                <h3 className="text-base font-bold text-zinc-900">Cookies Analíticas</h3>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Nos ayudan a comprender de manera anónima cómo interactúan los visitantes con las páginas para mejorar el rendimiento del sistema.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreferences((p) => ({ ...p, analytics: !p.analytics }))}
              className="text-black cursor-pointer shrink-0"
            >
              {preferences.analytics ? (
                <ToggleRight className="w-9 h-9 text-black" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer"
          >
            Guardar Preferencias
          </button>
        </div>
      </div>
    </LegalLayout>
  );
}

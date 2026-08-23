"use client";

import React from "react";
import Image from "next/image";
import {
  Globe,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] text-white border-t border-white/10 mt-16 sm:mt-24 pt-16 sm:pt-20 pb-20 px-4 sm:px-8 relative z-20 overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-[1400px] mx-auto space-y-16 relative z-10">
        {/* ─── TOP SECTION: NAVIGATION COLUMNS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start lg:items-center">
          {/* Left Column: Logo + Description (Vertically Centered & Larger) */}
          <div className="lg:col-span-5 lg:self-center flex items-center gap-5 sm:gap-6 h-full">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0">
              <Image
                src="/images/alien_green_hands_official.png"
                alt="4GO Logo"
                fill
                className="object-contain rounded-2xl"
              />
            </div>
            <p className="text-sm sm:text-base text-zinc-300 font-medium max-w-md leading-relaxed">
              Descubre los mejores eventos, conciertos y experiencias en Ecuador. Entradas oficiales y acceso instantáneo desde tu dispositivo.
            </p>
          </div>

          {/* Right Columns: Links (Nuestra empresa, Fan Support, Recursos - Larger Text) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 pt-2">
            {/* Column 1 */}
            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-black uppercase tracking-widest text-zinc-200">
                Nuestra empresa
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <li>
                  <a href="#explore" className="hover:text-white transition-colors">
                    Sobre 4GO
                  </a>
                </li>
                <li>
                  <a href="/organizer/register" className="hover:text-white transition-colors">
                    Trabaja con nosotrxs
                  </a>
                </li>
                <li>
                  <a href="#explore" className="hover:text-white transition-colors">
                    Diversidad, Equidad e Inclusión
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-black uppercase tracking-widest text-zinc-200">
                Fan Support
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
                      }
                    }}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Recibir ayuda
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
                      }
                    }}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    Preguntas frecuentes
                  </button>
                </li>
                <li>
                  <a href="https://wa.me/593999999999" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    Solicitar un reembolso
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <h4 className="text-sm sm:text-base font-black uppercase tracking-widest text-zinc-200">
                Recursos
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 font-medium">
                <li>
                  <a href="#explore" className="hover:text-white transition-colors">
                    Artistas
                  </a>
                </li>
                <li>
                  <a href="#explore" className="hover:text-white transition-colors">
                    Salas & Venues
                  </a>
                </li>
                <li>
                  <a href="#explore" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#explore" className="hover:text-white transition-colors">
                    Prensa
                  </a>
                </li>
                <li>
                  <a href="/organizer/login" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                    Partners <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── MIDDLE DIVIDER & SUB-FOOTER ROW (CENTERED & LARGER) ─── */}
        <div className="border-t border-white/10 pt-10 space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-xs sm:text-sm text-zinc-300 font-medium">
            {/* Left: Copyright & Language */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-zinc-300 font-semibold text-xs sm:text-sm">
                © {new Date().getFullYear()} 4GO Events Ltd.
              </span>
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-white/15 text-zinc-200 hover:text-white hover:border-white/30 transition cursor-pointer text-xs sm:text-sm font-semibold"
              >
                <Globe className="w-4 h-4 text-zinc-300" />
                <span>Español</span>
              </button>
            </div>

            {/* Middle: Legal / Policy Links & Social Icons (CENTERED) */}
            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 text-zinc-300 text-xs sm:text-sm">
              <a href="#privacy" className="hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Términos y Condiciones
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Condiciones de Compra
              </a>
              <a href="#cookies" className="hover:text-white transition-colors">
                Configuración de cookies
              </a>

              {/* Instagram & TikTok Icons directly next to cookies */}
              <div className="flex items-center gap-3.5 text-zinc-300 shrink-0 ml-1">
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="Instagram">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="TikTok">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525 0h3.08c.12 1.05.7 2.05 1.6 2.7 1.1.8 2.4 1.2 3.8 1.2v3.1c-1.4 0-2.8-.4-4-1.1v8.5c0 4.7-3.8 8.5-8.5 8.5S0 19.1 0 14.4c0-4.7 3.8-8.5 8.5-8.5 1 0 2 .2 2.9.5v3.3c-.9-.5-1.9-.8-2.9-.8-2.9 0-5.3 2.4-5.3 5.3s2.4 5.3 5.3 5.3 5.3-2.4 5.3-5.3V0z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 text-center lg:text-left font-medium">
            4GO y el logo de 4GO son marcas registradas de 4GO Events Ltd. Todos los derechos reservados.
          </p>
        </div>

        {/* ─── ABSOLUTE BOTTOM BRANDING: DESARROLLADO POR DevEc SOFTWARE DEVELOPMENT ─── */}
        <div className="border-t border-white/10 pt-12 pb-4 flex flex-col items-center justify-center space-y-3 select-none">
          <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.35em] text-zinc-400">
            DESARROLLADO POR
          </span>

          {/* DevEc Logo with Flag Wave (Yellow, Blue, Red) */}
          <div className="flex flex-col items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-105">
            <svg
              className="h-11 sm:h-14 w-auto filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              viewBox="0 0 220 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Text DevEc */}
              <text
                x="10"
                y="36"
                fill="#ffffff"
                fontSize="34"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.03em"
              >
                Dev
              </text>
              <text
                x="76"
                y="36"
                fill="#ffffff"
                fontSize="34"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.03em"
              >
                E
              </text>
              <text
                x="98"
                y="36"
                fill="#ffffff"
                fontSize="34"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.03em"
              >
                c
              </text>

              {/* Curved Waving Flag Stripes (Yellow, Blue, Red) */}
              <path
                d="M120 20 C135 20, 142 10, 162 10 C182 10, 190 18, 205 15"
                stroke="#FFDD00"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M120 26 C135 26, 142 16, 162 16 C182 16, 190 24, 205 21"
                stroke="#0033A0"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M120 32 C135 32, 142 22, 162 22 C182 22, 190 30, 205 27"
                stroke="#D52B1E"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.4em] text-zinc-400">
            SOFTWARE DEVELOPMENT
          </span>
        </div>
      </div>
    </footer>
  );
}

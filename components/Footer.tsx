"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Globe,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] text-white border-t border-white/10 mt-16 sm:mt-24 pt-16 sm:pt-20 pb-20 px-4 sm:px-8 relative z-20 overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-[1400px] mx-auto space-y-16 relative z-10">
        {/* ─── TOP SECTION: NAVIGATION COLUMNS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-start lg:items-center">
          {/* Left Column: Logo + Description (Vertically Centered) */}
          <div className="lg:col-span-4 lg:self-center flex items-center gap-4 h-full">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <Image
                src="/images/4go_alien_hands_logo.png"
                alt="4GO Logo"
                fill
                className="object-contain filter drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] rounded-xl"
              />
            </div>
            <p className="text-xs text-zinc-400 font-medium max-w-sm leading-relaxed">
              Descubre los mejores eventos, conciertos y experiencias en Ecuador. Entradas oficiales y acceso instantáneo desde tu dispositivo.
            </p>
          </div>

          {/* Right Columns: Links (Nuestra empresa, Fan Support, Recursos) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 pt-2">
            {/* Column 1 */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">
                Nuestra empresa
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
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
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">
                Fan Support
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
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
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">
                Recursos
              </h4>
              <ul className="space-y-2.5 text-xs text-zinc-400 font-medium">
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
                  <a href="/organizer/login" className="hover:text-white transition-colors inline-flex items-center gap-1">
                    Partners <ExternalLink className="w-3 h-3 text-zinc-500" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── MIDDLE DIVIDER & SUB-FOOTER ROW ─── */}
        <div className="border-t border-white/10 pt-8 space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-zinc-400 font-medium">
            {/* Left: Copyright & Language */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-zinc-400 font-semibold">
                © {new Date().getFullYear()} 4GO Events Ltd.
              </span>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Español</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>
            </div>

            {/* Middle: Legal / Policy Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-zinc-400">
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
            </div>

            {/* Right: Social Media Icons */}
            <div className="flex items-center gap-4 text-zinc-400">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* TikTok */}
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V5.8a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 12a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.86z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-1" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center lg:text-left font-medium">
            4GO y el logo de 4GO son marcas registradas de 4GO Events Ltd. Todos los derechos reservados.
          </p>
        </div>

        {/* ─── ABSOLUTE BOTTOM BRANDING: DESARROLLADO POR DevEc SOFTWARE DEVELOPMENT ─── */}
        <div className="border-t border-white/10 pt-12 pb-4 flex flex-col items-center justify-center space-y-3 select-none">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.35em] text-zinc-400">
            DESARROLLADO POR
          </span>

          {/* DevEc Logo with Flag Wave (Yellow, Blue, Red) */}
          <div className="flex flex-col items-center justify-center group cursor-pointer transition-transform duration-300 hover:scale-105">
            <svg
              className="h-10 sm:h-12 w-auto filter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
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

          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">
            SOFTWARE DEVELOPMENT
          </span>
        </div>
      </div>
    </footer>
  );
}

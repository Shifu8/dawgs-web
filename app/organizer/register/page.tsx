"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import OrganizerPublishScreen from "@/frontend/features/organizer/OrganizerPublishScreen";

export default function OrganizerRegisterPage() {
  const router = useRouter();

  const goHomeInstantly = () => {
    try {
      sessionStorage.setItem("skip_stormgo_loader", "true");
    } catch (e) {}
    router.push("/?skipLoader=1");
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#c2d902] selection:text-black font-sans overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/15 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        {/* Brand Logo & Home Navigation */}
        <button
          onClick={goHomeInstantly}
          className="group flex items-center gap-3 outline-none hover:scale-105 transition-all duration-300 cursor-pointer select-none"
          aria-label="Volver al Home"
        >
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-full h-full select-none drop-shadow-md" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ultra-Clean HD 4 Mascot with Sunglasses & Streetwear Sneakers */}
              <path d="M 38 82 L 28 98 C 24 104, 12 108, 10 114 C 8 120, 20 124, 34 122 C 44 120, 48 110, 44 98 L 48 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M 12 114 C 18 108, 30 108, 40 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
              <path d="M 82 82 L 90 98 C 94 104, 106 108, 108 114 C 110 120, 98 124, 84 122 C 74 120, 70 110, 74 98 L 72 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M 108 114 C 102 108, 90 108, 80 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
              <path d="M 64 12 L 22 64 L 22 76 L 70 76 L 70 94 L 88 94 L 88 76 L 102 76 L 102 58 L 88 58 L 88 12 Z" fill="#ffffff" stroke="#111111" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M 70 28 L 70 58 L 46 58 Z" fill="#111111" stroke="#111111" strokeWidth="2" strokeLinejoin="round" />
              <path d="M 30 36 L 46 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
              <path d="M 66 31 L 82 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
              <path d="M 18 44 C 18 44, 46 38, 52 47 C 58 38, 86 44, 86 44 L 80 60 C 80 60, 58 64, 52 57 C 46 64, 24 60, 24 60 Z" fill="#111111" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
              <line x1="28" y1="47" x2="40" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <line x1="60" y1="47" x2="72" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-sm font-black uppercase tracking-tight text-white leading-none group-hover:text-[#c2d902] transition-colors">
              4<span className="text-[#c2d902]">go</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/70 leading-none mt-0.5 flex items-center gap-1">
              <ArrowLeft className="w-2.5 h-2.5" /> Home
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#c2d902] text-black text-[9px] font-black uppercase tracking-wider shadow-sm">
            ORGANIZADORES
          </span>
          <button
            onClick={() => router.push("/organizer/login")}
            className="px-4 py-1.5 rounded-full border border-white/40 bg-white/10 text-xs font-black uppercase tracking-wider text-white hover:bg-white hover:text-black transition cursor-pointer shadow-md"
          >
            Iniciar Sesión
          </button>
        </div>
      </header>

      {/* Main SaaS Screen */}
      <main className="py-0">
        <OrganizerPublishScreen />
      </main>

      {/* Modern Footer Section */}
      <footer className="relative z-10 border-t border-white/15 bg-black/60 py-10 px-4 text-center space-y-4">
        <span className="text-xl font-black uppercase tracking-tighter text-white block">
          4<span className="text-[#c2d902]">go</span>
        </span>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-bold">
          <button
            onClick={goHomeInstantly}
            className="hover:text-white transition cursor-pointer"
          >
            Home
          </button>
          <a
            href="https://wa.me/593988831372"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition cursor-pointer"
          >
            Soporte al cliente
          </a>
          <a
            href="https://wa.me/593988831372"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition cursor-pointer"
          >
            Preguntas frecuentes
          </a>
          <button
            onClick={() => router.push("/")}
            className="hover:text-white transition cursor-pointer"
          >
            Términos y condiciones
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="https://wa.me/593988831372"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4 text-[#c2d902]" />
          </a>
        </div>
      </footer>
    </div>
  );
}

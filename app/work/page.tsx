"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full border-b border-zinc-200 py-5 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a 4GO</span>
        </Link>
        <Link href="/" className="relative w-10 h-10 shrink-0">
          <Image
            src="/images/alien_green_hands_white.jpg"
            alt="4GO Logo"
            fill
            className="object-contain rounded-xl"
          />
        </Link>
      </header>

      {/* Main Content Layout - Split Screen Hero Layout */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center border-b border-zinc-200 pb-12">
          {/* Left Text Block */}
          <div className="md:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
              TRABAJA CON NOSOTRXS
            </h1>
            <p className="text-base sm:text-xl text-zinc-700 font-medium leading-relaxed">
              Únete a la plataforma de entretenimiento líder en Ecuador. Conecta tus eventos, festivales o talento profesional con miles de asistentes.
            </p>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
              Trabajamos con productores, clubes, fotógrafos, diseñadores y personal de puerta que buscan elevar el estándar de las experiencias nocturnas.
            </p>
          </div>

          {/* Right Image Feature - 3D Cellphones Artwork */}
          <div className="md:col-span-5 relative aspect-square rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-950 shadow-xl">
            <Image
              src="/images/now4go-hero-presentation-hd-v3.png"
              alt="4GO 3D Celulares Arte"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Roles Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Para Creadores</span>
            <h3 className="text-xl font-black text-zinc-950">Organizadores & Escenarios</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Publica tus conciertos o fiestas en 4GO. Accede a herramientas de venta, control de aforo por escáner QR y liquidación transparente.
            </p>
            <div className="pt-2">
              <a href="mailto:organizadores@4go.ec" className="inline-block px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition">
                organizadores@4go.ec
              </a>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Para Talento</span>
            <h3 className="text-xl font-black text-zinc-950">Staff & Colaboradores</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Si eres fotógrafo, diseñador gráfico, DJ o personal operativo de eventos, envíanos tu información y portafolio.
            </p>
            <div className="pt-2">
              <a href="mailto:empleo@4go.ec" className="inline-block px-5 py-2.5 rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-300 transition">
                empleo@4go.ec
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

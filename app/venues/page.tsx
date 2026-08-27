"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function VenuesPage() {
  const venues = [
    { name: "CUBIC Club", city: "Loja", desc: "El centro neurálgico de la música electrónica y fiestas urbanas en Loja.", img: "/images/alien_green_hands_white.jpg" },
    { name: "Paradox", city: "Loja", desc: "Escenario principal de eventos en vivo, DJs y experiencias temáticas.", img: "/images/alien_green_hands_white.jpg" },
    { name: "Colegio de Ingenieros Civiles", city: "Loja", desc: "Espacio amplio para grandes conciertos y festivales al aire libre.", img: "/images/alien_green_hands_white.jpg" },
    { name: "Punnzara", city: "Loja", desc: "Venue campestre para eventos exclusivos y sunsets en Loja.", img: "/images/alien_green_hands_white.jpg" },
    { name: "SATA Club", city: "Loja", desc: "Club de alta potencia de sonido e iluminación para noches inolvidables.", img: "/images/alien_green_hands_white.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans flex flex-col justify-between">
      <header className="w-full border-b border-zinc-200 py-5 px-6 sm:px-12 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50">
        <Link href="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-700 hover:text-black transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la cartelera</span>
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

      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            LUGARES Y LOCALES
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Directorio de discotecas, escenarios y locales aliados con pases oficiales en 4GO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-200 pt-12">
          {venues.map((v, idx) => (
            <div key={`venue-${idx}`} className="border border-zinc-200 rounded-3xl p-6 space-y-4 bg-zinc-50 hover:border-zinc-400 transition">
              {/* Photo Frame Container */}
              <div className="w-full aspect-video relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-200">
                <Image
                  src={v.img}
                  alt={v.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-zinc-950">{v.name}</h3>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{v.city}</span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

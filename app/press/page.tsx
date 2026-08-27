"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function PressPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-16 sm:py-24 space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            PRENSA Y MEDIOS
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 font-medium">
            Recursos gráficos, notas de prensa y solicitudes de acreditación periodística para eventos 4GO.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4 text-left max-w-md mx-auto">
          <h2 className="text-base font-black uppercase tracking-wider text-zinc-950">Contacto de Prensa</h2>
          <div className="text-sm text-zinc-700 font-medium space-y-1">
            <p>Correo de Prensa: <a href="mailto:prensa@4go.ec" className="font-bold underline text-zinc-950">prensa@4go.ec</a></p>
            <p>WhatsApp Prensa: +593 99 999 9999</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
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
            src="/images/logo_4go_black_white.png"
            alt="4GO Logo"
            fill
            className="object-contain rounded-xl"
          />
        </Link>
      </header>

      {/* Main Content Layout - Bespoke Editorial */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        {/* Direct Bold Title */}
        <div className="space-y-4 text-left border-b border-zinc-200 pb-8">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            SOBRE 4GO
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-700 font-medium leading-relaxed">
            La plataforma de descubrimiento y reserva instantánea de experiencias nocturnas, conciertos y festivales en Ecuador.
          </p>
        </div>

        {/* Prominent Hero Showcase: Alien Green Hands Artwork */}
        <div className="w-full aspect-[21/10] sm:aspect-[16/7] relative rounded-3xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
          <Image
            src="/images/logo_4go_black_white.png"
            alt="Arte 4GO Manos Verdes"
            fill
            className="object-contain p-4"
          />
        </div>

        {/* Narrative Section */}
        <div className="space-y-6 text-base sm:text-xl text-zinc-800 leading-relaxed font-normal">
          <p>
            4GO nace de la pasión por la música en vivo y el deseo de transformar la manera en que los fans descubren y asisten a eventos nocturnos. Creemos que acceder a un concierto, festival o fiesta debe ser un proceso simple, seguro y libre de barreras.
          </p>
          <p>
            Nos enfocamos en conectar directamente a la comunidad de asistentes con los escenarios y clubes más representativos de Loja y Ecuador. A través de tecnología de acceso por código QR cifrado, garantizamos reservas instantáneas y eliminamos por completo la reventa de entradas a sobreprecio.
          </p>
        </div>

        {/* Bespoke 2-Column Feature Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-200 pt-12 text-left">
          <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-3">
            <h3 className="text-base font-black uppercase tracking-wider text-zinc-950">Nuestra Misión</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Empoderar a los amantes de la música con una plataforma de reservas inmediata, transparente e inclusiva que respalde el crecimiento de los escenarios locales.
            </p>
          </div>
          <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-3">
            <h3 className="text-base font-black uppercase tracking-wider text-zinc-950">La Experiencia 4GO</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Desde tu teléfono móvil puedes explorar carteleras actualizadas, guardar tus eventos favoritos y asegurar tus pases digitales sin necesidad de imprimir papel.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


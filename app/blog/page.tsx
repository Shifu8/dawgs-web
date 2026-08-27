"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function BlogPage() {
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

      {/* Main Magazine Layout */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="space-y-4 text-left border-b border-zinc-200 pb-8">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            BLOG
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-700 font-medium leading-relaxed">
            Noticias, tendencias y artículos sobre la escena musical y eventos en Ecuador.
          </p>
        </div>

        {/* Featured Main Article Hero */}
        <article className="border border-zinc-200 rounded-3xl p-6 sm:p-8 bg-zinc-50 space-y-6 text-left">
          <div className="w-full aspect-[21/9] relative rounded-2xl overflow-hidden bg-zinc-950">
            <Image
              src="/images/alien_green_hands_white.jpg"
              alt="Portada Blog 4GO"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Destacado del Mes</span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950">Guía Nocturna: Las fiestas y sets confirmados en Loja</h2>
            <p className="text-base text-zinc-600 leading-relaxed font-normal">
              Revisamos la agenda musical del fin de semana en CUBIC, Paradox, Colegio de Ingenieros Civiles, Punnzara y SATA.
            </p>
          </div>
        </article>

        {/* Secondary Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <article className="border border-zinc-200 rounded-3xl p-6 bg-zinc-50 space-y-4">
            <div className="w-full aspect-video relative rounded-2xl overflow-hidden bg-zinc-950">
              <Image
                src="/images/now4go-hero-presentation-hd-v3.png"
                alt="Tecnología 4GO"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Tecnología</span>
              <h3 className="text-xl font-black text-zinc-950">Pases Digitales con QR Dinámico</h3>
              <p className="text-sm text-zinc-600 font-normal">
                Cómo la tecnología de cifrado en puerta garantiza entradas legítimas sin comisiones infladas.
              </p>
            </div>
          </article>

          <article className="border border-zinc-200 rounded-3xl p-6 bg-zinc-50 space-y-4">
            <div className="w-full aspect-video relative rounded-2xl overflow-hidden bg-zinc-950">
              <Image
                src="/images/alien_green_hands_white.jpg"
                alt="Comunidad 4GO"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Cultura</span>
              <h3 className="text-xl font-black text-zinc-950">El Crecimiento de la Escena Independiente</h3>
              <p className="text-sm text-zinc-600 font-normal">
                Entrevistas con colectivos locales y DJs que están transformando la vida nocturna en Ecuador.
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}

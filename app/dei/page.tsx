"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function DeiPage() {
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

      {/* Main Content Layout - Quote & Statement Layout */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="space-y-4 text-left border-b border-zinc-200 pb-8">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            DIVERSIDAD, EQUIDAD E INCLUSIÓN
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-700 font-medium leading-relaxed">
            Construyendo espacios nocturnos seguros, diversos e inclusivos para todas las personas.
          </p>
        </div>

        {/* Centered Quote Statement */}
        <div className="p-8 sm:p-12 rounded-3xl bg-zinc-50 border border-zinc-200 text-center space-y-4">
          <blockquote className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 italic leading-snug">
            “La pista de baile es el lugar donde las personas de todos los orígenes e identidades se reúnen para celebrar la música en absoluta libertad.”
          </blockquote>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Manifiesto 4GO</p>
        </div>

        {/* Full-width Banner Image Container */}
        <div className="w-full aspect-[21/9] relative rounded-3xl overflow-hidden border border-zinc-200 bg-zinc-900 shadow-md">
          <Image
            src="/images/now4go-hero-presentation-hd-v3.png"
            alt="Inclusión y Comunidad 4GO"
            fill
            className="object-cover"
          />
        </div>

        {/* 2 Commitments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left border-t border-zinc-200 pt-12">
          <div className="space-y-3">
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-950">Espacios Libres de Discriminación</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Exigimos a todas las discotecas y recintos aliados protocolos estrictos de respeto y cero tolerancia ante cualquier acto de acoso o discriminación.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-black uppercase tracking-wider text-zinc-950">Apoyo al Talento Emergente</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Fomentamos la participación activa de colectivos culturales independientes y DJs emergentes para enriquecer la escena nocturna ecuatoriana.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

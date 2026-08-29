"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function PartnersPage() {
  const sponsors = [
    { name: "CUBIC Club", type: "Venue Aliado", logo: "/images/logo_4go_black_white.png" },
    { name: "Paradox", type: "Venue Aliado", logo: "/images/logo_4go_black_white.png" },
    { name: "Colegio de Ingenieros Civiles", type: "Escenario Oficial", logo: "/images/logo_4go_black_white.png" },
    { name: "Punnzara", type: "Venue Campestre", logo: "/images/logo_4go_black_white.png" },
    { name: "SATA Club", type: "Venue Aliado", logo: "/images/logo_4go_black_white.png" },
    { name: "Patrocinador Oficial", type: "Marca Aliada", logo: null },
    { name: "Patrocinador Oficial", type: "Marca Aliada", logo: null },
    { name: "Patrocinador Oficial", type: "Marca Aliada", logo: null },
  ];

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

      {/* Main Logo Wall Layout */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="space-y-4 text-left border-b border-zinc-200 pb-8">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            PARTNERS
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-700 font-medium leading-relaxed">
            Las marcas, patrocinadores y escenarios aliados que hacen posibles las mejores experiencias en Ecuador.
          </p>
        </div>

        {/* Sponsor Grid Wall */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-center">
          {sponsors.map((s, idx) => (
            <div
              key={`sponsor-${idx}`}
              className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center space-y-3 min-h-[140px]"
            >
              {s.logo ? (
                <div className="relative w-14 h-14 shrink-0">
                  <Image
                    src={s.logo}
                    alt={s.name}
                    fill
                    className="object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-zinc-200 flex items-center justify-center text-xs font-black text-zinc-500 uppercase">
                  Logo
                </div>
              )}
              <div>
                <h3 className="text-sm font-black text-zinc-950">{s.name}</h3>
                <span className="text-xs text-zinc-500 font-medium">{s.type}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Partner Application Callout */}
        <div className="max-w-3xl mx-auto p-8 rounded-3xl border border-zinc-200 bg-zinc-950 text-white space-y-4 text-center">
          <h2 className="text-2xl font-black uppercase tracking-wide text-white">¿Quieres ser patrocinador de los eventos 4GO?</h2>
          <p className="text-sm text-zinc-300 leading-relaxed font-normal">
            Conecta tu marca con miles de jóvenes asistentes apasionados por la música en Ecuador.
          </p>
          <div className="pt-2">
            <a href="mailto:patrocinio@4go.ec" className="inline-block px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition">
              Contacto: patrocinio@4go.ec
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


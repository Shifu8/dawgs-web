"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

export default function HelpPage() {
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

      {/* Main Support Portal Layout */}
      <main className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-16">
        <div className="space-y-4 text-left border-b border-zinc-200 pb-8">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-zinc-950">
            RECIBIR AYUDA
          </h1>
          <p className="text-lg sm:text-2xl text-zinc-700 font-medium leading-relaxed">
            Estamos aquí para acompañarte a gestionar tus pases y resolver cualquier inquietud de ingreso.
          </p>
        </div>

        {/* Support Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Atención 24/7</span>
            <h3 className="text-xl font-black text-zinc-950">Soporte por Correo</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              Escríbenos para consultas sobre la reserva de tu pase, confirmación de cuenta o aclaraciones de pago.
            </p>
            <div className="pt-2">
              <a href="mailto:soporte@4go.ec" className="inline-block px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition">
                soporte@4go.ec
              </a>
            </div>
          </div>

          <div className="p-8 rounded-3xl border border-zinc-200 bg-zinc-50 space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Ingreso en Puerta</span>
            <h3 className="text-xl font-black text-zinc-950">Asistencia WhatsApp</h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-normal">
              ¿No encuentras el código QR de tu pase al ingresar al evento? Contacta de inmediato a nuestro equipo en puerta.
            </p>
            <div className="pt-2">
              <a href="https://wa.me/593999999999" target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2.5 rounded-xl bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-zinc-300 transition">
                WhatsApp: +593 99 999 9999
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}


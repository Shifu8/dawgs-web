"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, ArrowLeft, Shield, FileText, ShoppingCart, Cookie, Check } from "lucide-react";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  activeTab: "privacy" | "terms" | "purchase" | "cookies";
  children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, activeTab, children }: LegalLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    {
      id: "privacy",
      href: "/privacy_policy",
      label: "Política de Privacidad",
      icon: Shield,
    },
    {
      id: "terms",
      href: "/terms_and_conditions",
      label: "Términos y Condiciones",
      icon: FileText,
    },
    {
      id: "purchase",
      href: "/ticket_purchase_terms",
      label: "Condiciones de Compra",
      icon: ShoppingCart,
    },
    {
      id: "cookies",
      href: "/cookie_settings",
      label: "Configuración de Cookies",
      icon: Cookie,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
      {/* Top Header - White Theme Zendesk / DICE.FM Style */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg tracking-wider group-hover:scale-105 transition-transform">
                  4GO
                </div>
                <div className="border-l border-zinc-200 pl-4">
                  <span className="text-sm font-bold text-zinc-900 tracking-tight block">Centro Legal & Ayuda</span>
                  <span className="text-[11px] text-zinc-500 font-medium">4GO Events & Ticketing</span>
                </div>
              </Link>
            </div>

            {/* Back to Home Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:border-black hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a 4GO</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Search Bar */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">{title}</h1>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto">{subtitle}</p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar términos, condiciones, tratamiento de datos..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-zinc-300 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 shadow-sm transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout with Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-3 mb-3">
              Documentos Legales
            </h3>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                      isActive
                        ? "bg-black text-white shadow-md font-bold"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 mt-8 space-y-2">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">¿Tienes preguntas?</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Contacta a nuestro equipo de soporte legal y atención al cliente.
              </p>
              <a
                href="mailto:soporte.nenez@gmail.com"
                className="inline-block text-xs font-bold text-black underline hover:text-zinc-700 pt-1"
              >
                soporte.nenez@gmail.com
              </a>
            </div>
          </aside>

          {/* Main Legal Document Content */}
          <article className="lg:col-span-3 bg-white space-y-8 text-zinc-800 leading-relaxed font-sans">
            {children}
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-100 border-t border-zinc-200 py-10 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} 4GO / NENEZ Ticketing Platform. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6 font-medium text-zinc-600">
            <Link href="/privacy_policy" className="hover:text-black transition">Privacidad</Link>
            <Link href="/terms_and_conditions" className="hover:text-black transition">Términos</Link>
            <Link href="/ticket_purchase_terms" className="hover:text-black transition">Compra</Link>
            <Link href="/cookie_settings" className="hover:text-black transition">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

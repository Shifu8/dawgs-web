"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Music, Heart, Ticket, Smartphone, ExternalLink, X } from "lucide-react";
import AlienIcon from "@/frontend/components/AlienIcon";

interface AppFooterAndDownloadBannerProps {
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenHelp?: () => void;
}

export default function AppFooterAndDownloadBanner({
  onOpenTerms,
  onOpenPrivacy,
  onOpenHelp,
}: AppFooterAndDownloadBannerProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openLinkModal = (title: string, content: string) => {
    setActiveModal(title);
  };

  return (
    <div className="w-full text-left font-sans">
      {/* ─── SECTION 1: DESCARGA LA APP DE 4GO (MATCHES SCREENSHOT) ─── */}
      <section className="w-full bg-[#0c0714] text-white py-16 px-4 sm:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title + Feature List + Store Buttons */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-sans">
              Descarga la app de 4GO
            </h2>

            <div className="space-y-4 text-zinc-300 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl">
              <div className="flex items-start gap-3">
                <Music className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                <p>
                  Descubre las mejores fiestas en tu ciudad. Nos sincronizamos con tu biblioteca de
                  música para ofrecerte recomendaciones personalizadas.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                <p>
                  Guarda tus eventos, compártelos con colegas o, incluso, escucha nueva música en la
                  app. Todo, para estar siempre al tanto de lo que pasa.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                <p>
                  Te lo ponemos fácil para cambiar tu entrada con la de algún colega o devolverla a
                  la lista de espera. Cero estrés.
                </p>
              </div>
            </div>

            {/* Store Download Buttons (iOS & Android) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => alert("Próximamente disponible en el App Store")}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.58.67-.99 1.74-.87 2.76 1 .08 2.03-.51 2.59-1.26z" />
                </svg>
                <span>iOS</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Próximamente disponible en Google Play Store")}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-md"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a2.05 2.05 0 0 1-.22-.303V2.117c.07-.11.144-.212.22-.303zm11.235 11.238l2.58 2.58-12.016 6.94 9.436-9.52zm0-2.104L5.408 1.428l12.016 6.94-2.58 2.58zm1.485 1.052l3.418 1.974c.74.427.74 1.123 0 1.55l-3.418 1.974-2.127-2.127 2.127-2.371z" />
                </svg>
                <span>ANDROID</span>
              </button>
            </div>
          </div>

          {/* Right Column: Mascot Icon in White Box */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white flex items-center justify-center p-3 shadow-2xl overflow-hidden border border-white/20">
              <Image
                src="/images/alien_green_hands_white.png"
                alt="4GO App Logo"
                width={84}
                height={84}
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: WHITE FOOTER DIRECTORY (MATCHES SCREENSHOT) ─── */}
      <footer className="w-full bg-white text-black py-16 px-6 sm:px-12 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-8 items-start">
          {/* Brand Mascot */}
          <div className="lg:col-span-3 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center p-2 shadow-md">
              <Image
                src="/logo_4go_mascot.png"
                alt="4GO Mascot"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              4GO © 2026. Todos los derechos reservados.
            </p>
          </div>

          {/* Column 1: Nuestra empresa */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">
              Nuestra empresa
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-zinc-700">
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Sobre 4GO", "4GO es la plataforma líder para descubrir los mejores eventos, artistas y fiestas con acceso 100% oficial y seguro.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Sobre 4GO
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Trabaja con nosotros", "¿Te apasiona la música en vivo y la tecnología de eventos? Escríbenos a careers@4go.ec")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Trabaja con nosotros
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Diversidad, Equidad e Inclusión", "En 4GO promovemos espacios seguros y diversos tanto en nuestra plataforma como en cada evento.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Diversidad, Equidad e Inclusión
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Fan Support */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">
              Fan Support
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-zinc-700">
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Recibir ayuda", "Contáctanos directamente a support@4go.ec o a nuestro WhatsApp oficial de atención para asistirte con tu compra.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Recibir ayuda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Preguntas frecuentes", "1. ¿Cómo recibo mis entradas? Llegan a tu correo y cuenta con código QR.\n2. ¿Cómo funciona la verificación? Subes tu comprobante y el organizador lo valida.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Preguntas frecuentes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Solicitar un reembolso", "Puedes solicitar reembolso si el evento fue cancelado o reprogramado hasta 24 horas antes del inicio.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Solicitar un reembolso
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Recursos */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">
              Recursos
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-zinc-700">
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Artistas", "Conéctate con tu audiencia, gestiona tus setlists y vende entradas y merch oficial en 4GO.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Artistas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Salas y Discotecas", "Optimiza la taquilla, mesas VIP y barra de tu discoteca con nuestra infraestructura 4GO.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Salas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Blog", "Noticias, lanzamientos, festivales y cultura nocturna.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Prensa", "Kits de medios y comunicados oficiales de 4GO Productions.")}
                  className="hover:text-black transition cursor-pointer text-left"
                >
                  Prensa
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLinkModal("Partners", "Alianzas estratégicas para marcas, promotores y venues.")}
                  className="hover:text-black transition cursor-pointer flex items-center gap-1 text-left"
                >
                  <span>Partners</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="max-w-6xl mx-auto pt-10 mt-10 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => openLinkModal("Condiciones de Uso", "Términos y condiciones de uso general de la plataforma 4GO.")}
              className="hover:text-black transition cursor-pointer"
            >
              Condiciones de Uso
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLinkModal("Política de Privacidad", "Protección y tratamiento seguro de tus datos personales.")}
              className="hover:text-black transition cursor-pointer"
            >
              Política de Privacidad
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => openLinkModal("Política de Cookies", "Uso de cookies para optimizar tu experiencia.")}
              className="hover:text-black transition cursor-pointer"
            >
              Cookies
            </button>
          </div>

          <p className="text-zinc-400">
            DICE Inspired Engine • 4GO EC
          </p>
        </div>
      </footer>

      {/* Info Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[700] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-md bg-zinc-900 border border-white/20 rounded-3xl p-6 shadow-2xl text-white space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">{activeModal}</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-medium">
              {activeModal === "Sobre 4GO"
                ? "4GO es la plataforma líder para descubrir los mejores eventos, artistas y fiestas con acceso 100% oficial y seguro."
                : activeModal === "Trabaja con nosotros"
                ? "¿Te apasiona la música en vivo y la tecnología de eventos? Escríbenos a careers@4go.ec"
                : activeModal === "Recibir ayuda"
                ? "Contáctanos a soporte@4go.ec para asistirte con tus compras o reservas."
                : activeModal === "Preguntas frecuentes"
                ? "1. ¿Cómo recibo mis entradas? Llegan a tu correo y cuenta con código QR.\n2. ¿Cómo funciona la verificación? Subes tu comprobante bancario y el organizador lo valida para activar tu QR."
                : activeModal === "Solicitar un reembolso"
                ? "Puedes solicitar reembolso si el evento fue cancelado o reprogramado hasta 24 horas antes del inicio."
                : "Información oficial de la plataforma 4GO."}
            </p>
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-full bg-white text-black font-black text-xs uppercase tracking-wider"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

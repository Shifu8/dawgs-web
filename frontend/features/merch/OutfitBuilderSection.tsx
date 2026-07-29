"use client";

import Image from "next/image";
import { Sparkles, ShoppingBag } from "lucide-react";

const STUDIO_HERO_IMAGE = "/images/nenez-studio-couch.png";
const STUDIO_PORTRAIT_IMAGE = "/images/nenez-studio-portrait.png";

export default function OutfitBuilderSection() {
  return (
    <div
      id="wear"
      className="relative z-20 w-full max-w-[1600px] mx-auto mt-12 pt-12 border-t border-white/10 space-y-8"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90 drop-shadow-sm">
            MERCH OFICIAL · 4GO
          </p>
          <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1 drop-shadow-md">
            Explora la Merch Oficial de 4go
          </h3>
        </div>
        <a
          href="https://wa.me/593988831372"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-zinc-200 active:scale-[0.98] select-none cursor-pointer shadow-lg font-bold"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pedir por WhatsApp</span>
        </a>
      </div>

      {/* Content Container with TV Glitch & Vivid Studio Couch Image */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-black/50 p-6 sm:p-10 backdrop-blur-2xl grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center shadow-2xl">
        {/* Base Couch Photo - Vivid & Bright */}
        <Image
          src={STUDIO_HERO_IMAGE}
          alt="Modelos 4GO x NENEZ usando ropa oversize de colección"
          fill
          sizes="(max-width: 1600px) 100vw, 1600px"
          className="object-cover object-[center_top] opacity-75 pointer-events-none"
          priority={false}
        />

        {/* Glitch Slices - Vintage TV Displacement */}
        <div className="absolute inset-0 pointer-events-none opacity-75 animate-glitch-slice-1">
          <Image
            src={STUDIO_HERO_IMAGE}
            alt=""
            fill
            sizes="(max-width: 1600px) 100vw, 1600px"
            className="object-cover object-[center_top]"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-75 animate-glitch-slice-2">
          <Image
            src={STUDIO_HERO_IMAGE}
            alt=""
            fill
            sizes="(max-width: 1600px) 100vw, 1600px"
            className="object-cover object-[center_top]"
          />
        </div>

        {/* Vintage Rolling TV Hum Bar */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 h-[200px] bg-gradient-to-b from-transparent via-white/[0.04] to-transparent opacity-60 animate-rolling-bar" />
        </div>

        {/* Soft Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:100%_5px] pointer-events-none" />

        {/* Left Info Column */}
        <div className="relative z-10 flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white backdrop-blur-md">
            Streetwear Edición Limitada
          </span>
          <h4 className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">
            Timeless Apparel.
            <br />
            4GO x NENEZ
          </h4>
          <p className="mt-4 max-w-lg text-xs sm:text-sm leading-relaxed text-zinc-300 font-medium">
            La marca oficial para ropa & merchandise exclusivo de 4go. Prendas oversize con siluetas urbanas premium, confeccionadas con materiales de máxima calidad para tus festivales y eventos.
          </p>
        </div>

        {/* Right Product Card Column */}
        <div className="relative z-10 w-full flex flex-col gap-4 items-center lg:items-end">
          <div className="relative overflow-hidden rounded-[24px] border border-white/20 bg-zinc-950/80 p-3 shadow-2xl backdrop-blur-md w-full max-w-[320px] sm:max-w-[360px]">
            <div className="relative aspect-[4/5] min-h-[380px] sm:min-h-[440px] overflow-hidden rounded-[18px]">
              <Image
                src={STUDIO_PORTRAIT_IMAGE}
                alt="Colección NENEZ x NOW"
                fill
                sizes="(max-width: 768px) 100vw, 360px"
                className="object-cover object-[68%_36%] transition-transform duration-700 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                NOW4GO Drops
              </div>

              <div className="absolute bottom-3 left-3">
                <p className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-400">Merch Oficial</p>
                <p className="text-xs font-black uppercase text-white mt-0.5 tracking-tight">Ready to wear</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

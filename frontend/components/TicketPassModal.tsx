"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Share2,
  Download,
  QrCode,
  ChevronLeft,
  Check,
} from "lucide-react";

export interface TicketPassData {
  id?: string;
  ticketId?: string;
  eventId?: string;
  eventTitle: string;
  venue: string;
  tierName: string;
  price?: number;
  dateLabel?: string;
  date?: string;
  time?: string;
  qrCode?: string;
  poster?: string;
  imageUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  status?: string;
  referenceNumber?: string;
}

interface TicketPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketPassData | null;
}

export default function TicketPassModal({
  isOpen,
  onClose,
  ticket,
}: TicketPassModalProps) {
  const [activeView, setActiveView] = useState<"ticket" | "qr">("ticket");
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveView("ticket");
      setShareSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const eventTitle = ticket.eventTitle || "Evento 4GO";
  const dateStr = ticket.dateLabel || ticket.date || "30 AGO 2026";
  const timeStr = ticket.time || "22:00 PM";
  const venueStr =
    ticket.venue && !ticket.venue.toLowerCase().startsWith("prueba")
      ? ticket.venue
      : "CUBIC";
  const tierStr = ticket.tierName || "General Access";
  const qrValue = ticket.qrCode || `4GO-PASS-${ticket.id || ticket.ticketId || "OFFICIAL"}`;
  const posterSrc = ticket.poster || ticket.imageUrl || "/images/now4go-hero-presentation-hd-v3_3840w.jpg";
  const refCode = ticket.referenceNumber || ticket.id?.slice(0, 10) || "NENEZ-PASS";

  // Generate and download high-resolution Ticket PNG
  const handleDownloadTicketImage = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const scale = 2; // Retina scale
      canvas.width = 400 * scale;
      canvas.height = 700 * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = "#121118";
      ctx.fillRect(0, 0, 400, 700);

      // Card outer background
      ctx.fillStyle = "#1e1d24";
      roundRect(ctx, 20, 20, 360, 660, 24);
      ctx.fill();

      // Top Poster image
      const img = new (window as any).Image();
      img.crossOrigin = "anonymous";
      img.src = posterSrc;

      await new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });

      // Draw poster rounded top
      ctx.save();
      roundRect(ctx, 28, 28, 344, 210, 18);
      ctx.clip();
      ctx.drawImage(img, 28, 28, 344, 210);
      ctx.restore();

      // White lower ticket body
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, 28, 250, 344, 416, 20);
      ctx.fill();

      // Ticket Title
      ctx.fillStyle = "#111111";
      ctx.font = "900 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(eventTitle.toUpperCase(), 200, 285);

      ctx.fillStyle = "#666666";
      ctx.font = "600 11px sans-serif";
      ctx.fillText(`${dateStr} • ${timeStr}`, 200, 303);

      // Perforated Dotted Line
      ctx.strokeStyle = "#e2e2e8";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(48, 325);
      ctx.lineTo(352, 325);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2x2 Grid Labels & Values
      ctx.textAlign = "left";

      // Date
      ctx.fillStyle = "#8e8e93";
      ctx.font = "600 10px sans-serif";
      ctx.fillText("DATE", 52, 355);
      ctx.fillStyle = "#111111";
      ctx.font = "800 13px sans-serif";
      ctx.fillText(dateStr, 52, 375);

      // Time
      ctx.fillStyle = "#8e8e93";
      ctx.font = "600 10px sans-serif";
      ctx.fillText("TIME", 215, 355);
      ctx.fillStyle = "#111111";
      ctx.font = "800 13px sans-serif";
      ctx.fillText(timeStr, 215, 375);

      // Venue
      ctx.fillStyle = "#8e8e93";
      ctx.font = "600 10px sans-serif";
      ctx.fillText("VENUE", 52, 415);
      ctx.fillStyle = "#111111";
      ctx.font = "800 13px sans-serif";
      ctx.fillText(venueStr, 52, 435);

      // Seat / Tier
      ctx.fillStyle = "#8e8e93";
      ctx.font = "600 10px sans-serif";
      ctx.fillText("SEAT / TIER", 215, 415);
      ctx.fillStyle = "#111111";
      ctx.font = "800 13px sans-serif";
      ctx.fillText(tierStr, 215, 435);

      // Notch Cutouts left & right
      ctx.fillStyle = "#1e1d24";
      ctx.beginPath();
      ctx.arc(28, 510, 14, -Math.PI / 2, Math.PI / 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(372, 510, 14, Math.PI / 2, -Math.PI / 2);
      ctx.fill();

      // Lower Dotted separator
      ctx.strokeStyle = "#e2e2e8";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(50, 510);
      ctx.lineTo(350, 510);
      ctx.stroke();
      ctx.setLineDash([]);

      // Barcode bars simulation
      ctx.fillStyle = "#111111";
      const startX = 65;
      const barY = 535;
      const barH = 55;
      const widths = [
        3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 4, 1,
        3, 2, 1, 4, 2, 3, 1, 4, 2,
      ];
      let currentX = startX;
      for (const w of widths) {
        ctx.fillRect(currentX, barY, w, barH);
        currentX += w + 4;
      }

      // Barcode reference text
      ctx.fillStyle = "#777777";
      ctx.font = "700 10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`• ${refCode.toUpperCase()} •`, 200, 615);

      ctx.fillStyle = "#999999";
      ctx.font = "600 8px sans-serif";
      ctx.fillText(
        "PASE DIGITAL OFICIAL 4GO • ACCESO PERSONALIZADO",
        200,
        642
      );

      // Trigger download
      const link = document.createElement("a");
      link.download = `Ticket_${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error downloading ticket image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mi Ticket - ${eventTitle}`,
          text: `¡Tengo mi entrada para ${eventTitle} en ${venueStr}!`,
          url: window.location.href,
        });
      } catch {}
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[800] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-2xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#131218] border border-white/15 rounded-[36px] p-5 sm:p-6 shadow-2xl space-y-5 my-auto text-center selection:bg-[#dfff28] selection:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── TOP APP-STYLE HEADER BAR ─── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
            title="Volver"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <h3 className="text-base font-black uppercase tracking-wider text-white">
            Tickets
          </h3>

          <button
            type="button"
            onClick={handleShareTicket}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg relative"
            title="Compartir Ticket"
          >
            {shareSuccess ? (
              <Check className="w-4 h-4 text-[#dfff28]" />
            ) : (
              <Share2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* ─── TICKET CONTAINER CARD ─── */}
        {activeView === "ticket" ? (
          <div className="relative rounded-[28px] bg-[#212028] p-3 border border-white/10 shadow-2xl space-y-3 overflow-hidden">
            {/* Top Poster Art */}
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-black border border-white/10 shadow-md">
              <Image
                src={posterSrc}
                alt={eventTitle}
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                Pase Oficial 4GO
              </div>
            </div>

            {/* White Ticket Paper Body */}
            <div className="relative rounded-2xl bg-white text-zinc-950 p-5 space-y-4 shadow-xl">
              {/* Event Title & Date Header */}
              <div className="space-y-1 text-center">
                <h4 className="text-sm sm:text-base font-black uppercase tracking-tight text-black leading-tight">
                  {eventTitle}
                </h4>
                <p className="text-[11px] font-bold text-zinc-500">
                  {dateStr} • {timeStr}
                </p>
              </div>

              {/* Perforated Dotted Separator */}
              <div className="border-t-2 border-dashed border-zinc-200" />

              {/* 2x2 Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Date
                  </span>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5">
                    {dateStr}
                  </p>
                </div>

                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Time
                  </span>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5">
                    {timeStr}
                  </p>
                </div>

                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Venue
                  </span>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5 truncate">
                    {venueStr}
                  </p>
                </div>

                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Seat / Tier
                  </span>
                  <p className="text-xs sm:text-sm font-black text-zinc-900 mt-0.5 truncate">
                    {tierStr}
                  </p>
                </div>
              </div>

              {/* Lower Section: Notched Cutouts & Barcode */}
              <div className="relative pt-3">
                {/* Left & Right Notch Circles */}
                <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-[#212028]" />
                <div className="absolute -right-8 top-1.5 w-6 h-6 rounded-full bg-[#212028]" />

                {/* Dotted Cut Line */}
                <div className="border-t-2 border-dashed border-zinc-200 mb-3" />

                {/* Realistic Barcode Graphic */}
                <div className="flex flex-col items-center justify-center space-y-1.5 py-1">
                  <div className="h-12 w-full max-w-[260px] flex items-stretch justify-between px-2">
                    {[
                      3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4,
                      3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4,
                    ].map((w, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${w * 2.2}px` }}
                        className="bg-black h-full rounded-[0.5px]"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-zinc-600 tracking-wider">
                    {refCode.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── DYNAMIC QR CODE SCANNER VIEW ─── */
          <div className="relative rounded-[28px] bg-white text-zinc-950 p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Pase Oficial de Acceso 4GO
              </span>
              <h4 className="text-base sm:text-lg font-black uppercase text-black">
                {eventTitle}
              </h4>
              <p className="text-xs text-zinc-600 font-medium">
                {venueStr} • {tierStr}
              </p>
            </div>

            {/* High-Contrast QR Code */}
            <div className="w-56 h-56 bg-zinc-50 border-2 border-zinc-950 rounded-3xl mx-auto flex items-center justify-center p-3 shadow-inner relative group">
              <QrCode className="w-full h-full text-zinc-900" />
            </div>

            <div className="space-y-1 text-xs text-zinc-500 font-mono">
              <p className="font-bold text-black text-sm">{qrValue}</p>
              <p className="text-[10px] text-zinc-700 font-bold uppercase">
                ✓ Válido para 1 escaneo en puerta
              </p>
            </div>
          </div>
        )}

        {/* ─── BOTTOM DUAL ACTION TOGGLE BUTTONS (CORAL & WHITE PILLS) ─── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Button 1: Image / Download Canvas */}
          <button
            type="button"
            onClick={() => {
              if (activeView !== "ticket") {
                setActiveView("ticket");
              } else {
                handleDownloadTicketImage();
              }
            }}
            disabled={isDownloading}
            className={`py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer disabled:opacity-50 ${
              activeView === "ticket"
                ? "bg-[#ff4d5a] hover:bg-[#ff3b49] text-white shadow-[#ff4d5a]/25"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{activeView === "ticket" ? (isDownloading ? "Descargando..." : "Image / Descargar") : "Ver Ticket"}</span>
          </button>

          {/* Button 2: QR Code View */}
          <button
            type="button"
            onClick={() => setActiveView(activeView === "qr" ? "ticket" : "qr")}
            className={`py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer ${
              activeView === "qr"
                ? "bg-white hover:bg-zinc-200 text-black shadow-white/20"
                : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Canvas helper function for rounded rectangles
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

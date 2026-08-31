"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import {
  Share2,
  Download,
  QrCode,
  Check,
  ChevronLeft,
  Loader2,
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
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const eventTitle = ticket?.eventTitle || "Evento 4GO";
  const dateStr = ticket?.dateLabel || ticket?.date || "30 AGO 2026";
  const timeStr = ticket?.time || "22:00 PM";
  const venueStr =
    ticket?.venue && !ticket.venue.toLowerCase().startsWith("prueba")
      ? ticket.venue
      : "CUBIC";
  const tierStr = ticket?.tierName || "General Access";
  const qrValue = ticket?.qrCode || `4GO-PASS-${ticket?.id || ticket?.ticketId || "OFFICIAL"}`;
  const posterSrc = ticket?.poster || ticket?.imageUrl || "/images/now4go-hero-presentation-hd-v3_3840w.jpg";
  const refCode = ticket?.referenceNumber || ticket?.id?.slice(0, 10) || "NENEZ-PASS";

  // Generate high-resolution scannable QR Code Data URL
  useEffect(() => {
    if (isOpen && qrValue) {
      QRCode.toDataURL(qrValue, {
        width: 600,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => setQrCodeDataUrl(""));
    }
  }, [isOpen, qrValue]);

  useEffect(() => {
    if (isOpen) {
      setActiveView("ticket");
      setShareSuccess(false);
    }
  }, [isOpen]);

  // Generate Ticket Canvas
  const generateTicketCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = 2; // Retina scale
    canvas.width = 380 * scale;
    canvas.height = 640 * scale;
    ctx.scale(scale, scale);

    // Card outer background (Brown / dark card style as in mockup)
    ctx.fillStyle = "#262220";
    roundRect(ctx, 0, 0, 380, 640, 26);
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
    roundRect(ctx, 16, 16, 348, 195, 20);
    ctx.clip();
    ctx.drawImage(img, 16, 16, 348, 195);
    ctx.restore();

    // White lower ticket body
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 16, 225, 348, 395, 20);
    ctx.fill();

    // Ticket Title
    ctx.fillStyle = "#111111";
    ctx.font = "900 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(eventTitle.toUpperCase(), 190, 260);

    ctx.fillStyle = "#666666";
    ctx.font = "600 11px sans-serif";
    ctx.fillText(`${dateStr} • ${timeStr}`, 190, 278);

    // Perforated Dotted Line
    ctx.strokeStyle = "#e2e2e8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(36, 298);
    ctx.lineTo(344, 298);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2x2 Grid Labels & Values
    ctx.textAlign = "left";

    // Date
    ctx.fillStyle = "#8e8e93";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("Date", 40, 328);
    ctx.fillStyle = "#111111";
    ctx.font = "800 13px sans-serif";
    ctx.fillText(dateStr, 40, 348);

    // Time
    ctx.fillStyle = "#8e8e93";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("Time", 205, 328);
    ctx.fillStyle = "#111111";
    ctx.font = "800 13px sans-serif";
    ctx.fillText(timeStr, 205, 348);

    // Venue
    ctx.fillStyle = "#8e8e93";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("Venue", 40, 388);
    ctx.fillStyle = "#111111";
    ctx.font = "800 13px sans-serif";
    ctx.fillText(venueStr, 40, 408);

    // Seat / Tier
    ctx.fillStyle = "#8e8e93";
    ctx.font = "600 10px sans-serif";
    ctx.fillText("Seat", 205, 388);
    ctx.fillStyle = "#111111";
    ctx.font = "800 13px sans-serif";
    ctx.fillText(tierStr, 205, 408);

    // Notch Cutouts left & right
    ctx.fillStyle = "#262220";
    ctx.beginPath();
    ctx.arc(16, 475, 14, -Math.PI / 2, Math.PI / 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(364, 475, 14, Math.PI / 2, -Math.PI / 2);
    ctx.fill();

    // Lower Dotted separator
    ctx.strokeStyle = "#e2e2e8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(38, 475);
    ctx.lineTo(342, 475);
    ctx.stroke();
    ctx.setLineDash([]);

    // Barcode bars simulation
    ctx.fillStyle = "#111111";
    const startX = 55;
    const barY = 500;
    const barH = 55;
    const widths = [
      3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4,
      3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4, 2,
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
    ctx.fillText(`• ${refCode.toUpperCase()} •`, 190, 580);

    return canvas;
  }, [eventTitle, dateStr, timeStr, venueStr, tierStr, posterSrc, refCode]);

  // Generate QR Code Card Canvas
  const generateQrCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = 2;
    canvas.width = 380 * scale;
    canvas.height = 540 * scale;
    ctx.scale(scale, scale);

    // Background card (clean pure white)
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 0, 0, 380, 540, 26);
    ctx.fill();

    // Card border
    ctx.strokeStyle = "#e2e2e8";
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, 378, 538, 25);
    ctx.stroke();

    // Header label
    ctx.fillStyle = "#888888";
    ctx.font = "800 10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PASE OFICIAL DE ACCESO 4GO", 190, 42);

    // Event title
    ctx.fillStyle = "#000000";
    ctx.font = "900 18px sans-serif";
    ctx.fillText(eventTitle.toUpperCase(), 190, 72);

    // Venue & Tier
    ctx.fillStyle = "#555555";
    ctx.font = "600 12px sans-serif";
    ctx.fillText(`${venueStr} • ${tierStr}`, 190, 95);

    // QR Image
    const qrImg = new (window as any).Image();
    qrImg.src = qrCodeDataUrl || await QRCode.toDataURL(qrValue, { width: 500, margin: 1 });
    await new Promise((resolve) => {
      qrImg.onload = () => resolve(true);
      qrImg.onerror = () => resolve(false);
    });

    // Draw QR Code centered
    ctx.drawImage(qrImg, 65, 125, 250, 250);

    // QR Value text
    ctx.fillStyle = "#111111";
    ctx.font = "700 12px monospace";
    ctx.fillText(qrValue, 190, 415);

    // Scannable status badge
    ctx.fillStyle = "#22c55e";
    ctx.font = "800 11px sans-serif";
    ctx.fillText("✓ VÁLIDO PARA 1 ESCANEO EN PUERTA", 190, 445);

    ctx.fillStyle = "#999999";
    ctx.font = "600 9px sans-serif";
    ctx.fillText(`Ref: #${refCode.toUpperCase()} • ${dateStr}`, 190, 475);

    return canvas;
  }, [eventTitle, venueStr, tierStr, qrCodeDataUrl, qrValue, refCode, dateStr]);

  // Download Action (Handles both Ticket view and QR view)
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = activeView === "qr" ? await generateQrCanvas() : await generateTicketCanvas();
      if (!canvas) return;

      const link = document.createElement("a");
      const filename = activeView === "qr"
        ? `QR_Pass_${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}.png`
        : `Ticket_${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Error downloading image:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Share Action (Direct Image File Sharing via Web Share API)
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const canvas = activeView === "qr" ? await generateQrCanvas() : await generateTicketCanvas();
      if (!canvas) return;

      const filename = activeView === "qr" ? "QR_Pass_4GO.png" : "Ticket_4GO.png";

      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob) {
        const file = new File([blob], filename, { type: "image/png" });

        // Try Web Share API Level 2 with Image File
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Mi Ticket - ${eventTitle}`,
            text: `¡Aquí tienes mi entrada oficial para ${eventTitle} en ${venueStr}!`,
          });
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 2500);
          return;
        }
      }

      // Fallback: standard share or copy link
      if (navigator.share) {
        await navigator.share({
          title: `Mi Ticket - ${eventTitle}`,
          text: `¡Tengo mi entrada para ${eventTitle} en ${venueStr}!`,
          url: window.location.href,
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Error sharing ticket:", err);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen || !ticket) return null;

  return (
    <div
      className="fixed inset-0 z-[850] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[340px] sm:max-w-[360px] space-y-4 my-auto text-center selection:bg-[#dfff28] selection:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── TOP BAR (PHOTO 1 MATCH) ─── */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
            title="Volver"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Tickets
          </h3>

          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-lg"
            title="Compartir Imagen"
          >
            {shareSuccess ? (
              <Check className="w-4 h-4 text-[#dfff28]" />
            ) : isSharing ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Share2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* ─── TICKET CARD (MATCHING USER SCREENSHOT EXACTLY) ─── */}
        {activeView === "ticket" ? (
          <div className="relative rounded-[30px] bg-[#2a2421] p-3 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-2.5 overflow-hidden">
            {/* Top Event Image with Exact Rounded Form */}
            <div className="relative w-full h-44 sm:h-48 rounded-[20px] overflow-hidden bg-black shadow-inner">
              <Image
                src={posterSrc}
                alt={eventTitle}
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* White Ticket Body */}
            <div className="relative rounded-[20px] bg-white text-zinc-950 p-4 sm:p-5 space-y-3.5 shadow-xl">
              {/* Event Title & Date Header */}
              <div className="space-y-0.5 text-center">
                <h4 className="text-sm font-black uppercase tracking-tight text-black leading-tight">
                  {eventTitle}
                </h4>
                <p className="text-[11px] font-bold text-zinc-500">
                  {dateStr} • {timeStr}
                </p>
              </div>

              {/* Perforated Dotted Line */}
              <div className="border-t-2 border-dashed border-zinc-200" />

              {/* 2x2 Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Date
                  </span>
                  <p className="text-xs font-black text-zinc-900 mt-0.5 truncate">
                    {dateStr}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Time
                  </span>
                  <p className="text-xs font-black text-zinc-900 mt-0.5 truncate">
                    {timeStr}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Venue
                  </span>
                  <p className="text-xs font-black text-zinc-900 mt-0.5 truncate">
                    {venueStr}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Seat
                  </span>
                  <p className="text-xs font-black text-zinc-900 mt-0.5 truncate">
                    {tierStr}
                  </p>
                </div>
              </div>

              {/* Lower Section: Notched Cutouts & Barcode */}
              <div className="relative pt-2">
                {/* Left & Right Notch Cutouts */}
                <div className="absolute -left-7 sm:-left-8 top-0.5 w-5 h-5 rounded-full bg-[#2a2421]" />
                <div className="absolute -right-7 sm:-right-8 top-0.5 w-5 h-5 rounded-full bg-[#2a2421]" />

                {/* Dotted Cut Line */}
                <div className="border-t-2 border-dashed border-zinc-200 mb-2.5" />

                {/* Barcode Graphic */}
                <div className="flex flex-col items-center justify-center space-y-1 py-0.5">
                  <div className="h-10 w-full max-w-[220px] flex items-stretch justify-between px-1">
                    {[
                      3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4,
                      3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4,
                    ].map((w, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${w * 1.8}px` }}
                        className="bg-black h-full rounded-[0.5px]"
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] font-bold text-zinc-600 tracking-wider">
                    {refCode.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── DYNAMIC QR CODE SCANNER VIEW ─── */
          <div className="relative rounded-[28px] bg-white text-zinc-950 p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                Pase Oficial de Acceso 4GO
              </span>
              <h4 className="text-base font-black uppercase text-black">
                {eventTitle}
              </h4>
              <p className="text-xs text-zinc-600 font-medium">
                {venueStr} • {tierStr}
              </p>
            </div>

            {/* High-Resolution Scannable QR Code */}
            <div className="w-52 h-52 bg-zinc-50 border-2 border-zinc-950 rounded-2xl mx-auto flex items-center justify-center p-2 shadow-inner overflow-hidden">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-full h-full text-zinc-900" />
              )}
            </div>

            <div className="space-y-0.5 text-xs text-zinc-500 font-mono">
              <p className="font-bold text-black text-sm">{qrValue}</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase">
                ✓ Válido para 1 escaneo en puerta
              </p>
            </div>
          </div>
        )}

        {/* ─── BOTTOM DUAL ACTION BUTTONS ─── */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Button 1: Image / Download (Works for both views) */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className={`py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer disabled:opacity-50 ${
              activeView === "ticket"
                ? "bg-[#ff4d5a] hover:bg-[#ff3b49] text-white shadow-[#ff4d5a]/25"
                : "bg-[#ff4d5a] hover:bg-[#ff3b49] text-white shadow-[#ff4d5a]/25"
            }`}
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloading ? "Descargando..." : activeView === "qr" ? "Descargar QR" : "Image"}</span>
          </button>

          {/* Button 2: QR Code View Toggle */}
          <button
            type="button"
            onClick={() => setActiveView(activeView === "qr" ? "ticket" : "qr")}
            className={`py-3.5 px-4 rounded-full font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 cursor-pointer ${
              activeView === "qr"
                ? "bg-white hover:bg-zinc-200 text-black shadow-white/20"
                : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{activeView === "qr" ? "Ver Ticket" : "QR Code"}</span>
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

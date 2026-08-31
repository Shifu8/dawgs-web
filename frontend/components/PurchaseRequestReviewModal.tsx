"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  X,
  Check,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  FileX,
  Clock,
  QrCode,
  Search,
  ZoomIn,
  Download,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  User,
  CreditCard,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
  AlertTriangle,
  Loader2,
  Share2,
  Copy,
  CheckCheck,
} from "lucide-react";
import type { ReceiptRecord, ReceiptStatus } from "@/lib/access-drop/types";
import { REJECTION_REASONS } from "@/lib/access-drop/types";
import type { AdminEvent } from "@/lib/admin/types";
import { getHdImageSrc, DEFAULT_HD_EVENT_POSTER } from "@/frontend/utils/hdImages";

interface PurchaseRequestReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptRecord | null;
  receipts?: ReceiptRecord[];
  event?: any;
  events?: any[];
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
  onStatusUpdated?: () => void;
}

export default function PurchaseRequestReviewModal({
  isOpen,
  onClose,
  receipt: initialReceipt,
  receipts = [],
  event: directEvent,
  events = [],
  onApprove,
  onReject,
  onStatusUpdated,
}: PurchaseRequestReviewModalProps) {
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(initialReceipt?.id || null);
  const [reviewing, setReviewing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>("pago-no-verificado");
  const [customRejectNote, setCustomRejectNote] = useState("");
  const [zoomReceipt, setZoomReceipt] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync active receipt id when initialReceipt changes
  useEffect(() => {
    if (initialReceipt?.id) {
      setActiveReceiptId(initialReceipt.id);
    }
  }, [initialReceipt]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomReceipt) {
          setZoomReceipt(false);
        } else if (showRejectModal) {
          setShowRejectModal(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, zoomReceipt, showRejectModal, onClose]);

  const receipt = (receipts.find((r) => r.id === activeReceiptId) || initialReceipt || receipts[0]) as ReceiptRecord;

  if (!isOpen || !receipt) return null;

  // Match the event from list or use direct event
  const matchedEvent = directEvent || events.find(
    (e) =>
      (receipt.eventId && (e.id === receipt.eventId || e.slug === receipt.eventId)) ||
      (receipt.eventTitle && e.title?.toLowerCase() === receipt.eventTitle?.toLowerCase())
  );

  const eventTitle = matchedEvent?.title || receipt.eventTitle || "NBRRRR";
  const eventSubtitle = matchedEvent?.subtitle || "Fase de Ventas Activa";
  const eventDate = matchedEvent?.dateLabel || matchedEvent?.date || "30 AGO 2026";
  const eventTime = matchedEvent?.time || "22:00";
  const eventLocation = matchedEvent?.location || matchedEvent?.venue || matchedEvent?.city || "Loja, Ecuador";
  const eventImageSrc = getHdImageSrc(matchedEvent?.imageUrl || matchedEvent?.poster || DEFAULT_HD_EVENT_POSTER);
  const eventBasePrice = matchedEvent?.price || 10;

  const totalQuantity = receipt.quantity || 1;
  const unitPrice = receipt.totalAmount ? receipt.totalAmount / totalQuantity : eventBasePrice;
  const totalAmount = receipt.totalAmount || totalQuantity * eventBasePrice;

  const handleCopy = (text: string, fieldKey: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleExecuteApprove = async () => {
    if (reviewing) return;
    setReviewing(true);
    try {
      if (onApprove) {
        await onApprove(receipt.id);
      } else {
        const res = await fetch(`/api/access-drop/receipts/${receipt.id}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "aprobado", reviewedBy: "admin" }),
        });
        const data = await res.json();
        if (data.success) {
          onStatusUpdated?.();
          onClose();
        }
      }
    } catch (err) {
      console.error("Error approving request:", err);
    } finally {
      setReviewing(false);
    }
  };

  const handleExecuteReject = async () => {
    if (reviewing) return;
    setReviewing(true);
    try {
      const reasonToSubmit = selectedRejectReason === "otro" && customRejectNote.trim()
        ? `Otro: ${customRejectNote.trim()}`
        : selectedRejectReason;

      if (onReject) {
        await onReject(receipt.id, reasonToSubmit);
      } else {
        const res = await fetch(`/api/access-drop/receipts/${receipt.id}/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rechazado",
            reviewedBy: "admin",
            rejectionReason: reasonToSubmit,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowRejectModal(false);
          onStatusUpdated?.();
          onClose();
        }
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    } finally {
      setReviewing(false);
    }
  };

  // WhatsApp Link preformatted
  const sanitizedPhone = receipt.phone.replace(/[^0-9]/g, "");
  const whatsappNumber = sanitizedPhone.startsWith("593")
    ? sanitizedPhone
    : sanitizedPhone.startsWith("0")
    ? `593${sanitizedPhone.slice(1)}`
    : `593${sanitizedPhone}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `¡Hola ${receipt.firstName}! Te saludamos de ${eventTitle} (NENEZ). Respecto a tu solicitud de compra #${receipt.id.slice(0, 8)} por ${totalQuantity} entrada(s)...`
  )}`;

  const isApproved = receipt.status === "aprobado";
  const isRejected = receipt.status === "rechazado";
  const isPending = receipt.status === "pendiente";

  return (
    <div className="fixed inset-0 z-[600] overflow-y-auto bg-black text-white selection:bg-[#dfff28] selection:text-black">
      {/* ─── DYNAMIC BLURRED EVENT POSTER ATMOSPHERE (IDENTICAL TO CHECKOUT) ─── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute inset-0 scale-125 transform-gpu">
          <Image
            src={eventImageSrc}
            alt={eventTitle}
            fill
            priority
            quality={20}
            sizes="120px"
            className="object-cover object-top scale-150 blur-[90px] saturate-200 brightness-110 opacity-85 transform-gpu will-change-transform"
          />
        </div>

        {/* Top Edge Smooth Black Shadow Gradient */}
        <div className="absolute top-0 inset-x-0 h-36 sm:h-44 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none" />

        {/* Global Smooth Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 via-40% to-black pointer-events-none" />
      </div>

      {/* ─── TOP NAVIGATION HEADER BAR ─── */}
      <header className="fixed top-0 inset-x-0 z-[650] flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        {/* Left: Circular Back Arrow Button with Hover Tooltip */}
        <div className="relative group pointer-events-auto flex items-center">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md transition-all cursor-pointer shadow-2xl active:scale-95 shrink-0"
            aria-label="Atrás"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-zinc-950/90 border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 -translate-x-1 group-hover:translate-x-0 whitespace-nowrap z-50">
            Cerrar
          </div>
        </div>

        {/* Right: Quick actions (WhatsApp & Zoom) */}
        <div className="pointer-events-auto flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-600 hover:text-black text-emerald-400 backdrop-blur-xl flex items-center justify-center shadow-lg transition-all active:scale-95"
            title="Chat con comprador por WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          <button
            type="button"
            onClick={() => setZoomReceipt(true)}
            className="w-10 h-10 rounded-full bg-black/60 border border-white/20 hover:bg-white/20 text-white backdrop-blur-xl flex items-center justify-center shadow-lg cursor-pointer transition-all active:scale-95"
            title="Ver comprobante en pantalla completa"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/60 border border-white/20 hover:bg-red-500/20 hover:border-red-500/40 text-white backdrop-blur-xl flex items-center justify-center shadow-lg cursor-pointer transition-all active:scale-95"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT CONTAINER (2-COLUMN GRID MATCHING SCREENSHOT) ─── */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ════════════════ LEFT COLUMN: EVENT & REQUEST DETAILS ════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Event Brand Header */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/25 bg-black/40 shadow-2xl shrink-0">
                <Image
                  src={eventImageSrc}
                  alt={eventTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white truncate">
                  {eventTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#dfff28] mt-0.5">
                  <span>{eventDate} • {eventTime}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400 font-medium">{eventLocation}</span>
                </div>
              </div>
            </div>

            {/* ─── LIST OF PURCHASE REQUESTS ON THE LEFT (USER REQUESTED) ─── */}
            {receipts.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                    LISTA DE SOLICITUDES DE COMPRA ({receipts.length})
                  </p>
                  <span className="text-[10px] text-zinc-400 font-medium">Selecciona una solicitud</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {receipts.map((r) => {
                    const isCurrent = r.id === receipt.id;
                    const rQty = r.quantity || 1;
                    const rTotal = r.totalAmount || rQty * eventBasePrice;

                    return (
                      <div
                        key={r.id}
                        onClick={() => setActiveReceiptId(r.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                          isCurrent
                            ? "bg-zinc-900 border-[#dfff28] shadow-[0_0_20px_rgba(223,255,40,0.2)] ring-1 ring-[#dfff28]"
                            : "bg-black/50 border-white/10 hover:border-white/30 hover:bg-zinc-900/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-black uppercase truncate ${isCurrent ? "text-[#dfff28]" : "text-white"}`}>
                            {r.firstName} {r.lastName}
                          </span>
                          {r.status === "aprobado" ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8.5px] font-black uppercase shrink-0">
                              ✓ Aprobado
                            </span>
                          ) : r.status === "rechazado" ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[8.5px] font-black uppercase shrink-0">
                              ✕ Rechazado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[8.5px] font-black uppercase shrink-0">
                              ⏳ Pendiente
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="font-bold text-zinc-300">{rQty}x Entrada (${rTotal} USD)</span>
                          <span className="font-mono text-zinc-400 text-[10px]">Ref: {r.referenceNumber || "32561683"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subheader: TUS SOLICITUDES & PASES PARA ESTE EVENTO */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50 mb-3">
                DETALLE DE LA SOLICITUD SELECCIONADA & COMPROBANTE
              </p>

              {/* ─── TICKET TYPE CARDS (IDENTICAL TO SCREENSHOT) ─── */}
              <div className="space-y-3">
                {/* Active Requested Ticket Pass Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-zinc-950/60 backdrop-blur-xl p-5 shadow-2xl transition hover:border-white/30">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white truncate">
                        {totalQuantity}x GA - Preventa 1 (Early Bird)
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                        {isApproved ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Entrada confirmada • Código QR activo
                          </span>
                        ) : isRejected ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <FileX className="w-3.5 h-3.5" /> Solicitud rechazada
                          </span>
                        ) : (
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Solicitud en espera de validación bancaria
                          </span>
                        )}
                      </div>
                    </div>

                    {/* QR Code / Comprobante Pill Button */}
                    <button
                      type="button"
                      onClick={() => setZoomReceipt(true)}
                      className="flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-lg hover:bg-[#dfff28] transition active:scale-95 shrink-0"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isApproved ? "VER QR" : "VER COMPROBANTE"}</span>
                    </button>
                  </div>
                </div>

                {/* Additional Tier Breakdown Reference */}
                <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 flex items-center justify-between text-zinc-400">
                  <div>
                    <p className="text-xs font-bold uppercase text-white">
                      GA - Preventa General (Entry ANYTIME)
                    </p>
                    <p className="text-[10px] text-zinc-500">Monto unitario registrado: ${unitPrice.toFixed(2)} c/u</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white">${(unitPrice * totalQuantity).toFixed(2)}</span>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Cant: {totalQuantity}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── COMPROBANTE BANCARIO PREVIEW & OCR ANALYSIS ─── */}
            <div className="rounded-2xl border border-white/15 bg-black/50 backdrop-blur-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#dfff28]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Comprobante Bancario Adjunto
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setZoomReceipt(true)}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" /> Ampliar Imagen
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Thumbnail view */}
                <div
                  onClick={() => setZoomReceipt(true)}
                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-white/15 bg-black/70 flex items-center justify-center min-h-[200px] p-2 hover:border-[#dfff28]/50 transition"
                >
                  {receipt.mimeType === "application/pdf" ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-zinc-400 group-hover:text-white">
                      <FileCheck className="w-10 h-10 text-[#dfff28]" />
                      <span className="text-xs font-black uppercase">Documento PDF</span>
                      <span className="text-[9px] text-zinc-500">Click para descargar / ver</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={`/api/access-drop/receipts/${receipt.id}?file=true`}
                        alt="Comprobante de Pago"
                        className="max-h-52 w-full object-contain rounded-lg transition group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition backdrop-blur-[2px]">
                        <span className="flex items-center gap-1.5 rounded-full bg-white text-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider shadow-xl">
                          <ZoomIn className="w-3.5 h-3.5" /> Ver en Grande
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* OCR & Automatic Analysis Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Validación OCR AI
                    </span>
                    {receipt.ocrResult?.isSuspicious ? (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[8px] font-black uppercase text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Sospechoso
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Confianza {receipt.ocrResult?.confidence || 95}%
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-medium">Monto detectado:</span>
                      <span className="text-emerald-400 font-black">
                        {receipt.ocrResult?.detectedAmount ? `$${receipt.ocrResult.detectedAmount}` : `$${totalAmount.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-medium">Banco:</span>
                      <span className="text-white font-bold uppercase">
                        {receipt.paymentMethod === "banco-loja" ? "Banco de Loja" : "Banco Pichincha"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-medium">Referencia / Secuencial:</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {receipt.referenceNumber || receipt.ocrResult?.detectedReference || "N/D"}
                      </span>
                    </div>

                    {receipt.ocrResult?.detectedDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-medium">Fecha comprobante:</span>
                        <span className="text-zinc-300 font-medium">{receipt.ocrResult.detectedDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── BUYER & CONTACT INFORMATION ─── */}
            <div className="rounded-2xl border border-white/15 bg-black/50 backdrop-blur-xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <User className="w-4 h-4 text-[#dfff28]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  Datos del Comprador & Entrega
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Nombre Completo</p>
                  <p className="font-bold text-white mt-0.5">{receipt.firstName} {receipt.lastName}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Cédula / Documento</p>
                    <p className="font-bold text-white mt-0.5">{receipt.documentNumber || "No especificado"}</p>
                  </div>
                  {receipt.documentNumber && (
                    <button
                      type="button"
                      onClick={() => handleCopy(receipt.documentNumber, "doc")}
                      className="text-zinc-500 hover:text-white p-1"
                      title="Copiar cédula"
                    >
                      {copiedField === "doc" ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Teléfono / WhatsApp</p>
                    <p className="font-bold text-white mt-0.5 truncate">{receipt.phone}</p>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-500 hover:text-black transition ml-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Correo Electrónico</p>
                    <p className="font-bold text-white mt-0.5 truncate">{receipt.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(receipt.email, "email")}
                    className="text-zinc-500 hover:text-white p-1 ml-2"
                    title="Copiar email"
                  >
                    {copiedField === "email" ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {receipt.serialNumber && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Pase Emitido / Serial</p>
                    <p className="font-mono font-bold text-white text-xs mt-0.5">{receipt.serialNumber}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                    QR Generado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════ RIGHT COLUMN: FLOATING ACCEPT / REVIEW CARD (EXACT MATCHING SCREENSHOT) ════════════════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            {/* The Signature White Modern Card from Screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[28px] bg-white text-zinc-900 p-7 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl border border-white/40 space-y-6"
            >
              {/* Header: Number of tickets & Total */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
                  {totalQuantity} {totalQuantity === 1 ? "entrada" : "entradas"}
                </h2>
                <p className="text-xl sm:text-2xl font-black text-zinc-800 mt-1">
                  Total — {totalAmount} $
                </p>
              </div>

              {/* Status Indicator & Ref Code */}
              <div className="rounded-2xl bg-zinc-100 p-4 space-y-2 border border-zinc-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Estado de la Solicitud
                  </span>
                  {isApproved ? (
                    <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      ✓ Aprobado
                    </span>
                  ) : isRejected ? (
                    <span className="rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-800">
                      ✕ Rechazado
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                      Pendiente de Aceptación
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200">
                  <span className="text-zinc-500 font-bold">Referencia:</span>
                  <span className="font-mono font-bold text-zinc-900">{receipt.referenceNumber || "S/R"}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-bold">Método de pago:</span>
                  <span className="font-bold text-zinc-900 capitalize">
                    {receipt.paymentMethod === "banco-loja" ? "Banco Loja" : "Banco Pichincha"}
                  </span>
                </div>
              </div>

              {/* ─── PRIMARY ACTION BUTTON (EXACT SAME RADIANT STYLE AS 'FINALIZAR COMPRA') ─── */}
              {isPending ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExecuteApprove}
                    disabled={reviewing}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#dfff28] hover:bg-[#ebff52] text-black font-black text-sm uppercase tracking-widest py-4 px-6 shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {reviewing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>EMITIENDO ENTRADAS...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>ACEPTAR Y EMITIR ENTRADA</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={reviewing}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 hover:bg-rose-50 text-rose-700 border border-zinc-200 font-bold text-xs uppercase tracking-wider py-3.5 px-4 transition active:scale-[0.98] cursor-pointer"
                  >
                    <FileX className="w-4 h-4" />
                    <span>Rechazar Solicitud</span>
                  </button>
                </div>
              ) : isApproved ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                    <p className="text-xs font-black uppercase text-emerald-800">
                      ✓ Solicitud Aprobada con Éxito
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      El pase digital con código QR fue emitido y enviado por email al comprador.
                    </p>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 shadow-md transition active:scale-[0.98]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Notificar por WhatsApp</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
                    <p className="text-xs font-black uppercase text-rose-800">
                      ✕ Solicitud Rechazada
                    </p>
                    <p className="text-[11px] text-rose-700 mt-1">
                      Motivo: {receipt.rejectionReason || "Datos de pago no confirmados."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteApprove}
                    disabled={reviewing}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider py-3.5 px-4 transition active:scale-[0.98]"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reevaluar & Aprobar</span>
                  </button>
                </div>
              )}
            </motion.div>

            {/* ─── TERMS & SECURITY DISCLAIMER (MATCHING FOOTER IN SCREENSHOT) ─── */}
            <div className="flex items-start gap-3 p-2 text-zinc-400">
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#dfff28]" />
              </div>
              <p className="text-[10px] leading-relaxed text-zinc-400">
                Al aceptar esta solicitud de compra, se validará el comprobante bancario, se generará el{" "}
                <strong className="text-white">código QR dinámico único</strong> y se enviará la entrada digital con confirmación automática al correo y WhatsApp del comprador.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FULLSCREEN ZOOM MODAL FOR THE RECEIPT IMAGE ─── */}
      <AnimatePresence>
        {zoomReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
            onClick={() => setZoomReceipt(false)}
          >
            <div className="absolute top-5 right-5 flex items-center gap-3">
              <a
                href={`/api/access-drop/receipts/${receipt.id}?file=true`}
                download={`comprobante-${receipt.id}.png`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
              >
                <Download className="w-4 h-4" /> Descargar
              </a>
              <button
                type="button"
                onClick={() => setZoomReceipt(false)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="max-w-4xl max-h-[85vh] p-2 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {receipt.mimeType === "application/pdf" ? (
                <iframe
                  src={`/api/access-drop/receipts/${receipt.id}?file=true`}
                  className="w-[80vw] h-[75vh] rounded-2xl border border-white/20"
                />
              ) : (
                <img
                  src={`/api/access-drop/receipts/${receipt.id}?file=true`}
                  alt="Comprobante Ampliado"
                  className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── REJECTION REASON MODAL ─── */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-950 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileX className="w-5 h-5 text-rose-400" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Motivo del Rechazo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Selecciona la razón para rechazar la solicitud. Esta información se registrará y podrá notificarse al cliente:
              </p>

              <div className="space-y-2">
                {REJECTION_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setSelectedRejectReason(reason.id)}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      selectedRejectReason === reason.id
                        ? "border-rose-500 bg-rose-950/40 text-white"
                        : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{reason.label}</p>
                      <p className="text-[10px] text-zinc-500">{reason.description}</p>
                    </div>
                    {selectedRejectReason === reason.id && (
                      <Check className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {selectedRejectReason === "otro" && (
                <div>
                  <textarea
                    rows={2}
                    value={customRejectNote}
                    onChange={(e) => setCustomRejectNote(e.target.value)}
                    placeholder="Escribe el motivo detallado..."
                    className="w-full rounded-xl border border-white/15 bg-black/60 p-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReject}
                  disabled={reviewing}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition active:scale-95 disabled:opacity-50"
                >
                  {reviewing ? "Rechazando..." : "Confirmar Rechazo"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

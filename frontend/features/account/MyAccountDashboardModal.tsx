"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  X,
  User,
  Calendar,
  Ticket,
  Heart,
  CreditCard,
  Building2,
  CheckCircle2,
  Clock,
  QrCode,
  Edit3,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Lock,
  Check,
  RefreshCw,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  FileText,
  Eye,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Copy,
  FileX,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import type { Event } from "@/frontend/types/domain";
import TicketPassModal from "@/frontend/components/TicketPassModal";

function getReceiptBankName(r: any): string {
  if (!r) return "Ahorita (Banco de Loja)";
  
  // 1. If detected in OCR
  const ocrBank = r.ocrResult?.detectedBank || r.detectedBank;
  if (ocrBank && typeof ocrBank === "string" && ocrBank.trim()) {
    const bLower = ocrBank.toLowerCase();
    if (bLower.includes("ahorita") || bLower.includes("loja")) return "Ahorita (Banco de Loja)";
    if (bLower.includes("deuna") || bLower.includes("pichincha")) return "Deuna (Banco Pichincha)";
    if (bLower.includes("guayaquil")) return "Banco Guayaquil";
    if (bLower.includes("produbanco")) return "Produbanco";
    if (bLower.includes("austro")) return "Banco del Austro";
    if (bLower.includes("pacifico")) return "Banco del Pacífico";
    return ocrBank;
  }

  // 2. From OCR extracted text scan
  const text = (r.ocrResult?.extractedText || r.extractedText || "").toLowerCase();
  if (text.includes("ahorita") || text.includes("banco de loja") || text.includes("banco loja") || text.includes("loja")) return "Ahorita (Banco de Loja)";
  if (text.includes("deuna") || text.includes("pichincha")) return "Deuna (Banco Pichincha)";
  if (text.includes("guayaquil")) return "Banco Guayaquil";
  if (text.includes("produbanco") || text.includes("be produbanco")) return "Produbanco";
  if (text.includes("austro")) return "Banco del Austro";
  if (text.includes("pacifico")) return "Banco del Pacífico";

  // 3. From payment method
  const method = (r.paymentMethod || "").toLowerCase();
  if (method.includes("ahorita") || method.includes("loja")) return "Ahorita (Banco de Loja)";
  if (method.includes("deuna") || method.includes("pichincha")) return "Deuna (Banco Pichincha)";
  if (method.includes("guayaquil")) return "Banco Guayaquil";
  if (method.includes("produbanco")) return "Produbanco";

  // 4. From matched profile
  const profile = (r.ocrResult?.matchedProfile || "").toLowerCase();
  if (profile.includes("ahorita") || profile.includes("loja")) return "Ahorita (Banco de Loja)";
  if (profile.includes("deuna") || profile.includes("pichincha")) return "Deuna (Banco Pichincha)";

  // 5. From direct bank field
  if (r.bank && typeof r.bank === "string" && r.bank.trim()) {
    const bLower = r.bank.toLowerCase();
    if (bLower.includes("ahorita") || bLower.includes("loja")) return "Ahorita (Banco de Loja)";
    if (bLower.includes("deuna") || bLower.includes("pichincha")) return "Deuna (Banco Pichincha)";
    return r.bank;
  }
  
  return "Ahorita (Banco de Loja)";
}

export interface MyAccountDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    type?: string;
    venueName?: string;
    city?: string;
    instagram?: string;
    address?: string;
    openingDays?: string[];
    hasCompletedOnboarding?: boolean;
  } | null;
  onUpdateProfile: (updated: any) => void;
  allEvents: Event[];
  onOpenEventDetail?: (event: Event) => void;
  onStartCreateEvent?: () => void;
}

export default function MyAccountDashboardModal({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  allEvents = [],
  onOpenEventDetail,
  onStartCreateEvent,
}: MyAccountDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<
    "events" | "tickets" | "reservations" | "favorites" | "partner_profile" | "payouts"
  >("events");

  // Real events created by this user
  const [myCreatedEvents, setMyCreatedEvents] = useState<any[]>([]);
  const [managingEvent, setManagingEvent] = useState<Event | null>(null);
  const [configuringEvent, setConfiguringEvent] = useState<Event | null>(null);
  const [editEventForm, setEditEventForm] = useState<Partial<Event> | null>(null);
  const [receiptsList, setReceiptsList] = useState<any[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [receiptActionMessage, setReceiptActionMessage] = useState<string | null>(null);

  // Partner Profile Edit state
  const [editBrandName, setEditBrandName] = useState(userProfile?.venueName || userProfile?.name || "");
  const [editBrandLogo, setEditBrandLogo] = useState(userProfile?.avatar || "");
  const [editInstagram, setEditInstagram] = useState(userProfile?.instagram?.replace(/^@/, "") || "");
  const [editType, setEditType] = useState(userProfile?.type || "Discoteca / Club");
  const [editAddress, setEditAddress] = useState(userProfile?.address || "");
  const [editDays, setEditDays] = useState<string[]>(userProfile?.openingDays || ["Jueves", "Viernes", "Sábado"]);
  const [isSavingPartner, setIsSavingPartner] = useState(false);
  const [partnerSaveSuccess, setPartnerSaveSuccess] = useState(false);

  // Real User purchased tickets, reservations & favorites
  const [userPurchasedTickets, setUserPurchasedTickets] = useState<any[]>([]);
  const [userReservations, setUserReservations] = useState<any[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);

  // QR Viewer Modal
  const [viewingTicketQr, setViewingTicketQr] = useState<any | null>(null);
  const [viewingReceiptImage, setViewingReceiptImage] = useState<any | null>(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      if (userProfile) {
        setEditBrandName(userProfile.venueName || userProfile.name || "");
        setEditBrandLogo(userProfile.avatar || "");
        setEditInstagram(userProfile.instagram?.replace(/^@/, "") || "");
        setEditType(userProfile.type || "Discoteca / Club");
        setEditAddress(userProfile.address || "");
        setEditDays(userProfile.openingDays || ["Jueves", "Viernes", "Sábado"]);
      }

      try {
        const currentEmail = (userProfile?.email || "").trim().toLowerCase();

        // 1. Real Created Events (Empty by default unless user actually created events)
        const storedCreated = localStorage.getItem("4go_created_events");
        let initialCreated: any[] = [];
        if (storedCreated) {
          try {
            const parsedCreated = JSON.parse(storedCreated);
            if (Array.isArray(parsedCreated)) initialCreated = parsedCreated;
          } catch {}
        }
        setMyCreatedEvents(initialCreated);

        // Fetch server events and merge with user profile
        fetch("/api/events")
          .then((res) => res.json())
          .then((data) => {
            if (data?.events && Array.isArray(data.events)) {
              const activeUserNames = [
                userProfile?.venueName?.toLowerCase(),
                userProfile?.name?.toLowerCase(),
                userProfile?.email?.toLowerCase(),
                currentEmail,
                "prueba1",
              ].filter(Boolean);

              const serverEvents = data.events.filter((e: any) => {
                const org = (e.organizer || "").toLowerCase().trim();
                const orgs = (Array.isArray(e.organizers) ? e.organizers : []).map((o: string) => (o || "").toLowerCase().trim());
                return activeUserNames.some((u) => u && (org === u || orgs.includes(u)));
              });

              setMyCreatedEvents((prev) => {
                const merged = [...prev];
                for (const sEvt of serverEvents) {
                  if (!merged.some((m: any) => m.id === sEvt.id || m.title === sEvt.title)) {
                    merged.push(sEvt);
                  }
                }
                try {
                  localStorage.setItem("4go_created_events", JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          })
          .catch((e) => console.error("Error fetching created events from /api/events:", e));

        // 2. Real Favorites (Connected to billboard hearts)
        const favKey = currentEmail ? `user_favorites_${currentEmail}` : "organizer_favorites";
        const storedFav = localStorage.getItem(favKey) || localStorage.getItem("organizer_favorites") || localStorage.getItem("4go_favorites");
        if (storedFav) {
          const parsedFav = JSON.parse(storedFav);
          const favIds = typeof parsedFav === "object" ? Object.keys(parsedFav).filter((k) => parsedFav[k]) : [];
          const matched = allEvents.filter((evt) => favIds.includes(evt.id));
          setFavoriteEvents(matched);
        } else {
          setFavoriteEvents([]);
        }

        // 3. Real Purchased Tickets
        const storedPurchases = localStorage.getItem("nenez_purchased_tickets");
        if (storedPurchases) {
          const parsed = JSON.parse(storedPurchases);
          setUserPurchasedTickets(Array.isArray(parsed) ? parsed : []);
        } else {
          setUserPurchasedTickets([]);
        }

        // 4. Real Reservations
        const storedRes = localStorage.getItem("4go_user_reservations");
        if (storedRes) {
          const parsed = JSON.parse(storedRes);
          setUserReservations(Array.isArray(parsed) ? parsed : []);
        } else {
          setUserReservations([]);
        }
      } catch (err) {
        console.error("Error loading account data:", err);
      }
    }
  }, [isOpen, userProfile, allEvents]);

  // Remove event from favorites and sync with billboard
  const handleRemoveFavorite = (eventId: string) => {
    try {
      const email = (userProfile?.email || "").toLowerCase().trim();
      const favKey = email ? `user_favorites_${email}` : "organizer_favorites";
      const currentFavs = JSON.parse(localStorage.getItem(favKey) || "{}");
      delete currentFavs[eventId];

      localStorage.setItem(favKey, JSON.stringify(currentFavs));
      localStorage.setItem("organizer_favorites", JSON.stringify(currentFavs));

      setFavoriteEvents((prev) => prev.filter((evt) => evt.id !== eventId));

      fetch("/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, eventId, isFavorite: false }),
      }).catch(() => {});
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  // Load receipts for an organizer event
  const handleSelectManageEvent = async (event: Event) => {
    const rawVenue = event.venue?.trim();
    const uName = userProfile?.name?.trim().toLowerCase();
    const uVenue = userProfile?.venueName?.trim().toLowerCase();
    const cleanVenue = (rawVenue && rawVenue.toLowerCase() !== uName && rawVenue.toLowerCase() !== uVenue && !rawVenue.toLowerCase().startsWith("prueba")) ? rawVenue : "CUBIC";

    const cleanedEvent = { ...event, venue: cleanVenue };
    setManagingEvent(cleanedEvent);
    setEditEventForm({ ...cleanedEvent });
    setLoadingReceipts(true);
    setReceiptActionMessage(null);

    try {
      const res = await fetch(`/api/access-drop/receipts?eventId=${encodeURIComponent(event.id)}&eventTitle=${encodeURIComponent(event.title)}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.receipts && Array.isArray(data.receipts)) {
          setReceiptsList(data.receipts);
        } else {
          setReceiptsList([]);
        }
      } else {
        const localReceipts = JSON.parse(localStorage.getItem(`receipts_${event.id}`) || "[]");
        setReceiptsList(localReceipts);
      }
    } finally {
      setLoadingReceipts(false);
    }
  };

  const handleReviewReceipt = async (receiptId: string, action: "aprobado" | "rechazado", rejectionReason?: string) => {
    setReceiptsList((prev) => {
      const updated = prev.map((r) => (r.id === receiptId ? { ...r, status: action, rejectionReason } : r));
      if (managingEvent?.id) {
        localStorage.setItem(`receipts_${managingEvent.id}`, JSON.stringify(updated));
      }
      return updated;
    });

    if (viewingReceiptImage?.id === receiptId) {
      setViewingReceiptImage((prev: any) => (prev ? { ...prev, status: action, rejectionReason } : null));
    }

    try {
      await fetch(`/api/access-drop/receipts/${receiptId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          reviewedBy: userProfile?.venueName || userProfile?.name || "Organizador",
          rejectionReason: rejectionReason || (action === "rechazado" ? "Datos de depósito no coinciden con la cuenta." : undefined),
        }),
      });

      const storedPurchases = localStorage.getItem("nenez_purchased_tickets");
      if (storedPurchases) {
        try {
          const parsed = JSON.parse(storedPurchases);
          if (Array.isArray(parsed)) {
            const updatedPurchases = parsed.map((t: any) =>
              t.id === receiptId || t.referenceNumber?.includes(receiptId) || t.eventId === managingEvent?.id
                ? { ...t, status: action === "aprobado" ? "confirmed" : "rejected" }
                : t
            );
            localStorage.setItem("nenez_purchased_tickets", JSON.stringify(updatedPurchases));
            setUserPurchasedTickets(updatedPurchases);
          }
        } catch {}
      }
    } catch (err) {
      console.error("Error saving review:", err);
    }

    setReceiptActionMessage(
      action === "aprobado"
        ? "✓ Comprobante aprobado y guardado. Acceso digital y pase QR liberado al comprador."
        : "✕ Comprobante marcado como rechazado."
    );
    setTimeout(() => setReceiptActionMessage(null), 3500);
  };

  const handleSaveEditedEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEvt = configuringEvent || managingEvent;
    if (!targetEvt || !editEventForm) return;

    const eventDateStr = targetEvt.date || targetEvt.startsAt || "";
    const isPast = eventDateStr ? new Date(eventDateStr).getTime() < new Date().setHours(0, 0, 0, 0) : false;
    if (isPast) {
      alert("No se pueden editar eventos que ya han finalizado o cuya fecha ha pasado.");
      return;
    }

    const updated = { ...targetEvt, ...editEventForm } as Event;
    if (managingEvent) setManagingEvent(updated);
    if (configuringEvent) setConfiguringEvent(updated);

    setMyCreatedEvents((prev) => {
      const list = prev.map((evt) => (evt.id === updated.id ? updated : evt));
      localStorage.setItem("4go_created_events", JSON.stringify(list));
      return list;
    });

    setReceiptActionMessage("Evento actualizado correctamente.");
    setTimeout(() => setReceiptActionMessage(null), 3000);
    setConfiguringEvent(null);
  };

  const handleSavePartnerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPartner(true);
    setPartnerSaveSuccess(false);

    try {
      const email = (userProfile?.email || "usuario@ejemplo.com").trim().toLowerCase();
      const updated = {
        ...(userProfile || {}),
        name: editBrandName.trim(),
        venueName: editBrandName.trim(),
        avatar: editBrandLogo,
        instagram: editInstagram ? `@${editInstagram.replace(/^@/, "")}` : "",
        type: editType,
        address: editAddress,
        openingDays: editDays,
        hasCompletedOnboarding: true,
      };

      localStorage.setItem("organizer_profile", JSON.stringify(updated));
      localStorage.setItem(`organizer_profile_${email}`, JSON.stringify(updated));
      onUpdateProfile(updated);

      setPartnerSaveSuccess(true);
      setTimeout(() => setPartnerSaveSuccess(false), 3000);
    } finally {
      setIsSavingPartner(false);
    }
  };

  if (!isOpen) return null;

  // Calculate per-event statistics
  const approvedReceiptsCount = receiptsList.filter((r) => r.status === "aprobado").length;
  const pendingReceiptsCount = receiptsList.filter((r) => r.status === "en_verificacion" || !r.status).length;
  const eventBasePrice = managingEvent?.price || 10;
  const totalRevenueForEvent = receiptsList
    .filter((r) => r.status === "aprobado")
    .reduce((acc, r) => acc + (Number(r.totalAmount) || Number(r.quantity || 1) * eventBasePrice), 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22 }}
          className="w-full max-w-5xl bg-[#09090b] text-white rounded-[32px] border border-zinc-800 shadow-2xl overflow-hidden font-sans relative flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-zinc-800/80 bg-zinc-950/80 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-zinc-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white">
                    {userProfile?.venueName || userProfile?.name || "Mi Cuenta"}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-wider text-zinc-200 border border-white/15">
                    Partner 4GO
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-medium truncate max-w-xs">{userProfile?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Monochrome Tab Selector */}
          <div className="flex items-center gap-1.5 px-6 sm:px-8 py-2.5 bg-zinc-950/40 border-b border-zinc-800/60 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setActiveTab("events");
                setManagingEvent(null);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === "events"
                  ? "bg-white text-black font-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mis Eventos ({myCreatedEvents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("tickets");
                setManagingEvent(null);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === "tickets"
                  ? "bg-white text-black font-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Mis Tickets ({userPurchasedTickets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("reservations");
                setManagingEvent(null);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === "reservations"
                  ? "bg-white text-black font-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Mis Reservas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("favorites");
                setManagingEvent(null);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-white text-black font-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Mis Favoritos ({favoriteEvents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("partner_profile");
                setManagingEvent(null);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === "partner_profile"
                  ? "bg-white text-black font-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Datos de Partner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("payouts");
                setManagingEvent(null);
              }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === "payouts"
                  ? "bg-white text-black font-black shadow-md"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pagos y Liquidaciones</span>
            </button>
          </div>

          {/* Main Body */}
          <div className="overflow-y-auto px-6 sm:px-8 py-6 space-y-6 flex-1">
            
            {/* TAB 1: MIS EVENTOS */}
            {activeTab === "events" && !managingEvent && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white">
                      Eventos Creados con tu Cuenta
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Revisa recaudación, comprobantes por verificar y detalles de cada evento.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartCreateEvent?.();
                    }}
                    className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Publicar Nuevo Evento</span>
                  </button>
                </div>

                {myCreatedEvents.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                    <Calendar className="w-8 h-8 text-zinc-500 mx-auto" />
                    <h4 className="text-sm font-black uppercase text-white">
                      Aún no has creado eventos
                    </h4>
                    <p className="text-xs text-zinc-400 font-medium max-w-sm mx-auto">
                      Publica tu evento oficial en la cartelera de 4GO para empezar a recibir ventas de tickets.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onStartCreateEvent?.();
                        }}
                        className="px-5 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer"
                      >
                        Crear Evento Ahora →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myCreatedEvents.map((evt) => {
                      const eventDateStr = evt.date || evt.startsAt || "";
                      const isPast = eventDateStr ? new Date(eventDateStr).getTime() < new Date().setHours(0, 0, 0, 0) : false;
                      const displayVenue = (evt.venue && !evt.venue.toLowerCase().startsWith("prueba") && evt.venue.toLowerCase() !== (userProfile?.venueName || "").toLowerCase()) ? evt.venue : "CUBIC";

                      return (
                        <div
                          key={evt.id}
                          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition flex flex-col justify-between space-y-4 shadow-lg"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-16 h-20 rounded-xl overflow-hidden bg-black shrink-0 relative border border-zinc-700 shadow-md">
                              <img
                                src={evt.poster || "/images/4go_red_girl_showcase.jpg"}
                                alt={evt.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <h4 className="text-sm sm:text-base font-black uppercase text-white truncate">
                                {evt.title}
                              </h4>
                              <p className="text-xs text-zinc-400 font-medium truncate">
                                {displayVenue} • {evt.city || "Loja"}
                              </p>
                              <p className="text-xs text-zinc-500 font-medium">
                                {evt.dateLabel || evt.date}
                              </p>

                              <div className="pt-1 flex items-center gap-2 flex-wrap">
                                {isPast ? (
                                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[9.5px] font-bold uppercase border border-zinc-700">
                                    Evento Finalizado
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[9.5px] font-bold uppercase border border-white/20">
                                    Publicado / Activo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                            <button
                              type="button"
                              onClick={() => handleSelectManageEvent(evt)}
                              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                            >
                              <span>Gestionar Evento y Estadísticas</span>
                              <span>&gt;</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setConfiguringEvent(evt);
                                setEditEventForm({ ...evt, venue: displayVenue });
                              }}
                              className="w-full py-1.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                            >
                              <span>Configuración & Opciones del Evento</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MODAL: CONFIGURACIÓN & OPCIONES DEL EVENTO */}
            {configuringEvent && (() => {
              const eventDateStr = configuringEvent.date || configuringEvent.startsAt || "";
              const isPast = eventDateStr ? new Date(eventDateStr).getTime() < new Date().setHours(0, 0, 0, 0) : false;

              return (
                <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                  <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-1 bg-[#dfff28] rounded-full" />
                        <h3 className="text-lg font-black uppercase tracking-wider text-white">
                          Configuración & Opciones del Evento
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfiguringEvent(null)}
                        className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* 1. Promotores y Co-Organizadores */}
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                          Promotores y Co-Organizadores de este Evento
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">
                          Alianzas del Evento
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5 pt-1">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/70 border border-zinc-700 text-xs font-bold text-white shadow-sm">
                          <span>{configuringEvent.organizer || userProfile?.venueName || userProfile?.name || "Organizador Principal"}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white text-black font-black uppercase">
                            Principal
                          </span>
                        </div>

                        {configuringEvent.lineup && Array.isArray(configuringEvent.lineup) && configuringEvent.lineup.length > 1 ? (
                          configuringEvent.lineup.slice(1).map((coHost: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 border border-zinc-800 text-xs font-bold text-zinc-300"
                            >
                              <span>{coHost}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase">
                                Co-Host Confirmado
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-zinc-400 font-medium self-center">
                            Producción individual sin co-organizadores vinculados.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Editar Información del Evento */}
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                      <form onSubmit={handleSaveEditedEvent} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Editar Información del Evento
                          </h4>

                          {isPast ? (
                            <div className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-black uppercase">
                              <span>Evento Pasado (Edición Bloqueada)</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">
                              Edición Activa
                            </span>
                          )}
                        </div>

                        {isPast && (
                          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs text-zinc-400 font-medium">
                            Este evento ya finalizó en fecha <span className="text-white font-bold">{configuringEvent.dateLabel || configuringEvent.date}</span>. Los eventos pasados no pueden ser editados.
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                              Título del Evento
                            </label>
                            <input
                              type="text"
                              disabled={isPast}
                              value={editEventForm?.title || ""}
                              onChange={(e) => setEditEventForm((prev: any) => ({ ...prev, title: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-xl bg-black/70 border border-zinc-800 text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#dfff28]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                              Subtítulo / Sala
                            </label>
                            <input
                              type="text"
                              disabled={isPast}
                              value={editEventForm?.subtitle || ""}
                              onChange={(e) => setEditEventForm((prev: any) => ({ ...prev, subtitle: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-xl bg-black/70 border border-zinc-800 text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#dfff28]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                              Lugar / Venue
                            </label>
                            <input
                              type="text"
                              disabled={isPast}
                              value={editEventForm?.venue || ""}
                              onChange={(e) => setEditEventForm((prev: any) => ({ ...prev, venue: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-xl bg-black/70 border border-zinc-800 text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#dfff28]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                              Precio Base ($ USD)
                            </label>
                            <input
                              type="number"
                              disabled={isPast}
                              value={editEventForm?.price || 0}
                              onChange={(e) => setEditEventForm((prev: any) => ({ ...prev, price: Number(e.target.value) }))}
                              className="w-full px-4 py-2.5 rounded-xl bg-black/70 border border-zinc-800 text-xs sm:text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#dfff28]"
                            />
                          </div>
                        </div>

                        <div className="pt-3 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setConfiguringEvent(null)}
                            className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold uppercase transition"
                          >
                            Cancelar
                          </button>
                          {!isPast && (
                            <button
                              type="submit"
                              className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xl active:scale-95"
                            >
                              Guardar Cambios del Evento
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* EVENT MANAGEMENT VIEW */}
            {activeTab === "events" && managingEvent && (() => {
              const activeReceipt =
                receiptsList.find((r) => r.id === selectedReceiptId) ||
                receiptsList.find((r) => r.status === "pendiente") ||
                receiptsList[0] ||
                null;

              const eventImageSrc = managingEvent.imageUrl || managingEvent.poster || "/images/now4go-hero-presentation-hd-v3_3840w.jpg";
              const activeTotalQty = activeReceipt?.quantity || 1;
              const activeTotalAmount = activeReceipt?.totalAmount || activeTotalQty * eventBasePrice;
              const activeUnitPrice = activeReceipt?.totalAmount ? activeReceipt.totalAmount / activeTotalQty : eventBasePrice;

              const sanitizedPhone = (activeReceipt?.phone || "").replace(/[^0-9]/g, "");
              const whatsappNumber = sanitizedPhone.startsWith("593")
                ? sanitizedPhone
                : sanitizedPhone.startsWith("0")
                ? `593${sanitizedPhone.slice(1)}`
                : `593${sanitizedPhone}`;
              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `¡Hola ${activeReceipt?.firstName || ""}! Te saludamos de ${managingEvent.title} (NENEZ). Respecto a tu solicitud de compra #${(activeReceipt?.id || "").slice(0, 8)} por ${activeTotalQty} entrada(s)...`
              )}`;

              return (
                <div className="fixed inset-0 z-[700] overflow-y-auto bg-black text-white selection:bg-[#dfff28] selection:text-black">
                  {/* Dynamic Blurred Event Poster Atmosphere */}
                  <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
                    <div className="absolute inset-0 scale-125 transform-gpu">
                      <Image
                        src={eventImageSrc}
                        alt={managingEvent.title}
                        fill
                        priority
                        quality={20}
                        sizes="120px"
                        className="object-cover object-top scale-150 blur-[90px] saturate-200 brightness-110 opacity-85 transform-gpu will-change-transform"
                      />
                    </div>
                    <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black pointer-events-none" />
                  </div>

                  {/* Top Navigation Header Bar */}
                  <header className="fixed top-0 inset-x-0 z-[600] flex items-center justify-between px-4 sm:px-8 py-4 bg-gradient-to-b from-black/95 via-black/50 to-transparent pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setManagingEvent(null)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/70 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white backdrop-blur-xl transition-all duration-200 cursor-pointer shadow-2xl active:scale-95 text-xs font-bold uppercase tracking-wider"
                      >
                        <span>← Volver a Mis Eventos</span>
                      </button>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setConfiguringEvent(managingEvent);
                          setEditEventForm({ ...managingEvent });
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/70 hover:bg-white/20 border border-white/20 hover:border-white/40 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-xl transition-all duration-200 active:scale-95 shadow-2xl cursor-pointer"
                      >
                        <span>Configuración del Evento</span>
                      </button>
                    </div>
                  </header>

                  {/* Main Content Container */}
                  <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 pt-24 pb-28 space-y-10">
                    {receiptActionMessage && (
                      <div className="p-4 rounded-2xl bg-zinc-950/90 border border-[#dfff28]/50 text-white text-xs font-bold shadow-2xl backdrop-blur-xl">
                        <span>{receiptActionMessage}</span>
                      </div>
                    )}

                    {/* Dual-Column Request Review */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left Column: Requests List + Compact Receipt Preview + Buyer Info */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Event Brand Header */}
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/25 bg-black/40 shadow-2xl shrink-0">
                            <Image src={eventImageSrc} alt={managingEvent.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white truncate">
                              {managingEvent.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-300 mt-0.5">
                              <span>{managingEvent.dateLabel || managingEvent.date || "30 AGO 2026"} • {managingEvent.time || "22:00"}</span>
                              <span className="text-zinc-500">•</span>
                              <span className="text-zinc-400 font-medium">{managingEvent.venue || "CUBIC"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics Summary Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-xl space-y-0.5">
                            <span className="text-[9.5px] text-zinc-400 font-bold uppercase block">
                              Recaudado
                            </span>
                            <p className="text-base sm:text-lg font-black text-white">${totalRevenueForEvent.toFixed(2)} USD</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-xl space-y-0.5">
                            <span className="text-[9.5px] text-zinc-400 font-bold uppercase block">
                              Vendidas
                            </span>
                            <p className="text-base sm:text-lg font-black text-white">{approvedReceiptsCount} Pases</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-xl space-y-0.5">
                            <span className="text-[9.5px] text-zinc-400 font-bold uppercase block">
                              Por Verificar
                            </span>
                            <p className="text-base sm:text-lg font-black text-white">{pendingReceiptsCount} Solicitudes</p>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-xl space-y-0.5">
                            <span className="text-[9.5px] text-zinc-400 font-bold uppercase block">
                              Precio Base
                            </span>
                            <p className="text-base sm:text-lg font-black text-white">${eventBasePrice} USD</p>
                          </div>
                        </div>

                        {/* List of Purchase Requests */}
                        {receiptsList.length > 0 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                                SOLICITUDES DE COMPRA ({receiptsList.length})
                              </p>
                              <span className="text-[10px] text-zinc-400 font-medium">Selecciona una solicitud</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {receiptsList.map((r) => {
                                const isCurrent = activeReceipt?.id === r.id;
                                const rQty = r.quantity || 1;
                                const rTotal = r.totalAmount || rQty * eventBasePrice;

                                return (
                                  <div
                                    key={r.id}
                                    onClick={() => setSelectedReceiptId(r.id)}
                                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 ${
                                      isCurrent
                                        ? "bg-zinc-900 border-[#dfff28] shadow-[0_0_20px_rgba(223,255,40,0.2)] ring-1 ring-[#dfff28]"
                                        : "bg-black/50 border-white/10 hover:border-white/30 hover:bg-zinc-900/50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-xs font-black uppercase truncate ${isCurrent ? "text-[#dfff28]" : "text-white"}`}>
                                        {r.firstName} {r.lastName}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[8.5px] font-black uppercase border border-zinc-700">
                                        {r.status === "aprobado" ? "Confirmado" : r.status === "rechazado" ? "Rechazado" : "Pendiente"}
                                      </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                      <span className="font-bold text-zinc-300">{rQty}x Entrada (${rTotal} USD)</span>
                                      <span className="font-mono text-zinc-400 text-[10px]">Ref: {r.referenceNumber || "32561683"}</span>
                                    </div>

                                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                      <span className="text-[10px] text-zinc-400 font-bold uppercase">{getReceiptBankName(r)}</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedReceiptId(r.id);
                                          setViewingReceiptImage(r);
                                        }}
                                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase transition border border-white/15 cursor-pointer"
                                      >
                                        Ver Comprobante
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Active Request Details: Buyer Info */}
                        {activeReceipt ? (
                          <div className="space-y-4">
                            {/* Datos del Comprador & Entrega */}
                            <div className="rounded-2xl border border-white/15 bg-black/50 backdrop-blur-xl p-5 shadow-2xl space-y-3">
                              <div className="border-b border-white/10 pb-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                                  Datos del Comprador
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/10 space-y-0.5">
                                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Nombre Completo</span>
                                  <p className="font-black text-white uppercase">{activeReceipt.firstName} {activeReceipt.lastName}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/10 space-y-0.5">
                                  <span className="text-[10px] font-bold uppercase text-zinc-400 block">Cédula / Documento</span>
                                  <p className="font-mono font-medium text-white">{activeReceipt.cedula || "No especificado"}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/10 flex items-center justify-between">
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">Teléfono / WhatsApp</span>
                                    <p className="font-mono text-white truncate">{activeReceipt.phone || "No especificado"}</p>
                                  </div>
                                  <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-black text-[10px] font-black uppercase transition shadow-md shrink-0 ml-2"
                                  >
                                    WHATSAPP
                                  </a>
                                </div>

                                <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/10 flex items-center justify-between">
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400 block">Correo Electrónico</span>
                                    <p className="font-mono text-white truncate text-[11px]">{activeReceipt.email}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (navigator.clipboard) navigator.clipboard.writeText(activeReceipt.email);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase transition shrink-0 ml-2"
                                  >
                                    Copiar
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center rounded-2xl border border-white/10 bg-black/40 text-zinc-400 text-xs font-medium">
                            No hay solicitudes de compra pendientes para este evento.
                          </div>
                        )}
                      </div>

                      {/* Right Column: Floating Accept & Action Card (Sticky) */}
                      {activeReceipt && (
                        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                          <div className="rounded-[32px] bg-white text-zinc-900 p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl border border-white/40 space-y-6">
                            <div>
                              <h4 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
                                {activeTotalQty} {activeTotalQty === 1 ? "entrada" : "entradas"}
                              </h4>
                              <p className="text-2xl sm:text-3xl font-black text-zinc-800 mt-0.5">
                                Total — {activeTotalAmount.toFixed(0)} $
                              </p>
                            </div>

                            {/* Summary Details Card */}
                            <div className="rounded-2xl bg-zinc-100 p-4 space-y-2 border border-zinc-200 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">Comprador:</span>
                                <span className="font-black text-zinc-900 uppercase">{activeReceipt.firstName} {activeReceipt.lastName}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">Referencia:</span>
                                <span className="font-mono font-bold text-zinc-900">{activeReceipt.referenceNumber || "32561683"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">Método de pago:</span>
                                <span className="font-bold text-zinc-900 uppercase">{getReceiptBankName(activeReceipt)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-1 border-t border-zinc-200">
                                <span className="text-zinc-500 font-bold uppercase text-[9px]">Estado:</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-zinc-200 text-zinc-800 border border-zinc-300">
                                  {activeReceipt.status === "aprobado" ? "Confirmado" : activeReceipt.status === "rechazado" ? "Rechazado" : "Pendiente de Aceptación"}
                                </span>
                              </div>
                            </div>

                            {/* Primary Buttons */}
                            {activeReceipt.status !== "aprobado" ? (
                              <div className="space-y-3">
                                <button
                                  type="button"
                                  onClick={() => handleReviewReceipt(activeReceipt.id, "aprobado")}
                                  className="w-full py-4 px-4 rounded-2xl bg-[#dfff28] hover:bg-[#ebff52] text-black font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl transition active:scale-[0.98] cursor-pointer"
                                >
                                  <span>ACEPTAR Y EMITIR ENTRADA</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleReviewReceipt(activeReceipt.id, "rechazado")}
                                  className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-rose-50 text-rose-700 border border-zinc-200 font-bold text-xs uppercase tracking-wider transition active:scale-[0.98] cursor-pointer"
                                >
                                  <span>Rechazar Solicitud</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-3.5 text-center">
                                  <p className="text-xs font-black uppercase text-zinc-900">
                                    Pase Digital QR Emitido con Éxito
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleReviewReceipt(activeReceipt.id, "rechazado")}
                                  className="w-full text-xs text-zinc-500 hover:text-rose-700 font-bold uppercase py-2 transition text-center cursor-pointer"
                                >
                                  Cambiar a Rechazado
                                </button>
                              </div>
                            )}

                            {/* Security terms note */}
                            <div className="pt-2 border-t border-zinc-200 text-zinc-500 text-[10px] leading-relaxed">
                              <span>Al aceptar esta solicitud de compra, se validará el comprobante bancario, se generará el <strong>código QR dinámico único</strong> y se enviará la entrada digital con confirmación inmediata al correo y WhatsApp del comprador.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </main>
                </div>
              );
            })()}

            {/* TAB 2: MIS TICKETS */}
            {activeTab === "tickets" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Mis Entradas Compradas
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Tus pases de acceso con código QR adquiridos en 4GO.
                  </p>
                </div>

                {userPurchasedTickets.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                    <Ticket className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">
                      Aún no has comprado entradas para ningún evento.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userPurchasedTickets.map((tkt) => (
                      <div
                        key={tkt.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">
                              Pase #{tkt.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-white text-black text-[9.5px] font-black uppercase">
                              {tkt.status === "confirmed" ? "Confirmado • QR Activo" : "En Verificación"}
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-black text-white uppercase">
                            {tkt.eventTitle}
                          </h4>

                          <div className="space-y-0.5 text-xs text-zinc-400">
                            <p>📍 {tkt.venue}</p>
                            <p>🗓️ {tkt.date}</p>
                            <p className="font-semibold text-zinc-200">
                              {tkt.quantity}x {tkt.tierName} (${tkt.totalAmount} USD)
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-800">
                          <button
                            type="button"
                            onClick={() => setViewingTicketQr(tkt)}
                            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Ver Ticket</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MIS RESERVAS */}
            {activeTab === "reservations" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Mis Reservas de Mesas y Botellas VIP
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Reservas activas en discotecas aliadas y clubs nocturnos 4GO.
                  </p>
                </div>

                {userReservations.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                    <Building2 className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">
                      No tienes reservas de mesas activas en este momento.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userReservations.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-white uppercase">{res.venue}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[9.5px] font-bold uppercase">
                            {res.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-zinc-300">
                          <p className="font-bold text-white">{res.tableNumber}</p>
                          <p className="text-zinc-400">🗓️ {res.date} • {res.guests} Personas</p>
                          <p className="text-xs text-zinc-400 font-medium">🍾 Consumo: {res.bottles}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MIS FAVORITOS (SYNCED) */}
            {activeTab === "favorites" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Eventos Guardados en Favoritos
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Tus eventos guardados sincronizados con la cartelera oficial.
                  </p>
                </div>

                {favoriteEvents.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
                    <Heart className="w-8 h-8 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400 font-medium">
                      No tienes eventos guardados en favoritos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-3 relative group"
                      >
                        <div className="space-y-2">
                          <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-black relative border border-zinc-800 shadow-md">
                            <img
                              src={evt.poster || "/images/4go_red_girl_showcase.jpg"}
                              alt={evt.title}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(evt.id)}
                              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-red-500 flex items-center justify-center transition cursor-pointer backdrop-blur-md"
                            >
                              <Heart className="w-3.5 h-3.5 fill-red-500" />
                            </button>
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-white uppercase truncate">
                              {evt.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-medium">
                              {evt.venue} • {evt.dateLabel || evt.date}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenEventDetail?.(evt);
                          }}
                          className="w-full py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          Ver Evento →
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: DATOS DE PARTNER */}
            {activeTab === "partner_profile" && (
              <form onSubmit={handleSavePartnerProfile} className="space-y-5 max-w-2xl">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Configuración de Perfil Partner 4GO
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Estos datos se sincronizan con tus eventos y perfil público en la cartelera.
                  </p>
                </div>

                {partnerSaveSuccess && (
                  <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/30 text-white text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✓ Datos de Partner guardados correctamente.</span>
                  </div>
                )}

                {/* Logo Uploader */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {editBrandLogo ? (
                      <img src={editBrandLogo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="modal-edit-partner-logo-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setEditBrandLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="modal-edit-partner-logo-input"
                      className="inline-block px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition cursor-pointer"
                    >
                      {editBrandLogo ? "Cambiar Logo" : "Subir Logo de Marca"}
                    </label>
                    <p className="text-[10px] text-zinc-500 font-medium">Recomendado: 500x500px cuadrado.</p>
                  </div>
                </div>

                {/* Nombre Comercial */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Nombre de la Marca / Discoteca
                  </label>
                  <input
                    type="text"
                    required
                    value={editBrandName}
                    onChange={(e) => setEditBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:border-white transition font-medium"
                  />
                </div>

                {/* Instagram Handle */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Instagram Oficial (@usuario)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">@</span>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value.replace(/^@/, ""))}
                      placeholder="usuario_instagram"
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:border-white transition font-medium"
                    />
                  </div>
                </div>

                {/* Partner Type & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                      Partner Type
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-white focus:outline-none focus:border-white transition cursor-pointer"
                    >
                      <option value="Discoteca / Club">Discoteca / Club</option>
                      <option value="Organizador / Promotor">Organizador / Promotor</option>
                      <option value="Artista / DJ">Artista / DJ</option>
                      <option value="Venue / Espacio">Venue / Espacio</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      disabled
                      value={userProfile?.city || "Loja"}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-bold text-zinc-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Dirección Física */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                    Ubicación / Dirección Física
                  </label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Av. Salvador Bustamante Celi y Guayaquil, Loja"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:border-white transition font-medium"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingPartner || !editBrandName.trim()}
                    className="px-8 py-3 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-black uppercase tracking-widest transition shadow-xl cursor-pointer flex items-center gap-2"
                  >
                    {isSavingPartner ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Guardar Perfil Partner</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 6: PAGOS Y LIQUIDACIONES */}
            {activeTab === "payouts" && (
              <div className="space-y-5 max-w-3xl">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Historial de Pagos y Liquidaciones
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    Liquidaciones automáticas a tu cuenta bancaria registrada en Ecuador.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Total Recaudado</span>
                    <h4 className="text-2xl font-black text-white">
                      ${myCreatedEvents.length > 0 ? (myCreatedEvents.length * 120).toFixed(2) : "0.00"}
                    </h4>
                    <span className="text-[10px] text-zinc-300 font-bold">100% Recaudación neta</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Comisión de Plataforma</span>
                    <h4 className="text-2xl font-black text-white">$0.00</h4>
                    <span className="text-[10px] text-zinc-400 font-bold">0% Promo lanzamiento</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">Liquidado a Banco</span>
                    <h4 className="text-2xl font-black text-white">
                      ${myCreatedEvents.length > 0 ? (myCreatedEvents.length * 120).toFixed(2) : "0.00"}
                    </h4>
                    <span className="text-[10px] text-zinc-300 font-bold">✓ Al día</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">
                      Cuenta Bancaria Vinculada para Transferencias
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[9px] font-bold uppercase border border-white/15">
                      Verificada
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium">
                    Banco de Loja / Banco Pichincha • Cuenta Corriente • <span className="font-mono text-white">****-4819</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── LIGHTBOX: SOLO LA IMAGEN DEL COMPROBANTE ─── */}
      {viewingReceiptImage && (
        <div
          className="fixed inset-0 z-[850] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl"
          onClick={() => setViewingReceiptImage(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[92vh] flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Comprobante de Pago
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {getReceiptBankName(viewingReceiptImage)} • Ref: #{viewingReceiptImage.referenceNumber || viewingReceiptImage.id?.slice(0, 8)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setViewingReceiptImage(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider text-white transition active:scale-95 cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Clean Receipt Image */}
            <div className="w-full max-h-[82vh] overflow-auto rounded-2xl bg-black/80 border border-white/15 shadow-2xl flex items-center justify-center p-2">
              <img
                src={
                  viewingReceiptImage.filePath
                    ? viewingReceiptImage.filePath.startsWith("/")
                      ? viewingReceiptImage.filePath
                      : `/${viewingReceiptImage.filePath.replace(/\\/g, "/")}`
                    : viewingReceiptImage.receiptImage || `/api/access-drop/receipts/${viewingReceiptImage.id}?file=true`
                }
                alt="Comprobante Bancario"
                className="max-h-[78vh] w-auto object-contain rounded-xl select-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── TICKET PASS CINEMATIC MODAL ─── */}
      <TicketPassModal
        isOpen={!!viewingTicketQr}
        onClose={() => setViewingTicketQr(null)}
        ticket={viewingTicketQr}
      />
    </AnimatePresence>
  );
}

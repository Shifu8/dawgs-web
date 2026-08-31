"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReceiptRecord, ReceiptStatus } from "@/lib/access-drop/types";
import type { AdminEvent } from "@/lib/admin/types";
import PurchaseRequestReviewModal from "@/frontend/components/PurchaseRequestReviewModal";
import { Search, Eye, FileCheck, FileX, Clock, ShieldAlert } from "lucide-react";

type TabFilter = "todas" | ReceiptStatus;

export default function ReceiptReview() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>("todas");
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "todas") params.set("status", filter);
      if (search.trim()) params.set("search", search.trim());

      const [receiptRes, eventsRes] = await Promise.all([
        fetch(`/api/access-drop/receipts?${params}`),
        fetch(`/api/admin/events`).catch(() => null),
      ]);

      const data = await receiptRes.json();
      setReceipts(data.receipts || []);

      if (eventsRes && eventsRes.ok) {
        const evData = await eventsRes.json();
        setEvents(evData.events || []);
      }
    } catch (err) {
      console.error("Error loading receipts:", err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusBadge = (status: ReceiptStatus) => {
    switch (status) {
      case "pendiente":
        return <span className="rounded-full border border-amber-500/40 bg-amber-950/30 px-2.5 py-0.5 text-[9px] font-black text-amber-400 uppercase tracking-wider">PENDIENTE</span>;
      case "aprobado":
        return <span className="rounded-full border border-green-500/40 bg-green-950/30 px-2.5 py-0.5 text-[9px] font-black text-green-400 uppercase tracking-wider">APROBADO</span>;
      case "rechazado":
        return <span className="rounded-full border border-red-500/40 bg-red-950/30 px-2.5 py-0.5 text-[9px] font-black text-red-400 uppercase tracking-wider">RECHAZADO</span>;
    }
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "pendiente", label: "Pendientes" },
    { key: "aprobado", label: "Aprobadas" },
    { key: "rechazado", label: "Rechazadas" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Solicitudes de Compra</h1>
        <p className="mt-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Revisión, validación de comprobantes y emisión de tickets
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                filter === tab.key
                  ? "bg-[#dfff28] text-black font-black"
                  : "border border-white/10 bg-black/40 text-zinc-400 hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Buscar por comprador o teléfono..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-4 py-2.5 text-xs font-bold text-white placeholder-zinc-700 outline-none focus:border-[#dfff28]/50 sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#dfff28] border-t-transparent animate-spin" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-12 text-center">
          <p className="mt-4 text-sm font-bold text-zinc-500 uppercase tracking-wider">No hay solicitudes registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div
              key={receipt.id}
              onClick={() => setSelectedReceipt(receipt)}
              className="rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-[#dfff28]/40 hover:bg-white/[0.03] cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                  receipt.status === "aprobado"
                    ? "border-emerald-500/30 bg-emerald-950/40 text-emerald-400"
                    : receipt.status === "rechazado"
                    ? "border-rose-500/30 bg-rose-950/40 text-rose-400"
                    : "border-amber-500/30 bg-amber-950/40 text-amber-400"
                }`}>
                  {receipt.status === "aprobado" ? (
                    <FileCheck className="h-5 w-5" />
                  ) : receipt.status === "rechazado" ? (
                    <FileX className="h-5 w-5" />
                  ) : (
                    <ShieldAlert className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-white uppercase tracking-wider truncate group-hover:text-[#dfff28] transition">
                    {receipt.firstName} {receipt.lastName}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-500 truncate">
                    {receipt.phone} &middot; Ref: {receipt.referenceNumber || "S/R"} &middot; {receipt.quantity} entrada(s)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(receipt.status)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReceipt(receipt);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase text-zinc-300 hover:text-white hover:bg-white/10 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Revisar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── FULLSCREEN MODAL REVIEW EXPERIENCE ─── */}
      <PurchaseRequestReviewModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
        events={events}
        onStatusUpdated={loadData}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, QrCode, UserPlus, Check, Copy, Link, ShieldCheck, Trash2, Users } from "lucide-react";

interface CoOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  currentOrganizers: string[];
  onUpdateOrganizers: (organizers: string[]) => void;
}

const AVAILABLE_ORGANIZERS = [
  { id: "cubic", name: "Cubic", type: "Discoteca / Club", avatar: "🏢" },
  { id: "4go", name: "4Go", type: "Productora / Eventos", avatar: "⚡" },
  { id: "wave-music", name: "Wave Music", type: "Sello Discográfico", avatar: "🌊" },
  { id: "nenez-official", name: "NENEZ Official", type: "Plataforma Base", avatar: "🔥" },
  { id: "loja-night", name: "Loja Nightlife", type: "Colectivo Urbano", avatar: "🌃" },
];

export default function CoOrganizerModal({
  isOpen,
  onClose,
  eventTitle,
  currentOrganizers,
  onUpdateOrganizers,
}: CoOrganizerModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "invite" | "qr">("list");
  const [organizers, setOrganizers] = useState<string[]>(currentOrganizers);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState("");

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/organizer/join-event?event=${encodeURIComponent(eventTitle)}`
    : `https://now4go.app/organizer/join-event?event=${encodeURIComponent(eventTitle)}`;

  const handleAddOrganizer = (name: string) => {
    if (!name || organizers.some((o) => o.toLowerCase() === name.toLowerCase())) return;
    const updated = [...organizers, name];
    setOrganizers(updated);
    onUpdateOrganizers(updated);
    setSelectedToAdd("");
  };

  const handleRemoveOrganizer = (name: string) => {
    if (organizers.length <= 1) return; // Must have at least 1 main organizer
    const updated = organizers.filter((o) => o.toLowerCase() !== name.toLowerCase());
    setOrganizers(updated);
    onUpdateOrganizers(updated);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl bg-[#0c0814] border border-white/15 p-6 shadow-2xl space-y-5 text-white overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 tracking-wider">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Colaboración & Co-Organizadores</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
                {eventTitle}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                activeTab === "list" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Organizadores ({organizers.length})
            </button>
            <button
              onClick={() => setActiveTab("invite")}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                activeTab === "invite" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Enlace
            </button>
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                activeTab === "qr" ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Código QR
            </button>
          </div>

          {/* Tab 1: Current Organizers & Quick Add */}
          {activeTab === "list" && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Los organizadores vinculados aparecerán en la entrada y banner del evento para los usuarios.
              </p>

              {/* Active Organizers List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {organizers.map((org, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs flex items-center justify-center uppercase">
                        {org.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>{org}</span>
                          {index === 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase">
                              Principal
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium">Co-Organizador verificado</span>
                      </div>
                    </div>
                    {organizers.length > 1 && index !== 0 && (
                      <button
                        onClick={() => handleRemoveOrganizer(org)}
                        className="p-2 text-zinc-500 hover:text-red-400 transition"
                        title="Quitar organizador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Organizer Selector */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Vincular Nuevo Organizador
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedToAdd}
                    onChange={(e) => setSelectedToAdd(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-xl bg-zinc-900 border border-white/15 text-white text-xs focus:outline-none focus:border-white/30"
                  >
                    <option value="">Seleccionar organizador existente...</option>
                    {AVAILABLE_ORGANIZERS.filter(
                      (item) => !organizers.some((o) => o.toLowerCase() === item.name.toLowerCase())
                    ).map((item) => (
                      <option key={item.id} value={item.name} className="bg-zinc-900 text-white">
                        {item.avatar} {item.name.toUpperCase()} ({item.type})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAddOrganizer(selectedToAdd)}
                    disabled={!selectedToAdd}
                    className="px-4 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Invitation Link */}
          {activeTab === "invite" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center mx-auto">
                <Link className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase">Enlace Único de Co-Host</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Envía este enlace a otra discoteca o productora para enlazar este evento automáticamente.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-300 font-mono truncate">{inviteLink}</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: QR Code Pairing */}
          {activeTab === "qr" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase">Escaneo QR de Enlace</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Escanea desde el panel del co-organizador para solicitar aprobación e integrar el evento.
                </p>
              </div>

              {/* Simulated QR Visual */}
              <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex flex-col items-center justify-center shadow-lg border border-white/20">
                {/* SVG Mock QR Code */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path
                    fill="#000"
                    d="M0 0h30v30H0zM8 8h14v14H8zM70 0h30v30H70zM78 8h14v14H78zM0 70h30v30H0zM8 78h14v14H8zM40 10h10v10H40zM50 20h10v10H50zM40 40h20v20H40zM10 40h10v20H10zM70 40h20v10H70zM80 60h20v20H80zM40 80h10v20H40zM60 70h10v30H60z"
                  />
                </svg>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono block">CÓDIGO DE ENLACE: PARTY-COHOST-9941</span>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

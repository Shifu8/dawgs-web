"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  ShieldCheck,
  Trash2,
  Share2,
  Clock,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";

interface CoOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  currentOrganizers: string[];
  onUpdateOrganizers: (organizers: string[]) => void;
}

export default function CoOrganizerModal({
  isOpen,
  onClose,
  eventTitle,
  currentOrganizers,
  onUpdateOrganizers,
}: CoOrganizerModalProps) {
  const [organizers, setOrganizers] = useState<string[]>(currentOrganizers);
  const [pendingInvites, setPendingInvites] = useState<{ id: string; name: string; date: string }[]>([
    { id: "inv_1", name: "Sata Music", date: "Pendiente de aceptación" },
  ]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [newInviteOrgName, setNewInviteOrgName] = useState("");
  const [inviteCreated, setInviteCreated] = useState(false);

  const inviteToken = Buffer.from(`${eventTitle}-${Date.now()}`).toString("base64").slice(0, 16);
  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/organizer/join-event?event=${encodeURIComponent(eventTitle)}&token=${inviteToken}`
    : `https://now4go.app/organizer/join-event?event=${encodeURIComponent(eventTitle)}&token=${inviteToken}`;

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteOrgName.trim()) return;

    setPendingInvites((prev) => [
      ...prev,
      {
        id: `inv_${Date.now()}`,
        name: newInviteOrgName.trim(),
        date: "Pendiente de aceptación",
      },
    ]);
    setNewInviteOrgName("");
    setInviteCreated(true);
  };

  const handleRemoveOrganizer = (name: string) => {
    if (organizers.length <= 1) return;
    const updated = organizers.filter((o) => o.toLowerCase() !== name.toLowerCase());
    setOrganizers(updated);
    onUpdateOrganizers(updated);
  };

  const handleRemovePending = (id: string) => {
    setPendingInvites((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl bg-white text-zinc-900 rounded-[28px] p-6 sm:p-8 shadow-2xl border border-zinc-200 overflow-hidden font-sans relative max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <Users className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900">
                  Co-Organizadores y Promotores
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Invita a otras productoras o clubs mediante enlace único de consentimiento.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto pr-1 py-4 space-y-5 flex-1">
            {/* Consent Policy Notice */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protocolo de Consentimiento de Marca</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                Por seguridad y protección de marca, ningún promotor puede ser añadido sin su aceptación. Al generar el enlace, el co-organizador deberá abrirlo con su cuenta para aceptar la coproducción.
              </p>
            </div>

            {/* Unique Invite Link Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Enlace Único de Invitación Oficial
              </label>
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <LinkIcon className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-xs text-zinc-700 font-mono truncate">{inviteLink}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generate named invitation */}
            <form onSubmit={handleGenerateInvite} className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Enviar invitación nominal a un club o promotor
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInviteOrgName}
                  onChange={(e) => setNewInviteOrgName(e.target.value)}
                  placeholder="Nombre de la marca o discoteca (Ej. Paradox Club)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!newInviteOrgName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer shrink-0"
                >
                  Generar Invitación
                </button>
              </div>
            </form>

            {/* List of Organizers and Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Promotores Vinculados al Evento
              </label>

              <div className="space-y-2">
                {/* Active Organizers */}
                {organizers.map((org, index) => (
                  <div
                    key={`org-${index}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white font-black text-xs flex items-center justify-center uppercase shadow-sm">
                        {org.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
                          <span>{org}</span>
                          {index === 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[9px] font-extrabold uppercase">
                              Principal / Creador
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                              Confirmado
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">Aparece en la cartelera oficial</span>
                      </div>
                    </div>

                    {organizers.length > 1 && index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrganizer(org)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Quitar organizador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Pending Invites */}
                {pendingInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center uppercase">
                        <Clock className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
                          <span>{inv.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[9px] font-extrabold uppercase">
                            Esperando Aceptación
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-medium">
                          El organizador debe aceptar vía el enlace
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePending(inv.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Cancelar invitación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition shadow-lg active:scale-95 cursor-pointer"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

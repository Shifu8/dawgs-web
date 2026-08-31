"use client";

import React, { useState } from "react";
import { X, ChevronDown, Check, Building, Sparkles, MapPin, Phone, ArrowRight, ShieldCheck, CheckCircle2, Disc3, Mic2, Building2, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PartnerTypeOption {
  id: string;
  title: string;
  subtitle: string;
  iconName: "party" | "club" | "artist" | "venue";
}

export const PARTNER_TYPES: PartnerTypeOption[] = [
  {
    id: "Promotor / Organizador",
    title: "Promoter",
    subtitle: "Organizas eventos, fiestas o festivales",
    iconName: "party",
  },
  {
    id: "Discoteca / Club",
    title: "Club / Discoteca",
    subtitle: "Tienes un establecimiento fijo o club nocturno",
    iconName: "club",
  },
  {
    id: "Artista / DJ",
    title: "Artist",
    subtitle: "Te presentas o realizas shows en vivo",
    iconName: "artist",
  },
  {
    id: "Venue / Espacio",
    title: "Venue / Espacio",
    subtitle: "Alquilas recintos o locales para eventos",
    iconName: "venue",
  },
];

interface OrganizerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: {
    id: string;
    name: string;
    email: string;
    type: string;
    venueName: string;
    city: string;
  }) => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    type?: string;
    venueName?: string;
    city?: string;
  } | null;
}

export default function OrganizerOnboardingModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: OrganizerOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPartner, setSelectedPartner] = useState<PartnerTypeOption>(PARTNER_TYPES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [companyName, setCompanyName] = useState(currentUser?.venueName || currentUser?.name || "");
  const [displayName, setDisplayName] = useState(currentUser?.venueName || currentUser?.name || "");
  const [city, setCity] = useState(currentUser?.city || "Quito");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !displayName.trim()) return;

    setIsSubmitting(true);
    try {
      const email = currentUser?.email || "brandon.medina@unl.edu.ec";
      const name = displayName.trim();

      const res = await fetch("/api/users/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          provider: "google",
          type: selectedPartner.id,
          venueName: displayName.trim(),
          city,
        }),
      });

      const data = await res.json();
      const cleanEmail = email.trim().toLowerCase();
      const updatedUser = {
        ...(data.user || {}),
        id: currentUser?.id || data.user?.id || `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        type: selectedPartner.id,
        venueName: displayName.trim(),
        city,
        hasCompletedOnboarding: true,
      };

      localStorage.setItem("organizer_token", `token-${cleanEmail}-${Date.now()}`);
      localStorage.setItem("organizer_profile", JSON.stringify(updatedUser));
      localStorage.setItem(`organizer_profile_${cleanEmail}`, JSON.stringify(updatedUser));

      onSuccess(updatedUser);
      onClose();
    } catch (err) {
      console.error("Error updating organizer profile:", err);
      const cleanEmail = (currentUser?.email || "usuario@ejemplo.com").trim().toLowerCase();
      const fallbackUser = {
        id: currentUser?.id || `usr_${Date.now()}`,
        name: displayName.trim(),
        email: cleanEmail,
        type: selectedPartner.id,
        venueName: displayName.trim(),
        city,
        hasCompletedOnboarding: true,
      };
      localStorage.setItem("organizer_profile", JSON.stringify(fallbackUser));
      localStorage.setItem(`organizer_profile_${cleanEmail}`, JSON.stringify(fallbackUser));
      onSuccess(fallbackUser);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white text-zinc-900 rounded-[32px] p-6 sm:p-10 shadow-2xl border border-zinc-200 overflow-hidden font-sans relative"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Stepper Indicator Header (Image #2 Style) */}
          <div className="flex items-center gap-2 sm:gap-4 pb-6 mb-6 border-b border-zinc-100 text-xs sm:text-sm font-bold text-zinc-400">
            <span className={`flex items-center gap-1.5 ${currentStep === 1 ? "text-zinc-900 font-extrabold" : "text-zinc-400"}`}>
              <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Cuenta de Promotor</span>
            </span>
            <span className="text-zinc-300">→</span>
            <span className={`flex items-center gap-1.5 ${currentStep === 2 ? "text-zinc-900 font-extrabold" : "text-zinc-400"}`}>
              <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Crear Evento</span>
            </span>
            <span className="text-zinc-300">→</span>
            <span className={`flex items-center gap-1.5 ${currentStep === 3 ? "text-zinc-900 font-extrabold" : "text-zinc-400"}`}>
              <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-600 text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Publicar</span>
            </span>
          </div>

          {/* Hero Header & Illustration */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="space-y-1.5 max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-zinc-700" />
                <span>Eleva tu Cuenta a Partner 4GO</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 leading-tight tracking-tight">
                Crea y gestiona tus eventos, vende entradas digitales y haz crecer tu audiencia.
              </h2>
            </div>

            {/* Clean Modern Badge */}
            <div className="hidden sm:flex items-center justify-center shrink-0 w-16 h-16 bg-zinc-100 rounded-2xl border border-zinc-200 text-zinc-900 shadow-sm">
              <Building2 className="w-8 h-8 text-zinc-800" />
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid for Company Name & Display Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Company name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nombre legal o comercial"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition"
                />
                <p className="text-[11px] text-zinc-400 font-medium">Tal como está registrada legalmente.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Display name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nombre público del club o marca"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition"
                />
                <p className="text-[11px] text-zinc-400 font-medium">Usado para la visualización pública de tus eventos.</p>
              </div>
            </div>

            {/* Partner type Selection Dropdown (DICE.FM Style) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Partner type
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 hover:border-black text-left transition cursor-pointer focus:outline-none focus:bg-white"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-800">
                      {selectedPartner.iconName === "party" && <PartyPopper className="w-3.5 h-3.5" />}
                      {selectedPartner.iconName === "club" && <Disc3 className="w-3.5 h-3.5" />}
                      {selectedPartner.iconName === "artist" && <Mic2 className="w-3.5 h-3.5" />}
                      {selectedPartner.iconName === "venue" && <Building2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-900">{selectedPartner.title}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-30 divide-y divide-zinc-100">
                    {PARTNER_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setSelectedPartner(type);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition ${
                          selectedPartner.id === type.id ? "bg-zinc-100 font-bold" : ""
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-800">
                              {type.iconName === "party" && <PartyPopper className="w-3.5 h-3.5" />}
                              {type.iconName === "club" && <Disc3 className="w-3.5 h-3.5" />}
                              {type.iconName === "artist" && <Mic2 className="w-3.5 h-3.5" />}
                              {type.iconName === "venue" && <Building2 className="w-3.5 h-3.5" />}
                            </span>
                            <span>{type.title}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500">{type.subtitle}</p>
                        </div>
                        {selectedPartner.id === type.id && (
                          <Check className="w-4 h-4 text-black shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* City Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition appearance-none cursor-pointer"
                >
                  <option value="Quito">Quito</option>
                  <option value="Guayaquil">Guayaquil</option>
                  <option value="Cuenca">Cuenca</option>
                  <option value="Manta">Manta</option>
                  <option value="Loja">Loja</option>
                  <option value="Ambato">Ambato</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  WhatsApp Contacto
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="099 123 4567"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3.5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !companyName.trim() || !displayName.trim()}
                className="px-8 py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>Siguiente: Crear Evento</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

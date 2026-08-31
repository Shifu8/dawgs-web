"use client";

import React, { useState } from "react";
import { X, MapPin, Search, Check, Navigation, ExternalLink, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVenue?: string;
  initialAddress?: string;
  onSelectLocation: (venue: string, address: string, lat?: number, lng?: number) => void;
}

const PRESET_VENUES = [
  {
    name: "Cubic Club",
    address: "Av. Salvador Bustamante Celi y Guayaquil, Loja",
    city: "Loja",
    lat: -3.9856,
    lng: -79.2012,
  },
  {
    name: "Paradox Venue",
    address: "Av. Manuel Agustín Aguirre y 10 de Agosto, Loja",
    city: "Loja",
    lat: -3.9931,
    lng: -79.2045,
  },
  {
    name: "Quinta Punnzara",
    address: "Vía a Vilcabamba Km 4, Sector Punnzara, Loja",
    city: "Loja",
    lat: -4.0215,
    lng: -79.2154,
  },
  {
    name: "Colegio de Ingenieros Civiles",
    address: "Av. Reinaldo Espinosa, La Argelia, Loja",
    city: "Loja",
    lat: -4.0321,
    lng: -79.2018,
  },
  {
    name: "Grand Victoria Boutique Hotel",
    address: "Bernardo Valdivieso y José Antonio Eguiguren, Loja",
    city: "Loja",
    lat: -3.9967,
    lng: -79.2052,
  },
  {
    name: "SATA Music Club",
    address: "Av. Universitaria y Rocafuerte, Loja",
    city: "Loja",
    lat: -3.9982,
    lng: -79.2039,
  },
];

export default function LocationPickerModal({
  isOpen,
  onClose,
  initialVenue = "",
  initialAddress = "",
  onSelectLocation,
}: LocationPickerModalProps) {
  const [venueName, setVenueName] = useState(initialVenue);
  const [address, setAddress] = useState(initialAddress);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: -3.9931,
    lng: -79.2045,
  });
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_VENUES[0]) => {
    setVenueName(preset.name);
    setAddress(preset.address);
    setSelectedCoords({ lat: preset.lat, lng: preset.lng });
  };

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ", Ecuador"
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const top = data[0];
        const lat = parseFloat(top.lat);
        const lng = parseFloat(top.lon);
        setSelectedCoords({ lat, lng });
        setAddress(top.display_name.split(",").slice(0, 3).join(","));
        if (!venueName) {
          setVenueName(searchQuery);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    onSelectLocation(venueName.trim() || "Lugar del Evento", address.trim() || venueName.trim(), selectedCoords.lat, selectedCoords.lng);
    onClose();
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    address || venueName || `${selectedCoords.lat},${selectedCoords.lng}`
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white text-zinc-900 rounded-[28px] p-6 sm:p-8 shadow-2xl border border-zinc-200 overflow-hidden font-sans relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <MapPin className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900">
                  Seleccionar Ubicación en Mapa
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Elige un local aliado o busca la dirección exacta para tu evento.
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

          <div className="overflow-y-auto pr-1 py-4 space-y-4 flex-1">
            {/* Search Bar */}
            <form onSubmit={handleSearchAddress} className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Buscar dirección o punto de referencia
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ej. Av. Salvador Bustamante Celi, Loja"
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  {isSearching ? "Buscando..." : "Buscar"}
                </button>
              </div>
            </form>

            {/* Quick Venue Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                Locales y escenarios populares
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_VENUES.map((preset) => {
                  const isSelected = venueName.toLowerCase() === preset.name.toLowerCase();
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-black text-white shadow-sm"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Map Preview Card */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Vista Previa en Google Maps
                </label>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    address || venueName || "Loja, Ecuador"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-zinc-600 hover:text-black flex items-center gap-1 transition"
                >
                  <span>Abrir en Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-zinc-300 bg-zinc-100 relative shadow-inner">
                <iframe
                  title="Vista de Mapa"
                  src={mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Editable Confirmation Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Nombre del Establecimiento / Lugar
                </label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Ej. CUBIC Loja"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 font-semibold focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
                  Dirección Física Completa
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Av. Salvador Bustamante Celi y Guayaquil"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs sm:text-sm text-zinc-900 font-medium focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!venueName.trim() && !address.trim()}
              className="px-7 py-2.5 rounded-full bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest transition shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Ubicación</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

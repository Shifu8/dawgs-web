"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface OrganizerProfile {
  id: string;
  org_name: string;
  display_name: string;
  city: string;
  logo_url: string | null;
}

interface OrgEvent {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  city: string;
  event_date: string;
  status: string;
  tickets_sold: number;
  base_price: number;
  poster_url: string | null;
  capacity: number | null;
  created_at: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("organizer_token");
}

function authHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

type TabKey = "events" | "create";

export default function OrganizerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<OrganizerProfile | null>(null);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("events");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [newEvent, setNewEvent] = useState({
    title: "",
    subtitle: "",
    description: "",
    category: "",
    city: "Loja",
    venue: "",
    address: "",
    event_date: "",
    starts_at: "",
    ends_at: "",
    age_restriction: "",
    base_price: "0",
    capacity: "",
  });

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push("/organizer/login"); return; }

    try {
      const [profileRes, eventsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/v1/organizers/me`, { headers: authHeaders() }),
        fetch(`${BACKEND_URL}/api/v1/organizer/events`, { headers: authHeaders() }),
      ]);

      if (profileRes.status === 401 || eventsRes.status === 401) {
        localStorage.removeItem("organizer_token");
        router.push("/organizer/login");
        return;
      }

      const profileData = await profileRes.json();
      const eventsData = await eventsRes.json();

      setProfile(profileData);
      setEvents(eventsData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!newEvent.title.trim()) return setCreateError("El nombre del evento es requerido.");
    if (!newEvent.event_date.trim()) return setCreateError("La fecha del evento es requerida.");

    setCreating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/organizer/events`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          ...newEvent,
          base_price: parseFloat(newEvent.base_price) || 0,
          capacity: newEvent.capacity ? parseInt(newEvent.capacity) : null,
          subtitle: newEvent.subtitle || undefined,
          description: newEvent.description || undefined,
          category: newEvent.category || undefined,
          venue: newEvent.venue || undefined,
          address: newEvent.address || undefined,
          starts_at: newEvent.starts_at || undefined,
          ends_at: newEvent.ends_at || undefined,
          age_restriction: newEvent.age_restriction || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || data.detail?.[0]?.msg || "Error al crear el evento.");
        return;
      }

      router.push(`/organizer/events/${data.id}`);
    } catch {
      setCreateError("Error de conexión.");
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("organizer_token");
    localStorage.removeItem("organizer_refresh");
    localStorage.removeItem("organizer_profile");
    router.push("/");
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      draft: { label: "Borrador", cls: "bg-zinc-800 text-zinc-400 border-zinc-700" },
      published: { label: "Publicado", cls: "bg-white/10 text-white border-white/20" },
      cancelled: { label: "Cancelado", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
      finished: { label: "Finalizado", cls: "bg-zinc-800 text-zinc-500 border-zinc-700" },
    };
    const s = map[status] || map.draft;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-52 bg-zinc-950/80 border-r border-white/5 flex flex-col z-40 backdrop-blur-xl">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="text-base font-black tracking-widest text-white">
            NOW<span className="text-zinc-500">4GO</span>
          </div>
          <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">
            Panel Organizador
          </div>
        </div>

        {/* Profile */}
        {profile && (
          <div className="px-5 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-black text-white mb-2">
              {profile.org_name.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-xs font-black text-white truncate">{profile.display_name}</div>
            <div className="text-[9px] text-zinc-600 truncate">{profile.city}</div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { key: "events" as TabKey, label: "Mis Eventos", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { key: "create" as TabKey, label: "Crear Evento", icon: "M12 4v16m8-8H4" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                activeTab === item.key
                  ? "bg-white/10 text-white"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-white/3"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}

          <div className="pt-2">
            <button
              onClick={() => router.push("/events")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-600 hover:text-zinc-300 hover:bg-white/3 transition"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
              Ver Plataforma
            </button>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="pl-52 min-h-screen">
        <div className="p-8 max-w-5xl">

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">Mis Eventos</h2>
                  <p className="text-zinc-600 text-xs mt-0.5">{events.length} evento{events.length !== 1 ? "s" : ""} en total</p>
                </div>
                <button
                  onClick={() => setActiveTab("create")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition active:scale-95"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Evento
                </button>
              </div>

              {events.length === 0 ? (
                <div className="text-center py-20 bg-white/2 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-zinc-500 font-black text-sm mb-1">Aún no tienes eventos</p>
                  <p className="text-zinc-700 text-xs mb-5">Crea tu primer evento y publícalo en la plataforma</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition"
                  >
                    Crear Evento
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(evt => (
                    <div
                      key={evt.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 hover:bg-white/4 transition cursor-pointer"
                      onClick={() => router.push(`/organizer/events/${evt.id}`)}
                    >
                      {/* Poster thumb */}
                      <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {evt.poster_url ? (
                          <img src={evt.poster_url} alt={evt.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-black text-zinc-600">{evt.title.slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-black text-white truncate">{evt.title}</span>
                          {statusBadge(evt.status)}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                          <span>{evt.event_date}</span>
                          <span>·</span>
                          <span>{evt.city}</span>
                          <span>·</span>
                          <span>{evt.tickets_sold} entradas vendidas</span>
                          {evt.capacity && <><span>·</span><span>Cap. {evt.capacity}</span></>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black text-white">${evt.base_price}</span>
                        <svg className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Event Tab */}
          {activeTab === "create" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-white">Crear Nuevo Evento</h2>
                <p className="text-zinc-600 text-xs mt-0.5">El evento se guardará como borrador. Puedes publicarlo cuando esté listo.</p>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-5 max-w-xl">
                {/* Basic info */}
                <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Información básica</p>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Nombre del evento *</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                      placeholder="Ej: Asteria Fest 3, Nocturn Loud..."
                      className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Subtítulo</label>
                    <input
                      type="text"
                      value={newEvent.subtitle}
                      onChange={e => setNewEvent(p => ({ ...p, subtitle: e.target.value }))}
                      placeholder="Una línea descriptiva corta"
                      className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Descripción</label>
                    <textarea
                      value={newEvent.description}
                      onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                      placeholder="Describe tu evento..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Categoría</label>
                      <select
                        value={newEvent.category}
                        onChange={e => setNewEvent(p => ({ ...p, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/8 text-white text-sm focus:outline-none focus:border-white/25 transition"
                      >
                        <option value="">Seleccionar...</option>
                        {["Festival", "Club", "Concierto", "Electrónica", "Reggaeton", "Urban", "Indie", "Trap", "Latin"].map(c => (
                          <option key={c} value={c} className="bg-zinc-900">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Restricción de edad</label>
                      <select
                        value={newEvent.age_restriction}
                        onChange={e => setNewEvent(p => ({ ...p, age_restriction: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/8 text-white text-sm focus:outline-none focus:border-white/25 transition"
                      >
                        <option value="">Sin restricción</option>
                        <option value="+18" className="bg-zinc-900">+18</option>
                        <option value="+16" className="bg-zinc-900">+16</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location & Time */}
                <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Lugar y fecha</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Ciudad *</label>
                      <select
                        value={newEvent.city}
                        onChange={e => setNewEvent(p => ({ ...p, city: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-white/8 text-white text-sm focus:outline-none focus:border-white/25 transition"
                      >
                        {["Loja", "Quito", "Guayaquil", "Cuenca", "Ambato", "Manta", "Ibarra"].map(c => (
                          <option key={c} value={c} className="bg-zinc-900">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Local / Venue</label>
                      <input
                        type="text"
                        value={newEvent.venue}
                        onChange={e => setNewEvent(p => ({ ...p, venue: e.target.value }))}
                        placeholder="Nombre del lugar"
                        className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Dirección</label>
                    <input
                      type="text"
                      value={newEvent.address}
                      onChange={e => setNewEvent(p => ({ ...p, address: e.target.value }))}
                      placeholder="Dirección completa"
                      className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Fecha * (ej: 15 AGO 2026)</label>
                      <input
                        type="text"
                        value={newEvent.event_date}
                        onChange={e => setNewEvent(p => ({ ...p, event_date: e.target.value }))}
                        placeholder="15 AGO 2026"
                        className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Hora inicio</label>
                      <input
                        type="time"
                        value={newEvent.starts_at}
                        onChange={e => setNewEvent(p => ({ ...p, starts_at: e.target.value }))}
                        className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white text-sm focus:outline-none focus:border-white/25 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Hora fin</label>
                      <input
                        type="time"
                        value={newEvent.ends_at}
                        onChange={e => setNewEvent(p => ({ ...p, ends_at: e.target.value }))}
                        className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white text-sm focus:outline-none focus:border-white/25 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Tickets */}
                <div className="p-5 rounded-2xl bg-white/2 border border-white/5 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Entradas y aforo</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Precio base ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={newEvent.base_price}
                        onChange={e => setNewEvent(p => ({ ...p, base_price: e.target.value }))}
                        className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white text-sm focus:outline-none focus:border-white/25 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Aforo máximo</label>
                      <input
                        type="number"
                        min="1"
                        value={newEvent.capacity}
                        onChange={e => setNewEvent(p => ({ ...p, capacity: e.target.value }))}
                        placeholder="Sin límite"
                        className="w-full h-10 px-4 rounded-xl bg-white/5 border border-white/8 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-white/25 transition"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-700">
                    Podrás agregar tipos de entrada (General, VIP, Early Bird...) una vez creado el evento.
                  </p>
                </div>

                {createError && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("events")}
                    className="flex-1 h-11 rounded-full border border-white/10 bg-white/3 text-zinc-400 text-xs font-black uppercase tracking-widest hover:border-white/20 hover:text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 h-11 rounded-full bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition active:scale-95 disabled:opacity-50"
                  >
                    {creating ? "Creando..." : "Crear Evento"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

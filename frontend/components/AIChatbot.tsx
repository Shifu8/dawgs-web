"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import { Bot, Send, Sparkles, X, MessageSquare } from "lucide-react";
import { gsap } from "gsap";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "bot",
    text: "¡Hola! Bienvenido a 4GO. Soy tu asistente IA de entradas, eventos y soporte. ¿En qué puedo ayudarte hoy?",
  },
];

const quickReplies = [
  "Próximos Eventos",
  "Recuperar Mis Entradas",
  "Publicar un Evento",
  "Soporte y Reembolsos",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpen = () => {
      setIsClosing(false);
      setIsOpen(true);
    };
    const handleCloseEvent = () => closeChat();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeChat();
      }
    };

    window.addEventListener("open-ai-chatbot", handleOpen);
    window.addEventListener("close-ai-chatbot", handleCloseEvent);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-ai-chatbot", handleOpen);
      window.removeEventListener("close-ai-chatbot", handleCloseEvent);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (isOpen && !isClosing && chatRef.current) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.killTweensOf([chatRef.current, backdropRef.current]);
      gsap.fromTo(
        backdropRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: reduceMotion ? 0 : 0.24, ease: "power2.out" }
      );
      gsap.fromTo(
        chatRef.current,
        {
          opacity: 0,
          y: 20,
          scale: reduceMotion ? 1 : 0.95,
          filter: reduceMotion ? "none" : "blur(12px)",
          transformOrigin: "bottom right",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: reduceMotion ? 0 : 0.4,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen, isClosing]);

  const openChat = () => {
    setIsClosing(false);
    setIsOpen(true);
  };

  const closeChat = () => {
    if (isClosing) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !chatRef.current) {
      setIsOpen(false);
      setIsClosing(false);
      return;
    }

    setIsClosing(true);
    gsap.killTweensOf([chatRef.current, backdropRef.current]);
    gsap.to(backdropRef.current, {
      autoAlpha: 0,
      duration: 0.2,
      ease: "power2.inOut",
    });
    gsap.to(chatRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.9,
      filter: "blur(8px)",
      duration: 0.28,
      ease: "power3.in",
      onComplete: () => {
        setIsOpen(false);
        setIsClosing(false);
      },
    });
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: crypto.randomUUID(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    const thinkingId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: thinkingId, sender: "bot", text: "Procesando respuesta..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ sender, text }) => ({ sender, text })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Lo siento, no pude procesar tu solicitud.";

      setMessages((prev) => prev.map((m) => (m.id === thinkingId ? { ...m, text: reply } : m)));
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId ? { ...m, text: "Ocurrió un inconveniente de conexión. Por favor intenta nuevamente." } : m
        )
      );
    }
  };

  return (
    <>
      {/* Botón flotante Glassmorphic */}
      <button
        type="button"
        onClick={openChat}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full border border-white/25 bg-[#09090e]/80 text-white backdrop-blur-2xl transition-all duration-300 hover:scale-110 hover:border-violet-400/50 hover:bg-[#12121a]/90 active:scale-95 cursor-pointer ${
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100 shadow-[0_0_35px_rgba(139,92,246,0.35)]"
        }`}
        style={{
          width: "60px",
          height: "60px",
        }}
        aria-label="Abrir Asistente IA"
      >
        <div className="relative">
          <Bot className="h-6 w-6 text-violet-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        </div>
      </button>

      {/* Interfaz de Chat Glassmorphic */}
      {isOpen && (
        <div className="fixed inset-0 z-[450] flex items-end justify-center p-3 sm:items-center sm:p-0">
          {/* Backdrop con Blur suave */}
          <div
            ref={backdropRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={closeChat}
          />

          {/* Chat Card Glassmorphic */}
          <div
            ref={chatRef}
            className="relative flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-white/20 bg-[#09090f]/85 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-3xl sm:h-[620px]"
          >
            {/* Header con gradiente ambiental y Glass Styling */}
            <div className="relative flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">4GO ASSISTANT</h3>
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Soporte IA en Vivo</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/15 hover:border-white/30 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Area de Mensajes */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[22px] px-4.5 py-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white border border-white/25 rounded-tr-sm shadow-[0_4px_20px_rgba(124,58,237,0.3)] backdrop-blur-xl font-medium"
                        : "bg-white/[0.08] text-zinc-100 border border-white/15 rounded-tl-sm shadow-inner backdrop-blur-2xl"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Chips (Chips Glassmorphic) */}
            <div className="flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleSend(reply)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 hover:border-violet-400/40 text-[11px] font-semibold tracking-wider uppercase text-zinc-200 hover:text-white backdrop-blur-xl transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input Bar con Glassmorphism */}
            <div className="border-t border-white/10 bg-black/40 p-4 backdrop-blur-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] pl-5 pr-2 py-1.5 focus-within:border-violet-500/50 focus-within:bg-white/[0.09] transition-all"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg transition active:scale-90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Watermark branding */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[8px] font-extrabold uppercase tracking-[0.3em] text-zinc-500">
                <span>4GO TICKETING ENGINE</span>
                <div className="h-1 w-1 rounded-full bg-violet-400/60" />
                <span>GLASS AI ASSISTANT</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

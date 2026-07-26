/**
 * Autor: Brandon Medina
 * Fecha: 2026
 * Descripción: Homepage NENEZ - Futuristic Luxury Monochrome Redesign
 */

"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Ticket,
  X,
  Share2,
  User,
  PlusCircle,
  LayoutDashboard,
  Search,
  Sparkles,
  Wine,
  CreditCard,
  Key,
  Settings,
  LogOut,
} from "lucide-react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import Atmosphere from "@/frontend/components/Atmosphere";
import AIChatbot from "@/frontend/components/AIChatbot";
import PurchaseFarewell from "@/frontend/components/PurchaseFarewell";
import AccessDrop, { type AccessDropHandle } from "@/frontend/features/access-drop/AccessDrop";
import TicketRecoveryModal from "@/frontend/components/TicketRecoveryModal";
import OutfitBuilderSection from "@/frontend/features/merch/OutfitBuilderSection";
import StaffModal from "@/frontend/features/staff/StaffModal";
import BoxOfficeSalesModal from "@/frontend/features/staff/BoxOfficeSalesModal";
import DrinksSalesModal from "@/frontend/features/staff/DrinksSalesModal";
import EventTicketCarousel, { CAROUSEL_EVENTS } from "@/frontend/components/EventTicketCarousel";
import EventDetailOverlay from "@/frontend/features/events/EventDetailOverlay";
import InstallApp from "@/frontend/components/InstallApp";
import { QuickPreviewModal } from "@/frontend/components/QuickPreviewModal";
import { gsap, useGSAP } from "@/frontend/animations/gsapSetup";
import DrinksMenuModal from "@/frontend/components/DrinksMenuModal";
import { events as fallbackEvents } from "@/frontend/services/nenezData";
import { useHomepageConfig } from "@/frontend/hooks/useHomepageConfig";
import type { ThemeColors } from "@/lib/homepage-config/themes";
import type { HomepageConfig } from "@/lib/homepage-config/types";
import type { Event } from "@/frontend/types/domain";
import { getOnlineSalesStatus } from "@/frontend/utils/cutoff";

const HOME_NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "explore", label: "Shows" },
  { id: "access", label: "Access" },
  { id: "wear", label: "Merch" },
  { id: "support", label: "Support" },
] as const;

type HomeNavId = (typeof HOME_NAV_ITEMS)[number]["id"];

interface HomePageProps {
  initialConfig: HomepageConfig;
  initialEventSlug?: string;
}

function TypewriterText({ text }: { text: string }) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const textLength = text.length;

  useEffect(() => {
    setDisplayedCount(0);
    const timer = setInterval(() => {
      setDisplayedCount((prev) => {
        if (prev >= textLength) {
          clearInterval(timer);
          return textLength;
        }
        return prev + 1;
      });
    }, 28);
    return () => clearInterval(timer);
  }, []);

  const isFinished = displayedCount >= textLength;

  return (
    <span className="font-mono tracking-wider inline-flex items-center justify-center">
      <span>{isFinished ? text : text.slice(0, displayedCount)}</span>
      <span className="inline-block w-1.5 h-3 ml-1 bg-white/80 animate-pulse align-middle" />
    </span>
  );
}

export default function HomePage({ initialConfig, initialEventSlug }: HomePageProps) {
  const router = useRouter();
  const scope = useRef<HTMLElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const manualActiveUntil = useRef(0);

  const [events, setEvents] = useState<Event[]>(fallbackEvents);
  const [activeSection, setActiveSection] = useState<HomeNavId>("show");
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isDrinksPosModalOpen, setIsDrinksPosModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const [farewellName, setFarewellName] = useState("");
  const accessDropRef = useRef<AccessDropHandle>(null);
  const checkoutDragControls = useDragControls();
  const [isTicketPulse, setIsTicketPulse] = useState(false);
  const [isRecoveryPulse, setIsRecoveryPulse] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailOverlay, setShowDetailOverlay] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [quickPreviewEvent, setQuickPreviewEvent] = useState<any>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showDrinksModal, setShowDrinksModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [selectedCarouselEvent, setSelectedCarouselEvent] = useState<Event>(CAROUSEL_EVENTS[0]);

  // Auto-open EventDetailOverlay if initialEventSlug is specified
  useEffect(() => {
    if (initialEventSlug && Array.isArray(events)) {
      const targetSlug = String(initialEventSlug).toLowerCase();
      const match = events.find((e) => {
        if (!e) return false;
        const slugMatch = typeof e.slug === "string" && e.slug.toLowerCase() === targetSlug;
        const idMatch = typeof e.id === "string" && e.id.toLowerCase() === targetSlug;
        return slugMatch || idMatch;
      });
      if (match) {
        setSelectedCarouselEvent(match);
        setShowDetailOverlay(true);
      }
    }
  }, [initialEventSlug, events]);

  // Search & Catalog Carousel State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const homeCarouselRef = useRef<HTMLDivElement>(null);

  const scrollHomeCarousel = (direction: "left" | "right") => {
    if (!homeCarouselRef.current) return;
    const dist = homeCarouselRef.current.clientWidth * 0.75;
    homeCarouselRef.current.scrollBy({
      left: direction === "left" ? -dist : dist,
      behavior: "smooth",
    });
  };

  const filteredCatalogEvents = events.filter((evt) => {
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.subtitle && evt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "Todas" || evt.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  // Custom states for 3D Carousel & Premium visual effects
  const [activeIndex, setActiveIndex] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const activeEvent = events[activeIndex] || selectedCarouselEvent;
  const [isLoading, setIsLoading] = useState(true);

  // Clear loader on mount & popstate (browser back/forward navigation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    const handlePageShow = () => {
      setIsLoading(false);
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePageShow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePageShow);
    };
  }, []);
  const [checkoutState, setCheckoutState] = useState<string>("register");

  // Auto-advance Featured Trending Presale Card every 5 seconds
  useEffect(() => {
    if (!events.length) return;
    const timer = setInterval(() => {
      setTrendingIndex((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [events.length]);

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSalesStatus = getOnlineSalesStatus(activeEvent);

  // Inactive event Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'coming-soon' | 'sold-out' | 'info';
    id: number;
  } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerInactiveToast = (event: Event) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    
    let message = "Este evento estará disponible próximamente.";
    let type: 'coming-soon' | 'sold-out' | 'info' = 'coming-soon';

    if ((event as any).customMessage) {
      message = (event as any).customMessage;
      type = "info";
    } else if (event.status === "sold-out") {
      message = "Este evento ya se encuentra agotado.";
      type = "sold-out";
    } else if (event.status === "coming-soon") {
      message = "Este evento es el próximo y sus entradas aún no están disponibles.";
      type = "coming-soon";
    } else {
      const status = getOnlineSalesStatus(event);
      if (status.isClosed) {
        message = `Las entradas online por esta web han finalizado a las ${status.cutoffTime} hs. Puedes adquirir tu entrada directamente en la puerta del evento.`;
        type = "info";
      }
    }

    setToast({
      message,
      type,
      id: Date.now()
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);



  const { config } = useHomepageConfig(initialConfig);

  // Forced Strict Monochromatic Grayscale Color Theme (Balenciaga / Apple / Stripe style)
  const theme: ThemeColors = {
    primary: "#ffffff",
    primaryLight: "#e4e4e7",
    primaryDark: "#27272a",
    bgFrom: "#000000",
    bgTo: "#050505",
    glowRgba: "rgba(255,255,255,0.02)",
    glowIntense: "rgba(255,255,255,0.05)",
    borderRgba: "rgba(255,255,255,0.08)",
    btnFrom: "#ffffff",
    btnTo: "#ffffff",
    btnShadow: "rgba(255,255,255,0.05)",
    textAccent: "#ffffff",
    badgeBg: "#27272a",
    cardBorder: "rgba(255,255,255,0.08)",
    cardShadow: "rgba(0,0,0,0.85)",
    hoverGlow: "rgba(255,255,255,0.05)",
    tagBg: "rgba(255,255,255,0.05)",
  };

  const primaryRgb = "255,255,255";
  const themeStyle = {
    "--theme-primary": theme.primary,
    "--theme-primary-rgb": primaryRgb,
    "--theme-primary-light": theme.primaryLight,
    "--theme-primary-dark": theme.primaryDark,
    "--theme-bg-tint": "rgba(255, 255, 255, 0.04)",
    "--theme-bg-glow": "rgba(255, 255, 255, 0.02)",
    "--theme-bg-glow-dark": "rgba(255, 255, 255, 0.01)",
    "--theme-bg-accent": "rgba(255, 255, 255, 0.04)",
    "--theme-bg-grid": "rgba(255, 255, 255, 0.02)",
    "--theme-btn-from": theme.btnFrom,
    "--theme-btn-to": theme.btnTo,
    "--theme-btn-shadow": theme.btnShadow,
    "--theme-glow-intense": theme.glowIntense,
    "--theme-border-accent": theme.borderRgba,
    "--theme-border-accent-light": "rgba(255, 255, 255, 0.12)",
    "--theme-border-accent-xlight": "rgba(255, 255, 255, 0.06)",
    "--theme-glow-rgba": theme.glowRgba,
    "--theme-text-accent": theme.textAccent,
    "--theme-text-rgb": primaryRgb,
    "--theme-badge-bg": theme.badgeBg,
    "--theme-card-border": theme.cardBorder,
    "--theme-card-shadow": theme.cardShadow,
    "--theme-hover-glow": theme.hoverGlow,
    "--theme-bg-pink-500": "rgba(255, 255, 255, 0.08)",
    "--theme-bg-pink-500-hover": "rgba(255, 255, 255, 0.14)",
    "--theme-tag-bg": theme.tagBg,
    background: "black",
  } as CSSProperties;

  // Loader transition trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);



  useEffect(() => {
    fetch("/api/events")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events);
          
          const params = new URLSearchParams(window.location.search);
          const eventParam = params.get("event");
          if (eventParam) {
            const foundIdx = data.events.findIndex(
              (e: any) => e.id === eventParam || e.slug === eventParam
            );
            if (foundIdx !== -1) {
              setSelectedCarouselEvent(data.events[foundIdx]);
              setActiveIndex(foundIdx);
              return;
            }
          }
          
          setSelectedCarouselEvent(data.events[0]);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("menu") === "access") {
      queueMicrotask(() => setShowHiddenMenu(true));
      const url = new URL(window.location.href);
      url.searchParams.delete("menu");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.performance.now() < manualActiveUntil.current) return;

      const supportSection = document.getElementById("support");
      const isNearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;

      if (supportSection && isNearBottom) {
        setActiveSection("support");
        return;
      }

      const showSection = document.getElementById("show");
      const accessSection = document.getElementById("access");
      const wearSection = document.getElementById("wear");

      const showTop = showSection ? showSection.getBoundingClientRect().top + window.scrollY : 0;
      const accessTop = accessSection ? accessSection.getBoundingClientRect().top + window.scrollY : 0;
      const wearTop = wearSection ? wearSection.getBoundingClientRect().top + window.scrollY : 0;

      const scrollPosition = window.scrollY + window.innerHeight * 0.45;

      let currentSection: HomeNavId = "show";
      if (scrollPosition >= wearTop) {
        currentSection = "wear";
      } else if (scrollPosition >= accessTop - 100) {
        currentSection = "access";
      } else {
        currentSection = "show";
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useGSAP(
    () => {
      if (isLoading) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { reduceMotion, isDesktop } = context.conditions as {
            reduceMotion: boolean;
            isDesktop: boolean;
          };

          if (reduceMotion) {
            gsap.set(".logo-icon", { opacity: 1, scale: 1, rotation: 0 });
            gsap.set(".logo-char", { opacity: 1, y: 0, scale: 1 });
            gsap.set(".hero-reveal", { autoAlpha: 1, y: 0 });
            return;
          }

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

          // Animación del logo de Now4Go (corre en móvil y desktop)
          tl.fromTo(".logo-icon",
            { scale: 0, rotation: -45, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
          )
          .fromTo(".logo-char",
            { opacity: 0, y: 15, scale: 0.7, transformOrigin: "50% 100%" },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.04, ease: "back.out(1.5)" },
            "-=0.5"
          );

          // Animación adicional del hero (solo en desktop)
          if (isDesktop) {
            tl.from(".hero-reveal", {
              autoAlpha: 0,
              y: 28,
              stagger: 0.08,
              duration: 0.85,
            }, "-=0.3");
          }
        },
        scope.current ?? undefined,
      );

      return () => mm.revert();
    },
    { dependencies: [isLoading], scope },
  );

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowHiddenMenu(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 3000);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const getNavIdForTarget = (id: string): HomeNavId =>
    HOME_NAV_ITEMS.some((item) => item.id === id) ? (id as HomeNavId) : "show";

  const scrollToSection = (
    id: string,
    block: ScrollLogicalPosition = "center",
    activeId: HomeNavId = getNavIdForTarget(id),
  ) => {
    manualActiveUntil.current = window.performance.now() + 950;
    setActiveSection(activeId);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });
  };

  const scrollToTicketCard = () => {
    scrollToSection("tickets-stage", "center", "show");
    setIsTicketPulse(true);
    window.setTimeout(() => {
      setIsTicketPulse(false);
    }, 2500);
  };

  const scrollToRecovery = () => {
    setSelectedCarouselEvent(activeEvent);
    setShowRecoveryModal(true);
  };

  const onBuy = (event: Event) => {
    setSelectedCarouselEvent(event);
    setIsTicketModalOpen(true);
  };

  const onViewDetails = (event: Event) => {
    setSelectedCarouselEvent(event);
    setShowDetailOverlay(true);
  };

  const onSelectRelatedEvent = (event: Event) => {
    setSelectedCarouselEvent(event);
    // Also update the carousel index if event exists in carousel
    const idx = events.findIndex(e => e.id === event.id);
    if (idx !== -1) setActiveIndex(idx);
  };

  return (
    <main
      ref={scope}
      className="relative min-h-screen overflow-x-hidden bg-black text-white"
      style={themeStyle}
    >
      {/* StormGo Animated Intro Loader Splash Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            exit={{ opacity: 0, y: "-100%", filter: "blur(12px)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#8b5cf6] text-black select-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* Animated Cool Cloud Mascot Winking ("echando un ojo") - Slightly Smaller */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, -4, 4, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 drop-shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
              >
                <svg className="w-full h-full select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 68 C15 68, 10 58, 15 48 C10 38, 20 28, 32 30 C38 18, 55 15, 65 24 C75 16, 88 24, 88 36 C95 44, 92 58, 82 68 Z" fill="#ffffff" stroke="#1e1b4b" strokeWidth="5.5" strokeLinejoin="round" />
                  
                  {/* Winking Left Eyebrow & Eyebrow motion */}
                  <motion.path
                    d="M30 30 L44 32"
                    stroke="#1e1b4b"
                    strokeWidth="5"
                    strokeLinecap="round"
                    animate={{ rotate: [0, -12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <path d="M56 30 L70 32" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />

                  {/* Sunglasses Lens Frame */}
                  <motion.g
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path
                      d="M24 44 C24 44, 46 38, 50 46 C54 38, 76 44, 76 44 L72 58 C72 58, 54 62, 50 56 C46 62, 28 58, 28 58 Z"
                      fill="#111111"
                      stroke="#1e1b4b"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                    {/* Winking Sparkle Flare behind sunglasses ("echando un ojo") */}
                    <motion.circle
                      cx="38"
                      cy="49"
                      r="4"
                      fill="#c2d902"
                      animate={{ scale: [0, 1.6, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                    <line x1="30" y1="46" x2="42" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                    <line x1="56" y1="46" x2="68" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  </motion.g>
                </svg>
              </motion.div>

              {/* Sleek Progress Bar */}
              <div className="mt-2 h-1.5 w-28 bg-black/15 mx-auto overflow-hidden rounded-full border border-black/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="h-full bg-black rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Atmosphere />

      {/* Modern, chic top navigation bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#8b5cf6]/95 backdrop-blur-2xl shadow-lg">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 md:px-12 lg:px-16">
          
          {/* Cool Cloud Mascot Character Logo for StormGo */}
          <div className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("show");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex select-none items-center gap-2.5 outline-none hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label="stormgo"
            >
              {/* Cool Cloud with Sunglasses Mascot SVG (Matching Reference Image) */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                <svg className="w-full h-full select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 68 C15 68, 10 58, 15 48 C10 38, 20 28, 32 30 C38 18, 55 15, 65 24 C75 16, 88 24, 88 36 C95 44, 92 58, 82 68 Z" fill="#ffffff" stroke="#1e1b4b" strokeWidth="6" strokeLinejoin="round" />
                  <path d="M30 32 L44 30" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
                  <path d="M56 30 L70 32" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
                  <path d="M24 44 C24 44, 46 38, 50 46 C54 38, 76 44, 76 44 L72 58 C72 58, 54 62, 50 56 C46 62, 28 58, 28 58 Z" fill="#111111" stroke="#1e1b4b" strokeWidth="4" strokeLinejoin="round" />
                  <line x1="30" y1="46" x2="42" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  <line x1="56" y1="46" x2="68" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Brand Typography in Solid Black (Smaller & Compact) */}
              <span className="logo-text flex items-center text-lg sm:text-xl font-black tracking-tight leading-none select-none text-black">
                <span className="text-black font-black">Storm</span>
                <span className="text-black font-black">Go</span>
              </span>
            </button>
          </div>

          {/* Centered nav links (Home -> Shows -> Access -> Merch -> Support) */}
          <nav className="hidden items-center gap-7 lg:flex">
            {HOME_NAV_ITEMS.map((item) => {
              const targetId = item.id === "home" ? "show" : item.id;
              const isActive = activeSection === item.id || (activeSection === "show" && item.id === "home");
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    const el = document.getElementById(targetId);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`relative py-2 text-[10px] font-black uppercase tracking-[0.28em] transition-colors ${
                    isActive ? "text-white font-black" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-0.5 bg-[#c2d902] transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Action buttons on the right */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={scrollToTicketCard}
              className="hidden sm:inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#e10075]/40 bg-[#e10075]/15 px-4 text-[8px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#e10075]/30 hover:border-[#e10075] active:scale-95 shadow-[0_0_15px_rgba(225,0,117,0.3)] font-bold cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-[#e10075]" />
              <span>Comprar</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/organizer/register")}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 sm:px-4 text-[8px] font-black uppercase tracking-[0.16em] text-black transition hover:bg-zinc-200 active:scale-95 shadow-lg font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publicar Evento</span>
            </button>

            {/* User Icon Avatar Button ("el muñequito del usuario a la derecha") */}
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 shadow-lg cursor-pointer ${
                showUserMenu
                  ? "bg-[#c2d902] text-black border-[#c2d902] scale-105 shadow-[0_0_20px_rgba(194,217,2,0.6)]"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95"
              }`}
              title="Perfil / Iniciar Sesión / Panel"
              aria-label="Perfil y panel de usuario"
            >
              <User className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Monochromatic 3D Concrete Room backdrop */}
      <section
        id="show"
        className="relative z-10 flex w-full flex-col overflow-hidden px-4 pb-12 pt-14 sm:px-8 md:px-14 lg:px-20 justify-start"
      >
        {/* Electric Purple Ambient Backdrop (#8b5cf6) */}
        <div aria-hidden className="absolute inset-0 -z-20 overflow-hidden bg-[#8b5cf6] select-none pointer-events-none">
          <div className="absolute inset-0 bg-[#8b5cf6]" />
          {/* Ambient Swirl Wave Vector Lines (extended down across entire section & bottom) */}
          <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" viewBox="0 0 1440 1200" preserveAspectRatio="none" fill="none">
            {/* Top Wave Lines */}
            <path d="M-100 150 C 300 20, 700 350, 1540 80" stroke="white" strokeWidth="70" strokeLinecap="round" opacity="0.15" />
            <path d="M-50 320 C 400 80, 900 480, 1500 220" stroke="#c2d902" strokeWidth="45" strokeLinecap="round" opacity="0.22" />

            {/* Middle Wave Lines */}
            <path d="M-80 620 C 350 420, 950 780, 1520 540" stroke="white" strokeWidth="65" strokeLinecap="round" opacity="0.18" />
            <path d="M-150 750 C 300 580, 850 920, 1580 680" stroke="#c2d902" strokeWidth="40" strokeLinecap="round" opacity="0.25" />

            {/* Bottom Wave Lines (parte de abajo) */}
            <path d="M-100 900 C 400 700, 1000 1080, 1540 840" stroke="white" strokeWidth="75" strokeLinecap="round" opacity="0.15" />
            <path d="M-60 1050 C 320 880, 880 1180, 1500 960" stroke="#c2d902" strokeWidth="50" strokeLinecap="round" opacity="0.2" />
            <path d="M-140 1180 C 280 1020, 920 1280, 1560 1100" stroke="white" strokeWidth="60" strokeLinecap="round" opacity="0.14" />
          </svg>
        </div>

        {/* Hero Main Showcase: Chic Modern Pop-Art Hero Stage (Matching User Reference Image) */}
        <div className="relative z-10 w-full max-w-[1300px] mx-auto flex flex-col items-center justify-center text-center py-6 sm:py-10">

          {/* Top Pill Badges (seasonal | treat box / NOW4GO | classics) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 select-none">
            <span className="px-4 py-1.5 rounded-full border border-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              temporada 2026
            </span>
            <span className="px-6 py-2 rounded-2xl bg-black text-white font-black text-sm sm:text-base uppercase tracking-widest shadow-xl border border-white/20">
              stormgo
            </span>
            <span className="px-4 py-1.5 rounded-full border border-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              eventos 3d
            </span>
          </div>

          {/* Headline (Matching Reference Image Typography: Your dog deserves a treat! -> TUS EVENTOS MERECEN UNA EXPERIENCIA 3D!) */}
          <div className="space-y-1 sm:space-y-2 max-w-4xl mx-auto select-none">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-black tracking-tighter leading-none">
              TUS EVENTOS
            </h1>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tighter leading-none">
              MERECEN UNA
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <span className="text-[#c2d902] text-3xl sm:text-5xl font-black animate-pulse">✳</span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase text-white tracking-tighter leading-none">
                EXPERIENCIA 3D!
              </h1>
              <span className="text-[#c2d902] text-3xl sm:text-5xl font-black animate-pulse">✳</span>
            </div>
          </div>

          {/* Centerpiece: 2 Angled 3D Smartphones (Matching Reference Image Center Stage) */}
          <div className="relative w-full max-w-[580px] h-[340px] sm:h-[440px] my-6 sm:my-8 flex items-center justify-center select-none">
            {/* Left Phone (Lime Green Frame, angled -10deg) */}
            <motion.div
              animate={{ y: [0, -12, 0], rotate: [-10, -7, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[8%] sm:left-[12%] w-[200px] sm:w-[260px] aspect-[9/18.5] rounded-[38px] bg-[#c2d902] border-[4px] border-black p-2 shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-20 overflow-hidden cursor-pointer"
              onClick={() => {
                const el = document.getElementById("explore");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black flex flex-col justify-between p-3 text-white">
                <div className="text-left pt-2">
                  <span className="text-[8px] font-black uppercase text-[#ff77a8] tracking-widest block">Trending Show</span>
                  <h4 className="text-xs font-black uppercase text-white tracking-tight mt-0.5">BLOCK X OUSI</h4>
                  <p className="text-[9px] font-medium text-zinc-400">Omar Courtz Experience</p>
                </div>
                <div className="relative w-full h-[65%] rounded-xl overflow-hidden bg-zinc-900 my-1">
                  <img src="/images/now4go-hero-presentation-hd-v3.png" alt="App Preview" className="w-full h-full object-cover" />
                </div>
                <div className="py-1.5 px-3 rounded-full bg-[#c2d902] text-black font-black text-[9px] uppercase tracking-wider text-center">
                  Entradas $10 USD
                </div>
              </div>
            </motion.div>

            {/* Right Phone (Dark Violet Frame, angled 8deg) */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [7, 10, 7] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-[8%] sm:right-[12%] w-[200px] sm:w-[260px] aspect-[9/18.5] rounded-[38px] bg-[#1e1b4b] border-[4px] border-black p-2 shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-10 overflow-hidden cursor-pointer"
              onClick={() => {
                const el = document.getElementById("explore");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black flex flex-col justify-between p-3 text-white">
                <div className="text-left pt-2">
                  <span className="text-[8px] font-black uppercase text-[#84cc16] tracking-widest block">Exclusivo Ecuador</span>
                  <h4 className="text-xs font-black uppercase text-white tracking-tight mt-0.5">LATIN LOUD 2026</h4>
                  <p className="text-[9px] font-medium text-zinc-400">Bad Bunny &amp; Rauw</p>
                </div>
                <div className="relative w-full h-[65%] rounded-xl overflow-hidden bg-zinc-900 my-1">
                  <img src="/images/hero-element-ticket_latin.png" alt="Ticket Preview" className="w-full h-full object-cover" />
                </div>
                <div className="py-1.5 px-3 rounded-full bg-[#e10075] text-white font-black text-[9px] uppercase tracking-wider text-center">
                  Ver Evento &rarr;
                </div>
              </div>
            </motion.div>
          </div>

          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white/90 max-w-xl mx-auto leading-relaxed">
            Explora la cartelera exclusiva de conciertos, festivales y fiestas en Ecuador. Entradas 3D oficiales con verificación instantánea.
          </p>
        </div>

        {/* Clean Spaced Catalog Section Below Presentation */}
        <div id="explore" className="relative z-20 w-full max-w-[1600px] mx-auto mt-6 sm:mt-10 pt-6 space-y-8">
          
          {/* Section Header & Minimalist Search Bar with 3D Flame Mascot on the Right */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Explora Eventos &amp; Shows
              </h2>
            </div>

            {/* Minimalist Dark Search Bar */}
            <div className="w-full md:w-auto flex-1 max-w-md">
              <div className="relative flex items-center bg-black/60 rounded-full border border-white/15 px-4 py-2.5 shadow-inner focus-within:border-white/40 transition">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar eventos, artistas o ciudad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-3 pr-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-[10px] text-zinc-400 hover:text-white font-bold">
                    Limpiar
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Filter Chips (Ciudades) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0 mr-2">Ciudad:</span>
            {["Todas", "Loja", "Quito", "Guayaquil", "Cuenca", "Manta"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCity(c)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition shrink-0 ${
                  selectedCity === c
                    ? "border-white bg-white text-black font-bold shadow-lg"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Featured Trending Presale Banner Card Showcase (Auto-rotates every 5 seconds) */}
          <div className="relative w-full max-w-[540px] mx-auto my-8 select-none px-2">
            <div 
              onClick={() => {
                setQuickPreviewEvent(events[trendingIndex]);
                setShowQuickPreview(true);
              }}
              className="group relative w-full rounded-[28px] bg-[#0c0c0e] border border-white/15 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)] cursor-pointer hover:border-[#e10075]/60 transition-all duration-300"
            >
              {/* Card Top Poster Banner */}
              <div className="relative w-full aspect-[2/1] bg-zinc-950 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={events[trendingIndex].id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="relative w-full h-full"
                  >
                    {events[trendingIndex].poster ? (
                      <Image
                        src={events[trendingIndex].poster}
                        alt={events[trendingIndex].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                        <span className="text-3xl font-black text-white">{events[trendingIndex].title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-80" />
                    
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 text-[9px] font-black uppercase text-white border border-white/20 backdrop-blur-md">
                      {events[trendingIndex].city}
                    </span>
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white text-black text-[10px] font-black shadow-md">
                      ${events[trendingIndex].price} USD
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Card Bottom Details (Matching User Reference Image 2) */}
              <div className="p-4 sm:p-5 text-left border-t border-white/10 bg-[#0c0c0e]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${events[trendingIndex].id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ff77a8] block">
                      Trending Presale:
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight mt-0.5 group-hover:text-[#ff77a8] transition-colors">
                      {events[trendingIndex].title}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400 mt-0.5">
                      {events[trendingIndex].subtitle || events[trendingIndex].organizer || "Omar Courtz Experience"}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-black uppercase text-white">
                      <div className="flex items-center gap-3">
                        <span className="text-[#84cc16]">${events[trendingIndex].price} USD</span>
                        <span className="text-zinc-400 font-medium">{events[trendingIndex].dateLabel}</span>
                        <span className="text-zinc-500 font-medium">{events[trendingIndex].city}</span>
                      </div>

                      <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 group-hover:bg-[#e10075] transition-colors">
                        Ver &rarr;
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Pagination Dots (Clickable to change trending event) */}
            <div className="flex items-center justify-center gap-2 mt-3 select-none">
              {events.map((evt, idx) => (
                <button
                  key={`dot-${evt.id}`}
                  type="button"
                  onClick={() => setTrendingIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === trendingIndex
                      ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                      : "w-2 bg-white/20 hover:bg-white/50"
                  }`}
                  aria-label={`Ir a evento ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Centered Cards Catalog Grid (Strictly 2 per row on Mobile, 4 per row on Desktop) */}
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto px-2">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-black flex items-center gap-2">
                <span className="inline-block w-2.5 h-4 bg-black rounded-full" />
                Cartelera Completa &amp; Shows
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-black/70">
                {filteredCatalogEvents.length} Eventos Disponibles
              </span>
            </div>

            {/* Square Cards Grid (Strictly 2 per row on mobile: grid-cols-2) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 max-w-[1240px] mx-auto justify-items-center pb-6">
              {filteredCatalogEvents.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => {
                    setExpandedCardId(expandedCardId === evt.id ? null : evt.id);
                  }}
                  className="group relative w-full rounded-2xl sm:rounded-3xl bg-zinc-950 border border-white/10 overflow-hidden cursor-pointer hover:border-[#e10075]/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(225,0,117,0.15)] flex flex-col min-h-[320px]"
                >
                  {/* Square Poster Image */}
                  <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden">
                    {evt.poster ? (
                      <Image
                        src={evt.poster}
                        alt={evt.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <span className="text-3xl font-black text-zinc-700">{evt.title.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 border border-white/20 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                      {evt.city}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-black">
                      ${evt.price} USD
                    </span>
                  </div>

                  {/* Event Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between border-t border-white/5 bg-[#09090b]">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#e10075] mb-1">{evt.organizer || "Now4Go"}</p>
                      <h4 className="font-black text-base uppercase text-white leading-tight line-clamp-1 group-hover:text-[#e10075] transition-colors">{evt.title}</h4>
                      <p className="text-zinc-400 text-xs mt-0.5 line-clamp-1 font-medium">{evt.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-[11px] text-zinc-400">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {evt.dateLabel}
                      </span>
                      <span className="font-black text-white group-hover:text-[#e10075] flex items-center gap-1 transition-colors">
                        Ver <Ticket className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Glassmorphic Folder Sheet Overlay (Slides UP from bottom of the Card) */}
                  <AnimatePresence>
                    {expandedCardId === evt.id && (
                      <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 280 }}
                        className="absolute inset-x-0 bottom-0 top-8 z-30 bg-black/90 backdrop-blur-2xl border-t border-white/20 rounded-t-[24px] p-3.5 sm:p-4 flex flex-col justify-between text-left shadow-[0_-15px_40px_rgba(0,0,0,0.85)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          {/* Top Folder Handle Line — */}
                          <div className="w-10 h-1 rounded-full bg-white/40 mx-auto mb-2.5" />

                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-bold text-[#ff77a8] truncate">
                              @{((evt as any).organizer || "now4go").toLowerCase().replace(/\s+/g, "_")}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCardId(null);
                              }}
                              className="text-[9px] font-bold text-zinc-400 hover:text-white px-2 py-0.5 rounded-full bg-white/10"
                            >
                              ✕
                            </button>
                          </div>

                          <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-tight line-clamp-1">
                            {evt.title}
                          </h4>

                          <p className="text-[9px] font-normal text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                            {evt.subtitle || "Experiencia inmersiva con lo mejor del Reggaeton, Trap Latino y Urban Music en vivo."}
                          </p>

                          {/* Genre Tags */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {["@reggaeton", "@trap", "@urban"].map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[8px] font-bold text-zinc-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Direct URL Button to Event Page */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const slug = (evt as any).slug || evt.id;
                            window.location.href = `/storm/${slug}`;
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-white text-black font-black uppercase text-[9px] sm:text-[10px] tracking-wider hover:bg-[#e10075] hover:text-white transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 mt-2 group cursor-pointer"
                        >
                          <span>Ir al Evento</span>
                          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* MERCH OFICIAL SECTION - Seamless continuation */}
          <OutfitBuilderSection />
        </div>
      </section>

      {showFarewell && (
        <PurchaseFarewell name={farewellName} onComplete={() => { setShowFarewell(false); setFarewellName(""); }} />
      )}

      <AIChatbot />
      <StaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} />

      {/* Premium Toast/Alert for Inactive/Upcoming Events */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-24 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-full bg-zinc-950/90 border border-white/10 backdrop-blur-md max-w-md w-[calc(100%-2rem)] sm:w-auto"
            style={{
              boxShadow: "0 20px 50px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.02)",
            }}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-white border border-white/15">
              <LockKeyhole className="h-2.5 w-2.5" />
            </div>
            <span className="text-[10px] font-bold tracking-wide text-zinc-200 text-left leading-tight">
              {toast.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Electric Purple Pop Footer */}
      <footer
        id="support"
        className="relative z-10 -mx-4 border-t border-white/20 px-4 py-16 sm:-mx-8 sm:px-6 md:-mx-14 md:px-12 lg:-mx-20 lg:px-16 bg-[#8b5cf6] text-white"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center text-center gap-4">
          {/* Logo brand StormGo */}
          <div className="flex items-center gap-2.5 select-none mb-2">
            <div className="w-9 h-9 flex items-center justify-center shrink-0 drop-shadow-md">
              <svg className="w-full h-full select-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 68 C15 68, 10 58, 15 48 C10 38, 20 28, 32 30 C38 18, 55 15, 65 24 C75 16, 88 24, 88 36 C95 44, 92 58, 82 68 Z" fill="#ffffff" stroke="#1e1b4b" strokeWidth="6" strokeLinejoin="round" />
                <path d="M30 32 L44 30" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
                <path d="M56 30 L70 32" stroke="#1e1b4b" strokeWidth="5" strokeLinecap="round" />
                <path d="M24 44 C24 44, 46 38, 50 46 C54 38, 76 44, 76 44 L72 58 C72 58, 54 62, 50 56 C46 62, 28 58, 28 58 Z" fill="#111111" stroke="#1e1b4b" strokeWidth="4" strokeLinejoin="round" />
                <line x1="30" y1="46" x2="42" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <line x1="56" y1="46" x2="68" y2="52" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <span className="flex items-center text-xl font-black tracking-tight leading-none select-none text-black">
              <span className="text-black font-black">Storm</span>
              <span className="text-black font-black">Go</span>
            </span>
          </div>

          <p className="text-xl font-black uppercase tracking-[0.4em] text-black/90">
            {config.footer.brand}
          </p>
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.footer.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-2 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 backdrop-blur-md transition hover:border-white/[0.2] hover:bg-white/[0.08] hover:text-white"
          >
            {config.footer.email}
          </a>
          <p className="mt-2 text-[8px] font-bold tracking-wider text-zinc-600">
            {config.footer.copyright}
          </p>

          {/* DevEc Signature */}
          <div className="mt-8 flex flex-col items-center gap-1 opacity-35 hover:opacity-85 transition-opacity duration-300 select-none">
            <span className="text-[6px] font-black tracking-[0.25em] text-zinc-600 uppercase">Desarrollado por</span>
            <div className="flex flex-col items-center">
              <svg className="h-[18px] w-auto" viewBox="0 0 110 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="25" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.02em">Dev</text>
                <text x="41" y="25" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.02em">E</text>
                <text x="56" y="25" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.02em">c</text>
                {/* Waving flag tail */}
                <path d="M70 20 C78 20, 80 10, 92 10 C96 10, 98 14, 102 12" stroke="#FFDD00" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M70 23 C78 23, 80 13, 92 13 C96 13, 98 17, 102 15" stroke="#0033A0" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M70 26 C78 26, 80 16, 92 16 C96 16, 98 20, 102 18" stroke="#D52B1E" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <span className="text-[6px] font-black tracking-[0.3em] text-zinc-500 uppercase mt-0.5">
                SOFTWARE DEVELOPMENT
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Purchasing Access Modal Dialog */}
      <div
        className={`fixed inset-0 z-[350] flex items-end md:items-center justify-center transition-all duration-300 ${
          isTicketModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          backdropFilter: showDetailOverlay ? "none" : "blur(24px)",
          background: showDetailOverlay
            ? "transparent"
            : isTicketModalOpen
            ? "rgba(0, 0, 0, 0.88)"
            : "transparent",
        }}
      >
        <motion.div
          animate={isTicketModalOpen ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          drag="y"
          dragControls={checkoutDragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.85 }}
          onDragEnd={(event, info) => {
            if (info.offset.y > 150 || info.velocity.y > 500) {
              if (accessDropRef.current?.isSuccess) {
                setFarewellName(accessDropRef.current.firstName);
                setShowFarewell(true);
                accessDropRef.current?.reset();
                setShowDetailOverlay(false);
              }
              setIsTicketModalOpen(false);
              setCheckoutState("register");
            }
          }}
          className={`relative w-full h-[96dvh] transition-all duration-500 overflow-hidden flex flex-col rounded-t-[32px] md:rounded-[36px] border border-white/[0.07] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-[0_-20px_80px_rgba(0,0,0,0.8)] md:shadow-[0_40px_120px_rgba(0,0,0,0.9)] md:mx-4 ${
            checkoutState === "success" || checkoutState === "verifying"
              ? "md:max-w-[460px] md:h-[580px]"
              : "md:max-w-[860px] md:h-[96vh]"
          }`}
        >
          {/* Drag handle — mobile only */}
          <div
            className="md:hidden flex justify-center pt-3 pb-3 shrink-0 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={(e) => checkoutDragControls.start(e)}
          >
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>

          <button
            onClick={() => {
              if (accessDropRef.current?.isSuccess) {
                setFarewellName(accessDropRef.current.firstName);
                setShowFarewell(true);
                accessDropRef.current?.reset();
                setShowDetailOverlay(false);
              }
              setIsTicketModalOpen(false);
              setCheckoutState("register");
            }}
            aria-label="Cerrar compra"
            className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/60 transition hover:text-white hover:border-white/25"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <AccessDrop
              ref={accessDropRef}
              onFarewell={(name) => {
                setFarewellName(name);
                setShowFarewell(true);
                setShowDetailOverlay(false);
              }}
              onClose={() => {
                setIsTicketModalOpen(false);
                setCheckoutState("register");
              }}
              onStateChange={(state) => setCheckoutState(state)}
              event={selectedCarouselEvent}
            />
          </div>
        </motion.div>
      </div>

      {/* Meet2Go Style Glassmorphic Quick Preview Modal */}
      <QuickPreviewModal
        event={quickPreviewEvent}
        isOpen={showQuickPreview}
        onClose={() => setShowQuickPreview(false)}
      />

      {/* Premium Cinematic Event Detail Overlay */}
      {showDetailOverlay && (
        <EventDetailOverlay
          event={selectedCarouselEvent}
          allEvents={events}
          isOpen={showDetailOverlay}
          onClose={() => setShowDetailOverlay(false)}
          onBuy={(event) => {
            onBuy(event);
          }}
          onSelectEvent={(event) => {
            onSelectRelatedEvent(event);
            setSelectedCarouselEvent(event);
          }}
          onOpenDrinks={() => setShowDrinksModal(true)}
          isCheckoutOpen={isTicketModalOpen}
        />
      )}

      {/* Drinks & Bar Menu Modal */}
      <DrinksMenuModal
        isOpen={showDrinksModal}
        onClose={() => setShowDrinksModal(false)}
        eventName={selectedCarouselEvent?.title || activeEvent.title}
        venueName={selectedCarouselEvent?.venue || activeEvent.venue}
        drinks={selectedCarouselEvent?.drinks || activeEvent?.drinks}
      />

      {/* Ticket Recovery Modal */}
      <TicketRecoveryModal
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        eventId={selectedCarouselEvent?.id || activeEvent.id}
        eventName={selectedCarouselEvent?.title || activeEvent.title}
      />

      {/* POS Door Ticket Sales Modal */}
      <BoxOfficeSalesModal
        isOpen={isPosModalOpen}
        onClose={() => {
          setIsPosModalOpen(false);
          setShowHiddenMenu(true);
        }}
        event={selectedCarouselEvent || activeEvent}
      />

      {/* POS Drinks Sales Modal */}
      <DrinksSalesModal
        isOpen={isDrinksPosModalOpen}
        onClose={() => {
          setIsDrinksPosModalOpen(false);
          setShowHiddenMenu(true);
        }}
        event={selectedCarouselEvent || activeEvent}
      />

      {/* Hidden agent modules menu */}
      <AnimatePresence>
        {showHiddenMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 28, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.88, y: 28, filter: "blur(12px)" }}
              transition={{ duration: 0.38, ease: [0.32, 0, 0.67, 0] }}
              className="relative flex w-full max-w-sm flex-col items-center rounded-[40px] border border-white/[0.1] bg-[#09090b]/90 p-8 sm:p-10 text-center shadow-[0_30px_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              <button
                type="button"
                onClick={() => setShowHiddenMenu(false)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-zinc-400 transition hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                title="Cerrar System Access"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-2 mt-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-300 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  <KeyRound className="h-6 w-6" />
                </div>
              </div>

              <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-white">System Access</h2>
              <p className="mb-8 mt-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                Selecciona el módulo
              </p>

              <div className="flex w-full flex-col gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowHiddenMenu(false);
                    setIsStaffModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  Agente Staff
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHiddenMenu(false);
                    setIsPosModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-5 py-4 text-[11px] font-black uppercase tracking-wider text-emerald-400 transition hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-emerald-300 cursor-pointer"
                >
                  Ventas de Taquilla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHiddenMenu(false);
                    setIsDrinksPosModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4 text-[11px] font-black uppercase tracking-wider text-amber-400 transition hover:border-amber-500/50 hover:bg-amber-950/40 hover:text-amber-300 cursor-pointer"
                >
                  Ventas de Barra
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHiddenMenu(false);
                    router.push("/admin");
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[11px] font-black uppercase tracking-wider text-zinc-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Floating Glass Dropdown Menu (Identical to User Reference Image) */}
      <AnimatePresence>
        {showUserMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUserMenu(false)}
              className="fixed inset-0 z-[360] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-16 right-4 z-[370] w-72 rounded-3xl border border-white/20 bg-[#0d0d12]/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4"
            >
              {/* Header with SG Avatar & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#c2d902] text-black font-black flex items-center justify-center text-sm shadow-md">
                    SG
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">Mi Cuenta</h4>
                    <p className="text-[9px] font-bold text-zinc-400">usuario@stormgo.app</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                {[
                  {
                    icon: <Ticket className="h-4 w-4 text-[#c2d902]" />,
                    label: "Mis Entradas & Pases",
                    action: () => { setShowUserMenu(false); setShowPassesModal(true); }
                  },
                  {
                    icon: <CreditCard className="h-4 w-4 text-emerald-400" />,
                    label: "Historial de Compras",
                    action: () => { setShowUserMenu(false); setShowPassesModal(true); }
                  },
                  {
                    icon: <Key className="h-4 w-4 text-purple-400" />,
                    label: "Recuperar Entrada",
                    action: () => { setShowUserMenu(false); setShowRecoveryModal(true); }
                  },
                  {
                    icon: <Settings className="h-4 w-4 text-zinc-400" />,
                    label: "Ajustes de Cuenta",
                    action: () => { setShowUserMenu(false); }
                  },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Footer: Cerrar Sesión */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-black uppercase tracking-wider text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Styled overridden stylesheet for total monochromatic consistency */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --theme-primary: ${theme.primary};
          --theme-primary-rgb: ${primaryRgb};
          --theme-primary-light: ${theme.primaryLight};
          --theme-primary-dark: ${theme.primaryDark};
          --theme-bg-tint: rgba(255,255,255,0.04);
          --theme-bg-glow: rgba(255,255,255,0.01);
          --theme-bg-glow-dark: rgba(255,255,255,0.01);
          --theme-bg-accent: rgba(255,255,255,0.04);
          --theme-bg-grid: rgba(255,255,255,0.02);
          --theme-btn-from: ${theme.btnFrom};
          --theme-btn-to: ${theme.btnTo};
          --theme-btn-shadow: ${theme.btnShadow};
          --theme-glow-intense: ${theme.glowIntense};
          --theme-border-accent: ${theme.borderRgba};
          --theme-border-accent-light: rgba(255,255,255,0.12);
          --theme-border-accent-xlight: rgba(255,255,255,0.06);
          --theme-glow-rgba: ${theme.glowRgba};
          --theme-text-accent: ${theme.textAccent};
          --theme-text-rgb: ${primaryRgb};
          --theme-badge-bg: ${theme.badgeBg};
          --theme-card-border: ${theme.cardBorder};
          --theme-card-shadow: ${theme.cardShadow};
          --theme-hover-glow: ${theme.hoverGlow};
          --theme-bg-pink-500: rgba(255,255,255,0.08);
          --theme-bg-pink-500-hover: rgba(255,255,255,0.14);
          --theme-tag-bg: ${theme.tagBg};
        }
        .theme-btn { background: #ffffff !important; color: #000000 !important; }
        .theme-btn:hover { background: #e4e4e7 !important; }
        .theme-text { color: #ffffff !important; }
        .theme-border { border-color: rgba(255,255,255,0.08) !important; }
        .theme-border-light { border-color: rgba(255,255,255,0.12) !important; }
        .theme-border-xlight { border-color: rgba(255,255,255,0.06) !important; }
        .theme-glow { box-shadow: 0 0 40px rgba(255,255,255,0.02) !important; }
        .theme-badge { background: #27272a !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .theme-tag { background: rgba(255,255,255,0.05) !important; color: #e4e4e7 !important; }
        .theme-glow-sm { box-shadow: 0 0 24px rgba(255,255,255,0.02); }
        .theme-ring { box-shadow: 0 0 28px rgba(255,255,255,0.05); }
        .text-pink-100, .text-pink-50 { color: #ffffff !important; }
        .text-pink-300 { color: #e4e4e7 !important; }
        .hover\\:text-pink-300:hover { color: #ffffff !important; }
        .border-pink-300\\/25 { border-color: rgba(255,255,255,0.08) !important; }
        .border-pink-200\\/35, .border-pink-200\\/25, .border-pink-200\\/20, .border-pink-200\\/18, .border-pink-200\\/16 { border-color: rgba(255,255,255,0.08) !important; }
        .border-pink-300\\/35 { border-color: rgba(255,255,255,0.12) !important; }
        .border-pink-300\\/20 { border-color: rgba(255,255,255,0.08) !important; }
        .border-pink-300\\/[0.08] { border-color: rgba(255,255,255,0.06) !important; }
        .hover\\:border-pink-300\\/45:hover { border-color: rgba(255,255,255,0.2) !important; }
        .hover\\:border-pink-400\\/30:hover, .hover\\:border-pink-300\\/25:hover, .hover\\:border-pink-500\\/30:hover { border-color: rgba(255,255,255,0.15) !important; }
        .bg-pink-500\\/10 { background: rgba(255,255,255,0.04) !important; }
        .bg-pink-500\\/15 { background: rgba(255,255,255,0.06) !important; }
        .bg-pink-500\\/18 { background: rgba(255,255,255,0.08) !important; }
        .bg-pink-500\\/20 { background: rgba(255,255,255,0.1) !important; }
        .bg-pink-500\\/14, .bg-pink-500\\/16 { background: rgba(255,255,255,0.05) !important; }
        .bg-pink-500\\/[0.08] { background: rgba(255,255,255,0.04) !important; }
        .bg-pink-500\\/[0.055] { background: rgba(255,255,255,0.03) !important; }
        .bg-pink-500\\/12 { background: rgba(255,255,255,0.05) !important; }
        .bg-pink-500 { background: #ffffff !important; color: #000000 !important; }
        .hover\\:bg-pink-500\\/15:hover { background: rgba(255,255,255,0.08) !important; }
        .hover\\:bg-pink-500\\/20:hover { background: rgba(255,255,255,0.12) !important; }
        .hover\\:bg-pink-500\\/10:hover { background: rgba(255,255,255,0.06) !important; }
        .hover\\:bg-pink-400:hover { background: #e4e4e7 !important; }
        .bg-pink-400 { background: #ffffff !important; }
        .text-pink-200 { color: #a1a1aa !important; }
        .text-pink-400 { color: #ffffff !important; }
        .hover\\:bg-pink-100:hover { background: rgba(255,255,255,0.06) !important; }
        .bg-pink-600\\/20 { background: rgba(255,255,255,0.05) !important; }
        .bg-pink-300 { background: #ffffff !important; }
        .bg-pink-300\\/60 { background: rgba(255,255,255,0.4) !important; }
        .border-pink-300\\/15 { border-color: rgba(255,255,255,0.08) !important; }
        .border-pink-300\\/\\[0\\.12\\] { border-color: rgba(255,255,255,0.08) !important; }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes ticket-glow-pulse {
          0%, 100% {
            box-shadow: 0 40px 100px rgba(0,0,0,0.85), 0 0 30px rgba(225,0,117,0.2), inset 0 1px 0 rgba(255,255,255,0.15) !important;
            border-color: rgba(255,255,255,0.18) !important;
          }
          50% {
            box-shadow: 0 40px 100px rgba(0,0,0,0.85), 0 0 65px rgba(225,0,117,0.7), 0 0 100px rgba(225,0,117,0.35), inset 0 1px 0 rgba(225,0,117,0.4) !important;
            border-color: rgba(225,0,117,0.6) !important;
          }
        }
        .ticket-pulse-active {
          animation: ticket-glow-pulse 1.2s ease-in-out infinite !important;
        }
      `}} />
    </main>
  );
}

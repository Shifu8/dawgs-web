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
  ArrowLeft,
  LayoutDashboard,
  Search,
  Sparkles,
  Wine,
  CreditCard,
  Key,
  Settings,
  LogOut,
  Bell,
  BellRing,
  Music,
  Music2,
  Zap,
  MapPinned,
  Home,
  ShoppingBag,
  HelpCircle,
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
import PublishEventModal from "@/frontend/components/PublishEventModal";
import OrganizerPublishScreen from "@/frontend/features/organizer/OrganizerPublishScreen";
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
  { id: "wear", label: "Merch" },
  { id: "support", label: "Support" },
] as const;

type HomeNavId = (typeof HOME_NAV_ITEMS)[number]["id"];

// Segmented control / pill tabs for content filtering
const FILTER_TABS = [
  { id: "inicio", label: "HOME" },
  { id: "all", label: "Todo" },
  { id: "fiestas", label: "Fiestas" },
  { id: "conciertos", label: "Conciertos" },
] as const;

type FilterTabId = (typeof FILTER_TABS)[number]["id"] | "ciudad" | "publish";

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
  const [activeSection, setActiveSection] = useState<HomeNavId>("home");
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTabId>("inicio");
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isDrinksPosModalOpen, setIsDrinksPosModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Simulated user session (replace with real auth later)
  const [loggedUser] = useState<{ name: string; initials: string; notifications: number } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("sg_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
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
        const slugMatch = typeof (e as any).slug === "string" && (e as any).slug.toLowerCase() === targetSlug;
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

  // Classify events by type for filter tabs (strict, non-overlapping)
  const classifyEventType = (evt: Event): "fiesta" | "concierto" | "other" => {
    const titleLower = evt.title.toLowerCase();
    const subtitleLower = (evt.subtitle || "").toLowerCase();
    const combined = titleLower + " " + subtitleLower;
    // Fiestas: trap, urban, rnb, drop, night — underground party vibes
    if (
      combined.includes("trap") ||
      combined.includes("urban drop") ||
      combined.includes("rnb") ||
      combined.includes("r&b") ||
      combined.includes("night vision") ||
      combined.includes("night")
    ) {
      return "fiesta";
    }
    // Conciertos: latin, live, wave, concert — bigger show formats
    if (
      combined.includes("latin") ||
      combined.includes("live experience") ||
      combined.includes("global wave") ||
      combined.includes("wave")
    ) {
      return "concierto";
    }
    return "other";
  };

  const filteredCatalogEvents = events.filter((evt) => {
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.subtitle && evt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (evt.venue && evt.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "Todas" || evt.city.toLowerCase() === selectedCity.toLowerCase();

    // Tab-based filtering
    let matchesTab = true;
    if (activeFilterTab === "fiestas") {
      matchesTab = classifyEventType(evt) === "fiesta";
    } else if (activeFilterTab === "conciertos") {
      matchesTab = classifyEventType(evt) === "concierto";
    } else if (activeFilterTab === "ciudad") {
      // For city tab, city filter applies strictly
      matchesTab = true;
    }
    // "inicio" shows featured events (first 4), "all" shows all
    return matchesSearch && matchesCity && matchesTab;
  }).slice(0, activeFilterTab === "inicio" ? 4 : undefined);

  // Custom states for 3D Carousel & Premium visual effects
  const [activeIndex, setActiveIndex] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const activeEvent = events[activeIndex] || selectedCarouselEvent;
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const isSkipParam = window.location.search.includes("skipLoader");
      const isSkipStorage = sessionStorage.getItem("skip_4go_loader") === "true" || sessionStorage.getItem("skip_stormgo_loader") === "true";
      const isFromOrganizer = document.referrer.includes("/organizer");
      if (isSkipParam || isSkipStorage || isFromOrganizer) {
        try {
          sessionStorage.removeItem("skip_4go_loader");
          sessionStorage.removeItem("skip_stormgo_loader");
          if (isSkipParam) {
            window.history.replaceState({}, "", "/");
          }
        } catch (e) {}
        return false;
      }
    }
    return true;
  });

  // Clear loader on mount & popstate if needed
  useEffect(() => {
    if (!isLoading) return;

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
  }, [isLoading]);

  // Listen for Escape key to close all active floating menus/modals across the website
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showUserMenu) setShowUserMenu(false);
        if (showHiddenMenu) setShowHiddenMenu(false);
        if (showRecoveryModal) setShowRecoveryModal(false);
        if (showDrinksModal) setShowDrinksModal(false);
        if (showDetailOverlay) setShowDetailOverlay(false);
        if (isTicketModalOpen) setIsTicketModalOpen(false);
        if (isStaffModalOpen) setIsStaffModalOpen(false);
        if (isPosModalOpen) setIsPosModalOpen(false);
        if (isDrinksPosModalOpen) setIsDrinksPosModalOpen(false);
        window.dispatchEvent(new CustomEvent("close-ai-chatbot"));
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    showUserMenu,
    showHiddenMenu,
    showRecoveryModal,
    showDrinksModal,
    showDetailOverlay,
    isTicketModalOpen,
    isStaffModalOpen,
    isPosModalOpen,
    isDrinksPosModalOpen,
  ]);

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
      const exploreSection = document.getElementById("explore");
      const wearSection = document.getElementById("wear");

      const showTop = showSection ? showSection.getBoundingClientRect().top + window.scrollY : 0;
      const exploreTop = exploreSection ? exploreSection.getBoundingClientRect().top + window.scrollY : 0;
      const wearTop = wearSection ? wearSection.getBoundingClientRect().top + window.scrollY : 0;

      const scrollPosition = window.scrollY + window.innerHeight * 0.45;

      let currentSection: HomeNavId = "home";
      if (scrollPosition >= wearTop - 100) {
        currentSection = "wear";
      } else if (scrollPosition >= exploreTop - 100) {
        currentSection = "explore";
      } else {
        currentSection = "home";
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
    HOME_NAV_ITEMS.some((item) => item.id === id) ? (id as HomeNavId) : "home";

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
    scrollToSection("tickets-stage", "center", "home");
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

  // ── Events screen: events shown when a non-home tab is active ──
  const filteredTabEvents = events.filter((evt) => {
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.subtitle && evt.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      evt.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "Todas" || evt.city.toLowerCase() === selectedCity.toLowerCase();

    let matchesTab = true;
    if (activeFilterTab === "fiestas") {
      matchesTab = classifyEventType(evt) === "fiesta";
    } else if (activeFilterTab === "conciertos") {
      matchesTab = classifyEventType(evt) === "concierto";
    }
    // "all" and "ciudad" show everything (city filter handles ciudad)
    return matchesSearch && matchesCity && matchesTab;
  });

  // Glow color per tab for the screen transition
  const TAB_GLOW: Record<string, string> = {
    all:        "rgba(139,92,246,0.55)",
    fiestas:    "rgba(225,0,117,0.55)",
    conciertos: "rgba(194,217,2,0.45)",
    publish:    "rgba(139,92,246,0.65)",
  };
  const TAB_LABEL: Record<string, string> = {
    all:        "Todo",
    fiestas:    "Fiestas",
    conciertos: "Conciertos",
    publish:    "Sube tu Evento",
  };
  const TAB_SUB: Record<string, string> = {
    all:        "Toda la cartelera disponible",
    fiestas:    "Trap · Urban · RnB · Nocturno",
    conciertos: "Latin · Live · Concerts",
    publish:    "Publica y gestiona tus eventos en Ecuador",
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
                <svg className="w-full h-full select-none" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Left Leg & Chunky Sneaker */}
                  <path d="M 38 82 L 28 98 C 24 104, 12 108, 10 114 C 8 120, 20 124, 34 122 C 44 120, 48 110, 44 98 L 48 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 12 114 C 18 108, 30 108, 40 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />

                  {/* Right Leg & Chunky Sneaker */}
                  <path d="M 82 82 L 90 98 C 94 104, 106 108, 108 114 C 110 120, 98 124, 84 122 C 74 120, 70 110, 74 98 L 72 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 108 114 C 102 108, 90 108, 80 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />

                  {/* Main Number 4 Body Contour */}
                  <path d="M 64 12 L 22 64 L 22 76 L 70 76 L 70 94 L 88 94 L 88 76 L 102 76 L 102 58 L 88 58 L 88 12 Z" fill="#ffffff" stroke="#111111" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 70 28 L 70 58 L 46 58 Z" fill="#111111" stroke="#111111" strokeWidth="2" strokeLinejoin="round" />

                  {/* Winking Eyebrow Motion */}
                  <motion.path
                    d="M 30 36 L 46 33"
                    stroke="#111111"
                    strokeWidth="5"
                    strokeLinecap="round"
                    animate={{ rotate: [0, -12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <path d="M 66 31 L 82 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />

                  {/* Animated Sunglasses Frame */}
                  <motion.g
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M 18 44 C 18 44, 46 38, 52 47 C 58 38, 86 44, 86 44 L 80 60 C 80 60, 58 64, 52 57 C 46 64, 24 60, 24 60 Z" fill="#111111" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
                    <line x1="28" y1="47" x2="40" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    <line x1="60" y1="47" x2="72" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
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
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl shadow-lg transition-all duration-500 ${
          activeFilterTab === "publish"
            ? "bg-black/35 border-[#c2d902]/30 text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-[#8b5cf6]/95 border-white/15 text-black"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 md:px-12 lg:px-16">
          
          {/* Logo + Greeting block */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveFilterTab("inicio");
                const el = document.getElementById("show");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex select-none items-center gap-2 outline-none hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label="4go"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
                <svg className="w-full h-full select-none" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Ultra-Clean HD 4 Mascot with Sunglasses & Streetwear Sneakers */}
                  <path d="M 38 82 L 28 98 C 24 104, 12 108, 10 114 C 8 120, 20 124, 34 122 C 44 120, 48 110, 44 98 L 48 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 12 114 C 18 108, 30 108, 40 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 82 82 L 90 98 C 94 104, 106 108, 108 114 C 110 120, 98 124, 84 122 C 74 120, 70 110, 74 98 L 72 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 108 114 C 102 108, 90 108, 80 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 64 12 L 22 64 L 22 76 L 70 76 L 70 94 L 88 94 L 88 76 L 102 76 L 102 58 L 88 58 L 88 12 Z" fill="#ffffff" stroke="#111111" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
                  <path d="M 70 28 L 70 58 L 46 58 Z" fill="#111111" stroke="#111111" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M 30 36 L 46 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 66 31 L 82 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 18 44 C 18 44, 46 38, 52 47 C 58 38, 86 44, 86 44 L 80 60 C 80 60, 58 64, 52 57 C 46 64, 24 60, 24 60 Z" fill="#111111" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
                  <line x1="28" y1="47" x2="40" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                  <line x1="60" y1="47" x2="72" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
              <span className={`logo-text flex items-center text-xs sm:text-sm font-extrabold tracking-tight leading-none select-none ${activeFilterTab === "publish" ? "text-[#c2d902]" : "text-black"}`}>
                4go
              </span>
            </button>

            {/* Greeting — shown only when logged in */}
            {loggedUser && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center gap-2.5 ml-1"
              >
                <div className="h-8 w-8 rounded-full bg-black/30 border-2 border-white/40 flex items-center justify-center text-xs font-black text-white shadow-lg shrink-0 backdrop-blur-md">
                  {loggedUser.initials}
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">¡Hola de nuevo!</span>
                  <span className="text-xs font-black text-white tracking-tight">{loggedUser.name}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Desktop nav REMOVED — functionality merged into pill tabs below */}

          {/* Right side actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {activeFilterTab === "publish" ? (
              <button
                type="button"
                onClick={() => setActiveFilterTab("inicio")}
                className="hidden sm:inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3.5 text-[9px] font-black uppercase tracking-[0.16em] bg-white/10 text-white/90 border border-white/20 hover:bg-white/20 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-white/80" />
                <span>VOLVER AL INICIO</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveFilterTab("publish")}
                className="relative group inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3.5 text-[9px] font-black uppercase tracking-[0.16em] transition-all duration-300 active:scale-95 cursor-pointer border bg-white/10 text-white/90 border-white/25 hover:bg-white hover:text-black backdrop-blur-md shadow-md"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white/80 group-hover:text-black" />
                <span>SUBE UN EVENTO</span>
              </button>
            )}

            {/* Notification Bell — only when logged in */}
            {loggedUser && (
              <button
                type="button"
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md cursor-pointer"
                aria-label="Notificaciones"
                title="Notificaciones"
              >
                {loggedUser.notifications > 0 ? (
                  <BellRing className="w-4 h-4 animate-[wiggle_1s_ease-in-out_infinite]" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                {loggedUser.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#e10075] text-white text-[8px] font-black flex items-center justify-center shadow-lg border border-[#8b5cf6] animate-pulse">
                    {loggedUser.notifications > 9 ? "9+" : loggedUser.notifications}
                  </span>
                )}
              </button>
            )}

            {/* User / Profile button */}
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 shadow-md cursor-pointer overflow-hidden ${
                showUserMenu
                  ? "bg-[#8b5cf6] text-white border-[#8b5cf6] scale-105 shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:scale-105 active:scale-95"
              }`}
              title="Perfil / Iniciar Sesión / Registrarse"
              aria-label="Perfil y cuenta de usuario"
            >
              {loggedUser ? (
                <span className="text-[10px] font-black text-white">{loggedUser.initials}</span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </button>
          </div>

        </div>

        {/* ── Glassmorphic Segmented Control / Pill Tabs (Hidden on Publish mode for 1 clean header) ── */}
        {activeFilterTab !== "publish" && (
          <div className="border-t border-white/10 bg-[#7c3aed]/60 backdrop-blur-md px-4 py-2 sm:px-6 transition-all duration-300">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center">
              {/* Pill container — scrollable on mobile, centered on desktop */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 lg:overflow-visible lg:flex-wrap lg:justify-center">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeFilterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      id={`filter-tab-${tab.id}`}
                      onClick={() => setActiveFilterTab(tab.id)}
                      className={`relative flex shrink-0 items-center justify-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer select-none ${
                        isActive
                          ? "bg-white text-black shadow-[0_2px_14px_rgba(255,255,255,0.35)] scale-105"
                          : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/20 backdrop-blur-sm"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span>{tab.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="active-pill-indicator"
                          className="absolute inset-0 rounded-full bg-white/10 -z-10"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════
          EVENTS SCREEN — Fixed overlay, only mounts/unmounts on inicio toggle
          Key is fixed so switching tabs doesn't cause overlay to flash home
          ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeFilterTab !== "inicio" && (
          <motion.div
            key="events-screen"
            initial={{ opacity: 0, filter: "blur(16px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-[#050507] overflow-hidden"
            style={{ paddingTop: activeFilterTab === "publish" ? "52px" : "96px" }}
          >
            {/* Glow burst — animates on tab change, but overlay stays opaque */}
            <AnimatePresence mode="sync">
              <motion.div
                key={`glow-${activeFilterTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background: `radial-gradient(ellipse 70% 45% at 50% 0%, ${TAB_GLOW[activeFilterTab] ?? "rgba(139,92,246,0.5)"} 0%, transparent 70%)`,
                }}
              />
            </AnimatePresence>

            {/* Subtle grid lines — static, no animation needed */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* ── Screen Header — title/subtitle animate per tab (Hidden on publish mode for clean single header) ── */}
            {activeFilterTab !== "publish" && (
              <div className="flex-shrink-0 px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between gap-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setActiveFilterTab("inicio")}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
                  aria-label="Volver al inicio"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`header-${activeFilterTab}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-none">
                      {TAB_LABEL[activeFilterTab]}
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-0.5">
                      {TAB_SUB[activeFilterTab]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right: event count + search (only for show catalog tabs) */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex text-[10px] font-black text-white/60 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                  {filteredTabEvents.length} {filteredTabEvents.length === 1 ? "evento" : "eventos"}
                </span>
                <div className="relative flex items-center bg-white/5 border border-white/15 rounded-full px-3 py-2 gap-2 focus-within:border-white/35 transition">
                  <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs font-medium text-white placeholder-zinc-500 focus:outline-none w-28 sm:w-40"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-[10px] text-zinc-400 hover:text-white font-bold cursor-pointer">✕</button>
                  )}
                </div>
              </div>
            </div>
            )}

            {activeFilterTab === "publish" ? (
              <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
                <OrganizerPublishScreen />
              </div>
            ) : (
              <>
                {/* City filter chips — shown in ALL SHOWS, FIESTAS, CONCIERTOS overlay screen */}
                <div className="flex-shrink-0 flex items-center gap-2 overflow-x-auto px-4 sm:px-6 py-2.5 border-b border-white/10 scrollbar-none">
                  {["Todas", "Loja", "Quito", "Guayaquil", "Cuenca", "Manta"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCity(c)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                        selectedCity === c
                          ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.3)] scale-105"
                          : "bg-white/8 border-white/20 text-white/80 hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

            {/* ── Events Grid — only the cards grid animates on tab change ── */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-5 pb-8 no-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`grid-${activeFilterTab}-${selectedCity}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {filteredTabEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center">
                        <Ticket className="w-7 h-7 text-white/40" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-white/40">Sin eventos disponibles</p>
                      <p className="text-xs text-white/25 font-medium">Prueba otra categoría o ciudad</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                      {filteredTabEvents.map((evt, idx) => (
                        <motion.div
                          key={evt.id}
                          initial={{ opacity: 0, y: 24, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            duration: 0.35,
                            delay: idx * 0.055,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          onClick={() => {
                            setSelectedCarouselEvent(evt);
                            setShowDetailOverlay(true);
                          }}
                          className="group relative flex flex-col rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden cursor-pointer hover:border-white/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]"
                        >
                          {/* Poster */}
                          <div className="relative w-full aspect-square overflow-hidden bg-zinc-900">
                            {evt.poster ? (
                              <Image
                                src={evt.poster}
                                alt={evt.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 640px) 50vw, 300px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                <span className="text-2xl font-black text-zinc-700">{evt.title.slice(0, 2).toUpperCase()}</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            {/* Price badge */}
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-black shadow">
                              ${evt.price ?? "—"} USD
                            </span>
                            {/* City badge */}
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 border border-white/20 text-[8px] font-bold uppercase text-white/90 backdrop-blur-sm">
                              {evt.city}
                            </span>
                            {/* Glow on hover */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ background: `radial-gradient(ellipse 60% 50% at 50% 100%, ${TAB_GLOW[activeFilterTab] ?? "rgba(139,92,246,0.3)"} 0%, transparent 70%)` }}
                            />
                          </div>

                          {/* Info */}
                          <div className="p-3 flex flex-col gap-1 border-t border-white/5 bg-[#09090b]">
                            <p className="text-[8px] font-black uppercase tracking-widest text-[#e10075] truncate">{evt.organizer ?? "4go"}</p>
                            <h4 className="text-xs font-black uppercase text-white leading-tight line-clamp-1">{evt.title}</h4>
                            <p className="text-[10px] text-zinc-400 font-medium line-clamp-1">{evt.subtitle}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-500" />
                                {evt.dateLabel}
                              </span>
                              <span className="text-[9px] font-black text-white/80 group-hover:text-white flex items-center gap-0.5 transition-colors">
                                Ver <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    )}
  </AnimatePresence>

      {/* Monochromatic 3D Concrete Room backdrop */}
      <section
        id="show"
        className="relative z-10 flex w-full flex-col overflow-hidden px-4 pb-12 pt-24 sm:px-8 md:px-14 lg:px-20 justify-start"
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

          {/* Top Pill Badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 select-none">
            <span className="px-4 py-1.5 rounded-full border border-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              temporada 2026
            </span>
            <span className="px-6 py-2 rounded-2xl bg-black text-white font-black text-sm sm:text-base uppercase tracking-widest shadow-xl border border-white/20">
              4go
            </span>
            <span className="px-4 py-1.5 rounded-full border border-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              tickets digitales
            </span>
          </div>

          {/* Home Sub-Pill Shortcuts to Merch & Soporte */}
          <div className="flex items-center justify-center gap-2 mb-6 select-none">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("wear");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-black text-[10px] sm:text-xs font-black uppercase tracking-wider text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>MERCH</span>
            </button>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
                const el = document.getElementById("support");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white hover:text-black text-[10px] sm:text-xs font-black uppercase tracking-wider text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>SOPORTE</span>
            </button>
          </div>

          {/* Headline */}
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
                EXPERIENCIA!
              </h1>
              <span className="text-[#c2d902] text-3xl sm:text-5xl font-black animate-pulse">✳</span>
            </div>
          </div>

          {/* Centerpiece: 2 Angled 3D Smartphones (Matching Reference Image Center Stage) */}
          <div className="relative w-full max-w-[580px] h-[340px] sm:h-[440px] my-6 sm:my-8 flex items-center justify-center select-none">
            {/* Left Phone (Lime Green Frame, angled -10deg) */}
            <motion.div
              initial={{ y: 0, rotate: -10 }}
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
              initial={{ y: 0, rotate: 7 }}
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

          <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-white max-w-xl mx-auto leading-relaxed drop-shadow-md">
            Explora la cartelera exclusiva de conciertos, festivales y fiestas en Ecuador. Tickets digitales oficiales con verificación instantánea.
          </p>
        </div>

        {/* Clean Spaced Catalog Section Below Presentation */}
        <div id="explore" className="relative z-20 w-full max-w-[1600px] mx-auto mt-6 sm:mt-10 pt-6 space-y-8">
          
          {/* Section Header with current tab label + search bar */}
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md">
                {activeFilterTab === "inicio" && "Destacados"}
                {activeFilterTab === "all" && "Todo"}
                {activeFilterTab === "fiestas" && "Fiestas"}
                {activeFilterTab === "conciertos" && "Conciertos"}
                {activeFilterTab === "ciudad" && "Por Ciudad"}
              </h2>
              <p className="text-xs font-bold text-white/60 mt-1 uppercase tracking-widest">
                {activeFilterTab === "inicio" && "Los eventos más populares"}
                {activeFilterTab === "all" && "Toda la cartelera disponible"}
                {activeFilterTab === "fiestas" && "Trap · Urban · Nocturno"}
                {activeFilterTab === "conciertos" && "Latin · Live · Conciertos"}
                {activeFilterTab === "ciudad" && "Filtra por tu ciudad"}
              </p>
            </div>

            {/* Search Bar */}
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

          {/* City filter chips — shown only when "Por Ciudad" tab is active */}
          {activeFilterTab === "ciudad" && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none my-2"
            >
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white shrink-0 mr-2 drop-shadow-sm">Ciudad:</span>
              {["Todas", "Loja", "Quito", "Guayaquil", "Cuenca", "Manta"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCity(c)}
                  className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition shrink-0 cursor-pointer ${
                    selectedCity === c
                      ? "border-white bg-white text-black font-black shadow-xl scale-105"
                      : "border-white/40 bg-black/30 text-white font-extrabold hover:bg-white hover:text-black backdrop-blur-md shadow-sm"
                  }`}
                >
                  {c}
                </button>
              ))}
            </motion.div>
          )}

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
          <div className="mt-10 pt-6 border-t border-white/15">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-8 max-w-[1400px] mx-auto px-2">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white flex items-center gap-3 drop-shadow-md">
                <span className="inline-block w-2.5 h-6 bg-[#c2d902] rounded-full shadow-md" />
                Cartelera Completa &amp; Shows
              </h3>
              <span className="text-xs font-black uppercase tracking-widest text-white/90 bg-black/25 border border-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-md">
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

      {/* Electric Purple High Contrast Footer */}
      <footer
        id="support"
        className="relative z-10 -mx-4 border-t border-black/20 px-4 py-16 sm:-mx-8 sm:px-6 md:-mx-14 md:px-12 lg:-mx-20 lg:px-16 bg-[#8b5cf6] text-black"
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center text-center gap-4">
          {/* Logo brand 4go */}
          <div className="flex items-center gap-2 select-none mb-1">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-full h-full select-none" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ultra-Clean HD 4 Mascot with Sunglasses & Streetwear Sneakers */}
                <path d="M 38 82 L 28 98 C 24 104, 12 108, 10 114 C 8 120, 20 124, 34 122 C 44 120, 48 110, 44 98 L 48 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M 12 114 C 18 108, 30 108, 40 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
                <path d="M 82 82 L 90 98 C 94 104, 106 108, 108 114 C 110 120, 98 124, 84 122 C 74 120, 70 110, 74 98 L 72 82 Z" fill="#ffffff" stroke="#111111" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M 108 114 C 102 108, 90 108, 80 116" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
                <path d="M 64 12 L 22 64 L 22 76 L 70 76 L 70 94 L 88 94 L 88 76 L 102 76 L 102 58 L 88 58 L 88 12 Z" fill="#ffffff" stroke="#111111" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M 70 28 L 70 58 L 46 58 Z" fill="#111111" stroke="#111111" strokeWidth="2" strokeLinejoin="round" />
                <path d="M 30 36 L 46 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
                <path d="M 66 31 L 82 33" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
                <path d="M 18 44 C 18 44, 46 38, 52 47 C 58 38, 86 44, 86 44 L 80 60 C 80 60, 58 64, 52 57 C 46 64, 24 60, 24 60 Z" fill="#111111" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
                <line x1="28" y1="47" x2="40" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                <line x1="60" y1="47" x2="72" y2="53" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="logo-text flex items-center text-sm sm:text-base font-extrabold tracking-tight leading-none select-none text-black">
              4go
            </span>
          </div>

          <p className="text-lg sm:text-xl font-black uppercase tracking-[0.35em] text-black">
            {config.footer.brand}
          </p>

          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.footer.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-1 inline-flex items-center gap-2 rounded-full border border-black/25 bg-black/10 px-6 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-black backdrop-blur-md transition hover:bg-black hover:text-white shadow-sm"
          >
            {config.footer.email}
          </a>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chatbot"))}
            className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black shadow-lg hover:bg-zinc-100 active:scale-95 transition cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#8b5cf6]" />
            <span>Soporte IA & Preguntas</span>
          </button>

          <p className="mt-2 text-xs font-black tracking-wider text-black/90">
            {config.footer.copyright}
          </p>

          {/* DevEc Signature - Crystal Clear High Contrast */}
          <div className="mt-6 flex flex-col items-center gap-1 opacity-95 hover:opacity-100 transition-opacity duration-300 select-none">
            <span className="text-[9px] font-black tracking-[0.25em] text-black uppercase">Desarrollado por</span>
            <div className="flex flex-col items-center">
              <svg className="h-[20px] w-auto" viewBox="0 0 110 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="25" fill="#000000" fontSize="22" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.02em">Dev</text>
                <text x="41" y="25" fill="#000000" fontSize="22" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.02em">E</text>
                <text x="56" y="25" fill="#000000" fontSize="22" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="-0.02em">c</text>
                {/* Waving flag tail */}
                <path d="M70 20 C78 20, 80 10, 92 10 C96 10, 98 14, 102 12" stroke="#FFDD00" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M70 23 C78 23, 80 13, 92 13 C96 13, 98 17, 102 15" stroke="#0033A0" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M70 26 C78 26, 80 16, 92 16 C96 16, 98 20, 102 18" stroke="#D52B1E" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-[7px] font-black tracking-[0.3em] text-black/90 uppercase mt-0.5">
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
        allEvents={events}
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

      {/* User Profile Floating Glass Dropdown Menu */}
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
              className="fixed top-16 right-4 z-[370] w-80 rounded-3xl border border-white/20 bg-[#0d0d12]/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4 text-white"
            >
              {/* Header with Purple Guest Avatar & Close Button (ONLY MI CUENTA) */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#8b5cf6] text-white font-black flex items-center justify-center text-sm shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-black uppercase text-white tracking-wider leading-none">MI CUENTA</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUserMenu(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Primary Auth Action Buttons in Green / Lime */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/organizer/login");
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-wider text-center hover:bg-zinc-100 transition-colors shadow-md cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/organizer/register");
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-[#8b5cf6] text-white font-black text-xs uppercase tracking-wider text-center hover:bg-[#7c3aed] transition-colors shadow-md cursor-pointer"
                >
                  Registrarse
                </button>
              </div>

              {/* Menu Items */}
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowRecoveryModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Key className="h-4 w-4 text-[#c2d902]" />
                  <span>Recuperar Mis Entradas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#8b5cf6]" />
                  <span>Soporte IA & Preguntas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/organizer/register");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-black uppercase tracking-wider text-zinc-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4 text-[#8b5cf6]" />
                  <span>Publicar un Evento</span>
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
        @keyframes wiggle {
          0%, 100% { transform: rotate(-12deg); }
          25% { transform: rotate(12deg); }
          50% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
      `}} />
    </main>
  );
}

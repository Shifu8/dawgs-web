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
  Compass,
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
import MobileDock from "@/frontend/components/MobileDock";
import OrganizerProfileOverlay from "@/frontend/features/organizer/OrganizerProfileOverlay";
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

  // Search & Catalog Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedDay, setSelectedDay] = useState("todos");
  const [selectedOrganizer, setSelectedOrganizer] = useState("todos");
  const [showOrganizerOverlay, setShowOrganizerOverlay] = useState(false);
  const [selectedOrganizerSlug, setSelectedOrganizerSlug] = useState("cubic");
  const [mobileDockTab, setMobileDockTab] = useState("inicio");
  const [heroIndex, setHeroIndex] = useState(0);
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
      combined.includes("urban") ||
      combined.includes("rnb") ||
      combined.includes("night") ||
      combined.includes("party") ||
      combined.includes("discoteca") ||
      combined.includes("fiesta") ||
      combined.includes("shots") ||
      combined.includes("cubic")
    ) {
      return "fiesta";
    }
    // Conciertos: latin, live, wave, concert — bigger show formats
    if (
      combined.includes("live") ||
      combined.includes("concert") ||
      combined.includes("latin") ||
      combined.includes("fest") ||
      combined.includes("tour") ||
      combined.includes("show")
    ) {
      return "concierto";
    }
    return "other";
  };

  const filteredCatalogEvents = events.filter((evt) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      evt.title.toLowerCase().includes(query) ||
      (evt.subtitle && evt.subtitle.toLowerCase().includes(query)) ||
      (evt.venue && evt.venue.toLowerCase().includes(query)) ||
      (evt.organizer && evt.organizer.toLowerCase().includes(query)) ||
      evt.city.toLowerCase().includes(query);

    const matchesCity = selectedCity === "Todas" || evt.city.toLowerCase() === selectedCity.toLowerCase();

    // Day filter
    let matchesDay = true;
    if (selectedDay !== "todos") {
      const dateText = (evt.dateLabel || "" + ((evt as any).date || "")).toLowerCase();
      if (selectedDay === "viernes") matchesDay = dateText.includes("vie") || dateText.includes("fri") || dateText.includes("15") || dateText.includes("22");
      else if (selectedDay === "sabado") matchesDay = dateText.includes("sab") || dateText.includes("sáb") || dateText.includes("sat") || dateText.includes("16") || dateText.includes("23");
      else if (selectedDay === "domingo") matchesDay = dateText.includes("dom") || dateText.includes("sun") || dateText.includes("17");
      else if (selectedDay === "lunes") matchesDay = dateText.includes("lun") || dateText.includes("mon") || dateText.includes("18");
    }

    // Organizer filter
    let matchesOrg = true;
    if (selectedOrganizer !== "todos") {
      const orgText = (evt.organizer || "" + evt.title).toLowerCase();
      if (selectedOrganizer === "cubic") matchesOrg = orgText.includes("cubic");
      else if (selectedOrganizer === "lequat") matchesOrg = orgText.includes("lequat");
      else if (selectedOrganizer === "now") matchesOrg = orgText.includes("now") || orgText.includes("4go");
    }

    // Tab-based filtering
    let matchesTab = true;
    if (activeFilterTab === "fiestas") {
      matchesTab = classifyEventType(evt) === "fiesta";
    } else if (activeFilterTab === "conciertos") {
      matchesTab = classifyEventType(evt) === "concierto";
    }

    return matchesSearch && matchesCity && matchesDay && matchesOrg && matchesTab;
  });

  // Custom states for 3D Carousel & Premium visual effects
  const [activeIndex, setActiveIndex] = useState(0);
  const [trendingIndex, setTrendingIndex] = useState(0);
  const activeEvent = events[activeIndex] || selectedCarouselEvent;
  const [isLoading, setIsLoading] = useState(false);

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

      {/* ─── APPLE ARCADE FULL-BLEED TRANSPARENT TOP HEADER ─── */}
      <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/80 via-black/30 to-transparent px-4 sm:px-8 pt-4 pb-6 transition-all duration-300">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4">
          {/* Left: Bold "Home" Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveFilterTab("inicio");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
                Home
              </h1>
            </button>
          </div>

          {/* Right: Avatar Badge */}
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/20 backdrop-blur-md shadow-lg">
              <span className="text-[10px] font-extrabold text-purple-300 tracking-wider uppercase">
                SUBSCRIBER
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400/80 bg-black flex items-center justify-center shadow-lg cursor-pointer"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN HOME CONTENT (MATCHING REFERENCE IMAGE FULL-BLEED HERO) ─── */}
      <div className="pb-28 min-h-screen bg-black text-white">

        {/* ─── 1. FULL-BLEED HERO SHOWCASE (4go Alien Chef Intro & Event Slides) ─── */}
        <section className="relative w-full overflow-hidden">
          {(() => {
            const heroSlides = [
              {
                id: "4go-chef-intro",
                poster: "/images/4go-hero-chef-alien.png",
                title: "4go",
                tagline: "FOR YOU",
                line1: "Los mejores shots y la previa... ¿estás listo?",
                line2: "Explora y vive la fiesta con 4go",
                event: events[0] || fallbackEvents[0],
              },
              ...events.map((e) => ({
                id: e.id,
                poster: e.poster || "/images/now4go-hero-presentation-hd-v3.png",
                title: e.title,
                tagline: "FOR YOU",
                line1: e.subtitle || e.venue,
                line2: e.description || "Entradas oficiales disponibles",
                event: e,
              })),
            ];

            const currentSlide = heroSlides[heroIndex % heroSlides.length];

            return (
              <div className="relative w-full flex flex-col items-center">
                {/* Full-Bleed Hero Image Container */}
                <div
                  onClick={() => {
                    const el = document.getElementById("explore");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="relative w-full h-[620px] sm:h-[700px] overflow-hidden bg-[#0a0512] group cursor-pointer"
                >
                  {/* Hero Image Background (Extends all the way to top 0 with object-center to show green alien, sushi & friends) */}
                  <Image
                    src={currentSlide.poster}
                    alt={currentSlide.title}
                    fill
                    priority
                    className="object-cover object-center brightness-105 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Vibrant Purple & Magenta Ambient Glow Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#6b21a8]/35 via-[#c026d3]/25 to-transparent opacity-90" />

                  {/* Bottom Purple/Magenta Soft Gradient & Blur Fade Effect */}
                  <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-b from-transparent via-[#180828]/50 via-black/85 to-black backdrop-blur-[1px]" />

                  {/* Hero Superimposed Content (Matching User's Reference Image Typography) */}
                  <div className="absolute bottom-6 inset-x-0 p-6 flex flex-col items-center text-center z-10 max-w-xl mx-auto">
                    
                    {/* FOR YOU Subtitle */}
                    <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#ff77a8] block mb-1 drop-shadow-md">
                      {currentSlide.tagline}
                    </span>

                    {/* Hero Title */}
                    <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-2xl">
                      {currentSlide.title}
                    </h2>

                    {/* Description Tagline Lines (Matching image 2 style) */}
                    <div className="mt-1.5 flex flex-col items-center text-center space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-zinc-100 drop-shadow line-clamp-1">
                        {currentSlide.line1}
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-zinc-300 drop-shadow line-clamp-1">
                        {currentSlide.line2}
                      </p>
                    </div>

                    {/* Glass Pill Button — EMPEZAR */}
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById("explore");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-14 py-3.5 rounded-full bg-white/20 hover:bg-white/35 text-white font-black text-xs uppercase tracking-widest backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(192,38,211,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        EMPEZAR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Carousel Pagination Dots directly underneath Hero */}
                <div className="flex items-center justify-center gap-2 -mt-2 mb-4 select-none relative z-20">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={`hero-dot-${idx}`}
                      type="button"
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === (heroIndex % heroSlides.length)
                          ? "w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                          : "w-2 bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        {/* ─── 2. SECTION: ORGANIZADORES & DISCOTECAS DESTACADAS ─── */}
        <section className="py-6 px-4 sm:px-8 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
              Discotecas &amp; Organizadores
            </h3>
          </div>

          {/* Organizer Brand Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "cubic", name: "Cubic Loja", tagline: "Nightclub", color: "from-purple-900/60 to-black", border: "border-purple-500/40" },
              { id: "lequat", name: "Lequat", tagline: "Eventos & Shows", color: "from-pink-900/60 to-black", border: "border-pink-500/40" },
              { id: "now", name: "NOW 4GO", tagline: "Originals", color: "from-emerald-900/60 to-black", border: "border-emerald-500/40" },
            ].map((org) => {
              const isSelected = selectedOrganizer === org.id;

              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrganizer(isSelected ? "todos" : org.id);
                    if (org.id === "cubic") {
                      setSelectedOrganizerSlug("cubic");
                      setShowOrganizerOverlay(true);
                    } else {
                      const el = document.getElementById("explore");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer bg-gradient-to-b ${org.color} ${
                    isSelected ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105" : `${org.border} hover:border-white/50`
                  }`}
                >
                  <span className="text-xs font-black uppercase text-white tracking-wider">{org.name}</span>
                  <span className="text-[9px] text-zinc-400 font-medium mt-0.5">{org.tagline}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── 3. SECTION: EVENTOS DE LA SEMANA (FILTRO POR DÍAS) ─── */}
        <section id="explore" className="py-8 px-4 sm:px-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-sans">
                Cartelera de Eventos
              </h3>
              <p className="text-xs text-zinc-400 font-medium">Filtra por día o busca tu fiesta favorita</p>
            </div>

            {/* Day Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "todos", label: "Todos" },
                { id: "viernes", label: "Viernes" },
                { id: "sabado", label: "Sábado" },
                { id: "domingo", label: "Domingo" },
                { id: "lunes", label: "Lunes" },
              ].map((day) => {
                const isActive = selectedDay === day.id;

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setSelectedDay(day.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-black border-white shadow-md scale-105"
                        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of Rounded Event Thumbnail Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCatalogEvents.map((evt) => (
              <div
                key={`cat-${evt.id}`}
                onClick={() => {
                  setSelectedCarouselEvent(evt);
                  setShowDetailOverlay(true);
                }}
                className="group relative flex flex-col rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-pointer hover:border-purple-500 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                <div className="relative w-full aspect-square bg-zinc-900 overflow-hidden">
                  <Image
                    src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                    alt={evt.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-black shadow">
                    ${evt.price || 10} USD
                  </span>
                </div>

                <div className="p-3 flex flex-col justify-between flex-1 bg-[#09090b]">
                  <div>
                    <span className="text-[9px] font-black uppercase text-purple-400 tracking-wider block">
                      {evt.organizer || "4GO"}
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase group-hover:text-purple-300 transition-colors line-clamp-1">
                      {evt.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium line-clamp-1 mt-0.5">
                      {evt.subtitle || evt.venue}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[9px] font-bold text-zinc-300">
                    <span>{evt.dateLabel}</span>
                    <span className="text-purple-300 font-extrabold">Ver &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ─── FLOATING BOTTOM NAVIGATION DOCK ─── */}
      <MobileDock
        activeTab={mobileDockTab}
        onTabChange={(t) => {
          setMobileDockTab(t);
          if (t === "explorar") {
            const el = document.getElementById("explore");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* Apple Music Style Verified Organizer Profile Overlay */}
      <OrganizerProfileOverlay
        isOpen={showOrganizerOverlay}
        onClose={() => setShowOrganizerOverlay(false)}
        organizerName={selectedOrganizerSlug}
        allEvents={events}
        onSelectEvent={(evt) => {
          setSelectedCarouselEvent(evt);
          setShowDetailOverlay(true);
        }}
        onBuyEvent={(evt) => {
          setSelectedCarouselEvent(evt);
          onBuy(evt);
        }}
      />

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
          onOpenOrganizer={(slug) => {
            setSelectedOrganizerSlug(slug || "cubic");
            setShowOrganizerOverlay(true);
          }}
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

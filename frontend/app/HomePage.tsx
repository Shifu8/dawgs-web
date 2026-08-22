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
  Play,
  Heart,
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
import VkFest3DCylinderCarousel from "@/frontend/components/VkFest3DCylinderCarousel";
import EventTicketCarousel, { CAROUSEL_EVENTS } from "@/frontend/components/EventTicketCarousel";
import EventDetailOverlay from "@/frontend/features/events/EventDetailOverlay";
import InstallApp from "@/frontend/components/InstallApp";
import MobileDock from "@/frontend/components/MobileDock";
import OrganizerProfileOverlay from "@/frontend/features/organizer/OrganizerProfileOverlay";
import { QuickPreviewModal } from "@/frontend/components/QuickPreviewModal";
import { gsap, useGSAP } from "@/frontend/animations/gsapSetup";
import DrinksMenuModal from "@/frontend/components/DrinksMenuModal";
import StoryLinesHeader, { type StoryScreen } from "@/frontend/components/StoryLinesHeader";
import AlienIcon from "@/frontend/components/AlienIcon";
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

  // 3D Perspective Curved Carousel state for Eventos screen
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);

  // Story-style screen navigation state (Instagram/TikTok lines)
  const [activeStoryScreen, setActiveStoryScreen] = useState(1);

  // Auto-play 3D Curved Carousel in Eventos screen (moving to the right)
  useEffect(() => {
    if (activeStoryScreen !== 2) return;
    const interval = setInterval(() => {
      setFeaturedCarouselIndex((prev) => (prev + 1) % Math.max(1, (events || []).length));
    }, 2800);
    return () => clearInterval(interval);
  }, [activeStoryScreen, events]);

  const storyScreens: StoryScreen[] = [
    { id: "create", label: "Sube tu evento", icon: <PlusCircle className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: "home", label: "Home", icon: <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: "eventos", label: "Cartelera", icon: <Calendar className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  const handleScreenDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 25;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -100) {
      setActiveStoryScreen((prev) => Math.min(prev + 1, storyScreens.length - 1));
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 100) {
      setActiveStoryScreen((prev) => Math.max(prev - 1, 0));
    }
  };

  // Native Touch, Trackpad 2-finger wheel & Keyboard Arrows navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastSwipeTime = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (showDetailOverlay || isTicketModalOpen || showEventModal || showHiddenMenu || showUserMenu) return;
      if (e.touches.length > 0) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (showDetailOverlay || isTicketModalOpen || showEventModal || showHiddenMenu || showUserMenu) return;
      if (touchStartX.current === null || touchStartY.current === null) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      const now = Date.now();
      if (now - lastSwipeTime.current < 750) {
        touchStartX.current = null;
        touchStartY.current = null;
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchEndX - touchStartX.current;
      const diffY = touchEndY - touchStartY.current;

      // Ensure horizontal swipe is dominant and above 35px threshold
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX < -35) {
          setActiveStoryScreen((prev) => Math.min(prev + 1, storyScreens.length - 1));
          lastSwipeTime.current = now;
        } else if (diffX > 35) {
          setActiveStoryScreen((prev) => Math.max(prev - 1, 0));
          lastSwipeTime.current = now;
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      if (showDetailOverlay || isTicketModalOpen || showEventModal || showHiddenMenu || showUserMenu) return;

      const now = Date.now();
      if (now - lastSwipeTime.current < 750) return;

      // Trackpad 2-finger horizontal scroll detection (deltaX)
      if (Math.abs(e.deltaX) > 20 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.5) {
        if (e.deltaX > 20) {
          setActiveStoryScreen((prev) => Math.min(prev + 1, storyScreens.length - 1));
          lastSwipeTime.current = now;
        } else if (e.deltaX < -20) {
          setActiveStoryScreen((prev) => Math.max(prev - 1, 0));
          lastSwipeTime.current = now;
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toUpperCase();
      if (["INPUT", "TEXTAREA"].includes(activeTag)) return;
      if (showDetailOverlay || isTicketModalOpen || showEventModal || showHiddenMenu || showUserMenu) return;

      const now = Date.now();
      if (now - lastSwipeTime.current < 400) return;

      if (e.key === "ArrowRight") {
        setActiveStoryScreen((prev) => Math.min(prev + 1, storyScreens.length - 1));
        lastSwipeTime.current = now;
      } else if (e.key === "ArrowLeft") {
        setActiveStoryScreen((prev) => Math.max(prev - 1, 0));
        lastSwipeTime.current = now;
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [storyScreens.length, showDetailOverlay, isTicketModalOpen, showEventModal, showHiddenMenu, showUserMenu]);

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

    return matchesSearch && matchesCity && matchesDay && matchesOrg;
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
          // Merge API events with fallbackEvents so all 14+ events are always present
          const mergedMap = new Map();
          fallbackEvents.forEach((e) => mergedMap.set(e.id, e));
          data.events.forEach((e: any) => mergedMap.set(e.id, { ...mergedMap.get(e.id), ...e }));
          const allEvts = Array.from(mergedMap.values()) as Event[];
          setEvents(allEvts);

          const params = new URLSearchParams(window.location.search);
          const eventParam = params.get("event");
          if (eventParam) {
            const foundIdx = allEvts.findIndex(
              (e: any) => e.id === eventParam || e.slug === eventParam
            );
            if (foundIdx !== -1) {
              setSelectedCarouselEvent(allEvts[foundIdx]);
              setActiveIndex(foundIdx);
              return;
            }
          }

          setSelectedCarouselEvent(allEvts[0]);
        }
      })
      .catch(() => { });
  }, []);

  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Continuous 60fps butter-smooth linear marquee drift to the right
  useEffect(() => {
    let animId: number;
    const el = homeCarouselRef.current;
    if (!el || events.length === 0) return;

    const speed = 0.2; // Super slow, elegant continuous drift speed

    const step = () => {
      if (el && !isCarouselHovered) {
        el.scrollLeft += speed;
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isCarouselHovered, events]);

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
      className="relative min-h-screen overflow-x-clip bg-black text-white"
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

      {/* ─── APPLE ARCADE FULL-BLEED TRANSPARENT TOP HEADER WITH STORIES LINES OVERLAY ─── */}
      <header className="absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/90 via-black/30 to-transparent px-4 sm:px-8 pt-3 pb-6 transition-all duration-300 pointer-events-none">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 pointer-events-auto">
          {/* 1. TOP STORY SEGMENT LINES (Superimposed over top of hero photo) */}
          <div className="w-full max-w-xl mx-auto">
            <StoryLinesHeader
              screens={storyScreens}
              activeScreen={activeStoryScreen}
              onSelectScreen={(idx) => setActiveStoryScreen(idx)}
            />
          </div>

          {/* 2. DYNAMIC HEADER TITLE & ACCOUNT BADGE */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Dynamic Screen Title (Sube tu evento | Home | Eventos | Fiestas & Clubs) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveStoryScreen(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 cursor-pointer group focus:outline-none"
              >
                <AnimatePresence mode="wait">
                  <motion.h1
                    key={`header-title-${activeStoryScreen}`}
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans drop-shadow-md group-hover:text-purple-300 transition-colors whitespace-nowrap"
                  >
                    {storyScreens[activeStoryScreen]?.label || "Home"}
                  </motion.h1>
                </AnimatePresence>
              </button>
            </div>

            {/* Right: Avatar & Search Stacked Glass Buttons */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 shadow-lg cursor-pointer transition-all active:scale-95"
                aria-label="Perfil de usuario"
              >
                <User className="w-5 h-5 text-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStoryScreen(2);
                  const searchInput = document.getElementById("catalog-search-input");
                  if (searchInput) searchInput.focus();
                }}
                className="w-10 h-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 shadow-lg cursor-pointer transition-all active:scale-95"
                aria-label="Buscar eventos"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN HOME CONTENT (FULL BLEED HERO photo STARTING AT TOP:0) ─── */}
      <div className="pb-28 min-h-screen bg-black text-white pt-0">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeStoryScreen === 0 && (
              <motion.div
                key="screen-0-create-event"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full min-h-[100dvh] pt-32 sm:pt-36 pb-16 px-4 sm:px-8 max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 select-none"
              >
                {/* ─── LEFT COLUMN: TYPOGRAPHY & SUBIR EVENTO BUTTON (DICE STYLE) ─── */}
                <div className="w-full md:w-1/2 flex flex-col items-start space-y-6 z-20">
                  <span className="px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest text-emerald-400 backdrop-blur-md shadow-md">
                    NOW 4GO PLATFORM
                  </span>
                  
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white font-sans leading-[0.95] drop-shadow-2xl">
                    WELCOME<br />
                    TO THE<br />
                    ALTERNATIVE
                  </h1>

                  <p className="text-sm sm:text-base text-zinc-300 font-medium max-w-md leading-relaxed">
                    Incredible live shows. Upfront pricing. Relevant recommendations. 4GO makes going out easy.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowEventModal(true)}
                      className="px-8 py-4 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center gap-3"
                    >
                      <PlusCircle className="w-4 h-4 text-purple-600" />
                      <span>SUBIR EVENTO</span>
                    </button>
                  </div>
                </div>

                {/* ─── RIGHT COLUMN: IPHONE 15 MOCKUP WITH EVENT PREVIEW ─── */}
                <div className="w-full md:w-1/2 flex items-center justify-center z-20">
                  <div className="relative w-full max-w-[400px] aspect-[9/16] bg-[#121212] rounded-[44px] p-4 border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
                    {/* iPhone Outer Frame Border */}
                    <div className="relative w-full h-full rounded-[36px] bg-black border-[4px] border-zinc-800 overflow-hidden shadow-inner flex flex-col justify-between p-3">
                      {/* Dynamic Island Notch */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black border border-zinc-800 z-40 flex items-center justify-end px-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-900/60 border border-blue-500/40" />
                      </div>

                      {/* Screen Content */}
                      <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-zinc-950 flex flex-col justify-between pt-10 pb-4 px-3">
                        <Image
                          src="/images/event_kaskade.png"
                          alt="Boiler Room / Event Preview"
                          fill
                          className="object-cover brightness-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* Top Event Info */}
                        <div className="relative z-10 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Sat 21st Sept / 4pm-12am
                          </span>
                          <h3 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                            Boiler Room: LA | Saturday
                          </h3>
                          <p className="text-[10px] font-medium text-zinc-300">
                            El Pueblo De Los Angeles Historical Monument
                          </p>
                        </div>

                        {/* Ticket Modal inside Phone Screen */}
                        <div className="relative z-10 p-4 rounded-2xl bg-white text-black shadow-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-black uppercase tracking-tight text-zinc-900">
                                General Admission
                              </div>
                              <div className="text-[10px] font-medium text-zinc-500">
                                1 ticket
                              </div>
                            </div>
                            <span className="text-xs font-black text-purple-600">$79.99</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowEventModal(true)}
                            className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider transition shadow-md cursor-pointer text-center"
                          >
                            PURCHASE TICKETS
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStoryScreen === 1 && (
              <motion.div
                key="screen-1-home"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* ─── 1. FULL-BLEED HERO SHOWCASE ─── */}
                <section className="relative w-full overflow-hidden">
                  {(() => {
                    const heroSlides = [
                      {
                        id: "4go-chef-intro",
                        poster: "/images/4go_dj_green_alien_hero.png",
                        title: "4go",
                        line1: "Los mejores shots y la previa... ¿estás listo?",
                        line2: "Explora y vive la fiesta con 4go",
                        event: events[0] || fallbackEvents[0],
                      },
                      ...events.map((e) => ({
                        id: e.id,
                        poster: e.poster || "/images/now4go-hero-presentation-hd-v3.png",
                        title: e.title,
                        line1: e.subtitle || e.venue,
                        line2: e.description || "Entradas oficiales disponibles",
                        event: e,
                      })),
                    ];

                    const currentSlide = heroSlides[heroIndex % heroSlides.length];

                    return (
                      <div className="relative w-full flex flex-col items-center">
                        <div
                          className="relative w-screen left-1/2 -translate-x-1/2 h-[420px] sm:h-auto sm:aspect-[2.4/1] overflow-hidden bg-black"
                        >
                          {/* Blurred backdrop for desktop side fill */}
                          <Image
                            src={currentSlide.poster}
                            alt=""
                            fill
                            priority
                            quality={100}
                            sizes="100vw"
                            aria-hidden="true"
                            className="hidden sm:block object-cover object-center scale-110 blur-2xl brightness-[0.4] saturate-150"
                          />
                          
                          {/* ─── HD ULTRA-CRISP RESPONSIVE PICTURE ELEMENT ─── */}
                          <picture className="absolute inset-0 z-10 flex items-center justify-center w-full h-full">
                            {/* 1. Prioritize Modern WebP format with 1x & 2x Retina resolution density */}
                            <source
                              type="image/webp"
                              srcSet="/images/4go_dj_green_alien_hero_1x.webp 1x, /images/4go_dj_green_alien_hero_2k.webp 2x"
                            />
                            {/* 2. Fallback PNG 2K high-res asset */}
                            <img
                              src="/images/4go_dj_green_alien_hero_2k.png"
                              alt={currentSlide.title}
                              loading="eager"
                              decoding="async"
                              className="w-full h-full object-cover object-center sm:object-contain brightness-105"
                              style={{
                                maxWidth: "100%",
                                height: "100%",
                                imageRendering: "-webkit-optimize-contrast",
                              }}
                            />
                          </picture>
                          {/* Seamless gradient overlay fading smoothly down into solid pure black */}
                          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent via-black/60 via-black/90 to-black z-10 pointer-events-none" />
                          <div className="absolute bottom-6 inset-x-0 p-6 flex flex-col items-center text-center z-10 max-w-xl mx-auto">
                            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-2xl">
                              {currentSlide.title}
                            </h2>
                            <div className="mt-1.5 flex flex-col items-center text-center space-y-0.5">
                              <p className="text-xs sm:text-sm font-bold text-zinc-100 drop-shadow line-clamp-1">
                                {currentSlide.line1}
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-zinc-300 drop-shadow line-clamp-1">
                                {currentSlide.line2}
                              </p>
                            </div>
                            <div className="mt-5 flex items-center gap-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowEventModal(true);
                                }}
                                className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest backdrop-blur-xl border border-purple-400/40 shadow-[0_10px_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                              >
                                <PlusCircle className="w-4 h-4" />
                                CREAR EVENTO
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveStoryScreen(2);
                                }}
                                className="px-8 py-3.5 rounded-full bg-white/20 hover:bg-white/35 text-white font-black text-xs uppercase tracking-widest backdrop-blur-xl border border-white/40 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                CARTELERA
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* ─── HORIZONTAL EVENT CAROUSEL ("Trending on 4GO" EXACT MATCHING SCREENSHOT) ─── */}
                <section className="px-4 sm:px-8 max-w-[1400px] mx-auto space-y-4 -mt-4 sm:-mt-8 relative z-20 pb-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="max-w-2xl">
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans drop-shadow-md">
                        Trending on 4GO
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1 leading-relaxed">
                        Check out some of the most popular events coming up in your city, from club nights and gigs to artist signings and comedy shows.
                      </p>
                    </div>
                    
                    {/* BROWSE EVENTS Pill Button & Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveStoryScreen(2)}
                        className="px-5 py-2.5 rounded-full bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                      >
                        BROWSE EVENTS
                      </button>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scrollHomeCarousel("left")}
                          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer"
                          aria-label="Anterior"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollHomeCarousel("right")}
                          className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition cursor-pointer"
                          aria-label="Siguiente"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Row (Butter-smooth continuous 60fps linear marquee drift) */}
                  <div
                    ref={homeCarouselRef}
                    onMouseEnter={() => setIsCarouselHovered(true)}
                    onMouseLeave={() => setIsCarouselHovered(false)}
                    className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 select-none"
                  >
                    {[...events, ...events].map((evt, idx) => (
                      <div
                        key={`carousel-card-${evt.id}-${idx}`}
                        onClick={() => {
                          setSelectedCarouselEvent(evt);
                          setShowDetailOverlay(true);
                        }}
                        className="w-44 sm:w-52 shrink-0 flex flex-col space-y-2 cursor-pointer group"
                      >
                        {/* Square Artwork Container with Rounded Corners */}
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-white/10 group-hover:border-purple-500/60 transition-all duration-300">
                          <Image
                            src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                            alt={evt.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-105"
                            sizes="220px"
                          />
                          {/* Gradient Overlay for text contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                          {/* Text Superimposed at Card Bottom Left (Matching Screenshot 1) */}
                          <div className="absolute bottom-2.5 left-2.5 right-16 z-10 flex flex-col justify-end">
                            <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-tight leading-tight line-clamp-1 drop-shadow-md">
                              {evt.title}
                            </h4>
                            <span className="text-[10px] font-bold text-zinc-300 drop-shadow line-clamp-1">
                              {evt.subtitle || evt.dateLabel}
                            </span>
                          </div>

                          {/* Action Overlay Buttons (Play & Heart) in Bottom Right */}
                          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCarouselEvent(evt);
                                setShowDetailOverlay(true);
                              }}
                              className="w-7 h-7 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
                              aria-label="Ver preview"
                            >
                              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="w-7 h-7 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
                              aria-label="Guardar favorito"
                            >
                              <Heart className="w-3 h-3 text-white hover:text-red-400 transition-colors" />
                            </button>
                          </div>
                        </div>

                        {/* Event Details Text Below Artwork (Matching DICE style layout) */}
                        <div className="flex flex-col space-y-0.5 px-0.5 pt-1">
                          <h4 className="text-sm font-extrabold text-white tracking-tight leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
                            {evt.title}
                          </h4>
                          <span className="text-xs font-bold text-zinc-100">
                            {evt.dateLabel || "sáb, 26 sept"}
                          </span>
                          <span className="text-xs font-semibold text-zinc-300 truncate">
                            {evt.venue || "Factory Town"}
                          </span>
                          <span className="text-xs font-black text-white pt-0.5">
                            {evt.price === 0 ? "Desde Gratis" : `Desde ${evt.price || "52,74"} $`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeStoryScreen === 2 && (
              <motion.div
                key="screen-2-cartelera"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="px-4 sm:px-8 max-w-[1400px] mx-auto pt-32 sm:pt-36 space-y-8"
              >
                {/* ─── 2. EVENTOS EN GRID DE 2 COLUMNAS EN PC Y 1 COLUMNA EN MÓVIL ─── */}
                <div className="space-y-6 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight font-sans drop-shadow-md">
                        Cartelera de Eventos
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-1">
                        Próximas fechas y conciertos en vivo
                      </p>
                    </div>

                    {/* Day Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 max-w-full">
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
                            key={`filter-day-${day.id}`}
                            type="button"
                            onClick={() => setSelectedDay(day.id)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
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

                  {/* GRID OF 1 COLUMN ON MOBILE & 2 COLUMNS ON PC (EXACT USER DIRECTIVE) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filteredCatalogEvents.map((evt) => (
                      <div
                        key={`cat-2col-${evt.id}`}
                        onClick={() => {
                          setSelectedCarouselEvent(evt);
                          setShowDetailOverlay(true);
                        }}
                        className="group relative flex flex-col space-y-2 cursor-pointer"
                      >
                        {/* Artwork Box */}
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/10 group-hover:border-purple-500/60 transition-all duration-300">
                          <Image
                            src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                            alt={evt.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500 brightness-105"
                            sizes="400px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                          {/* Top Left HD Badge */}
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-white text-[9px] font-black uppercase tracking-wider">
                            HD
                          </span>

                          {/* Top Right Price Tag */}
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-purple-600/90 text-white text-[10px] font-black shadow-lg backdrop-blur-md">
                            {evt.price === 0 ? "Gratis" : `$${evt.price} USD`}
                          </span>

                          {/* Action Overlay Button (Play) */}
                          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
                            <div className="w-8 h-8 rounded-full bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
                              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Event Details Text Below Artwork (Clean & Fully Visible) */}
                        <div className="flex flex-col space-y-0.5 px-0.5">
                          <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight line-clamp-1 group-hover:text-purple-300 transition-colors">
                            {evt.title}
                          </h4>
                          <span className="text-xs font-bold text-zinc-200">
                            {evt.dateLabel || "sáb, 26 sept"}
                          </span>
                          <span className="text-xs font-medium text-zinc-400 truncate">
                            {evt.venue || "Factory Town"}
                          </span>
                          <span className="text-xs font-black text-white pt-0.5">
                            {evt.price === 0 ? "Desde Gratis" : `Desde ${evt.price || "52,74"} $`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
      <AnimatePresence>
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
      </AnimatePresence>

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

      {/* Publish Event Creator Modal */}
      <PublishEventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
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
                  <div className="h-10 w-10 rounded-full bg-black border-2 border-emerald-400 text-white font-black flex items-center justify-center p-1 shadow-md">
                    <AlienIcon className="w-full h-full" />
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

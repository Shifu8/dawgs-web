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
  ChevronDown,
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
  Volume2,
  VolumeX,
  Mic,
  Building2,
  UserCheck,
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
import Footer from "@/components/Footer";
import OrganizerProfileOverlay, { ORGANIZER_DATA } from "@/frontend/features/organizer/OrganizerProfileOverlay";
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
  { id: "merch", label: "Merch" },
  { id: "access", label: "Passes" },
];

export interface SearchProfile {
  id: string;
  name: string;
  type: "Organizador" | "Discoteca / Club Nocturno";
  avatar?: string;
}

export const SEARCH_PROFILES: SearchProfile[] = Object.values(ORGANIZER_DATA).map((item) => ({
  id: item.id,
  name: item.name,
  type: item.type,
  avatar: item.logo,
}));

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
  const [merchSlideIndex, setMerchSlideIndex] = useState(0);

  const MERCH_SHOWCASE_IMAGES = [
    { src: "/images/nenez-studio-fit-front.png", title: "4GO Streetwear Collection 2026" },
    { src: "/images/nenez-studio-portrait.png", title: "4GO Limited Edition Drops" },
    { src: "/images/nenez-studio-couch.png", title: "4GO Official Nightwear" },
    { src: "/images/model_one.png", title: "4GO Apparel & Accessories" },
    { src: "/images/ariana_merch.png", title: "4GO Merch - NENEZ Wear" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMerchSlideIndex((prev) => (prev + 1) % MERCH_SHOWCASE_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [MERCH_SHOWCASE_IMAGES.length]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isDrinksPosModalOpen, setIsDrinksPosModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<{ id: string; name: string; email: string; type?: string; venueName?: string; city?: string } | null>(null);
  const [organizerSubView, setOrganizerSubView] = useState<'menu' | 'profile' | 'create_event' | 'my_events' | 'favorites'>('menu');

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Fiesta');
  const [newEventPrice, setNewEventPrice] = useState('15');
  const [newEventCity, setNewEventCity] = useState('Quito');

  const [orgType, setOrgType] = useState('Discoteca / Club');
  const [orgName, setOrgName] = useState('');
  const [orgCity, setOrgCity] = useState('Quito');

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("organizer_token");
      const profile = localStorage.getItem("organizer_profile");
      if (token) {
        setUserLoggedIn(true);
        if (profile) {
          try { setUserProfile(JSON.parse(profile)); } catch {}
        }
      }

      // Check if user just redirected back from Google / Apple OAuth with an auth code
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        const mockProfile = {
          id: `oauth-${Date.now()}`,
          name: "Brandon Medina",
          email: "brandon.medina@unl.edu.ec",
          type: "Discoteca / Club",
          venueName: "Cubic Club",
          city: "Quito",
        };
        localStorage.setItem("organizer_token", `oauth-code-${code.substring(0, 10)}`);
        localStorage.setItem("organizer_profile", JSON.stringify(mockProfile));
        setUserLoggedIn(true);
        setUserProfile(mockProfile);
        setOrganizerSubView("menu");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const [isAppleAuthModalOpen, setIsAppleAuthModalOpen] = useState(false);
  const [appleInputEmail, setAppleInputEmail] = useState('brandon.medina@icloud.com');
  const [appleInputName, setAppleInputName] = useState('Brandon Medina');

  const handleConfirmAppleLogin = () => {
    if (!appleInputEmail.trim()) return;
    const mockProfile = {
      id: `apple-${Date.now()}`,
      name: appleInputName.trim() || "Usuario Apple",
      email: appleInputEmail.trim(),
      type: "Discoteca / Club",
      venueName: appleInputName.trim() || "Cubic Club",
      city: "Quito",
    };
    localStorage.setItem("organizer_token", `apple-token-${Date.now()}`);
    localStorage.setItem("organizer_profile", JSON.stringify(mockProfile));
    setUserLoggedIn(true);
    setUserProfile(mockProfile);
    setOrganizerSubView("menu");
    setIsAppleAuthModalOpen(false);
  };

  const handleQuickSocialLogin = (provider: 'google' | 'apple') => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

    const width = 520;
    const height = 650;
    const left = typeof window !== 'undefined' ? window.screen.width / 2 - width / 2 : 100;
    const top = typeof window !== 'undefined' ? window.screen.height / 2 - height / 2 : 100;

    if (provider === 'google') {
      const clientId = googleClientId || '339658076678-5e514em3csugm3um34899jlg1atg8ep4.apps.googleusercontent.com';
      const redirectUri = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&prompt=select_account`;

      // Open real Google OAuth browser popup window
      if (typeof window !== 'undefined') {
        const popup = window.open(
          googleOAuthUrl,
          'GoogleOAuthWindow',
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
        );

        // Monitor popup window closure or redirect
        const checkPopupTimer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopupTimer);
          } else {
            try {
              if (popup.location.href.includes(window.location.origin)) {
                const popupParams = new URLSearchParams(popup.location.search);
                const code = popupParams.get("code");
                if (code) {
                  const mockProfile = {
                    id: `google-${Date.now()}`,
                    name: "Brandon Medina",
                    email: "brandon.medina@unl.edu.ec",
                    type: "Discoteca / Club",
                    venueName: "Cubic Club",
                    city: "Quito",
                  };
                  localStorage.setItem("organizer_token", `google-code-${code.substring(0, 8)}`);
                  localStorage.setItem("organizer_profile", JSON.stringify(mockProfile));
                  setUserLoggedIn(true);
                  setUserProfile(mockProfile);
                  setOrganizerSubView("menu");
                  popup.close();
                  clearInterval(checkPopupTimer);
                }
              }
            } catch {
              // Cross-origin before redirect - ignore until redirected back
            }
          }
        }, 500);
      }

    } else {
      if (appleClientId && appleClientId.trim() !== '' && appleClientId !== 'com.4go.web.login') {
        const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}` : 'http://localhost:3000';
        const appleOAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(appleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&response_mode=form_post&scope=name%20email`;

        if (typeof window !== 'undefined') {
          window.open(
            appleOAuthUrl,
            'AppleOAuthWindow',
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
          );
        }
      } else {
        // Show clean Apple ID Sign In modal dialog
        setIsAppleAuthModalOpen(true);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("organizer_token");
    localStorage.removeItem("organizer_profile");
    setUserLoggedIn(false);
    setUserProfile(null);
    setOrganizerSubView('menu');
  };

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
  const [isLeftVideoMuted, setIsLeftVideoMuted] = useState(true);
  const leftVideoRef = useRef<HTMLVideoElement>(null);

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
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const headerSearchInputRef = useRef<HTMLInputElement>(null);
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [selectedDay, setSelectedDay] = useState("todos");
  const [selectedOrganizer, setSelectedOrganizer] = useState("todos");
  const [showOrganizerOverlay, setShowOrganizerOverlay] = useState(false);
  const [selectedOrganizerSlug, setSelectedOrganizerSlug] = useState("cubic");
  const [mobileDockTab, setMobileDockTab] = useState("inicio");
  const [heroIndex, setHeroIndex] = useState(0);
  const homeCarouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [likedEvents, setLikedEvents] = useState<Record<string, boolean>>({});
  const [followedProfiles, setFollowedProfiles] = useState<Record<string, boolean>>({});

  // Smooth 60fps continuous slow auto-scroll to the right (no jumps, lentito)
  useEffect(() => {
    if (activeStoryScreen !== 1) return;

    let animationFrameId: number;
    const speed = 0.5; // Ultra-smooth, slow drift rate to the right

    const step = () => {
      if (homeCarouselRef.current && !isCarouselHovered) {
        const container = homeCarouselRef.current;
        container.scrollLeft += speed;

        // Seamless infinite loop wrap check
        const maxLoopPoint = (container.scrollWidth * 2) / 4;
        if (container.scrollLeft >= maxLoopPoint) {
          container.scrollLeft -= maxLoopPoint;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [activeStoryScreen, isCarouselHovered]);

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
    all: "rgba(139,92,246,0.55)",
    fiestas: "rgba(225,0,117,0.55)",
    conciertos: "rgba(194,217,2,0.45)",
    publish: "rgba(139,92,246,0.65)",
  };
  const TAB_LABEL: Record<string, string> = {
    all: "Todo",
    fiestas: "Fiestas",
    conciertos: "Conciertos",
    publish: "Sube tu Evento",
  };
  const TAB_SUB: Record<string, string> = {
    all: "Toda la cartelera disponible",
    fiestas: "Trap · Urban · RnB · Nocturno",
    conciertos: "Latin · Live · Concerts",
    publish: "Publica y gestiona tus eventos en Ecuador",
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
      <header className={`absolute inset-x-0 top-0 ${isHeaderSearchOpen ? "z-[300]" : "z-50"} bg-gradient-to-b from-black/90 via-black/30 to-transparent px-4 sm:px-8 pt-3 pb-6 transition-all duration-300 pointer-events-none`}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3 pointer-events-auto">
          {/* 1. TOP STORY SEGMENT LINES (Hidden cleanly when search is open) */}
          <AnimatePresence>
            {!isHeaderSearchOpen && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xl mx-auto"
              >
                <StoryLinesHeader
                  screens={storyScreens}
                  activeScreen={activeStoryScreen}
                  onSelectScreen={(idx) => setActiveStoryScreen(idx)}
                />
              </motion.div>
            )}
          </AnimatePresence>

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

            {/* Right: Avatar & Clean Search Button (Stacked Vertically) */}
            <div className="relative flex flex-col items-center gap-2 shrink-0 z-[300]">
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
                  setIsHeaderSearchOpen((prev) => !prev);
                  if (!isHeaderSearchOpen) {
                    setTimeout(() => headerSearchInputRef.current?.focus(), 100);
                  }
                }}
                className={`w-10 h-10 rounded-full border backdrop-blur-xl flex items-center justify-center shadow-lg cursor-pointer transition-all active:scale-95 ${isHeaderSearchOpen
                    ? "bg-white border-white text-zinc-900 shadow-xl scale-105"
                    : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                  }`}
                aria-label="Buscar eventos o perfiles"
              >
                <Search className={`w-5 h-5 ${isHeaderSearchOpen ? "text-zinc-900" : "text-white"}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── CLEAN SEARCH MODAL OVERLAY MATCHING DESIGN SCREENSHOT ─── */}
      <AnimatePresence>
        {isHeaderSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsHeaderSearchOpen(false);
                setHeaderSearchQuery("");
              }}
              className="fixed inset-0 z-[310] bg-black/60 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="fixed top-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[540px] z-[320] pointer-events-auto"
            >
              {/* 1. White Pill Search Bar Input */}
              <div className="relative flex items-center h-12 px-4 rounded-full bg-white border border-zinc-200 shadow-2xl text-zinc-900 w-full">
                <Search className="w-5 h-5 text-zinc-500 shrink-0 mr-3" />
                <input
                  ref={headerSearchInputRef}
                  type="text"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  placeholder="Buscar eventos, discotecas..."
                  className="w-full bg-transparent text-zinc-900 placeholder-zinc-400 text-sm font-semibold focus:outline-none"
                  autoFocus
                />
                {headerSearchQuery ? (
                  <button
                    type="button"
                    onClick={() => setHeaderSearchQuery("")}
                    className="p-1 text-zinc-400 hover:text-zinc-800 shrink-0 ml-1 cursor-pointer rounded-full hover:bg-zinc-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsHeaderSearchOpen(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 shrink-0 ml-1 cursor-pointer rounded-full hover:bg-zinc-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 2. White Card Results Dropdown Box */}
              <div className="mt-2.5 w-full rounded-2xl bg-white border border-zinc-200 shadow-2xl p-4 text-zinc-900 max-h-[68vh] overflow-y-auto no-scrollbar space-y-2">
                {(() => {
                  const query = headerSearchQuery.toLowerCase().trim();

                  if (query === "") {
                    return (
                      <div className="py-7 px-4 text-center flex flex-col items-center justify-center space-y-2 select-none">
                        <Search className="w-7 h-7 text-zinc-300 stroke-[1.75]" />
                        <p className="text-xs font-semibold text-zinc-400 max-w-xs leading-relaxed">
                          Escribe para buscar eventos, discotecas u organizadores...
                        </p>
                      </div>
                    );
                  }

                  const matchingProfiles = SEARCH_PROFILES.filter(
                    (p) => p.name.toLowerCase().includes(query) || p.type.toLowerCase().includes(query)
                  );
                  const matchingEvents = events.filter((e) => {
                    const titleMatch = (e.title || "").toLowerCase().includes(query);
                    const orgMatch =
                      (e.organizer || "").toLowerCase().includes(query) ||
                      (e.organizers || []).some((o) => o.toLowerCase().includes(query));
                    const venueMatch =
                      (e.venue || "").toLowerCase().includes(query) || (e.city || "").toLowerCase().includes(query);
                    const subMatch = (e.subtitle || "").toLowerCase().includes(query);
                    const dateMatch = (e.dateLabel || "").toLowerCase().includes(query);
                    return titleMatch || orgMatch || venueMatch || subMatch || dateMatch;
                  });

                  if (matchingProfiles.length === 0 && matchingEvents.length === 0) {
                    return (
                      <div className="p-6 text-center text-xs font-semibold text-zinc-500">
                        No se encontraron resultados para &quot;<span className="text-zinc-900 font-bold">{headerSearchQuery}</span>&quot;
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight px-1 mb-2">
                        Resultados de la búsqueda
                      </h3>
                      {/* Profiles List */}
                      {matchingProfiles.map((prof) => (
                        <div
                          key={`search-prof-${prof.id}`}
                          onClick={() => {
                            setSelectedOrganizerSlug(prof.id);
                            setShowOrganizerOverlay(true);
                            setIsHeaderSearchOpen(false);
                          }}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-100/80 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-white shrink-0 overflow-hidden relative border border-zinc-200/80">
                              {prof.avatar ? (
                                <Image src={prof.avatar} alt={prof.name} fill className="object-cover" />
                              ) : (
                                <Building2 className="w-5 h-5 text-zinc-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <h4 className="text-sm font-extrabold text-zinc-900 leading-tight truncate group-hover:text-black">
                                {prof.name}
                              </h4>
                              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                                {prof.type}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFollowedProfiles((prev) => ({
                                ...prev,
                                [prof.id]: !prev[prof.id],
                              }));
                            }}
                            className={`px-5 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all border shrink-0 cursor-pointer active:scale-95 ${followedProfiles[prof.id]
                                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200/80"
                              }`}
                          >
                            {followedProfiles[prof.id] ? "SIGUIENDO" : "SEGUIR"}
                          </button>
                        </div>
                      ))}

                      {/* Events List */}
                      {matchingEvents.map((evt) => (
                        <div
                          key={`search-evt-${evt.id}`}
                          onClick={() => {
                            setSelectedCarouselEvent(evt);
                            setShowDetailOverlay(true);
                            setIsHeaderSearchOpen(false);
                            setHeaderSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100/80 transition-colors cursor-pointer group"
                        >
                          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80">
                            <Image
                              src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                              alt={evt.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-sm font-extrabold text-zinc-900 truncate group-hover:text-black leading-snug">
                              {evt.title}
                            </h4>
                            <p className="text-xs font-medium text-zinc-500 truncate mt-0.5">
                              {evt.dateLabel || "jue, 17 sept"}
                            </p>
                            <p className="text-xs font-medium text-zinc-400 truncate">
                              {evt.venue || "Factory Town"}, {evt.city || "Miami"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN HOME CONTENT (FULL BLEED HERO photo STARTING AT TOP:0) ─── */}
      <div className="pb-0 min-h-screen bg-black text-white pt-0">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeStoryScreen === 0 && (
              <motion.div
                key="screen-0-create-event"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full flex flex-col select-none -mt-20 sm:-mt-24 -mb-16 lg:-mb-24"
              >
                {/* ─── TOP HERO ROW (30% LEFT VIDEO / 70% RIGHT AUTH FORM WITH VIDEO) ─── */}
                <div className="w-full min-h-[100dvh] flex flex-col lg:flex-row items-stretch">
                  {/* 1. LEFT COLUMN (30% WIDTH): BACKGROUND VIDEO FROM DOWNLOADS WITH AUDIO */}
                  <div className="relative w-full lg:w-[30%] min-h-[500px] lg:min-h-[calc(100vh+6rem)] self-stretch bg-zinc-950 overflow-hidden flex-shrink-0">
                    <video
                      ref={leftVideoRef}
                      autoPlay
                      loop
                      muted={isLeftVideoMuted}
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover brightness-105"
                    >
                      <source src="/videos/subir_evento_left_video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-90" />

                    {/* Bottom Footer: Left Copyright & Right Mute/Unmute Slider Switch */}
                    <div className="absolute bottom-6 left-5 right-5 z-10 flex items-center justify-between gap-2 pointer-events-auto">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-white/70 tracking-tight drop-shadow-md">
                        © 4GO 2026, all rights reserved
                      </span>

                      {/* Mute/Unmute Audio Pill Slider */}
                      <button
                        type="button"
                        onClick={() => {
                          if (leftVideoRef.current) {
                            leftVideoRef.current.muted = !isLeftVideoMuted;
                            setIsLeftVideoMuted(!isLeftVideoMuted);
                          }
                        }}
                        className="px-2.5 py-1 rounded-full bg-zinc-900/90 border border-white/20 text-white flex items-center gap-1.5 hover:bg-black transition active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
                        title={isLeftVideoMuted ? "Activar sonido" : "Silenciar"}
                      >
                        {isLeftVideoMuted ? (
                          <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                        )}
                        <div className="w-6 h-1 rounded-full bg-white/30 relative overflow-hidden">
                          <div className={`h-full bg-yellow-400 transition-all duration-300 ${isLeftVideoMuted ? 'w-0' : 'w-full'}`} />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. RIGHT COLUMN (70% WIDTH): CENTERED AUTH FORM WITH BACKGROUND VIDEO */}
                  <div className="relative w-full lg:w-[70%] min-h-screen px-6 sm:px-12 py-16 sm:py-20 flex flex-col items-center justify-center bg-black text-black font-sans overflow-hidden">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      onPlay={(e) => {
                        e.currentTarget.playbackRate = 0.5;
                      }}
                      onLoadedMetadata={(e) => {
                        e.currentTarget.playbackRate = 0.5;
                      }}
                      className="absolute inset-0 w-full h-full object-cover brightness-95 blur-2xl scale-110"
                    >
                      <source src="/videos/subir_evento_bg.mp4" type="video/mp4" />
                    </video>

                    {/* Overlay for legibility */}
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-xl" />

                    {/* Centered Glass Auth / Vertical Dashboard Card */}
                    {!userLoggedIn ? (
                      <div className="relative z-10 w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/40 shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black font-sans leading-tight">
                            Sube tu Evento &amp; Administra tu Cuenta 4GO
                          </h1>
                          <p className="text-xs sm:text-sm text-zinc-500 font-medium max-w-md mx-auto leading-relaxed">
                            Inicia sesión en 1 clic con tu cuenta de Google o Apple para comenzar a publicar eventos.
                          </p>
                        </div>

                        {/* Social Logins */}
                        <div className="space-y-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleQuickSocialLogin("google")}
                            className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-zinc-100 text-black font-black text-xs sm:text-sm uppercase tracking-wider border border-zinc-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md"
                          >
                            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>ENTRAR CON GOOGLE</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/40 shadow-2xl space-y-5">
                        {/* Logged in Header Banner */}
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-black text-sm flex items-center justify-center shadow-md uppercase">
                              {userProfile?.name ? userProfile.name.charAt(0) : "U"}
                            </div>
                            <div className="text-left">
                              <h3 className="text-sm font-black text-zinc-900 tracking-tight">{userProfile?.name || "Organizador 4GO"}</h3>
                              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                <span>Sesión Activa</span>
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs font-extrabold text-zinc-400 hover:text-red-600 transition uppercase tracking-wider cursor-pointer"
                          >
                            Cerrar sesión
                          </button>
                        </div>

                        {/* ─── VERTICAL OPTIONS PANEL (SIN MODAL) ─── */}
                        {organizerSubView === "menu" && (
                          <div className="space-y-3 pt-1 text-left">
                            {/* 1. PUBLICAR EVENTO (Sleek Glassmorphism Animated Button) */}
                            <button
                              type="button"
                              onClick={() => setOrganizerSubView("create_event")}
                              className="w-full py-4 px-6 rounded-2xl bg-zinc-950 hover:bg-black text-white font-black text-xs uppercase tracking-widest border border-zinc-700 shadow-xl flex items-center justify-between transition-all hover:scale-[1.01] active:scale-95 cursor-pointer animate-pulse"
                            >
                              <span>PUBLICAR EVENTO</span>
                              <span className="text-xs text-yellow-400 font-bold">→</span>
                            </button>

                            {/* 2. MIS EVENTOS */}
                            <button
                              type="button"
                              onClick={() => setOrganizerSubView("my_events")}
                              className="w-full py-3.5 px-5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between transition active:scale-95 cursor-pointer shadow-sm"
                            >
                              <span>MIS EVENTOS</span>
                              <span className="text-[11px] text-zinc-500 font-bold">({events.length} publicados)</span>
                            </button>

                            {/* 3. MIS FAVORITOS */}
                            <button
                              type="button"
                              onClick={() => setOrganizerSubView("favorites")}
                              className="w-full py-3.5 px-5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between transition active:scale-95 cursor-pointer shadow-sm"
                            >
                              <span>MIS FAVORITOS</span>
                              <span className="text-[11px] text-zinc-500 font-bold">Ver guardados</span>
                            </button>

                            {/* 4. CREAR / EDITAR PERFIL DE ORGANIZADOR */}
                            <button
                              type="button"
                              onClick={() => setOrganizerSubView("profile")}
                              className="w-full py-3.5 px-5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between transition active:scale-95 cursor-pointer shadow-sm"
                            >
                              <span>CONFIGURAR PERFIL (DISCOTECA / FESTIVAL)</span>
                              <span className="text-[11px] text-zinc-500 font-bold">Editar</span>
                            </button>
                          </div>
                        )}

                        {/* ─── INLINE FORM: CONFIGURAR PERFIL (DISCOTECA / FESTIVAL) ─── */}
                        {organizerSubView === "profile" && (
                          <div className="space-y-4 pt-1 text-left">
                            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                              <h4 className="text-sm font-black uppercase text-zinc-900 tracking-tight">Perfil de Organizador</h4>
                              <button
                                type="button"
                                onClick={() => setOrganizerSubView("menu")}
                                className="text-xs font-bold text-zinc-500 hover:text-black uppercase cursor-pointer"
                              >
                                Volver
                              </button>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-black text-zinc-900 block">Tipo de Organizador</label>
                              <select
                                value={orgType}
                                onChange={(e) => setOrgType(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer"
                              >
                                <option value="Discoteca / Club">Discoteca / Club Nocturno</option>
                                <option value="Productora de Festivales">Productora de Festivales</option>
                                <option value="Organizador Independiente">Organizador Independiente</option>
                                <option value="Marca / Sponsor">Marca / Sponsor</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-black text-zinc-900 block">Nombre de Discoteca o Productora</label>
                              <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="Ej. Cubic Club / Sata Music"
                                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-black text-zinc-900 block">Ciudad Principal</label>
                              <select
                                value={orgCity}
                                onChange={(e) => setOrgCity(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer"
                              >
                                <option value="Quito">Quito</option>
                                <option value="Guayaquil">Guayaquil</option>
                                <option value="Cuenca">Cuenca</option>
                                <option value="Salinas">Salinas</option>
                                <option value="Loja">Loja</option>
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = { ...userProfile, type: orgType, venueName: orgName || "Cubic", city: orgCity };
                                setUserProfile(updated as any);
                                localStorage.setItem("organizer_profile", JSON.stringify(updated));
                                setOrganizerSubView("create_event");
                              }}
                              className="w-full py-3.5 rounded-xl bg-black text-white font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-800 transition active:scale-[0.99] cursor-pointer shadow-md text-center mt-2"
                            >
                              Guardar Perfil &amp; Ir a Crear Evento
                            </button>
                          </div>
                        )}

                        {/* ─── INLINE FORM: PUBLICAR EVENTO ─── */}
                        {organizerSubView === "create_event" && (
                          <div className="space-y-4 pt-1 text-left">
                            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                              <h4 className="text-sm font-black uppercase text-zinc-900 tracking-tight">Publicar Nuevo Evento</h4>
                              <button
                                type="button"
                                onClick={() => setOrganizerSubView("menu")}
                                className="text-xs font-bold text-zinc-500 hover:text-black uppercase cursor-pointer"
                              >
                                Volver
                              </button>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-black text-zinc-900 block">Nombre del Evento</label>
                              <input
                                type="text"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                                placeholder="Ej. Cubic Saturday Night / Sata Fest 2026"
                                className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-black text-zinc-900 block">Categoría</label>
                                <select
                                  value={newEventCategory}
                                  onChange={(e) => setNewEventCategory(e.target.value)}
                                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer"
                                >
                                  <option value="Fiesta">Fiesta / Club</option>
                                  <option value="Concierto">Concierto</option>
                                  <option value="Festival">Festival</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-black text-zinc-900 block">Precio Entrada ($)</label>
                                <input
                                  type="number"
                                  value={newEventPrice}
                                  onChange={(e) => setNewEventPrice(e.target.value)}
                                  placeholder="15"
                                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!newEventTitle.trim()) return;
                                const newEvt: Event = {
                                  id: `evt-${Date.now()}`,
                                  title: newEventTitle,
                                  category: newEventCategory,
                                  city: newEventCity,
                                  price: `$${newEventPrice}`,
                                  date: "Este Fin de Semana",
                                  location: userProfile?.venueName || "Cubic Club",
                                  poster: "/images/4go_red_girl_showcase.jpg",
                                  description: `Evento oficial por ${userProfile?.venueName || "4GO Organizer"}. Entradas con acceso instantáneo.`,
                                  lineup: ["DJ Residente", "Artista Invitado"],
                                };
                                setEvents((prev) => [newEvt, ...prev]);
                                setNewEventTitle("");
                                setOrganizerSubView("menu");
                                setActiveStoryScreen(2);
                              }}
                              className="w-full py-3.5 rounded-xl bg-black text-white font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-800 transition active:scale-[0.99] cursor-pointer shadow-md text-center mt-2"
                            >
                              Publicar Evento Ahora
                            </button>
                          </div>
                        )}

                        {/* ─── INLINE VIEW: MIS EVENTOS ─── */}
                        {organizerSubView === "my_events" && (
                          <div className="space-y-3 pt-1 text-left">
                            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                              <h4 className="text-sm font-black uppercase text-zinc-900 tracking-tight">Mis Eventos Publicados</h4>
                              <button
                                type="button"
                                onClick={() => setOrganizerSubView("menu")}
                                className="text-xs font-bold text-zinc-500 hover:text-black uppercase cursor-pointer"
                              >
                                Volver
                              </button>
                            </div>
                            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                              {events.slice(0, 4).map((evt) => (
                                <div key={evt.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-black text-zinc-900">{evt.title}</p>
                                    <p className="text-[10px] text-zinc-500 font-semibold">{evt.location} • {evt.price}</p>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold">ACTIVO</span>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setOrganizerSubView("create_event")}
                              className="w-full py-3 rounded-xl bg-black text-white font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-800 transition active:scale-95 cursor-pointer shadow-md"
                            >
                              + Publicar Otro Evento
                            </button>
                          </div>
                        )}

                        {/* ─── INLINE VIEW: MIS FAVORITOS ─── */}
                        {organizerSubView === "favorites" && (
                          <div className="space-y-3 pt-1 text-left">
                            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                              <h4 className="text-sm font-black uppercase text-zinc-900 tracking-tight">Mis Eventos Favoritos</h4>
                              <button
                                type="button"
                                onClick={() => setOrganizerSubView("menu")}
                                className="text-xs font-bold text-zinc-500 hover:text-black uppercase cursor-pointer"
                              >
                                Volver
                              </button>
                            </div>
                            <p className="text-xs text-zinc-500 font-semibold">Tus eventos guardados aparecerán aquí.</p>
                            <button
                              type="button"
                              onClick={() => setActiveStoryScreen(2)}
                              className="w-full py-3 rounded-xl bg-black text-white font-extrabold text-xs uppercase tracking-wider hover:bg-zinc-800 transition active:scale-95 cursor-pointer shadow-md"
                            >
                              Explorar Cartelera
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  </div>

                {/* ─── LOWER FEATURE SECTION BELOW VIDEO & LOGIN HERO (SCROLLABLE DOWN) ─── */}
                <div id="subir-features-section" className="w-full bg-zinc-950 text-white pt-16 sm:pt-24 pb-28 sm:pb-36 px-6 sm:px-12 border-t border-zinc-800 font-sans">
                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    {/* Left Side: Marketing & Feature Text */}
                    <div className="lg:col-span-7 space-y-6 text-left">
                      <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-white font-sans">
                        Publica tus eventos &amp; Conecta con tu audiencia
                      </h2>
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-medium">
                        Diseñado exclusivamente para productores, creadores y clubes nocturnos. Gestiona preventas en tiempo real, validación QR ultrasónica en puerta y control total de entradas en una sola plataforma.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => router.push("/organizer/register")}
                          className="px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
                        >
                          Crear cuenta de organizador
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveStoryScreen(1)}
                          className="px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white border border-white/25 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer"
                        >
                          Explorar eventos
                        </button>
                      </div>
                    </div>

                    {/* Right Side: The Party Showcase Photo */}
                    <div className="lg:col-span-5 relative w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 group cursor-pointer bg-zinc-950">
                      <Image
                        src="/images/subir_evento_party_showcase.jpg"
                        alt="4GO Party Showcase"
                        fill
                        priority
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 500px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-6 left-6 z-10 text-left">
                        <span className="text-[11px] font-bold text-white tracking-tight drop-shadow-md block">
                          © 4GO 2026, all rights reserved
                        </span>
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
                className="bg-white text-black min-h-screen pt-4 pb-0 font-sans"
              >
                {/* ─── 1. FULL-BLEED HERO SHOWCASE ─── */}
                <section className="relative w-full overflow-hidden">
                  {(() => {
                    const heroSlides = [
                      {
                        id: "4go-chef-intro",
                        poster: "/images/4go_dj_green_alien_hero.png",
                        title: "",
                        line1: "You ready?",
                        line2: "Explora y vive la fiesta con 4GO",
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
                            {currentSlide.title && currentSlide.title.toLowerCase() !== "4go" && (
                              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-2xl">
                                {currentSlide.title}
                              </h2>
                            )}
                            <div className="mt-1.5 flex flex-col items-center text-center space-y-0.5">
                              <p className="text-xs sm:text-sm font-bold text-zinc-100 drop-shadow line-clamp-1">
                                {currentSlide.line1}
                              </p>
                              <p className="text-xs sm:text-sm font-medium text-zinc-300 drop-shadow line-clamp-1">
                                {currentSlide.line2}
                              </p>
                            </div>
                            <div className="mt-5 flex flex-col items-center gap-3">
                              {!userLoggedIn ? (
                                /* GOOGLE SOCIAL LOGIN BUTTON */
                                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                                  {/* Google Login */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickSocialLogin("google");
                                    }}
                                    className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                      <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                      />
                                      <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                      />
                                      <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                      />
                                      <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                      />
                                    </svg>
                                    <span>ENTRAR CON GOOGLE</span>
                                  </button>
                                </div>
                              ) : (
                                /* LOGGED IN: PUBLICAR EVENTO (Sleek Glassmorphism Animated Button) */
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveStoryScreen(0);
                                  }}
                                  className="px-8 py-3.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-white font-black text-xs uppercase tracking-widest hover:bg-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                                >
                                  PUBLICAR EVENTO
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* ─── HORIZONTAL EVENT CAROUSEL ("Trending on 4GO" FULL BLEED EDGE-TO-EDGE) ─── */}
                <section className="w-full bg-white text-black py-8 sm:py-12 relative z-20 overflow-x-hidden">
                  <div className="max-w-[1400px] mx-auto px-4 sm:px-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
                      <div className="max-w-2xl">
                        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans drop-shadow-sm">
                          Tendencias en 4GO
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1 leading-relaxed">
                          Descubre algunos de los eventos más populares en tu ciudad, desde noches de fiesta y conciertos hasta festivales y espectáculos en vivo.
                        </p>
                      </div>

                      {/* VER EVENTOS Pill Button */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveStoryScreen(2)}
                          className="px-6 py-2.5 rounded-full bg-black text-white font-black text-xs uppercase tracking-wider hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                        >
                          DESCUBRE MÁS EVENTOS
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Scroll Row (Edge-to-Edge 100% Full Bleed Screen Width) */}
                  <div
                    onMouseEnter={() => setIsCarouselHovered(true)}
                    onMouseLeave={() => setIsCarouselHovered(false)}
                    onTouchStart={() => setIsCarouselHovered(true)}
                    onTouchEnd={() => setIsCarouselHovered(false)}
                    className="relative w-full overflow-hidden py-2 select-none touch-pan-y"
                  >
                    <style>{`
                      @keyframes marqueeLeftResponsive {
                        0% { transform: translate3d(0%, 0, 0); }
                        100% { transform: translate3d(-50%, 0, 0); }
                      }
                    `}</style>
                    <div
                      className="flex items-center gap-4 sm:gap-5 shrink-0 w-max pl-4 sm:pl-6"
                      style={{
                        animation: "marqueeLeftResponsive 240s linear infinite",
                        animationPlayState: isCarouselHovered ? "paused" : "running",
                        willChange: "transform",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      {[...events, ...events].map((evt, idx) => (
                        <div
                          key={`carousel-card-${evt.id}-${idx}`}
                          onClick={() => {
                            setSelectedCarouselEvent(evt);
                            setShowDetailOverlay(true);
                          }}
                          className="w-36 sm:w-56 md:w-60 lg:w-64 shrink-0 flex flex-col space-y-2 cursor-pointer group"
                        >
                          {/* Square Artwork Container with Play & Heart Overlays */}
                          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-900 shadow-md border border-zinc-200 group-hover:border-zinc-400 transition-colors">
                            <Image
                              src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                              alt={evt.title}
                              fill
                              className="object-cover brightness-105"
                              sizes="(max-width: 640px) 150px, 300px"
                            />
                            {/* Subtle Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                            {/* Play & Heart Overlay Buttons (Matching user screenshot) */}
                            <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCarouselEvent(evt);
                                  setShowDetailOverlay(true);
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
                                aria-label="Ver detalles"
                              >
                                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLikedEvents((prev) => ({
                                    ...prev,
                                    [evt.id]: !prev[evt.id],
                                  }));
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
                                aria-label="Guardar favorito"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 transition-colors ${likedEvents[evt.id]
                                      ? "text-red-500 fill-red-500"
                                      : "text-white hover:text-red-400"
                                    }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* Event Details Text Below Artwork */}
                          <div className="flex flex-col space-y-0.5 px-0.5 pt-1 text-black">
                            <h4 className="text-xs sm:text-sm font-extrabold text-black tracking-tight leading-tight line-clamp-1 group-hover:text-purple-600 transition-colors">
                              {evt.title}
                            </h4>
                            <span className="text-[11px] sm:text-xs font-bold text-zinc-800">
                              {evt.dateLabel || "sáb, 26 sept"}
                            </span>
                            <span className="text-[11px] sm:text-xs font-semibold text-zinc-600 truncate">
                              {evt.venue || "Factory Town"}
                            </span>
                            <span className="text-[11px] sm:text-xs font-black text-black pt-0.5">
                              {evt.price === 0 ? "Desde Gratis" : `Desde ${evt.price || "52,74"} $`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* ─── 3. BLACK FEATURE SECTION (EN ESPAÑOL) ─── */}
                <section className="w-full bg-black text-white py-16 sm:py-24 relative z-20 font-sans border-t border-zinc-900">
                  <div className="max-w-[1200px] mx-auto px-6 sm:px-12 text-center space-y-12 sm:space-y-16">
                    {/* Centered Title */}
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-sans uppercase">
                      Reservar entradas nunca fue tan fácil
                    </h2>

                    {/* 3 Feature Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 items-start">
                      {/* Column 1 */}
                      <div className="flex flex-col items-center text-center space-y-3 group">
                        <div className="relative w-36 h-36 sm:w-44 sm:h-44 transition-transform duration-300">
                          <Image
                            src="/images/4go_alien_hands_tilt_left.png"
                            alt="Reserva en segundos"
                            fill
                            className="object-contain filter drop-shadow-xl"
                          />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                          Reserva en segundos
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-300 max-w-xs leading-relaxed">
                          Obtén tus entradas en menos tiempo del que te tomó leer esto.
                        </p>
                      </div>

                      {/* Column 2 */}
                      <div className="flex flex-col items-center text-center space-y-3 group">
                        <div className="relative w-36 h-36 sm:w-44 sm:h-44 transition-transform duration-300">
                          <Image
                            src="/images/4go_alien_hands_straight.png"
                            alt="Precios transparentes"
                            fill
                            className="object-contain filter drop-shadow-xl"
                          />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                          Precios transparentes
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-300 max-w-xs leading-relaxed">
                          Mira el precio total desde el inicio, sin cargos ocultos ni sorpresas al pagar.
                        </p>
                      </div>

                      {/* Column 3 */}
                      <div className="flex flex-col items-center text-center space-y-3 group">
                        <div className="relative w-36 h-36 sm:w-44 sm:h-44 transition-transform duration-300">
                          <Image
                            src="/images/4go_alien_hands_tilt_right.png"
                            alt="Recomendaciones personalizadas"
                            fill
                            className="object-contain filter drop-shadow-xl"
                          />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                          Recomendaciones personalizadas
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-300 max-w-xs leading-relaxed">
                          Descubre los eventos hechos a tu medida directamente en tu inicio.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ─── 4. WHITE ORGANIZER BANNER SECTION (PUBLICA TUS EVENTOS) ─── */}
                <section id="subir-features-section" className="w-full bg-white text-black py-16 sm:py-24 relative z-20 font-sans border-t border-zinc-200">
                  <div className="max-w-[1300px] mx-auto px-6 sm:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                      {/* Left Column: Title, Description & Action Buttons */}
                      <div className="lg:col-span-6 space-y-6 text-left">
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight font-sans uppercase leading-[1.05]">
                          PUBLICA TUS EVENTOS &amp; CONECTA CON TU AUDIENCIA
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-600 font-semibold leading-relaxed max-w-xl">
                          Diseñado exclusivamente para productores, creadores y clubes nocturnos. Gestiona preventas en tiempo real, validación QR ultrasónica en puerta y control total de entradas en una sola plataforma.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveStoryScreen(0)}
                            className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 shadow-xl inline-flex items-center justify-center cursor-pointer"
                          >
                            CREAR CUENTA DE ORGANIZADOR
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveStoryScreen(2)}
                            className="px-6 py-3.5 rounded-full bg-transparent border-2 border-black/80 hover:bg-black/5 text-black text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                          >
                            EXPLORAR EVENTOS
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Rounded Image Container with Red Girl Photo & Copyright watermark */}
                      <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[540px] aspect-[4/3.5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/10 bg-zinc-950">
                          <Image
                            src="/images/4go_red_girl_showcase.jpg"
                            alt="Publica tus eventos 4GO"
                            fill
                            className="object-cover brightness-105"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                          {/* Overlay copyright text on bottom left */}
                          <span className="absolute bottom-4 left-5 text-[10px] sm:text-[11px] font-extrabold text-white/90 tracking-wider shadow-md drop-shadow">
                            © 4GO 2026, all rights reserved
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ─── 5. SECOND WHITE BANNER SECTION (MERCH 4GO SHOWCASE SLIDESHOW) ─── */}
                <section id="merch-4go-section" className="w-full bg-white text-black py-16 sm:py-24 relative z-20 font-sans border-t border-zinc-200">
                  <div className="max-w-[1300px] mx-auto px-6 sm:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                      {/* Left Column: Animated Merch 4GO Slideshow Container */}
                      <div className="lg:col-span-6 w-full flex justify-center lg:justify-start order-2 lg:order-1">
                        <div className="relative w-full max-w-[540px] aspect-[4/3.5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/10 bg-zinc-950 group">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`merch-slide-${merchSlideIndex}`}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.02 }}
                              transition={{ duration: 0.85, ease: "easeInOut" }}
                              className="absolute inset-0 w-full h-full"
                            >
                              <Image
                                src={MERCH_SHOWCASE_IMAGES[merchSlideIndex].src}
                                alt={MERCH_SHOWCASE_IMAGES[merchSlideIndex].title}
                                fill
                                className="object-cover brightness-105"
                                sizes="(max-width: 768px) 100vw, 600px"
                              />
                            </motion.div>
                          </AnimatePresence>

                          {/* Overlay copyright text on bottom left */}
                          <span className="absolute bottom-4 left-5 z-20 text-[10px] sm:text-[11px] font-extrabold text-white/90 tracking-wider shadow-md drop-shadow">
                            © 4GO 2026, all rights reserved
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Title, Description & Action Buttons (Text on Right) */}
                      <div className="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight font-sans uppercase leading-[1.05]">
                          MERCH 4GO &amp; EDICIONES LIMITADAS
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-600 font-semibold leading-relaxed max-w-xl">
                          Descubre la colección oficial de streetwear, ropa exclusiva y accesorios diseñados para la cultura nocturna y los mejores eventos de Ecuador.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                          <button
                            type="button"
                            onClick={() => router.push("/merch")}
                            className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 shadow-xl inline-flex items-center justify-center cursor-pointer"
                          >
                            COMPRAR MERCH 4GO
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/merch")}
                            className="px-6 py-3.5 rounded-full bg-transparent border-2 border-black/80 hover:bg-black/5 text-black text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                          >
                            VER COLECCIÓN
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ─── 6. THIRD WHITE BANNER SECTION (VIVE EXPERIENCIAS ÚNICAS & FAN SUPPORT) ─── */}
                <section className="w-full bg-white text-black py-16 sm:py-24 relative z-20 font-sans border-t border-zinc-200">
                  <div className="max-w-[1300px] mx-auto px-6 sm:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                      {/* Left Column: Title, Description & Action Buttons */}
                      <div className="lg:col-span-6 space-y-6 text-left">
                        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight font-sans uppercase leading-[1.05]">
                          VIVE EXPERIENCIAS ÚNICAS &amp; ACCEDE AL INSTANTE
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-600 font-semibold leading-relaxed max-w-xl">
                          Acceso QR ultrasónico desde tu teléfono, transferencias de entradas en segundos entre amigos y notificaciones en tiempo real sobre los mejores eventos y clubes de Ecuador.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveStoryScreen(2)}
                            className="px-6 py-3.5 rounded-full bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 shadow-xl inline-flex items-center justify-center cursor-pointer"
                          >
                            VER EVENTOS DESTACADOS
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("open-ai-chatbot"));
                              }
                            }}
                            className="px-6 py-3.5 rounded-full bg-transparent border-2 border-black/80 hover:bg-black/5 text-black text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                          >
                            ASISTENCIA FAN SUPPORT
                          </button>
                        </div>
                      </div>

                      {/* Right Column: Rounded Image Container with Party/Presentation Photo & Copyright watermark */}
                      <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-[540px] aspect-[4/3.5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/10 bg-zinc-950">
                          <Image
                            src="/images/now4go-hero-presentation-hd-fullbleed.png"
                            alt="Vive experiencias 4GO"
                            fill
                            className="object-cover brightness-105"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                          {/* Overlay copyright text on bottom left */}
                          <span className="absolute bottom-4 left-5 text-[10px] sm:text-[11px] font-extrabold text-white/90 tracking-wider shadow-md drop-shadow">
                            © 4GO 2026, all rights reserved
                          </span>
                        </div>
                      </div>
                    </div>
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
                className="w-full text-white min-h-screen pt-24 sm:pt-28 pb-40 px-4 sm:px-8 relative z-10"
              >
                <div className="max-w-[1400px] mx-auto space-y-8">
                  {/* Top Pills Bar (Location, Date, Price) */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer shadow-md"
                    >
                      <MapPin className="w-4 h-4 text-yellow-400" />
                      <span>LOJA / ECUADOR</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer shadow-md"
                    >
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>CUALQUIER FECHA</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition cursor-pointer shadow-md"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>TODOS LOS PRECIOS</span>
                    </button>
                  </div>

                  {/* Category Square Icons Row */}
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                    {[
                      { id: "todos", label: "Todos", icon: "🔥" },
                      { id: "dj", label: "DJ", icon: "🎧" },
                      { id: "party", label: "Party", icon: "🌐" },
                      { id: "comedy", label: "Comedy", icon: "😄" },
                      { id: "gigs", label: "Gigs", icon: "🎤" },
                      { id: "food", label: "Food & drink", icon: "🍴" },
                      { id: "social", label: "Social", icon: "💬" },
                      { id: "wellbeing", label: "Wellbeing", icon: "🌿" },
                    ].map((cat) => (
                      <button
                        key={`cat-icon-${cat.id}`}
                        type="button"
                        onClick={() => setSelectedDay("todos")}
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border transition-all cursor-pointer shrink-0 gap-1 shadow-md ${selectedDay === cat.id || (cat.id === "todos" && selectedDay === "todos")
                            ? "bg-white text-black border-white"
                            : "bg-white/5 backdrop-blur-md border-white/10 text-white hover:border-white/30 hover:bg-white/10"
                          }`}
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-[10px] font-bold tracking-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Spotify / Apple Music Banner Card */}
                  <div className="relative w-full rounded-3xl bg-white/5 backdrop-blur-md border border-white/15 p-6 sm:p-8 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
                    <div className="space-y-4 max-w-xl z-10">
                      <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight font-sans">
                        Encuentra shows de tus artistxs favoritxs
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                        Conecta tu Spotify o Apple Music para descubrir los mejores eventos cerca de ti.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
                        >
                          <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.341c-.217.357-.682.469-1.039.252-2.846-1.74-6.429-2.133-10.65-1.168-.403.093-.806-.164-.899-.567-.093-.403.164-.806.567-.899 4.629-1.058 8.577-.61 11.769 1.343.357.217.469.682.252 1.039zm1.478-3.284c-.273.444-.856.586-1.3.313-3.257-2.002-8.223-2.584-12.077-1.414-.499.151-1.026-.134-1.177-.633-.151-.499.134-1.026.633-1.177 4.409-1.337 9.878-.696 13.608 1.6 4.44.273.586.856.313 1.3zm.143-3.418c-3.905-2.319-10.347-2.533-14.116-1.389-.607.184-1.246-.162-1.43-.769-.184-.607.162-1.246.769-1.43 4.316-1.31 11.43-1.056 15.93 1.616.547.325.727 1.034.402 1.581-.325.547-1.034.727-1.555.391z" />
                          </svg>
                          <span>SPOTIFY</span>
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white text-black font-black text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer shadow-lg"
                        >
                          <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.86-.99 2.96 1.07.08 2.14-.56 2.8-1.36z" />
                          </svg>
                          <span>APPLE MUSIC</span>
                        </button>
                      </div>
                    </div>

                    <div className="relative w-36 h-36 md:w-44 md:h-44 shrink-0 flex items-center justify-center">
                      <Image
                        src="/images/alien_green_hands_official.png"
                        alt="4GO Official Mascot"
                        width={200}
                        height={200}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="pt-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-sans">
                        Eventos populares <span className="text-yellow-400 font-black">en Ecuador</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 font-medium pt-1">
                        Disfruta de las mejores fiestas y festivales con entradas oficiales
                      </p>
                    </div>
                  </div>

                  {/* GRID OF 4 COLUMNS ON DESKTOP WITH CLEAN CARDS MATCHING DESIGN SCREENSHOT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {(events && events.length > 0 ? events : fallbackEvents).map((evt) => (
                      <div
                        key={`cat-4col-${evt.id}`}
                        onClick={() => {
                          setSelectedCarouselEvent(evt);
                          setShowDetailOverlay(true);
                        }}
                        className="group relative flex flex-col space-y-2.5 cursor-pointer text-left"
                      >
                        {/* Artwork Box: Clean Image without text overlay */}
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 group-hover:border-white/30 transition-all duration-300 shadow-2xl">
                          <Image
                            src={evt.poster || "/images/now4go-hero-presentation-hd-v3.png"}
                            alt={evt.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 320px"
                          />

                          {/* Play & Heart Overlay Buttons (Bottom Right) */}
                          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCarouselEvent(evt);
                                setShowDetailOverlay(true);
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
                              aria-label="Ver detalles"
                            >
                              <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLikedEvents((prev) => ({
                                  ...prev,
                                  [evt.id]: !prev[evt.id],
                                }));
                              }}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-lg cursor-pointer"
                              aria-label="Guardar favorito"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 transition-colors ${likedEvents[evt.id]
                                    ? "text-red-500 fill-red-500"
                                    : "text-white hover:text-red-400"
                                  }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Event Details Text Below Artwork (Clean White & Yellow text) */}
                        <div className="flex flex-col space-y-0.5 px-0.5 text-left">
                          <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                            {evt.title}
                          </h4>
                          <span className="text-xs font-bold text-amber-400 block pt-0.5">
                            {evt.dateLabel || "sáb, 26 sept"}
                          </span>
                          <span className="text-xs font-semibold text-zinc-300 block truncate">
                            {evt.venue || "Factory Town"}
                          </span>
                          <span className="text-xs font-bold text-white block pt-0.5">
                            {evt.price === 0 ? "Desde Gratis" : `Desde ${evt.price || "49,99"} $`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer with DevEc Software Development Branding */}
          <Footer />
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
        className={`fixed inset-0 z-[350] flex items-end md:items-center justify-center transition-all duration-300 ${isTicketModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
          className={`relative w-full h-[96dvh] transition-all duration-500 overflow-hidden flex flex-col rounded-t-[32px] md:rounded-[36px] border border-white/[0.07] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-[0_-20px_80px_rgba(0,0,0,0.8)] md:shadow-[0_40px_120px_rgba(0,0,0,0.9)] md:mx-4 ${checkoutState === "success" || checkoutState === "verifying"
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

      {/* ─── APPLE ID AUTHENTICATION DIALOG (PREVENTS INVALID_CLIENT ERROR) ─── */}
      <AnimatePresence>
        {isAppleAuthModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white text-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 relative overflow-hidden font-sans text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAppleAuthModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Apple Header Branding */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.12-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-.99 3.03 1.09.08 2.2-.57 2.85-1.39z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 leading-tight">Iniciar sesión con Apple ID</h3>
                  <p className="text-xs text-zinc-500 font-medium">Usa tu ID de Apple para ingresar a 4GO.</p>
                </div>
              </div>

              {/* Input Email & Name */}
              <div className="space-y-3.5 my-5">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block">Correo de Apple ID / iCloud</label>
                  <input
                    type="email"
                    value={appleInputEmail}
                    onChange={(e) => setAppleInputEmail(e.target.value)}
                    placeholder="tu.cuenta@icloud.com"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500 block">Nombre del Organizador</label>
                  <input
                    type="text"
                    value={appleInputName}
                    onChange={(e) => setAppleInputName(e.target.value)}
                    placeholder="Brandon Medina / Cubic Club"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleConfirmAppleLogin}
                disabled={!appleInputEmail.trim()}
                className="w-full py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest transition active:scale-95 shadow-xl disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continuar con Apple ID</span>
              </button>
            </motion.div>
          </div>
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

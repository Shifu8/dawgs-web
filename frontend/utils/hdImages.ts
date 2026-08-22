export const HOME_HERO_IMAGE_SRC = "/images/hd/4go_dj_hero_home_3840w.jpg";
export const JUST_CREATE_HERO_IMAGE_SRC = "/images/hd/just_create_4go_hero_1440w.jpg";
export const DEFAULT_HD_EVENT_POSTER = "/images/hd/now4go-hero-presentation-hd-v3_3840w.jpg";

const HD_IMAGE_OVERRIDES: Record<string, string> = {
  "/just_create_4go_hero.png": JUST_CREATE_HERO_IMAGE_SRC,
  "/images/4go_dj_hero_home.png": HOME_HERO_IMAGE_SRC,
  "/images/now4go-hero-presentation.png": DEFAULT_HD_EVENT_POSTER,
  "/images/now4go-hero-presentation-wide-v2.png": DEFAULT_HD_EVENT_POSTER,
  "/images/now4go-hero-presentation-hd-v3.png": DEFAULT_HD_EVENT_POSTER,
  "/images/omar_courtz_card_bg.jpg": "/images/hd/omar_courtz_card_bg_3840w.jpg",
  "/images/trap_loud_trio_artists.png": "/images/hd/trap_loud_trio_artists_2048w.jpg",
  "/images/trap_loud_anuel_1778966415162.png": "/images/hd/trap_loud_anuel_1778966415162_2048w.jpg",
  "/images/rnb_loud_brent_1778966427864.png": "/images/hd/rnb_loud_brent_1778966427864_2048w.jpg",
  "/images/latin_loud_bad_bunny_1778966469259.png": "/images/hd/latin_loud_bad_bunny_1778966469259_2048w.jpg",
  "/images/roa_artist_1779161704881.png": "/images/hd/roa_artist_1779161704881_2048w.jpg",
  "/images/trap_loud_event_1779161392003.png": "/images/hd/trap_loud_event_1779161392003_2048w.jpg",
};

export function getHdImageSrc(src?: string | null): string {
  const normalized = src?.trim();
  if (!normalized) return DEFAULT_HD_EVENT_POSTER;
  return HD_IMAGE_OVERRIDES[normalized] ?? normalized;
}

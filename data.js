/* ═══════════════════════════════════════════════════════════
   CineDhoom — Data Module v3.0
   Comprehensive Movie Database + TMDB Integration + OTT Links
   ═══════════════════════════════════════════════════════════ */

import { MOVIES_DATABASE, TOTAL_MOVIES } from './movies-db.js';

const STORAGE_KEY = 'CineDhoom_movies_v3';
const ADS_STORAGE_KEY = 'CineDhoom_ads_config';
const TMDB_CACHE_KEY = 'CineDhoom_tmdb_cache';

// ─── OTT Platform Links Map ───
const OTT_LINKS = {
  'Netflix': 'https://www.netflix.com/search?q=',
  'Amazon Prime Video': 'https://www.primevideo.com/search?phrase=',
  'Disney+ Hotstar': 'https://www.hotstar.com/in/search?q=',
  'Aha Video': 'https://www.aha.video/search?q=',
  'ZEE5': 'https://www.zee5.com/search?q=',
  'SonyLIV': 'https://www.sonyliv.com/search?q=',
  'Paramount+': 'https://www.paramountplus.com/search/?q=',
  'HBO Max': 'https://www.max.com/search?q=',
  'Peacock': 'https://www.peacocktv.com/search?q=',
  'JioCinema': 'https://www.jiocinema.com/search/',
};

// ─── Data Access Functions ───

/**
 * Get all movies — uses built-in database merged with any user-added movies
 */
export function getAllMovies() {
  const userMovies = getUserAddedMovies();
  return [...MOVIES_DATABASE, ...userMovies];
}

/**
 * Get user-added movies from localStorage
 */
function getUserAddedMovies() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

/**
 * Save user-added movies to localStorage
 */
function saveUserMovies(movies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

/**
 * Get a single movie by slug
 */
export function getMovieBySlug(slug) {
  return getAllMovies().find(m => m.slug === slug) || null;
}

/**
 * Get a single movie by ID
 */
export function getMovieById(id) {
  return getAllMovies().find(m => m.id === id) || null;
}

/**
 * Add a new movie (via dashboard)
 */
export function createCinematicPosterSvg(title = 'Movie', year = '2026', language = 'Film') {
  const safeTitle = (title || 'CineDhoom').replace(/[<>&"]/g, '');
  const safeYear = (year || '2026').toString().replace(/[<>&"]/g, '');
  const safeLang = (language || 'Cinematic').replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
    <defs>
      <linearGradient id="bg_${encodeURIComponent(safeTitle).slice(0, 8)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#181a24"/>
        <stop offset="50%" stop-color="#0f1017"/>
        <stop offset="100%" stop-color="#07080b"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#bg_${encodeURIComponent(safeTitle).slice(0, 8)})"/>
    <rect x="14" y="14" width="372" height="572" rx="16" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
    <g transform="translate(200, 240)">
      <circle r="46" fill="#1e202c" stroke="#ffd21e" stroke-width="2.5"/>
      <polygon points="-8,-16 16,0 -8,16" fill="#ffd21e"/>
    </g>
    <rect x="135" y="324" width="130" height="26" rx="13" fill="rgba(255,210,30,0.14)"/>
    <text x="200" y="341" fill="#ffd21e" font-family="'Outfit', system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" text-anchor="middle">${safeLang.toUpperCase()}</text>
    <text x="200" y="396" fill="#ffffff" font-family="'Outfit', system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle">${safeTitle.slice(0, 24)}</text>
    <text x="200" y="426" fill="#a1a1ac" font-family="'Outfit', system-ui, sans-serif" font-size="13" text-anchor="middle">${safeYear} • Verified Release</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createCinematicBackdropSvg(title = 'Movie', year = '2026') {
  const safeTitle = (title || 'CineDhoom').replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
    <defs>
      <linearGradient id="bbg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#161822"/>
        <stop offset="100%" stop-color="#06070a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#bbg)"/>
    <circle cx="600" cy="300" r="140" fill="rgba(255,210,30,0.05)"/>
    <text x="600" y="340" fill="#ffffff" font-family="'Outfit', system-ui, sans-serif" font-size="36" font-weight="800" text-anchor="middle">${safeTitle}</text>
    <text x="600" y="380" fill="#ffd21e" font-family="'Outfit', system-ui, sans-serif" font-size="15" letter-spacing="3" text-anchor="middle">OFFICIAL CINEMATIC STREAM</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Add a new movie (via dashboard)
 */
export function addMovie(movie) {
  const userMovies = getUserAddedMovies();
  movie.id = Date.now(); // unique ID
  movie.slug = slugify(movie.title);
  if (!movie.poster) movie.poster = createCinematicPosterSvg(movie.title, movie.year, movie.language);
  if (!movie.backdrop) movie.backdrop = createCinematicBackdropSvg(movie.title, movie.year);
  userMovies.push(movie);
  saveUserMovies(userMovies);
  return movie;
}

/**
 * Update an existing user-added movie
 */
export function updateMovie(id, updates) {
  const userMovies = getUserAddedMovies();
  const idx = userMovies.findIndex(m => m.id === id);
  if (idx === -1) return null;
  if (updates.title && updates.title !== userMovies[idx].title) {
    updates.slug = slugify(updates.title);
  }
  userMovies[idx] = { ...userMovies[idx], ...updates };
  saveUserMovies(userMovies);
  return userMovies[idx];
}

/**
 * Delete a user-added movie
 */
export function deleteMovie(id) {
  const userMovies = getUserAddedMovies().filter(m => m.id !== id);
  saveUserMovies(userMovies);
}

/**
 * Get movies filtered by language
 */
export function getMoviesByLanguage(lang) {
  return getAllMovies().filter(m => m.language.toLowerCase() === lang.toLowerCase());
}

/**
 * Get movies filtered by genre
 */
export function getMoviesByGenre(genre) {
  return getAllMovies().filter(m => m.genre.toLowerCase() === genre.toLowerCase());
}

/**
 * Get trending movies (sorted by year desc, then rating desc)
 */
export function getTrendingMovies(limit = 20) {
  return getAllMovies()
    .sort((a, b) => b.year - a.year || b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Get upcoming movies (release date in the future)
 */
export function getUpcomingMovies() {
  const now = new Date();
  return getAllMovies()
    .filter(m => m.releaseDate && new Date(m.releaseDate) > now)
    .sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
}

/**
 * Get recently released movies (within last 90 days)
 */
export function getRecentMovies(days = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const now = new Date();
  return getAllMovies()
    .filter(m => {
      if (!m.releaseDate) return false;
      const rd = new Date(m.releaseDate);
      return rd >= cutoff && rd <= now;
    })
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
}

/**
 * Reset user-added movies
 */
export function resetToDefaults() {
  localStorage.removeItem(STORAGE_KEY);
  return MOVIES_DATABASE;
}

/**
 * Save all movies (for dashboard compatibility)
 */
export function saveAllMovies(movies) {
  // Only save the delta (user-added movies not in the built-in database)
  const builtInIds = new Set(MOVIES_DATABASE.map(m => m.id));
  const userMovies = movies.filter(m => !builtInIds.has(m.id));
  saveUserMovies(userMovies);
}

// ─── Poster & Image URLs ───

/**
 * Get poster URL for a movie
 */
export function getMoviePoster(movie) {
  if (movie.poster && movie.poster.startsWith('http') && !movie.poster.includes('picsum.photos')) {
    return movie.poster;
  }
  return createCinematicPosterSvg(movie.title, movie.year, movie.language);
}

/**
 * Get hero/backdrop URL for a movie
 */
export function getMovieHero(movie) {
  if (movie.backdrop && movie.backdrop.startsWith('http') && !movie.backdrop.includes('picsum.photos')) {
    return movie.backdrop;
  }
  return createCinematicBackdropSvg(movie.title, movie.year);
}

/**
 * Generate poster placeholder URL
 */
export function posterUrl(seed, w = 400, h = 600) {
  return createCinematicPosterSvg(seed, '2026', 'Cinema');
}

/**
 * Generate hero/backdrop placeholder URL
 */
export function heroUrl(seed, w = 1200, h = 675) {
  return createCinematicBackdropSvg(seed, '2026');
}

// ─── OTT Streaming Functions ───

/**
 * Get the streaming/watch URL for a movie on its OTT platform
 */
export function getStreamingUrl(movie) {
  if (!movie.ottPlatform) return null;
  const baseUrl = OTT_LINKS[movie.ottPlatform];
  if (!baseUrl) return null;
  return baseUrl + encodeURIComponent(movie.title);
}

/**
 * Check if a movie is currently available on OTT
 */
export function isAvailableOnOTT(movie) {
  if (!movie.ottPlatform || !movie.ottDate) return false;
  return new Date(movie.ottDate) <= new Date();
}

/**
 * Get OTT availability status text
 */
export function getOTTStatus(movie) {
  if (!movie.ottPlatform) {
    return { available: false, text: 'Not Available on Any OTT Platform', class: 'ott-unavailable' };
  }
  if (isAvailableOnOTT(movie)) {
    return { available: true, text: `Streaming Now on ${movie.ottPlatform}`, class: 'ott-streaming' };
  }
  return { 
    available: false, 
    text: `Coming to ${movie.ottPlatform} on ${formatDate(movie.ottDate)}`, 
    class: 'ott-upcoming' 
  };
}

/**
 * Get all OTT platform names referenced in our database
 */
export function getAllOTTPlatforms() {
  const platforms = new Set();
  getAllMovies().forEach(m => {
    if (m.ottPlatform) platforms.add(m.ottPlatform);
  });
  return [...platforms].sort();
}

// ─── Helpers ───

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format date string
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

// ─── TMDB Auto-Fetch & World Movies API System ───

const TMDB_DEFAULT_KEY = '844b207204918e7e1bb722fecab3f5ff'; // TMDB v3 API Key for global movie updates
const TMDB_BASE = 'https://api.themoviedb.org/3';

export function getTMDBApiKey() {
  try {
    return localStorage.getItem('CineDhoom_tmdb_api_key') || TMDB_DEFAULT_KEY;
  } catch {
    return TMDB_DEFAULT_KEY;
  }
}

export function setTMDBApiKey(key) {
  try {
    localStorage.setItem('CineDhoom_tmdb_api_key', key.trim());
  } catch {}
}

const TMDB_GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western'
};

/**
 * Fetch latest world movie releases from TMDB
 */
export async function fetchNewReleasesFromTMDB(language = 'te', page = 1) {
  const apiKey = getTMDBApiKey();
  if (!apiKey) return [];
  
  try {
    const res = await fetch(
      `${TMDB_BASE}/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&with_original_language=${language}&page=${page}&vote_count.gte=5`
    );
    const data = await res.json();
    if (!data.results) return [];
    
    return data.results.map(m => formatTMDBMovie(m, language));
  } catch (err) {
    console.error('TMDB fetch error:', err);
    return [];
  }
}

/**
 * Fetch global trending movies across all countries
 */
export async function fetchTMDBTrending(timeWindow = 'day') {
  const apiKey = getTMDBApiKey();
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TMDB_BASE}/trending/movie/${timeWindow}?api_key=${apiKey}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map(m => formatTMDBMovie(m, m.original_language));
  } catch (err) {
    console.error('TMDB Trending error:', err);
    return [];
  }
}

/**
 * Fetch movies currently playing in theaters worldwide
 */
export async function fetchTMDBNowPlaying(language = 'en-US', page = 1) {
  const apiKey = getTMDBApiKey();
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TMDB_BASE}/movie/now_playing?api_key=${apiKey}&language=${language}&page=${page}`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map(m => formatTMDBMovie(m, m.original_language));
  } catch (err) {
    console.error('TMDB Now Playing error:', err);
    return [];
  }
}

/**
 * Search any movie globally across TMDB
 */
export async function searchTMDB(query, page = 1) {
  const apiKey = getTMDBApiKey();
  if (!apiKey || !query.trim()) return [];
  try {
    const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map(m => formatTMDBMovie(m, m.original_language));
  } catch (err) {
    console.error('TMDB Search error:', err);
    return [];
  }
}

function formatTMDBMovie(m, langCode) {
  const genre = (m.genre_ids && m.genre_ids.length > 0 && TMDB_GENRES[m.genre_ids[0]]) || 'Action';
  const lang = getLanguageName(langCode || m.original_language);
  const year = m.release_date ? new Date(m.release_date).getFullYear() : 2026;
  return {
    id: `tmdb_${m.id}`,
    tmdbId: m.id,
    title: m.title,
    slug: slugify(m.title),
    year: year,
    genre: genre,
    language: lang,
    rating: m.vote_average ? parseFloat(m.vote_average.toFixed(1)) : 7.5,
    releaseDate: m.release_date || `${year}-01-01`,
    synopsis: m.overview || `${m.title} is an official ${year} ${lang} cinematic release.`,
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : createCinematicPosterSvg(m.title, year, lang),
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : createCinematicBackdropSvg(m.title, year),
    ottPlatform: null,
    ottDate: null,
    cast: 'Leading Stars',
    director: 'Acclaimed Director',
    runtime: '150 min',
    trailerYoutubeId: 'dQw4w9WgXcQ',
    faqs: [
      {
        q: `Where to watch ${m.title} online?`,
        a: `${m.title} digital streaming release information will be updated on CineDhoom as soon as official OTT agreements are finalized.`
      }
    ]
  };
}

function getLanguageName(code) {
  const map = {
    'te': 'Telugu', 'ta': 'Tamil', 'kn': 'Kannada',
    'ml': 'Malayalam', 'hi': 'Bollywood', 'en': 'Hollywood',
    'ko': 'Korean', 'ja': 'Anime', 'es': 'Spanish', 'fr': 'French'
  };
  return map[code] || 'World Cinema';
}

// ─── Ad Slots Management (Controlled via Dashboard) ───

const DEFAULT_ADS = {
  headerAd: {
    enabled: true,
    title: 'Stream Latest South Indian Cinema in 4K UHD — Verified OTT Pass',
    sponsor: 'Official Streaming Partner',
    link: 'https://www.netflix.com',
    bannerImg: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=970&auto=format&fit=crop&q=80',
  },
  inContentAd: {
    enabled: true,
    title: 'Watch Today’s Releases at 60FPS with Ultra-Low Latency Fiber Broadband',
    sponsor: 'High-Speed Broadband Partner',
    link: 'https://www.primevideo.com',
    bannerImg: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=970&auto=format&fit=crop&q=80',
  },
  sidebarAd: {
    enabled: true,
    title: 'Protect Your Streaming Privacy — High-Speed 10Gbps VPN',
    sponsor: 'Official Security Partner',
    link: 'https://www.expressvpn.com',
    bannerImg: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=320&auto=format&fit=crop&q=80',
  },
  popupAd: {
    enabled: true, // Triggered ONLY when clicking "Watch Now" at the bottom
    duration: 5,
    title: 'Verifying High-Speed Stream Server (4K UHD 60FPS)...',
    sponsor: 'Official OTT Sponsor Network',
    bannerImg: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=640&auto=format&fit=crop&q=80',
    link: 'https://www.hotstar.com',
    ctaText: 'Visit Sponsor Partner',
  },
  cardClickAd: {
    enabled: true, // Direct 1-2 click monetization on movie cards
    mode: 'dual', // 'dual' (instant 1-click new tab ad + movie), 'twoclick' (1st click ad, 2nd click movie), 'every2nd', 'first_only'
    sponsor: 'Exclusive OTT Partner Offer',
    link: 'https://www.hotstar.com',
    toastNotice: true,
  }
};

export function getAdsConfig() {
  try {
    const raw = localStorage.getItem(ADS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADS,
        ...parsed,
        cardClickAd: {
          ...DEFAULT_ADS.cardClickAd,
          ...(parsed.cardClickAd || {})
        }
      };
    }
  } catch (err) {
    console.error('Failed to read ads config from localStorage:', err);
  }
  return { ...DEFAULT_ADS };
}

export function saveAdsConfig(config) {
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save ads config:', err);
  }
}

export function resetAdsConfig() {
  localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(DEFAULT_ADS));
  return { ...DEFAULT_ADS };
}

// ─── Direct Card-Click Ad Monetization ("1-2 Clicks" Gateway) ───

let cardToastTimer = null;
export function showCardClickToast(message, icon = '⚡') {
  if (typeof document === 'undefined') return;
  let toast = document.getElementById('card-ad-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'card-ad-toast';
    toast.className = 'card-ad-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="card-ad-toast-icon">${icon}</span><span class="card-ad-toast-text">${message}</span>`;
  toast.classList.add('show');
  clearTimeout(cardToastTimer);
  cardToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

export function handleCardClickMonetization(e) {
  if (typeof window === 'undefined') return;
  // Ignore auxiliary clicks (middle-click, right-click, ctrl/meta-click)
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

  const anchor = e.target.closest('a');
  if (!anchor) return;

  // Don't intercept external sponsored banners or tabs already opening blank
  if (anchor.closest('.native-sponsored-card') || anchor.getAttribute('target') === '_blank') return;

  const href = anchor.getAttribute('href');
  if (!href || !href.includes('movie.html')) return;

  // Check if target is a movie card/item
  const isCard = anchor.matches('.poster-link, .slide-link, .related-movie-item, .search-result-item') ||
                 anchor.closest('.poster-card, .slide, #related-movies-list, #search-results');
  if (!isCard) return;

  const cfg = getAdsConfig();
  const cardAd = cfg.cardClickAd;
  if (!cardAd || !cardAd.enabled || !cardAd.link) return;

  const mode = cardAd.mode || 'dual';
  const adLink = cardAd.link;
  const sponsor = cardAd.sponsor || 'Official Sponsor';

  let clickCount = parseInt(sessionStorage.getItem('CineDhoom_card_clicks') || '0', 10);
  clickCount++;
  sessionStorage.setItem('CineDhoom_card_clicks', clickCount.toString());

  if (mode === 'twoclick') {
    // 2-clicks gateway mode:
    // If this card is already unlocked, allow normal navigation
    if (anchor.dataset.cardUnlocked === 'true') {
      return;
    }

    // 1st click: open ad in new tab, prevent navigation, and unlock card
    e.preventDefault();
    anchor.dataset.cardUnlocked = 'true';
    anchor.classList.add('card-sponsor-unlocked');

    window.open(adLink, '_blank');

    if (cardAd.toastNotice !== false) {
      showCardClickToast(`⚡ Sponsored Stream Gateway Loaded! Click once more to open movie.`, '🔓');
    }

    // Remove unlock state after 25s if user didn't proceed
    setTimeout(() => {
      anchor.removeAttribute('data-card-unlocked');
      anchor.classList.remove('card-sponsor-unlocked');
    }, 25000);
    return;
  }

  if (mode === 'every2nd') {
    // Trigger ad only on even clicks (click 2, 4, 6...)
    if (clickCount % 2 === 0) {
      window.open(adLink, '_blank');
      if (cardAd.toastNotice !== false) {
        showCardClickToast(`📢 Opening ${sponsor} in new tab...`, '⚡');
      }
    }
    return; // Allow current tab to navigate to movie
  }

  if (mode === 'first_only') {
    // Trigger ad only on 1st click per session
    if (clickCount === 1) {
      window.open(adLink, '_blank');
      if (cardAd.toastNotice !== false) {
        showCardClickToast(`📢 Opening ${sponsor} in new tab...`, '⚡');
      }
    }
    return; // Allow current tab to navigate to movie
  }

  // Default 'dual' mode (Instant 1-Click: opens ad in new tab + opens movie in current tab)
  window.open(adLink, '_blank');
  if (cardAd.toastNotice !== false) {
    showCardClickToast(`📢 Opening ${sponsor} in new tab...`, '⚡');
  }
}

export function setupCardClickMonetization() {
  if (typeof document === 'undefined') return;
  // Ensure we only attach the listener once
  if (window.__CineDhoomCardAdInitialized) return;
  window.__CineDhoomCardAdInitialized = true;
  document.addEventListener('click', handleCardClickMonetization);
}

// Auto-initialize when running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupCardClickMonetization());
  } else {
    setupCardClickMonetization();
  }
}

// ─── Export Total Count ───
export { TOTAL_MOVIES };


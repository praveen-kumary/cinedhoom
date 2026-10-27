/* ═══════════════════════════════════════════════════════════
   CINEDHOOM — Main Controller v4.0
   Matching reference site: spotlight, rails, tabs, search
   ═══════════════════════════════════════════════════════════ */

import './style.css';
import {
  getAllMovies, getMoviePoster, getMovieHero,
  getOTTStatus, getStreamingUrl, getTrendingMovies,
  createCinematicPosterSvg, setupCardClickMonetization
} from './data.js';

const allMovies = getAllMovies();
setupCardClickMonetization();

// ─── Navigation Toggle ───
const navToggle = document.getElementById('nav-toggle');
const primaryNav = document.getElementById('primary-nav');
if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const open = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  primaryNav.addEventListener('click', e => {
    if (e.target.closest('a')) {
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ─── Poster Card HTML (matches reference site structure) ───
function posterCard(movie) {
  const ott = getOTTStatus(movie);
  const fallbackSvg = createCinematicPosterSvg(movie.title, movie.year, movie.language);
  return `
    <article class="poster-card">
      <a class="poster-link" href="/movie.html?slug=${movie.slug}">
        <span class="poster-frame">
          <img src="${getMoviePoster(movie)}" alt="${movie.title}" width="200" height="300" loading="lazy" decoding="async" class="poster-img" onerror="this.onerror=null; this.src='${fallbackSvg}';" />
          <span class="poster-year">${movie.year}</span>
          <span class="poster-genre">${movie.genre}</span>
        </span>
        <span class="poster-title">${movie.title}</span>
        <span class="poster-ott ${ott.class}">${ott.available ? '● ' + movie.ottPlatform : ott.text.includes('Coming') ? '○ Coming Soon' : ''}</span>
      </a>
    </article>
  `;
}

// ─── Spotlight Carousel ───
const carouselTrack = document.getElementById('carousel-track');
const carouselDots = document.getElementById('carousel-dots');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');

const spotlightMovies = getTrendingMovies(5);
let currentSlide = 0;
let slideTimer = null;

function renderCarousel() {
  if (!carouselTrack || spotlightMovies.length === 0) return;

  carouselTrack.innerHTML = spotlightMovies.map((m, i) => `
    <article class="slide ${i === 0 ? 'is-active' : ''}" ${i !== 0 ? 'aria-hidden="true"' : ''}>
      <a class="slide-link" href="/movie.html?slug=${m.slug}" ${i !== 0 ? 'tabindex="-1"' : ''}>
        <img src="${getMovieHero(m)}" alt="${m.title}" width="1200" height="675" ${i === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async" class="slide-img" onerror="this.style.display='none'" />
        <span class="slide-scrim"></span>
        <span class="slide-content">
          <span class="slide-eyebrow">Spotlight</span>
          <span class="slide-title">${m.title}</span>
          <span class="slide-meta">${m.language} · ${m.year} · ${m.genre}</span>
          <span class="slide-cta">Read <span aria-hidden="true">→</span></span>
        </span>
      </a>
    </article>
  `).join('');

  if (carouselDots) {
    carouselDots.innerHTML = spotlightMovies.map((_, i) => `
      <button class="spot-dot ${i === 0 ? '' : ''}" ${i === 0 ? 'aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>
    `).join('');

    carouselDots.querySelectorAll('.spot-dot').forEach((dot, i) => {
      dot.addEventListener('click', () => goToSlide(i));
    });
  }

  startAutoplay();
}

function goToSlide(idx) {
  const slides = carouselTrack.querySelectorAll('.slide');
  const dots = carouselDots ? carouselDots.querySelectorAll('.spot-dot') : [];
  if (!slides.length) return;

  slides.forEach(s => { s.classList.remove('is-active'); s.setAttribute('aria-hidden', 'true'); });
  dots.forEach(d => d.removeAttribute('aria-current'));

  currentSlide = (idx + slides.length) % slides.length;
  slides[currentSlide].classList.add('is-active');
  slides[currentSlide].removeAttribute('aria-hidden');
  if (dots[currentSlide]) dots[currentSlide].setAttribute('aria-current', 'true');

  startAutoplay();
}

function startAutoplay() {
  clearTimeout(slideTimer);
  slideTimer = setTimeout(() => goToSlide(currentSlide + 1), 6000);
}

if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// ─── Latest Grid with Language Tabs ───
const moviesGrid = document.getElementById('main-movies-grid');
const langTabs = document.getElementById('lang-tabs');
const emptyMsg = document.getElementById('latest-empty');
let currentLang = 'all';

function renderLatestGrid() {
  if (!moviesGrid) return;

  let filtered = currentLang === 'all'
    ? allMovies
    : allMovies.filter(m => m.language === currentLang);

  filtered = filtered.sort((a, b) => b.year - a.year || (b.rating || 0) - (a.rating || 0));
  const display = filtered.slice(0, 24);

  if (display.length === 0) {
    moviesGrid.innerHTML = '';
    if (emptyMsg) emptyMsg.hidden = false;
    return;
  }

  if (emptyMsg) emptyMsg.hidden = true;
  moviesGrid.innerHTML = display.map(posterCard).join('');
}

if (langTabs) {
  langTabs.addEventListener('click', e => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    langTabs.querySelectorAll('.tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-pressed', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-pressed', 'true');
    currentLang = tab.dataset.lang;
    renderLatestGrid();
  });
}

// ─── Language Rails ───
function renderRails() {
  const langs = [
    { id: 'telugu-rail', lang: 'Telugu' },
    { id: 'bollywood-rail', lang: 'Bollywood' },
    { id: 'tamil-rail', lang: 'Tamil' },
    { id: 'malayalam-rail', lang: 'Malayalam' },
    { id: 'kannada-rail', lang: 'Kannada' },
    { id: 'hollywood-rail', lang: 'Hollywood' },
    { id: 'tvshows-rail', lang: 'TV Shows' },
  ];

  langs.forEach(({ id, lang }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const list = allMovies
      .filter(m => m.language === lang)
      .sort((a, b) => b.year - a.year || (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    if (list.length === 0) {
      el.innerHTML = `<p class="rail-empty">More ${lang} titles coming soon.</p>`;
    } else {
      el.innerHTML = list.map(posterCard).join('');
    }
  });
}

// ─── Search Modal ───
const searchTrigger = document.getElementById('search-trigger');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchCount = document.getElementById('search-result-count');

if (searchTrigger && searchModal) {
  searchTrigger.addEventListener('click', () => {
    searchModal.showModal();
    searchInput?.focus();
  });
}
if (searchClose && searchModal) {
  searchClose.addEventListener('click', () => searchModal.close());
}
if (searchModal) {
  searchModal.addEventListener('click', e => {
    if (e.target === searchModal) searchModal.close();
  });
}

// Ctrl+K shortcut
window.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (searchModal?.open) searchModal.close();
    else { searchModal?.showModal(); searchInput?.focus(); }
  }
});

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      if (searchResults) searchResults.innerHTML = '';
      if (searchCount) searchCount.textContent = `Type to search ${allMovies.length}+ titles`;
      return;
    }
    const matched = allMovies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.language.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q) ||
      (m.cast && m.cast.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q))
    );

    if (searchCount) searchCount.textContent = `${matched.length} result(s)`;

    if (searchResults) {
      if (matched.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No movies found.</div>';
      } else {
        searchResults.innerHTML = matched.slice(0, 15).map(m => {
          const ott = getOTTStatus(m);
          return `
          <a href="/movie.html?slug=${m.slug}" class="search-result-row">
            <img src="${getMoviePoster(m)}" alt="${m.title}" class="search-result-thumb" onerror="this.style.display='none'" />
            <div class="search-result-info">
              <strong class="search-result-title">${m.title} (${m.year})</strong>
              <span class="search-result-meta">${m.language} · ${m.genre} · ★ ${m.rating ? m.rating.toFixed(1) : '—'}</span>
              <span class="search-result-ott ${ott.class}">${ott.text}</span>
            </div>
          </a>`;
        }).join('');
      }
    }
  });
}

// ─── Legal Modal ───
const legalModal = document.getElementById('legal-modal');
const legalClose = document.getElementById('legal-modal-close');
const legalAccept = document.getElementById('legal-modal-accept');
const btnTerms = document.getElementById('btn-view-terms');

function openLegal(e) { e?.preventDefault(); legalModal?.showModal(); }

btnTerms?.addEventListener('click', openLegal);
document.querySelectorAll('.footer-legal-btn').forEach(b => b.addEventListener('click', openLegal));
legalClose?.addEventListener('click', () => legalModal?.close());
legalAccept?.addEventListener('click', () => legalModal?.close());
legalModal?.addEventListener('click', e => { if (e.target === legalModal) legalModal.close(); });

// Ensure all dialogs start closed
try {
  if (legalModal && legalModal.open) legalModal.close();
  const sModal = document.getElementById('search-modal');
  if (sModal && sModal.open) sModal.close();
} catch {}

// ─── Initialize ───
renderCarousel();
renderLatestGrid();
renderRails();

/* ═══════════════════════════════════════════════════════════
   CineDhoom — Category & Genre Controller
   Handles dedicated language & genre browsing, live filters,
   high-converting native ad insertions, and dynamic SEO
   ═══════════════════════════════════════════════════════════ */

import './style.css';
import {
  getAllMovies,
  getMoviePoster,
  getOTTStatus,
  getAdsConfig,
  formatDate,
  createCinematicPosterSvg,
  setupCardClickMonetization
} from './data.js';

const allMovies = getAllMovies();
const adsConfig = getAdsConfig();
setupCardClickMonetization();

// ─── DOM References ───
const moviesGrid = document.getElementById('category-movies-grid');
const noResultsBox = document.getElementById('no-results-box');
const filteredCountEl = document.getElementById('filtered-count');
const categoryHeading = document.getElementById('category-heading');
const categoryEyebrow = document.getElementById('category-eyebrow');
const categoryDesc = document.getElementById('category-desc');
const categoryBcActive = document.getElementById('category-bc-active');
const paginationRow = document.getElementById('pagination-row');
const btnLoadMore = document.getElementById('btn-load-more');
const quickSearchInput = document.getElementById('category-quick-search');
const btnClearFilters = document.getElementById('btn-clear-filters');
const btnResetEmpty = document.getElementById('btn-reset-empty');

// Filters
const filterYear = document.getElementById('filter-year');
const filterOtt = document.getElementById('filter-ott');
const sortSelect = document.getElementById('sort-select');

// State
let selectedLang = 'all';
let selectedGenre = 'all';
let selectedYear = 'all';
let selectedOtt = 'all';
let selectedSort = 'latest';
let searchQuery = '';
let visibleLimit = 24;

// ─── Initialize URL Parameters ───
function initFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get('lang');
  const genreParam = params.get('genre');
  const yearParam = params.get('year');
  const ottParam = params.get('ott');
  const qParam = params.get('q');

  if (langParam) selectedLang = langParam;
  if (genreParam) selectedGenre = genreParam;
  if (yearParam) selectedYear = yearParam;
  if (ottParam) selectedOtt = ottParam;
  if (qParam) {
    searchQuery = qParam;
    if (quickSearchInput) quickSearchInput.value = qParam;
  }

  // Sync Language Pills
  document.querySelectorAll('#lang-filter-pills .filter-pill').forEach(btn => {
    const l = btn.dataset.lang;
    const isActive = (selectedLang.toLowerCase() === l.toLowerCase()) || (selectedLang === 'all' && l === 'all');
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  // Sync Genre Pills
  document.querySelectorAll('#genre-filter-pills .genre-pill').forEach(btn => {
    const g = btn.dataset.genre;
    const isActive = (selectedGenre.toLowerCase() === g.toLowerCase()) || (selectedGenre === 'all' && g === 'all');
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });

  // Sync Selects
  if (filterYear && selectedYear !== 'all') filterYear.value = selectedYear;
  if (filterOtt && selectedOtt !== 'all') filterOtt.value = selectedOtt;
}

// ─── Dynamic SEO & Title Update ───
function updateCategorySeo(count) {
  let langTitle = selectedLang !== 'all' ? selectedLang : '';
  let genreTitle = selectedGenre !== 'all' ? selectedGenre : '';

  let mainTitle = 'Watch Movies Online Free in HD';
  let eyebrow = 'BROWSE ALL MOVIES & OTT RELEASES';
  let desc = `Explore ${count} verified films with release dates, official HD trailers, reviews, and streaming platforms on CineDhoom.`;
  let pageTitle = 'Watch Movies Online Free | CineDhoom';

  if (langTitle && genreTitle) {
    mainTitle = `Watch ${langTitle} ${genreTitle} Movies Online Free`;
    eyebrow = `${langTitle.toUpperCase()} • ${genreTitle.toUpperCase()} CINEMA`;
    desc = `Watch latest ${langTitle} ${genreTitle} movies in 1080p / 4K. Verified OTT release dates, trailers and reviews on CineDhoom.`;
    pageTitle = `Watch ${langTitle} ${genreTitle} Movies Online Free in HD | CineDhoom`;
  } else if (langTitle) {
    mainTitle = `Watch ${langTitle} Movies 2026 Online Free in HD`;
    eyebrow = `LATEST ${langTitle.toUpperCase()} MOVIES & OTT DROPS`;
    desc = `Discover the latest ${langTitle} blockbusters and new releases. Check digital streaming platforms (Netflix, Prime, Hotstar, Aha), trailers, and full reviews.`;
    pageTitle = `Watch ${langTitle} Movies 2026 Online Free in HD | CineDhoom`;
  } else if (genreTitle) {
    mainTitle = `Watch ${genreTitle} Movies Online Free in HD`;
    eyebrow = `TOP ${genreTitle.toUpperCase()} FILMS`;
    desc = `Browse top-rated ${genreTitle} films across Telugu, Tamil, Bollywood, Malayalam, and Hollywood. Stream verified links and reviews on CineDhoom.`;
    pageTitle = `Watch ${genreTitle} Movies Online Free in HD | CineDhoom`;
  }

  document.title = pageTitle;
  if (categoryHeading) categoryHeading.textContent = mainTitle;
  if (categoryEyebrow) categoryEyebrow.textContent = eyebrow;
  if (categoryDesc) categoryDesc.textContent = desc;
  if (categoryBcActive) categoryBcActive.textContent = langTitle || genreTitle || 'All Titles';
  if (filteredCountEl) filteredCountEl.textContent = count;
}

// ─── Filter & Sort Logic ───
function getFilteredMovies() {
  return allMovies.filter(m => {
    // Language
    if (selectedLang !== 'all') {
      if (m.language.toLowerCase() !== selectedLang.toLowerCase()) return false;
    }

    // Genre
    if (selectedGenre !== 'all') {
      if (!m.genre || !m.genre.toLowerCase().includes(selectedGenre.toLowerCase())) return false;
    }

    // Year
    if (selectedYear !== 'all') {
      if (selectedYear === 'older') {
        if (m.year >= 2024) return false;
      } else {
        if (String(m.year) !== selectedYear) return false;
      }
    }

    // OTT Status
    if (selectedOtt !== 'all') {
      const ott = getOTTStatus(m);
      if (selectedOtt === 'streaming' && !ott.available) return false;
      if (selectedOtt === 'theatrical' && ott.available) return false;
      if (selectedOtt === 'netflix' && (!m.ottPlatform || !m.ottPlatform.toLowerCase().includes('netflix'))) return false;
      if (selectedOtt === 'prime' && (!m.ottPlatform || !m.ottPlatform.toLowerCase().includes('prime'))) return false;
      if (selectedOtt === 'hotstar' && (!m.ottPlatform || !m.ottPlatform.toLowerCase().includes('hotstar'))) return false;
      if (selectedOtt === 'aha' && (!m.ottPlatform || !m.ottPlatform.toLowerCase().includes('aha'))) return false;
      if (selectedOtt === 'zee5' && (!m.ottPlatform || !m.ottPlatform.toLowerCase().includes('zee5'))) return false;
    }

    // Quick Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inTitle = m.title.toLowerCase().includes(q);
      const inCast = m.cast && m.cast.toLowerCase().includes(q);
      const inDir = m.director && m.director.toLowerCase().includes(q);
      const inSynopsis = m.synopsis && m.synopsis.toLowerCase().includes(q);
      if (!inTitle && !inCast && !inDir && !inSynopsis) return false;
    }

    return true;
  }).sort((a, b) => {
    if (selectedSort === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (selectedSort === 'title') {
      return a.title.localeCompare(b.title);
    }
    // Default: Latest Year + rating
    return (b.year || 0) - (a.year || 0) || (b.rating || 0) - (a.rating || 0);
  });
}

// ─── Render Native Sponsored In-Grid Card (High CTR Monetization) ───
function nativeSponsoredCardHtml(index) {
  const ad = adsConfig.inContentAd || adsConfig.headerAd || {
    title: 'Watch Latest Blockbusters with Ultra-Fast 1Gbps Fiber Broadband',
    sponsor: 'Official Speed Partner',
    link: 'https://www.netflix.com',
    bannerImg: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80'
  };

  return `
    <article class="poster-card native-sponsored-card">
      <a class="poster-link" href="${ad.link}" target="_blank" rel="noopener noreferrer">
        <span class="poster-frame">
          <img src="${ad.bannerImg}" alt="${ad.title}" width="200" height="300" loading="lazy" class="poster-img native-ad-img" onerror="this.style.display='none'" />
          <span class="native-ad-badge">★ SPONSORED</span>
          <span class="poster-genre">${ad.sponsor || 'Official Partner'}</span>
        </span>
        <span class="poster-title native-ad-title">${ad.title}</span>
        <span class="native-ad-cta">Visit Sponsor &amp; Stream →</span>
      </a>
    </article>
  `;
}

// ─── Render Movie Poster Card ───
function movieCardHtml(m) {
  const ott = getOTTStatus(m);
  const posterUrl = getMoviePoster(m);
  const fallbackSvg = createCinematicPosterSvg(m.title, m.year, m.language);

  return `
    <article class="poster-card">
      <a class="poster-link" href="/movie.html?slug=${m.slug}">
        <span class="poster-frame">
          <img src="${posterUrl}" alt="${m.title}" width="200" height="300" loading="lazy" decoding="async" class="poster-img" onerror="this.onerror=null; this.src='${fallbackSvg}';" />
          <span class="poster-year">${m.year}</span>
          <span class="poster-rating">★ ${m.rating ? m.rating.toFixed(1) : '8.0'}</span>
          <span class="poster-genre">${m.genre}</span>
        </span>
        <span class="poster-title">${m.title}</span>
        <span class="poster-submeta">${m.language} · ${m.runtime || '150 min'}</span>
        <span class="poster-ott ${ott.class}">
          ${ott.available ? '● ' + m.ottPlatform : ott.text.includes('Coming') ? '○ Coming Soon' : '🎬 Theatrical'}
        </span>
      </a>
    </article>
  `;
}

// ─── Render Catalog Grid ───
function renderGrid() {
  if (!moviesGrid) return;

  const filtered = getFilteredMovies();
  updateCategorySeo(filtered.length);

  if (filtered.length === 0) {
    moviesGrid.innerHTML = '';
    if (noResultsBox) noResultsBox.hidden = false;
    if (paginationRow) paginationRow.style.display = 'none';
    return;
  }

  if (noResultsBox) noResultsBox.hidden = true;

  const toDisplay = filtered.slice(0, visibleLimit);
  let html = '';

  toDisplay.forEach((m, idx) => {
    html += movieCardHtml(m);
    // Insert native high-CTR sponsored card every 8 items
    if ((idx + 1) % 8 === 0 && (idx + 1) < toDisplay.length) {
      html += nativeSponsoredCardHtml(idx + 1);
    }
  });

  moviesGrid.innerHTML = html;

  // Manage "Load More" button visibility
  if (paginationRow) {
    if (visibleLimit < filtered.length) {
      paginationRow.style.display = 'flex';
      if (btnLoadMore) {
        btnLoadMore.querySelector('span').textContent = `Load More Movies (${filtered.length - visibleLimit} remaining) ↓`;
      }
    } else {
      paginationRow.style.display = 'none';
    }
  }
}

// ─── Render Display Ad Slots ───
function renderAdSlots() {
  const headerAdSlot = document.getElementById('header-ad-slot');
  if (headerAdSlot && adsConfig.headerAd && adsConfig.headerAd.enabled) {
    headerAdSlot.innerHTML = `
      <div class="ad-leaderboard-banner">
        <span class="ad-label-pill">ADVERTISEMENT</span>
        <a href="${adsConfig.headerAd.link}" target="_blank" rel="noopener noreferrer" class="ad-banner-anchor">
          <img src="${adsConfig.headerAd.bannerImg}" alt="${adsConfig.headerAd.title}" class="ad-banner-img" />
          <div class="ad-banner-overlay">
            <span class="ad-sponsor-tag">${adsConfig.headerAd.sponsor}</span>
            <strong class="ad-title-tag">${adsConfig.headerAd.title}</strong>
          </div>
        </a>
      </div>
    `;
    headerAdSlot.style.display = 'block';
  }

  const bottomAdSlot = document.getElementById('bottom-ad-slot');
  if (bottomAdSlot && adsConfig.inContentAd && adsConfig.inContentAd.enabled) {
    bottomAdSlot.innerHTML = `
      <div class="in-content-ad-link-wrap">
        <span class="ad-label-pill">SPONSORED PROMOTION</span>
        <a href="${adsConfig.inContentAd.link}" target="_blank" rel="noopener noreferrer" class="in-content-ad-link">
          <img src="${adsConfig.inContentAd.bannerImg}" alt="${adsConfig.inContentAd.title}" class="in-content-ad-img" />
          <div class="in-content-ad-overlay">
            <div>
              <span class="in-content-ad-tag">${adsConfig.inContentAd.sponsor}</span>
              <div class="in-content-ad-title">${adsConfig.inContentAd.title}</div>
            </div>
            <span class="in-content-ad-btn">Watch in 4K →</span>
          </div>
        </a>
      </div>
    `;
    bottomAdSlot.style.display = 'block';
  }
}

// ─── Bind Filter Events ───
function setupEvents() {
  // Language Pills
  const langPillsWrap = document.getElementById('lang-filter-pills');
  if (langPillsWrap) {
    langPillsWrap.addEventListener('click', e => {
      const btn = e.target.closest('.filter-pill');
      if (!btn) return;
      langPillsWrap.querySelectorAll('.filter-pill').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      selectedLang = btn.dataset.lang;
      visibleLimit = 24;
      updateUrlState();
      renderGrid();
    });
  }

  // Genre Pills
  const genrePillsWrap = document.getElementById('genre-filter-pills');
  if (genrePillsWrap) {
    genrePillsWrap.addEventListener('click', e => {
      const btn = e.target.closest('.genre-pill');
      if (!btn) return;
      genrePillsWrap.querySelectorAll('.genre-pill').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      selectedGenre = btn.dataset.genre;
      visibleLimit = 24;
      updateUrlState();
      renderGrid();
    });
  }

  // Selects
  if (filterYear) {
    filterYear.addEventListener('change', () => {
      selectedYear = filterYear.value;
      visibleLimit = 24;
      updateUrlState();
      renderGrid();
    });
  }

  if (filterOtt) {
    filterOtt.addEventListener('change', () => {
      selectedOtt = filterOtt.value;
      visibleLimit = 24;
      updateUrlState();
      renderGrid();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      selectedSort = sortSelect.value;
      renderGrid();
    });
  }

  // Quick Search within Category
  if (quickSearchInput) {
    let debounceTimer = null;
    quickSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchQuery = quickSearchInput.value;
        visibleLimit = 24;
        renderGrid();
      }, 200);
    });
  }

  // Clear / Reset Filters
  function resetAll() {
    selectedLang = 'all';
    selectedGenre = 'all';
    selectedYear = 'all';
    selectedOtt = 'all';
    selectedSort = 'latest';
    searchQuery = '';
    visibleLimit = 24;

    if (quickSearchInput) quickSearchInput.value = '';
    if (filterYear) filterYear.value = 'all';
    if (filterOtt) filterOtt.value = 'all';
    if (sortSelect) sortSelect.value = 'latest';

    document.querySelectorAll('#lang-filter-pills .filter-pill').forEach(b => {
      const isAll = b.dataset.lang === 'all';
      b.classList.toggle('active', isAll);
      b.setAttribute('aria-selected', String(isAll));
    });

    document.querySelectorAll('#genre-filter-pills .genre-pill').forEach(b => {
      const isAll = b.dataset.genre === 'all';
      b.classList.toggle('active', isAll);
      b.setAttribute('aria-selected', String(isAll));
    });

    window.history.pushState({}, '', '/category.html');
    renderGrid();
  }

  if (btnClearFilters) btnClearFilters.addEventListener('click', resetAll);
  if (btnResetEmpty) btnResetEmpty.addEventListener('click', resetAll);

  // Load More Button
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      visibleLimit += 24;
      renderGrid();
    });
  }

  // Mobile Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      primaryNav.classList.toggle('nav-open');
    });
  }

  // Global Search Modal
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
        m.genre.toLowerCase().includes(q)
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
              <img src="${getMoviePoster(m)}" alt="${m.title}" class="search-result-thumb" onerror="this.onerror=null; this.src='${createCinematicPosterSvg(m.title, m.year, m.language)}'" />
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

  // Legal / Terms & DMCA Modal
  const legalModal = document.getElementById('legal-modal');
  const legalClose = document.getElementById('legal-modal-close');
  const legalAccept = document.getElementById('legal-modal-accept');

  function openLegal(e) {
    if (e) e.preventDefault();
    if (legalModal) legalModal.showModal();
  }

  document.querySelectorAll('.footer-legal-btn').forEach(btn => {
    btn.addEventListener('click', openLegal);
  });
  if (legalClose && legalModal) legalClose.addEventListener('click', () => legalModal.close());
  if (legalAccept && legalModal) legalAccept.addEventListener('click', () => legalModal.close());
  if (legalModal) {
    legalModal.addEventListener('click', e => {
      if (e.target === legalModal) legalModal.close();
    });
    if (legalModal.open) legalModal.close();
  }
}

function updateUrlState() {
  const p = new URLSearchParams();
  if (selectedLang !== 'all') p.set('lang', selectedLang);
  if (selectedGenre !== 'all') p.set('genre', selectedGenre);
  if (selectedYear !== 'all') p.set('year', selectedYear);
  if (selectedOtt !== 'all') p.set('ott', selectedOtt);
  const qStr = p.toString();
  const newUrl = qStr ? `/category.html?${qStr}` : '/category.html';
  window.history.replaceState({}, '', newUrl);
}

// Kickoff
initFromUrl();
setupEvents();
renderAdSlots();
renderGrid();


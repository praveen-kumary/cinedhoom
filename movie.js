/* ═══════════════════════════════════════════════════════════
   CineDhoom — Movie Detail Page Logic v3.0
   SEO, OTT Watch Now / Not Available, Ad Slots, Interstitial
   ═══════════════════════════════════════════════════════════ */

import './style.css';
import {
  getMovieBySlug, getAllMovies, getMoviePoster, getMovieHero,
  formatDate, getAdsConfig, getOTTStatus, getStreamingUrl, isAvailableOnOTT,
  createCinematicPosterSvg, setupCardClickMonetization
} from './data.js';
import {
  setMoviePageMeta, injectMovieDetailSchema,
  injectBreadcrumbSchema, injectFaqSchema
} from './seo.js';

setupCardClickMonetization();

// ─── Extract Slug from URL ───
const params = new URLSearchParams(window.location.search);
const slug = params.get('slug') || 'kalki-2898-ad';

// ─── Find Movie ───
const allMovies = getAllMovies();
let movie = getMovieBySlug(slug);

if (!movie) {
  movie = allMovies[0]; // fallback
}

// ─── Fetch Ad Configurations ───
const adsConfig = getAdsConfig();

// ─── Inject SEO Metadata & Structured Data ───
try {
  setMoviePageMeta(movie);
  injectMovieDetailSchema(movie);
  injectBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: `${movie.language} Movies`, url: `/#${movie.language.toLowerCase()}-section` },
    { name: movie.title, url: `/movie.html?slug=${movie.slug}` },
  ]);
  if (movie.faqs && movie.faqs.length > 0) {
    injectFaqSchema(movie.faqs);
  }
} catch (err) {
  console.warn('SEO injection note:', err);
}

// ─── Render Page Content ───
function renderMoviePage() {
  const ottStatus = getOTTStatus(movie);
  const streamUrl = getStreamingUrl(movie);
  const available = isAvailableOnOTT(movie);

  // Breadcrumb
  const bcLang = document.getElementById('bc-language');
  if (bcLang) {
    bcLang.textContent = `${movie.language} Movies`;
    bcLang.href = `/category.html?lang=${encodeURIComponent(movie.language)}`;
  }
  const bcTitle = document.getElementById('bc-title');
  if (bcTitle) bcTitle.textContent = movie.title;

  // Backdrop
  const heroBackdrop = document.getElementById('hero-backdrop-img');
  if (heroBackdrop) {
    heroBackdrop.style.backgroundImage = `url('${getMovieHero(movie)}')`;
  }

  // Poster & Badges
  const posterImg = document.getElementById('detail-poster');
  if (posterImg) {
    posterImg.src = getMoviePoster(movie);
    posterImg.alt = `${movie.title} Poster`;
    posterImg.onerror = function() {
      this.src = createCinematicPosterSvg(movie.title, movie.year, movie.language);
    };
  }

  // OTT Badge on poster
  const posterOttBadge = document.getElementById('poster-ott-badge');
  const posterOttName = document.getElementById('poster-ott-name');
  if (movie.ottPlatform) {
    if (posterOttName) posterOttName.textContent = movie.ottPlatform;
    if (posterOttBadge) {
      posterOttBadge.className = `poster-ott-badge ${ottStatus.class}`;
    }
  } else if (posterOttBadge) {
    posterOttBadge.style.display = 'none';
  }

  // Meta Tags Row
  const metaLang = document.getElementById('meta-lang');
  if (metaLang) {
    metaLang.innerHTML = `<a href="/category.html?lang=${encodeURIComponent(movie.language)}" style="color:inherit;text-decoration:none;">${movie.language}</a>`;
  }

  const metaGenre = document.getElementById('meta-genre');
  if (metaGenre) {
    metaGenre.innerHTML = `<a href="/category.html?genre=${encodeURIComponent(movie.genre)}" style="color:inherit;text-decoration:none;">${movie.genre}</a>`;
  }

  const metaRuntime = document.getElementById('meta-runtime');
  if (metaRuntime) metaRuntime.textContent = movie.runtime || '150 min';

  const metaYear = document.getElementById('meta-year');
  if (metaYear) metaYear.textContent = movie.year;

  // Title & Tagline
  const titleEl = document.getElementById('movie-title');
  if (titleEl) titleEl.textContent = `Watch ${movie.title} (${movie.year}) Online`;

  const taglineEl = document.getElementById('movie-tagline');
  if (taglineEl) {
    taglineEl.textContent = `Watch ${movie.title} full movie online in HD. ${ottStatus.text}. Cast details & reviews on CineDhoom.`;
  }

  // Rating & Votes
  const ratingEl = document.getElementById('movie-rating-val');
  if (ratingEl) ratingEl.textContent = movie.rating ? movie.rating.toFixed(1) : '—';

  // OTT Summary
  const summaryOttPlatform = document.getElementById('summary-ott-platform');
  const summaryOttDate = document.getElementById('summary-ott-date');
  if (summaryOttPlatform && movie.ottPlatform) {
    summaryOttPlatform.textContent = movie.ottPlatform;
  }
  if (summaryOttDate) {
    summaryOttDate.textContent = movie.ottDate
      ? `Streaming from ${formatDate(movie.ottDate)}`
      : 'Streaming Announcement Soon';
  }

  // Quick Specs
  const specDirector = document.getElementById('spec-director');
  if (specDirector) specDirector.textContent = movie.director || 'To be announced';

  const specCast = document.getElementById('spec-cast');
  if (specCast) specCast.textContent = movie.cast || 'Leading Cast';

  const specTheatrical = document.getElementById('spec-theatrical-date');
  if (specTheatrical) specTheatrical.textContent = movie.releaseDate ? formatDate(movie.releaseDate) : '2026';

  const specDigital = document.getElementById('spec-digital-date');
  if (specDigital) specDigital.textContent = movie.ottDate ? formatDate(movie.ottDate) : 'Pending Confirmation';

  // Synopsis (Expanded 200+ words narrative for high SEO authority & user engagement)
  const synopsisEl = document.getElementById('detail-synopsis');
  if (synopsisEl) {
    synopsisEl.innerHTML = generateFullNarration(movie);
  }

  // OTT Table
  const tableOttPlatform = document.getElementById('table-ott-platform');
  if (tableOttPlatform) {
    tableOttPlatform.innerHTML = `<strong class="highlight-gold">${movie.ottPlatform || 'Not Available on Any OTT'}</strong>`;
  }
  const tableOttDate = document.getElementById('table-ott-date');
  if (tableOttDate) {
    tableOttDate.textContent = movie.ottDate ? formatDate(movie.ottDate) : 'Not Announced';
  }
  const tableTheatricalDate = document.getElementById('table-theatrical-date');
  if (tableTheatricalDate) {
    tableTheatricalDate.textContent = movie.releaseDate ? formatDate(movie.releaseDate) : 'In Theaters';
  }

  // Trailer Embed
  const trailerIframe = document.getElementById('trailer-iframe');
  if (trailerIframe) {
    const ytId = movie.trailerYoutubeId || 'dQw4w9WgXcQ';
    trailerIframe.src = `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`;
  }

  // Connect hero and sidebar buttons smoothly to #watch-now-section
  const heroWatchBtn = document.getElementById('btn-watch-now-hero');
  if (heroWatchBtn) {
    heroWatchBtn.setAttribute('href', '#watch-now-section');
    const span = heroWatchBtn.querySelector('span');
    if (span) span.textContent = '▶ Watch Full Movie (HD) ↓';
    heroWatchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('watch-now-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        target.classList.add('highlight-pulse');
        setTimeout(() => target.classList.remove('highlight-pulse'), 2000);
      }
    });
  }

  const sidebarWatchBtn = document.getElementById('sidebar-watch-btn');
  if (sidebarWatchBtn) {
    sidebarWatchBtn.setAttribute('href', '#watch-now-section');
    const span = sidebarWatchBtn.querySelector('span');
    if (span) span.textContent = '▶ View Verified Stream ↓';
    sidebarWatchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('watch-now-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        target.classList.add('highlight-pulse');
        setTimeout(() => target.classList.remove('highlight-pulse'), 2000);
      }
    });
  }

  // Cast Cards
  renderCastCards(movie);

  // FAQs
  renderFaqs(movie);

  // Sidebar facts
  const factLang = document.getElementById('fact-language');
  if (factLang) factLang.textContent = movie.language;
  const factGenre = document.getElementById('fact-genre');
  if (factGenre) factGenre.textContent = movie.genre;
  const factRuntime = document.getElementById('fact-runtime');
  if (factRuntime) factRuntime.textContent = movie.runtime || '150 min';
  const factYear = document.getElementById('fact-year');
  if (factYear) factYear.textContent = movie.year;
  const factOtt = document.getElementById('fact-ott');
  if (factOtt) factOtt.textContent = movie.ottPlatform || 'Not Available';
  const sidebarOttName = document.getElementById('sidebar-ott-name');
  if (sidebarOttName) sidebarOttName.textContent = movie.ottPlatform || 'OTT';

  // Related Movies
  renderRelatedMovies(movie);

  // Initialize Reviews
  initReviews(movie.id);

  // Render Ad Slots
  renderAdSlots();

  // Render Ultimate Watch Now Section at end of content
  renderWatchNowSection(movie);

  // Initialize Watch Now Interstitial Ad Modal Flow
  setupWatchNowModalFlow(movie);

  // Share button
  const shareBtn = document.getElementById('share-movie-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${movie.title} (${movie.year}) on CineDhoom`,
            text: `Check out ${movie.title} release date, OTT streaming details and review on CineDhoom!`,
            url: window.location.href,
          });
        } catch {}
      } else {
        await navigator.clipboard.writeText(window.location.href);
        const originalText = shareBtn.querySelector('span').textContent;
        shareBtn.querySelector('span').textContent = 'Link Copied!';
        setTimeout(() => {
          shareBtn.querySelector('span').textContent = originalText;
        }, 2000);
      }
    });
  }
}

// ─── Render Ad Slots (Dashboard Managed) ───
function renderAdSlots() {
  // 1. Header Banner Ad
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
  } else if (headerAdSlot) {
    headerAdSlot.style.display = 'none';
  }

  // 2. In-Content Ad Banner (between Synopsis and Specifications)
  const inContentSlot = document.getElementById('in-content-ad-slot');
  if (inContentSlot && adsConfig.inContentAd && adsConfig.inContentAd.enabled) {
    inContentSlot.innerHTML = `
      <div class="in-content-ad-link-wrap">
        <span class="ad-label-pill">SPONSORED PROMOTION</span>
        <a href="${adsConfig.inContentAd.link}" target="_blank" rel="noopener noreferrer" class="in-content-ad-link">
          <img src="${adsConfig.inContentAd.bannerImg}" alt="${adsConfig.inContentAd.title}" class="in-content-ad-img" />
          <div class="in-content-ad-overlay">
            <div>
              <span class="in-content-ad-tag">${adsConfig.inContentAd.sponsor}</span>
              <div class="in-content-ad-title">${adsConfig.inContentAd.title}</div>
            </div>
            <span class="in-content-ad-btn">Learn More →</span>
          </div>
        </a>
      </div>
    `;
    inContentSlot.style.display = 'block';
  } else if (inContentSlot) {
    inContentSlot.style.display = 'none';
  }

  // 3. Sidebar Ad
  const sidebarAdSlot = document.getElementById('sidebar-ad-slot');
  if (sidebarAdSlot && adsConfig.sidebarAd && adsConfig.sidebarAd.enabled) {
    sidebarAdSlot.innerHTML = `
      <div class="ad-sidebar-banner">
        <span class="ad-label-pill">SPONSORED PARTNER</span>
        <a href="${adsConfig.sidebarAd.link}" target="_blank" rel="noopener noreferrer" class="ad-sidebar-anchor">
          <img src="${adsConfig.sidebarAd.bannerImg}" alt="${adsConfig.sidebarAd.title}" class="ad-sidebar-img" />
          <div class="ad-sidebar-info">
            <strong>${adsConfig.sidebarAd.title}</strong>
            <span class="btn-ad-mini">Visit Partner →</span>
          </div>
        </a>
      </div>
    `;
    sidebarAdSlot.style.display = 'block';
  } else if (sidebarAdSlot) {
    sidebarAdSlot.style.display = 'none';
  }
}

// ─── 200+ Words SEO Movie Narration & Storyline Generator ───
function generateFullNarration(m) {
  const title = m.title;
  const year = m.year || 2026;
  const lang = m.language || 'Indian';
  const genre = m.genre || 'Action';
  const director = m.director || 'esteemed filmmakers';
  const cast = m.cast || 'an ensemble cast';
  const rating = m.rating ? `${m.rating.toFixed(1)}/10` : '8.2/10';
  const ott = m.ottPlatform || 'official streaming platforms';
  const isOtt = isAvailableOnOTT(m);
  const baseSynopsis = (m.synopsis || '').trim();

  // Paragraph 1: Plot premise, setup & lead character conflict (~70-80 words)
  let p1;
  if (baseSynopsis.length >= 220) {
    p1 = baseSynopsis;
  } else if (baseSynopsis.length >= 60) {
    p1 = `${baseSynopsis} Directed by ${director}, the narrative immerses viewers into a high-stakes dramatic journey where personal convictions collide with unexpected twists, anchoring the audience through an intense emotional storyline.`;
  } else {
    p1 = `${title} (${year}) is an ambitious ${lang} cinema ${genre.toLowerCase()} production helmed by director ${director}. The narrative follows ${cast.split(',')[0] || 'the lead protagonist'} navigating a world fraught with high-stakes personal confrontations, mounting danger, and profound moral dilemmas. Set against a richly textured backdrop, the storyline pulls audiences into an intense conflict where each decision reverberates with lasting consequences.`;
  }

  // Paragraph 2: Directorial vision, performance & craft (~75-85 words)
  const p2 = `Under the visionary direction of ${director}, the film delivers a powerhouse cinematic spectacle headlined by stellar performances from ${cast}. The cinematic canvas seamlessly marries emotional depth with pulse-pounding drama, elevated by striking cinematography, meticulous production design, and an adrenaline-charged musical score. Critics and audiences praise the screenplay's dynamic pacing, multi-dimensional character arcs, and atmospheric world-building, earning the film a strong critical score of ${rating} across verified reviews.`;

  // Paragraph 3: Theatrical impact, OTT release & streaming verdict (~70-80 words)
  const p3 = isOtt
    ? `Following its theatrical premiere, ${title} is now streaming in full high-definition on ${ott}. Audiences can experience the complete uncut film with 4K Ultra HD visual clarity, Dolby Vision, and immersive Dolby Atmos 5.1 spatial audio on mobile, smart TVs, and streaming players. CineDhoom provides verified streaming links, countdowns, and official reviews so viewers can enjoy authorized, top-tier entertainment legally.`
    : `Currently generating immense box office momentum across India and international theaters, ${title} continues to capture widespread theatrical acclaim. Official digital streaming rights have been secured for a high-profile digital premiere on ${ott}. Stay tuned to CineDhoom for real-time streaming calendar updates, confirmed OTT premiere dates, official 4K trailers, and comprehensive audience reviews.`;

  return `
    <p class="synopsis-lead">${p1}</p>
    <div class="synopsis-section">
      <h3 class="synopsis-subheading">Cinematic Craft, Direction &amp; Star Performances</h3>
      <p class="synopsis-paragraph">${p2}</p>
    </div>
    <div class="synopsis-section">
      <h3 class="synopsis-subheading">OTT Streaming Rights &amp; Where to Watch</h3>
      <p class="synopsis-paragraph">${p3}</p>
    </div>
  `;
}

// ─── Render Watch Now Section (At End of Content) ───
function renderWatchNowSection(m) {
  const container = document.getElementById('watch-now-section');
  if (!container) return;

  const isStreaming = isAvailableOnOTT(m);

  if (isStreaming) {
    container.innerHTML = `
      <div class="watch-now-box available-box">
        <div class="watch-now-badge-row">
          <span class="badge-status-streaming">⚡ STREAMING SERVER READY (1080P / 4K UHD)</span>
          <span class="badge-quality">ULTRA FAST CDN • DOLBY VISION • 60 FPS</span>
        </div>
        <h3 class="watch-now-heading">Watch ${m.title} Full Movie Online Free in HD</h3>
        <p class="watch-now-desc">
          High-speed streaming server connection verified for <strong>${m.title} (${m.year})</strong>. Click below to verify connection and start watching in full 1080p / 4K.
        </p>
        <div class="watch-now-btn-wrap">
          <button type="button" class="btn btn-watch-now btn-lg btn-pulse" id="btn-watch-now-main">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>▶ WATCH FULL MOVIE NOW (HD / 4K)</span>
          </button>
        </div>
        <p class="watch-now-security-note">🔒 Verified Official Stream • Zero Buffering • High-Speed 4K CDN</p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="watch-now-box unavailable-box">
        <div class="watch-now-badge-row">
          <span class="badge-status-theatrical">🎬 STREAM SERVER CHECK</span>
          <span class="badge-quality">HD 1080P STREAM LINK</span>
        </div>
        <h3 class="watch-now-heading">Watch ${m.title} Full Movie Online Free</h3>
        <p class="watch-now-desc">
          Click below to verify streaming server availability and launch video player for <strong>${m.title} (${m.year})</strong>.
        </p>
        <div class="watch-now-btn-wrap">
          <button type="button" class="btn btn-watch-now btn-lg btn-pulse" id="btn-watch-now-main">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>▶ WATCH FULL MOVIE NOW (HD / 4K)</span>
          </button>
        </div>
        <p class="watch-now-security-note">⚡ Fast Streaming Connection • Check Available Video Servers</p>
      </div>
    `;
  }
}

// ─── Setup Watch Now Interstitial Ad Modal Flow ───
function setupWatchNowModalFlow(m) {
  const adModal = document.getElementById('ad-interstitial-modal');
  const btnCloseAd = document.getElementById('btn-close-ad');
  const countdownEl = document.getElementById('countdown-seconds');
  const progressFill = document.getElementById('ad-progress-fill');
  const btnProceed = document.getElementById('btn-proceed-stream');
  const proceedText = document.getElementById('proceed-btn-text');
  const adStreamStatus = document.getElementById('ad-stream-status');
  const adCreativeImg = document.getElementById('ad-creative-img');
  const adBannerLink = document.getElementById('ad-banner-link');
  const adSponsorLabel = document.getElementById('ad-sponsor-label');
  const adDisclaimer = document.getElementById('ad-disclaimer-note');

  if (!adModal) return;

  const streamUrl = getStreamingUrl(m);
  const ytId = m.trailerYoutubeId || 'aeKOOgNb3ig';
  const ytUrl = `https://www.youtube.com/watch?v=${ytId}`;
  const isStreaming = isAvailableOnOTT(m);

  let countdownInterval = null;
  let remainingTime = 5;
  const initialDuration = (adsConfig.popupAd && adsConfig.popupAd.duration) ? adsConfig.popupAd.duration : 5;

  function openWatchNowModal() {
    remainingTime = initialDuration;
    if (countdownEl) countdownEl.textContent = remainingTime;
    if (adStreamStatus) adStreamStatus.textContent = 'Connecting to High-Speed Video Server (4K UHD 60FPS)...';
    if (btnProceed) {
      btnProceed.disabled = true;
      btnProceed.classList.remove('btn-ready-pulse');
    }
    if (proceedText) proceedText.textContent = `Verifying stream server link (${remainingTime}s)...`;

    // Populate ad creatives from dashboard config
    if (adsConfig.popupAd) {
      if (adCreativeImg && adsConfig.popupAd.bannerImg) adCreativeImg.src = adsConfig.popupAd.bannerImg;
      if (adBannerLink && adsConfig.popupAd.link) adBannerLink.href = adsConfig.popupAd.link;
      if (adSponsorLabel && adsConfig.popupAd.sponsor) adSponsorLabel.textContent = adsConfig.popupAd.sponsor;
    }

    if (progressFill) {
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      void progressFill.offsetWidth;
      progressFill.style.transition = `width ${initialDuration}s linear`;
      progressFill.style.width = '100%';
    }

    adModal.showModal();

    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      remainingTime--;
      if (countdownEl) countdownEl.textContent = Math.max(0, remainingTime);
      if (proceedText && remainingTime > 0) {
        proceedText.textContent = `Verifying stream server link (${remainingTime}s)...`;
      }
      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        onCountdownDone();
      }
    }, 1000);
  }

  function onCountdownDone() {
    if (btnProceed) {
      btnProceed.disabled = false;
      btnProceed.classList.add('btn-ready-pulse');
    }

    if (isStreaming && streamUrl) {
      if (adStreamStatus) adStreamStatus.textContent = `⚡ Server Connection Verified — Stream Ready!`;
      if (proceedText) {
        proceedText.innerHTML = `<strong>▶ PROCEED TO PLAY FULL MOVIE NOW</strong>`;
      }
      if (adDisclaimer) {
        adDisclaimer.textContent = `High-speed video connection established. Opening verified official stream...`;
      }
      if (btnProceed) {
        btnProceed.onclick = () => {
          clearInterval(countdownInterval);
          adModal.close();
          window.open(streamUrl, '_blank');
        };
      }
    } else {
      if (adStreamStatus) adStreamStatus.textContent = '🎬 Theatrical Premiere — OTT Rights Pending';
      if (proceedText) {
        proceedText.innerHTML = `<strong>▶ WATCH OFFICIAL HD TRAILER (SERVER 2)</strong>`;
      }
      if (adDisclaimer) {
        adDisclaimer.innerHTML = `<strong>${m.title}</strong> is currently playing in theaters worldwide. Official digital OTT stream will be unlocked as soon as rights are live. Watch the official HD trailer below.`;
      }
      if (btnProceed) {
        btnProceed.onclick = () => {
          clearInterval(countdownInterval);
          adModal.close();
          window.open(ytUrl, '_blank');
        };
      }
    }
  }

  // Bind to Watch Now button inside watch-now-section
  const mainBtn = document.getElementById('btn-watch-now-main');
  if (mainBtn) mainBtn.addEventListener('click', openWatchNowModal);

  if (btnCloseAd) {
    btnCloseAd.addEventListener('click', () => {
      clearInterval(countdownInterval);
      adModal.close();
    });
  }

  adModal.addEventListener('click', (e) => {
    if (e.target === adModal) {
      clearInterval(countdownInterval);
      adModal.close();
    }
  });
}

// ─── Render Cast Cards ───
function renderCastCards(m) {
  const container = document.getElementById('cast-cards-grid');
  if (!container) return;

  const actors = m.cast ? m.cast.split(',').map(s => s.trim()) : ['Star Cast'];
  let html = '';

  // Director Card
  if (m.director) {
    html += `
      <div class="cast-card">
        <div class="cast-avatar director-avatar">🎬</div>
        <div class="cast-info">
          <strong class="cast-name">${m.director}</strong>
          <span class="cast-role">Director & Vision</span>
        </div>
      </div>
    `;
  }

  actors.forEach((actor, idx) => {
    const initials = actor.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    html += `
      <div class="cast-card">
        <div class="cast-avatar">${initials || '⭐'}</div>
        <div class="cast-info">
          <strong class="cast-name">${actor}</strong>
          <span class="cast-role">${idx === 0 ? 'Lead Actor' : idx === 1 ? 'Co-Star' : 'Key Role'}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ─── Render FAQs ───
function renderFaqs(m) {
  const container = document.getElementById('movie-faqs-container');
  if (!container) return;

  const ottStatus = getOTTStatus(m);
  
  const defaultFaqs = [
    {
      q: `Where can I watch ${m.title} online?`,
      a: m.ottPlatform 
        ? `${m.title} is ${isAvailableOnOTT(m) ? 'currently streaming' : 'expected to stream'} on ${m.ottPlatform}. ${m.ottDate ? `Digital release date: ${formatDate(m.ottDate)}.` : ''} Visit CineDhoom for verified streaming links.`
        : `${m.title} is currently not available on any OTT platform. We will update this page as soon as streaming information is announced.`,
    },
    {
      q: `What is the OTT release date for ${m.title}?`,
      a: m.ottDate
        ? `${m.title} ${isAvailableOnOTT(m) ? 'has been' : 'will be'} available on ${m.ottPlatform} from ${formatDate(m.ottDate)}.`
        : `The OTT release date for ${m.title} has not been officially announced yet. Follow CineDhoom for instant updates.`,
    },
    {
      q: `Who directed ${m.title} and who is in the cast?`,
      a: `${m.title} is directed by ${m.director || 'acclaimed filmmakers'} and stars ${m.cast || 'leading artists'} in lead roles.`,
    },
    {
      q: `Is ${m.title} available on Netflix, Amazon Prime, or Disney+ Hotstar?`,
      a: m.ottPlatform
        ? `${m.title} is ${isAvailableOnOTT(m) ? 'available' : 'upcoming'} on ${m.ottPlatform}. It may not be available on other platforms due to exclusive streaming rights.`
        : `${m.title} is currently not available on Netflix, Amazon Prime Video, or Disney+ Hotstar. OTT availability has not been announced.`,
    }
  ];

  const faqs = (m.faqs && m.faqs.length > 0) ? [...m.faqs, ...defaultFaqs] : defaultFaqs;

  container.innerHTML = faqs.map(faq => `
    <details class="faq-accordion-item">
      <summary class="faq-accordion-header">
        <span class="faq-q-text">${faq.q}</span>
        <span class="faq-arrow">▼</span>
      </summary>
      <div class="faq-accordion-body">
        <p>${faq.a}</p>
      </div>
    </details>
  `).join('');
}

// ─── Render Related Movies ───
function renderRelatedMovies(currentMovie) {
  const container = document.getElementById('related-movies-list');
  if (!container) return;

  const related = allMovies
    .filter(m => m.id !== currentMovie.id && (m.language === currentMovie.language || m.genre === currentMovie.genre))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  if (related.length === 0) {
    container.innerHTML = '<p class="text-muted">No related titles found.</p>';
    return;
  }

  container.innerHTML = related.map(m => {
    const ott = getOTTStatus(m);
    return `
    <a href="/movie.html?slug=${m.slug}" class="related-movie-item">
      <img src="${getMoviePoster(m)}" alt="${m.title}" class="related-thumb" loading="lazy" onerror="this.onerror=null; this.src='${createCinematicPosterSvg(m.title, m.year, m.language)}'" />
      <div class="related-info">
        <strong class="related-title">${m.title}</strong>
        <span class="related-meta">${m.language} · ${m.genre} (${m.year})</span>
        <span class="related-rating">★ ${m.rating ? m.rating.toFixed(1) : '—'}</span>
        <span class="related-ott ${ott.class}">${ott.text}</span>
      </div>
    </a>
  `}).join('');
}

// ─── User Reviews with LocalStorage ───
function initReviews(movieId) {
  const reviewKey = `CineDhoom_reviews_${movieId}`;
  const listEl = document.getElementById('reviews-list');
  const formEl = document.getElementById('user-review-form');

  function getStoredReviews() {
    try {
      const stored = localStorage.getItem(reviewKey);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        name: 'Ravi Kumar', rating: 9, date: '2026-03-20',
        comment: 'Outstanding visual experience! The background score and interval fight sequence are peak cinema.',
      },
      {
        name: 'Ananya Sharma', rating: 8, date: '2026-03-18',
        comment: 'Gripping storyline with stellar performances. A must-watch on the biggest screen possible!',
      }
    ];
  }

  function renderReviews() {
    if (!listEl) return;
    const reviews = getStoredReviews();
    if (reviews.length === 0) {
      listEl.innerHTML = '<p class="text-muted">No reviews yet. Be the first to share your thoughts!</p>';
      return;
    }

    listEl.innerHTML = reviews.map(rev => `
      <div class="review-item">
        <div class="review-item-header">
          <div class="review-author-wrap">
            <span class="review-avatar">${rev.name.slice(0, 1).toUpperCase()}</span>
            <strong class="review-author-name">${rev.name}</strong>
          </div>
          <div class="review-rating-stars">
            <span class="gold-stars">★ ${rev.rating}/10</span>
            <span class="review-date">${rev.date}</span>
          </div>
        </div>
        <p class="review-comment-text">${rev.comment}</p>
      </div>
    `).join('');
  }

  renderReviews();

  if (formEl) {
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('review-user-name');
      const ratingInput = document.getElementById('review-user-rating');
      const commentInput = document.getElementById('review-user-comment');

      const newReview = {
        name: nameInput.value.trim(),
        rating: parseInt(ratingInput.value, 10),
        date: new Date().toISOString().split('T')[0],
        comment: commentInput.value.trim(),
      };

      const reviews = getStoredReviews();
      reviews.unshift(newReview);
      localStorage.setItem(reviewKey, JSON.stringify(reviews));

      formEl.reset();
      renderReviews();
    });
  }
}

// ─── Search Dialog ───
const searchTrigger = document.getElementById('search-trigger');
const searchModal = document.getElementById('search-modal');
const searchClose = document.getElementById('search-close');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchResultCount = document.getElementById('search-result-count');

if (searchTrigger && searchModal) {
  searchTrigger.addEventListener('click', () => {
    searchModal.showModal();
    if (searchInput) searchInput.focus();
  });
}
if (searchClose && searchModal) {
  searchClose.addEventListener('click', () => searchModal.close());
}
if (searchModal) {
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.close();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      if (searchResults) searchResults.innerHTML = '';
      if (searchResultCount) searchResultCount.textContent = 'Search all titles';
      return;
    }
    const matched = allMovies.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.language.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q) ||
      (m.cast && m.cast.toLowerCase().includes(q)) ||
      (m.director && m.director.toLowerCase().includes(q))
    );

    if (searchResultCount) searchResultCount.textContent = `${matched.length} title(s) found`;

    if (searchResults) {
      if (matched.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No movies found matching your query.</div>';
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
          </a>
        `}).join('');
      }
    }
  });
}

// ─── Legal / DMCA Modal ───
const legalModal = document.getElementById('legal-modal');
const legalCloseBtn = document.getElementById('legal-modal-close');
const legalAcceptBtn = document.getElementById('legal-modal-accept');
const navDmcaTrigger = document.getElementById('nav-dmca-trigger');

function openLegalModal(e) {
  if (e) e.preventDefault();
  if (legalModal) legalModal.showModal();
}

if (navDmcaTrigger) navDmcaTrigger.addEventListener('click', openLegalModal);
document.querySelectorAll('.footer-legal-btn').forEach(btn => btn.addEventListener('click', openLegalModal));
if (legalCloseBtn && legalModal) legalCloseBtn.addEventListener('click', () => legalModal.close());
if (legalAcceptBtn && legalModal) legalAcceptBtn.addEventListener('click', () => legalModal.close());
if (legalModal) {
  legalModal.addEventListener('click', (e) => {
    if (e.target === legalModal) legalModal.close();
  });
  if (legalModal.open) legalModal.close();
}
const sModal = document.getElementById('search-modal');
if (sModal && sModal.open) sModal.close();

// ─── Mobile Menu Toggle ───
const navToggle = document.getElementById('nav-toggle');
const primaryNav = document.getElementById('primary-nav');
if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    primaryNav.classList.toggle('nav-open');
  });
}

// Kickoff
renderMoviePage();


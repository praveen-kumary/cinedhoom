# CineDhoom

**Indian movie discovery platform with OTT tracking, reviews, and streaming guides.**

CineDhoom is a movie information directory that helps users discover movies across Telugu, Tamil, Kannada, Malayalam, Bollywood, and Hollywood, check OTT streaming availability, watch official trailers, and browse by genre or language. Think of it as an Indian-focused movie discovery engine with built-in OTT release tracking.

---

## What It Does

- **Browse by Language**: Horizontal scrollable rails for Telugu, Tamil, Kannada, Malayalam, Bollywood, Hollywood, and TV Shows/Web Series.
- **OTT Release Tracking**: Shows which platform a movie is streaming on (Netflix, Prime Video, Hotstar, Aha, ZEE5, SonyLIV, JioCinema, etc.) with direct "Watch Now" links.
- **Movie Detail Pages**: Full synopsis, cast, director, runtime, release date, rating, official YouTube trailer embed, and OTT availability status.
- **Search**: Full-text search across all 339+ titles, cast names, and genres with instant results.
- **Browse by Genre**: Action, Drama, Comedy, Romance, Thriller, Sci-Fi, Horror, Fantasy, Biography, Crime.
- **Admin Dashboard**: CRUD operations for managing the movie database, search/filter, stats overview, and ad placement configuration.
- **SEO Optimised**: JSON-LD structured data (Movie schema, FAQPage, BreadcrumbList, WebSite, Organization), Open Graph tags, Twitter Cards, canonical URLs, and long-tail keyword targeting.
- **DMCA Compliant**: Built-in legal pages, terms of service, anti-piracy statement, and DMCA takedown contact.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Build Tool | Vite 8 |
| Language | JavaScript (ES Modules) with TypeScript config |
| Styling | Vanilla CSS (3,300+ lines, custom design system) |
| Movie Data | 339+ real movies in a built-in database (7,500+ lines) |
| Poster/Hero Images | TMDB API (image CDN) |
| Trailers | YouTube embed (official trailers) |
| SEO | Custom SEO module with JSON-LD structured data |
| Deployment | Static site (Vite build) |

---

## Project Structure

```
cinedhoom/
+-- index.html              -> Homepage with spotlight hero and language rails
+-- movie.html              -> Movie detail page (dynamic, slug-based)
+-- category.html           -> Category/language listing page
+-- dashboard.html          -> Admin dashboard for managing movies
+-- legal.html              -> Legal center (Terms, DMCA, Privacy, Anti-Piracy)
+-- main.js                 -> Homepage controller (navigation, rails, search modal)
+-- movie.js                -> Movie detail page logic (SEO injection, OTT status)
+-- category.js             -> Category page filtering and rendering
+-- dashboard.js            -> Admin CRUD operations and stats
+-- data.js                 -> Data access layer (movies, OTT links, TMDB integration)
+-- movies-db.js            -> 339+ movie database (7,500+ lines)
+-- seo.js                  -> SEO utility module (JSON-LD, OG tags, meta)
+-- style.css               -> Full design system (3,384 lines)
+-- dashboard.css           -> Dashboard-specific styles
+-- public/                 -> Static assets
+-- src/                    -> Vite source entry
+-- vite.config.js          -> Multi-page Vite configuration
```

---

## Features in Detail

### Movie Database (339+ Titles)

Every movie entry includes:
- Title, slug, year, genre, language, and rating
- Full cast and director
- Runtime and theatrical release date
- OTT platform and OTT release date
- Full synopsis
- YouTube trailer ID
- TMDB poster and hero backdrop paths

Languages covered: Telugu, Tamil, Kannada, Malayalam, Bollywood (Hindi), Hollywood (English), and TV Shows/Web Series.

### OTT Platform Integration

The app tracks streaming availability across 10+ OTT platforms:
- Netflix, Amazon Prime Video, Disney+ Hotstar
- Aha Video, ZEE5, SonyLIV, JioCinema
- Paramount+, HBO Max, Peacock

Each movie shows a clear "Streaming on [Platform]" or "Not Yet on OTT" badge with direct links to the streaming page.

### SEO Module

A dedicated SEO utility module that injects:
- Movie schema (JSON-LD) with all structured fields for Google rich results
- FAQPage schema for common questions on each movie page
- BreadcrumbList for navigation context
- WebSite and Organization schemas on the homepage
- Open Graph and Twitter Card meta tags for social sharing
- Canonical URLs and hreflang attributes

### Admin Dashboard

A full management interface with:
- Total movie count, per-language breakdown, OTT availability stats, average rating
- Searchable and filterable movie table
- Add, edit, and delete movies
- Ad placement configuration
- Data reset to defaults

---

## Getting Started

### Prerequisites
- Node.js 18+

### Run Locally

```bash
git clone https://github.com/praveen-kumary/cinedhoom.git
cd cinedhoom
npm install
npm run dev
```

The site will be available at http://localhost:5173.

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder, ready for static hosting (Vercel, Netlify, Cloudflare Pages, etc.).

---

## Screenshots

The site features a dark cinematic theme with:
- Full-width spotlight hero section with backdrop images
- Horizontal scrollable poster rails (Netflix-style)
- Genre chip cloud for quick navigation
- Responsive card layout with poster frames and OTT badges
- Modal search with instant results

---

## License

MIT License. See the LICENSE file for details.

---

**Built for movie lovers who want to know where to watch, not where to pirate.**

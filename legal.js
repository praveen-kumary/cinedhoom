/* ═══════════════════════════════════════════════════════════
   CINEDHOOM — Legal & Compliance Controller
   Handles tab switching, URL syncing, and mobile navigation
   ═══════════════════════════════════════════════════════════ */

import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.legal-tab');
  const panels = document.querySelectorAll('.legal-panel');
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  // Mobile Nav Toggle
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isExpanded));
      primaryNav.classList.toggle('nav-open');
    });
  }

  function switchTab(tabId, updateUrl = true) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === tabId;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach(p => {
      const isActive = p.id === `panel-${tabId}`;
      p.classList.toggle('is-active', isActive);
    });

    if (updateUrl) {
      const newUrl = `/legal.html?tab=${encodeURIComponent(tabId)}`;
      window.history.replaceState({ tab: tabId }, '', newUrl);
    }
  }

  // Click listener for tabs
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      switchTab(t.dataset.tab, true);
    });
  });

  // Read initial tab from URL param or hash
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab') || window.location.hash.replace('#', '');
  if (tabParam && ['dmca', 'terms', 'privacy', 'anti-piracy'].includes(tabParam)) {
    switchTab(tabParam, false);
  }
});

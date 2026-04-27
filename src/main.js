/* =========================================================
   Three Little Birds – main.js
   Lightweight enhancements: active nav link highlighting
   on scroll, lazy-image fade-in.
   ========================================================= */
import * as d3 from 'd3';
import { initTabs } from './components/damageProfileTabs.js';
import { createHeatmap } from './components/secondary_vis.js';
import {createMap} from './components/map/createMap.js';
import './components/tertiary_vis.js';
import './components/sliders.js';
import './styles/main.css';

(function () {
  'use strict';

  /* ── Initialize tabs in damage view ────────────────────────── */
  initTabs();

  // Define the configurations for each aircraft type
  const heatmapConfigs = {
    "Airplane": {
      svgPath: "/data/images/airplane.svg",
      acClass: "A",
      parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"]
    },
    "Helicopter": {
      svgPath: "/data/images/helicopter.svg",
      acClass: "B",
      parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_ENG3", "STR_ENG4", "STR_PROP", "STR_WING_ROT", "STR_FUSE", "STR_LG", "STR_TAIL", "STR_LGHTS"]
    },
    "Glider": {
      svgPath: "/data/images/glider.svg",
      acClass: "C",
      parts: ["STR_RAD", "STR_WINDSHLD", "STR_FUSE", "STR_TAIL"]
    },
    "Balloon": {
      svgPath: "/data/images/balloon.svg",
      acClass: "D",
      parts: ["STR_FUSE", "STR_LG"]
    },
    // Missing Dirigible
    "Gyroplane": {
      svgPath: "/data/images/gyroplane.svg",
      acClass: "F",
      parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_ENG3", "STR_ENG4", "STR_PROP", "STR_WING_ROT", "STR_FUSE", "STR_LG", "STR_TAIL", "STR_LGHTS"]
    },
    "Ultralight": {
      svgPath: "/data/images/ultralight.svg",
      acClass: "G",
      parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_ENG3", "STR_ENG4", "STR_PROP", "STR_WING_ROT", "STR_FUSE", "STR_LG", "STR_TAIL", "STR_LGHTS"]
    }
  };

  // Track which heatmaps have already been initialized to avoid redundant re-renders
  const initializedHeatmaps = new Set();

  /* ── Load data once for all visuals ────────────────────────── */
  d3.csv('data/STRIKE_REPORTS_CLEAN.csv').then(data => {

    // Helper to render a specific tab's heatmap
    function renderHeatmapForTab(tabId) {
      const config = heatmapConfigs[tabId];

      // Only proceed if we have a config for this tab and it hasn't been loaded yet
      if (config && !initializedHeatmaps.has(tabId)) {
        createHeatmap({
          containerId: `#${tabId}`,
          svgPath: config.svgPath,
          acClass: config.acClass,
          parts: config.parts,
          data: data
        });
        
        // Mark as initialized
        initializedHeatmaps.add(tabId);
        console.log(`Heatmap initialized for: ${tabId}`);
      }
    }

    // Add Event Listeners to radio buttons
    const radioInputs = document.querySelectorAll('input[name="aircraft-tab"]');
    
    radioInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const targetTabId = e.target.getAttribute('data-target');
        renderHeatmapForTab(targetTabId);
      });
    });

    // Initial Check: Render the tab that is checked by default on page load
    const checkedRadio = document.querySelector('input[name="aircraft-tab"]:checked');
    if (checkedRadio) {
      renderHeatmapForTab(checkedRadio.getAttribute('data-target'));
    }

  });

  /* ── Active nav link on scroll ────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  function updateActiveLink () {
    const scrollY = window.scrollY + 100; // offset for sticky header

    let current = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollY) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // run once on load

  /* ── Intersection Observer: fade-in cards & EDA blocks ─ */
  const fadeTargets = document.querySelectorAll('.card, .eda-block');

  if ('IntersectionObserver' in window) {
    fadeTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .45s ease, transform .45s ease';
    });

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    fadeTargets.forEach(function (el) { observer.observe(el); });
  }
})();
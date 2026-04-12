/* =========================================================
   Three Little Birds – main.js
   Lightweight enhancements: active nav link highlighting
   on scroll, lazy-image fade-in.
   ========================================================= */
import * as d3 from 'd3';
import { initTabs } from './components/damageProfileTabs.js';
import { createHeatmap } from './components/secondary_vis.js';
import './components/primary_vis.js';
import './components/tertiary_vis.js';
import './components/sliders.js';
import './styles/main.css';

(function () {
  'use strict';
  /* ── Initialize tabs in damage view ────────────────────────── */
  initTabs();


  /* ── Load data once for all visuals ────────────────────────── */
  d3.csv("/data/STRIKE_REPORTS.csv").then(data => {

    // Initialize Airplane Heatmap
    createHeatmap({
        containerId: "#Airplane",
        svgPath: "/data/images/airplane.svg",
        acClass: "A",
        parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"],
        data: data
    });

    createHeatmap({
        containerId: "#Helicopter",
        svgPath: "/data/images/helicopter.svg",
        acClass: "B",
        parts: ["STR_RAD", "STR_WINDSHLD", "STR_ENG1", "STR_ENG2", "STR_FUSE", "STR_WING_ROT", "STR_TAIL"],
        data: data
    });

    // repeat for other aircrafts
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
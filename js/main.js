/**
 * ZernoFry — main.js
 * Optimized for Mobile & Desktop:
 * - Hamburger drawer menu with backdrop toggle
 * - Auto-close menu on link click
 * - Multilingual engine with persistent state
 * - Smooth scroll & IntersectionObserver
 */
(function () {
  "use strict";

  const SUPPORTED_LANGS = Object.keys(translations);
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "zernofry-lang";

  const header = document.querySelector(".header");
  const nav = document.querySelector("#nav");
  const navToggle = document.querySelector("#navToggle");
  const navOverlay = document.querySelector("#navOverlay");
  const langButtons = document.querySelectorAll(".lang-btn");
  const navLinks = document.querySelectorAll(".nav__link");
  const revealElements = document.querySelectorAll(".reveal");
  const backToTop = document.querySelector(".back-to-top");
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  // ===== Мобільне меню-гамбургер =====
  function initMobileMenu() {
    if (!navToggle || !nav || !navOverlay) return;

    function toggleMenu(isOpen) {
      const open =
        typeof isOpen === "boolean" ? isOpen : !nav.classList.contains("open");
      nav.classList.toggle("open", open);
      navToggle.classList.toggle("active", open);
      navOverlay.classList.toggle("visible", open);
      document.body.classList.toggle("menu-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    navToggle.addEventListener("click", () => toggleMenu());
    navOverlay.addEventListener("click", () => toggleMenu(false));

    // Закриття меню при кліку на будь-яке посилання
    navLinks.forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });

    // Закриття меню на Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        toggleMenu(false);
      }
    });
  }

  // ===== Language Switcher =====
  function detectInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(browserLang)) {
      return browserLang;
    }
    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) {
      lang = DEFAULT_LANG;
    }

    const dict = translations[lang];

    document.documentElement.setAttribute("lang", lang);

    if (dict["meta.title"]) {
      document.title = dict["meta.title"];
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["meta.description"]) {
      metaDesc.setAttribute("content", dict["meta.description"]);
    }

    // Тексти
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    // Динамічні посилання на PDF
    document.querySelectorAll("[data-i18n-href]").forEach((el) => {
      const key = el.getAttribute("data-i18n-href");
      if (dict[key] !== undefined) {
        el.setAttribute("href", dict[key]);
      }
    });

    // Підсвічування кнопки мови
    langButtons.forEach((btn) => {
      const btnLang = btn.getAttribute("data-lang");
      btn.classList.toggle("active", btnLang === lang);
      btn.setAttribute("aria-pressed", btnLang === lang ? "true" : "false");
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function initLangSwitch() {
    langButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        applyLang(lang);
      });
    });
    applyLang(detectInitialLang());
  }

  // ===== Sticky Header =====
  function initStickyHeader() {
    if (!header) return;

    const checkScroll = () => {
      const scrolled = window.scrollY > 40;
      header.classList.toggle("scrolled", scrolled);
    };

    checkScroll();

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            checkScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  // ===== Scroll Reveal =====
  function initScrollReveal() {
    if (!revealElements.length) return;

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ===== Smooth Scroll =====
  function initSmoothScroll() {
    anchorLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 70;
          const targetPosition = targetElement.offsetTop - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // ===== Back to Top Button =====
  function initBackToTop() {
    if (!backToTop) return;

    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle("visible", window.scrollY > 400);
      },
      { passive: true },
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ===== Active Nav Link on Scroll =====
  function initActiveNavLinks() {
    if (!navLinks.length || !("IntersectionObserver" in window)) return;

    const sections = Array.from(navLinks)
      .map((link) => {
        const href = link.getAttribute("href");
        return href && href.startsWith("#")
          ? document.querySelector(href)
          : null;
      })
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((l) => {
              l.classList.toggle("active", l.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { threshold: 0.25 },
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ===== Form Feedback =====
  function initContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      submitBtn.disabled = true;
      submitBtn.textContent = "✓ Sent!";

      setTimeout(() => {
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 3000);
    });
  }

  // ===== App Init =====
  document.addEventListener("DOMContentLoaded", () => {
    initMobileMenu();
    initLangSwitch();
    initStickyHeader();
    initScrollReveal();
    initSmoothScroll();
    initBackToTop();
    initActiveNavLinks();
    initContactForm();
  });
})();

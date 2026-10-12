/**
 * ZernoFry — main.js
 * Core UI Logic:
 * 1. Multilingual translation engine with localStorage persistence.
 * 2. Dynamic PDF and attribute switching (data-i18n-href, data-i18n).
 * 3. Sticky header on scroll.
 * 4. IntersectionObserver scroll animations.
 * 5. Smooth navigation and back-to-top handler.
 */
(function () {
  "use strict";

  const SUPPORTED_LANGS = Object.keys(translations); // ['en', 'de', 'uk']
  const DEFAULT_LANG = "en";
  const STORAGE_KEY = "zernofry-lang";

  const header = document.querySelector(".header");
  const langButtons = document.querySelectorAll(".lang-btn");
  const navLinks = document.querySelectorAll(".nav__link");
  const revealElements = document.querySelectorAll(".reveal");
  const backToTop = document.querySelector(".back-to-top");
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

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

    // Оновлення тексту в тегах
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

    // Динамічне оновлення шляхів до PDF для кнопок скачування
    document.querySelectorAll("[data-i18n-href]").forEach((el) => {
      const key = el.getAttribute("data-i18n-href");
      if (dict[key] !== undefined) {
        el.setAttribute("href", dict[key]);
      }
    });

    // Підсвічування активної кнопки мови
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
      const scrolled = window.scrollY > 60;
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

  // ===== Scroll Reveal Animation =====
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
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  // ===== Smooth Scroll for Anchor Links =====
  function initSmoothScroll() {
    anchorLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") {
          e.preventDefault();
          return;
        }
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerHeight = header ? header.offsetHeight : 80;
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

    const toggleVisibility = () => {
      const visible = window.scrollY > 450;
      backToTop.classList.toggle("visible", visible);
    };

    toggleVisibility();

    window.addEventListener(
      "scroll",
      () => {
        toggleVisibility();
      },
      { passive: true },
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ===== Active Nav Link on Scroll =====
  function initActiveNavLinks() {
    if (!navLinks.length) return;

    const sections = Array.from(navLinks)
      .map((link) => {
        const href = link.getAttribute("href");
        return href && href.startsWith("#")
          ? document.querySelector(href)
          : null;
      })
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((l) => {
              const active = l.getAttribute("href") === `#${id}`;
              l.classList.toggle("active", active);
            });
          }
        });
      },
      { threshold: 0.3 },
    );

    sections.forEach((section) => observer.observe(section));
  }

  // ===== Contact Form Demo Handling =====
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
    initLangSwitch();
    initStickyHeader();
    initScrollReveal();
    initSmoothScroll();
    initBackToTop();
    initActiveNavLinks();
    initContactForm();
  });
})();

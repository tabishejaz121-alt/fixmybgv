/* ==========================================================================
   Fix My BGV — Shared site behavior
   ========================================================================== */

/* ---- Business contact config -------------------------------------------
   TODO: Replace these two placeholders with the real business WhatsApp
   number (with country code, digits only) and contact email before this
   site goes live. Every WhatsApp button/FAB and mailto link on the site
   reads from this single place.
   -------------------------------------------------------------------- */
const SITE_CONFIG = {
  whatsappNumber: "918618264354",
  email: "contact@fixmybgv.in",   // TODO: replace with real business email
  sheetsWebAppUrl: "https://script.google.com/macros/s/AKfycbz_LScm1QiFjm2v_aCSNOMrdzXyGYZr61-iSY3nKrXTDsLQhOwD2XpMTJiZsPjAVkE46Q/exec",
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  initAccordions();
  initReveal();
  initStatCounter();
  initBackToTop();
  initWhatsAppFab();
  initActiveNav();
  initFilterChips();
  initWhatsAppLinks();
  initBookingForm();
  initBookingModal();
  initThankYouPage();
  initTestimonialCarousel();
  initHeroIntro();
  initMagneticButtons();
  initHeroParallax();
  initEngagementTriggers();
  initTestimonialReveal();
  initTestimonialFilter();
  initCookieConsent();
  initAnalyticsTracking();
});

/* ---------------- Hero mouse-parallax (index.html only) ----------------
   Uses the standalone CSS `translate` property rather than `transform`,
   so it composes with the existing idle-float @keyframes (which owns
   `transform`) instead of overriding it each frame. Fine-pointer only,
   rAF-throttled, no-ops instantly on every other page. */
function initHeroParallax() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

  const hero = document.querySelector(".hero");
  const visual = document.querySelector(".hero-visual");
  if (!hero || !visual) return;

  const mainCard = document.querySelector(".floating-card--main");
  const smallCard = document.querySelector(".floating-card--small");
  const motif = document.querySelector(".hero-motif");
  let raf = null;

  hero.addEventListener("mousemove", (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const rect = visual.getBoundingClientRect();
      const px = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const py = (e.clientY - rect.top - rect.height / 2) / rect.height;
      if (mainCard) mainCard.style.translate = `${px * 14}px ${py * 10}px`;
      if (smallCard) smallCard.style.translate = `${px * 8}px ${py * 6}px`;
      if (motif) motif.style.translate = `${px * -6}px ${py * -4}px`;
      raf = null;
    });
  });
  hero.addEventListener("mouseleave", () => {
    [mainCard, smallCard, motif].forEach((el) => { if (el) el.style.translate = ""; });
  });
}

/* ---------------- Lightweight CSS-3D tilt on cards ----------------
   Same safe pattern as the magnetic buttons: fine-pointer only, listener
   attached solely while hovering a given card, rAF-throttled, skipped
   entirely for touch devices and prefers-reduced-motion. This is plain
   CSS perspective/rotate — no WebGL, no added library, no continuous
   background work when nothing is being hovered. */
/* ---------------- Magnetic hover on primary CTAs ----------------
   Only enabled on fine-pointer devices (mouse/trackpad) — mousemove
   listener is attached solely while the pointer is over a given button
   and removed on leave, so idle cost is zero. Skipped entirely on touch
   and for prefers-reduced-motion. */
function initMagneticButtons() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".btn-primary").forEach((btn) => {
    let raf = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${relX * 0.12}px, ${relY * 0.22}px)`;
        raf = null;
      });
    };
    btn.addEventListener("pointerenter", () => btn.addEventListener("mousemove", onMove));
    btn.addEventListener("pointerleave", () => {
      btn.removeEventListener("mousemove", onMove);
      btn.style.transform = "";
    });
  });
}

/* ==========================================================================
   Hero entrance (index.html only) — plays once on load, never on scroll.
   Pure progressive enhancement: if GSAP fails to load (blocked/offline),
   these elements simply render in their normal visible CSS state.
   ========================================================================== */
function initHeroIntro() {
  if (!window.gsap) return;

  const badge = document.querySelector(".hero .hero-badge");
  const h1 = document.querySelector(".hero h1");
  if (!badge || !h1) return; // not on this page

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return; // leave elements in their natural visible state, no animation
  }

  const lede = document.querySelector(".hero .lede");
  const btnRow = document.querySelector(".hero .btn-row");
  const trust = document.querySelector(".hero .trust-strip");
  const visual = document.querySelector(".hero-visual");
  const progressFill = document.querySelector(".hero-visual .progress-fill");
  const targets = [badge, h1, lede, btnRow, trust].filter(Boolean);

  gsap.set(targets, { opacity: 0, y: 16 });
  if (visual) gsap.set(visual, { opacity: 0, y: 20 });
  if (progressFill) gsap.set(progressFill, { width: "0%" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.7 } });
  tl.to(targets, { opacity: 1, y: 0, stagger: 0.08 });
  if (visual) tl.to(visual, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
  if (progressFill) tl.to(progressFill, { width: "60%", duration: 0.9, ease: "power2.out" }, "-=0.4");
}

/* ==========================================================================
   Testimonial carousel (index.html)
   ========================================================================== */
const TESTIMONIALS_DATA = [
  { quote: "I finally understood what the real issue was — the biggest value was clarity and direction.", attrib: "Software Professional, Bengaluru" },
  { quote: "Someone finally listened to the full timeline instead of giving generic advice.", attrib: "IT Employee, Hyderabad" },
  { quote: "I felt more in control after the call — it moved me from panic to a structured plan.", attrib: "Candidate with Offer in Hand" },
  { quote: "It wasn't just advice — it was a proper case review, backed by the actual facts.", attrib: "Senior Analyst, Pune" },
  { quote: "The drafting and strategy support helped me actually move the matter forward.", attrib: "Technology Professional, Noida" },
  { quote: "The call reduced a lot of unnecessary panic and made the situation feel manageable again.", attrib: "Product Support Professional" },
];

function initTestimonialCarousel() {
  const root = document.getElementById("testi-carousel");
  const wrap = document.getElementById("testi-content-wrap");
  const dotsWrap = document.getElementById("testi-dots");
  const prevBtn = document.getElementById("testi-prev");
  const nextBtn = document.getElementById("testi-next");
  if (!root || !wrap || !dotsWrap) return;

  const total = TESTIMONIALS_DATA.length;
  let index = 0;
  let autoTimer = null;

  function paint() {
    const big = TESTIMONIALS_DATA[index];
    const small1 = TESTIMONIALS_DATA[(index + 1) % total];
    const small2 = TESTIMONIALS_DATA[(index + 2) % total];

    document.getElementById("testi-big-quote").textContent = big.quote;
    document.getElementById("testi-big-attrib").textContent = "— " + big.attrib;
    document.getElementById("testi-small-1-quote").textContent = `"${small1.quote}"`;
    document.getElementById("testi-small-1-attrib").textContent = "— " + small1.attrib;
    document.getElementById("testi-small-2-quote").textContent = `"${small2.quote}"`;
    document.getElementById("testi-small-2-attrib").textContent = "— " + small2.attrib;

    dotsWrap.querySelectorAll(".testi-dot").forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(newIndex, dir) {
    index = (newIndex + total) % total;
    wrap.classList.add(dir === "next" ? "is-leaving-left" : "is-leaving-right");
    setTimeout(() => {
      paint();
      wrap.classList.remove("is-leaving-left", "is-leaving-right");
    }, 220);
    resetAutoplay();
  }

  TESTIMONIALS_DATA.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testi-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, i > index ? "next" : "prev"));
    dotsWrap.appendChild(dot);
  });

  prevBtn.addEventListener("click", () => goTo(index - 1, "prev"));
  nextBtn.addEventListener("click", () => goTo(index + 1, "next"));

  function resetAutoplay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(index + 1, "next"), 6500);
  }
  root.addEventListener("mouseenter", () => clearInterval(autoTimer));
  root.addEventListener("mouseleave", resetAutoplay);

  paint();
  resetAutoplay();
}

/* ---------------- Header shadow on scroll ---------------- */
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;
  const HIDE_THRESHOLD = 80; // don't hide until scrolled this far down

  function update() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);

    if (y > HIDE_THRESHOLD && y > lastY) {
      header.classList.add("is-hidden"); // scrolling down — hide
    } else if (y < lastY || y <= HIDE_THRESHOLD) {
      header.classList.remove("is-hidden"); // scrolling up or near top — show
    }
    lastY = y;
    ticking = false;
  }

  update();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* ---------------- Mobile nav ---------------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".mobile-nav");
  if (!toggle || !nav) return;
  const closeNav = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".material-symbols-outlined").textContent = "menu";
    document.body.style.overflow = "";
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".material-symbols-outlined").textContent = open ? "close" : "menu";
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
}

/* ---------------- Accordions (FAQ, pricing details, compare toggle) ---------------- */
function initAccordions() {
  bindAccordions(document);
}

/* Bindable per-root so the booking modal's dynamically-injected plan cards
   (built after DOMContentLoaded) can wire up their own accordions too. */
function bindAccordions(root) {
  root.querySelectorAll(".accordion-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      const group = btn.closest("[data-accordion-group]");

      if (group && !expanded) {
        group.querySelectorAll(".accordion-trigger").forEach((otherBtn) => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute("aria-expanded", "false");
            otherBtn.nextElementSibling.style.maxHeight = null;
          }
        });
      }

      btn.setAttribute("aria-expanded", String(!expanded));
      panel.style.maxHeight = !expanded ? panel.scrollHeight + "px" : null;
    });
  });
}

/* ---------------- Scroll reveal ---------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    /* threshold: 0 (not a fraction) — a percentage-based threshold can never
       be satisfied by an element taller than the viewport itself, which would
       leave it permanently invisible. rootMargin alone controls how far into
       view something needs to be before it reveals, and that works at any size. */
    { threshold: 0, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------- Stat count-up (about.html) ----------------
   Elements with data-count-to="N" count up from 0 once scrolled into view.
   Reads any trailing non-digit suffix already in the element's text (+, %)
   and keeps it, so the markup can just say "300+" or "100%" and still work
   with prefers-reduced-motion, which skips straight to the final value. */
function initStatCounter() {
  const items = document.querySelectorAll("[data-count-to]");
  if (!items.length || !("IntersectionObserver" in window)) return;

  const animate = (el) => {
    const target = parseInt(el.getAttribute("data-count-to"), 10);
    const suffix = (el.textContent.match(/[^\d]+$/) || [""])[0];
    if (prefersReducedMotion() || !target) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------- Back to top ---------------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener(
    "scroll",
    () => btn.classList.toggle("is-visible", window.scrollY > 600),
    { passive: true }
  );
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------------- WhatsApp FAB visibility ----------------
   Hidden at the very top of the page so it never sits on top of the hero's
   own CTA buttons/pills, and hidden again whenever another primary tap target
   (quiz Back/Next, form submit, pricing CTA) is on screen, since the FAB sits
   fixed at bottom-right and would otherwise cover them. */
function initWhatsAppFab() {
  const fab = document.querySelector(".whatsapp-fab");
  if (!fab) return;

  let pastThreshold = window.scrollY > 350;
  let obscured = false;
  const update = () => fab.classList.toggle("is-visible", pastThreshold && !obscured);

  window.addEventListener(
    "scroll",
    () => {
      pastThreshold = window.scrollY > 350;
      update();
    },
    { passive: true }
  );

  const dangerEls = document.querySelectorAll(
    ".hero-cta-wrap, .quiz-nav, #intake-form button[type='submit'], .price-card .btn-block"
  );
  if (dangerEls.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(() => {
      obscured = [...dangerEls].some((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      });
      update();
    });
    dangerEls.forEach((el) => io.observe(el));
  }

  update();
}

/* ---------------- Engagement triggers ----------------
   Three triggers — exit-intent (desktop), a scroll-depth threshold, and a
   time-on-page threshold (both work on mobile, where exit-intent can't) —
   open the booking modal directly instead of showing a separate survey
   popup first. Fires once per browser session, and never on the booking
   form or the thank-you page where it would just be an interruption. */
function initEngagementTriggers() {
  const path = location.pathname.split("/").pop() || "index.html";
  if (path === "book.html" || path === "thank-you.html") return;
  if (sessionStorage.getItem("fixmybgv_popup_shown")) return;

  const trigger = () => {
    if (sessionStorage.getItem("fixmybgv_popup_shown")) return;
    sessionStorage.setItem("fixmybgv_popup_shown", "1");
    openBookingModal();
    cleanupTriggers();
  };

  /* Trigger 1: exit-intent (desktop) — mouse leaves toward the browser chrome */
  const onMouseLeave = (e) => { if (e.clientY <= 0) trigger(); };
  document.addEventListener("mouseleave", onMouseLeave);

  /* Trigger 2: scroll depth past 80% of the page */
  const onScroll = () => {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    if (total > 0 && scrolled / total > 0.8) trigger();
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Trigger 3: time on page, for visitors who neither scroll far nor exit */
  const idleTimer = setTimeout(trigger, 45000);

  function cleanupTriggers() {
    document.removeEventListener("mouseleave", onMouseLeave);
    window.removeEventListener("scroll", onScroll);
    clearTimeout(idleTimer);
  }
}

/* ---------------- Active nav link ---------------- */
function initActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((a) => {
    const target = a.getAttribute("data-nav-link");
    if (target === path) {
      a.setAttribute("aria-current", "page");
      a.classList.add("active");
    }
  });
}

/* ---------------- Filter chips (FAQ topics / services categories) ---------------- */
function initFilterChips() {
  document.querySelectorAll("[data-chip-group]").forEach((group) => {
    const indicator = document.createElement("span");
    indicator.className = "chip-indicator";
    indicator.setAttribute("aria-hidden", "true");
    group.style.position = "relative";
    group.insertBefore(indicator, group.firstChild);

    const moveIndicatorTo = (chip) => {
      if (!chip) return;
      indicator.style.width = chip.offsetWidth + "px";
      indicator.style.transform = `translateX(${chip.offsetLeft}px)`;
      indicator.classList.add("is-ready");
    };

    const activeChip = group.querySelector(".filter-chip.active") || group.querySelector(".filter-chip");
    // offsetWidth is 0 until layout settles on some browsers right after insert — defer one frame
    requestAnimationFrame(() => moveIndicatorTo(activeChip));

    group.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => moveIndicatorTo(chip));
    });
  });

  document.querySelectorAll("[data-chip-target]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const targetId = chip.getAttribute("data-chip-target");
      const group = chip.closest("[data-chip-group]");
      if (group) {
        group.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      }
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.classList.add("card-flash");
        setTimeout(() => el.classList.remove("card-flash"), 900);
      }
    });
  });
}

/* ---------------- Testimonial case-detail reveal ----------------
   The quote is the headline; the Problem/Found/Path-forward breakdown stays
   collapsed until asked for, so the page reads like reviews first, case
   studies second. grid-template-rows 0fr->1fr gives a smooth height
   animation without measuring scrollHeight in JS. */
function initTestimonialReveal() {
  document.querySelectorAll(".testimonial-reveal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".testimonial-card");
      if (!card) return;
      const expanded = card.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", String(expanded));
      const label = btn.querySelector(".btn-label");
      if (label) label.textContent = expanded ? "Hide case details" : "See how we solved it";
    });
  });
}

/* ---------------- Testimonial niche filter ----------------
   Independent of initFilterChips (that one scrolls to an anchor; this one
   shows/hides cards by data-category so a visitor can see cases closest
   to their own situation). */
function initTestimonialFilter() {
  const group = document.querySelector("[data-testimonial-filter-group]");
  if (!group) return;
  const chips = [...group.querySelectorAll(".filter-chip")];
  const cards = [...document.querySelectorAll(".testimonial-card[data-category]")];
  if (!chips.length || !cards.length) return;

  const indicator = document.createElement("span");
  indicator.className = "chip-indicator";
  indicator.setAttribute("aria-hidden", "true");
  group.style.position = "relative";
  group.insertBefore(indicator, group.firstChild);
  const moveIndicatorTo = (chip) => {
    indicator.style.width = chip.offsetWidth + "px";
    indicator.style.transform = `translateX(${chip.offsetLeft}px)`;
    indicator.classList.add("is-ready");
  };

  const applyFilter = (category) => {
    cards.forEach((card) => {
      const match = category === "all" || card.getAttribute("data-category") === category;
      card.classList.toggle("is-filtered-out", !match);
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      moveIndicatorTo(chip);
      applyFilter(chip.getAttribute("data-filter") || "all");
    });
  });

  const initial = group.querySelector(".filter-chip.active") || chips[0];
  requestAnimationFrame(() => moveIndicatorTo(initial));
  applyFilter(initial.getAttribute("data-filter") || "all");
}

/* ---------------- WhatsApp links ---------------- */
function buildWhatsAppLink(text) {
  const base = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

function initWhatsAppLinks() {
  const defaultMsg = "Hi, I'd like to ask about Fix My BGV services.";
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const custom = el.getAttribute("data-whatsapp");
    const msg = custom && custom.length > 1 ? custom : defaultMsg;
    el.setAttribute("href", buildWhatsAppLink(msg));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
    el.addEventListener("click", () => pushDataLayerEvent({ event: "whatsapp_click" }));
  });
  document.querySelectorAll("[data-mailto]").forEach((el) => {
    el.setAttribute("href", `mailto:${SITE_CONFIG.email}`);
    el.addEventListener("click", () => pushDataLayerEvent({ event: "email_click" }));
  });
  document.querySelectorAll("[data-email-text]").forEach((el) => {
    el.textContent = SITE_CONFIG.email;
  });
}

/* ==========================================================================
   Booking / Intake form — Name, Mobile, Email, Issue in detail.
   Two copies share this same wiring: the inline form on book.html (for
   anyone who lands there directly) and the site-wide popup modal built by
   initBookingModal() below. Neither redirects anywhere — submit saves the
   lead to a Google Sheet, opens WhatsApp with the details pre-filled, and
   swaps the form for an inline confirmation in place.
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById("intake-form");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const preselect = params.get("service");
  const serviceField = form.querySelector('[name="service"]');
  if (serviceField && preselect) {
    serviceField.value =
      preselect === "review"
        ? "BGV / Employment Record Case Review — ₹1999"
        : preselect === "strategy"
        ? "Resolution Strategy & Drafting Support — ₹3999"
        : "";
  }
  wireIntakeForm(form);
}

function wireIntakeForm(form) {
  if (!form) return;

  let formStarted = false;
  form.addEventListener("focusin", () => {
    if (formStarted) return;
    formStarted = true;
    pushDataLayerEvent({ event: "consultation_form_start", form_name: "book_consultation" });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstError = null;

    form.querySelectorAll("[data-required]").forEach((field) => {
      const wrap = field.closest(".field");
      const valid = field.value && field.value.trim() !== "";
      if (wrap) wrap.classList.toggle("has-error", !valid);
      if (!valid && !firstError) firstError = field;
    });

    if (firstError) {
      firstError.closest(".field")?.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Please complete the highlighted fields before submitting.");
      return;
    }

    const data = new FormData(form);
    const name = (data.get("full_name") || "").toString().trim();
    const mobile = (data.get("mobile") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const issue = (data.get("issue") || "").toString().trim();
    const service = (data.get("service") || "").toString().trim();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    submitToGoogleSheet({ name, mobile, email, issue, service });
    pushDataLayerEvent({ event: "consultation_form_submit", form_name: "book_consultation" });
    showIntakeSuccess(form, name);
  });
}

function showIntakeSuccess(form, name) {
  const success = document.createElement("div");
  success.className = "intake-success";
  success.innerHTML = `
    <div class="thankyou-icon"><span class="material-symbols-outlined icon-fill">task_alt</span></div>
    <h3>Thank you${name ? ", " + name.split(" ")[0] : ""}!</h3>
    <p>We've received your details. We'll get back to you as soon as possible.</p>`;
  form.replaceWith(success);
}

/* ---------------- Google Sheet lead capture ----------------
   Fires the intake form to a Google Apps Script Web App (see the site's
   setup notes for deployment steps) so every submission is recorded, and the
   script itself emails a notification too. mode:'no-cors' with a plain
   string body avoids a CORS preflight, which Apps Script doesn't reliably
   answer, so the response can't be read back; this is fire-and-forget by
   design and doesn't block the on-screen confirmation either way. */
function submitToGoogleSheet(data) {
  const url = SITE_CONFIG.sheetsWebAppUrl;
  if (!url || url.indexOf("PASTE_") === 0) return Promise.resolve();
  return fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify(data),
  }).catch(() => {
    /* offline or blocked — the WhatsApp message is still the fallback record */
  });
}

function initThankYouPage() {
  const link = document.getElementById("whatsapp-continue");
  if (!link) return;
  link.setAttribute("href", buildWhatsAppLink("Hi, I'd like to book a consultation with Fix My BGV."));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener");
}

/* ==========================================================================
   Site-wide booking modal — every "Book" link on every page (header, mobile
   nav, footer, bottom nav, hero/price CTAs, the engagement popup pills) opens
   this in-page form instead of navigating to book.html. book.html itself
   keeps its own inline copy of the form for direct visits; clicking a Book
   link while already there just scrolls down to it.
   ========================================================================== */
let bookingModalOverlay = null;

function openBookingModal() {
  if (!bookingModalOverlay) return;
  showBookingStep(bookingModalOverlay, "plan");
  bookingModalOverlay.classList.add("is-visible");
  document.body.style.overflow = "hidden";
}

function closeBookingModal() {
  if (!bookingModalOverlay) return;
  bookingModalOverlay.classList.remove("is-visible");
  document.body.style.overflow = "";
}

/* Just the two options, price only — anyone who wants the full breakdown
   (what's included, situations covered, etc.) is sent to services.html via
   the plain link below the picker, rather than replicating that much
   content inside a popup. */
function bookingPlanPickHTML() {
  return `
    <div class="plan-pick-grid">
      <button type="button" class="plan-pick-card" data-select-service="review">
        <h3>BGV / Employment Record Case Review</h3>
        <div class="plan-pick-price">₹1999</div>
      </button>
      <button type="button" class="plan-pick-card" data-select-service="strategy">
        <h3>Resolution Strategy &amp; Drafting Support</h3>
        <div class="plan-pick-price">₹3999</div>
      </button>
    </div>
    <p class="text-center plan-details-link-wrap">
      <a href="services.html" class="plan-details-link">Want the full details of each plan? <span>See Services →</span></a>
    </p>`;
}

function showBookingStep(overlay, step) {
  overlay.querySelectorAll(".booking-step").forEach((el) => {
    el.style.display = el.getAttribute("data-step") === step ? "" : "none";
  });
  overlay.querySelector(".booking-modal")?.classList.toggle("is-plan-step", step === "plan");
  const body = overlay.querySelector(".booking-modal-body");
  if (body) body.scrollTop = 0;
}

function initBookingModal() {
  const path = location.pathname.split("/").pop() || "index.html";
  const bookLinks = [...document.querySelectorAll('a[href^="book.html"]')];
  if (!bookLinks.length) return;

  if (path === "book.html") {
    bookLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        pushDataLayerEvent({ event: "consultation_cta_click" });
        document.querySelector(".intake-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "site-popup-overlay";
  overlay.innerHTML = `
    <div class="site-popup booking-modal is-plan-step" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div class="site-popup-header">
        <span class="site-popup-fold" aria-hidden="true"></span>
        <span class="site-popup-header-mark"><img src="assets/img/logo-mark.svg" alt="" /></span>
        <span class="site-popup-header-word">Fix My BGV</span>
        <button type="button" class="site-popup-close" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="booking-modal-body">
        <div class="booking-step" data-step="plan">
          <h3 id="booking-modal-title" style="text-align:center;margin-bottom:6px;">Which service do you need?</h3>
          <p style="text-align:center;color:var(--text-muted);font-size:14px;margin-bottom:26px;">Pick the option that fits your situation.</p>
          ${bookingPlanPickHTML()}
        </div>
        <div class="booking-step" data-step="form" style="display:none;">
          <button type="button" class="booking-back-link">
            <span class="material-symbols-outlined">arrow_back</span> Change plan
          </button>
          <div class="intake-card-icon" style="margin:14px auto 14px;"><span class="material-symbols-outlined">edit_document</span></div>
          <h3 style="text-align:center;margin-bottom:4px;">Tell us about your case</h3>
          <p id="booking-selected-plan" style="text-align:center;color:var(--blue);font-weight:700;font-size:13.5px;margin-bottom:20px;"></p>
          <form id="booking-modal-form" novalidate>
            <input type="hidden" name="service" value="" />
            <div class="field">
              <label>Full name <span class="req">*</span></label>
              <input type="text" name="full_name" data-required autocomplete="name" placeholder="Your full name" />
            </div>
            <div class="field">
              <label>Mobile / WhatsApp number <span class="req">*</span></label>
              <input type="tel" name="mobile" data-required autocomplete="tel" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div class="field">
              <label>Email address <span class="req">*</span></label>
              <input type="email" name="email" data-required autocomplete="email" placeholder="you@example.com" />
            </div>
            <div class="field">
              <label>Issue in detail <span class="req">*</span></label>
              <textarea name="issue" data-required rows="4" placeholder="Describe your situation, what happened, which employer(s) are involved, and what's creating the problem right now."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block">
              Submit <span class="material-symbols-outlined" style="font-size:18px;">arrow_forward</span>
            </button>
          </form>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  bookingModalOverlay = overlay;

  overlay.querySelector(".site-popup-close").addEventListener("click", closeBookingModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeBookingModal(); });

  const serviceLabels = {
    review: "BGV / Employment Record Case Review — ₹1999",
    strategy: "Resolution Strategy & Drafting Support — ₹3999",
  };
  overlay.querySelectorAll("[data-select-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-select-service");
      const label = serviceLabels[key] || "";
      const serviceField = overlay.querySelector('#booking-modal-form [name="service"]');
      if (serviceField) serviceField.value = label;
      const planNote = overlay.querySelector("#booking-selected-plan");
      if (planNote) planNote.textContent = label ? `Selected: ${label}` : "";
      showBookingStep(overlay, "form");
    });
  });
  overlay.querySelector(".booking-back-link")?.addEventListener("click", () => showBookingStep(overlay, "plan"));

  wireIntakeForm(overlay.querySelector("#booking-modal-form"));

  bookLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      pushDataLayerEvent({ event: "consultation_cta_click" });
      openBookingModal();
    });
  });
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------------- Toast ---------------- */
let toastTimer = null;
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

/* ==========================================================================
   Analytics dataLayer events ----------------------------------------------
   Every push here is interaction metadata only — event names, a service
   label, an FAQ question's visible text. NEVER a name, phone number, email
   address, form field value, or any other personal/case detail. GTM (already
   installed, container GTM-PFVGHW4K) reads this dataLayer; no analytics
   vendor script is loaded directly from this file.
   ========================================================================== */
function pushDataLayerEvent(payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function initAnalyticsTracking() {
  /* Phone — no tel: link exists on the site yet, this just means one starts
     working the moment a real phone link is ever added, no JS change needed. */
  document.querySelectorAll('a[href^="tel:"]').forEach((el) => {
    el.addEventListener("click", () => pushDataLayerEvent({ event: "phone_click" }));
  });

  /* FAQ / accordion opens — fires after bindAccordions()'s own click handler
     has already flipped aria-expanded, so this reads the just-opened state.
     The question text is UI copy, not personal data, safe to report. */
  document.querySelectorAll(".accordion-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.getAttribute("aria-expanded") === "true") {
        const question = [...btn.childNodes]
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent)
          .join(" ")
          .trim()
          .replace(/\s+/g, " ");
        pushDataLayerEvent({ event: "faq_open", faq_question: question });
      }
    });
  });
}

/* ==========================================================================
   Cookie consent — plain localStorage + vanilla JS, no external library.
   Stores only { essential, analytics, marketing, timestamp } booleans/number,
   never any personal or case information. Non-essential categories default
   to denied until the visitor explicitly opts in. Every choice is broadcast
   to dataLayer as a non-PII consent-state event so GTM tags configured later
   (GA4, Ads, Meta Pixel) can gate themselves on real, current consent.
   ========================================================================== */
const COOKIE_CONSENT_KEY = "fixmybgv_cookie_consent";

function getCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null; // localStorage unavailable (private browsing etc.) — treat as no decision yet
  }
}

function setCookieConsent(analytics, marketing) {
  const consent = { essential: true, analytics: !!analytics, marketing: !!marketing, timestamp: Date.now() };
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  } catch (err) {
    /* consent just won't persist across visits — nothing else depends on this succeeding */
  }
  pushDataLayerEvent({
    event: "cookie_consent_update",
    analytics_consent: consent.analytics ? "granted" : "denied",
    marketing_consent: consent.marketing ? "granted" : "denied",
  });
  return consent;
}

function initCookieConsent() {
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <p>We use essential cookies to run this site. With your permission, we'd also like to use optional cookies to understand how it's used, see our <a href="disclaimer.html#confidentiality">Confidentiality</a> notice for details.</p>
    <div class="cookie-banner-actions">
      <button type="button" class="btn btn-ghost" data-cookie-action="manage">Manage Preferences</button>
      <button type="button" class="btn btn-outline" data-cookie-action="reject">Reject Non-Essential</button>
      <button type="button" class="btn btn-primary" data-cookie-action="accept">Accept All</button>
    </div>`;
  document.body.appendChild(banner);

  const overlay = document.createElement("div");
  overlay.className = "cookie-modal-overlay";
  overlay.innerHTML = `
    <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
      <div class="cookie-modal-header">
        <h2 id="cookie-modal-title">Cookie Preferences</h2>
        <button type="button" class="cookie-modal-close" aria-label="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="cookie-modal-body">
        <p>Choose which optional cookies we can use. Essential cookies can't be switched off, they're what make the site and booking form work.</p>
        <div class="cookie-pref-row">
          <div>
            <h3>Essential</h3>
            <p>Required for core site features like navigation and the booking form. Always on.</p>
          </div>
          <label class="cookie-toggle">
            <input type="checkbox" checked disabled aria-label="Essential cookies, always active" />
            <span class="cookie-toggle-track" aria-hidden="true"></span>
          </label>
        </div>
        <div class="cookie-pref-row">
          <div>
            <h3>Analytics</h3>
            <p>Helps us understand how visitors use the site so we can improve it.</p>
          </div>
          <label class="cookie-toggle">
            <input type="checkbox" id="cookie-pref-analytics" aria-label="Analytics cookies" />
            <span class="cookie-toggle-track" aria-hidden="true"></span>
          </label>
        </div>
        <div class="cookie-pref-row">
          <div>
            <h3>Marketing</h3>
            <p>Used for measuring and improving the relevance of any future advertising.</p>
          </div>
          <label class="cookie-toggle">
            <input type="checkbox" id="cookie-pref-marketing" aria-label="Marketing cookies" />
            <span class="cookie-toggle-track" aria-hidden="true"></span>
          </label>
        </div>
        <div class="cookie-modal-footer">
          <button type="button" class="btn btn-outline" data-cookie-action="reject-modal">Reject Non-Essential</button>
          <button type="button" class="btn btn-primary" data-cookie-action="save">Save Preferences</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const analyticsToggle = overlay.querySelector("#cookie-pref-analytics");
  const marketingToggle = overlay.querySelector("#cookie-pref-marketing");

  const hideBanner = () => banner.classList.remove("is-visible");
  const showBanner = () => banner.classList.add("is-visible");

  function openModal() {
    const existing = getCookieConsent();
    analyticsToggle.checked = !!(existing && existing.analytics);
    marketingToggle.checked = !!(existing && existing.marketing);
    overlay.classList.add("is-visible");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    overlay.classList.remove("is-visible");
    document.body.style.overflow = "";
  }

  banner.querySelector('[data-cookie-action="accept"]').addEventListener("click", () => {
    setCookieConsent(true, true);
    hideBanner();
  });
  banner.querySelector('[data-cookie-action="reject"]').addEventListener("click", () => {
    setCookieConsent(false, false);
    hideBanner();
  });
  banner.querySelector('[data-cookie-action="manage"]').addEventListener("click", openModal);

  overlay.querySelector(".cookie-modal-close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  overlay.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  overlay.querySelector('[data-cookie-action="reject-modal"]').addEventListener("click", () => {
    setCookieConsent(false, false);
    closeModal();
    hideBanner();
  });
  overlay.querySelector('[data-cookie-action="save"]').addEventListener("click", () => {
    setCookieConsent(analyticsToggle.checked, marketingToggle.checked);
    closeModal();
    hideBanner();
  });

  /* Footer "Cookie Preferences" link on every page reopens this same modal. */
  document.querySelectorAll("[data-cookie-preferences]").forEach((btn) => {
    btn.addEventListener("click", openModal);
  });

  if (!getCookieConsent()) {
    setTimeout(showBanner, 600);
  }
}

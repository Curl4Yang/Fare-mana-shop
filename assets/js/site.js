/**
 * ============================================================
 * FARE MANA — LOGIQUE PARTAGÉE DU SITE
 * ============================================================
 * Ce fichier lit les données de data.js et anime toutes les pages :
 *   - thème visuel selon l'heure locale (matin/journée/coucher/nuit)
 *   - système de destination Bora Bora / Marseille + mémorisation
 *   - header et footer (générés ici pour éviter toute duplication)
 *   - cartes de soins + modale accessible
 *   - questionnaire "Quel soin est fait pour vous ?"
 *   - formulaire de contact (validation front-end uniquement)
 *   - petites animations d'apparition au défilement
 *
 * Il n'y a rien à modifier ici pour changer un texte ou un prix :
 * tout ça se passe dans data.js. Voir CONTENT-GUIDE.md.
 * ============================================================
 */

(function () {
  "use strict";
  const DATA = window.FareManaData;
  const STORAGE_KEY = "fareManaLocation";

  /* ============================================================
     1. THÈME SELON L'HEURE — SOURCE UNIQUE : L'HEURE DU VISITEUR
     ------------------------------------------------------------
     Choix assumé (règle produit) : le moment de la journée est
     déterminé UNE SEULE FOIS à partir de l'heure locale de l'appareil
     du visiteur, puis appliqué IDENTIQUEMENT à Bora ET à Marseille.
     Les deux destinations ne doivent jamais afficher deux ambiances
     différentes en même temps, même si l'heure réelle sur place
     diffère. C'est un choix artistique (continuité visuelle du hero
     50/50), pas un bug.
     ============================================================ */
  const PERIOD_BOUNDARIES = [
    { from: 6, to: 11, period: "morning" },
    { from: 11, to: 17, period: "day" },
    { from: 17, to: 20, period: "sunset" },
    // "night" couvre le reste (20h -> 6h, à cheval sur minuit)
  ];

  /** Source de vérité UNIQUE pour le moment de la journée : l'heure
   *  locale de l'appareil du visiteur (Date.getHours()), sans notion
   *  de fuseau de destination. Utilisée pour le thème ET pour les
   *  deux panneaux du hero. */
  function getVisitorTimePeriod() {
    const h = new Date().getHours();
    for (const b of PERIOD_BOUNDARIES) if (h >= b.from && h < b.to) return b.period;
    return "night";
  }

  function applyTimeTheme() {
    document.documentElement.setAttribute("data-theme", getVisitorTimePeriod());
  }

  /** Millisecondes avant la prochaine frontière horaire (6h/11h/17h/20h),
   *  pour une mise à jour propre sans polling agressif : un seul timer
   *  programmé pile au bon moment plutôt qu'une vérification fréquente. */
  function msUntilNextTimeBoundary() {
    const now = new Date();
    const boundaries = [6, 11, 17, 20];
    const next = new Date(now);
    const upcoming = boundaries.find((h) => h > now.getHours());
    if (upcoming !== undefined) {
      next.setHours(upcoming, 0, 0, 0);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(6, 0, 0, 0);
    }
    return Math.max(1000, next.getTime() - now.getTime());
  }

  function scheduleTimeThemeRefresh() {
    setTimeout(() => {
      applyTimeTheme();
      renderHeroPanelImages();
      scheduleTimeThemeRefresh();
    }, msUntilNextTimeBoundary());
  }

  /* ============================================================
     2bis. IMAGES DU HERO — même ambiance horaire pour les deux
     destinations (voir note ci-dessus). Fonctionne avant et après
     sélection : les deux panneaux partagent toujours le même
     suffixe (morning/day/sunset/night).
     ============================================================ */
  function renderHeroPanelImages() {
    const boraPanel = document.querySelector(".hero-panel-bora");
    const marseillePanel = document.querySelector(".hero-panel-marseille");
    if (!boraPanel && !marseillePanel) return;
    const period = getVisitorTimePeriod();
    if (boraPanel) boraPanel.style.backgroundImage = `url('${DATA.destinations.bora.heroImages[period]}')`;
    if (marseillePanel) marseillePanel.style.backgroundImage = `url('${DATA.destinations.marseille.heroImages[period]}')`;
  }

  /** Précharge discrètement le panorama de l'AUTRE destination (celle
   *  qui n'est pas encore choisie) afin que la transition au clic soit
   *  instantanée, sans jamais télécharger les 8 variantes d'un coup. */
  function preloadOtherDestinationHero(currentDestId) {
    const otherId = currentDestId === "bora" ? "marseille" : "bora";
    const other = DATA.destinations[otherId];
    if (!other) return;
    const period = getVisitorTimePeriod();
    const img = new Image();
    img.src = other.heroImages[period];

  }
  /* ============================================================
     2. DESTINATION (Bora Bora / Marseille)
     ============================================================ */
  function getSavedDestination() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === "bora" || v === "marseille" ? v : null;
    } catch (e) {
      return null; // localStorage indisponible (navigation privée stricte, etc.)
    }
  }
  function saveDestination(id) {
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* silencieux */ }
  }
  function clearDestination() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* silencieux */ }
  }
  function getDestinationData(id) {
    return DATA.destinations[id] || null;
  }

  /* ============================================================
     2bis. LANGUE (i18n)
     Le français est la langue de référence : tout ce qui n'est
     pas encore traduit dans i18n.js s'affiche automatiquement en
     français (voir la fonction t() plus bas). Changer de langue
     ne touche jamais à la destination choisie (clé de stockage
     distincte).
     ============================================================ */
  const LANG_STORAGE_KEY = "fareManaLang";
  const I18N = window.FareManaI18n;

  function getLanguage() {
    try {
      const v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v && I18N.supportedLangs.some((l) => l.code === v)) return v;
    } catch (e) { /* ignore */ }
    return I18N.defaultLang;
  }
  function saveLanguage(code) {
    try { localStorage.setItem(LANG_STORAGE_KEY, code); } catch (e) { /* ignore */ }
  }

  /** Traduit `path` (ex: "nav.accueil") dans la langue active.
   *  Si la clé n'existe pas pour cette langue, retourne `fallback`
   *  (en pratique : le texte français déjà présent). */
  function t(path, fallback) {
    const lang = getLanguage();
    if (lang === I18N.defaultLang) return fallback;
    const dict = I18N.strings[lang];
    if (!dict) return fallback;
    const value = path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
    return value !== undefined ? value : fallback;
  }

  /** Traduit tout élément statique marqué data-i18n="chemin.cle".
   *  Le texte français d'origine est capturé automatiquement au
   *  premier passage : aucune donnée à dupliquer pour le français. */
  function applyStaticTranslations(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
      if (el.dataset.i18nDefault === undefined) el.dataset.i18nDefault = el.textContent;
      el.textContent = t(el.getAttribute("data-i18n"), el.dataset.i18nDefault);
    });
  }

  function selectLanguage(code) {
    saveLanguage(code);
    document.documentElement.setAttribute("lang", code);
    renderHeader();
    renderFooter();
    applyStaticTranslations();
    const dest = getSavedDestination();
    if (dest) applyDestinationToPage(dest); else applyNoDestinationState();
    renderQuotesPage();
    renderFindUsPage();
    initQuiz();
    observeReveals();
  }

  /* ============================================================
     3. RÉSERVATION — un seul point de vérité pour tous les CTA
     ============================================================ */
  function getBookingHref(destId) {
    const dest = getDestinationData(destId) || DATA.destinations.bora;
    if (DATA.booking.mode === "whatsapp") return dest.whatsappHref;
    return DATA.booking.pageHref; // "contact" ou "page"
  }
  function wireBookingButtons(root) {
    (root || document).querySelectorAll("[data-booking-cta]").forEach((btn) => {
      const dest = getSavedDestination();
      const soinId = btn.getAttribute("data-soin");
      if (!dest) {
        // Pas encore de destination choisie : on ne présume pas du lieu,
        // on renvoie vers la page de contact plutôt que d'ouvrir un
        // WhatsApp au hasard. On transmet le soin concerné si connu.
        btn.setAttribute("href", soinId ? `contact.html?soin=${soinId}` : "contact.html");
        btn.removeAttribute("target");
        return;
      }
      btn.setAttribute("href", getBookingHref(dest));
      if (DATA.booking.mode === "whatsapp") btn.setAttribute("target", "_blank");
      else btn.removeAttribute("target");
    });
  }

  /* ============================================================
     4. HEADER — généré une seule fois ici, jamais dupliqué en HTML
     ============================================================ */
  function renderHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) return;
    const currentPage = document.body.getAttribute("data-page") || "";
    const dest = getSavedDestination();
    const destData = dest ? getDestinationData(dest) : null;

    const navLinks = DATA.nav.map((item) => {
      const isCurrent = item.href.replace(".html", "") === currentPage;
      const label = t(`nav.${item.key}`, item.label);
      return `<a href="${item.href}"${isCurrent ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const destBtnLabel = destData ? `📍 ${(t(`destShort.${destData.id}`, destData.shortLabel)).toUpperCase()}` : `📍 ${t("common.chooseDestinationShort", "CHOISIR").toUpperCase()}`;
    const destMenuItems = Object.values(DATA.destinations).map((d) => {
      const current = dest === d.id;
      const label = t(`destLabels.${d.id}`, d.label);
      return `<button type="button" data-set-dest="${d.id}" aria-current="${current}">${label}</button>`;
    }).join("");

    const currentLang = getLanguage();
    const langMenuItems = I18N.supportedLangs.map((l) => `
      <button type="button" data-set-lang="${l.code}" aria-current="${l.code === currentLang}">${l.code.toUpperCase()} — ${l.label}</button>
    `).join("");

    mount.innerHTML = `
      <div class="header-inner">
        <a href="index.html" class="logo">
          <span class="logo-mark">
            <img class="logo-img logo-img-dark" src="${DATA.brand.logoDark}" alt="" aria-hidden="true">
            <img class="logo-img logo-img-light" src="${DATA.brand.logoLight}" alt="" aria-hidden="true">
          </span>
          <span class="logo-text">
            <span class="logo-name">${DATA.brand.name}</span>
            <span class="logo-sub">${t("brand.tagline", DATA.brand.tagline)}</span>
          </span>
        </a>
        <nav class="main-nav" id="main-nav" aria-label="${t("common.ariaMainNav", "Navigation principale")}">${navLinks}</nav>
        <div class="header-actions">
          <div class="lang-switcher" id="lang-switcher">
            <button type="button" class="lang-btn" id="lang-btn" aria-haspopup="true" aria-expanded="false">
              ${currentLang.toUpperCase()} <span aria-hidden="true">▾</span>
            </button>
            <div class="lang-menu" id="lang-menu" role="menu">${langMenuItems}</div>
          </div>
          <div class="dest-switcher" id="dest-switcher">
            <button type="button" class="dest-btn" id="dest-btn" aria-haspopup="true" aria-expanded="false">
              ${destBtnLabel} <span aria-hidden="true">▾</span>
            </button>
            <div class="dest-menu" id="dest-menu" role="menu">${destMenuItems}</div>
          </div>
          <a href="#" class="btn btn-primary btn-sm" data-booking-cta>${t("common.bookingCta", "Prendre rendez-vous")}</a>
          <button type="button" class="nav-toggle" id="nav-toggle" aria-label="${t("common.ariaOpenMenu", "Ouvrir le menu")}" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>`;

    wireBookingButtons(mount);
    initHeaderScroll(mount.querySelector(".header-inner").closest(".site-header") || mount);
    initDestSwitcher();
    initLangSwitcher();
    initMobileNav();
  }

  function initHeaderScroll() {
    const header = document.getElementById("site-header");
    const hero = document.querySelector(".hero");
    function update() {
      const solid = !hero || window.scrollY > window.innerHeight * 0.7;
      header.classList.toggle("scrolled", window.scrollY > 30);
      header.classList.toggle("solid", !hero);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function initMobileNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      nav.style.cssText = open
        ? "display:flex;flex-direction:column;position:fixed;top:0;right:0;bottom:0;width:74%;max-width:320px;background:#F7F1E6;padding:110px 36px;gap:26px;font-size:16px;box-shadow:-20px 0 60px rgba(0,0,0,.18);color:#17301F;z-index:150;"
        : "";
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
      nav.style.cssText = "";
      toggle.setAttribute("aria-expanded", false);
    }));
  }

  function initDestSwitcher() {
    const switcher = document.getElementById("dest-switcher");
    const btn = document.getElementById("dest-btn");
    if (!switcher || !btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = switcher.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", () => {
      switcher.classList.remove("open");
      btn.setAttribute("aria-expanded", false);
    });
    switcher.querySelectorAll("[data-set-dest]").forEach((item) => {
      item.addEventListener("click", () => selectDestination(item.getAttribute("data-set-dest")));
    });
  }

  function initLangSwitcher() {
    const switcher = document.getElementById("lang-switcher");
    const btn = document.getElementById("lang-btn");
    if (!switcher || !btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = switcher.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", () => {
      switcher.classList.remove("open");
      btn.setAttribute("aria-expanded", false);
    });
    switcher.querySelectorAll("[data-set-lang]").forEach((item) => {
      item.addEventListener("click", () => selectLanguage(item.getAttribute("data-set-lang")));
    });
  }

  /* ============================================================
     5. FOOTER
     ============================================================ */
  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;
    const navLinks = DATA.nav.map((item) => `<a href="${item.href}">${t(`nav.${item.key}`, item.label)}</a>`).join("")
      + `<a href="les-mots-de-soraya.html">${t("nav.motsDeSoraya", "Les mots de Soraya")}</a>`;
    mount.innerHTML = `
      <div class="footer-inner">
        <div class="footer-brand"><img class="logo-img-static" src="${DATA.brand.logoLight}" alt="Fare Mana"><span class="script">${DATA.brand.name}</span></div>
        <nav class="footer-links" aria-label="${t("common.ariaFooterNav", "Navigation du pied de page")}">${navLinks}</nav>
        <div class="footer-social">
          <a href="${DATA.social.instagramHref}" target="_blank" rel="noopener">Instagram</a>
          <a href="${DATA.social.facebookHref}" target="_blank" rel="noopener">Facebook</a>
        </div>
      </div>
      <p class="footer-tagline">${t("brand.slogan", DATA.brand.slogan)}</p>
      <p class="footer-legal">
        <span>© ${new Date().getFullYear()} ${DATA.brand.name} — ${t("footer.rights", "Tous droits réservés")}</span>
        <a href="mentions-legales.html">${t("footer.legal", "Mentions légales")}</a>
        <a href="confidentialite.html">${t("footer.privacy", "Politique de confidentialité")}</a>
      </p>`;
  }

  function flowerSvg(extraClass) {
    return `<svg class="flower ${extraClass || ""}" viewBox="0 0 100 100" fill="none" stroke-width="3" stroke-linecap="round" aria-hidden="true">
      <g transform="translate(50,50)">
        <path d="M0,0 C -5,-15 -4,-28 0,-38 C 4,-28 5,-15 0,0 Z" transform="rotate(0)"/>
        <path d="M0,0 C -5,-15 -4,-28 0,-38 C 4,-28 5,-15 0,0 Z" transform="rotate(72)"/>
        <path d="M0,0 C -5,-15 -4,-28 0,-38 C 4,-28 5,-15 0,0 Z" transform="rotate(144)"/>
        <path d="M0,0 C -5,-15 -4,-28 0,-38 C 4,-28 5,-15 0,0 Z" transform="rotate(216)"/>
        <path d="M0,0 C -5,-15 -4,-28 0,-38 C 4,-28 5,-15 0,0 Z" transform="rotate(288)"/>
        <circle r="4.5" fill="currentColor" stroke="none"/>
      </g>
    </svg>`;
  }

  /* ============================================================
     6. SÉLECTION DE DESTINATION
     N'importe quel élément [data-pick-dest="bora|marseille"], où
     qu'il soit sur la page (hero, section "selon votre destination",
     tarifs, contact...), permet de choisir la destination.
     L'état est reflété sur <body data-selected="bora|marseille">
     pour piloter en CSS l'affichage "avant / après sélection".
     ============================================================ */
  function selectDestination(id, { push } = { push: true }) {
    document.body.setAttribute("data-selected", id);
    const hero = document.querySelector(".hero[data-hero-picker]");
    if (hero) hero.setAttribute("data-selected", id);
    if (push) saveDestination(id);
    applyTimeTheme();
    applyDestinationToPage(id);
    renderHeader();
    observeReveals();
  }

  function initHeroPicker() {
    const hero = document.querySelector(".hero[data-hero-picker]");
    const saved = getSavedDestination();
    if (saved) {
      document.body.setAttribute("data-selected", saved);
      if (hero) hero.setAttribute("data-selected", saved);
    }
    const changeBtn = hero && hero.querySelector("[data-change-dest]");
    if (changeBtn) {
      changeBtn.addEventListener("click", () => {
        hero.removeAttribute("data-selected");
        document.body.removeAttribute("data-selected");
        clearDestination();
        applyNoDestinationState();
        renderHeader();
      });
    }
  }

  function initDestPickers() {
    document.querySelectorAll("[data-pick-dest]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        selectDestination(el.getAttribute("data-pick-dest"));
      });
    });
  }

  /* ============================================================
     7. APPLIQUER LA DESTINATION AU CONTENU DE LA PAGE
     Toute section marquée [data-dest-field="chemin.dans.data"]
     ou [data-dest-text="cle"] est mise à jour automatiquement.
     ============================================================ */
  function applyDestinationToPage(id) {
    const dest = getDestinationData(id);
    if (!dest) return;
    document.querySelectorAll("[data-dest-label]").forEach((el) => { el.textContent = t(`destLabels.${id}`, dest.label); });
    document.querySelectorAll("[data-dest-sublabel]").forEach((el) => { el.textContent = t(`destSubLabel.${id}`, dest.subLabel); });
    document.querySelectorAll("[data-dest-phone]").forEach((el) => {
      el.textContent = dest.phone;
      if (el.tagName === "A") el.setAttribute("href", dest.phoneHref);
    });
    document.querySelectorAll("[data-dest-experience-title]").forEach((el) => { el.textContent = t(`destinations.${id}.experienceTitle`, dest.experience.title); });
    document.querySelectorAll("[data-dest-experience-intro]").forEach((el) => { el.textContent = t(`destinations.${id}.experienceIntro`, dest.experience.intro); });
    document.querySelectorAll("[data-dest-price]").forEach((el) => {
      const serviceId = el.getAttribute("data-dest-price");
      const svc = DATA.services.find((s) => s.id === serviceId);
      if (svc) el.textContent = formatServicePrice(svc, id);
    });
    document.querySelectorAll("[data-dest-currency-note]").forEach((el) => {
      const fr = dest.currency === "XPF" ? "Tous nos tarifs sont en francs CFP (XPF)." : "Tous nos tarifs sont en euros (€).";
      el.textContent = t(`common.currencyNote${dest.currency}`, fr);
    });
    const photoMount = document.getElementById("experience-photo");
    if (photoMount && dest.experienceImage) {
      photoMount.innerHTML = `<img src="${dest.experienceImage}" alt="">`;
    }
    wireBookingButtons(document);
    renderServiceCards(id);
    renderTestimonials(id);
    renderExperienceFeatures(id);
    renderSoinsPageGroups(id);
    renderTarifsPage(id);
    renderContactPage(id);
    renderApprovedReviews(id);
  }

  /* État initial / "changer de destination" : aucun prix, aucune info
     locale affichée — uniquement les soins (sans prix) et les
     éléments neutres de la page. */
  function applyNoDestinationState() {
    document.querySelectorAll("[data-dest-price]").forEach((el) => { el.textContent = ""; });
    document.querySelectorAll("[data-dest-currency-note]").forEach((el) => {
      if (el.dataset.i18nNoDestDefault === undefined) el.dataset.i18nNoDestDefault = el.textContent;
      el.textContent = t("home.tarifsChoosePrompt", el.dataset.i18nNoDestDefault);
    });
    renderServiceCards(null);
    renderSoinsPageGroups(null);
    renderTarifsPage(null);
    renderContactPage(null);
    renderApprovedReviews(null);
    wireBookingButtons(document);
    applyStaticTranslations();
  }

  /** Durée affichée. La durée est une valeur non traduisible (voir data.js),
   *  SAUF cas particuliers où le texte contient un connecteur linguistique
   *  ("ou"/"or") — ceux-ci sont gérés ici, dans un seul endroit. */
  function durationText(service) {
    return t(`durationOverrides.${service.id}`, service.duration);
  }

  function formatServicePrice(service, destId) {
    if (!destId) return null; // aucune destination choisie -> jamais de prix affiché
    const price = service.price[destId];
    const dest = getDestinationData(destId);
    if (price === "onDemand") return t("common.onDemandPrice", "Tarif sur demande");
    if (Array.isArray(price)) return price.map((p) => dest.formatPrice(p)).join(" / ");
    return dest.formatPrice(price);
  }

  /* ============================================================
     8. CARTES DE SOINS + FILTRES
     ============================================================ */
  let activeFilter = "all";
  function renderServiceCards(destId) {
    const grid = document.getElementById("services-grid");
    if (!grid) return;
    const featuredOnly = grid.hasAttribute("data-featured-only");
    let list = DATA.services.filter((s) => !featuredOnly || s.featured);
    if (activeFilter !== "all") list = list.filter((s) => s.category === activeFilter);

    grid.innerHTML = list.map((s) => serviceCardHtml(s, destId)).join("");
    grid.querySelectorAll("[data-open-service]").forEach((btn) => {
      btn.addEventListener("click", () => openServiceModal(btn.getAttribute("data-open-service"), destId));
    });
    applyStaticTranslations(grid);
    observeReveals();
  }
  function serviceCardHtml(s, destId) {
    const priceLabel = formatServicePrice(s, destId);
    const photo = s.image
      ? `<img src="${s.image}" alt="" loading="lazy">`
      : `<span class="visually-hidden">Photo de ${s.name}</span>${flowerSvg()}`;
    let priceArea;
    if (s.status === "comingSoon") {
      priceArea = `<span class="service-price">${t("common.comingSoon", "Bientôt disponible")}</span>`;
    } else if (!destId) {
      priceArea = `<span class="service-price service-price-prompt">${t("common.chooseDestinationShort", "Choisir une destination")}</span>`;
    } else {
      priceArea = `<span class="service-price">${priceLabel}</span>`;
    }
    return `
      <article class="card service-card reveal" id="${s.id}">
        ${s.signature ? `<span class="service-badge">${flowerSvg()} ${t("common.signatureTreatment", "Soin signature")}</span>` : ""}
        ${s.status === "comingSoon" ? `<span class="service-badge coming">${t("common.comingSoon", "À venir")}</span>` : ""}
        <div class="img-placeholder">${photo}</div>
        <button type="button" class="service-card-open" data-open-service="${s.id}">
          <div class="service-body">
            <h3 data-i18n="services.${s.id}.name">${s.name}</h3>
            <p class="subtitle" data-i18n="services.${s.id}.subtitle">${s.subtitle}</p>
            <div class="service-meta">
              <span>${durationText(s)}</span>
              ${priceArea}
            </div>
            <span class="link-arrow" style="font-size:13px;color:var(--lagoon);">${t("common.learnMore", "En savoir plus")} →</span>
          </div>
        </button>
      </article>`;
  }

  function initServiceFilters() {
    const filterButtons = document.querySelectorAll("[data-filter]");
    if (!filterButtons.length) return;
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.getAttribute("data-filter");
        filterButtons.forEach((b) => b.setAttribute("aria-pressed", b === btn));
        renderServiceCards(getSavedDestination());
      });
    });
  }

  /* ============================================================
     8bis. PAGE "MES SOINS" — cartes détaillées par univers
     N'a d'effet que si la page contient les conteneurs attendus
     (ids "soins-<groupe>-grid"). N'affecte pas l'accueil.
     ============================================================ */
  const SOINS_PAGE_GROUPS = {
    visage: ["kobido", "kobido-radiofrequence", "radiofrequence-visage"],
    corps: ["maderotherapie", "maderotherapie-lipocavitation", "ventre-plat", "jambes-legeres", "cupping"],
    massage: ["massage-polynesien"],
  };

  function soinCardHtml(s, destId) {
    const priceLabel = formatServicePrice(s, destId);
    const photo = s.image ? `<img src="${s.image}" alt="" loading="lazy">` : flowerSvg();
    let priceArea;
    if (s.status === "comingSoon") {
      priceArea = `<span class="soin-price">${t("common.comingSoon", "Bientôt disponible")}</span>`;
    } else if (!destId) {
      priceArea = `<button type="button" class="price-prompt-link" data-scroll-dest-picker>${t("common.chooseDestination", "Choisir une destination pour voir le tarif")}</button>`;
    } else {
      priceArea = `<span class="soin-price">${priceLabel}</span>`;
    }
    const ctaHtml = s.status === "comingSoon"
      ? `<a href="contact.html?soin=${s.id}" class="btn btn-ghost btn-sm">${t("common.notifyAtLaunch", "Être prévenu(e) au lancement")}</a>`
      : `<a href="#" class="btn btn-primary btn-sm" data-booking-cta data-soin="${s.id}">${t("common.bookingCta", "Prendre rendez-vous")}</a>`;
    return `
      <article class="card soin-card reveal" id="${s.id}">
        <div class="soin-card-img">
          ${s.signature ? `<span class="service-badge">${flowerSvg()} ${t("common.signatureTreatment", "Soin signature")}</span>` : ""}
          ${s.status === "comingSoon" ? `<span class="service-badge coming">${t("common.comingSoon", "À venir")}</span>` : ""}
          ${photo}
        </div>
        <div class="soin-card-body">
          <h3 data-i18n="services.${s.id}.name">${s.name}</h3>
          <p class="subtitle" data-i18n="services.${s.id}.subtitle">${s.subtitle}</p>
          <p class="soin-card-desc" data-i18n="services.${s.id}.description">${s.description}</p>
          <ul class="soin-benefits">${s.benefits.map((b, i) => `<li data-i18n="services.${s.id}.benefits.${i}">${b}</li>`).join("")}</ul>
          <div class="soin-card-footer">
            <div class="soin-card-meta"><span>${durationText(s)}</span>${priceArea}</div>
            <div class="soin-card-actions">
              ${ctaHtml}
              <button type="button" class="link-arrow" data-open-service="${s.id}" style="background:none;border:none;color:var(--lagoon);font-size:13px;cursor:pointer;">${t("common.detail", "En détail")} →</button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function renderSoinsPageGroups(destId) {
    let found = false;
    Object.keys(SOINS_PAGE_GROUPS).forEach((group) => {
      const mount = document.getElementById(`soins-${group}-grid`);
      if (!mount) return;
      found = true;
      const list = SOINS_PAGE_GROUPS[group]
        .map((id) => DATA.services.find((s) => s.id === id))
        .filter(Boolean);
      mount.innerHTML = list.map((s) => soinCardHtml(s, destId)).join("");
      mount.querySelectorAll("[data-open-service]").forEach((btn) => {
        btn.addEventListener("click", () => openServiceModal(btn.getAttribute("data-open-service"), destId));
      });
      mount.querySelectorAll("[data-scroll-dest-picker]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const switcher = document.getElementById("dest-switcher");
          if (switcher) { switcher.classList.add("open"); document.getElementById("dest-btn").focus(); }
        });
      });
      applyStaticTranslations(mount);
    });
    if (found) { wireBookingButtons(document); observeReveals(); }
  }

  function highlightFromHash() {
    const id = decodeURIComponent(location.hash.replace("#", ""));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el || !el.classList.contains("soin-card")) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight");
      setTimeout(() => el.classList.remove("highlight"), 2800);
    }, 350);
  }
  /* ============================================================
     8ter. PAGE "OÙ ME RETROUVER" — infos pratiques par destination
     N'a d'effet que si la page contient les conteneurs attendus.
     Le contenu (téléphone, adresse, horaires) vient uniquement de
     data.js — jamais dupliqué ici. L'ordre visuel des deux blocs
     (pas leur contenu) suit la destination sélectionnée, gérée en
     CSS via body[data-selected].
     ============================================================ */
  function renderFindUsPage() {
    const root = document.getElementById("destinations-flow");
    if (!root) return;
    ["bora", "marseille"].forEach((id) => {
      const dest = DATA.destinations[id];
      const block = root.querySelector(`[data-dest-block="${id}"]`);
      if (!dest || !block) return;
      const phoneEl = block.querySelector("[data-block-phone]");
      if (phoneEl) phoneEl.textContent = dest.phone;
      block.querySelectorAll("[data-block-phone-link]").forEach((a) => a.setAttribute("href", dest.phoneHref));
      block.querySelectorAll("[data-block-whatsapp]").forEach((a) => a.setAttribute("href", dest.whatsappHref));
      const addrEl = block.querySelector("[data-block-address]");
      if (addrEl) addrEl.innerHTML = dest.addressLines.map((line, i) => t(`destAddress.${id}.l${i}`, line)).join("<br>");
      const hoursEl = block.querySelector("[data-block-hours]");
      if (hoursEl) hoursEl.textContent = t(`destHours.${id}`, dest.hours);
      const mapEl = block.querySelector("[data-block-map]");
      if (mapEl) {
        if (dest.mapUrl) { mapEl.setAttribute("href", dest.mapUrl); mapEl.removeAttribute("aria-disabled"); mapEl.target = "_blank"; mapEl.rel = "noopener noreferrer"; mapEl.textContent = t("common.itinerary", "Itinéraire"); }
        else { mapEl.textContent = t("ouMeRetrouver.mapTodo", "Itinéraire à venir"); mapEl.setAttribute("aria-disabled", "true"); mapEl.removeAttribute("href"); }
      }
    });
  }
  /* ============================================================
     8quater. PAGE "TARIFS" — liste éditoriale par univers
     Les prix/durées viennent uniquement de DATA.services (data.js).
     Les 3 soins signature reprennent leur ritualName ; aucune autre
     page n'est affectée par ce champ additif.
     ============================================================ */
  const TARIFS_GROUPS = {
    visage: ["kobido", "kobido-radiofrequence", "radiofrequence-visage"],
    corps: ["maderotherapie", "ventre-plat", "jambes-legeres", "cupping"],
    massage: ["massage-polynesien"],
  };
  const TARIFS_SIGNATURE_IDS = ["kobido", "kobido-radiofrequence", "maderotherapie"];

  function tarifRowHtml(s, destId) {
    const isSignature = TARIFS_SIGNATURE_IDS.includes(s.id);
    const displayName = isSignature && s.ritualName
      ? `${t(`ritualNames.${s.id}`, s.ritualName)} — ${t(`services.${s.id}.name`, s.name)}`
      : t(`services.${s.id}.name`, s.name);
    const priceLabel = formatServicePrice(s, destId);
    let priceArea;
    if (s.status === "comingSoon") {
      priceArea = `<span class="tarif-price">${t("common.comingSoon", "Bientôt disponible")}</span>`;
    } else if (!destId) {
      priceArea = `<button type="button" class="price-prompt-link" data-scroll-dest-picker>${t("common.chooseDestinationShort", "Choisir une destination")}</button>`;
    } else {
      priceArea = `<span class="tarif-price">${priceLabel}</span>`;
    }
    return `
      <article class="tarif-row${isSignature ? " signature" : ""}" id="tarif-${s.id}">
        <div class="tarif-row-main">
          ${isSignature ? `<span class="tarif-signature-tag">${flowerSvg()} ${t("tarifsPage.signature", "Soin signature")}</span>` : ""}
          <h3>${displayName}</h3>
          ${s.subtitle ? `<p class="subtitle">${t(`services.${s.id}.subtitle`, s.subtitle)}</p>` : ""}
        </div>
        <div class="tarif-row-meta">
          <span class="tarif-duration">${durationText(s)}</span>
          ${priceArea}
        </div>
        <div class="tarif-row-actions">
          <a href="mes-soins.html#${s.id}" class="link-arrow">${t("tarifsPage.discoverSoin", "Découvrir ce soin")} →</a>
          ${s.status === "comingSoon"
            ? `<a href="contact.html?soin=${s.id}" class="btn btn-ghost btn-sm">${t("common.notifyAtLaunch", "Être prévenu(e) au lancement")}</a>`
            : `<a href="#" class="btn btn-ghost btn-sm" data-booking-cta data-soin="${s.id}">${t("common.bookingCta", "Prendre rendez-vous")}</a>`}
        </div>
      </article>`;
  }

  function renderTarifsPage(destId) {
    let found = false;
    Object.keys(TARIFS_GROUPS).forEach((group) => {
      const mount = document.getElementById(`tarifs-${group}-list`);
      if (!mount) return;
      found = true;
      const list = TARIFS_GROUPS[group].map((id) => DATA.services.find((s) => s.id === id)).filter(Boolean);
      mount.innerHTML = list.map((s) => tarifRowHtml(s, destId)).join("");
      mount.querySelectorAll("[data-scroll-dest-picker]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const picker = document.getElementById("tarifs-picker");
          if (picker) picker.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    });
    if (found) { wireBookingButtons(document); applyStaticTranslations(); observeReveals(); }
  }
  /* ============================================================
     8quinto. PAGE "CONTACT"
     Coordonnées uniquement depuis DATA (destinations + social) —
     jamais dupliquées ici. Le champ "soin souhaité" peut être
     prérempli via ?soin=<id> (transmis depuis les boutons
     "Prendre rendez-vous" / "Être prévenu(e)" ailleurs sur le site).
     ============================================================ */
  function renderContactPage(destId) {
    const root = document.getElementById("contact-page");
    if (!root) return;

    // Champ Destination du formulaire, tenu à jour à chaque changement
    const destSelect = root.querySelector("[name='destination']");
    if (destSelect && destId) destSelect.value = destId;

    // Réseaux sociaux (indépendants de la destination)
    root.querySelectorAll("[data-social-instagram]").forEach((el) => el.setAttribute("href", DATA.social.instagramHref));
    root.querySelectorAll("[data-social-instagram-label]").forEach((el) => { el.textContent = DATA.social.instagramLabel; });
    root.querySelectorAll("[data-social-facebook]").forEach((el) => el.setAttribute("href", DATA.social.facebookHref));
    root.querySelectorAll("[data-social-facebook-label]").forEach((el) => { el.textContent = DATA.social.facebookLabel; });
    root.querySelectorAll("[data-social-email]").forEach((el) => el.setAttribute("href", `mailto:${DATA.social.email}`));
    root.querySelectorAll("[data-social-email-label]").forEach((el) => { el.textContent = DATA.social.email; });

    // Coordonnées propres à la destination sélectionnée
    if (destId) {
      const dest = getDestinationData(destId);
      root.querySelectorAll("[data-contact-phone]").forEach((el) => { el.textContent = dest.phone; });
      root.querySelectorAll("[data-contact-phone-link]").forEach((el) => { el.setAttribute("href", dest.phoneHref); });
      root.querySelectorAll("[data-contact-whatsapp]").forEach((el) => { el.setAttribute("href", dest.whatsappHref); });
      root.querySelectorAll("[data-contact-address]").forEach((el) => { el.innerHTML = dest.addressLines.map((line, i) => t(`destAddress.${destId}.l${i}`, line)).join("<br>"); });
      root.querySelectorAll("[data-contact-hours]").forEach((el) => { el.textContent = t(`destHours.${destId}`, dest.hours); });
      root.querySelectorAll("[data-contact-map]").forEach((el) => {
        if (dest.mapUrl) { el.setAttribute("href", dest.mapUrl); el.removeAttribute("aria-disabled"); el.target = "_blank"; el.rel = "noopener noreferrer"; el.textContent = t("common.itinerary", "Itinéraire"); }
        else { el.setAttribute("aria-disabled", "true"); el.removeAttribute("href"); el.textContent = t("ouMeRetrouver.mapTodo", "Itinéraire à venir"); }
      });
      root.querySelectorAll("[data-contact-map-link]").forEach((el) => {
        if (dest.mapUrl) { el.setAttribute("href", dest.mapUrl); el.removeAttribute("aria-disabled"); }
        else { el.setAttribute("aria-disabled", "true"); el.removeAttribute("href"); }
        el.setAttribute("aria-label", `${t("contactPage.mapAriaLabel", "Voir l'itinéraire vers")} ${t(`destLabels.${destId}`, dest.label)}`);
      });
      root.querySelectorAll("[data-contact-map-img]").forEach((el) => {
        el.src = dest.mapImage;
        el.alt = t("contactPage.mapAlt", "Carte de localisation") + " — " + t(`destLabels.${destId}`, dest.label);
      });
      root.querySelectorAll("[data-contact-photo]").forEach((el) => {
        const period = getVisitorTimePeriod();
        el.style.backgroundImage = `url('${dest.heroImages[period]}')`;
      });
      const introEl = root.querySelector("[data-contact-intro]");
      if (introEl) {
        const frFallback = destId === "bora"
          ? "Pour toute question, réservation ou demande particulière, n'hésitez pas à me contacter — sur le Motu, je suis à votre écoute."
          : "Pour toute question, réservation ou demande particulière, n'hésitez pas à me contacter — à Marseille et ses environs, je suis à votre écoute.";
        introEl.textContent = t(`contactPage.intro${destId === "bora" ? "Bora" : "Marseille"}`, frFallback);
      }
    }

    // Liste des soins (select) — reconstruite à chaque appel pour rester traduite,
    // en conservant la sélection en cours.
    const soinSelect = root.querySelector("[name='soin']");
    if (soinSelect) {
      const params = new URLSearchParams(location.search);
      const soinParam = params.get("soin");
      const currentValue = soinSelect.value || (soinParam && DATA.services.some((s) => s.id === soinParam) ? soinParam : "");
      soinSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = t("contactPage.soinPlaceholder", "Aucune préférence");
      soinSelect.appendChild(placeholder);
      DATA.services.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = t(`services.${s.id}.name`, s.name);
        soinSelect.appendChild(opt);
      });
      if (currentValue) soinSelect.value = currentValue;
    }
  }
  /* ============================================================
     8sexto. PHOTO DE SORAYA (page Qui suis-je)
     Point d'édition unique : DATA.soraya.photo dans data.js.
     Tant qu'il est vide, le placeholder élégant reste affiché.
     ============================================================ */
  function renderSorayaPhoto() {
    document.querySelectorAll(".soraya-photo-mount").forEach((mount) => {
      const img = mount.querySelector(".soraya-photo-img");
      if (!img || !DATA.soraya.photo) return;
      img.src = DATA.soraya.photo;
      img.style.display = "block";
      mount.classList.add("has-photo");
    });
  }

  /* ============================================================
     8septimo. PAGE "LES MOTS DE SORAYA"
     Citations : structure/ordre/image/destination gérés uniquement
     dans data.js. Avis : agrège les témoignages déjà présents par
     destination, avec filtre et mise en avant de la destination
     actuellement sélectionnée.
     ============================================================ */
  function renderQuotesPage() {
    const mount = document.getElementById("quotes-grid");
    if (!mount) return;
    mount.innerHTML = DATA.quotes.map((q, i) => `
      <article class="quote-card${i % 3 === 2 ? " variant-tall" : ""} reveal">
        <img src="${q.image}" alt="" loading="lazy">
        <div class="quote-card-text">
          <span class="mark" aria-hidden="true">“</span>
          <p data-i18n="quotes.${q.id}">${q.text}</p>
        </div>
      </article>`).join("");
    applyStaticTranslations(mount);
    observeReveals();
  }

  /* ============================================================
     SUPABASE — avis clients (base persistante, publication auto)
     ------------------------------------------------------------
     Aucune clé secrète ici : "anonKey" est volontairement publique
     (comme pour tout projet Supabase côté navigateur) ; la sécurité
     réelle vient des règles RLS + de la vue publique côté serveur
     (voir SUPABASE-SETUP.md). Tant que url/anonKey restent les
     valeurs TODO, toutes les fonctions ci-dessous se comportent de
     façon sûre : rien n'est simulé, rien n'est publié.
     ============================================================ */
  function isSupabaseConfigured() {
    return DATA.supabase && DATA.supabase.url && DATA.supabase.anonKey
      && DATA.supabase.url !== "SUPABASE_URL_TODO" && DATA.supabase.anonKey !== "SUPABASE_ANON_KEY_TODO";
  }
  function supabaseRest(path, options) {
    const opts = options || {};
    return fetch(`${DATA.supabase.url}/rest/v1/${path}`, {
      ...opts,
      headers: {
        apikey: DATA.supabase.anonKey,
        Authorization: `Bearer ${(opts.accessToken) || DATA.supabase.anonKey}`,
        "Content-Type": "application/json",
        ...(opts.headers || {}),
      },
    });
  }

  /** Récupère les avis publiés depuis la vue publique Supabase
   *  (jamais la table complète : l'email privé n'y figure pas).
   *  Reste silencieux et sûr si Supabase n'est pas configuré. */
  function fetchPublishedReviews() {
    if (!isSupabaseConfigured()) return Promise.resolve([]);
    return supabaseRest("reviews_public?select=*&order=created_at.desc", { headers: { Prefer: "return=representation" } })
      .then((res) => (res.ok ? res.json() : []))
      .catch(() => []);
  }
  /** Rend les avis clients PUBLIÉS, lus depuis Supabase (jamais depuis
   *  une liste locale statique). Tant que Supabase n'est pas configuré,
   *  ou tant qu'il n'existe aucun avis publié, la section entière reste
   *  masquée : jamais de grille vide, jamais de faux avis. */
  let testimonialFilter = "all";
  let cachedReviews = null;
  function renderApprovedReviews(destId) {
    const mounts = document.querySelectorAll("[data-reviews-grid]");
    const sections = document.querySelectorAll("[data-reviews-section]");
    if (!mounts.length && !sections.length) return;
    const paint = (all) => {
      let list = testimonialFilter === "all" ? all : all.filter((r) => r.destination === testimonialFilter);
      if (testimonialFilter === "all" && destId) {
        list = [...list].sort((a, b) => (a.destination === destId ? -1 : 1) - (b.destination === destId ? -1 : 1));
      }
      mounts.forEach((mount) => {
        mount.innerHTML = list.map((r) => `
          <article class="card testimonial-card reveal">
            <div class="testimonial-stars" aria-hidden="true">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
            <p style="font-style:italic;margin-bottom:16px;">“${r.review_text}”</p>
            <p class="eyebrow" style="margin:0;">${r.first_name}</p>
            <span class="testimonial-dest-tag">${t(`destLabels.${r.destination}`, DATA.destinations[r.destination].label)}${r.treatment ? " · " + r.treatment : ""}</span>
          </article>`).join("");
      });
      sections.forEach((section) => { section.style.display = all.length > 0 ? "" : "none"; });
      observeReveals();
    };
    if (cachedReviews) { paint(cachedReviews); return; }
    fetchPublishedReviews().then((all) => { cachedReviews = all; paint(all); });
  }

  function initTestimonialFilters(destId) {
    const buttons = document.querySelectorAll("[data-testimonial-filter]");
    if (!buttons.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        testimonialFilter = btn.getAttribute("data-testimonial-filter");
        buttons.forEach((b) => b.setAttribute("aria-pressed", b === btn));
        renderApprovedReviews(getSavedDestination());
      });
    });
  }

  let lastFocusedEl = null;
  function openServiceModal(serviceId, destId) {
    const s = DATA.services.find((x) => x.id === serviceId);
    if (!s) return;
    lastFocusedEl = document.activeElement;
    const overlay = document.getElementById("service-modal");
    const priceLabel = formatServicePrice(s, destId);
    const imageHtml = s.image ? `<img src="${s.image}" alt="">` : flowerSvg();
    let priceDisplay = `<strong>${t("common.comingSoon", "Bientôt disponible")}</strong>`;
    if (s.status !== "comingSoon") {
      priceDisplay = destId
        ? `<strong>${priceLabel}</strong>`
        : `<a href="#" class="price-prompt-link" data-scroll-dest-picker>${t("common.chooseDestination", "Choisir une destination pour voir le tarif")}</a>`;
    }
    overlay.querySelector(".modal").innerHTML = `
      <button type="button" class="modal-close" data-modal-close aria-label="${t("common.ariaClose", "Fermer")}">✕</button>
      <div class="modal-image">${imageHtml}</div>
      <div class="modal-body">
        <h3 id="modal-title" data-i18n="services.${s.id}.name">${s.name}</h3>
        <p class="subtitle" data-i18n="services.${s.id}.subtitle">${s.subtitle}</p>
        <p class="desc" data-i18n="services.${s.id}.description">${s.description}</p>
        <ul class="modal-benefits">${s.benefits.map((b, i) => `<li data-i18n="services.${s.id}.benefits.${i}">${b}</li>`).join("")}</ul>
        <div class="modal-price-row">
          <span>${durationText(s)} · ${s.category === "visage" ? t("common.filterFace", "Soin visage") : t("common.filterBody", "Soin corps")}</span>
          ${priceDisplay}
        </div>
        <div class="modal-actions">
          ${s.status === "comingSoon"
            ? `<a href="contact.html?soin=${s.id}" class="btn btn-ghost">${t("common.notifyAtLaunch", "Être prévenu(e) au lancement")}</a>`
            : `<a href="#" class="btn btn-primary" data-booking-cta data-soin="${s.id}">${t("common.bookingCta", "Prendre rendez-vous")}</a>`}
          <a href="mes-soins.html#${s.id}" class="btn btn-ghost">${t("common.learnMore", "En savoir plus")}</a>
        </div>
      </div>`;
    applyStaticTranslations(overlay);
    const scrollBtn = overlay.querySelector("[data-scroll-dest-picker]");
    if (scrollBtn) scrollBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeServiceModal();
      const hero = document.querySelector(".hero[data-hero-picker]");
      if (hero) hero.scrollIntoView({ behavior: "smooth" });
    });
    wireBookingButtons(overlay);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    overlay.querySelector(".modal-close").focus();
  }
  function closeServiceModal() {
    const overlay = document.getElementById("service-modal");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  /* ============================================================
     9bis. MODAL "LAISSER UN AVIS"
     Un avis soumis ici part par e-mail (Formspree) en tant que
     PROPOSITION — il n'est jamais ajouté automatiquement à
     DATA.reviewsApproved. Seule une intervention manuelle dans
     data.js (après lecture/validation par Soraya) le rend public.
     ============================================================ */
  let reviewLastFocusedEl = null;
  function injectReviewModal() {
    if (document.getElementById("review-modal")) return;
    const overlay = document.createElement("div");
    overlay.id = "review-modal";
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "review-modal-title");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="modal review-modal">
        <button type="button" class="modal-close" data-review-modal-close aria-label="${t("common.ariaClose", "Fermer")}">✕</button>
        <div class="modal-body" style="padding:8px 4px;">
          <h3 id="review-modal-title" data-i18n="motsPage.leaveReview">Laisser un avis</h3>
          <p class="subtitle" style="margin-bottom:22px;" data-i18n="motsPage.reviewFormLead">Votre e-mail ne sera jamais publié — il sert uniquement à la validation de votre avis.</p>
          <form id="review-form" novalidate>
            <input type="text" name="company" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;" aria-hidden="true">
            <div class="form-grid">
              <div class="field">
                <label for="rf-firstname" data-i18n="motsPage.firstNameLabel">Prénom</label>
                <input type="text" id="rf-firstname" name="firstName" required maxlength="40">
                <span class="field-error" data-i18n="common.fieldRequired">Ce champ est requis.</span>
              </div>
              <div class="field">
                <label for="rf-destination" data-i18n="contactPage.destinationLabel">Destination</label>
                <select id="rf-destination" name="destination" required>
                  <option value="" data-i18n="contactPage.destinationPlaceholder">Choisir une destination</option>
                  <option value="bora" data-i18n="destLabels.bora">Bora Bora</option>
                  <option value="marseille" data-i18n="destLabels.marseille">Marseille &amp; environs</option>
                </select>
              </div>
              <div class="field full">
                <label for="rf-soin" data-i18n="motsPage.treatmentLabel">Soin reçu (facultatif)</label>
                <select id="rf-soin" name="treatment"></select>
              </div>
              <div class="field full">
                <label data-i18n="motsPage.ratingLabel">Note</label>
                <div class="review-stars" data-review-stars role="radiogroup" aria-label="${t("motsPage.ratingLabel", "Note")}">
                  ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="review-star" data-star="${n}" role="radio" aria-checked="false" aria-label="${n}/5">★</button>`).join("")}
                </div>
                <input type="hidden" name="rating" required value="">
                <span class="field-error" data-star-error data-i18n="motsPage.ratingRequired">Merci de choisir une note.</span>
              </div>
              <div class="field full">
                <label for="rf-text" data-i18n="motsPage.reviewTextLabel">Votre avis</label>
                <textarea id="rf-text" name="reviewText" rows="4" required maxlength="600"></textarea>
                <span class="field-error" data-i18n="common.fieldRequired">Ce champ est requis.</span>
              </div>
              <div class="field full">
                <label for="rf-email" data-i18n="motsPage.privateEmailLabel">Email (privé, non publié)</label>
                <input type="email" id="rf-email" name="email" required>
                <span class="field-error" data-i18n="common.fieldRequired">Ce champ est requis.</span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;" data-i18n="motsPage.submitReview">Envoyer mon avis</button>
            <p class="form-note" data-review-status></p>
          </form>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Options de soin (réutilise la liste centralisée des soins)
    const soinSelect = overlay.querySelector("[name='treatment']");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("contactPage.soinPlaceholder", "Aucune préférence");
    soinSelect.appendChild(placeholder);
    DATA.services.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = t(`services.${s.id}.name`, s.name);
      opt.textContent = t(`services.${s.id}.name`, s.name);
      soinSelect.appendChild(opt);
    });

    // Étoiles accessibles (souris + clavier)
    const starButtons = overlay.querySelectorAll("[data-star]");
    const ratingInput = overlay.querySelector("input[name='rating']");
    function setRating(n) {
      ratingInput.value = n;
      starButtons.forEach((b) => {
        const active = parseInt(b.getAttribute("data-star"), 10) <= n;
        b.classList.toggle("active", active);
        b.setAttribute("aria-checked", parseInt(b.getAttribute("data-star"), 10) === n);
      });
    }
    starButtons.forEach((b) => {
      b.addEventListener("click", () => setRating(parseInt(b.getAttribute("data-star"), 10)));
      b.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setRating(Math.min(5, parseInt(ratingInput.value || 0, 10) + 1)); starButtons[parseInt(ratingInput.value, 10) - 1].focus(); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setRating(Math.max(1, parseInt(ratingInput.value || 0, 10) - 1)); starButtons[parseInt(ratingInput.value, 10) - 1].focus(); }
      });
    });

    overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.hasAttribute("data-review-modal-close")) closeReviewModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("open")) closeReviewModal(); });

    const form = overlay.querySelector("#review-form");
    const destSelect = overlay.querySelector("[name='destination']");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("input[required], textarea[required], select[required]").forEach((input) => {
        const errorEl = input.closest(".field")?.querySelector(".field-error");
        const ok = input.checkValidity();
        if (errorEl) errorEl.classList.toggle("show", !ok);
        if (!ok) valid = false;
      });
      const starError = overlay.querySelector("[data-star-error]");
      const ratingOk = !!ratingInput.value;
      if (starError) starError.classList.toggle("show", !ratingOk);
      if (!ratingOk) valid = false;
      const status = overlay.querySelector("[data-review-status]");
      if (!valid) {
        if (status) { status.style.color = "var(--danger)"; status.textContent = t("common.formCheckFields", "Merci de vérifier les champs en rouge avant d'envoyer."); }
        return;
      }
      const honeypot = form.querySelector("input[name='company']");
      if (honeypot && honeypot.value) return;

      if (!isSupabaseConfigured()) {
        if (status) { status.style.color = "var(--ink-soft)"; status.textContent = t("motsPage.reviewFormNotConnected", "La collecte des avis n'est pas encore connectée. En attendant, écrivez-moi directement via la page Contact."); }
        return;
      }
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      if (status) { status.style.color = "var(--ink-soft)"; status.textContent = t("common.formSending", "Envoi en cours…"); }
      const fd = new FormData(form);
      const payload = {
        first_name: String(fd.get("firstName") || "").slice(0, 60),
        destination: fd.get("destination"),
        treatment: fd.get("treatment") || null,
        rating: parseInt(fd.get("rating"), 10),
        review_text: String(fd.get("reviewText") || "").slice(0, 700),
        email_private: fd.get("email"),
      };
      supabaseRest("reviews", { method: "POST", body: JSON.stringify(payload) })
        .then((res) => {
          if (!res.ok) throw new Error("bad status");
          form.reset();
          setRating(0);
          cachedReviews = null; // force un rechargement pour inclure ce nouvel avis
          renderApprovedReviews(getSavedDestination());
          if (status) { status.style.color = "var(--lagoon)"; status.textContent = t("motsPage.reviewSubmitted", "Merci pour votre avis. Il a bien été publié."); }
        })
        .catch(() => {
          if (status) { status.style.color = "var(--danger)"; status.textContent = t("motsPage.reviewFormError", "L'envoi a échoué. Vous pouvez réessayer ou me contacter via la page Contact."); }
        })
        .finally(() => { if (submitBtn) submitBtn.disabled = false; });
    });
  }

  function openReviewModal() {
    injectReviewModal();
    const overlay = document.getElementById("review-modal");
    if (!overlay) return;
    const destSelect = overlay.querySelector("[name='destination']");
    const saved = getSavedDestination();
    if (destSelect && saved) destSelect.value = saved;
    applyStaticTranslations(overlay);
    reviewLastFocusedEl = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstField = overlay.querySelector("#rf-firstname");
    if (firstField) firstField.focus();
  }
  function closeReviewModal() {
    const overlay = document.getElementById("review-modal");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (reviewLastFocusedEl) reviewLastFocusedEl.focus();
  }
  function initReviewModalTriggers() {
    document.querySelectorAll("[data-open-review-modal]").forEach((btn) => {
      btn.addEventListener("click", openReviewModal);
    });
  }

  function initModal() {
    const overlay = document.getElementById("service-modal");
    if (!overlay) return;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.hasAttribute("data-modal-close")) closeServiceModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeServiceModal();
      if (e.key === "Tab" && overlay.classList.contains("open")) {
        const focusable = overlay.querySelectorAll("button,a[href]");
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ============================================================
     10. TÉMOIGNAGES
     ============================================================ */
  function renderTestimonials(destId) {
    const mount = document.getElementById("testimonials-grid");
    if (!mount) return;
    const dest = getDestinationData(destId);
    const max = mount.hasAttribute("data-limit") ? parseInt(mount.getAttribute("data-limit"), 10) : dest.testimonials.length;
    mount.innerHTML = dest.testimonials.slice(0, max).map((tm, i) => `
      <div class="card reveal" style="padding:26px;">
        <p style="font-style:italic;margin-bottom:14px;">“${t(`destinations.${destId}.testimonials.t${i}`, tm.text)}”</p>
        <p class="eyebrow" style="margin:0;">${tm.author}</p>
      </div>`).join("");
    observeReveals();
  }

  /* ============================================================
     11. FEATURES "EXPÉRIENCE LOCALE"
     ============================================================ */
  function renderExperienceFeatures(destId) {
    const mount = document.getElementById("experience-features");
    if (!mount) return;
    const dest = getDestinationData(destId);
    mount.innerHTML = dest.experience.features.map((f, i) => `
      <div class="reveal" style="text-align:center;">
        ${flowerSvg()}
        <h3 style="font-size:16px;margin:12px 0 6px;">${t(`destinations.${destId}.features.f${i}.title`, f.title)}</h3>
        <p style="font-size:13.5px;">${t(`destinations.${destId}.features.f${i}.text`, f.text)}</p>
      </div>`).join("");
  }

  /* ============================================================
     12. QUIZ "QUEL SOIN EST FAIT POUR VOUS ?"
     ============================================================ */
  function initQuiz() {
    const root = document.getElementById("soin-quiz");
    if (!root) return;
    const steps = DATA.quiz.steps;
    let current = 0;
    const answers = {};

    function renderStep() {
      const step = steps[current];
      root.innerHTML = `
        <div class="quiz-progress">${steps.map((_, i) => `<span class="${i <= current ? "active" : ""}"></span>`).join("")}</div>
        <p class="quiz-question">${t(`quiz.${step.key}.question`, step.question)}</p>
        <div class="quiz-options">
          ${step.options.map((opt) => `<button type="button" class="quiz-option" data-value="${opt.value}">${t(`quiz.${step.key}.options.${opt.value}`, opt.label)}</button>`).join("")}
        </div>`;
      root.querySelectorAll(".quiz-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          answers[step.key] = btn.getAttribute("data-value");
          current++;
          if (current < steps.length) renderStep(); else renderResult();
        });
      });
    }

    function renderResult() {
      const destId = getSavedDestination();
      const rec = DATA.quiz.resolve(answers);
      const main = DATA.services.find((s) => s.id === rec.main);
      const alt = DATA.services.find((s) => s.id === rec.alt);
      const mainName = t(`services.${main.id}.name`, main.name);
      const priceLine = destId
        ? `${durationText(main)} · ${formatServicePrice(main, destId)}`
        : `${durationText(main)} · <button type="button" class="price-prompt-link" data-quiz-pick-dest>${t("common.chooseDestinationShort", "choisir une destination pour voir le tarif")}</button>`;
      root.innerHTML = `
        <div class="quiz-result">
          <p class="eyebrow">${t("quiz.recommended", "Votre rituel recommandé")}</p>
          <h3>${mainName}</h3>
          <p data-i18n="services.${main.id}.description">${main.description}</p>
          <p style="margin-top:10px;font-size:13px;color:var(--ink-soft);">${priceLine}</p>
          <div class="quiz-actions">
            <button type="button" class="btn btn-primary" data-open-service="${main.id}">${t("quiz.discoverTreatment", "Découvrir ce soin")}</button>
            <a href="#" class="btn btn-ghost" data-booking-cta>${t("common.bookingCta", "Prendre rendez-vous")}</a>
          </div>
          ${alt ? `<p style="margin-top:22px;font-size:13px;color:var(--ink-soft);">${t("quiz.alternative", "Alternative possible")} : <strong data-i18n="services.${alt.id}.name">${alt.name}</strong></p>` : ""}
          <button type="button" class="quiz-restart" data-quiz-restart>${t("common.restartQuiz", "Recommencer le questionnaire")}</button>
        </div>`;
      applyStaticTranslations(root);
      root.querySelector("[data-open-service]").addEventListener("click", (e) => {
        openServiceModal(e.target.getAttribute("data-open-service"), getSavedDestination());
      });
      wireBookingButtons(root);
      const pickBtn = root.querySelector("[data-quiz-pick-dest]");
      if (pickBtn) pickBtn.addEventListener("click", () => {
        const hero = document.querySelector(".hero[data-hero-picker]");
        if (hero) hero.scrollIntoView({ behavior: "smooth" });
      });
      root.querySelector("[data-quiz-restart]").addEventListener("click", () => { current = 0; renderStep(); });
    }

    renderStep();
  }

  /* ============================================================
     13. FORMULAIRE DE CONTACT
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const destSelect = form.querySelector("[name='destination']");
    if (destSelect) {
      const saved = getSavedDestination();
      if (saved) destSelect.value = saved;
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll("input[required], textarea[required]").forEach((input) => {
        input.setAttribute("data-touched", "true");
        const errorEl = input.parentElement.querySelector(".field-error");
        const ok = input.checkValidity();
        if (errorEl) errorEl.classList.toggle("show", !ok);
        if (!ok) valid = false;
      });
      const status = form.querySelector("[data-form-status]");
      if (!valid) {
        if (status) { status.textContent = t("common.formCheckFields", "Merci de vérifier les champs en rouge avant d'envoyer."); status.style.color = "var(--danger)"; }
        return;
      }
      // Honeypot anti-spam : champ invisible pour les humains. S'il est
      // rempli, la soumission vient très probablement d'un robot — on
      // n'envoie rien mais on ne le montre pas à l'expéditeur du spam.
      const honeypot = form.querySelector("input[name='company']");
      if (honeypot && honeypot.value) return;

      const submitBtn = form.querySelector("button[type='submit']");
      const savedDest = getSavedDestination();
      const atWord = t("common.atWord", "au");
      const directContactLine = savedDest
        ? `${atWord} ${getDestinationData(savedDest).phone}`
        : `${atWord} ${DATA.destinations.bora.phone} (Bora Bora) ${t("common.orWord", "ou")} ${atWord} ${DATA.destinations.marseille.phone} (Marseille)`;

      // Service d'envoi non encore configuré : on le dit honnêtement,
      // on ne simule jamais un envoi réussi.
      if (!DATA.contactFormEndpoint || DATA.contactFormEndpoint === "FORMSPREE_ENDPOINT_TODO") {
        if (status) {
          status.style.color = "var(--ink-soft)";
          status.textContent = t("common.formNotConnected", "Ce formulaire n'est pas encore connecté à un service d'envoi. En attendant, contactez-moi directement {phone}, ou par e-mail à {email}.")
            .replace("{phone}", directContactLine).replace("{email}", DATA.social.email);
        }
        return;
      }

      // Envoi réel. Anti-double-clic : le bouton est désactivé pendant
      // la requête et le succès n'est affiché qu'après une réponse HTTP
      // réellement positive du service — jamais avant, jamais en cas
      // d'échec réseau.
      if (submitBtn) submitBtn.disabled = true;
      if (status) { status.style.color = "var(--ink-soft)"; status.textContent = t("common.formSending", "Envoi en cours…"); }
      const formData = new FormData(form);
      fetch(DATA.contactFormEndpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      })
        .then((res) => {
          if (res.ok) {
            form.reset();
            if (destSelect && savedDest) destSelect.value = savedDest;
            if (status) { status.style.color = "var(--lagoon)"; status.textContent = t("common.formSuccess", "Merci, votre message a bien été envoyé. Je vous répondrai dans les meilleurs délais."); }
          } else {
            throw new Error("bad status");
          }
        })
        .catch(() => {
          if (status) {
            status.style.color = "var(--danger)";
            status.textContent = t("common.formError", "L'envoi a échoué. Contactez-moi directement {phone}, ou par e-mail à {email}.")
              .replace("{phone}", directContactLine).replace("{email}", DATA.social.email);
          }
        })
        .finally(() => { if (submitBtn) submitBtn.disabled = false; });
    });
  }

  /* ============================================================
     14. RÉVÉLATION AU DÉFILEMENT
     ============================================================ */
  let revealObserver = null;
  function observeReveals() {
    if (!revealObserver) return;
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => revealObserver.observe(el));
  }
  function initReveal() {
    document.body.classList.add("js-anim");
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObserver.unobserve(e.target); } });
    }, { threshold: 0.12 });
    observeReveals();
  }

  /* ============================================================
     INITIALISATION GLOBALE
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    applyTimeTheme();
    renderHeroPanelImages();
    document.documentElement.setAttribute("lang", getLanguage());
    renderHeader();
    renderFooter();
    initHeroPicker();
    initDestPickers();
    initModal();
    initServiceFilters();
    initQuiz();
    initContactForm();

    const dest = getSavedDestination();
    if (dest) { applyDestinationToPage(dest); preloadOtherDestinationHero(dest); }
    else applyNoDestinationState();
    wireBookingButtons(document);
    applyStaticTranslations();
    renderFindUsPage();
    renderSorayaPhoto();
    renderQuotesPage();
    initTestimonialFilters();
    initReviewModalTriggers();
    initReveal();
    highlightFromHash();
  });

  // ré-applique le thème si l'onglet reste ouvert pendant un changement de créneau horaire
  // Mise à jour propre au franchissement d'une frontière horaire (06h/11h/17h/20h),
  // sans polling agressif : un seul timer programmé, jamais de vérification en boucle.
  scheduleTimeThemeRefresh();
})();

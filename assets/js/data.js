/**
 * ============================================================
 * FARE MANA — DONNÉES CENTRALES DU SITE
 * ============================================================
 * C'est ICI, et uniquement ici, que se modifient :
 *   - les textes de marque et le slogan
 *   - la navigation
 *   - les coordonnées (téléphones, email, réseaux sociaux)
 *   - les informations par destination (Bora Bora / Marseille)
 *   - les soins et leurs tarifs
 *   - les avis clients
 *   - les citations "Les mots de Soraya"
 *
 * Toutes les pages HTML lisent ce fichier via site.js.
 * Il n'y a AUCUNE donnée écrite en dur ailleurs dans le site :
 * si tu changes un numéro de téléphone ou un prix ici, il se
 * met à jour partout automatiquement.
 *
 * Voir CONTENT-GUIDE.md pour un mode d'emploi pas à pas.
 * ============================================================
 */

window.FareManaData = {

  // ----------------------------------------------------------
  // MARQUE
  // ----------------------------------------------------------
  brand: {
    name: "Fare Mana",
    tagline: "Maison de Bien-Être",
    slogan: "Prenez soin de vous, c'est honorer la vie.",
    heroIntro: "Des soins d'exception pour révéler votre beauté naturelle et retrouver votre équilibre.",
    logoDark: "assets/images/brand/logo-dark.png",   // logo trait noir/or — sur fonds clairs
    logoLight: "assets/images/brand/logo-light.png", // logo trait crème/or — sur fonds sombres ou photos
  },

  // ----------------------------------------------------------
  // NAVIGATION PRINCIPALE
  // Modifie ici pour ajouter / renommer / réordonner un lien.
  // ----------------------------------------------------------
  nav: [
    { key: "accueil",       label: "Accueil",         href: "index.html" },
    { key: "quiSuisJe",     label: "Qui suis-je",     href: "qui-suis-je.html" },
    { key: "mesSoins",      label: "Mes soins",       href: "mes-soins.html" },
    { key: "ouMeRetrouver", label: "Où me retrouver", href: "ou-me-retrouver.html" },
    { key: "tarifs",        label: "Tarifs",          href: "tarifs.html" },
    { key: "contact",       label: "Contact",         href: "contact.html" },
  ],

  // ----------------------------------------------------------
  // RÉSERVATION
  // mode: "whatsapp" -> le bouton "Prendre rendez-vous" ouvre WhatsApp
  // mode: "contact"  -> il renvoie vers la page Contact
  // mode: "page"     -> il renverra vers une vraie page de réservation (plus tard)
  // Un seul réglage ici change TOUS les boutons du site.
  // ----------------------------------------------------------
  booking: {
    mode: "whatsapp",
    pageHref: "contact.html", // utilisé si mode = "page" ou "contact"
  },

  // ----------------------------------------------------------
  // RÉSEAUX SOCIAUX / CONTACT GÉNÉRAL
  // ----------------------------------------------------------
  social: {
    instagramLabel: "Faremana44",
    instagramHref: "https://www.instagram.com/faremana44?igsi=MTVlcDF1end1enZ6NA==",
    facebookLabel: "Fare Mana",
    facebookHref: "https://www.facebook.com/share/1cgSUW29Zc/",
    email: "faremana44@gmail.com",
    website: "faremana.com",
  },

  // ----------------------------------------------------------
  // SERVICE D'ENVOI DU FORMULAIRE CONTACT (Formspree)
  // ----------------------------------------------------------
  // Endpoint officiel Formspree pour le formulaire Contact uniquement.
  // C'est une URL publique par conception (aucune clé secrète) : la
  // protection anti-spam est gérée côté Formspree + le honeypot local.
  // Ne pas réutiliser cette valeur pour le système d'avis, qui est
  // géré séparément via Supabase (voir plus bas / SUPABASE-SETUP.md).
  contactFormEndpoint: "https://formspree.io/f/mljeydrj",

  // ----------------------------------------------------------
  // AVIS CLIENTS — Supabase (base persistante + publication automatique)
  // ----------------------------------------------------------
  // Un avis valide est enregistré directement et publié automatiquement
  // (pas d'approbation préalable) ; Soraya peut ensuite le supprimer
  // depuis l'espace privé admin.html si nécessaire. AUCUNE clé secrète
  // n'est exposée ici : "anonKey" est une clé PUBLIQUE Supabase, conçue
  // pour être utilisée côté navigateur — la vraie protection vient des
  // règles RLS configurées côté Supabase (voir SUPABASE-SETUP.md).
  //
  // TANT QUE supabaseUrl reste "SUPABASE_URL_TODO", aucune fonctionnalité
  // liée aux avis n'est activée : le site reste dans un état sûr et
  // honnête (rien n'est simulé). Voir SUPABASE-SETUP.md pour la marche
  // à suivre exacte (créer le projet, exécuter le script SQL fourni,
  // créer le compte de Soraya, coller les deux valeurs ci-dessous).
  supabase: {
    url: "https://adbwsmypdryfbbqeafnk.supabase.co",
    // Nouvelle "Publishable key" Supabase (préfixe sb_publishable_...),
    // pas un JWT anon "legacy" : c'est public par conception, mais elle
    // ne doit JAMAIS être envoyée comme jeton "Authorization: Bearer"
    // (voir supabaseRest() dans site.js). Seul le header "apikey"
    // l'utilise pour les requêtes publiques.
    anonKey: "sb_publishable_v5Vaaj2a7eBwoVL36oCkQQ_glYo2hHH",
  },

  // ----------------------------------------------------------
  // DESTINATIONS
  // Toutes les infos propres à Bora Bora et à Marseille.
  // ----------------------------------------------------------
  destinations: {
    bora: {
      id: "bora",
      label: "Bora Bora",
      shortLabel: "Bora Bora",
      subLabel: "Sur le Motu",
      currency: "XPF",
      formatPrice: (n) => `${n.toLocaleString("fr-FR")} F CFP`,
      phone: "+689 89 60 20 54",
      phoneHref: "tel:+68989602054",
      whatsappHref: "https://wa.me/68989602054",
      addressLines: ["Sur le Motu Only You", "Bora Bora, Polynésie française"],
      hours: "Sur réservation – 7j/7", // TODO: confirmer horaires précis
      mapUrl: "https://www.bing.com/maps/search?FORM=QBMV&style=r&ss=id.local_ypid%3A%22YN8142x4382217399443009814%22&q=ONLY+YOU+Motu%2C+Motu+ONLY+YOU%2C+Bora+Bora%2C+%C3%8Eles+Sous-le-Vent+98730%2C+Polyn%C3%A9sie+fran%C3%A7aise&st=ONLY+YOU+Motu&sfa=Motu+ONLY+YOU%2C+Bora+Bora%2C+%C3%8Eles+Sous-le-Vent+98730%2C+Polyn%C3%A9sie+fran%C3%A7aise&cp=-16.463712%7E-151.769452&lvl=14.5",
      mapImage: "assets/images/contact/map-bora.jpg",
      heroKicker: "Bora Bora · Sur le Motu",
      timezone: "Pacific/Tahiti", // UTC-10, pas de changement heure été/hiver
      heroImages: {
        morning: "assets/images/hero/hero-bora-morning.jpg",
        day: "assets/images/hero/hero-bora-day.jpg",
        sunset: "assets/images/hero/hero-bora-sunset.jpg",
        night: "assets/images/hero/hero-bora-night.jpg",
      },
      experienceImage: "assets/images/experience/bora.jpg",
      experience: {
        title: "Une parenthèse au paradis",
        intro: "Sur le Motu, face au lagon turquoise, laissez-vous porter par la douceur du lieu et l'expertise de soins sur-mesure. Un moment suspendu, rien que pour vous.",
        features: [
          { title: "Sur le Motu", text: "Un cadre exclusif et intimiste, au cœur du lagon." },
          { title: "Au rythme du lagon", text: "Une atmosphère apaisante propice à la détente absolue." },
          { title: "Sur rendez-vous", text: "Des créneaux limités pour une attention 100% personnalisée." },
        ],
      },
      // Les avis clients ne sont plus stockés ici : voir DATA.reviewsApproved
      // en tête de fichier (liste vide tant qu'aucun vrai avis n'est validé).
    },
    marseille: {
      id: "marseille",
      label: "Marseille & environs",
      shortLabel: "Marseille",
      subLabel: "À domicile ou en institut partenaire",
      currency: "EUR",
      formatPrice: (n) => `${n.toLocaleString("fr-FR")} €`,
      phone: "+33 7 67 77 06 69",
      phoneHref: "tel:+33767770669",
      whatsappHref: "https://wa.me/33767770669",
      addressLines: ["Marseille et ses environs", "À domicile ou en institut partenaire"],
      hours: "Du lundi au samedi, 9h00 – 19h00", // TODO: confirmer horaires précis
      mapUrl: "https://www.bing.com/maps/search?FORM=HDRSC6&q=marseille&cp=43.294162%7E5.405295&lvl=11.3&style=r",
      mapImage: "assets/images/contact/map-marseille.jpg",
      heroKicker: "Marseille & environs",
      timezone: "Europe/Paris", // CET/CEST — heure été/hiver gérée nativement par Intl
      heroImages: {
        morning: "assets/images/hero/hero-marseille-morning.jpg",
        day: "assets/images/hero/hero-marseille-day.jpg",
        sunset: "assets/images/hero/hero-marseille-sunset.jpg",
        night: "assets/images/hero/hero-marseille-night.jpg",
      },
      experienceImage: "assets/images/experience/marseille.jpg",
      experience: {
        title: "L'art du bien-être à la méditerranéenne",
        intro: "À domicile ou en institut partenaire, profitez d'un moment de soin personnalisé dans la chaleur et la lumière du Sud. Une bulle de douceur, près de chez vous.",
        features: [
          { title: "À domicile", text: "Le soin vient à vous, dans le confort de votre espace." },
          { title: "Institut partenaire", text: "Des lieux de confiance sélectionnés pour leur qualité et leur ambiance." },
          { title: "Marseille & environs", text: "Déplacements dans Marseille et les communes alentours." },
        ],
      },
      // Les avis clients ne sont plus stockés ici : voir DATA.reviewsApproved
      // en tête de fichier (liste vide tant qu'aucun vrai avis n'est validé).
    },
  },

  // ----------------------------------------------------------
  // SOINS
  // category: "visage" | "corps"
  // featured: true -> apparaît dans "Nos soins phares"
  // status: "active" | "comingSoon"
  // price: en unité locale (nombre) ou "onDemand"
  // ----------------------------------------------------------
  services: [
    {
      id: "kobido",
      name: "Kobido",
      ritualName: "Rituel Éclat du Lagon", // utilisé uniquement sur la page Tarifs
      subtitle: "Rituel visage japonais",
      category: "visage",
      featured: true,
      signature: true,
      status: "active",
      duration: "75 min",
      image: "assets/images/services/kobido.jpg",
      description: "Le Kobido est un art ancestral japonais qui allie des manœuvres précises, rapides et lentes pour stimuler la circulation, tonifier les muscles et révéler l'éclat naturel du visage.",
      benefits: ["Lisse & raffermit la peau", "Illumine le teint", "Détend les traits et l'esprit", "Effet liftant naturel"],
      price: { bora: 25000, marseille: 90 },
    },
    {
      id: "kobido-radiofrequence",
      name: "Kobido + Radiofréquence",
      ritualName: "Rituel Jeunesse du Lagon",
      subtitle: "Rituel liftant & régénérant",
      category: "visage",
      featured: true,
      signature: false,
      status: "active",
      duration: "105 min",
      image: "assets/images/services/radiofrequence.jpg",
      description: "L'alliance du massage Kobido et de la radiofréquence pour raffermir, lisser et booster la production de collagène.",
      benefits: ["Raffermit la peau", "Stimule le collagène", "Améliore la tonicité", "Effet lifting visible"],
      price: { bora: 30000, marseille: 120 },
    },
    {
      id: "radiofrequence-visage",
      name: "Radiofréquence visage",
      subtitle: "Fermeté & tonicité",
      category: "visage",
      featured: false,
      signature: false,
      status: "active",
      duration: "30 min",
      image: "assets/images/services/radiofrequence.jpg",
      description: "Une technologie esthétique utilisée pour accompagner le raffermissement et améliorer l'aspect général de la peau.",
      benefits: ["Fermeté", "Tonicité", "Qualité de peau"],
      price: { bora: 8000, marseille: 45 },
    },
    {
      id: "maderotherapie",
      name: "Madérothérapie",
      ritualName: "Rituel Sculptant Corps Entier",
      subtitle: "Sculptante & drainante",
      category: "corps",
      featured: true,
      signature: false,
      status: "active",
      duration: "90 min",
      image: "assets/images/services/maderotherapie.jpg",
      description: "Un massage sculptant réalisé à l'aide d'instruments en bois spécialement conçus pour drainer, raffermir et sculpter la silhouette.",
      benefits: ["Raffermit la peau", "Stimule le système lymphatique", "Améliore la circulation", "Sculpte la silhouette"],
      price: { bora: 30000, marseille: 110 },
    },
    {
      id: "maderotherapie-lipocavitation",
      name: "Madérothérapie + Lipocavitation",
      subtitle: "Sculptante & anti-cellulite",
      category: "corps",
      featured: true,
      signature: false,
      status: "active",
      duration: "90 min", // indicatif, à confirmer
      image: "assets/images/services/maderotherapie-lipocavitation.jpg",
      description: "Synergie d'outils en bois et de lipocavitation pour cibler les graisses et remodeler la silhouette.",
      benefits: ["Réduit les amas graisseux", "Affine la silhouette", "Lisse la peau"],
      price: { bora: "onDemand", marseille: "onDemand" }, // prix non confirmé — ne pas inventer
    },
    {
      id: "ventre-plat",
      name: "Rituel ventre plat & taille fine",
      subtitle: "Cibler & tonifier",
      category: "corps",
      featured: false,
      signature: false,
      status: "active",
      duration: "45 min",
      description: "Un rituel ciblé pour affiner la taille et tonifier la zone abdominale.",
      image: "assets/images/services/ventre-plat.jpg",
      benefits: ["Affine la silhouette", "Tonifie", "Draine"],
      price: { bora: 22000, marseille: 65 },
    },
    {
      id: "jambes-legeres",
      name: "Rituel jambes légères",
      subtitle: "Drainant & rafraîchissant",
      category: "corps",
      featured: false,
      signature: false,
      status: "active",
      duration: "45 min",
      description: "Un soin drainant qui allège la sensation de jambes lourdes et relance la circulation.",
      image: "assets/images/services/jambes-legeres.jpg",
      benefits: ["Draine", "Rafraîchit", "Allège"],
      price: { bora: 22000, marseille: 65 },
    },
    {
      id: "cupping",
      name: "Cupping Therapy",
      subtitle: "Ventouse traditionnelle — soin complémentaire",
      category: "corps",
      featured: true,
      signature: false,
      status: "active",
      duration: "60 min",
      image: "assets/images/services/cupping.jpg",
      description: "La ventouse traditionnelle, pour détoxifier, relâcher les tensions musculaires et revitaliser le corps.",
      benefits: ["Détoxifie", "Relâche les tensions", "Revitalise"],
      price: { bora: 25000, marseille: 80 },
    },
    {
      id: "massage-polynesien",
      name: "Massage Polynésien",
      subtitle: "Évasion & relâchement",
      category: "corps",
      featured: true,
      signature: false,
      status: "comingSoon", // À VENIR — ne pas présenter comme réservable
      duration: "60 ou 90 min",
      image: "assets/images/services/massage-polynesien.jpg",
      description: "Un massage traditionnel aux mouvements fluides et généreux, pour une évasion complète du corps et de l'esprit.",
      benefits: ["Détente profonde", "Lâcher-prise", "Évasion sensorielle"],
      price: { bora: [24000, 33000], marseille: [80, 110] },
    },
  ],

  // ----------------------------------------------------------
  // QUESTIONNAIRE "QUEL SOIN EST FAIT POUR VOUS ?"
  // Chaque réponse pointe vers un id de service (voir "services" ci-dessus).
  // Logique volontairement simple, sans prétention médicale.
  // ----------------------------------------------------------
  quiz: {
    steps: [
      {
        question: "Quelle zone souhaitez-vous privilégier ?",
        key: "zone",
        options: [
          { label: "Visage", value: "visage" },
          { label: "Corps", value: "corps" },
        ],
      },
      {
        question: "Quel est votre objectif principal ?",
        key: "objectif",
        options: [
          { label: "Éclat & traits reposés", value: "eclat" },
          { label: "Raffermir & tonifier", value: "raffermir" },
          { label: "Sculpter la silhouette", value: "sculpter" },
          { label: "Détente & bien-être", value: "detente" },
        ],
      },
      {
        question: "Quelle expérience recherchez-vous ?",
        key: "experience",
        options: [
          { label: "Douce & relaxante", value: "douce" },
          { label: "Tonique & stimulante", value: "tonique" },
          { label: "Plus complète & technologique", value: "techno" },
        ],
      },
    ],
    // recommandation principale + alternative selon la combinaison
    resolve(answers) {
      const { zone, objectif, experience } = answers;
      if (zone === "visage") {
        if (experience === "techno" || objectif === "raffermir") {
          return { main: "kobido-radiofrequence", alt: "kobido" };
        }
        return { main: "kobido", alt: "kobido-radiofrequence" };
      }
      // corps
      if (objectif === "sculpter" || experience === "techno") {
        return { main: "maderotherapie-lipocavitation", alt: "maderotherapie" };
      }
      if (objectif === "detente") {
        return { main: "maderotherapie", alt: "jambes-legeres" };
      }
      return { main: "maderotherapie", alt: "ventre-plat" };
    },
  },

  // ----------------------------------------------------------
  // LES MOTS DE SORAYA
  // Citations fournies en référence — clairement remplaçables.
  // ----------------------------------------------------------
  // Chaque citation a un id (utilisé pour la traduction), un texte, une
  // image d'illustration (réutilisée parmi les assets déjà existants —
  // à remplacer plus tard par de vraies photos si besoin) et une
  // destination associée facultative ("bora" | "marseille" | null).
  quotes: [
    { id: "q0", text: "Prendre soin de soi est votre super pouvoir.", image: "assets/images/hero/hero-bora-day.jpg", destination: "bora" },
    { id: "q1", text: "Votre bien-être, votre plus belle aventure.", image: "assets/images/experience/marseille.jpg", destination: "marseille" },
    { id: "q2", text: "Un corps actif est un esprit heureux.", image: "assets/images/services/kobido.jpg", destination: null },
    { id: "q3", text: "Prenez soin de la nature, elle prend soin de vous.", image: "assets/images/hero/hero-marseille-day.jpg", destination: "marseille" },
    { id: "q4", text: "La beauté commence par s'aimer soi-même.", image: "assets/images/experience/bora.jpg", destination: "bora" },
    { id: "q5", text: "Le bien-être est un voyage, pas une destination.", image: "assets/images/services/maderotherapie.jpg", destination: null },
    { id: "q6", text: "Un bon rire, un peu de bienveillance et beaucoup d'amour pour soi : le combo parfait !", image: "assets/images/services/cupping.jpg", destination: null },
    { id: "q7", text: "Écoutez votre corps, il est plus sage que vous !", image: "assets/images/services/radiofrequence.jpg", destination: null },
  ],

  // ----------------------------------------------------------
  // SORAYA — bio courte (utilisée sur l'accueil + Qui suis-je)
  // Placeholder tant que le texte définitif n'est pas confirmé.
  // ----------------------------------------------------------
  soraya: {
    name: "Soraya",
    roleLabel: "Votre experte bien-être",
    shortBio: "Passionnée par les traditions polynésiennes et les techniques de pointe, j'accompagne avec bienveillance pour révéler votre beauté naturelle et rééquilibrer votre corps et votre esprit.",
    values: ["Écoute", "Savoir-faire", "Bienveillance", "Authenticité"],
    photo: "assets/images/soraya/soraya-portrait.jpg",
  },
};

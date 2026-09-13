/**
 * ============================================================
 * FARE MANA — ARCHITECTURE MULTILINGUE (i18n)
 * ============================================================
 * COMMENT ÇA MARCHE (lire avant de traduire quoi que ce soit) :
 *
 * 1. Le français n'a PAS besoin d'être recopié ici. Il vit déjà
 *    dans data.js et dans le texte des pages HTML. C'est la
 *    langue de référence ("defaultLang").
 *
 * 2. Pour ajouter une traduction, on ajoute une entrée dans
 *    `strings.en` (ou `strings.<code langue>`) avec le MÊME
 *    chemin que celui utilisé dans le code / le HTML
 *    (attribut data-i18n="chemin.vers.le.texte").
 *    Tant qu'une clé n'existe pas pour une langue, le site
 *    affiche automatiquement le texte français — rien ne casse,
 *    rien n'est jamais vide.
 *
 * 3. Pour ajouter une langue plus tard (ex. espagnol) :
 *      - ajouter { code:"es", label:"Español" } dans supportedLangs
 *      - ajouter un objet strings.es = { ... }
 *    Aucune page HTML n'a besoin d'être dupliquée ou reconstruite.
 *
 * 4. Ce qui NE se traduit PAS reste uniquement dans data.js :
 *    prix, durées, téléphones, adresses, images, liens sociaux.
 *
 * 5. Pour cette V1, seuls les éléments d'interface courants
 *    (navigation, boutons, messages système) sont traduits en
 *    anglais, à titre de démonstration du système. Les textes
 *    longs (descriptions, avis, citations) seront traduits plus
 *    tard, sans aucun changement de code nécessaire.
 * ============================================================
 */

window.FareManaI18n = {
  defaultLang: "fr",

  supportedLangs: [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ],

  strings: {
    // fr: intentionnellement vide — le français vient de data.js / du HTML existant.

    en: {
      nav: {
        accueil: "Home",
        quiSuisJe: "About",
        mesSoins: "Treatments",
        ouMeRetrouver: "Find us",
        tarifs: "Prices",
        contact: "Contact",
        motsDeSoraya: "Soraya's Words",
      },
      common: {
        bookingCta: "Book an appointment",
        discoverSoins: "Discover treatments",
        learnMore: "Learn more",
        detail: "Details",
        chooseDestination: "Choose a destination to see pricing",
        chooseDestinationShort: "Choose",
        comingSoon: "Coming soon",
        onDemandPrice: "Price on request",
        itinerary: "Directions",
        changeDestination: "Change destination",
        callUs: "Call",
        contactForm: "Contact form",
        seeAllPrices: "See all prices",
        signatureTreatment: "Signature treatment",
        notifyAtLaunch: "Notify me at launch",
        filterAll: "All",
        filterFace: "Face",
        filterBody: "Body",
        restartQuiz: "Restart the quiz",
        photoComingSoon: "Photo coming soon",
        andSurroundings: "& surroundings",
        formCheckFields: "Please check the fields in red before sending.",
        formSending: "Sending…",
        formSuccess: "Thank you, your message has been sent. I'll get back to you as soon as possible.",
        formError: "Sending failed. Contact me directly {phone}, or by email at {email}.",
        fieldRequired: "This field is required.",
        formNotConnected: "This form isn't connected to a sending service yet. In the meantime, contact me directly {phone}, or by email at {email}.",
        atWord: "at",
        orWord: "or",
      },
      brand: {
        tagline: "Wellness House",
        slogan: "Taking care of yourself is honouring life.",
        heroIntro: "Exceptional treatments to reveal your natural beauty and restore your balance.",
      },
      destLabels: {
        bora: "Bora Bora",
        marseille: "Marseille & surroundings",
      },
      destShort: {
        bora: "Bora Bora",
        marseille: "Marseille",
      },
      destPicker: {
        bora: "Bora Bora — On the Motu",
        marseille: "Marseille & surroundings",
      },
      home: {
        heroQuestion: "Where would you like to experience Fare Mana?",
        soinsEyebrow: "The Fare Mana experience",
        soinsTitle: "Our signature treatments",
        soinsLead: "Expert rituals to reveal your beauty and wellbeing.",
        noIdeaTitle: "Not sure which treatment to choose?",
        noIdeaText: "Let us guide you according to your needs and wishes.",
        findMySoin: "Find my treatment",
        quizEyebrow: "Not sure?",
        quizTitle: "Which treatment is right for you?",
        quizLead: "Answer 3 simple questions and discover the ritual best suited to you. This is not a medical diagnosis.",
        experienceEyebrow: "The Fare Mana experience",
        experienceTitle: "By destination",
        experienceLead: "Two places, one and the same care. Choose where to live your Fare Mana experience.",
        discover: "Discover",
        boraTeaserText: "A paradise getaway, at the lagoon's pace.",
        marseilleTeaserText: "The Mediterranean art of wellness.",
        discoverFindUs: "Discover where to find me",
        sorayaEyebrow: "Behind Fare Mana",
        sorayaTitle: "Soraya, your wellness expert",
        discoverJourney: "Discover my journey",
        motsEyebrow: "Soraya's words",
        motsButton: "Discover Soraya's words",
        tarifsEyebrow: "Prices",
        tarifsTitle: "Our prices",
        tarifsChoosePrompt: "Choose your destination to discover our prices — Bora Bora in CFP francs, Marseille in euros.",
        seeAllPrices: "See all prices",
        contactEyebrow: "Quick contact",
        contactTitle: "Get in touch",
        contactForm: "Contact form",
        callBtn: "Call",
        currencyNoteXPF: "All our prices are in CFP francs (XPF).",
        currencyNoteEUR: "All our prices are in euros (€).",
        ariaMainNav: "Main navigation",
        ariaOpenMenu: "Open menu",
        ariaFooterNav: "Footer navigation",
        ariaClose: "Close",
      },
      footer: {
        rights: "All rights reserved",
        legal: "Legal notice",
        privacy: "Privacy policy",
      },
      ouMeRetrouver: {
        eyebrow: "Fare Mana",
        title: "Where to find me",
        lead: "Two places, one and the same attention. Wherever you are, I welcome you with the same care.",
        yourDestination: "Your destination",
        boraEyebrow: "Bora Bora · On the Motu",
        boraTitle: "A paradise getaway",
        boraIntro: "On the Motu, facing the turquoise lagoon, let yourself be carried by the gentleness of the place and the expertise of tailor-made treatments. A suspended moment, just for you.",
        boraF0: "On the Motu", boraF0Text: "An exclusive, intimate setting, at the heart of the lagoon.",
        boraF1: "At the lagoon's pace", boraF1Text: "A soothing atmosphere ideal for relaxation.",
        boraF2: "By appointment", boraF2Text: "Limited slots for personalised attention.",
        marseilleEyebrow: "Marseille & surroundings",
        marseilleTitle: "The Mediterranean art of wellness",
        marseilleIntro: "At home or in a partner institute, enjoy a personalised treatment in the warmth and light of the South.",
        marseilleF0: "At home", marseilleF0Text: "The treatment comes to you, in the comfort of your own space.",
        marseilleF1: "Partner institute", marseilleF1Text: "Trusted venues selected for their quality and atmosphere.",
        marseilleF2: "Marseille & surroundings", marseilleF2Text: "Travel within Marseille and the surrounding area.",
        phoneLabel: "Phone / WhatsApp",
        addressLabel: "Location",
        hoursLabel: "Hours",
        mapTodo: "Directions coming soon",
      },
      destSubLabel: {
        bora: "On the Motu",
        marseille: "At home or in a partner institute",
      },
      destHours: {
        bora: "By appointment – 7 days a week",
        marseille: "Monday to Saturday, 9am – 7pm",
      },
      destAddress: {
        bora: { l0: "On the Motu Only You", l1: "Bora Bora, French Polynesia" },
        marseille: { l0: "Marseille and surrounding area", l1: "At home or in a partner institute" },
      },
      tarifsPage: {
        eyebrow: "Fare Mana",
        title: "Prices",
        introLead: "Two horizons, the same attention for you.",
        heading: "Prices —",
        signature: "Signature treatment",
        visageTitle: "Face", corpsTitle: "Body", massageTitle: "Massage & Rituals",
        discoverSoin: "Discover this treatment",
      },
      ritualNames: {
        kobido: "Lagoon Glow Ritual",
        "kobido-radiofrequence": "Lagoon Youth Ritual",
        maderotherapie: "Full-Body Sculpting Ritual",
      },
      contactPage: {
        eyebrow: "Fare Mana",
        title: "Contact",
        tagline: "I'm here to listen",
        teaserIntro: "Where would you like to get in touch with me? Choose your destination to see my contact details.",
        introBora: "For any question, booking or special request, feel free to contact me — on the Motu, I'm listening.",
        introMarseille: "For any question, booking or special request, feel free to contact me — in Marseille and the surrounding area, I'm listening.",
        phoneLabel: "Phone",
        whatsappLabel: "WhatsApp",
        whatsappCta: "Send a WhatsApp",
        addressLabel: "Location",
        hoursLabel: "Hours",
        socialLabel: "Follow me",
        formTitle: "A message?",
        formLead: "Write to me, I'll be happy to reply.",
        nameLabel: "Name",
        emailLabel: "Email",
        phoneFieldLabel: "Phone (optional)",
        destinationLabel: "Destination",
        destinationPlaceholder: "Choose a destination",
        soinLabel: "Desired treatment (optional)",
        soinPlaceholder: "No preference",
        messageLabel: "Message",
        sendBtn: "Send my message",
        stayTitle: "Let's stay in touch",
        mapAriaLabel: "Directions to",
        mapAlt: "Location map",
        stayLead: "Follow my news and wellness tips.",
        quickReplyTitle: "Quick reply",
        quickReplyText: "I'm committed to replying as soon as possible.",
        reviewInviteTitle: "Your review matters",
        reviewInviteText: "Have you experienced Fare Mana? Share your review and help others discover my treatments.",
        closingTitle: "Take care of yourself, naturally.",
        closingTags: "Beauty · Balance · Harmony",
      },
      about: {
        eyebrow: "Behind Fare Mana",
        title: "Hello, I'm Soraya.",
        welcome: "Welcome to my world",
        lead: "Passionate about Polynesian traditions and advanced techniques, I care for you with kindness to reveal your natural beauty and restore balance to your body and mind.",
        introText1: "I'm Soraya, creator of Fare Mana, a world I imagined around beauty, wellbeing and self-listening.",
        introText2: "My mission: to offer you personalised treatments, blending know-how, natural techniques and rituals inspired by my experience in Polynesia.",
        introSignature: "Taking care of you, here and elsewhere.",
        parcoursEyebrow: "My journey",
        parcoursTitle: "An ongoing story",
        parcoursText1: "Always passionate about beauty and wellbeing, I trained extensively in facial treatments, massage and aesthetic technologies.",
        parcoursText2: "In 2016, I created Fare Mana in Avignon, a beauty house dedicated in particular to facial massage, inspired by the Kobido method.",
        parcoursText3: "From Polynesia to France, and back to Bora Bora, Fare Mana has been with me for several years now.",
        parcoursText4: "Today, a new chapter is being written between Bora Bora and Marseille, always with the same wish: to take care of you.",
        universEyebrow: "My world",
        universTitle: "Polynesian inspiration",
        universText1: "Polynesia has profoundly inspired me: its traditions, its connection to nature, the kindness of its people and the strength of its energy.",
        universText2: "These values accompany me in every treatment, to offer you far more than a moment of relaxation — a true getaway for body and mind.",
        philoEyebrow: "The Fare Mana philosophy",
        philoTitle: "An approach, not just a technique",
        philoText1: "For me, a treatment is never just a technique. It's a moment for yourself, a pause where you can slow down, reconnect with your body and simply feel good.",
        philoText2: "I blend expertise, intuition and kindness to reveal your natural glow, inside and out.",
        philoQuote: "Taking care of yourself is honouring life.",
        horizonsEyebrow: "Two horizons, one philosophy",
        horizonsTitle: "Same attention, two settings",
        horizonsLead: "The aim isn't to compare the two destinations, but to show that Fare Mana carries the same care and the same philosophy in two different settings.",
        boraText: "The wild beauty, the turquoise lagoon, Polynesian traditions and harmony with nature inspire me every day.",
        boraSubtitle: "On the Motu",
        marseilleSubtitle: "My home ground",
        marseilleText: "My city of the heart, my home ground, where I welcome you with the same passion and the same commitment to quality.",
        transitionEyebrow: "A more personal side",
        transitionText: "Beyond the treatments, a few words close to my heart — to take care of you, and of yourself.",
        valuesEyebrow: "Values",
        values: {
          ecoute: "Listening",
          personnalisation: "Personalised approach",
          expertise: "Expertise",
          bienveillance: "Kindness",
          produits: "Selected products",
          rituels: "Tailored rituals",
        },
        ctaTitle: "Taking care of yourself is honouring life.",
      },
      soins: {
        title: "My Treatments",
        lead: "Personalised treatments to reveal your beauty and wellbeing. Every ritual adapts to you, in Bora Bora as in Marseille.",
        eyebrow: "Our treatments",
        visageTitle: "Face", visageLead: "Naturally enhance your glow.",
        corpsTitle: "Body", corpsLead: "Tone, drain, feel good.",
        massageTitle: "Massage & Relaxation", massageLead: "Let go and travel.",
        ctaEyebrow: "Still not sure?",
        ctaTitle: "Let us guide you",
        ctaLead: "Answer 3 simple questions on the homepage and discover the ritual that suits you.",
        ctaButton: "Which treatment is right for me?",
      },
      services: {
        kobido: {
          name: "Kobido", subtitle: "Japanese facial ritual",
          description: "Kobido is an ancestral Japanese art combining precise, fast and slow movements to stimulate circulation, tone the muscles and reveal the face's natural glow.",
          benefits: ["Smooths & firms the skin", "Illuminates the complexion", "Relaxes features and mind", "Natural lifting effect"],
        },
        "kobido-radiofrequence": {
          name: "Kobido + Radiofrequency", subtitle: "Lifting & regenerating ritual",
          description: "The combination of Kobido massage and radiofrequency to firm, smooth and boost collagen production.",
          benefits: ["Firms the skin", "Stimulates collagen", "Improves tone", "Visible lifting effect"],
        },
        "radiofrequence-visage": {
          name: "Facial Radiofrequency", subtitle: "Firmness & tone",
          description: "An aesthetic technology used to support firming and improve the overall look of the skin.",
          benefits: ["Firmness", "Tone", "Skin quality"],
        },
        maderotherapie: {
          name: "Maderotherapy", subtitle: "Sculpting & draining",
          description: "A sculpting massage using specially designed wooden tools to drain, firm and sculpt the silhouette.",
          benefits: ["Firms the skin", "Stimulates the lymphatic system", "Improves circulation", "Sculpts the silhouette"],
        },
        "maderotherapie-lipocavitation": {
          name: "Maderotherapy + Lipocavitation", subtitle: "Sculpting & anti-cellulite",
          description: "A synergy of wooden tools and lipocavitation to target fat and reshape the silhouette.",
          benefits: ["Reduces fat deposits", "Slims the silhouette", "Smooths the skin"],
        },
        "ventre-plat": {
          name: "Flat Belly & Slim Waist Ritual", subtitle: "Target & tone",
          description: "A targeted ritual to slim the waist and tone the abdominal area.",
          benefits: ["Slims the silhouette", "Tones", "Drains"],
        },
        "jambes-legeres": {
          name: "Light Legs Ritual", subtitle: "Draining & refreshing",
          description: "A draining treatment that eases the feeling of heavy legs and boosts circulation.",
          benefits: ["Drains", "Refreshes", "Lightens"],
        },
        cupping: {
          name: "Cupping Therapy", subtitle: "Traditional cupping — complementary treatment",
          description: "Traditional cupping, to detoxify, release muscle tension and revitalise the body.",
          benefits: ["Detoxifies", "Releases tension", "Revitalises"],
        },
        "massage-polynesien": {
          name: "Polynesian Massage", subtitle: "Escape & release",
          description: "A traditional massage with flowing, generous movements, for a complete escape for body and mind.",
          benefits: ["Deep relaxation", "Letting go", "Sensory escape"],
        },
      },
      destinations: {
        bora: {
          experienceTitle: "A paradise getaway",
          experienceIntro: "On the Motu, facing the turquoise lagoon, let yourself be carried by the gentleness of the place and the expertise of tailor-made treatments. A suspended moment, just for you.",
          features: {
            f0: { title: "On the Motu", text: "An exclusive, intimate setting, at the heart of the lagoon." },
            f1: { title: "At the lagoon's pace", text: "A soothing atmosphere ideal for total relaxation." },
            f2: { title: "By appointment", text: "Limited slots for 100% personalised attention." },
          },
          testimonials: {
            t0: "A magical moment, a memory. My skin is plumped and glowing.",
            t1: "Kobido + radiofrequency, I feel light and toned, I recommend it 100%!",
            t2: "Maderotherapy on another level, a true moment of wellbeing.",
          },
        },
        marseille: {
          experienceTitle: "The Mediterranean art of wellness",
          experienceIntro: "At home or in a partner institute, enjoy a personalised treatment in the warmth and light of the South. A bubble of gentleness, close to you.",
          features: {
            f0: { title: "At home", text: "The treatment comes to you, in the comfort of your own space." },
            f1: { title: "Partner institute", text: "Trusted venues selected for their quality and atmosphere." },
            f2: { title: "Marseille & surroundings", text: "Travel within Marseille and the surrounding area." },
          },
          testimonials: {
            t0: "Soraya is a gem! An exceptional facial, my skin is plumped and radiant.",
            t1: "Visible results from the very first session! Soraya takes her time and tailors every treatment.",
            t2: "Incredible maderotherapy, light legs and a slimmer silhouette.",
          },
        },
      },
      durationOverrides: {
        "massage-polynesien": "60 or 90 min",
      },
      motsPage: {
        eyebrow: "Fare Mana",
        title: "Soraya's Words",
        tagline1: "A few words to take care of yourself…",
        tagline2: "with gentleness, and sometimes with a smile.",
        signOff1: "Take care of yourself.",
        signOff2: "You matter.",
        signOffAuthor: "Soraya — Fare Mana",
        reviewsEyebrow: "Real experiences",
        reviewsTitle: "They lived the Fare Mana experience",
        filterAll: "All",
        leaveReview: "Leave a review",
        reviewInviteTitle: "Your review matters",
        reviewInviteTitleLg: "Have you experienced Fare Mana?",
        reviewInviteText: "Your feedback helps Fare Mana keep improving the experience, here and elsewhere.",
        discoverMots: "Discover Soraya's words →",
        reviewFormLead: "Your email is never published — it's only used to validate your review.",
        firstNameLabel: "First name",
        treatmentLabel: "Treatment received (optional)",
        ratingLabel: "Rating",
        ratingRequired: "Please choose a rating.",
        reviewTextLabel: "Your review",
        privateEmailLabel: "Email (private, not published)",
        submitReview: "Send my review",
        reviewFormNotConnected: "Review collection isn't connected yet. In the meantime, write to me directly via the Contact page.",
        reviewSubmitted: "Thank you for your review. It has been published.",
        reviewFormError: "Sending failed. You can try again or contact me via the Contact page.",
      },
      quotes: {
        q0: "Taking care of yourself is your superpower.",
        q1: "Your wellbeing, your most beautiful adventure.",
        q2: "An active body is a happy mind.",
        q3: "Take care of nature, it takes care of you.",
        q4: "Beauty begins with loving yourself.",
        q5: "Wellbeing is a journey, not a destination.",
        q6: "A good laugh, a little kindness and a lot of self-love: the perfect combo!",
        q7: "Listen to your body, it's wiser than you are!",
      },
      quiz: {
        zone: { question: "Which area would you like to focus on?", options: { visage: "Face", corps: "Body" } },
        objectif: {
          question: "What is your main goal?",
          options: { eclat: "Glow & rested features", raffermir: "Firm & tone", sculpter: "Sculpt the silhouette", detente: "Relaxation & wellbeing" },
        },
        experience: {
          question: "What kind of experience are you looking for?",
          options: { douce: "Gentle & relaxing", tonique: "Toning & stimulating", techno: "Comprehensive & tech-based" },
        },
        recommended: "Your recommended treatment",
        alternative: "Possible alternative",
        discoverTreatment: "Discover this treatment",
      },
    },
  },
};

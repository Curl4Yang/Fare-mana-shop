# PROJECT_CONTEXT — Fare Mana

Documentation de référence du projet, à lire au début de chaque session
de travail. Elle conserve le contexte technique entre les conversations.

- Dernière mise à jour : 2026-10-18
- Version en cours : **V4** (développement repris sur `develop`)

---

## 1. Règles de travail (obligatoires)

1. **Toujours conserver le design et les fonctionnalités existantes**, sauf demande explicite.
2. **Avant chaque modification importante, expliquer les changements prévus** et attendre la validation.
3. **Ne jamais modifier directement `main`.** Tout le travail se fait sur `develop`.
4. **Ne jamais faire de commit, push ou déploiement sans validation explicite.**
5. **Tester les modifications en local avant publication** (voir §6).
6. **Mettre à jour ce fichier après chaque fonctionnalité terminée** (§8 état, §9 TODO, §10 historique).
7. **Ne jamais enregistrer de clés secrètes dans le repository** (voir §5).

---

## 2. Environnement local

| Élément | Valeur |
|---|---|
| Dossier | `C:\Users\nahel\Documents\GitHub\Fare-mana-shop` (dossier GitHub Desktop, pas de worktree séparé) |
| Dépôt distant | `https://github.com/Curl4Yang/Fare-mana-shop.git` |
| Branche de travail | `develop` (suit `origin/develop`) |
| Branche de production | `main` |
| Git | **Pas dans le PATH.** Utiliser celui de GitHub Desktop : `C:\Users\nahel\AppData\Local\GitHubDesktop\app-<version>\resources\app\git\cmd\git.exe` (version actuelle : `app-3.6.7`, le chemin change à chaque mise à jour de GitHub Desktop) |
| Python | Disponible (`Python314`), utilisable pour le serveur local |
| Node / npm / Supabase CLI / gh | Non installés |

Comme le travail se fait directement dans le dossier GitHub Desktop, toute
modification apparaît immédiatement dans GitHub Desktop.

---

## 3. Hébergement et déploiement

- Site en ligne : **https://faremana.com** (fichier `CNAME` = `faremana.com`).
- Hébergement : GitHub Pages (déduit du `CNAME`).
- ⚠️ **À vérifier dans GitHub → Settings → Pages** : que la source de publication est bien la branche `main` (racine `/`).
- Aucune étape de build : les fichiers du dépôt sont servis tels quels.
- Flux prévu : travail sur `develop` → test local → validation → fusion vers `main` (uniquement sur autorisation) → publication automatique par GitHub Pages.

---

## 4. Architecture technique

Site vitrine **statique** en HTML, CSS et JavaScript, sans framework ni dépendance npm.

### Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil : hero avec choix de la destination, soins phares, quiz « Quel soin est fait pour vous ? », expérience locale, Soraya, citations, aperçu des tarifs, contact rapide |
| `qui-suis-je.html` | Présentation de Soraya, section « Mon Parcours » (biographie, repérée par un `<!-- TODO -->`) |
| `mes-soins.html` | Catalogue des soins par catégorie (visage / corps) |
| `ou-me-retrouver.html` | Lieux, horaires et itinéraires (Bora Bora / Marseille) |
| `tarifs.html` | Grille tarifaire selon la destination |
| `contact.html` | Formulaire de contact (Formspree) et coordonnées |
| `les-mots-de-soraya.html` | Citations de Soraya et avis clients (Supabase) |
| `admin.html` | Espace privé de Soraya : connexion Supabase Auth, lecture et suppression des avis. Script intégré dans la page, ne charge que `data.js` |

Toutes les pages publiques chargent dans cet ordre :
`assets/js/data.js` → `assets/js/i18n.js` → `assets/js/site.js` (defer).
L'en-tête (`#site-header`) et le pied de page (`#site-footer`) sont générés par `site.js`.

### Fichiers JavaScript

- **`assets/js/data.js`** : la **source unique des contenus** (`window.FareManaData`) : marque, navigation, mode de réservation (`booking.mode` : `whatsapp` / `contact` / `page`), réseaux sociaux, endpoint Formspree, configuration Supabase, destinations (téléphones, adresses, horaires, `mapUrl`, devise, témoignages, expérience), soins (`services` : prix par destination, durée, catégorie, `featured`, `status`) et citations (`quotes`). Aucune donnée ne doit être écrite en dur ailleurs.
- **`assets/js/i18n.js`** : traductions. Le français est la langue de référence (déjà dans `data.js` et le HTML). `strings.en` ne couvre que l'interface (navigation, boutons, titres). S'il manque une clé, le texte français s'affiche. Les textes à traduire sont repérés par l'attribut HTML `data-i18n="chemin.de.la.cle"`.
- **`assets/js/site.js`** (~1360 lignes, une seule IIFE) : toute la logique :
  - thème selon l'heure du visiteur (images hero matin / jour / coucher de soleil / nuit) ;
  - choix de la destination, gardé dans `localStorage` ; attributs `data-pick-dest`, `data-dest-*`, `.dest-teaser` / `.dest-detail` ;
  - choix de la langue, gardé dans `localStorage` ;
  - en-tête, menu mobile, pied de page ;
  - cartes de soins, filtres, fenêtre de détail d'un soin ;
  - rendu des pages Soins, Où me retrouver, Tarifs et Contact ;
  - quiz ;
  - avis : `supabaseRest()`, `fetchPublishedReviews()`, fenêtre de dépôt d'un avis ;
  - formulaire de contact (Formspree + champ anti-spam caché) ;
  - animations d'apparition au défilement (`.reveal`).

### CSS et images

- **`assets/css/styles.css`** : feuille de style unique. Polices Google Fonts : Fraunces (titres), Jost (texte), Allura (script). Variables CSS (`--ink`, `--cream`, `--gold-light`…).
- **`assets/images/`** : `brand/` (logos, favicons), `hero/` (8 visuels : 2 destinations × 4 moments de la journée), `experience/`, `services/`, `contact/`, `soraya/` (environ 5,5 Mo au total).

### Supabase

- **`supabase/functions/notify-new-review/index.ts`** : fonction Edge (Deno) appelée par un webhook de base de données à chaque `INSERT` dans `reviews`. Elle envoie un e-mail de notification via Resend.

---

## 5. Services externes et sécurité

| Service | Usage | Configuration |
|---|---|---|
| **Supabase** (projet « Fare Mana Avis », région Paris) | Avis clients | `data.js` → `supabase.url` + `supabase.anonKey` (clé **publishable**, publique par conception) |
| **Formspree** | Formulaire Contact | `data.js` → `contactFormEndpoint` (URL publique) |
| **Resend** | E-mail de notification d'un nouvel avis | Clé uniquement dans les *secrets* Supabase (`RESEND_API_KEY`, `NOTIFY_TO_EMAIL`, `NOTIFY_FROM_EMAIL` facultatif) |
| **WhatsApp** | Bouton « Prendre rendez-vous » (`booking.mode = "whatsapp"`) | `data.js` → `destinations.*.whatsappHref` |

Le détail du modèle de sécurité Supabase (table `reviews`, vue `reviews_public`,
règles d'accès réservées à l'UID admin, script SQL déjà exécuté) est dans
**`SUPABASE-SETUP.md`**.

Points de sécurité à respecter :
- La clé `sb_publishable_...` ne s'envoie que dans le header `apikey`, **jamais** comme `Authorization: Bearer`. Les requêtes admin utilisent le `access_token` de session.
- La clé **secret / service_role** Supabase et la clé **Resend** ne doivent **jamais** apparaître dans le dépôt.
- La colonne `email_private` n'est jamais exposée publiquement : elle n'est pas dans `reviews_public`.
- Le token de session admin est gardé dans `sessionStorage`, jamais dans `localStorage`.

---

## 6. Tester en local

Aucune compilation n'est nécessaire. Lancer un serveur statique depuis la racine du projet :

```
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000/`. Points à vérifier selon la modification :
- les deux destinations (Bora Bora / Marseille) et l'état « aucune destination choisie » ;
- les langues FR / EN ;
- l'affichage mobile et l'affichage bureau ;
- la console du navigateur sans erreur.

Attention : les avis (Supabase) et le formulaire de contact (Formspree)
appellent les **vrais services de production**, même en local. Ne pas
soumettre d'avis ni de message de test sans accord.

---

## 7. Conventions

- Tous les contenus (textes, prix, téléphones, liens) se modifient dans `data.js` (voir `CONTENT-GUIDE.md`).
- Tout nouveau texte d'interface reçoit un attribut `data-i18n` et, si possible, une entrée `strings.en`.
- Ne jamais simuler une fonctionnalité absente : un service non configuré affiche un message clair (principe déjà appliqué dans le site).
- Un soin `status: "comingSoon"` ne doit jamais être présenté comme réservable (mécanisme conservé, aucun soin concerné actuellement).
- Code et commentaires en français, dans le style du code existant (vanilla JS, pas de dépendance ajoutée sans accord).

---

## 8. État actuel (constaté le 2026-10-18)

- `main` est au commit `2922469 Fare mana V4` (2026-09-14). Les modifications V4 ci-dessous sont **en local sur `develop`, non commitées**.
- Les 7 pages publiques et `admin.html` sont construites et fonctionnelles.
- Les vraies photos sont en place (soins, destinations, hero, portrait de Soraya).
- Supabase est configuré : table, règles d'accès, vue publique, compte admin. Les clés publiques sont dans `data.js`.
- Le endpoint Formspree est renseigné.
- **Lieu de Bora Bora : Villa Yrondi** (V4). Plus aucune mention du « motu ». Règle de rédaction : « Bora Bora » dans les textes généraux, « Villa Yrondi » pour le lieu exact (Où me retrouver, Contact, adresse, sous-titre de la destination, sélecteurs de destination). Indication de lieu : « Villa Yrondi, Bora Bora, Polynésie française », tant qu'aucune adresse plus précise n'est confirmée.
- **Itinéraire Villa Yrondi** (`data.js` → `destinations.bora.mapUrl`) : recherche Bing Maps `https://www.bing.com/maps/search?FORM=HDRSC6&q=villa+yrondi&cp=-16.524723%7E-151.735443&lvl=11&style=r`. Le paramètre `cp` ne fait que centrer la carte : ce n'est **pas** une position GPS précise du lieu. L'itinéraire de Marseille est inchangé.
- L'itinéraire est affiché sur la page **Contact** (bouton « Itinéraire » + carte cliquable) et sur la page **« Où me retrouver »**, avec un bouton « Itinéraire » / « Directions » (`btn btn-ghost`, après « Appeler ») dans chaque bloc destination. Ce bouton est rempli par `renderFindUsPage()` (`[data-block-map]`) à partir de `destinations.*.mapUrl`, sans lien dupliqué dans le HTML. Si un lien manque, il affiche « Itinéraire à venir » et apparaît désactivé (règle CSS `.dest-block-actions [aria-disabled="true"]`).
- 9 soins, dont 6 en vedette, **tous actifs**.
- **Massage Polynésien** : actif depuis la V4 **dans les deux destinations**, avec une nouvelle description et un texte détaillé dans la fenêtre « En savoir plus ». Durée « 60 ou 90 min ». **Tarifs confirmés** : Bora Bora 24 000 F CFP (60 min) / 33 000 F CFP (90 min) ; Marseille 80 € (60 min) / 110 € (90 min).
- **Affichage explicite durée / prix** : le champ facultatif `priceDurations: ["60 min", "90 min"]` (`data.js`) associe chaque prix du tableau `price` à sa durée, dans le même ordre. Seul le Massage Polynésien l'utilise, les autres soins ne changent pas. `site.js` : `priceDurationPairs()` produit les couples ; `formatServicePriceHtml()` les affiche une ligne par durée (`.price-pair`) dans les cartes, la page Tarifs et la fenêtre de détail ; `formatServicePrice()` (texte) les joint par « · », comme dans le résultat du quiz. Format FR « 60 min : 24 000 F CFP », EN « 60 min: 24 000 F CFP ». Aucun prix n'est affiché sans destination.
- Champ facultatif `details: { title, paragraphs[] }` sur un soin (`data.js`, traduction dans `i18n.js` → `services.<id>.details`) : s'il est présent, la fenêtre de détail l'affiche à la place de `description`. Utilisé pour l'instant par le Massage Polynésien uniquement.
- **Quiz** (`data.js` → `quiz.resolve`) : pour Corps + « Détente & bien-être », la réponse « Douce & relaxante » recommande le **Massage Polynésien** (alternative : Rituel jambes légères) ; la réponse « Tonique & stimulante » recommande la Madérothérapie (alternative : **Massage Polynésien**). Toutes les autres combinaisons sont inchangées (24 combinaisons au total, dont 1 avec le massage en résultat principal et 1 en alternative).
- **Bug corrigé** : sur la page Contact en anglais, le bouton d'itinéraire affichait « Directions coming soon » alors qu'un lien existait. `renderContactPage()` met maintenant à jour l'attribut `data-i18n` du bouton selon l'état du lien (`common.itinerary` ou `ouMeRetrouver.mapTodo`).

---

## 9. TODO / points ouverts

À vérifier :
- [ ] La source GitHub Pages est-elle bien `main` ? (GitHub → Settings → Pages)
- [ ] La notification Resend est-elle déployée et active ? (fonction déployée, secrets définis, webhook créé — voir `SUPABASE-SETUP.md` §6)
- [ ] Tests manuels de bout en bout (`SUPABASE-SETUP.md` §7) : dépôt d'un avis, suppression depuis l'admin, réception Formspree.

À confirmer / décider (V4) :
- [ ] Adresse précise de la Villa Yrondi (actuellement « Villa Yrondi / Bora Bora, Polynésie française »).
- [ ] Horaires de Bora Bora à la Villa Yrondi (inchangés : « Sur réservation – 7j/7 »).
- [ ] Vérifier visuellement que le lien Bing Maps affiche bien la Villa Yrondi (la page s'ouvre sur bing.com, mais son contenu n'a pas pu être lu automatiquement).

Contenu en attente :
- [ ] Biographie définitive de Soraya (`qui-suis-je.html`, section « Mon Parcours »).
- [ ] Vrais avis clients : vérifier si des témoignages d'exemple restent dans `data.js` (`destinations.*.testimonials`).
- [ ] Horaires précis (actuellement indicatifs).
- [ ] Prix « Madérothérapie + Lipocavitation » (« Tarif sur demande »).
- [ ] Nom de l'institut partenaire à Marseille (actuellement générique).
- [ ] Traductions anglaises complètes (descriptions, avis, citations).
- [ ] Finition visuelle de `mes-soins.html` sur grand écran (cartes jugées trop petites).

Documentation :
- [ ] La liste TODO de `CONTENT-GUIDE.md` est en partie obsolète (photos, Google Maps, Formspree, activation du Massage Polynésien) et contient des doublons. À nettoyer.

---

## 10. Historique

| Date | Version / commit | Résumé |
|---|---|---|
| 2026-08-17 → 08-23 | V1 (`3bc9663` → `c850d1b`) | Première mise en ligne, ajout du `CNAME` faremana.com |
| 2026-09-06 | `4e3dce8` | Mise à jour des fichiers |
| 2026-09-13 | `dd8ac3f`, `df82e5f` | Activation des avis Supabase, corrections |
| 2026-09-14 | `cdfab1a` « Final Faremana », `2922469` « Fare mana V4 » | Version actuellement en ligne (favicons mis à jour) |
| 2026-10-18 | — | Reprise du développement V4 sur `develop`, création de ce fichier |
| 2026-10-18 | V4 — modif. 1 (non commitée) | Bora Bora : le motu Only You est remplacé par la Villa Yrondi (data, i18n, 6 pages HTML, site.js). Lien d'itinéraire Bora Bora vidé en attendant le nouveau |
| 2026-10-18 | V4 — modif. 2 (non commitée) | Massage Polynésien activé : nouvelle description, texte détaillé « En savoir plus » (champ `details`), traductions EN |
| 2026-10-18 | V4 — finalisation (non commitée) | Tarifs du massage confirmés, massage disponible dans les deux destinations, ajout au quiz (détente), itinéraire Bing Maps Villa Yrondi, correction du bouton d'itinéraire sur la page Contact en anglais |
| 2026-10-18 | V4 — derniers ajustements (non commités) | Tarifs du massage affichés explicitement par durée (`priceDurations`), bouton « Itinéraire » ajouté aux deux destinations de la page « Où me retrouver ». Modifications V4 validées ; publication prévue manuellement via GitHub Desktop |

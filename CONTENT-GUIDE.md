# Guide de contenu — Fare Mana

Tout ce qui se modifie se trouve dans **un seul fichier** :
`assets/js/data.js`

Tu n'as jamais besoin de toucher au HTML ou au CSS pour changer un texte, un prix ou un numéro de téléphone.

---

## Où modifier les prix
Dans `data.js`, section `services`. Chaque soin a un objet `price: { bora: ..., marseille: ... }`.
Exemple pour changer le prix du Kobido à Bora Bora :
```js
price: { bora: 25000, marseille: 90 },
```
→ remplace `25000` par le nouveau montant (juste le nombre, sans espace ni "XPF").

## Où modifier les téléphones / contacts
Dans `data.js`, section `destinations.bora` et `destinations.marseille` :
`phone`, `phoneHref`, `whatsappHref`, `addressLines`, `hours`.

## Où changer les photos
Toutes les images sont pour l'instant des **placeholders** (dégradé de couleur avec une fleur).
C'est volontaire : tant que les vraies photos ne sont pas fournies, mieux vaut un joli placeholder qu'une fausse image inventée.
Quand tu as les vraies photos : dépose-les dans `assets/images/` et dis-le-moi, je les intègre à la place des placeholders.

## Où modifier les soins
Section `services` de `data.js`. Chaque soin a : nom, description, bénéfices, durée, catégorie (`visage` ou `corps`), et `featured: true` s'il doit apparaître dans "Nos soins phares".

## Où ajouter un avis
Dans `destinations.bora.testimonials` ou `destinations.marseille.testimonials` — ajoute un objet `{ text: "...", author: "..." }`.
⚠️ Les avis actuels sont des **exemples** (issus des maquettes), pas de vrais avis clients — à remplacer dès que possible.

## Où ajouter une citation ("Les mots de Soraya")
Tableau `quotes` dans `data.js` — ajoute simplement une ligne de texte.

## Comment activer le Massage Polynésien
Dans `services`, trouve l'entrée `massage-polynesien` et change `status: "comingSoon"` en `status: "active"`.

## Comment changer le comportement du bouton "Prendre rendez-vous"
Section `booking` en haut de `data.js` :
- `mode: "whatsapp"` → ouvre WhatsApp
- `mode: "contact"` → renvoie vers la page Contact
Un seul réglage change tous les boutons du site.

---

## À faire avant la mise en ligne (TODO)
- [ ] Vraies photos (Soraya, soins, lieux) à la place des placeholders
- [ ] Vrais avis clients à la place des exemples
- [ ] Horaires précis (actuellement indicatifs)
- [ ] URL Google Maps pour chaque destination
- [ ] URL exactes Instagram / Facebook (à vérifier)
- [ ] Prix "Madérothérapie + Lipocavitation" (non communiqué, affiché "Tarif sur demande")
- [ ] Texte biographique définitif de Soraya — section "Mon Parcours" de `qui-suis-je.html` (repérable par le commentaire `<!-- TODO -->` juste au-dessus de la section)
- [ ] Service d'envoi pour le formulaire de contact (ex. Formspree) — pour l'instant le formulaire valide correctement les champs mais n'envoie RÉELLEMENT aucun message ; un message honnête l'indique à l'utilisateur avec le téléphone/email en alternative
- [ ] Traductions anglaises complètes — `assets/js/i18n.js` ne couvre pour l'instant que la navigation, les boutons et les titres de section ; le reste s'affiche en français par défaut tant qu'aucune traduction n'est ajoutée
- [ ] Finition visuelle de `mes-soins.html` sur grand écran : cartes de soins jugées trop petites par rapport à la largeur disponible — à revoir avec les dimensions et photos HD définitives
- [ ] URL Google Maps pour Bora Bora et Marseille — `ou-me-retrouver.html` affiche "Itinéraire à venir" tant que `mapUrl` est vide dans `data.js`
- [ ] Nom de l'institut partenaire à Marseille (si vous souhaitez en citer un précisément — actuellement juste "institut partenaire" en général)
- [ ] Massage Polynésien : statut `comingSoon` conservé volontairement (décision non prise dans cette passe, comme demandé) — les tarifs et la nouvelle photo sont déjà intégrés, prêt à activer d'une seule ligne dans `data.js` le jour venu
- [ ] Nom de l'institut partenaire à Marseille (toujours générique)
- [ ] Google Maps / itinéraire pour les deux destinations (bouton "Itinéraire" affiché désactivé avec la mention honnête "Itinéraire à venir")
- [ ] **Système d'avis — Supabase requis** : voir `SUPABASE-SETUP.md` à la racine du projet pour les 5 étapes exactes (créer le projet, exécuter le script SQL fourni, créer le compte de connexion de Soraya, coller les 2 clés dans `data.js`). Tant que ce n'est pas fait, aucun avis ne peut être soumis ou affiché, et `/admin.html` reste bloqué avec un message clair — rien n'est simulé.
- [ ] **Service d'envoi du formulaire Contact (Formspree)** : toujours en attente, inchangé depuis la passe précédente — voir `data.js` (`contactFormEndpoint`).

## Pages construites
Toutes les pages de la V1 sont désormais construites et fonctionnelles : **Accueil**, **Mes soins**, **Qui suis-je**, **Où me retrouver**, **Tarifs**, **Contact**, **Les mots de Soraya** (citations + avis clients).

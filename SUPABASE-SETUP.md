# Configuration Supabase — Système d'avis Fare Mana

**État actuel : configuré et en place.** Ce document ne décrit plus une
installation à faire, mais l'état réel du système d'avis tel qu'il a
été mis en place, pour référence et audit futur.

---

## 1. Projet Supabase

- Nom : **Fare Mana Avis**
- Région : West EU (Paris)
- Data API : activée
- "Automatically expose new tables" : **désactivé** (aucun privilège
  n'est jamais implicite — voir le script SQL ci-dessous, entièrement
  explicite en `grant`/`revoke`)
- Project URL : `https://adbwsmypdryfbbqeafnk.supabase.co`

Cette URL est renseignée dans `assets/js/data.js` (`DATA.supabase.url`).

## 2. Clé publique utilisée côté navigateur

Le projet utilise la nouvelle génération de clé Supabase, la
**Publishable key** (préfixe `sb_publishable_...`) — ce n'est pas
l'ancienne clé "anon" au format JWT.

```js
supabase: {
  url: "https://adbwsmypdryfbbqeafnk.supabase.co",
  anonKey: "sb_publishable_v5Vaaj2a7eBwoVL36oCkQQ_glYo2hHH",
},
```

C'est déjà en place dans `data.js`. Cette clé est publique par
conception (visible dans le code source du navigateur, comme toute clé
"publishable"/"anon" Supabase) — la vraie protection vient des règles
RLS ci-dessous, pas du secret de cette valeur.

**Point technique important, déjà pris en compte dans `site.js`** :
cette clé n'étant pas un JWT, elle ne doit **jamais** être envoyée
comme jeton `Authorization: Bearer`, seulement comme header `apikey`.
Pour les requêtes authentifiées (l'espace admin), c'est le vrai jeton
`session.access_token` renvoyé par Supabase Auth après connexion qui
sert de `Bearer` — jamais la clé publique.

La **secret key / service_role** ne doit jamais apparaître nulle part
dans ce projet (elle n'y est pas, et ne doit jamais y être ajoutée).

## 3. Compte admin

- Email : `faremana44@gmail.com`
- UID : `1fccd2b2-420d-47f8-afce-4eaf5025fedc`

C'est cet UID exact qui est codé en dur dans les policies RLS
ci-dessous — lui seul a les droits d'administration, quel que soit le
nombre d'autres comptes qui pourraient exister un jour sur ce projet.

## 4. Script SQL déjà exécuté avec succès

Le script ci-dessous a déjà été exécuté dans le SQL Editor de Supabase
et a renvoyé *"Success. No rows returned"*. Il est conservé ici tel
quel, pour référence et audit — **ne pas le réexécuter** (la table
existe déjà ; le relancer échouerait sur `create table`).

```sql
-- ============================================================
-- TABLE
-- ============================================================
create table reviews (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 1 and 60),
  destination text not null check (destination in ('bora', 'marseille')),
  treatment text,
  rating int not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 1 and 700),
  email_private text not null,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Défense en profondeur : on part de zéro, aucun privilège supposé
-- (cohérent avec un projet créé avec "Automatically expose new
-- tables" désactivé : aucun GRANT n'est jamais automatique ici).
revoke all on reviews from anon, authenticated, public;

-- ============================================================
-- ANON — peut UNIQUEMENT soumettre un avis.
-- Le GRANT et la POLICY sont tous les deux obligatoires : l'un sans
-- l'autre ne suffit pas (une policy RLS ne remplace jamais un grant).
-- ============================================================
grant insert on reviews to anon;

create policy "anon can insert a review"
  on reviews for insert
  to anon
  with check (true);

-- Aucun grant select/update/delete n'est donné à anon sur "reviews" :
-- une lecture ou modification directe de la table est donc IMPOSSIBLE
-- pour un visiteur, indépendamment de toute policy RLS.

-- ============================================================
-- AUTHENTICATED — seul le compte admin (UID exact) peut lire la
-- table complète et supprimer un avis.
-- ============================================================
grant select, delete on reviews to authenticated;

create policy "only admin can select reviews"
  on reviews for select
  to authenticated
  using (auth.uid() = '1fccd2b2-420d-47f8-afce-4eaf5025fedc'::uuid);

create policy "only admin can delete reviews"
  on reviews for delete
  to authenticated
  using (auth.uid() = '1fccd2b2-420d-47f8-afce-4eaf5025fedc'::uuid);

-- Aucune policy UPDATE n'est créée : personne ne peut modifier un
-- avis existant, seulement le supprimer.

-- ============================================================
-- VUE PUBLIQUE — expose uniquement les colonnes non sensibles.
-- ============================================================
create view reviews_public as
  select id, first_name, destination, treatment, rating, review_text, created_at
  from reviews;

grant select on reviews_public to anon;
```

### État des droits, résultat de ce script

**anon (visiteur public) :**
- INSERT sur `reviews` : autorisé (avis valide uniquement)
- SELECT direct sur `reviews` : impossible (aucun grant)
- UPDATE / DELETE : impossible
- SELECT sur `reviews_public` : autorisé (colonnes publiques uniquement)

**authenticated :**
- SELECT et DELETE possibles *techniquement* (le grant existe pour le
  rôle au sens large), mais les policies RLS restreignent strictement
  l'accès réel à `auth.uid() = 1fccd2b2-420d-47f8-afce-4eaf5025fedc` —
  un autre compte authentifié obtiendrait 0 ligne / 0 suppression.

`email_private` n'apparaît jamais dans `reviews_public` (elle n'est
même pas sélectionnée dans sa définition) : elle n'est lisible que par
le compte admin, via la table complète.

### Pourquoi `reviews_public` n'utilise pas `security_invoker = true`

Supabase recommande en général cette option pour éviter qu'une vue ne
contourne le RLS de sa table source. Elle ne s'applique pas utilement
ici :

1. `email_private` n'est jamais dans la définition de la vue — qu'elle
   soit "invoker" ou "definer", cette colonne reste structurellement
   absente du résultat, indépendamment de ce réglage.
2. Activer `security_invoker` exigerait que `anon` ait un `grant
   select` sur `reviews` elle-même (même restreint par colonnes), ce
   qui autoriserait un accès direct à la table — exactement ce qu'on
   veut éviter ("SELECT direct sur reviews : interdit").

Si l'outil "Security Advisor" de Supabase signale cette vue comme
"Security Definer View", c'est attendu et sans risque dans ce cas
précis (voir le détail ci-dessus) — vous pouvez l'ignorer en
connaissance de cause.

## 5. Formspree (formulaire Contact — indépendant de Supabase)

Le formulaire Contact utilise Formspree, **sans lien avec le système
d'avis** :

```
https://formspree.io/f/mljeydrj
```

Déjà en place dans `DATA.contactFormEndpoint` (`data.js`).

## 6. Notification e-mail à chaque nouvel avis (nouveau)

**Objectif** : à chaque avis publié automatiquement, un e-mail de
notification part vers `faremana44@gmail.com` (prénom, destination,
soin, note, commentaire, date, e-mail privé du client, et un bouton
"Gérer cet avis" vers `https://faremana.com/admin.html`).

**Architecture** : entièrement côté serveur, jamais dans le frontend.
Un *Database Webhook* Supabase se déclenche à chaque `INSERT` dans
`reviews` et appelle une *Edge Function* (`supabase/functions/notify-new-review/index.ts`,
déjà écrite dans ce dépôt) qui envoie l'e-mail via
[Resend](https://resend.com) — un service d'envoi d'e-mails simple,
avec une offre gratuite (100 e-mails/jour) largement suffisante ici.
Aucune clé n'est jamais commitée sur GitHub : la clé Resend vit
uniquement dans les *secrets* du projet Supabase.

L'avis reste publié automatiquement, sans aucune approbation
préalable : l'e-mail n'est qu'une notification, jamais une étape
bloquante (si l'envoi échoue, l'avis reste publié quand même).

### Étapes exactes à effectuer vous-même

**A. Créer un compte Resend et récupérer une clé API**
1. Aller sur [resend.com](https://resend.com) → créer un compte gratuit.
2. **API Keys** → *Create API Key* → copier la clé (commence par `re_`).
   Pour démarrer sans configurer de domaine, l'adresse d'expédition par
   défaut `onboarding@resend.dev` fonctionne (limitée à votre propre
   compte Resend comme destinataire de test au début — si l'e-mail
   n'arrive pas, vérifiez sur Resend s'il faut valider votre domaine
   `faremana.com` dans **Domains** pour envoyer vers `faremana44@gmail.com`
   sans restriction).

**B. Installer la Supabase CLI (une seule fois), si pas déjà fait**
```
npm install -g supabase
supabase login
```

**C. Déployer la fonction déjà écrite dans ce dépôt**

Depuis la racine du projet (là où se trouve le dossier `supabase/`) :
```
supabase link --project-ref adbwsmypdryfbbqeafnk
supabase functions deploy notify-new-review
```

**D. Configurer les secrets de la fonction (jamais dans GitHub)**
```
supabase secrets set RESEND_API_KEY=re_votre_cle_ici
supabase secrets set NOTIFY_TO_EMAIL=faremana44@gmail.com
```
(`NOTIFY_TO_EMAIL` est facultatif — `faremana44@gmail.com` est déjà la
valeur par défaut codée dans la fonction si vous ne définissez pas ce
secret.)

**E. Créer le Database Webhook dans le tableau de bord Supabase**
1. **Database → Webhooks → Create a new hook**
2. Nom : `notify-new-review` (libre)
3. Table : `reviews`
4. Événements : cocher uniquement **Insert**
5. Type : **Supabase Edge Functions**
6. Sélectionner la fonction `notify-new-review`
7. Enregistrer

C'est ce webhook qui appelle automatiquement la fonction à chaque
nouvel avis — aucune autre configuration n'est nécessaire.

### Comment tester

1. Soumettre un vrai avis depuis "Les mots de Soraya" sur le site en
   ligne.
2. Vérifier que l'avis apparaît bien publiquement (comme avant).
3. Vérifier la réception de l'e-mail sur `faremana44@gmail.com`
   (regarder aussi les spams la première fois).
4. Vérifier que le bouton "Gérer cet avis" de l'e-mail ouvre bien
   `https://faremana.com/admin.html`.
5. En cas de souci, **Supabase → Edge Functions → notify-new-review →
   Logs** affiche l'erreur exacte (ex. clé Resend manquante ou
   domaine non vérifié).

## 7. Vérifications restantes (à faire manuellement)

Ce que Claude ne peut pas tester lui-même (aucun accès réseau à
Supabase/Formspree/Resend depuis cet environnement) :

1. Soumettre un vrai avis depuis "Les mots de Soraya" → vérifier qu'il
   apparaît dans Supabase (Table Editor → `reviews`) et sur le site
   public quelques instants après.
2. Se connecter sur `/admin.html` avec `faremana44@gmail.com` →
   vérifier que l'avis apparaît (avec son e-mail privé, visible
   uniquement ici) → le supprimer → vérifier sa disparition du site
   public.
3. Essayer (si possible) de se connecter avec un *autre* compte
   Supabase Auth pour confirmer que RLS bloque bien tout accès.
4. Envoyer un message via le formulaire Contact → vérifier sa
   réception sur `faremana44@gmail.com` via Formspree.
5. Configurer Resend + le Database Webhook (section 7) → soumettre un
   avis test → vérifier la réception de l'e-mail de notification.

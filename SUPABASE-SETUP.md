# Configuration Supabase — Système d'avis Fare Mana

Ce document explique **exactement** comment activer le système d'avis
(publication automatique + suppression par Soraya). Tant que ces étapes
n'ont pas été suivies, le site reste dans un état sûr : aucun avis ne
peut être soumis ou affiché, et l'espace `/admin.html` reste bloqué
avec un message clair. Rien n'est simulé entre-temps.

Aucune de ces étapes ne peut être réalisée par Claude à votre place :
elles nécessitent un compte que vous seule pouvez créer et posséder.

---

## 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → créer un compte gratuit.
2. Créer un nouveau projet (choisir une région proche de vos visiteurs,
   ex. Europe).
3. Noter le mot de passe de la base que vous choisissez à cette étape
   (à conserver de côté, pas besoin pour la suite de ce guide).

## 2. Exécuter le script SQL

Dans le tableau de bord Supabase → **SQL Editor** → **New query**,
coller et exécuter exactement ce script :

```sql
-- Table des avis (données complètes, jamais exposée publiquement telle quelle)
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

-- Vue publique : expose uniquement les colonnes non sensibles.
-- email_private n'y figure jamais.
create view reviews_public as
  select id, first_name, destination, treatment, rating, review_text, created_at
  from reviews;

-- Active la sécurité au niveau des lignes (RLS)
alter table reviews enable row level security;

-- Le public peut SOUMETTRE un avis (insertion), rien d'autre sur la table
create policy "public can submit a review"
  on reviews for insert
  to anon
  with check (true);

-- Le public peut LIRE uniquement via la vue reviews_public (pas la table)
grant select on reviews_public to anon;

-- Seuls les utilisateurs authentifiés (Soraya) peuvent lire la table complète
create policy "authenticated can read all reviews"
  on reviews for select
  to authenticated
  using (true);

-- Seuls les utilisateurs authentifiés (Soraya) peuvent supprimer un avis
create policy "authenticated can delete reviews"
  on reviews for delete
  to authenticated
  using (true);
```

Ce script :
- crée la table complète (avec l'e-mail privé) ;
- crée une vue publique qui ne contient jamais l'e-mail ;
- autorise n'importe quel visiteur à **soumettre** un avis (avec les
  contraintes de validité : note entre 1 et 5, longueur raisonnable,
  destination valide) ;
- interdit à tout visiteur non connecté de lire la table complète, de
  modifier ou de supprimer un avis ;
- réserve la lecture complète et la suppression au compte authentifié
  de Soraya.

## 3. Créer le compte de connexion de Soraya

Dans **Authentication → Users → Add user** :
- Renseigner son adresse e-mail (ex. `faremana44@gmail.com`) et un mot
  de passe qu'elle choisit elle-même.
- Cocher "Auto Confirm User" pour ne pas avoir besoin d'un e-mail de
  confirmation.

C'est ce compte, et uniquement celui-ci, qui pourra se connecter sur
`/admin.html` pour voir et supprimer des avis.

## 4. Récupérer les deux clés à coller dans le site

Dans **Project Settings → API** :
- **Project URL** → à coller dans `assets/js/data.js`, remplacer
  `"SUPABASE_URL_TODO"` par cette URL exacte.
- **anon / public key** → à coller dans le même fichier, remplacer
  `"SUPABASE_ANON_KEY_TODO"` par cette clé.

```js
supabase: {
  url: "https://xxxxxxxxxxxx.supabase.co",   // ← votre Project URL
  anonKey: "eyJhbGciOiJI...",                 // ← votre clé anon/public
},
```

**Important sur cette clé "anon"** : elle est conçue pour être visible
côté navigateur (ce n'est pas un secret). La vraie protection vient des
règles RLS créées à l'étape 2 — c'est pour cela qu'il est essentiel
d'exécuter le script SQL avant de coller les clés.

## 5. Vérifier

Une fois les deux valeurs collées :
- la page "Les mots de Soraya" doit pouvoir accepter une vraie
  soumission d'avis (publication immédiate) ;
- `/admin.html` doit permettre à Soraya de se connecter avec le compte
  créé à l'étape 3, voir les avis, et en supprimer un.

Si quelque chose ne fonctionne pas après ces 5 étapes, vérifier en
priorité que le script SQL de l'étape 2 s'est bien exécuté sans erreur
(l'éditeur SQL de Supabase affiche un message de succès ou d'erreur
juste après l'exécution).

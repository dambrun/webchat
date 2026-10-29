# Webchat
Une messagerie instantannée pour s'échanger des messages textes.

L'objectif de ce projet (volontairement simple) est d'aider à comprendre plusieurs concepts de base liés à la conception et la programmation de site Web, permettant ensuite d'aborder d'autres approches plus complexes.

## Fonctionnalités
- Inscription et connexion (avec une adresse courriel et un mot de passe), déconnexion 
- Création de salons de discussion (noms uniques)
- Envoi et réception de messages en temps réel
- Affichage des 50 derniers messages d'un salon
- Thème clair, sombre ou automatique (système)
- Interface adaptée au mobile (un seul panneau à la fois sur petit écran)
- Le salon ouvert est conservé lors d'un rechargement de la page

## Technologies
| Rôle | Choix |
|---|---|
| Interface | HTML, CSS, JavaScript |
| Authentification et base de données (incluant le temps réel) | [Supabase](https://supabase.com) (PostgreSQL) |
| Bibliothèque côté client | `supabase-js` |

Il n'y a **pas de configuration de serveur Web** : le navigateur communique directement avec Supabase.

## Structure du projet
```
webchat/
├── index.html          Page principale (salons + messages)
├── signin.html         Connexion et inscription
├── settings.html       Paramètres (thème et déconnexion)
└── assets/
    ├── css/            
    │   ├── base.css    Variables, règles générales
    │   ├── chat.css    Mise en page des salons et messages
    │   └── forms.css   Pages de connexion et de paramètres
    └── js/
        ├── local.js    Sauvegarde du thème et du salon actuel (objet Local)
        ├── spclient.js Configuration et création du client Supabase
        ├── auth.js     Authentification (objet Auth)
        ├── data.js     Accès aux données (objet Data)
        ├── chat.js     Logique de la page principale
        ├── signin.js   Logique de la page de connexion
        └── settings.js Logique de la page des paramètres
```

## Architecture
### Une organisation en couches
Chaque fichier JavaScript a **une seule responsabilité**. Les fichiers « de page » (`chat.js`, `signin.js`, `settings.js`) s'occupent de l'interface ; ils s'appuient sur des fichiers « de service » (ces derniers ne touchent jamais au document).

```
Pages (écoute des événements, manipulation du document)
   ┌──────────┬──────────────┬─────────────┐
   │ chat.js  │  signin.js   │ settings.js │
   └────┬─────┴──────┬───────┴──────┬──────┘
        │            │              │
        ▼            ▼              ▼
   ┌─────────┐  ┌─────────┐   ┌──────────┐
   │ data.js │  │ auth.js │   │ local.js │   Services
   │ (Data)  │  │ (Auth)  │   │ (Local)  │
   └────┬────┘  └────┬────┘   └────┬─────┘
        └─────┬──────┘             │
              ▼                    ▼
        ┌────────────┐     localStorage /
        │ spclient.js│     sessionStorage
        └─────┬──────┘
              ▼
          Supabase
```

- **`Auth`** : connexion, inscription, déconnexion, session.
- **`Data`** : requêtes sur les salons et messages, abonnements temps réel.
- **`Local`** : préférences et état conservés dans le navigateur.

Avantage : les pages ne connaissent pas Supabase. Pour changer de service, seuls `auth.js`, `data.js` et `spclient.js` seraient à réécrire.

### Objets
Pour organiser les fonctions, chaque service (`Auth`, `Data`, `Local`) est regroupé dans un **objet** : pour utiliser une fonction on écrira ainsi `Data.fetchChannels()`, ce qui indique tout de suite d'où elle vient. Par ailleurs cette approche permet d'éviter (sans les modules) des conflits avec les fonctions qui auraient le même nom et partagent la même portée globale.

### Ordre de chargement des scripts
Les scripts `defer` s'exécutent dans l'ordre où ils sont écrits, après la lecture du HTML. L'ordre est donc une dépendance :

```
supabase-js → spclient.js → auth.js → data.js → chat.js
```

`local.js` fait exception : il est chargé **sans `defer`** dans le `<head>`, pour appliquer le thème avant le premier affichage (sinon le thème clair pourrait éventuellement apparaître très rapidement avant le thème sombre, si ce dernier est choisi).

### Le thème
1. `local.js` lit le choix (`light`, `dark`, `system`) dans `localStorage`.
2. Il pose `data-theme="light"` ou `"dark"` sur `<html>`.
3. `base.css` redéfinit les variables de couleur quand `data-theme="dark"`.

Tout le CSS utilise ces variables : il n'y a aucune couleur écrite directement dans les règles de style.

### Affichage responsive
La classe `open` sur `<body>` indique qu'un salon est ouvert. Le CSS s'en sert pour choisir quoi afficher : sur grand écran, la liste et le salon côte à côte ; sur mobile (`max-width: 600px`), un seul des deux avec un bouton « Retour ».

### Circulation des données (envoi et affichage d'un message)
Un message **n'est pas ajouté directement** (en local) à l'écran lors de son envoi : il apparaît quand la base le renvoie par l'abonnement temps réel. Ainsi, tous les messsages passent par le même chemin, et on affiche uniquement ce qui est réellement enregistré.

### Gestion des sessions
Chaque page protégée appelle `Auth.onSessionEnded(...)`. Si la personne n'est pas connectée (ou ne l'est plus), elle est redirigée vers `signin.html`. À l'inverse, `signin.js` redirige vers `index.html` dès qu'une session existe.

## Base de données
Deux tables, toutes deux avec Realtime activé. Le script complet est dans [`schema.sql`](schema.sql) (description de la base de données).

### Table `channels`

| Colonne | Type | Remarque |
|---|---|---|
| `id` | uuid | clé primaire |
| `name` | text | unique |
| `created_at` | timestamptz | par défaut `now()` |
| `created_by` | uuid | clé étrangère → `auth.users.id`, par défaut `auth.uid()` |

### Table `messages`

| Colonne | Type | Remarque |
|---|---|---|
| `id` | uuid | clé primaire |
| `channel_id` | uuid | clé étrangère → `channels.id` |
| `user_id` | uuid | clé étrangère → `auth.users.id`, par défaut `auth.uid()` |
| `username` | text | adresse courriel affichée |
| `content` | text | contenu du message |
| `created_at` | timestamptz | par défaut `now()` |

### Sécurité (RLS)
La clé « publishable » de `spclient.js` est visible par tout le monde (c'est normal). La protection repose sur la **sécurité au niveau des lignes (RLS)** de PostgreSQL :

- **Lecture** : toute personne authentifiée peut lire tous les salons et messages.
- **Création** : toute personne authentifiée peut créer un salon ou un message, à condition que `created_by` / `user_id` soit son propre identifiant.
- **Modification et suppression** : aucune règle, donc interdites.

Le client **n'envoie jamais** `created_by` ni `user_id` : la base les remplit avec `auth.uid()`.

> **Limite connue** : Actuellement, `username` est envoyé par le client. Une personne pourrait donc y écrire autre chose que son courriel. L'identifiant (`user_id`), lui, reste fiable.

## Installation
1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécuter le contenu de `schema.sql` (présent sur le dépôt).
3. Dans **Authentication** -> **Sign In/Providers**, vérifier que la connexion par courriel est activée (elle l'est par défaut normalement, pour tester rapidement, on peut éventuellement désactiver la confirmation par courriel).
4. Dans `assets/js/spclient.js`, remplacer `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` par ceux de votre projet (**Project Settings > API**).
5. Préférable d'utiliser un serveur local, par exemple, avec l'extension *Live Preview* de VSCodium (VSCode) pour modifier et tester le site.

> Ne jamais mettre la clé `secret` / `service_role` dans le code du navigateur.

## Corrections et pistes d'amélioration
- Afficher les erreurs dans la page (un `<p role="alert">`) plutôt que dans la console.
- Obtenir `username` côté serveur (trigger ou profil) plutôt que depuis le client.
- Charger les messages plus anciens (fausse pagination basé sur le défilement).
- Empêcher un message d'apparaître en double si un envoi arrive entre l'abonnement et le chargement initial.
- Tenir compte du fuseau horaire local pour l'horodatage des messages
- Désactiver les boutons d'actions dans l'attente d'une réponse du service
- Ajouter des effets d'animations ou transitions
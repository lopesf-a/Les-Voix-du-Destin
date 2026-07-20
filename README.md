# Les Voix du Destin

**Les Voix du Destin** est une application web de jeu de rôle solo assistée par intelligence artificielle.  
Le projet permet à un joueur de créer un personnage, lancer une session narrative, interagir avec un maître du jeu IA et conserver l’historique de son aventure.

Ce projet a été réalisé dans le cadre du **RNCP39583 — Expert en développement logiciel**, notamment pour démontrer les compétences du **Bloc 2 : concevoir et développer des applications logicielles**.

---

## Présentation du projet

**Les Voix du Destin** est un prototype MVP de jeu de rôle narratif assisté par IA.

L’objectif est de proposer une expérience de JDR solo dans laquelle :

- le joueur crée un personnage ;
- le joueur démarre une session d’aventure ;
- l’IA joue le rôle de maître du jeu ;
- le backend applique les règles principales ;
- l’historique de partie est conservé ;
- les usages IA sont journalisés pour suivre les coûts, les erreurs et les performances.

L’application repose sur une architecture séparée entre le frontend, le backend, la base de données et le service IA.

---

## Environnement de démonstration

| Élément | Service | URL / rôle |
|---|---|---|
| Frontend | Vercel | `https://les-voix-du-destin-frontend.vercel.app` |
| Backend | Render | `https://les-voix-du-destin.onrender.com` |
| Healthcheck API | Render | `https://les-voix-du-destin.onrender.com/api/health` |
| Base de données | Neon | PostgreSQL managé |
| IA | Mistral API | Génération narrative |
| CI | GitHub Actions | Lint, tests unitaires, build |
| CD | Vercel + Render | Redéploiement automatique après push sur `main` |

Cet environnement correspond à un **déploiement de démonstration en ligne** adapté au Bloc 2.  
Il ne s’agit pas encore d’une production finale, mais d’un environnement représentatif permettant de valider le prototype.

---

## Fonctionnalités principales

Le prototype inclut actuellement :

- authentification joueur avec JWT ;
- création et consultation de personnages ;
- scénarios JDR de démonstration ;
- création de sessions de jeu ;
- historique des messages de partie ;
- génération de tours de jeu via l’API Mistral ;
- streaming du texte du maître du jeu via Server-Sent Events ;
- moteur de règles backend ;
- jet de dé `1d20` ;
- calcul de difficulté, réussite et échec ;
- gestion des dégâts, soins, points de vie et expérience ;
- mode mock automatique si aucune clé Mistral n’est configurée ;
- logs d’usage IA ;
- dashboard minimal avec métriques MVP ;
- back-office minimal pour suivre personnages, sessions et consommation IA.

---

## Architecture technique

```txt
les-voix-du-destin/
  frontend/              Application SvelteKit
  backend/               API Express TypeScript
  backend/prisma/        Schéma Prisma et migrations
  docs/                  Documentation Bloc 2
  .github/workflows/     Workflows CI/CD
  docker-compose.yml     Base PostgreSQL locale
  README.md              Documentation principale
```

Flux principal :

```txt
Navigateur joueur
      |
      v
Frontend SvelteKit sur Vercel
      |
      v
API Express TypeScript sur Render
      |
      +--> PostgreSQL Neon via Prisma
      |
      +--> Moteur de règles : dés, PV, XP, difficulté
      |
      +--> Service IA Mistral
      |
      +--> Logs et métriques IA
```

---

## Stack utilisée

### Frontend

- SvelteKit
- TypeScript
- HTML / CSS
- Appels API REST
- Streaming SSE côté client
- Déploiement Vercel

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- Zod
- Bcrypt
- Helmet
- CORS
- Déploiement Render

### Base de données

- PostgreSQL
- Neon en environnement en ligne
- Docker Compose pour l’environnement local
- Prisma pour le mapping objet-relationnel

### Intelligence artificielle

- API Mistral
- Mode mock en absence de clé API
- Service IA isolé côté backend
- Journalisation des appels IA

---

## Installation locale

Prérequis :

- Node.js 20 ou supérieur ;
- npm 10 ou supérieur ;
- Docker Desktop ou PostgreSQL local ;
- une clé API Mistral optionnelle.

Installation :

```bash
npm run setup
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Application locale :

```txt
http://localhost:5173
```

API locale :

```txt
http://localhost:3001/api
```

---

## Variables d’environnement

### Backend local

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://jdr_user:jdr_password@localhost:5432/les_voix_du_destin?schema=public"
JWT_SECRET="change-me-in-production"
MISTRAL_API_KEY=""
MISTRAL_MODEL="mistral-small-latest"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend local

```env
PUBLIC_API_URL="http://localhost:3001/api"
```

### Backend Render

```env
NODE_ENV=production
NODE_VERSION=20
PORT=3001
DATABASE_URL="<url_neon>"
JWT_SECRET="<secret_jwt_fort>"
MISTRAL_API_KEY="<cle_mistral>"
MISTRAL_MODEL="mistral-small-latest"
CORS_ORIGIN="https://les-voix-du-destin-frontend.vercel.app"
```

### Frontend Vercel

```env
PUBLIC_API_URL="https://les-voix-du-destin.onrender.com/api"
```

Le fichier `.env` ne doit jamais être versionné dans Git.  
Seuls les fichiers `.env.example` doivent être conservés dans le dépôt.

---

## Commandes utiles

```bash
npm run dev                 # Lance le frontend et le backend
npm run dev:backend         # Lance uniquement le backend
npm run dev:frontend        # Lance uniquement le frontend
npm run db:up               # Lance PostgreSQL avec Docker
npm run db:migrate          # Applique les migrations Prisma en local
npm run db:seed             # Ajoute les données de démonstration
npm run lint                # Vérifie la qualité du code
npm run test                # Lance les tests unitaires
npm run build               # Build frontend + backend
```

---

## Comptes de démonstration

En local, après :

```bash
npm run db:seed
```

Les comptes suivants peuvent être utilisés :

```txt
Joueur : player@example.com / password123
Admin  : admin@example.com / password123
```

En production Neon, si le compte de démonstration n’existe pas, utiliser le bouton **Créer un compte** ou exécuter le seed une seule fois sur la base de démonstration.

---

## Structure de l’API

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/characters
POST   /api/characters

GET    /api/scenarios
GET    /api/rules

GET    /api/sessions
POST   /api/sessions
GET    /api/sessions/:id/messages

POST   /api/ai/turn
POST   /api/ai/turn/stream

GET    /api/metrics/overview
GET    /api/health
```

Healthcheck de production :

```txt
https://les-voix-du-destin.onrender.com/api/health
```

---

## Fonctionnement du moteur de règles

Le backend est responsable des règles de jeu.  
L’IA ne décide pas directement des points de vie, des dégâts ou du résultat des dés.

Pour chaque action joueur :

```txt
1. Le joueur envoie une action.
2. Le backend classe l’action : attaque, défense, discrétion, enquête, social, soin ou action générique.
3. Le backend choisit la statistique utilisée : Force, Dextérité ou Intelligence.
4. Le backend lance un dé 1d20.
5. Le backend calcule le total avec le modificateur de statistique.
6. Le backend compare le total à une difficulté.
7. Le backend applique les conséquences : dégâts, soins, XP et PV.
8. Le résultat est envoyé à Mistral.
9. Mistral raconte la scène en respectant le résultat calculé.
```

Ce choix évite que l’IA invente seule les règles ou modifie l’état du personnage de manière incohérente.

---

## Tests et qualité

Le projet est vérifié avant livraison avec :

```bash
npm run lint
npm run test
npm run build
```

Les tests unitaires couvrent en priorité :

- le moteur de règles ;
- le calcul réussite / échec ;
- la gestion des points de vie ;
- les soins ;
- les actions génériques.

---

## Intégration continue

Le projet utilise GitHub Actions pour automatiser les vérifications qualité.

Le workflow de CI se trouve dans :

```txt
.github/workflows/ci.yml
```

À chaque push ou pull request vers `main` ou `develop`, la CI vérifie :

```txt
1. Récupération du code
2. Installation de Node.js
3. Installation des dépendances
4. Génération Prisma
5. Lint backend
6. Lint frontend
7. Tests unitaires
8. Build complet
```

Statut actuel : **CI opérationnelle**.

---

## Déploiement continu

Le projet dispose désormais d’un déploiement en ligne :

| Partie | Plateforme | Statut |
|---|---|---|
| Frontend | Vercel | Déployé |
| Backend | Render | Déployé |
| Base de données | Neon | Connectée |
| Healthcheck | Render | Opérationnel |

La CD est assurée par les intégrations GitHub natives de Vercel et Render : après un push sur `main`, les services peuvent reconstruire et redéployer automatiquement l’application.

Un workflow complémentaire existe également dans :

```txt
.github/workflows/cd.yml
```

Il permet de documenter et préparer une automatisation CD pilotée depuis GitHub Actions via secrets.

Formulation recommandée Bloc 2 :

> La CI est opérationnelle avec GitHub Actions. Le projet dispose également d’un environnement en ligne : frontend sur Vercel, backend sur Render et base PostgreSQL sur Neon. Le déploiement continu est activé via les intégrations GitHub des hébergeurs, avec un workflow CD GitHub Actions documenté comme mécanisme complémentaire.

---

## Sécurité

Mesures de sécurité prévues ou déjà présentes :

| Risque | Mesure appliquée |
|---|---|
| Injection | Utilisation de Prisma et validation des entrées |
| Données invalides | Schémas de validation avec Zod |
| Mot de passe compromis | Hash des mots de passe avec bcrypt |
| Secret exposé | Variables sensibles dans `.env`, non versionnées |
| Accès non autorisé | Middleware JWT sur les routes protégées |
| CORS trop permissif | Origine autorisée configurée avec `CORS_ORIGIN` |
| Headers HTTP faibles | Utilisation de Helmet |
| Payload trop lourd | Limitation de la taille JSON |
| Erreur serveur trop détaillée | Messages d’erreur contrôlés côté client |
| Dépendance IA externe | Service IA isolé + mode mock |
| Dérive IA | Le backend calcule les règles, l’IA raconte seulement |

---

## Accessibilité

Premières mesures RGAA appliquées :

| Point | Mesure |
|---|---|
| Structure | Pages organisées avec titres et sections |
| Formulaires | Champs identifiés par labels visibles |
| Navigation | Menu principal présent sur les pages |
| Erreurs | Messages d’erreur lisibles côté utilisateur |
| Contrastes | Interface sombre avec texte clair |
| Boutons | Libellés explicites |
| Langue | Interface en français |

L’audit RGAA complet reste à compléter pour une version de production finale.

---

## Documentation Bloc 2

Documents fournis ou attendus :

```txt
docs/
  workflow-git.md
  cahier-recette.md
  bugs.md
  securite-accessibilite.md
  deploiement.md
  deploiement-continu.md
  manuel-utilisateur.md
  manuel-mise-a-jour.md
  preuves-commandes.md
```

Ces documents couvrent :

- cahier de recette fonctionnelle ;
- suivi des anomalies ;
- sécurité et accessibilité ;
- installation et déploiement ;
- CI/CD ;
- procédure de mise à jour ;
- preuves de tests et build.

---

## Limites du MVP

Le prototype ne couvre pas encore :

- le multijoueur temps réel ;
- l’éditeur complet de scénarios ;
- la marketplace de campagnes ;
- la personnalisation avancée des règles ;
- l’administration complète ;
- l’audit RGAA complet ;
- la supervision avancée des coûts IA ;
- les tests end-to-end complets.

Ces choix sont volontaires afin de conserver un périmètre réaliste et démontrable.

---

## Évolutions prévues

Les prochaines évolutions possibles sont :

- ajout de tests unitaires plus complets ;
- ajout de tests end-to-end avec Playwright ;
- amélioration du dashboard administrateur ;
- export PDF ou Markdown des aventures ;
- gestion de plusieurs univers narratifs ;
- amélioration de la mémoire de session ;
- système de sauvegarde avancé ;
- ajout de rôles utilisateur plus détaillés ;
- audit accessibilité complet ;
- amélioration du workflow CD GitHub Actions avec secrets configurés.

---

## Statut du projet

Version actuelle : **MVP de démonstration déployé**

Objectif principal :

```txt
Prouver la faisabilité technique d’un JDR solo assisté par IA,
avec une architecture web moderne, un backend responsable des règles,
une base PostgreSQL persistante, une intégration IA encadrée,
une CI opérationnelle et un environnement en ligne.
```

---

## Auteur

Projet réalisé par François Lopes dans le cadre du titre **Expert en développement logiciel — RNCP39583**.

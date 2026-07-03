# JDR IA Mistral — SvelteKit + Express TS + PostgreSQL

Application web de jeu de rôle assistée par IA. Le projet reprend l'architecture cadrée pour le Bloc 1 RNCP39583 : front SvelteKit, API Express TypeScript, base PostgreSQL, service IA Mistral isolé, logs d'usage IA et supervision minimale.

## Fonctionnalités incluses

- Authentification joueur simple avec JWT.
- Création et consultation de personnages.
- Scénarios JDR de démonstration.
- Création de session de jeu.
- Historique des messages de partie.
- Génération de tour de jeu via Mistral API.
- Streaming du texte du MJ via Server-Sent Events sur `POST /api/ai/turn/stream`.
- Moteur de règles backend : jet de dé `1d20`, difficulté, réussite/échec, dégâts, soins, XP et mise à jour des PV.
- Mode mock automatique si aucune clé Mistral n'est configurée, avec streaming simulé.
- Logs d'usage IA dans `ai_usage_logs`.
- Dashboard avec métriques MVP.
- Back-office minimal côté front pour suivre personnages, sessions et consommation IA.

## Architecture

```txt
jdr-ia-mistral/
  frontend/        SvelteKit
  backend/         Express TypeScript + Prisma
  docker-compose.yml
  README.md
```

Flux principal :

```txt
SvelteKit Frontend -> Express REST API -> PostgreSQL
                         |
                         -> Moteur de règles : dés / PV / XP
                         -> Service IA Mistral en streaming
                         -> Logs / métriques IA
```

## Prérequis

- Node.js 20+
- npm 10+
- Docker Desktop ou PostgreSQL local
- Une clé API Mistral optionnelle

## Installation rapide

```bash
npm run setup
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Puis ouvrir :

```txt
http://localhost:5173
```

API Express :

```txt
http://localhost:3001
```

## Variables d'environnement

Copier les fichiers exemples si la commande `setup` ne l'a pas déjà fait :

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://jdr_user:jdr_password@localhost:5432/jdr_ia?schema=public"
JWT_SECRET="change-me-in-production"
MISTRAL_API_KEY=""
MISTRAL_MODEL="mistral-small-latest"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend

```env
PUBLIC_API_URL="http://localhost:3001/api"
```

## Commandes utiles

```bash
npm run dev                 # front + back
npm run dev:backend         # back uniquement
npm run dev:frontend        # front uniquement
npm run db:up               # lance PostgreSQL Docker
npm run db:migrate          # applique le schéma Prisma
npm run db:seed             # ajoute données de démo
npm run build               # build front + back
```

## Comptes de démonstration

Après `npm run db:seed` :

```txt
Joueur : player@example.com / password123
Admin  : admin@example.com / password123
```

## Notes pédagogiques

Cette base illustre les choix du cadrage :

- front séparé de l'API ;
- base relationnelle PostgreSQL ;
- service IA isolé pour limiter la dépendance fournisseur ;
- historique des sessions ;
- journalisation de la consommation IA ;
- périmètre MVP sans multijoueur temps réel.

## Structure API

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
POST   /api/ai/turn          # réponse complète classique
POST   /api/ai/turn/stream   # streaming SSE du MJ IA
GET    /api/metrics/overview
GET    /api/health
```


## Fonctionnement du dé et des PV

Le backend est le seul responsable des règles. L'IA ne décide pas les PV et ne relance pas les dés.

Pour chaque action joueur :

```txt
1. Le backend classe l'action : attaque, défense, discrétion, enquête, social, soin ou action générique.
2. Il choisit la statistique : Force, Dextérité ou Intelligence.
3. Il lance 1d20.
4. Il calcule total = dé + modificateur de stat.
5. Il compare le total à une difficulté.
6. Il applique les conséquences : dégâts, soins, XP et PV en base.
7. Mistral reçoit le résultat déjà calculé et raconte la scène en streaming.
```

Exemple avec un jet de 5 :

```txt
Jet 1d20 : 5 + modificateur 1 = 6 contre difficulté 12.
Résultat : échec.
PV : 20/20 -> 14/20 si le moteur applique 6 dégâts.
```

Dans l'interface, le champ facultatif "Jet forcé pour test local" permet de mettre `5` pour vérifier ce comportement en développement.

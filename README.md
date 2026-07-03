# Les Voix du Destin

**Les Voix du Destin** est une application web de jeu de rôle solo assistée par intelligence artificielle.  
Le projet permet à un joueur de créer un personnage, lancer une session narrative, interagir avec un maître du jeu IA et conserver l’historique de son aventure.

Ce projet a été réalisé dans le cadre du **RNCP39583 — Expert en développement logiciel**, notamment pour démontrer les compétences du **Bloc 2 : concevoir et développer des applications logicielles**.

---

## Sommaire

- [Présentation du projet](#présentation-du-projet)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture technique](#architecture-technique)
- [Stack utilisée](#stack-utilisée)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
- [Variables d’environnement](#variables-denvironnement)
- [Commandes utiles](#commandes-utiles)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Structure de l’API](#structure-de-lapi)
- [Fonctionnement du moteur de règles](#fonctionnement-du-moteur-de-règles)
- [Tests et qualité](#tests-et-qualité)
- [Intégration continue](#intégration-continue)
- [Sécurité](#sécurité)
- [Accessibilité](#accessibilité)
- [Documentation Bloc 2](#documentation-bloc-2)
- [Limites du MVP](#limites-du-mvp)
- [Évolutions prévues](#évolutions-prévues)

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
  docker-compose.yml     Base PostgreSQL locale
  README.md              Documentation principale
```

Flux principal :

```txt
Navigateur joueur
      |
      v
Frontend SvelteKit
      |
      v
API Express TypeScript
      |
      +--> PostgreSQL / Prisma
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

### Base de données

- PostgreSQL
- Docker Compose pour l’environnement local
- Prisma pour le mapping objet-relationnel

### Intelligence artificielle

- API Mistral
- Mode mock en absence de clé API
- Service IA isolé côté backend
- Journalisation des appels IA

---

## Prérequis

Avant de lancer le projet, il faut disposer de :

- Node.js 20 ou supérieur ;
- npm 10 ou supérieur ;
- Docker Desktop ou PostgreSQL local ;
- une clé API Mistral optionnelle.

La clé Mistral n’est pas obligatoire pour tester le projet, car un mode mock est prévu.

---

## Installation rapide

Cloner le projet puis installer les dépendances :

```bash
npm run setup
```

Lancer la base PostgreSQL avec Docker :

```bash
npm run db:up
```

Appliquer le schéma Prisma :

```bash
npm run db:migrate
```

Insérer les données de démonstration :

```bash
npm run db:seed
```

Lancer le frontend et le backend :

```bash
npm run dev
```

Application frontend :

```txt
http://localhost:5173
```

API backend :

```txt
http://localhost:3001
```

---

## Variables d’environnement

Copier les fichiers exemples si la commande `setup` ne les a pas déjà créés :

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Backend

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://jdr_user:jdr_password@localhost:5432/les_voix_du_destin?schema=public"
JWT_SECRET="change-me-in-production"
MISTRAL_API_KEY=""
MISTRAL_MODEL="mistral-small-latest"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend

```env
PUBLIC_API_URL="http://localhost:3001/api"
```

### Remarque sécurité

Le fichier `.env` ne doit jamais être versionné dans Git.  
Seuls les fichiers `.env.example` doivent être conservés dans le dépôt.

---

## Commandes utiles

```bash
npm run dev                 # Lance le frontend et le backend
npm run dev:backend         # Lance uniquement le backend
npm run dev:frontend        # Lance uniquement le frontend
npm run db:up               # Lance PostgreSQL avec Docker
npm run db:migrate          # Applique les migrations Prisma
npm run db:seed             # Ajoute les données de démonstration
npm run build               # Build frontend + backend
npm run lint                # Vérifie la qualité du code
npm run test                # Lance les tests unitaires si configurés
```

---

## Comptes de démonstration

Après l’exécution de la commande :

```bash
npm run db:seed
```

Les comptes suivants peuvent être utilisés :

```txt
Joueur : player@example.com / password123
Admin  : admin@example.com / password123
```

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

Exemple de jet :

```txt
Jet 1d20 : 5
Modificateur : +1
Total : 6
Difficulté : 12
Résultat : échec
Conséquence : perte de PV ou absence de progression
```

Ce choix permet d’éviter que l’IA invente seule les règles ou modifie l’état du personnage de manière incohérente.

---

## Tests et qualité

Le projet doit être vérifié avant chaque livraison.

Commandes prévues :

```bash
npm run lint
npm run test
npm run build
```

Les tests unitaires doivent prioritairement couvrir :

- le moteur de règles ;
- le calcul réussite / échec ;
- la gestion des points de vie ;
- les soins ;
- la validation des entrées ;
- les services backend critiques.

Exemples de cas à tester :

| Cas testé | Résultat attendu |
|---|---|
| Jet forcé à 5 | Échec contre une difficulté standard |
| Jet forcé à 20 | Réussite critique ou réussite forte |
| Soin supérieur aux PV max | Les PV ne dépassent pas le maximum |
| Attaque réussie | Les PV de la cible diminuent |
| Action inconnue | L’action reste traitée comme générique |

---

## Intégration continue

Le workflow cible repose sur GitHub Actions ou une solution équivalente.

À chaque push ou pull request, la CI doit vérifier :

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

Objectif :

- éviter les régressions ;
- vérifier que le projet compile ;
- garantir un niveau minimal de qualité ;
- sécuriser les futures évolutions.

---

## Workflow Git

Pendant la première phase du MVP, le développement a été réalisé principalement sur une branche principale afin d’avancer rapidement sur une preuve de concept individuelle.

Cette organisation est suffisante pour un prototype court, mais elle limite la traçabilité fine des évolutions.

Le workflow cible pour les prochaines itérations est le suivant :

```txt
main           Version stable
develop        Version d’intégration
feature/*      Nouvelles fonctionnalités
fix/*          Corrections de bugs
release/*      Préparation d’une version livrable
```

Exemples :

```txt
feature/tests-unitaires
feature/ci-github-actions
feature/accessibilite-formulaires
fix/erreur-streaming-ia
release/v1-demo
```

---

## Sécurité

Mesures de sécurité prévues ou déjà présentes :

| Risque | Mesure appliquée |
|---|---|
| Injection | Utilisation de Prisma et validation des entrées |
| Données invalides | Schémas de validation avec Zod |
| Mot de passe compromis | Hash des mots de passe avec bcrypt |
| Secret exposé | Variables sensibles dans `.env` |
| Accès non autorisé | Middleware JWT sur les routes protégées |
| CORS trop permissif | Origine autorisée configurée avec `CORS_ORIGIN` |
| Headers HTTP faibles | Utilisation de Helmet |
| Payload trop lourd | Limitation de la taille JSON |
| Erreur serveur trop détaillée | Messages d’erreur contrôlés côté client |

Bonnes pratiques associées :

- ne jamais versionner `.env` ;
- utiliser un secret JWT robuste en production ;
- limiter les logs sensibles ;
- contrôler les entrées utilisateur ;
- surveiller les dépendances ;
- vérifier les erreurs backend.

---

## Accessibilité

Le prototype vise une interface simple, lisible et utilisable.

Points à contrôler :

| Point | Mesure |
|---|---|
| Structure | Pages organisées avec titres et sections |
| Formulaires | Champs identifiés et compréhensibles |
| Navigation | Parcours utilisateur simple |
| Erreurs | Messages d’erreur lisibles |
| Contrastes | Interface claire et lisible |
| Clavier | Amélioration prévue de la navigation clavier |
| RGAA | Audit manuel prévu sur les écrans principaux |

L’accessibilité complète reste une amélioration prévue pour une version plus avancée.

---

## Documentation Bloc 2

Pour répondre aux attentes du Bloc 2 RNCP39583, le projet doit être accompagné des documents suivants :

```txt
docs/
  workflow-git.md
  cahier-recette.md
  bugs.md
  securite-accessibilite.md
  deploiement.md
  manuel-utilisateur.md
  manuel-mise-a-jour.md
```

Documents recommandés :

- cahier de recette fonctionnelle ;
- suivi des anomalies ;
- documentation de sécurité ;
- documentation d’accessibilité ;
- procédure d’installation ;
- procédure de déploiement ;
- procédure de mise à jour ;
- captures d’écran du prototype ;
- preuves de tests ;
- preuves de build ;
- preuves de CI/CD.

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
- audit accessibilité plus complet ;
- déploiement continu vers un environnement de démonstration.

---

## Statut du projet

Version actuelle : **MVP de démonstration**

Objectif principal :

```txt
Prouver la faisabilité technique d’un JDR solo assisté par IA,
avec une architecture web moderne, un backend responsable des règles,
une base PostgreSQL persistante et une intégration IA encadrée.
```

---

## Auteur

Projet réalisé par François Lopes dans le cadre du titre **Expert en développement logiciel — RNCP39583**.

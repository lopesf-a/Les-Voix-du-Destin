# Déploiement continu — Les Voix du Destin

## Objectif

Ce document décrit la partie **CD** du workflow CI/CD du projet **Les Voix du Destin**.

Le projet possède :

- une **CI opérationnelle** avec GitHub Actions ;
- un **frontend déployé sur Vercel** ;
- un **backend déployé sur Render** ;
- une **base PostgreSQL Neon** ;
- une documentation de déploiement permettant de reproduire l’environnement.

---

## Environnement en ligne

| Élément | Plateforme | Statut |
|---|---|---|
| Frontend SvelteKit | Vercel | Déployé |
| Backend Express TypeScript | Render | Déployé |
| Base de données PostgreSQL | Neon | Connectée |
| IA | Mistral API | Connectée |
| Healthcheck API | Render | Opérationnel |
| CI | GitHub Actions | Opérationnelle |

URLs de démonstration :

```txt
Frontend : https://les-voix-du-destin-frontend.vercel.app
Backend  : https://les-voix-du-destin.onrender.com
Health   : https://les-voix-du-destin.onrender.com/api/health
```

---

## Principe général

```txt
Push sur main
   |
   v
GitHub
   |
   +--> CI GitHub Actions
   |       - lint backend/frontend
   |       - tests unitaires
   |       - build complet
   |
   +--> Vercel
   |       - build frontend
   |       - déploiement de l’interface
   |
   +--> Render
           - build backend
           - génération Prisma
           - migrations Prisma
           - lancement API Express
```

La CD est donc assurée par les intégrations GitHub natives de **Vercel** et **Render**.  
Un workflow GitHub Actions `cd.yml` existe aussi comme mécanisme complémentaire ou cible d’automatisation avancée.

---

## CI GitHub Actions

Le workflow CI se trouve dans :

```txt
.github/workflows/ci.yml
```

Il vérifie :

```txt
1. Installation des dépendances
2. Génération Prisma
3. Lint backend
4. Lint frontend
5. Tests unitaires
6. Build complet
```

Statut : **opérationnel**.

---

## CD Vercel — frontend

### Configuration

| Paramètre | Valeur |
|---|---|
| Root Directory | `frontend` |
| Framework | SvelteKit |
| Build Command | `npm run check && npm run build` |
| Auto-Deploy | activé sur push GitHub |
| URL | `https://les-voix-du-destin-frontend.vercel.app` |

### Variable d’environnement

```env
PUBLIC_API_URL="https://les-voix-du-destin.onrender.com/api"
```

Cette variable est utilisée au build.  
Si elle est modifiée, il faut relancer un déploiement Vercel.

---

## CD Render — backend

### Configuration

| Paramètre | Valeur |
|---|---|
| Runtime | Node |
| Branch | `main` |
| Root Directory | vide |
| Auto-Deploy | On Commit |
| Health Check Path | `/api/health` |
| URL | `https://les-voix-du-destin.onrender.com` |

### Build Command

```bash
npm ci && npm run prisma:generate --workspace backend && npm run prisma:deploy --workspace backend && npm run build --workspace backend
```

### Start Command

```bash
node backend/dist/src/server.js
```

### Variables d’environnement

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

---

## Base de données Neon

Neon fournit la base PostgreSQL de démonstration.

La connexion est injectée dans Render via :

```env
DATABASE_URL="<url_neon>"
```

Les migrations sont appliquées au déploiement via Prisma :

```bash
npm run prisma:deploy --workspace backend
```

---

## Workflow CD GitHub Actions complémentaire

Le dépôt contient aussi :

```txt
.github/workflows/cd.yml
```

Ce workflow documente et prépare une automatisation CD pilotée depuis GitHub Actions.

Secrets GitHub prévus :

```txt
RENDER_DEPLOY_HOOK_URL
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
PUBLIC_API_URL
```

Ce workflow peut être utilisé si l’on souhaite que GitHub Actions pilote directement les déploiements via deploy hook Render et CLI Vercel.

---

## Comportement attendu après push

Après un push sur `main` :

1. GitHub Actions lance la CI.
2. Vercel reconstruit le frontend.
3. Render reconstruit le backend.
4. Prisma applique les migrations sur Neon.
5. L’API redémarre.
6. Le healthcheck `/api/health` vérifie que le backend répond.

---

## Preuves à conserver pour le Bloc 2

Captures recommandées :

- GitHub Actions vert ;
- Vercel : déploiement réussi ;
- Render : service live ;
- Render : logs de build et démarrage API ;
- endpoint `/api/health` ;
- variables Vercel et Render masquées ;
- application en production ;
- parcours connexion / personnage / session JDR.

---

## Formulation recommandée Bloc 2

> La CI GitHub Actions vérifie automatiquement le lint, les tests unitaires et le build complet. Le déploiement continu est activé via les intégrations GitHub de Vercel et Render : le frontend SvelteKit est déployé sur Vercel, le backend Express TypeScript sur Render, et la base PostgreSQL Neon est utilisée en environnement de démonstration. Un workflow `cd.yml` est également présent pour documenter une automatisation CD pilotée directement depuis GitHub Actions.

---

## Limites actuelles

L’environnement reste un MVP de démonstration :

- Render Free peut se mettre en veille ;
- l’audit RGAA complet reste à finaliser ;
- la supervision avancée n’est pas encore industrialisée ;
- le workflow CD GitHub Actions peut encore être enrichi avec secrets et validations supplémentaires ;
- les tests end-to-end ne sont pas encore automatisés.

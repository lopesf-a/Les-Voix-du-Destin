# Déploiement continu — Les Voix du Destin

## Objectif

Ce document décrit la partie **CD** du workflow CI/CD.

Le projet possède déjà une intégration continue opérationnelle avec GitHub Actions : lint, tests unitaires et build complet. La partie déploiement continu a été ajoutée sous forme de workflow cible afin de pouvoir déployer automatiquement le backend et le frontend lorsque les secrets d'hébergement sont configurés.

## Principe général

```txt
Push sur main
   |
   v
CI GitHub Actions
   |-- lint backend/frontend
   |-- tests unitaires
   |-- build complet
   |
   v
CD GitHub Actions
   |-- déploiement backend Render
   |-- déploiement frontend Vercel
```

Le workflow CD se trouve dans :

```txt
.github/workflows/cd.yml
```

## Déclenchement

Le workflow CD peut être déclenché de deux façons :

| Déclencheur | Rôle |
|---|---|
| `workflow_run` | Déclenchement automatique après une CI réussie sur `main` |
| `workflow_dispatch` | Déclenchement manuel depuis l'onglet GitHub Actions |

Le déclenchement manuel permet de choisir l'environnement cible :

```txt
staging
production
```

## Cible de déploiement

Le workflow est prévu pour une séparation claire entre frontend et backend :

| Partie | Cible proposée | Rôle |
|---|---|---|
| Frontend SvelteKit | Vercel | Hébergement de l'interface web |
| Backend Express TypeScript | Render | Hébergement de l'API Node.js |
| Base de données | PostgreSQL managé | Persistance applicative |
| IA | Mistral API | Génération narrative |

Cette séparation respecte l'architecture cadrée au Bloc 1 : frontend, API, base de données et service IA isolés.

## Secrets GitHub nécessaires

Les secrets doivent être configurés dans GitHub :

```txt
Settings > Secrets and variables > Actions > New repository secret
```

### Secrets backend Render

| Secret | Description |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | URL du deploy hook Render du service backend |

### Secrets frontend Vercel

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Token Vercel utilisé par GitHub Actions |
| `VERCEL_ORG_ID` | Identifiant de l'équipe ou du compte Vercel |
| `VERCEL_PROJECT_ID` | Identifiant du projet Vercel |
| `PUBLIC_API_URL` | URL publique du backend déployé |

## Variables d'environnement de production

### Backend

| Variable | Rôle |
|---|---|
| `PORT` | Port du serveur Node.js |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Connexion PostgreSQL de production |
| `JWT_SECRET` | Secret robuste pour signer les tokens JWT |
| `MISTRAL_API_KEY` | Clé API Mistral |
| `MISTRAL_MODEL` | Modèle Mistral utilisé |
| `CORS_ORIGIN` | URL autorisée du frontend |

### Frontend

| Variable | Rôle |
|---|---|
| `PUBLIC_API_URL` | URL publique de l'API backend |

## Commandes exécutées par la CD

### Backend Render

Le backend est déployé via un deploy hook Render :

```bash
curl -X POST "$RENDER_DEPLOY_HOOK_URL"
```

Render se charge ensuite d'exécuter les commandes configurées côté service, par exemple :

```bash
npm ci
npm run prisma:deploy --workspace backend
npm run build --workspace backend
npm run start --workspace backend
```

### Frontend Vercel

Le frontend est construit puis déployé avec la CLI Vercel :

```bash
npm ci
npm run build --workspace frontend
npx vercel pull --yes --environment=production --token "$VERCEL_TOKEN"
npx vercel build --prod --token "$VERCEL_TOKEN"
npx vercel deploy --prebuilt --prod --token "$VERCEL_TOKEN"
```

## Comportement si les secrets sont absents

Le workflow CD est volontairement sécurisé :

- si les secrets Render ne sont pas renseignés, le déploiement backend est ignoré ;
- si les secrets Vercel ne sont pas renseignés, le déploiement frontend est ignoré ;
- la CI reste indépendante et continue de valider le projet.

Cela permet de conserver un dépôt utilisable même lorsque l'environnement d'hébergement n'est pas encore branché.

## Formulation à utiliser dans le dossier Bloc 2

> Une intégration continue GitHub Actions est opérationnelle et vérifie automatiquement le lint, les tests unitaires et le build complet. Une partie déploiement continu a été ajoutée avec un workflow CD cible : après une CI réussie sur `main`, le backend peut être déployé sur Render via deploy hook et le frontend sur Vercel via la CLI Vercel, sous réserve de configurer les secrets GitHub nécessaires.

## Limite actuelle

La CD est prête côté dépôt, mais elle dépend de la configuration externe des hébergeurs :

- création du service backend Render ;
- création du projet frontend Vercel ;
- configuration d'une base PostgreSQL de production ;
- ajout des secrets GitHub ;
- vérification finale de l'URL `/api/health`.

Cette limite est normale pour un MVP Bloc 2 : le protocole est documenté et automatisable, tandis que l'activation réelle dépend de l'environnement cible.

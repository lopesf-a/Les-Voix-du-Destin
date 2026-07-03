# Procédure de déploiement — Les Voix du Destin

## Objectif

Cette procédure décrit les étapes nécessaires pour installer, configurer, tester et déployer le MVP.

## Installation locale

```bash
npm run setup
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

## Vérification locale

Frontend :

```txt
http://localhost:5173
```

Backend :

```txt
http://localhost:3001/api/health
```

## Build de production

```bash
npm run lint
npm run test
npm run build
```

Le build est considéré comme valide si les trois commandes se terminent sans erreur.

## Variables d’environnement de production

| Variable | Exemple |
|---|---|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | URL PostgreSQL de production |
| `JWT_SECRET` | Secret fort et unique |
| `MISTRAL_API_KEY` | Clé API Mistral |
| `MISTRAL_MODEL` | `mistral-small-latest` |
| `CORS_ORIGIN` | URL du frontend déployé |
| `PUBLIC_API_URL` | URL publique de l’API |

## Étapes de déploiement cible

1. Préparer les variables d’environnement.
2. Installer les dépendances avec `npm ci`.
3. Générer Prisma avec `npm run prisma:generate --workspace backend`.
4. Appliquer les migrations avec `npm run prisma:deploy --workspace backend`.
5. Construire le projet avec `npm run build`.
6. Lancer le backend avec `npm run start --workspace backend`.
7. Déployer le frontend sur l’hébergeur choisi.
8. Vérifier `/api/health`.
9. Tester une connexion et une session JDR.

## Rollback

En cas de problème :

1. revenir à la dernière version stable ;
2. restaurer les variables d’environnement précédentes ;
3. vérifier la base de données ;
4. relancer les tests de recette prioritaires.

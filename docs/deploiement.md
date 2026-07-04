# Procédure de déploiement — Les Voix du Destin

## Objectif

Cette procédure décrit les étapes nécessaires pour installer, configurer, tester et déployer le MVP **Les Voix du Destin**.

Le projet est actuellement déployé sur un environnement de démonstration :

| Élément | Plateforme | URL / rôle |
|---|---|---|
| Frontend | Vercel | `https://les-voix-du-destin-frontend.vercel.app` |
| Backend | Render | `https://les-voix-du-destin.onrender.com` |
| Healthcheck | Render | `https://les-voix-du-destin.onrender.com/api/health` |
| Base de données | Neon | PostgreSQL managé |
| IA | Mistral API | Génération narrative |

---

## Installation locale

```bash
npm run setup
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Vérification locale :

```txt
Frontend : http://localhost:5173
Backend  : http://localhost:3001/api/health
```

---

## Build de production

Avant toute livraison :

```bash
npm run lint
npm run test
npm run build
```

Le build est considéré comme valide si les trois commandes se terminent sans erreur.

---

## Déploiement backend Render

### Configuration générale

| Paramètre | Valeur |
|---|---|
| Runtime | Node |
| Branch | `main` |
| Root Directory | vide |
| Region | Frankfurt ou région disponible |
| Instance | Free pour démonstration |
| Health Check Path | `/api/health` |
| Auto-Deploy | On Commit |

### Build Command

```bash
npm ci && npm run prisma:generate --workspace backend && npm run prisma:deploy --workspace backend && npm run build --workspace backend
```

### Start Command

```bash
node backend/dist/src/server.js
```

Remarque : le fichier compilé du serveur est généré dans `backend/dist/src/server.js`.

### Variables d’environnement Render

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

### Vérification backend

```txt
https://les-voix-du-destin.onrender.com/api/health
```

Résultat attendu :

```json
{
  "status": "ok",
  "service": "les-voix-du-destin-backend"
}
```

---

## Déploiement frontend Vercel

### Configuration générale

| Paramètre | Valeur |
|---|---|
| Framework | SvelteKit |
| Root Directory | `frontend` |
| Build Command | `npm run check && npm run build` |
| Output Directory | défaut Vercel |
| Auto-Deploy | activé sur push GitHub |

### Variable d’environnement Vercel

```env
PUBLIC_API_URL="https://les-voix-du-destin.onrender.com/api"
```

Important : cette variable est utilisée au moment du build.  
Après toute modification de `PUBLIC_API_URL`, il faut relancer un déploiement Vercel.

---

## Déploiement base de données Neon

Le backend Render utilise Neon via la variable :

```env
DATABASE_URL="<url_neon>"
```

Les migrations Prisma sont appliquées pendant le déploiement Render :

```bash
npm run prisma:deploy --workspace backend
```

En production, les données de démonstration ne sont pas toujours présentes automatiquement.  
Si le compte `player@example.com` n’existe pas, il faut :

1. créer un compte via l’interface ;
2. ou exécuter le seed une seule fois sur la base de démonstration.

---

## Dépannage — `NetworkError when attempting to fetch resource`

Cette erreur apparaît généralement lorsque le frontend Vercel n’arrive pas à contacter le backend Render.

### Contrôle 1 — Variable Vercel

Vérifier dans Vercel :

```env
PUBLIC_API_URL="https://les-voix-du-destin.onrender.com/api"
```

Points importants :

- le nom doit être exactement `PUBLIC_API_URL` ;
- ne pas écrire `PUBLIC_API_UR` ;
- ne pas ajouter de guillemets ;
- redéployer Vercel après modification.

### Contrôle 2 — CORS Render

Vérifier dans Render :

```env
CORS_ORIGIN="https://les-voix-du-destin-frontend.vercel.app"
```

Points importants :

- utiliser l’URL Vercel exacte ;
- ne pas mettre de `/` à la fin ;
- redéployer Render après modification.

### Contrôle 3 — Backend réveillé

L’instance gratuite Render peut se mettre en veille.  
Avant de tester une connexion, ouvrir :

```txt
https://les-voix-du-destin.onrender.com/api/health
```

Puis réessayer la connexion depuis Vercel.

### Contrôle 4 — Base de données

Si le réseau fonctionne mais que la connexion échoue :

- le compte de démonstration peut être absent de Neon ;
- utiliser **Créer un compte** ;
- ou exécuter le seed sur la base de démonstration.

### Contrôle 5 — DevTools navigateur

Dans l’onglet Réseau du navigateur, vérifier l’appel :

```txt
POST https://les-voix-du-destin.onrender.com/api/auth/login
```

Cas possibles :

| Symptôme | Cause probable | Correction |
|---|---|---|
| Requête bloquée CORS | `CORS_ORIGIN` incorrect | Mettre l’URL Vercel exacte dans Render |
| Requête vers `localhost` | `PUBLIC_API_URL` incorrect | Corriger Vercel puis redéployer |
| 401 / 400 | Compte absent ou mauvais identifiants | Créer un compte / vérifier seed |
| Timeout long | Render en veille | Ouvrir `/api/health` puis réessayer |

---

## Étapes de validation après déploiement

1. Ouvrir le site Vercel.
2. Vérifier `/api/health` côté Render.
3. Créer un compte ou se connecter.
4. Ouvrir le dashboard.
5. Créer un personnage.
6. Lancer une session JDR.
7. Envoyer une action au MJ IA.
8. Vérifier le jet de dé et l’historique.
9. Prendre les captures pour le dossier Bloc 2.

---

## Rollback

En cas de problème :

1. revenir au dernier commit stable ;
2. restaurer les variables d’environnement précédentes ;
3. vérifier Neon ;
4. redéployer Render ;
5. redéployer Vercel ;
6. relancer les tests de recette prioritaires.

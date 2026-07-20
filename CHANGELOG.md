# Changelog — Les Voix du Destin

## v1.0.1 — Correctifs production et maintien opérationnel

- Correction de la configuration CORS entre le frontend Vercel et le backend Render.
- Correction de la variable `CORS_ORIGIN` côté Render afin d'autoriser précisément le domaine Vercel de production.
- Renforcement du middleware CORS backend pour éviter les erreurs serveur 500 lors d'une origine non reconnue.
- Correction de la variable frontend `PUBLIC_API_URL` pour pointer vers l'API Render en production.
- Correction de la commande de démarrage Render avec `node backend/dist/src/server.js`.
- Validation du healthcheck `/api/health` avec un statut `ok`.
- Vérification du parcours utilisateur après redéploiement : connexion, dashboard et session JDR.
- Ajout de preuves de maintien opérationnel : logs Render, métriques réseau, déploiement Vercel, GitHub Actions, dashboard, `npm audit` et `npm outdated`.

## v1.0.0 — MVP déployé pour le Bloc 2

- Mise en ligne du frontend SvelteKit sur Vercel.
- Mise en ligne du backend Express TypeScript sur Render.
- Utilisation de PostgreSQL Neon comme base managée de démonstration.
- Validation du parcours MVP : authentification, personnages, sessions, MJ IA, dashboard et historique.
- Validation de la CI GitHub Actions : lint, tests unitaires et build.
- Documentation du livrable Bloc 2 : architecture, sécurité, accessibilité, recette, anomalies et manuels.

## v0.7.0 — Déploiement continu cible
- Ajout du workflow `.github/workflows/cd.yml`.
- Préparation du déploiement backend via Render deploy hook.
- Préparation du déploiement frontend via Vercel CLI.
- Ajout de la documentation `docs/deploiement-continu.md`.
- Ajout des fichiers `.env.production.example` frontend et backend.


## v0.6.0 — Préparation Bloc 2

- Renommage du projet en **Les Voix du Destin**.
- Correction du conflit Git dans le README.
- Correction du typage TypeScript du moteur de règles.
- Déplacement de la CI dans `.github/workflows/ci.yml`.
- Ajout de tests unitaires sur le moteur de règles.
- Nettoyage des fichiers `.env.example` pour supprimer les secrets réels.
- Ajout du cahier de recette.
- Ajout du suivi des anomalies.
- Ajout de la documentation sécurité et accessibilité.
- Ajout du workflow Git cible.
- Ajout des manuels de déploiement, utilisation et mise à jour.

## v0.5.0 — Moteur de règles

- Ajout du jet de dé `1d20`.
- Ajout du calcul réussite / échec côté backend.
- Ajout des dégâts, soins, XP et PV.
- Ajout d’un jet forcé pour les tests locaux.

## v0.4.0 — IA et streaming

- Intégration du service IA Mistral.
- Ajout du streaming SSE.
- Ajout d’un mode mock si aucune clé API n’est configurée.
- Journalisation de l’usage IA.

## v0.3.0 — Sessions JDR

- Création des sessions de jeu.
- Sauvegarde de l’historique des messages.
- Ajout des scénarios de démonstration.

## v0.2.0 — Authentification et personnages

- Ajout de l’inscription.
- Ajout de la connexion JWT.
- Ajout des routes protégées.
- Ajout de la création de personnages.

## v0.1.0 — Initialisation

- Création de l’architecture SvelteKit + Express TypeScript.
- Ajout de PostgreSQL avec Docker Compose.
- Ajout du schéma Prisma.

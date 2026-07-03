# Cahier de recette — Les Voix du Destin

Ce cahier de recette décrit les scénarios fonctionnels permettant de valider le prototype MVP.

## Environnement de recette

| Élément | Valeur |
|---|---|
| Frontend | SvelteKit |
| Backend | Express TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| IA | Mistral API ou mode mock |
| URL frontend locale | `http://localhost:5173` |
| URL backend locale | `http://localhost:3001` |

## Prérequis

Avant la recette :

```bash
npm run setup
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

Compte de démonstration :

```txt
player@example.com / password123
```

## Scénarios de recette

| ID | Fonctionnalité | Scénario | Résultat attendu | Statut |
|---|---|---|---|---|
| R01 | Connexion | Se connecter avec le compte de démonstration | L’utilisateur accède au dashboard | À valider |
| R02 | Inscription | Créer un nouveau compte joueur | Le compte est créé et l’utilisateur est connecté | À valider |
| R03 | Dashboard | Ouvrir le dashboard | Les métriques MVP sont affichées | À valider |
| R04 | Création personnage | Créer un personnage avec nom, classe et statistiques | Le personnage apparaît dans la liste | À valider |
| R05 | Consultation personnages | Ouvrir la page personnages | Les personnages existants sont listés | À valider |
| R06 | Scénarios | Ouvrir la page règles/scénarios | Les règles et scénarios de démo sont affichés | À valider |
| R07 | Création session | Créer une session avec un personnage | La session est créée avec un message MJ initial | À valider |
| R08 | Historique session | Ouvrir une session existante | Les messages précédents sont affichés | À valider |
| R09 | Action joueur | Envoyer une action simple | Le message joueur est sauvegardé | À valider |
| R10 | Réponse IA | Envoyer une action au MJ IA | Une narration est générée | À valider |
| R11 | Streaming IA | Utiliser `/api/ai/turn/stream` | Le texte arrive progressivement | À valider |
| R12 | Jet forcé faible | Envoyer une action avec `forcedRoll = 5` | Le résultat du jet indique un échec | À valider |
| R13 | Jet forcé haut | Envoyer une action avec `forcedRoll = 20` | Le résultat indique une réussite critique | À valider |
| R14 | Gestion PV | Échouer une attaque ou une défense | Les PV sont mis à jour côté backend | À valider |
| R15 | Mode mock IA | Lancer sans clé Mistral | Le mode mock permet de tester le parcours | À valider |
| R16 | Route protégée | Appeler une route sans token | L’API renvoie une erreur d’authentification | À valider |
| R17 | Healthcheck | Appeler `/api/health` | L’API renvoie `status: ok` | À valider |
| R18 | Erreur formulaire | Envoyer un formulaire incomplet | Un message d’erreur lisible apparaît | À valider |

## Recette technique

| ID | Contrôle | Commande | Résultat attendu | Statut |
|---|---|---|---|---|
| T01 | Lint complet | `npm run lint` | Aucune erreur TypeScript/Svelte | Validé |
| T02 | Tests unitaires | `npm run test` | Tous les tests passent | Validé |
| T03 | Build complet | `npm run build` | Build backend et frontend OK | Validé |
| T04 | Base PostgreSQL | `npm run db:up` | Le conteneur PostgreSQL démarre | À valider |
| T05 | Migration Prisma | `npm run db:migrate` | Le schéma est appliqué | À valider |
| T06 | Seed | `npm run db:seed` | Les comptes et scénarios démo sont créés | À valider |

## Critères d’acceptation

Le prototype peut être considéré comme livrable si :

- le joueur peut se connecter ;
- un personnage peut être créé ;
- une session de jeu peut être lancée ;
- une action joueur génère une réponse MJ ;
- le moteur de règles calcule les dés et les PV ;
- l’historique est conservé ;
- les commandes `lint`, `test` et `build` passent ;
- aucun secret réel n’est présent dans le dépôt.

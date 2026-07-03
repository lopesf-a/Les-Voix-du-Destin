# Architecture — Les Voix du Destin

```txt
SvelteKit Frontend
  ├─ authentification
  ├─ personnages
  ├─ sessions JDR
  └─ table de jeu avec streaming

Express TypeScript API
  ├─ routes REST
  ├─ moteur de règles : 1d20, difficulté, PV, XP
  ├─ service IA Mistral isolé
  └─ logs d'usage IA

PostgreSQL
  ├─ users
  ├─ characters
  ├─ game_sessions
  ├─ game_messages
  └─ ai_usage_logs
```

## Flux d'un tour de jeu

```txt
Joueur envoie une action
↓
Express sauvegarde le message joueur
↓
Moteur de règles backend
  - classe l'action
  - choisit la stat
  - lance 1d20
  - calcule réussite/échec
  - applique dégâts/soins/XP
  - met à jour les PV en base
↓
Express envoie à Mistral le résultat de règles verrouillé
↓
Mistral raconte uniquement la scène
↓
Express stream le texte au front via SSE
↓
Le message final est sauvegardé dans PostgreSQL
```

## Pourquoi séparer règles et IA ?

L'IA sert à la narration, pas à l'autorité de jeu. Les PV, les dés et les conséquences chiffrées sont calculés côté backend pour éviter qu'un modèle invente une valeur incohérente.

## Endpoint streaming

```txt
POST /api/ai/turn/stream
Content-Type: application/json
Accept: text/event-stream
```

Événements envoyés :

```txt
meta   → résultat du dé, PV mis à jour, message joueur sauvegardé
delta  → morceau de texte généré par le MJ IA
done   → message MJ final sauvegardé + usage IA
error  → erreur isolée pendant le flux
```

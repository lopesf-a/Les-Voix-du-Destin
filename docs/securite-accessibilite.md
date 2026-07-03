# Sécurité et accessibilité — Les Voix du Destin

Ce document présente les mesures de sécurité et d’accessibilité prises en compte dans le MVP.

## Sécurité

| Risque | Mesure appliquée |
|---|---|
| Injection SQL | Utilisation de Prisma ORM et requêtes paramétrées |
| Données invalides | Validation avec Zod sur les entrées API |
| Mot de passe compromis | Hash des mots de passe avec bcrypt |
| Secret exposé | Secrets stockés dans `.env`, non versionnés |
| Fichier exemple dangereux | `.env.example` nettoyé avec valeurs neutres |
| Accès non autorisé | Middleware JWT sur les routes protégées |
| CORS trop permissif | Origine autorisée configurée via `CORS_ORIGIN` |
| Headers HTTP faibles | Utilisation de Helmet |
| Payload trop volumineux | Limite JSON à `1mb` |
| Erreur serveur trop détaillée | Middleware d’erreur centralisé |
| Dépendance IA externe | Service IA isolé + mode mock |
| Dérive du modèle IA | Le backend calcule les règles, l’IA ne décide pas les PV |

## Gestion des secrets

Les fichiers suivants ne doivent pas être présents dans le ZIP final :

```txt
backend/.env
frontend/.env
```

Seuls ces fichiers modèles doivent être versionnés :

```txt
backend/.env.example
frontend/.env.example
```

Les vraies clés API doivent être stockées uniquement dans l’environnement local ou dans les variables sécurisées de l’hébergeur.

## Variables sensibles

| Variable | Rôle | Sensible |
|---|---|---|
| `DATABASE_URL` | Connexion PostgreSQL | Oui |
| `JWT_SECRET` | Signature des tokens JWT | Oui |
| `MISTRAL_API_KEY` | Accès API Mistral | Oui |
| `CORS_ORIGIN` | Origine front autorisée | Non sensible mais à contrôler |

## Accessibilité

| Point contrôlé | Mesure actuelle | Amélioration prévue |
|---|---|---|
| Langue de page | `lang="fr"` dans `app.html` | Conserver sur toutes les pages |
| Structure | Pages découpées avec titres et sections | Vérifier l’ordre des titres |
| Formulaires | Labels visibles sur les champs principaux | Ajouter `aria-describedby` pour certaines erreurs |
| Messages d’erreur | Erreurs affichées côté utilisateur | Relier les erreurs aux champs concernés |
| Navigation | Menu principal présent sur toutes les pages | Améliorer le focus clavier |
| Contraste | Interface sombre avec texte clair | Vérifier les contrastes avec un outil dédié |
| Boutons | Libellés explicites | Ajouter états de focus plus visibles |
| Responsive | Interface fluide | Tester sur mobile et tablette |

## Référentiels utilisés

- OWASP Top 10 pour les risques web principaux ;
- RGAA pour les principes d’accessibilité web ;
- OPQUAST pour les bonnes pratiques qualité web.

## Limites actuelles

Le MVP n’est pas encore un produit final. Les points suivants restent à renforcer :

- audit RGAA complet ;
- tests clavier systématiques ;
- vérification automatisée d’accessibilité ;
- politique de rétention des logs ;
- rate limiting sur certaines routes ;
- gestion avancée des rôles administrateurs.

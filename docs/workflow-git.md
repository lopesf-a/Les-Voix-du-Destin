# Workflow Git — Les Voix du Destin

## Contexte

Pendant la première phase du MVP, le développement a été réalisé principalement sur une branche principale afin de produire rapidement une preuve de concept fonctionnelle.

Cette organisation est adaptée à un prototype individuel court, mais elle limite la traçabilité fine des évolutions, la relecture de code et la sécurisation des livraisons.

## Limite identifiée

La première itération ne comportait pas de branches `feature/*`. Cette limite a été identifiée après la phase de prototype.

Les risques associés sont les suivants :

- difficulté à isoler une fonctionnalité en cours ;
- historique Git moins lisible ;
- risque de casser la branche principale ;
- absence de revue systématique avant fusion ;
- moins bonne exploitation de l’intégration continue.

## Workflow cible

Le workflow cible pour les prochaines itérations est le suivant :

```txt
main           Version stable et livrable
develop        Branche d’intégration
feature/*      Nouvelles fonctionnalités
fix/*          Corrections de bugs
release/*      Préparation d’une version de démonstration
```

## Exemples de branches prévues

```txt
feature/tests-unitaires
feature/ci-github-actions
feature/accessibilite-formulaires
feature/dashboard-admin
fix/erreur-streaming-ia
fix/secrets-env-example
release/v1-demo-bloc2
```

## Règles de fusion

Avant fusion dans `develop` ou `main`, les contrôles suivants doivent passer :

```bash
npm run lint
npm run test
npm run build
```

La fusion dans `main` doit correspondre à une version stable ou démontrable.

## Intégration continue

La CI GitHub Actions est placée dans :

```txt
.github/workflows/ci.yml
```

Elle vérifie automatiquement :

- installation des dépendances ;
- génération Prisma ;
- vérification TypeScript backend ;
- vérification Svelte frontend ;
- tests unitaires ;
- build complet.

## Justification RNCP

Cette organisation permet de démontrer une démarche professionnelle de versioning, de qualité logicielle et d’intégration continue, même si le MVP initial a été développé rapidement sur une branche principale.

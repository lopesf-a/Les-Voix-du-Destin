# Manuel de mise à jour — Les Voix du Destin

## Objectif

Ce document décrit la méthode à suivre pour faire évoluer le projet sans casser la version stable.

## Étapes recommandées

1. Créer une branche dédiée.
2. Développer la fonctionnalité ou la correction.
3. Lancer les contrôles qualité.
4. Mettre à jour la documentation si nécessaire.
5. Fusionner dans `develop`.
6. Préparer une version stable dans `main`.

## Exemple de branche

```bash
git checkout -b feature/nouvelle-fonctionnalite
```

## Contrôles obligatoires

```bash
npm run lint
npm run test
npm run build
```

## Mise à jour de la base

En cas de modification du schéma Prisma :

```bash
npm run db:migrate
```

En production :

```bash
npm run prisma:deploy --workspace backend
```

## Mise à jour du changelog

Chaque évolution notable doit être ajoutée dans `CHANGELOG.md` avec :

- la version ;
- la date si disponible ;
- les fonctionnalités ajoutées ;
- les corrections ;
- les limites connues.

## Vérification après mise à jour

Après une mise à jour, vérifier au minimum :

- connexion utilisateur ;
- création personnage ;
- création session ;
- action joueur ;
- réponse IA ou mode mock ;
- historique ;
- dashboard ;
- `/api/health`.

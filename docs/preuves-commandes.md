# Preuves de validation technique — Les Voix du Destin

Date de vérification : 03 juillet 2026.

## Commandes exécutées

Les commandes suivantes ont été exécutées après correction du projet.

```bash
npm run lint
npm run test
npm run build
```

## Résultats

| Commande | Résultat | Commentaire |
|---|---|---|
| `npm run lint` | Validé | Backend TypeScript OK, frontend Svelte OK, 0 erreur, 0 avertissement |
| `npm run test` | Validé | 5 tests unitaires backend passés |
| `npm run build` | Validé | Build backend et frontend terminé correctement |

## Tests unitaires ajoutés

Fichier :

```txt
backend/src/services/rules-engine.service.test.ts
```

Cas couverts :

- jet forcé à 5 : échec sur attaque standard ;
- jet forcé à 20 : réussite critique ;
- jet forcé à 1 : échec critique ;
- soin réussi : les PV ne dépassent pas les PV maximum ;
- action non reconnue : traitement en action générique.

## Point d’attention

Le ZIP final ne contient pas les dossiers générés ou sensibles :

```txt
node_modules/
.git/
backend/.env
frontend/.env
frontend/.svelte-kit/
backend/dist/
```

Après extraction, il faut relancer :

```bash
npm install
```

puis les commandes de validation si besoin.

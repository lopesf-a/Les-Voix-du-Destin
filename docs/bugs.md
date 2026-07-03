# Suivi des anomalies — Les Voix du Destin

Ce document sert à tracer les anomalies rencontrées pendant la réalisation du MVP et les corrections appliquées.

| ID | Anomalie | Gravité | Cause probable | Correction appliquée ou prévue | Statut |
|---|---|---|---|---|---|
| B01 | Conflit Git visible dans le README | Moyenne | Fusion Git non finalisée | Réécriture complète du README | Corrigé |
| B02 | Nom du projet encore lié à `jdr-ia-mistral` | Faible | Renommage incomplet | Renommage dans les `package.json`, l’interface et la documentation | Corrigé |
| B03 | CI placée dans `.github/workflow` | Forte | Mauvais nom de dossier | Déplacement vers `.github/workflows/ci.yml` | Corrigé |
| B04 | Erreur TypeScript sur `critical` | Forte | Inférence trop large en `string \| null` | Typage explicite avec `RuleCheckResult['critical']` | Corrigé |
| B05 | Secrets présents dans `.env.example` | Critique | Copie de valeurs réelles dans un fichier modèle | Remplacement par des valeurs neutres | Corrigé |
| B06 | Absence de tests unitaires | Forte | Prototype développé avant la phase qualité | Ajout de tests sur le moteur de règles | Corrigé |
| B07 | Absence de cahier de recette | Forte | Documentation Bloc 2 non finalisée | Ajout d’un cahier de recette fonctionnelle | Corrigé |
| B08 | Historique Git peu détaillé | Moyenne | Développement initial sur branche principale | Documentation d’un workflow cible `main/develop/feature/*` | Corrigé |
| B09 | Dépendance à Mistral | Moyenne | API externe nécessaire à la narration | Mode mock prévu en absence de clé API | Corrigé |
| B10 | Accessibilité non auditée intégralement | Moyenne | MVP centré sur la preuve technique | Plan d’audit RGAA manuel ajouté | À améliorer |

## Priorisation des corrections

Les anomalies critiques ou fortes sont traitées en priorité lorsqu’elles touchent :

- la sécurité ;
- la compilation ;
- les tests ;
- la capacité à démontrer le prototype ;
- la conformité Bloc 2.

## Méthode de suivi

Pour chaque bug :

1. identifier le symptôme ;
2. qualifier la gravité ;
3. isoler la cause probable ;
4. appliquer une correction ;
5. vérifier avec `npm run lint`, `npm run test` et `npm run build` ;
6. documenter la correction.

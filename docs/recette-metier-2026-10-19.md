# Recette métier du 19 octobre 2026

Le scénario `scripts/test-crm-business-journey.mjs` exerce un même dossier depuis
le formulaire public jusqu’au règlement de sa facture, dans une base SQLite
temporaire créée pour chaque exécution. Il rejoint les contrôles de livraison.

## Parcours vérifié

- Création via `POST /api/quotes` sans authentification et lecture privée refusée.
- Reprise du dossier dans le CRM, programmation puis réalisation d’une visite.
- Préremplissage du devis avec les coordonnées et les accès relevés en visite.
- Envoi du devis avec transport injecté simulé et pièce jointe PDF.
- Confirmation du dossier et enregistrement explicite d’un accord versionné.
- Modification ultérieure du prix de travail, sans nouvel accord client.
- Réservation d’un véhicule puis clôture explicite du déménagement.
- Préparation idempotente d’une facture issue du devis accepté.
- Aperçu PDF sans consommation du compteur et émission bloquée avant activation.
- Activation uniquement dans cette base temporaire, émission et règlement simulés.
- Contrôle du dossier final, du solde nul et de la conservation du PDF émis.

## Écart corrigé

Avant correction, après acceptation d’une version 2 à 1 481,48 € TTC puis
modification du devis de travail en version 3 à 3 000 € TTC, la préparation de
facture prenait la version 3. Le nouveau scénario a reproduit cet échec.

La création consulte désormais l’instantané de la version acceptée, dans la même
transaction que la lecture du devis et l’écriture de la préparation. Les deux
stockages, SQLite et Firestore, utilisent cette règle commune. Une référence
d’accord sans instantané cohérent bloque la création au lieu d’utiliser le prix
de travail. Le scénario vérifie aussi ces refus.

Les dossiers historiques sans accord versionné conservent leur fonctionnement.
Une préparation déjà existante reste figée ; cette correction ne réécrit aucun
brouillon ni aucune facture antérieure. Aucun rattrapage de données n’est lancé.

## Portée

Les notifications et accusés de réception sont désactivés pour cette recette.
Le transport du devis est simulé et aucune facture n’est envoyée. Les montants
sont vérifiés en euros côté devis, puis en centimes côté facturation.

Cette recette ne constitue ni un essai Firestore cloud du nouveau parcours,
ni une validation visuelle, ni une certification réglementaire. Les protections
et la facturation de production ne sont pas modifiées. La bascule depuis PARC
et l’activation de la facturation réelle restent une étape distincte.

## Résultat local

`npm run validate:release` : typage, compilation et 52 suites réussis.
Le scénario final a également été relancé seul après ajustement de sa chronologie.

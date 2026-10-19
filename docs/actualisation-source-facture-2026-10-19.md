# Brouillons périmés : blocage et actualisation explicite

Cette évolution complète la préparation des factures du 19 octobre 2026. Le
simple avertissement d’une source périmée est désormais accompagné d’un contrôle
serveur et d’une action de correction.

## Règles

Un brouillon doit correspondre à la version acceptée actuellement enregistrée.
Lorsqu’aucun accord versionné n’existe, la référence reste le devis de travail,
pour les dossiers historiques. Modifier une nouvelle proposition sans changer
l’accord enregistré ne périme pas la préparation issue de cet accord.

La référence est contrôlée avant de générer un aperçu et dans la transaction qui
émet le document. Un changement pendant la génération du PDF ne doit donc pas
permettre de consommer un numéro ou d’archiver un document périmé. Les avoirs
restent disponibles pour corriger un document existant.

Le gérant et le secrétariat peuvent actualiser explicitement la source d’un
brouillon. La confirmation présente les versions et les montants TTC avant et
après. Les prestations et coordonnées sont reprises ; les notes et l’échéance
déjà enregistrées sont conservées. Une saisie non enregistrée doit d’abord être
enregistrée ou annulée.

Cette opération est refusée si un document comptable lié existe, même s’il a
ensuite été crédité. Elle ne remplace aucun document émis. Un tel dossier doit
faire l’objet d’une vérification comptable distincte, sans recalcul automatique
de ses factures ou acomptes.

L’historique conserve les anciens numéros de version, références et montants,
ainsi que la date et l’auteur du remplacement. Il ne constitue pas un archivage
intégral des anciens brouillons. Il est limité à 50 remplacements ; au-delà,
l’opération est refusée sans supprimer d’élément historique.

## Contrôles

Typage, compilation et 53 suites de livraison réussis localement.

`scripts/test-crm-invoice-source-refresh.mjs` couvre notamment :

- Accord inchangé malgré une proposition de travail différente.
- Aperçu et transaction d’émission refusés sur une source périmée.
- Absence de mutation du compteur en cas de refus ou d’actualisation.
- Droits, confirmation explicite, versions attendues et concurrence de deux clics.
- Conservation des notes, de l’échéance et de l’historique.
- Compatibilité des anciens dossiers sans accord versionné.
- Refus du remplacement après émission et conservation du document original.
- Possibilité d’émettre un avoir malgré le changement de référence.

La recette visuelle Chrome vérifie aussi l’annulation et la confirmation de la
mise à jour, les saisies non enregistrées, les montants, l’historique, l’absence
de débordement à 390 px et le thème sombre.

Les essais utilisent exclusivement SQLite temporaire et des données isolées.
Aucun e-mail n’est envoyé. Le contrôle Firestore est implémenté dans ses
transactions mais n’a pas été exécuté sur une base cloud dans cette recette.
La facturation de production reste désactivée.

# Facturation TEST — 1er octobre 2026

Le gérant dispose d'un espace d'essai dans Factures. Il sélectionne un brouillon sauvegardé puis génère une facture complète ou un acompte suivi de son solde. Les PDF portent la marque WE MOVE et une mention TEST sur chaque page. Aucun e-mail n'est envoyé et aucun encaissement réel n'est enregistré.

## Intégrité

- Numéros distincts par session (`TEST-S1-00001`), alloués en transaction avec contrôle de version. La série officielle n'est pas utilisée.
- Copie figée du brouillon et de ses informations société/client. Le solde reprend les montants du projet figés lors de l'acompte.
- Calculs monétaires en centimes : acompte + solde = total du projet, TVA comprise.
- Un seul document de chaque type par dossier et session. Une facture complète exclut le parcours acompte/solde.
- Règlements simulés partiels ou complets, sans dépassement du montant restant. Annulation motivée conservant la trace originale.
- Réinitialiser ouvre une nouvelle session ; les documents et règlements précédents deviennent consultables en lecture seule.
- PDF indépendant des règlements : enregistrer un règlement ne modifie pas le document.
- Accès API et PDF réservé au gérant authentifié. Réponses PDF privées sans cache.

## Persistance

Firestore : sous-collection `documents` de `crm_invoice_test_settings/test`. Les événements de création et de réinitialisation restent dans `events`. SQLite propose le même contrat pour les tests isolés.

## Vérifications

`npm run lint`, `npm run test:crm:factures` et `npm run test:crm:facturation-test` passent. Le parcours est également validé dans des collections Firestore temporaires, supprimées récursivement après le test. La concurrence, les doublons, les arrondis, les révisions, les archives et les accès anonymes sont couverts.

Chrome : acompte, règlement, téléchargement PDF, annulation, solde, réinitialisation et lecture des archives ; aucun débordement à 390 px et aucune erreur JavaScript. PDF facture, acompte, solde et document long de six pages rendus puis inspectés.

## Limites explicites

Ce module ne constitue pas l'émission comptable définitive : pas d'avoir officiel, de rapprochement bancaire, d'export comptable ni d'envoi de facture client. La reprise de numérotation PARC et la date de bascule restent à confirmer avant activation de la facturation réelle. L'interface affiche les 200 simulations les plus récentes ; une session accepte jusqu'à 500 numéros.

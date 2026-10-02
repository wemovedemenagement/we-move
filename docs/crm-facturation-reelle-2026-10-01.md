# Préparation de la facturation réelle — 1er octobre 2026

## État de livraison

Le parcours est implémenté, mais son activation en production reste volontairement désactivée (`CRM_BILLING_LIVE_ENABLED=false`). Aucun numéro réel ni document client n'a été créé pendant les vérifications. Les essais ont utilisé SQLite temporaire et des collections Firestore `integration_*`, supprimées ensuite. L'espace TEST existant reste indépendant.

## Parcours utilisateur

Dans Factures : Documents, Émettre et Paramètres. Les informations société connues des devis sont préremplies et restent à vérifier. Le gérant complète la forme juridique, le RCS avec sa ville, les conditions, les coordonnées bancaires éventuelles, le dernier numéro PARC et la date de bascule. Le secrétariat consulte les paramètres et utilise les opérations de facturation, sans pouvoir modifier la configuration ou activer la reprise.

Un brouillon enregistré peut produire un aperçu sans numéro. Après activation, l'utilisateur confirme l'émission définitive. Le compteur reprend le suffixe numérique du dernier numéro PARC, en conservant préfixe et largeur. Factures et avoirs partagent cette séquence continue, sans remise à zéro annuelle automatique. Les formats PARC comportant des séparateurs au milieu du compteur nécessitent une adaptation avant activation ; ne pas réinterpréter le numéro arbitrairement.

Facture complète OU acompte puis solde. L'acompte et le solde se complètent au centime, TVA comprise. Les avoirs partiels/totaux sont liés à la facture originale, conservent celle-ci et diminuent son montant dû. Un acompte lié à un solde doit être corrigé après correction complète de ce solde. Les remboursements sont suivis séparément, sans exécution bancaire. Les annulations de mouvements restent tracées avec motif.

## Intégrité et sécurité

- Firestore STANDARD, base `(default)` existante à Paris. Collection `crm_billing/main`, sous-collections `documents` et `events`.
- Toute mutation utilise une révision globale transactionnelle ; l'émission contrôle aussi la révision du brouillon source. Les doubles clics/concurrences ne créent pas de numéros supplémentaires.
- Le PDF est généré avant allocation et sauvegardé avec la copie des données, son SHA-256 et le numéro dans la même transaction. Si la génération échoue, aucun numéro n'est consommé. Les téléchargements et e-mails réutilisent les octets archivés.
- Aucun endpoint de suppression/modification des montants ou du PDF émis. Paramètres de reprise figés après activation. Les mutations restent des opérations serveur ; les règles Firestore existantes interdisent tous les accès directs clients.
- Accès authentifié gérant/secrétaire, paramètres et rapprochements e-mail réservés au gérant ; PDF privés sans cache. Le mode local de test conserve ses restrictions existantes.
- Règlements/remboursements bornés par le dû ou le trop-perçu. Calculs en centimes. Les documents PDF ne changent pas avec les règlements.
- Envoi Resend après confirmation : destinataire figé du document, PDF archivé, objet/message échappés dans le HTML, clé d'idempotence par tentative. Une tentative en cours/incertaine bloque les renvois. Le gérant peut rapprocher son résultat avec une référence vérifiée chez Resend ; aucune reprise aveugle automatique. « Accepté par Resend » ne signifie pas « livré ».
- Liste principale paginée par 20 : recherche serveur sur tous les documents réels du périmètre, par client, numéro ou référence de devis, insensible aux accents. Filtres par statut et remboursements dus ; tri récent, ancien, client ou échéance. Le détail complet est chargé seulement à l’ouverture. L’ancien endpoint de liste par curseur reste disponible pour compatibilité.

## Validation

Lint TypeScript, compilation Vite/prérendu, tests de facturation réelle isolée, facturation TEST et brouillons existants. Tests Firestore isolés avec nettoyage récursif : reprise, rôles, gate d'activation, concurrence, arrondis, crédits cumulés, remboursements, stabilité PDF, double envoi, résultat incertain et rapprochement. E-mails toujours interceptés par un transport simulé.

Chrome : paramètres, téléchargement d'aperçu, verrou d'émission, activation uniquement dans la base locale isolée, facture, mouvement, avoir ; contrôle à 390 px et thème sombre sans débordement ni erreur JS. PDF aperçu, facture, acompte, solde, avoir, professionnel et document long de 5 pages rendus et inspectés.

## Suivi financier du tableau de bord

Le tableau de bord gérant/secrétaire présente le reste à encaisser TTC, les échéances dépassées, les trop-perçus à rembourser et les encaissements nets du mois (règlements moins remboursements enregistrés). Ces encaissements ne représentent pas le chiffre d'affaires. Les documents TEST sont exclus. Les totaux portent sur tous les documents réels ; la liste affiche les huit premières priorités, avec accès direct à la facture.

Les projections Firestore ne chargent pas les PDF et ne renvoient ni coordonnées privées détaillées ni historique complet des mouvements. Actualisation à la reprise de focus, manuellement et chaque minute lorsque l'onglet est visible. Une erreur conserve les dernières valeurs avec un avertissement explicite ; un chargement initial incomplet ne présente pas de faux zéro.

Chaque dossier regroupe ses factures et avoirs, propose les PDF archivés et ouvre une liste limitée au dossier. Les contrôles couvrent crédits partiels/totaux, remboursements, mouvements annulés, total au-delà de huit priorités, autorisations, Firestore isolé avec nettoyage, accès direct aux documents, erreur réseau, mobile et thème sombre.

## Avant activation réelle

1. Confirmer le dernier numéro réellement émis dans PARC, les éventuelles séries séparées existantes, la date de bascule et l'arrêt des émissions parallèles dans PARC.
2. Vérifier les mentions société, régime de TVA, conditions, IBAN et informations d'assurance applicables. Le délai par défaut est borné à 30 jours ; le parcours professionnel refuse une échéance au-delà de 30 jours après émission.
3. Adapter la reprise si le format/séries PARC diffère du suffixe numérique actuellement pris en charge. Activer ensuite le flag serveur puis faire confirmer la reprise dans le CRM par le gérant.
4. Déterminer la plateforme agréée et le raccordement pour la facturation électronique/e-reporting. L'envoi PDF implémenté ici n'est ni Factur-X/UBL, ni une connexion à une plateforme agréée. Pas de déclaration de conformité globale ou d'archivage probant certifié.

## Relances de règlement manuelles

Le détail d’une facture échue propose « Préparer une relance ». Le message reprend le solde TTC après avoirs et règlements enregistrés, la référence et l’échéance. L’utilisateur vérifie/modifie le message et confirme l’envoi ; le PDF original reste joint. Aucun frais n’est ajouté. L’historique distingue les relances des envois de documents et conserve le solde constaté au moment de l’envoi.

Le serveur refuse les documents TEST, avoirs, factures soldées ou non échues, les révisions obsolètes et une nouvelle relance dans les 24 heures suivant la création d’une tentative acceptée. Les protections existantes contre les envois simultanés et les résultats incertains s’appliquent. Tests de calcul déterministes et transport simulé : aucun e-mail réel de contrôle.

## Exports CSV de suivi

La recherche annule les requêtes devenues obsolètes et attend 250 ms après la saisie. Pendant le chargement ou une erreur, les anciennes lignes ne sont pas présentées comme le résultat du nouveau filtre. Les brouillons de paramètres ne sont pas réinitialisés par la recherche. Contrôles : 65 factures isolées, quatre pages sans doublons, recherches au-delà de la première page, erreurs réseau, accès privé et références Firestore.

Dans Factures → Exporter, le gérant et le secrétariat téléchargent les factures/avoirs selon leur date d’émission, ou les règlements/remboursements selon la date du mouvement. La période est inclusive et limitée à 366 jours. L’export couvre tous les dossiers, sans dépendre de la pagination visible ; TEST est exclu. Les soldes sont ceux au moment de l’export, pas une situation historique à la date de fin.

CSV UTF-8 avec BOM, séparateur point-virgule et décimales françaises ; champs texte neutralisés contre les formules. Les avoirs et remboursements sont signés négativement. Les annulations restent visibles avec leur motif et un montant net retenu nul. Les projections Firestore excluent PDF et informations non nécessaires. Réponse privée sans cache et accès authentifié.

Tests : dates invalides, bornes inclusives, période maximale, crédits, remboursements, annulations, texte contenant des guillemets/points-virgules/formules, export vide, endpoint protégé et projections Firestore isolées avec nettoyage.

Ces CSV sont des fichiers de suivi, pas un export FEC ni un journal comptable complet. Le rapprochement bancaire automatique, la reprise des anciennes factures PARC et les relances automatiques ne sont pas inclus dans cette livraison.

## Références vérifiées

- [Mentions obligatoires — Service Public](https://entreprendre.service-public.gouv.fr/vosdroits/F31808)
- [Calendrier de la réforme — DGFiP](https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation)
- [Délais sectoriels — DGCCRF](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/delais-de-paiement-les-regles-connaitre?language=fr)

# CRM We Move — dossier unifié et organisation, 30 septembre 2026

## Implémenté

- Tableau de bord orienté actions, filtres immédiats et recherche transversale dans les dossiers chargés.
- Suggestion de prochaine étape selon le statut, la visite, la réservation et la relance enregistrée.
- Fiche dossier réunissant informations, suivi, devis, archives d’envoi, documents préparatoires, mission et préparation de facture.
- Accès aux archives sans inclure leur PDF encodé dans la réponse du dossier.
- Statut « devis envoyé » synchronisé lorsque le prestataire accepte l’envoi de la version courante. Les statuts accepté, terminé ou refusé ne sont pas rétrogradés.
- Registre persistant des véhicules, personnes et monte-meubles ; administration gérant, contrôle des versions et journal serveur des modifications.
- Réservations avec début/fin et ressources ; contrôle transactionnel des chevauchements, annulation et journal dans le dossier. Seuls gérant et secrétaire peuvent réserver.
- Agenda sur sept jours et filtre par ressource. Les anciennes affectations sont signalées comme à confirmer dans le nouveau registre.
- Contrôle de version pour les modifications depuis la fiche et les actions de statut en masse. Validation des dates de visite.
- Conservation des préférences de liste pendant la session du navigateur.
- Statistiques par période de réception et source, export CSV agrégé sans coordonnées clients.
- Mode test de numérotation séparé, réservé au gérant, sans émission de facture définitive.

## Validation

- TypeScript, build client, pré-rendu et contrôle SEO.
- Tests SQLite isolés : demandes, suivi, devis, préparations de factures, compteur test, ressources, conflits, annulation et autorisations.
- Tests Firestore sur collections temporaires integration_ : créations concurrentes, conflits, archivage privé et synchronisation de statut. Collections supprimées à la fin.
- Chrome headless sur serveur local et base temporaire : tableau de bord, création de ressource, réservation, fiche dossier, mobile 390 px sans débordement horizontal ni erreur JavaScript.
- Aucune campagne, relance ou facture envoyée aux clients pendant les tests.

## Protection des données

État vérifié le 30 septembre 2026, base STANDARD `(default)` à Paris :
- PITR activé ; fenêtre historique se constitue à partir de l’activation, pas rétroactivement.
- Sauvegarde quotidienne, rétention 604800 secondes (7 jours).
- Création, suppression puis récupération d’un document de test depuis une lecture historique vérifiées ; espace isolé supprimé.
- Une restauration intégrale depuis une sauvegarde planifiée n’a pas encore été testée : la première sauvegarde doit être disponible.
- Stockage des sauvegardes/PITR facturé par Google ; aucun montant mensuel non mesuré n’est annoncé.
- Cette vérification ne constitue pas un audit complet IAM, RGPD ou de sécurité de l’infrastructure.

Références : https://firebase.google.com/docs/firestore/backups et https://firebase.google.com/docs/firestore/use-pitr

## Limites et suite nécessaire

- Factures définitives, acomptes, avoirs, encaissements et export comptable restent à implémenter après configuration de la bascule depuis PARC. Les préparations restent des brouillons.
- Les relances sont des tâches internes datées ; aucun envoi automatique n’est activé.
- La planification protège les réservations du nouveau registre. Les affectations historiques doivent être reprises manuellement avant de compter sur un contrôle complet.
- Les personnes et véhicules doivent être renseignés avec les ressources réelles de l’entreprise.
- Les dossiers restent chargés en mémoire côté client ; pagination serveur et recherche indexée seront nécessaires si le volume croît fortement.
- La gestion physique des box et l’import historique PARC ne font pas partie de cette livraison.
- Signature électronique et portail client non implémentés.

## Suivi commercial des devis — 1er octobre 2026

La liste des devis propose des indicateurs cliquables : à chiffrer, en attente de retour, relances à échéance et envoi à vérifier. Des filtres supplémentaires permettent de retrouver les dossiers sans prochaine action. « Suivre » ouvre la fiche existante pour attribuer un responsable et fixer une action datée ; aucune relance automatique n’est déclenchée.

Une attente de retour nécessite un envoi accepté pour la révision courante et un dossier encore ouvert. Une modification postérieure à l’envoi est signalée explicitement. Les états en cours, refusé et incertain sont distincts du brouillon. Une acceptation concerne le dossier, jamais une preuve de signature du devis. Les relances à échéance sont uniquement les actions rappeler/relancer enregistrées pour aujourd’hui ou avant, selon la date de Paris ; dossiers acceptés, terminés et refusés exclus.

Validation : calculs de suivi, anciennes révisions, dossiers clos, échéances, ouverture du dossier depuis la liste, filtres et mobile 390 px. Tests réalisés dans un espace local isolé, envois simulés uniquement.

## Vue des visites techniques — 1er octobre 2026

Le menu Visites présente une grille responsive, une recherche par client/ville/responsable, un filtre domicile/visio/téléphone et une pagination de 12 dossiers. Les indicateurs distinguent aujourd’hui, à venir, à vérifier et à programmer. Les visites effectuées et les dossiers clos restent consultables séparément. Un créneau passé, invalide ou sans heure est à vérifier, sans présumer de l’issue du rendez-vous.

« Programmer une visite » sélectionne un dossier ouvert et réutilise le formulaire existant avec contrôle de version. Date, format, état et notes restent enregistrés dans la demande. Aucun changement de statut commercial automatique ni envoi d’invitation. Les dates s’interprètent à Paris. Test navigateur sur mobile et enregistrement dans un dossier local isolé validés.

## Navigation rapide et synchronisation — 1er octobre 2026

Une recherche dans le header, accessible aussi via Ctrl/Cmd+K, retrouve les dossiers déjà chargés par nom, téléphone, e-mail, ville, responsable ou référence. Les accents et séparateurs des téléphones sont normalisés ; huit dossiers maximum sont proposés, classés par pertinence puis actualisation. Aucun historique de recherche ni nouvelle copie des dossiers n’est stocké dans le navigateur. Les modules proposés suivent le rôle connecté, et Factures n’apparaît plus dans la navigation commerciale ; les contrôles serveur restent applicables.

Le dialogue natif conserve le focus, se ferme avec Échap et respecte les formulaires déjà ouverts. Un dossier ou un module peut être ouvert avec les flèches et Entrée. États de chargement, d’erreur et d’absence de résultat distincts.

Le planning identifie chaque requête : une réponse obsolète ou reçue après démontage est ignorée. Les dernières réservations restent affichées en cas d’échec, avec un avertissement et l’heure de dernière synchronisation. Un premier échec n’affiche pas une fausse absence de réservations.

Validation : recherche multicritère, téléphone normalisé, clavier, focus, mobile 390 px, thème sombre, menus commerciaux, erreur réseau et réponses désordonnées. Tests de ressources, conflits simultanés et autorisations existants également validés ; toutes les données de contrôle sont isolées.

## Restauration : procédure préparatoire

1. Identifier l’incident et bloquer les écritures concernées.
2. Sélectionner un point de récupération ou une sauvegarde disponible.
3. Restaurer vers une base distincte dans le même projet ; ne jamais écraser la base active directement.
4. Vérifier les nombres de documents, les références de devis, réservations et factures, puis les accès dans un environnement séparé.
5. Décider et documenter la reprise avec le gérant. Tester une restauration complète dès disponibilité de la première sauvegarde.

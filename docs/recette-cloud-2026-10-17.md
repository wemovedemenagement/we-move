# Contrôle cloud WE MOVE — 17 octobre 2026

Contrôles réalisés avec `wemove.demenagement@gmail.com`, projet explicite `wemove-b0057`. Aucun secret d'envoi ni coordonnée client lu pour cet audit. Les observations suivantes portent sur la configuration disponible au moment du contrôle, et ne constituent pas un audit complet de l'infrastructure ou de ses dépendances.

## Constats renouvelés

- Firestore `(default)` : édition Standard, mode natif, Paris `europe-west9`.
- PITR actif, rétention `604800s` (7 jours).
- Planification quotidienne des sauvegardes, rétention `604800s`.
- Sept sauvegardes `READY`, une par jour du 11 au 17 octobre. La plus récente correspond au 17 octobre à `06:38:28.314340Z` et expire le 24 octobre à la même heure.
- Règles Firestore déployées : refus de toute lecture/écriture directe par les SDK clients (`allow read, write: if false`). Le serveur Admin reste responsable de l'authentification et des droits métier.
- Aucune attribution IAM publique (`allUsers` / `allAuthenticatedUsers`) relevée dans la politique projet consultée, celle du bucket photos et celle du secret d'envoi.
- Bucket `wemove-b0057-crm-photos` : `EUROPE-WEST9`, prévention des accès publics `enforced`, accès uniformes activés. Le compte serveur possède les droits d'objets nécessaires sur ce bucket.
- Le compte de service exécutant Cloud Run est celui déclaré par App Hosting : `firebase-app-hosting-compute@wemove-b0057.iam.gserviceaccount.com`.
- Runtime réellement déployé : `CRM_STORAGE=firestore`, `FIRESTORE_DATABASE_ID=(default)`, `CRM_LOCAL_ACCESS=false`, `CRM_BILLING_LIVE_ENABLED=false`, `CRM_MAIL_PROVIDER=resend`, notifications internes et accusés clients activés. Aucune activation de TOTP constatée par l'API publique.
- Configuration Firebase Authentication relue : e-mail/mot de passe et Google activés, `we-move.fr` dans les domaines autorisés, MFA `DISABLED`. Cela vérifie la configuration, pas une nouvelle connexion réelle de bout en bout.
- Le compte serveur dispose du rôle d'accès au secret d'envoi sur le secret concerné. Le contenu de ce secret n'a pas été demandé.
- Domaines App Hosting `we-move.fr` et `www.we-move.fr` : hôtes et certificats actifs ; `www` redirige vers le domaine principal. Aucun déploiement lancé par ce contrôle.

## Points à renforcer

1. **Protection contre la suppression activée après accord du gérant** : passage de `DELETE_PROTECTION_DISABLED` à `DELETE_PROTECTION_ENABLED` le 17 octobre à `13:08:21.822827Z` (15:08 à Paris). Mise à jour ciblée sur le seul champ `deleteProtectionState`, opération terminée puis état relu. UID, région, édition et PITR 7 jours conservés. Cette protection vise la suppression de la base entière ; elle n'empêche pas la suppression de documents par un utilisateur autorisé.
2. **Réduction des rôles du compte runtime appliquée après accord précis du gérant** : `roles/firebase.sdkAdminServiceAgent` et `roles/storage.objectViewer` retirés ; `roles/datastore.user` et `roles/firebaseauth.viewer` ajoutés. Les rôles App Hosting et Developer Connect sont conservés. Contrôle des lectures du CRM connecté réussi et attributions relues ; détails ci-dessous. Le compte runtime n'a pas d'attribution directe Owner/Editor dans la politique projet consultée.
3. La politique projet comporte aussi une attribution Editor et une Owner, à examiner avec les responsables des comptes. Le contrôle présent n'évalue pas tous les droits hérités, les conditions organisationnelles, l'impersonation, ni les clés de service existantes.
4. **MFA différée** : son activation reste une décision explicitement reportée. Prévoir le parcours de récupération et les essais réels lors de son activation autorisée.

## Plan de réduction des permissions serveur

La documentation officielle App Hosting inclut `computeRunner` et l'accès au dépôt Developer Connect dans son fonctionnement de compilation/exécution. Ces droits ne sont donc pas retirés arbitrairement. Le rôle `computeRunner` comprend lui-même des permissions étendues sur les objets Storage : enlever un rôle Storage redondant ne suffit pas à isoler le stockage.

Le code serveur actuel utilise Firebase Authentication uniquement pour vérifier les ID tokens, leur révocation et lire un compte (`verifyIdToken`, `getUser`). Les modifications du profil et la connexion restent effectuées via les SDK clients sous l'identité de l'utilisateur. Firestore utilise les transactions et les opérations documentaires serveur.

Changement appliqué : remplacement de `roles/firebase.sdkAdminServiceAgent` par `roles/datastore.user` et `roles/firebaseauth.viewer`, puis retrait de l'attribution redondante `roles/storage.objectViewer`. Conservation de `roles/firebaseapphosting.computeRunner`, `roles/developerconnect.readTokenAccessor`, des droits sur le bucket photos et de l'accès au seul secret d'envoi. La comparaison des définitions IAM réelles montre que le changement n'ajoute aucune permission directe et en retire 139 de l'union des rôles projet concernés, notamment les modifications de comptes Auth, des règles et de plusieurs configurations Firebase. Ce nombre ne mesure pas tous les droits effectifs ou hérités. Les écritures des dossiers et la lecture des comptes nécessaires aux vérifications de session restent dans l'ensemble des rôles conservés/ajoutés.

État : **remplacement autorisé par le gérant, appliqué et contrôle navigateur réussi**. Le contrôle sous l'identité du serveur a été refusé faute de permission `iam.serviceAccounts.getAccessToken` pour le compte de contrôle ; aucun droit supplémentaire ne lui a été attribué. Le tableau de bord, les priorités et le suivi financier ont été observés sans erreur avant mutation. Après le rejet initial de la commande par la revue automatique, le gérant a explicitement autorisé le remplacement précis des rôles.

La mutation ciblée a été appliquée à `2026-10-17T13:16:15.788Z` (15:16 à Paris). Le gérant s'est reconnecté dans le nouvel onglet de contrôle. Vérifications après mutation : connexion réussie, actualisation du tableau de bord avec 10 dossiers, lecture des 5 devis, lecture du planning avec fin de synchronisation et calendrier affiché, lecture de la facturation avec liste réelle vide et verrou d'activation conservé. Aucune erreur d'accès visible sur ces parcours.

Le processus s'est terminé avec succès après relecture des attributions IAM et confirmation des contrôles : `applied: true`, `browserVerification: passed` dans `crm-permissions-2026-10-17.json`. Le retour automatique de précaution n'est plus actif et aucun rétablissement des anciens rôles n'a été nécessaire. La session Firebase CLI est distincte de la session CRM.

Limites : pas d'écriture sur un dossier réel, de téléchargement de pièce privée, de lecture du contenu du secret, d'envoi ni d'émission de facture pendant ce contrôle. Les chemins d'écriture sont justifiés par la comparaison des permissions de rôles et les tests métier isolés, mais n'ont pas été exercés en production ici. Les droits hérités et les permissions encore larges nécessaires au compte App Hosting restent hors d'une certification globale du moindre privilège. Un futur déploiement App Hosting devra aussi vérifier que ces attributions sont conservées et que la compilation fonctionne.

Références du plan : [rôles App Hosting](https://firebase.google.com/docs/projects/iam/roles-predefined-product#apphosting), [compte de service App Hosting](https://firebase.google.com/support/guides/service-accounts), [exemple de configuration des rôles](https://firebase.google.com/docs/projects/terraform/get-started).

## Exercice de restauration

Sauvegarde sélectionnée : `projects/wemove-b0057/locations/europe-west9/backups/0ab125eb-e328-4d86-b3b1-e265383d3270`.

Cible temporaire : `crm-restore-check-20261017`, même projet et même région. Cette base n'est pas raccordée au site, à un worker d'envoi ou à une instance du CRM. Aucun changement de configuration de production ni de règles d'accès publiques n'est effectué. La restauration et le stockage temporaire sont des opérations cloud facturées selon l'usage ; aucun montant non mesuré n'est annoncé.

La restauration a été lancée à `2026-10-17T12:53:52.162Z`, puis son achèvement et la lecture des données ont été vérifiés à `2026-10-17T13:05:30.607Z`. Les 698 secondes mesurent le délai entre lancement et vérification finale, pas la durée exacte du traitement Google. Le résultat et le nettoyage sont consignés dans `recette-restauration-2026-10-17.json`.

La session locale WE MOVE a disparu du magasin d'authentification CLI pendant l'exercice, confirmé aussi par le connecteur Firebase (`Authenticated User: <NONE>`). Après reconnexion, la même opération a été reprise : aucune seconde restauration n'a été lancée. Le contrôle final a utilisé un client authentifié conservé dans la mémoire du processus, sans nouvelle copie de credentials sur disque.

Résultat final :

- Opération Google terminée sans erreur ; provenance de la cible confirmée comme étant la sauvegarde sélectionnée, région Paris.
- 22 documents lus avec masque limité aux champs de références et de révision : 10 demandes, 5 brouillons de devis et 7 entrées de limitation d'e-mails. Aucune coordonnée client ni contenu PDF lu ou exporté.
- Les 5 relations devis → demande de cette sauvegarde sont présentes. La sauvegarde ne contient pas de collection de réservations ou de factures : la restauration de ces types de données n'est donc pas éprouvée sur ce jeu.
- Identité et date de mise à jour de configuration de la base source inchangées après le contrôle et après le nettoyage. Cela ne signifie pas que les écritures métier habituelles du site ont été arrêtées.
- Base temporaire supprimée après contrôle de son nom exact, de son UID, de sa provenance et de sa date de création ; réponse 404 obtenue après suppression. La sauvegarde source est conservée.

Cet exercice confirme la restauration d'une sauvegarde existante et la cohérence des relations présentes, sans comparaison exhaustive octet par octet avec la source historique. Il est terminé, y compris le nettoyage.

Le contrôle des références de la base restaurée ne remplace pas une recette complète de l'application raccordée à cette base. Il ne couvre pas la restauration des photos du bucket, des comptes Firebase Authentication, des secrets ni des configurations externes.

Références officielles : [sauvegardes et restauration Firestore](https://firebase.google.com/docs/firestore/backups), [contrôles IAM Firestore](https://firebase.google.com/docs/firestore/security/iam).

# Envoi des devis par le CRM

Dans **Devis → Documents → Préparer l’envoi**, l’utilisateur vérifie le destinataire enregistré, l’objet et le message, puis confirme explicitement l’envoi. La même commande est disponible dans l’éditeur après sauvegarde. Aucun e-mail n’est envoyé lors du téléchargement ou de l’ouverture de l’écran.

## Connexion à la messagerie

### Mode transactionnel préparé (Resend + Secret Manager)

Le mode actif préparé est `CRM_MAIL_PROVIDER=resend`, avec `contact@we-move.fr` comme expéditeur et adresse de réponse. Le mot de passe de la boîte OVH a été retiré de la configuration locale. L’envoi reste indisponible tant que le compte transactionnel, le domaine et le secret ne sont pas configurés. Aucune bascule SMTP automatique n’a lieu en cas d’erreur.

1. Dans Resend, ajouter **we-move.fr**, activer uniquement l’envoi et recopier les enregistrements de vérification indiqués par Resend dans le DNS OVH. Conserver les MX de réception OVH existants. Ne pas inventer les valeurs SPF/DKIM ; utiliser celles affichées pour le domaine.
2. Créer une clé **Sending access**, restreinte au domaine **we-move.fr**, sans accès administratif. Ne jamais la transmettre dans le chat ou l’enregistrer dans Git.
3. Après approbation explicite de l’opération IAM, exécuter `node scripts/setup-mail-secret.mjs`. Il crée le secret vide `we-move-mail-sending-key` (réplication à Paris), puis accorde `roles/secretmanager.secretAccessor` sur ce secret uniquement au compte `firebase-app-hosting-compute@wemove-b0057.iam.gserviceaccount.com`. Il n’accorde aucun rôle global au projet et n’importe aucun secret.
4. Ajouter la clé directement comme version du secret dans la console Google Cloud. Reporter le numéro de version dans `CRM_MAIL_API_KEY_SECRET` (`apphosting.yaml` et `.env.local`). La clé est lue côté serveur avec IAM et gardée en mémoire cinq minutes ; seule la référence est dans la configuration, disponible au runtime et pas à la compilation. Le navigateur ne reçoit ni clé ni référence interne.
5. Vérifier l’accès avec `node scripts/verify-crm-mail.mjs`, puis effectuer un envoi sur une adresse de contrôle choisie par le propriétaire. Ce contrôle de secret ne prouve pas à lui seul la validation du domaine ni la délivrabilité.

Statut au 28 septembre 2026 : **après autorisation explicite du propriétaire, le secret `we-move-mail-sending-key` a été créé à Paris (`europe-west9`). Le droit `roles/secretmanager.secretAccessor` a été accordé au compte App Hosting sur ce secret uniquement.** Vérification des métadonnées : droit présent, aucun accès public et aucune version du secret (clé non encore importée). Aucun compte Resend n’a été créé, aucun DNS changé et aucun déploiement effectué. L’envoi reste désactivé en attendant la configuration Resend et l’ajout de sa clé dédiée.

Rotation : créer une nouvelle clé restreinte et une nouvelle version du secret, changer explicitement le numéro de version puis redéployer/redémarrer. Révoquer l’ancienne clé chez le prestataire après validation. Ne pas utiliser `latest`, afin de maîtriser les versions autorisées.

Le prestataire reçoit les e-mails et PDF nécessaires à l’envoi. Ce montage isole les droits de messagerie ; il ne dispense pas de vérifier ses conditions de traitement et de conservation des données.

Références : https://resend.com/docs/api-reference/api-keys/create-api-key ; https://resend.com/docs/dashboard/domains/introduction ; https://docs.cloud.google.com/secret-manager/docs/best-practices.

### Ancien mode SMTP (désactivé dans la configuration préparée)

Configurer uniquement côté serveur les variables de `.env.example` : `CRM_MAIL_FROM`, `CRM_SMTP_HOST`, `CRM_SMTP_PORT` (465 TLS ou 587 STARTTLS obligatoire), `CRM_SMTP_USER`, `CRM_SMTP_PASSWORD`. Pour Gmail, utiliser un mot de passe d’application lorsque le compte le permet, avec la validation en deux étapes activée. Ne jamais utiliser le mot de passe principal ni publier ces valeurs dans Git, le navigateur ou le chat. En production, injecter ces secrets via la configuration sécurisée de l’hébergement. Redémarrer le serveur après configuration.

La connexion Google au CRM/Firebase ne donne pas le droit d’envoyer des e-mails Gmail. Aucun identifiant de la CLI Firebase n’est réutilisé pour l’envoi. Documentation : https://support.google.com/accounts/answer/185833?hl=fr et https://nodemailer.com/smtp.

## Archivage et statuts

Le serveur relit la version enregistrée, valide le destinataire et les informations essentielles, génère un PDF portant une référence `DEV-…-R…`, puis le fige avant l’envoi. Les annexes sont jointes dans ce PDF. Il est archivé avec le destinataire, le contenu du message, l’auteur, la révision, une empreinte SHA-256 et l’horodatage. Le brouillon de travail peut ensuite évoluer sans modifier l’archive.

Firestore Standard Paris : sous-collection privée `crm_quote_drafts/{id}/mail_deliveries/{revision}`. L’API serveur et l’authentification existante contrôlent l’accès ; les règles clientes existantes ne sont pas assouplies. L’archive contient le PDF en base64 et le dossier figé ; un plafond de 900 000 octets par enregistrement évite de dépasser la limite Firestore. Les gros dossiers doivent être raccourcis, ou faire l’objet d’une évolution vers un stockage de pièces jointes dédié.

Une transaction garantit une seule tentative par version, même en cas de double clic ou de requêtes concurrentes. Les états sont `sending`, `accepted` (accepté par le serveur SMTP), `failed` (refus confirmé) et `uncertain` (résultat indéterminé). Il n’y a ni suivi d’ouverture, ni preuve de livraison, ni acceptation du devis simulée. Un crash après l’envoi et avant l’enregistrement laisse la tentative à vérifier ; aucune relance automatique n’est autorisée. Pour une nouvelle tentative après correction ou vérification manuelle, enregistrer une nouvelle révision et confirmer son envoi.

L’interface affiche la transmission pour la version correspondante, pas pour les modifications ultérieures. L’historique permet de télécharger le PDF archivé. Les noms d’expéditeur et destinataire sont validés ; aucun destinataire arbitraire, URL ou chemin de pièce jointe n’est accepté dans le POST.

## Vérifications

`node scripts/test-crm-mail.mjs` : SQLite temporaire et transport injecté en mémoire, sans e-mail réel. Vérifie les droits, la validation, les conflits de version, les archives, les doublons, la concurrence et les résultats incertains. Les tests d’API privés se trouvent dans `scripts/test-crm-drafts.mjs`.

Le test réel de délivrabilité reste à effectuer après connexion de l’expéditeur, sur une adresse explicitement choisie par le propriétaire. Aucun envoi à un client n’est réalisé pendant le développement.

## Notifications des demandes du site

`CRM_LEAD_NOTIFICATIONS=true` active une alerte Resend à `contact@we-move.fr` après enregistrement durable d’une demande provenant des formulaires du site. Les saisies téléphone/CRM ne déclenchent pas cette alerte. Le destinataire est fixé côté serveur et n’est jamais fourni par le formulaire. Aucun accusé de réception au client n’est envoyé.

Le champ Firestore `notification` conserve `sending`, `accepted`, `failed` ou `uncertain` avec dates et identifiant du prestataire. Une transaction évite deux tentatives pour le même dossier. `accepted` signifie accepté par Resend, pas livré dans la boîte. Une erreur e-mail ne fait pas échouer une demande déjà enregistrée. Pas de relance automatique après résultat incertain ; les anciennes demandes ne sont pas renvoyées automatiquement. Les erreurs sont journalisées sans coordonnées client ni secret.

Test isolé : `node scripts/test-crm-lead-notification.mjs` (aucun e-mail réel).

## Accusé de réception client (29 septembre 2026)

`CRM_CUSTOMER_RECEIPTS=true` active l’accusé de réception pour les nouvelles demandes du site comportant une adresse e-mail valide. Expéditeur et Reply-To : `contact@we-move.fr`. Le client reçoit le récapitulatif, les coordonnées de contact et une précision : cet e-mail ne constitue ni devis ni réservation. Aucun lien privé CRM ni message libre du formulaire n’est inclus dans la confirmation client. Le logo public est `/images/we-move-logo-email.png` (dérivé des tracés officiels utilisés sur le site et les PDF).

Suivi indépendant dans `crm_requests/{id}.customerNotification`. Une tentative par dossier ; aucune relance automatique en cas de résultat incertain. Limites partagées entre instances dans `crm_mail_limits` : un accusé par adresse normalisée sur une heure, 200 tentatives par jour UTC au total. Les demandes restent enregistrées et l’alerte interne reste indépendante lorsque l’accusé est limité. Les clés destinataires sont des empreintes SHA-256. Aucun renvoi des anciennes demandes lors de l’activation.

Vérifications : `node scripts/test-crm-customer-receipt.mjs`, tests de notifications internes et transport Resend ; aperçus locaux avec données fictives. La réception réelle dans les logiciels de messagerie reste à confirmer lors d’une prochaine demande autorisée.

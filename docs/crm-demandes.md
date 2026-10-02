# Demandes : Firestore Paris

## Connexion effective

Projet wemove-b0057, base (default), édition Standard, région europe-west9 (Paris).
La configuration locale .env.local active CRM_STORAGE=firestore. La collection crm_requests contient les demandes.
Le formulaire /devis/, le formulaire rapide et la saisie manuelle du CRM passent par POST /api/quotes. Le CRM recharge les données toutes les 20 secondes lorsque son onglet est visible et au retour dans l'onglet. Le bouton d'actualisation déclenche une lecture immédiate.
Les confirmations sont envoyées après écriture Firestore. En cas d'erreur, aucune sauvegarde locale de secours ne simule un succès.
Les modifications et suppressions utilisent des transactions Firestore.

## Authentification et accès

En développement seulement, CRM_FIREBASE_CLI_ACCOUNT sélectionne une session déjà ouverte avec firebase login. Les identifiants restent en mémoire serveur, ne sont ni copiés dans le projet ni envoyés au navigateur. Cette intégration dépend des modules internes de firebase-tools ; vérifier sa compatibilité lors d'une mise à jour.
Sur Cloud Run, le SDK utilise les identifiants ADC du compte de service et les permissions IAM. La session CLI est refusée en production.
Les règles Firestore existantes refusent les accès directs des clients. Elles sont conservées. Le SDK serveur utilise IAM, pas les règles clientes.
Les routes internes de lecture, modification et suppression ne sont accessibles qu'en local avec CRM_LOCAL_ACCESS=true, connexion réseau en boucle locale, Host local et Origin cohérent. Ailleurs elles renvoient 401 : aucun rôle conservé dans le navigateur ne donne accès aux données.

## Données historiques

La base SQLite locale et quotes.json sont conservés. Aucune migration automatique vers Firestore, notamment des anciennes demandes de démonstration. CRM_STORAGE=sqlite reste disponible pour les tests isolés. SQLite est refusé sur Cloud Run.
Les caches historiques du navigateur ne sont pas utilisés pour les demandes.

## Canaux

Site, téléphone, Ads, recommandation, partenaire, e-mail et autre. sourceDetail conserve la précision facultative. Les demandes téléphoniques et Ads peuvent être saisies manuellement ; aucune connexion automatique à Google Ads ou Meta n'est incluse.

## Vérification

npm run test:crm : API, persistance SQLite isolée, validation, migration, rejet des accès non autorisés.
node scripts/check-firestore.mjs : test explicite dans des collections Firestore techniques isolées, nettoyées ensuite. Aucune écriture dans les collections CRM réelles.
La connexion et le parcours complet ont été vérifiés le 27 septembre 2026. Aucun document technique n'a été conservé.

## Avant mise en ligne

La connexion fonctionne pour le site et le CRM locaux. Aucun déploiement effectué dans cette étape.
Configurer Firebase Authentication, contrôler les rôles côté serveur et intégrer la connexion au CRM avant d'ouvrir ses routes internes. Configurer IAM minimal pour le serveur, protection anti-abus du formulaire public, sauvegardes et test de restauration. Les modules non raccordés affichent un état explicite, sans données de démonstration.

## Données réelles uniquement (27 septembre 2026)

Les tableaux de démonstration (clients, devis, factures, employés, flotte), les identités simulées et les confirmations d'envoi fictives ont été retirés du CRM. Aucun tarif arbitraire n'est calculé pour les nouvelles demandes.
Le tableau de bord et les statistiques dépendent uniquement des demandes reçues du serveur. Sans première lecture réussie, les indicateurs restent indisponibles ; une erreur de synchronisation signale les anciennes données affichées.
Les visites et affectations sont enregistrées dans les dossiers. Les statuts sont déclaratifs : changer l'avancement ne crée, n'envoie et ne paie aucun document.
Les modules facturation, registre équipes/flotte et accès utilisateurs affichent explicitement leur raccordement restant à réaliser. Les brouillons de devis sont désormais raccordés (voir ci-dessous). Aucune donnée réelle existante n'a été supprimée de Firestore, du stockage local ou des fichiers historiques.

## Devis : brouillons persistants

La rubrique Devis et le bouton Préparer un devis utilisent /api/crm/quote-drafts (API privée).
Collection Firestore crm_quote_drafts : un brouillon par demande, avec les coordonnées relevées à sa création. Référence BR- de travail uniquement, pas de numérotation commerciale définitive. Les brouillons sont retrouvés après rechargement et persistés dans des transactions. Une demande possédant un brouillon ne peut pas être supprimée par l'API.
Les prestations, quantités, prix HT, TVA, acompte et validité sont saisis par l'utilisateur. Aucun tarif, taux ou pourcentage n'est prérempli. Les totaux sont calculés en arithmétique entière côté serveur ; les montants envoyés par le navigateur ne sont pas acceptés. Les valeurs non renseignées restent nulles, affichées À compléter.
La révision du document empêche l'écrasement d'une modification concurrente (409). Les saisies restent dans l'éditeur en cas d'échec. Recharger la version enregistrée nécessite d'abandonner explicitement les modifications locales.
Le brouillon reste au statut brouillon : pas d'envoi, signature, facture ou encaissement simulé. Le statut manuel d'une demande reste indépendant du document.
Tests : npm run test:crm:devis (SQLite temporaire) ; node scripts/test-crm-drafts.mjs --firestore-isolated (collections integration_<identifiant>_* avec NODE_ENV=test, supprimées en fin d'essai). Aucun dossier technique n'est injecté dans les collections CRM réelles.

## Responsables, actions et relances

La liste des utilisateurs autorisés est définie côté serveur dans server/crmAccess.json. Le seul compte actuellement déclaré est wemove.demenagement@gmail.com (gérant), confirmé par le propriétaire. Aucun utilisateur fictif et aucune invitation envoyée.
Le SDK Firebase Admin vérifie les ID tokens, leur révocation et l'adresse e-mail vérifiée. L'identité est comparée à la liste autorisée, dont le rôle provient du serveur. Un token invalide ne peut jamais basculer silencieusement vers l'accès local. Le mode local existant reste limité à la boucle locale, explicitement activé et refusé en production. Ce mode est nommé Accès local, jamais présenté comme une connexion Google.
Google Sign-In est préparé dans firebase.json mais son activation externe reste soumise à l'autorisation demandée après le rejet du contrôle automatique. L'activation n'a pas encore été effectuée. La connexion effective avec un ID token réel reste donc à vérifier après activation et connexion du propriétaire.
PATCH /api/quotes/:id/follow-up enregistre un responsable actif, une action (rappeler, visite, devis), une échéance à la journée et une précision facultative. Les changements utilisent une révision dédiée et une transaction ; les conflits renvoient 409. Le nom affiché du responsable vient du répertoire serveur, jamais du navigateur. Les champs de suivi ne peuvent pas être modifiés par le PATCH générique ni par le formulaire public.
Action terminée retire l'action courante, garde le responsable et ajoute un événement à l'historique. Aucun appel, rendez-vous, envoi ni paiement n'est simulé. Les dates des filtres Aujourd'hui et En retard sont calculées en Europe/Paris, indépendamment du fuseau du navigateur. Les dossiers refusés et terminés sont exclus des relances.
Tests : npm run test:crm:suivi ; node scripts/test-crm-follow-up.mjs --firestore-isolated. Cas couverts : droits, identités non vérifiées/non autorisées, tentative de contournement, calendrier Paris, validation des dates et responsables, conflit concurrent, clôture et historique.

## Éditeur de devis — modèle client (28 septembre 2026)
Le brouillon conserve désormais un document structuré : client/facturation, société et commercial, formule, volume/distance, périodes et accès distincts au chargement et à la livraison, répartition entreprise/client/non inclus, garanties, valeurs déclarées, modalités de versement (arrhes/acompte), suppléments, CO₂ et références d’annexes. Les coordonnées société proviennent du PDF fourni, sont modifiables et sauvegardées dans chaque brouillon ; aucun client, commercial, montant ou garantie du dossier exemple n’est recopié.
Les anciens brouillons restent lisibles. La révision concurrente est conservée. Les corrections restent propres au devis et ne modifient pas la demande source. Les sommes et taux sont toujours calculés par le serveur. Les champs incomplets sont permis en brouillon ; aucune émission, annexe, signature ou numérotation définitive n’est simulée. Les références BR restent internes, non des numéros de devis émis.
Validation : TypeScript, tests API SQLite et Firestore isolés (persistance du document, dates, valeurs négatives, clés inconnues et conflits), saisie/sauvegarde/relecture visuelles sur une base locale temporaire.

# Publication contrôlée du CRM WE MOVE

## Pourquoi ce parcours

Le déploiement local classique de Firebase CLI 15.31.0 appelle `ensureAppHostingComputeServiceAccount`, puis `provisionDefaultComputeServiceAccount`. Il réattribue notamment `roles/firebase.sdkAdminServiceAgent` et `roles/storage.objectViewer` au compte App Hosting. Ce comportement a été constaté après la publication du 17 octobre et confirmé dans le code du CLI installé.

Le parcours ci-dessous utilise la commande officielle `apphosting:rollouts:create --git-commit`, avec le dépôt GitHub déjà lié. Il n'appelle pas ce provisionnement local. Aucun fichier de Firebase CLI n'est modifié ; le script n'écrit aucune politique IAM. Les droits sont relus après la tentative pour détecter une régression venant du service ou d'un autre outil.

## Préparation

- Node 24 ou supérieur, dépendances installées par `npm ci` et GitHub CLI `gh` disponible.
- Session Firebase du compte `wemove.demenagement@gmail.com` ; session GitHub du compte `wemovedemenagement`.
- Backend existant `we-move`, projet `wemove-b0057`, région App Hosting `europe-west4`, dépôt lié `wemovedemenagement/we-move`.
- Les changements à publier sont commités et poussés sur `main`. La dernière exécution du workflow « Validation de livraison » pour ce SHA exact doit être terminée avec succès. Une exécution plus récente en cours ou échouée bloque le lancement.

Les identifiants restent gérés par Firebase CLI et GitHub CLI. Le script conserve les jetons nécessaires en mémoire et ne les écrit pas dans ses rapports. Il ne lit ni clé Resend ni contenu des dossiers CRM.

## Vérifier sans publier

```powershell
npm run deploy:crm -- --check
```

Sans argument, le script se comporte également en lecture seule. Ce contrôle ne crée ni build ni rollout et ne modifie aucun rôle.

Il exige les quatre rôles directs attendus du compte serveur : `datastore.user`, `firebaseauth.viewer`, `firebaseapphosting.computeRunner` et `developerconnect.readTokenAccessor`. Une attribution conditionnelle ou un rôle supplémentaire demande une revue ; le script ne la corrige pas automatiquement.

Il contrôle aussi la base Standard à Paris, la protection contre la suppression, le PITR, l'identité du service, le dépôt lié, Firestore comme stockage, l'accès local désactivé et les verrous actuels de facturation et MFA. Les activations futures de facturation/MFA devront faire évoluer cette politique de phase de manière explicite, pas désactiver les contrôles.

## Publier un commit validé

```powershell
$crmCommit = git rev-parse HEAD
npm run deploy:crm -- --commit $crmCommit
```

Le SHA complet de 40 caractères est obligatoire : ni branche flottante, ni argument shell interpolé. Le script fixe le projet, le backend et les comptes utilisés. La publication provient du commit GitHub, pas des fichiers locaux non enregistrés.

Après les contrôles cloud et GitHub, le script lance le CLI officiel, attend son résultat, puis :

1. Relit les protections et les rôles, même si le lancement a échoué.
2. Vérifie qu'un seul build `READY` reçoit 100 % du trafic, sans réconciliation en cours.
3. Compare le hash source du build servi avec le SHA demandé et vérifie son dépôt.
4. Vérifie le HTML public et son asset principal, le cache CRM `no-store`, l'état MFA attendu et le refus 401 de la session sans authentification.

Le résultat est écrit dans `tmp/crm-deployment-latest.json`, hors Git et hors des sources locales déployées. Un résultat `passed` décrit ces contrôles ciblés, pas une recette métier complète.

## En cas d'échec

Un échec avant lancement empêche la publication par cet outil. Un échec après lancement peut concerner une version déjà en ligne : il est signalé, mais le script ne rétablit ni une ancienne image ni des rôles plus larges automatiquement. Consulter l'état App Hosting et le rapport avant toute nouvelle tentative. Ne pas supposer qu'un délai d'attente équivaut à l'absence de publication.

Les déploiements manuels depuis la console, les rollouts automatiques et les commandes directes contournent ce contrôle local. Leur existence n'est pas désactivée par le script. Toute autre voie doit assurer les mêmes vérifications.

## Validation

`scripts/test-crm-deployment.mjs` utilise uniquement des données simulées. Il couvre notamment le mode lecture seule, la CI en échec/en cours, l'apparition d'un rôle large, les protections manquantes, le contrôle après échec du CLI, le trafic partagé, le mauvais commit et l'échec de la vérification HTTP. Cette suite est intégrée à la validation de livraison, qui passe de 50 à 51 suites.

Contrôle réel en lecture seule réussi le 19 octobre 2026 : quatre rôles réduits présents, protection de suppression et PITR actifs, verrous de facturation/MFA conservés, page CRM HTTP 200 et session anonyme refusée en 401. Cela ne valide pas encore une publication réelle par la nouvelle commande ; cette preuve sera ajoutée après son premier usage.

Références : [rollouts App Hosting](https://firebase.google.com/docs/app-hosting/rollouts), [source du build et hash Git servi](https://firebase.google.com/docs/reference/apphosting/rest/v1beta/projects.locations.backends.builds#BuildSource.CodebaseSource).

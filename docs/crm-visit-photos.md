# Photos de visite

Les photos sont indépendantes de la sauvegarde du formulaire de visite : chaque ajout ou suppression est immédiatement enregistré. Le formulaire et la galerie empêchent les opérations simultanées dans le même écran.

## Stockage et accès

- Bucket dédié `wemove-b0057-crm-photos`, région Paris `europe-west9`, accès uniforme et prévention d’accès public forcée.
- Le compte d’exécution App Hosting possède `storage.objectUser` et `storage.legacyBucketReader` sur ce bucket uniquement. Les administrateurs du projet conservent leurs droits hérités.
- Aucune URL signée, aucun jeton Firebase de téléchargement et aucun accès direct depuis le navigateur. Chaque lecture passe par l’authentification CRM, sa liste de collaborateurs autorisés et la vérification de l’existence du dossier.
- Les réponses photo sont `private, no-store`. Les aperçus utilisent des URL Blob temporaires, révoquées lors du renouvellement ou de la fermeture de la galerie.
- Aucun rôle ni règle Firestore modifié. Les images ne sont pas intégrées aux documents Firestore ni aux PDF contractuels.

## Traitement et limites

12 emplacements par dossier ; JPEG, PNG et WebP non animés ; 8 Mo et 40 millions de pixels maximum en entrée. Le serveur décode, applique l’orientation et réencode en JPEG de 1600 pixels maximum. Les métadonnées EXIF/GPS et les fichiers originaux ne sont pas conservés.

La création GCS exige une génération inexistante : deux ajouts au même emplacement ne s’écrasent pas. La suppression exige la génération affichée : une ancienne galerie ne peut pas supprimer une nouvelle photo.

Les suppressions sont définitives, avec confirmation explicite. La suppression d’une demande contenant des photos est refusée pour permettre leur retrait préalable. Une suppression de dossier concurrente avec un ajout, ou une intervention administrative hors CRM, peut laisser un objet orphelin ; celui-ci reste privé et inaccessible via le CRM. Un outil de rapprochement avec les dossiers sera nécessaire avant une politique automatique de conservation. Aucune durée arbitraire ni suppression périodique n’est configurée.

Les essais utilisent SQLite et des fichiers dans un répertoire temporaire isolé. Ce stockage local est interdit sur Cloud Run et en production. `scripts/test-crm-visit-photos.mjs` couvre les contrôles API et les images ; les droits du bucket sont vérifiés séparément lors de son provisionnement.

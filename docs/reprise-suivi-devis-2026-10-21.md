# Reprendre le suivi après une erreur ou un conflit — 21 octobre 2026

Après une erreur de sauvegarde ou de clôture d’action, « Consulter le suivi actuel »
permet de relire le dossier dans la même fenêtre. L’aperçu présente le responsable,
la prochaine action, sa précision et le dernier échange enregistrés. La consultation
ne remplace aucun champ du formulaire et n’effectue aucune écriture. Le panneau
reçoit le focus ; les écritures restent bloquées pendant cette comparaison.

« Garder ma saisie » revient au formulaire avec sa révision d’origine. Il n’existe
aucune fusion automatique ni reprise silencieuse sur une révision plus récente.
« Reprendre ce suivi » remplace les champs par la version consultée ; si la saisie
a changé, une confirmation annonce explicitement son remplacement. L’annuler
conserve le formulaire et l’aperçu. Une lecture en échec ou un dossier d’un autre
identifiant ne remplace jamais les champs.

Après un rechargement confirmé, le compte rendu et le résultat en cours sont
effacés, et l’option « Consigner un échange » revient décochée. Cela évite de
rejouer involontairement un échange après une réponse réseau incertaine. Le
message de relance préparé séparément reste conservé. Toute nouvelle sauvegarde
est explicite et utilise la révision relue ; la protection serveur contre les
modifications simultanées reste active. Un dossier accepté, terminé ou non retenu
rechargé passe en lecture seule dans ce formulaire commercial.

La liste reçoit le dossier relu sans annoncer de sauvegarde. La lecture réutilise
la route authentifiée existante `/api/crm/dossiers/:id`. Aucune nouvelle route,
permission ou donnée persistante. Le message de conflit serveur indique désormais
de consulter les données actuelles, et son affichage suit la couleur du thème.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis.
Parcours navigateur sur SQLite temporaire : conflit réel, panne de lecture,
identifiant incorrect, consultation sans écriture, conservation de la saisie,
confirmation annulée puis acceptée, rechargement sans échange fictif, sauvegarde
sur la bonne révision, second conflit et dossier passé à une autre étape bloqué.
Affichage contrôlé sur ordinateur, mobile et sombre. Aucun e-mail ni facture réel.

# Actualiser le mail sans perdre sa personnalisation — 21 octobre 2026

Le panneau d’envoi conserve désormais les champs personnalisés lors d’une
actualisation réussie si la révision du devis et le destinataire sont identiques.
Les champs restés à leur valeur par défaut peuvent recevoir les nouveaux textes
du serveur. Si la révision ou le destinataire change, les deux champs reprennent
la nouvelle préparation. Toute actualisation annule la confirmation d’envoi.

Une lecture échouée garde les textes à l’écran mais bloque la confirmation et
l’envoi jusqu’à une nouvelle lecture réussie de l’historique. Ce contrôle n’est
pas une promesse de synchronisation continue ; les vérifications de révision et
de doublon du serveur restent nécessaires et inchangées.

La réponse de l’envoi et la lecture suivante de l’historique sont traitées
séparément. Une réponse connue est immédiatement ajoutée à l’historique affiché.
Une panne de lecture ne transforme donc plus un envoi accepté par le serveur
e-mail en « Envoi impossible ». Une acceptation ne prouve toujours pas la
réception par le client. Après une erreur de transport et une lecture échouée,
aucune nouvelle tentative n’est proposée avant actualisation explicite réussie.

Le verrou de requête, les contrôles de confirmation, les blocages liés aux
modifications du devis et l’archivage serveur sont conservés. Aucun nouvel envoi
automatique, stockage local persistant, endpoint ou changement de permissions.

Validation : TypeScript, compilation de production, 61 contrôles de livraison
réussis et recette navigateur isolée couvrant
la conservation du texte, l’invalidation de confirmation, le changement de
destinataire/révision, les erreurs d’envoi et de lecture, la récupération
explicite, l’acceptation suivie d’une panne d’historique et le double clic.
Transport simulé uniquement : aucune écriture d’e-mail, facture ou demande source.
Les vues ordinateur, mobile et sombre restent couvertes par ce parcours.

# Enregistrer un devis sans quitter sa préparation — 20 octobre 2026

L’enregistrement manuel conserve désormais l’éditeur ouvert à l’étape courante.
Les champs sont réinitialisés à partir de la réponse serveur, avec sa nouvelle
révision. Une confirmation indique la version enregistrée et rappelle qu’aucun
envoi n’a été effectué. Il ne s’agit pas d’une sauvegarde automatique.

- Sans modification, le bouton indique « Enregistré » et ne crée pas de version.
- Pendant la requête, le verrou existant empêche un double enregistrement.
- En cas d’erreur réseau ou de conflit de version, les saisies restent présentes.
- Le rechargement explicite demande toujours confirmation avant de les abandonner.
  Il restaure aussi les champs quand la révision serveur n’a pas changé.
- « Enregistrer et préparer l’envoi » reste une action distincte, soumise aux
  contrôles existants. La préparation ne transmet aucun message au client.
- Les boutons du pied sont associés au formulaire par l’attribut HTML `form`.
  Le pied reste dans la fenêtre de dialogue plutôt que dans le formulaire,
  pour éviter que sa limite supérieure ne masque les boutons sur petit écran.

Aucune modification de l’API, des permissions, du stockage ou de la facturation.
Les contrôles de révision et la confirmation de modification d’un devis accepté
restent en place.

Validation : 61 suites de recette réussies avant l’ajustement de disposition ;
compilation TypeScript et production, puis parcours navigateur isolé après cet
ajustement. Le parcours contrôle les sauvegardes successives à la même étape,
le double clic, l’absence de modification, l’erreur réseau, le conflit concurrent,
le rechargement de même version et la préparation séparée. Vérification visuelle
sur ordinateur, mobile et thème sombre. Données temporaires uniquement ; aucun
envoi, facture ou changement des demandes sources pendant la recette.

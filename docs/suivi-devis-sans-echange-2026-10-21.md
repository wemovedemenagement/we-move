# Programmer le suivi sans déclarer un échange — 21 octobre 2026

Le formulaire de suivi des devis permet maintenant d’enregistrer seulement le
responsable, la prochaine action, son échéance et sa précision. La case
« Consigner un échange effectué » est décochée à chaque ouverture. Le canal,
le résultat et le compte rendu apparaissent uniquement lorsqu’elle est cochée.

Sans cette option, la requête ne contient pas de champ `contact` : le dernier
échange et les entrées commerciales existantes restent conservés par l’API.
Décocher l’option exclut également un compte rendu saisi puis abandonné. La
confirmation distingue « Suivi enregistré » et « Échange et prochaine action
enregistrés », pour ne pas annoncer une journalisation qui n’a pas eu lieu.

Avec l’option cochée, le résultat reste obligatoire et une demande de modification
exige un compte rendu. Aucun résultat n’est présélectionné. Les contrôles natifs,
le verrou de soumission, les responsables disponibles, la révision serveur et la
protection à la fermeture restent appliqués. Un formulaire intact ne peut pas
être enregistré. Les erreurs et conflits conservent les saisies affichées.

Le contexte utilise le libellé partagé de l’action, qui traite les dates invalides
sans les formater directement. La modification n’ajoute aucune route, permission
ou persistance : l’API autorisait déjà un suivi sans échange commercial. Le statut
du dossier, le devis, les réservations et la facturation restent inchangés.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis.
Parcours navigateur avec écritures
uniquement dans une base SQLite temporaire : suivi seul, conservation du dernier
contact, opt-in, champs obligatoires, décochage sans journalisation, double clic,
erreur réseau, conflit concurrent, fermeture confirmée et enregistrement explicite
d’un échange de recette. Vérification visuelle sur ordinateur, mobile et sombre.
Aucun e-mail ni facture réels ; devis et statut préservés.

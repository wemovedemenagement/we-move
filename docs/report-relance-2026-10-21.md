# Reporter une relance sans déclarer d’échange — 21 octobre 2026

Dans le suivi d’un devis, une action « Rappeler » ou « Relancer le client » peut
être reportée depuis un écran réduit à la nouvelle échéance et sa confirmation.
Le bouton est proposé uniquement pour une relance enregistrée sur un dossier
commercial actif. Les saisies en cours doivent d’abord être enregistrées ou
abandonnées explicitement ; elles ne sont pas écrasées par un report rapide.

La date proposée est le lendemain de la plus tardive entre aujourd’hui à Paris
et l’échéance enregistrée. Le serveur exige une date calendaire valide, strictement
postérieure à ces deux repères. Il refuse les dossiers acceptés, terminés ou non
retenus, l’absence de relance et les autres types d’actions. Les dates hors du
format pris en charge ne donnent pas lieu à une proposition invalide.

L’opération utilise la route existante de suivi avec seulement `revision` et
`postponeTo`. Toute charge utile mêlant report et changement de responsable,
d’action, de contact ou de clôture est refusée. Le contrôle de révision et la
transaction existante protègent les modifications concurrentes. Le report
conserve l’action, sa précision, l’affectation et le dernier échange. Il incrémente
la révision et ajoute à l’historique une entrée avec l’ancienne et la nouvelle date.
Il ne termine pas la tâche et ne modifie ni le devis ni le statut du dossier.

L’interface bloque les doubles clics. Une erreur conserve la date choisie ; la
consultation puis la reprise du suivi restent disponibles après un conflit.
Reprendre la version enregistrée demande confirmation si un report est en cours.
Annuler le report revient au formulaire sans écrire. La fermeture garde sa
confirmation d’abandon. Le message final distingue un report d’un échange ou
d’une action terminée et indique la date effectivement renvoyée par le serveur.

Validation : TypeScript, compilation et 62 contrôles de livraison réussis.
Le nouveau contrôle permanent couvre les limites calendaires, le jour à Paris,
les charges utiles mixtes, l’accès privé, la concurrence, l’historique unique et
la conservation des autres données. Parcours navigateur isolé : saisie protégée,
date requise et minimale, confirmation, annulation, panne réseau, conflit et
reprise, double clic et mobile/sombre. Les parcours existants de suivi seul,
d’échange explicite et de tâche terminée restent valides. Aucun e-mail ni facture réel.

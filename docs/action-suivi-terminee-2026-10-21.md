# Terminer une action depuis le suivi du devis — 21 octobre 2026

Le formulaire de suivi commercial propose « Marquer l’action comme terminée »
uniquement lorsqu’une action est déjà enregistrée. Ce bouton est distinct de
l’enregistrement d’un échange et de la sauvegarde du suivi. Une explication
précise qu’il ne clôture pas le dossier et ne journalise pas de contact client.

La requête utilise l’API existante avec seulement `revision` et `complete: true`.
Le serveur retire la prochaine action, incrémente la révision du suivi et ajoute
une entrée dans l’historique. Le responsable, le dernier échange, le statut du
dossier et le devis sont conservés. Aucun nouvel endpoint ni droit n’est ajouté.

Le bouton est bloqué pendant le chargement des responsables, en cas d’erreur de
lecture, pendant l’écriture ou lorsque le formulaire contient des modifications.
Dans ce dernier cas, une indication demande de les enregistrer d’abord. La garde
du gestionnaire et le verrou synchrone protègent aussi les appels répétés. Une
erreur réseau ou un conflit de révision conserve le formulaire ouvert et ne
présente aucune confirmation de réussite.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis.
Parcours navigateur sur une base
SQLite temporaire : protection des saisies et de l’option d’échange, fermeture
annulée, erreur réseau, modification concurrente, relecture, double clic avec une
seule écriture, historique unique, absence de bouton sans action, conservation du
responsable/dernier échange/statut/devis. Le parcours précédent de suivi seul et
d’échange explicite reste valide. Affichage contrôlé sur ordinateur, mobile et en
mode sombre. Aucun e-mail ni facture de production n’est créé pour ces contrôles.

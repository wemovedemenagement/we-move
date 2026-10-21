# Poursuivre le suivi sans rechercher le client — 21 octobre 2026

Après une sauvegarde du suivi, une confirmation identifie le client et permet
d’ouvrir son dossier. Après avoir terminé une action, « Prévoir la suite » ouvre
le formulaire de suivi du même client. Ces raccourcis restent accessibles même
si le devis sort du filtre « À relancer ». Les filtres ne sont pas réinitialisés.

La confirmation reçoit le focus à sa création. Elle peut être masquée, et reste
présente si l’utilisateur ouvre puis annule le formulaire. Prévoir une suite
ne crée rien : l’utilisateur choisit explicitement l’action et sa date avant de
sauvegarder. Le responsable enregistré est repris ; aucun échange ni résultat
n’est présélectionné. La sauvegarde conserve le contrôle de révision existant.

Les raccourcis utilisent le devis et le dossier disponibles dans les données
actuelles, identifiés par leurs identifiants. Ils sont bloqués en cas d’erreur
de lecture ou de dossier/devis indisponible. Le suivi commercial ne s’ouvre pas
si le dossier est désormais accepté, terminé ou non retenu. Aucun nouvel endpoint,
stockage persistant ni changement de permissions.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis.
Parcours navigateur sur SQLite temporaire : retrait de la ligne filtrée, focus,
ouverture sans écriture, fermeture conservant les raccourcis, erreur de lecture
bloquante puis reprise, création d’une nouvelle action avec la bonne révision et
ouverture du dossier. Le devis, le statut et le dernier échange sont conservés.
Affichage contrôlé sur ordinateur, mobile et sombre ; aucun envoi ni facture réel.

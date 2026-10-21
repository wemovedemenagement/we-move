# Retrouver les devis à traiter en premier — 21 octobre 2026

La liste des devis utilise par défaut le tri « Priorité de suivi ». Les tris
par modification, nom et montant restent disponibles, ainsi que les filtres
et la pagination existants. Aucun compteur ni bouton supplémentaire n’est ajouté.

Les dossiers commerciaux actifs passent dans cet ordre : envoi refusé ou à
vérifier, rappel/relance arrivé à échéance, validité dépassée, version transmise
sans prochaine action, devis à chiffrer, proposition non transmise, puis autres
suivis. Les rappels échus sont classés par échéance, du plus ancien à aujourd’hui.
Les échéances futures ne deviennent pas des retards. Les dates identiques sont
départagées par modification récente, puis identifiant stable.

Les dossiers absents sont placés après les suivis disponibles ; les dossiers
acceptés, effectués et non retenus restent à la fin, même s’ils conservent une
ancienne relance ou un incident d’envoi. Le filtre explicite reste disponible
pour rechercher ces situations dans l’historique.

Une date d’action absente, invalide ou non normalisée est affichée comme
« Échéance à préciser ». Elle ne compte pas comme une relance échue. La date de
validité n’est priorisée que si elle est valide et strictement antérieure à la
date du jour de Paris. Une modification depuis l’envoi ne devient pas une
version transmise. Une visite échue n’est pas requalifiée en relance commerciale.

Le calcul est en lecture seule : aucune création de tâche, journalisation de
contact, modification de statut ou transmission d’e-mail. L’action « Suivi »
conserve le formulaire existant et sa demande de résultat réellement constaté.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis ;
tests de classement et de suivi étendus pour les dates invalides,
révisions, échéances, dossiers clos/absents, ordre stable et absence de mutation.
Parcours navigateur sur onze dossiers temporaires avec pagination, tris manuels,
filtres, accès au suivi prérempli et contrôles ordinateur/mobile/thème sombre.
Aucune mutation API, aucun courrier ni facture réels pendant cette recette.

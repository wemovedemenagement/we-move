# Moyens sélectionnés à vérifier

La fiche déménagement rassemble les contraintes des moyens sélectionnés dans un
récapitulatif placé au début de la section « Équipe et moyens ». Il remplace les
anciens avertissements génériques et les boutons non nominatifs de retrait des
ressources absentes.

Chaque ligne indique la ressource, le motif et une action explicite de retrait de
la sélection : réservation sur le créneau, indisponibilité, désactivation ou absence
du dernier registre reçu. Une ressource historique absente utilise son nom conservé
dans la réservation lorsqu’il existe, et sa référence reste visible. Une sélection
dupliquée ne produit pas plusieurs lignes.

Les filtres de recherche et de disponibilité ne masquent pas ce récapitulatif.
Le pied de formulaire explique pourquoi l’enregistrement est indisponible et
permet de revenir directement aux moyens à vérifier.

Retirer une ressource ne réserve ni ne libère rien immédiatement. Les changements
restent dans le formulaire jusqu’à l’enregistrement explicite de la mission.
Les contrôles transactionnels existants du serveur continuent de vérifier les
conflits lors de cet enregistrement.

Une lecture en échec conserve les dates et la sélection. Les états de disponibilité
ne sont pas présentés comme actualisés : les contraintes connues ne sont recalculées
comme telles qu’après lecture réussie. Les ressources absentes du dernier registre
reçu restent identifiables et retirables sans être déclarées indisponibles ou libres.
La propre réservation de la mission est exclue des conflits, les autres missions
et indisponibilités sont conservées.

## Vérifications

- Typage, compilation et 55 suites de livraison réussis.
- Suite pure `scripts/test-mission-selection.mjs` : sélection ciblée, propre mission,
  noms historiques, doublons, bornes adjacentes, réservation annulée, dates invalides,
  données anciennes et absence de mutation.
- Typage et compilation relancés après regroupement des anciens avertissements.
- Recette Chrome isolée : trois moyens à vérifier malgré les filtres, panne de
  lecture puis nouvel essai avec dates conservées, retrait d’une ressource historique,
  remplacement explicite, aucune réservation modifiée avant enregistrement,
  sauvegarde du seul dossier concerné, autre mission inchangée, mobile à 390 px
  et thème sombre.

La recette utilise exclusivement des données de test et une base SQLite temporaire.
L’absence d’une ancienne ressource est simulée dans la réponse de lecture du registre.
Aucune donnée de production ni réservation client n’est modifiée par les essais.
Aucun e-mail n’est envoyé et la facturation réelle reste désactivée.

# Priorité À planifier : une seule lecture vérifiée

Le tableau de bord charge son planning dans `useCrmPlanningSnapshot`. Cette lecture unique alimente le compteur « À planifier », sa sélection dans la liste de travail et les panneaux opérationnels existants. Aucun panneau supplémentaire ni requête par compteur n'est ajouté.

La réponse est liée à la liste de dossiers ayant déclenché la lecture. Pendant une actualisation, après une erreur ou en cas de changement des dossiers, le compteur de planification affiche « — » et sa liste n'affiche pas d'anciennes lignes comme actuelles. Le bouton de nouvelle tentative relance cette même lecture, également utilisée par les panneaux.

Compteur et sélection utilisent `planningQueue` : les réservations actives valides sont reconnues même sans date historique, les annulations sont à replanifier, les anciennes dates sans réservation sont à confirmer et les comptes rendus existants sont exclus.

Les lignes de la priorité proposent directement la réservation du créneau. Leurs dates souhaitées restent du contexte, sans badge « En retard » ou « Aujourd'hui » d'une action de suivi. Le filtre d'échéance de suivi est désactivé pour cette sélection ; les dates souhaitées disposent de leur filtre dans « Réservations à organiser ». La recherche et le responsable restent disponibles. Les autres priorités conservent leurs règles de suivi.

Un clic sur une priorité affiche et place le focus sur sa liste de travail. La navigation ouvre la section créneau de la mission. Aucune sauvegarde ni réservation n'est déclenchée par le compteur.

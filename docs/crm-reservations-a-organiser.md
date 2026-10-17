# Réservations à organiser

Cette file remplace les anciennes listes du planning fondées uniquement sur `scheduledTime`. Elle est aussi accessible dans le tableau de bord. Les deux emplacements réutilisent leur lecture du planning, sans requête supplémentaire.

Seuls les dossiers acceptés sans réservation active aux dates valides sont présentés. Une réservation réelle est prioritaire, même si le champ historique `scheduledTime` est vide. Les réservations annulées, les anciennes dates sans réservation et les créneaux enregistrés invalides sont distingués. Un compte rendu existant exclut le dossier de la file. Aucun statut ne change automatiquement.

Les filtres portent sur situation, date souhaitée, responsable et recherche sans accents. Le tri place les dates souhaitées passées en premier, puis aujourd'hui, les six jours suivants, les dates plus lointaines et les dossiers sans date. Une date souhaitée passée est à reconfirmer ; elle n'est jamais présentée comme une réservation en retard. Les anciennes dates ne sont pas utilisées comme une nouvelle demande du client.

Les cartes affichent les villes, la date souhaitée et son caractère flexible s'il est renseigné, le responsable et une action directe vers le créneau de la mission. Six cartes sont affichées, puis « Afficher plus ». Le nombre de dossiers et les résultats sont masqués en cas d'erreur ou d'actualisation en cours.

La réservation demeure explicite : choix du début et de la fin, affectation des moyens disponibles, puis enregistrement. La sauvegarde existante contrôle à nouveau droits, dates, ressources, absences, conflits et version de la mission. Une fois la réservation enregistrée, le dossier sort de la file après actualisation. Aucun mail ni facture n'est créé par cette vue.

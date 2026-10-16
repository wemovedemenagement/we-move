# Liste des pièces à réunir

La liste est accessible depuis « Vos prochains départs » du tableau de bord et depuis les déménagements. Elle réunit les dossiers acceptés dont au moins une pièce est manquante ou rattachée à une ancienne version acceptée. Les dossiers non planifiés restent visibles, indépendamment de la période du calendrier. Les dossiers terminés, non retenus et les missions clôturées sont exclus : leur suivi après prestation conserve ses propres écrans.

La priorité vient uniquement d'une réservation active : créneau passé à vérifier, créneau ayant commencé un jour précédent, départ du jour, puis les sept jours calendaires incluant le jour courant. La borne supérieure est exclue. Les souhaits de date du client et les anciennes affectations sans réservation ne créent pas de priorité confirmée. Une réservation annulée laisse le dossier accepté dans les éléments à planifier. Le CRM ne déduit jamais la réalisation effective d'une mission de sa seule date.

Les filtres par pièce et état s'appliquent à la même pièce. La recherche ignore accents et casse ; les filtres de responsable utilisent l'affectation réelle du dossier. Les compteurs sont en dossiers et peuvent se recouper lorsqu'un dossier a une pièce manquante et une autre à revérifier. L'affichage se fait par huit résultats, avec « Afficher plus ».

Le bouton « Vérifier les pièces » ouvre directement la section correspondante de la fiche déménagement. Le même raccourci est disponible dans le résumé du dossier. Les contrôles de rôle, de saisie non enregistrée et de concurrence du formulaire restent inchangés. Aucune réception, échéance, relance, réservation ou émission de document n'est créée en consultant la liste.

Les vues partagent `documentQueue` et `documentChecklistDetails`. Le tableau de bord réutilise la lecture de planning déjà faite et son lien avec l'instantané des dossiers. En cas de chargement ou d'erreur, aucun compteur ni résultat n'est présenté comme vérifié. Aucune modification de base, de règles Firebase ou d'index n'est nécessaire.

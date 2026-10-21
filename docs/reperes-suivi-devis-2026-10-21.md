# Une prochaine action lisible dans les devis — 21 octobre 2026

La liste sépare désormais le statut de la proposition et le suivi à effectuer.
Le texte d’action quitte la cellule « Statut » et apparaît dans un repère compact
au-dessus des boutons, sous l’intitulé « Suivi et actions ». Le tableau conserve
ses cinq colonnes et sa présentation en cartes sur mobile.

Le repère indique l’action enregistrée, son échéance et son responsable. Les
mentions « En retard », « Aujourd’hui », « À venir » et « Date à préciser »
accompagnent la couleur : l’information ne dépend pas uniquement de celle-ci.
Une date HTML `time` conserve sa valeur normalisée et son affichage français.
Le calcul utilise le jour de Paris déjà employé par le suivi.

Une version transmise sans prochaine action affiche « À définir ». Un brouillon
sans suivi ne reçoit aucune tâche fictive. Les dossiers acceptés, effectués,
non retenus ou absents ne présentent pas d’ancienne action comme travail à faire.
Une échéance invalide reste à préciser et n’est pas requalifiée en retard.

Le nom du responsable provient de l’affectation du dossier. Sans identifiant,
le repère affiche « Non attribué » ; avec identifiant mais sans nom disponible,
« Responsable à vérifier ». Il ne déduit pas une affectation d’un ancien nom
isolé et ne certifie pas l’activité actuelle d’un compte.

La modification reste en lecture seule. Aucun bouton supplémentaire, envoi,
changement de statut ni création d’échange. Les filtres, le tri par priorité et
le formulaire existant de suivi sont conservés.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis ;
tests de suivi étendus pour les états temporels, les responsables,
les dates invalides, les dossiers clos et l’absence d’action inventée. Parcours
navigateur sur onze dossiers temporaires : repères, échéances, affectation,
tris, pagination, filtres et ouverture du suivi prérempli sans contact fictif.
Contrôle visuel sur ordinateur, mobile et thème sombre ; aucune mutation API.

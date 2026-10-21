# Retrouver les devis par échéance et responsable — 21 octobre 2026

La liste des devis propose des accès directs pour la prochaine action : Toutes,
En retard, Aujourd’hui, À venir et À définir. Les échéances reposent sur le modèle
de suivi existant, avec des dates calendaires valides et le jour courant à Paris.
Les boutons couvrent tous les types d’actions enregistrées, dont les visites ;
le filtre commercial « À relancer » conserve son périmètre existant.

« À définir » regroupe les devis transmis dans leur version actuelle et sans
prochaine action, ainsi que les actions dont la date est absente ou invalide.
Un brouillon sans tâche n’acquiert aucune échéance fictive. Les dossiers acceptés,
terminés, non retenus ou absents sont exclus des échéances actives.

Le panneau Filtres permet de choisir un responsable enregistré ou « Non attribué ».
Les options sont déduites des identifiants réellement présents sur les dossiers
liés aux devis ; aucun utilisateur n’est inventé. Un identifiant sans nom affiche
« Responsable à vérifier ». Un dossier indisponible n’est pas assimilé à un dossier
non attribué.

Les nouveaux filtres se combinent avec la recherche, le statut, la formule, la
source et les dates de modification. Changer l’échéance ou le responsable ramène
à la première page. La réinitialisation les efface, sans changer le tri choisi.
Ils sont bloqués en cas d’indisponibilité des données et conservés à la reprise.
Aucune nouvelle route, écriture, notification ou modification de permissions.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis.
Parcours navigateur isolé sur
treize cas de recette : échéances passées/du jour/futures/invalides, absence de
tâche, anciennes versions envoyées, dossiers clos/absents, responsables connus,
inconnus et non attribués, combinaisons des filtres, pagination et réinitialisation.
Erreur de lecture puis reprise vérifiées. Affichage contrôlé sur ordinateur,
mobile et sombre. Aucune mutation API ni modification des données SQLite de recette.

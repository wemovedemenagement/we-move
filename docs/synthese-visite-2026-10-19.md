# Synthèse de visite pour la préparation du déménagement

La fiche déménagement présente une synthèse repliable issue du dossier chargé
par l’API. Elle réunit le format, la date et le statut enregistrés de la visite,
les deux adresses et leurs accès, l’inventaire regroupé par pièce, les observations
et les champs restant à confirmer. En cas d’échec du chargement du dossier,
aucune ancienne synthèse n’est présentée comme une lecture actualisée.

Le volume retenu au dossier est affiché séparément de l’estimation de l’inventaire.
Un volume marqué inconnu reste à confirmer même si une ancienne valeur existe.
Un inventaire vide est indiqué comme non renseigné, sans annoncer zéro m³.
Les étages et portages renseignés à zéro sont conservés. Les données absentes
ne sont pas transformées en réponses négatives. Les contrôles ne constituent
pas une validation générale de la préparation ou du contrat.

La copie produit du texte brut à partir des seules données enregistrées.
L’utilisateur choisit ensuite son éventuel destinataire. Aucun envoi, changement
de statut ou enregistrement n’est déclenché par cette action. Si le presse-papiers
est indisponible, une zone de texte en lecture seule permet la sélection manuelle.
Le retour de copie est associé au dossier et au contenu copiés pour éviter
d’afficher un succès pour une autre synthèse après une réponse asynchrone.

Les conditions contractuelles restent celles du devis accepté. La synthèse ne
réécrit ni les montants, ni les prestations, ni les documents déjà enregistrés.

## Vérifications

- Typage, compilation et 57 suites de livraison réussis, dont
  `scripts/test-visit-report.mjs`.
- Contrôle des volumes distincts, quantités, regroupements, valeurs zéro,
  inconnus explicites, date locale et absence de mutation.
- Recette Chrome isolée : copie réussie puis refusée, texte sélectionnable,
  points manquants, affichage 390 px, thème sombre et absence d’erreur JavaScript.
- Dossier identique après consultation et copie ; aucun e-mail envoyé.

La recette utilise une base SQLite temporaire. Aucune donnée de test n’est
insérée en production. La facturation réelle et la double authentification ne
sont pas activées par cette livraison.

# Fiche terrain de la mission

La fiche déménagement comporte deux vues : Organisation et Terrain. La vue
Organisation conserve les formulaires existants. Terrain présente les données
enregistrées du dossier et de la réservation sans créer de nouveau stockage.
Changer de vue conserve les saisies en cours ; un message distingue celles-ci
des informations sauvegardées affichées sur le terrain.

## Informations disponibles

- Début et fin de réservation en horaires de Paris, sans conversion UTC.
- État explicite : non planifiée, planifiée, annulée ou clôturée. Une date
  souhaitée ou une ancienne date isolée ne devient jamais une réservation.
- Client, appel téléphonique, deux adresses et liens Google Maps volontaires.
- Étages, ascenseurs, portages, notes d’accès, contacts sur place et digicodes.
- Équipe et moyens affectés avec leurs noms enregistrés. Les moyens absents
  ou désactivés dans le registre actuel sont signalés ; la vue ne certifie pas
  leur disponibilité ou l’absence de conflit.
- Stationnements, matériel, consignes et précisions du client.
- Formule, répartition des prestations et synthèse de visite repliables.

Les observations de visite sont prioritaires pour les accès. Une observation
explicitement vide reste à confirmer plutôt que d’être remplacée silencieusement
par une ancienne valeur du devis. La provenance est visible. Les valeurs zéro
restent renseignées. Le volume inconnu demeure à confirmer.

Les contacts et prestations du devis accepté sont conservés distinctement du
dossier courant. À défaut d’accord, les informations du devis de travail sont
marquées « à confirmer ». Une copie acceptée indisponible n’est pas remplacée
par un brouillon. Le contrôle existant des écarts reste accessible dans
Organisation. Aucun prix ou document contractuel n’est modifié.

Les liens téléphoniques n’acceptent que des chiffres et un éventuel préfixe +.
Les liens de carte suivent le format officiel Google Maps URLs avec `api=1`
et destination encodée. Une adresse absente ou un lien dépassant 2 048 caractères
ne produit pas de bouton. La carte s’ouvre dans un autre onglet pour conserver
le CRM, sans référent. Elle ne remplace pas le contrôle des restrictions du camion.
Documentation : https://developers.google.com/maps/documentation/urls/get-started

## Vérifications

- Typage, compilation et 58 suites isolées, dont `test-mission-field-sheet.mjs`.
- Sources, inconnus, zéros, réservation réelle, moyens historiques, liens
  téléphoniques, adresses encodées, annulation, clôture et absence de mutation.
- Chrome isolé : navigation entre vues, saisie conservée, consigne non enregistrée
  exclue du terrain, liens d’appel et d’itinéraire, provenance du devis, mobile
  390 px, thème sombre et échec de lecture sans ancienne fiche affichée.
- Dossier, devis et réservation inchangés après consultation. Aucun envoi.

Les données de recette sont dans une base SQLite temporaire. Aucun accès
supplémentaire, espace client ou activation de facturation réelle n’est ajouté.

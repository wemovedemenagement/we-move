# Rapprochement du dossier avant départ

La fiche déménagement présente les écarts entre le devis accepté et les
informations du dossier sous forme de valeurs côte à côte. Les différences
restent consultatives : aucune donnée ni condition contractuelle n’est modifiée
automatiquement et aucun état « mission prête » n’est déduit de cette comparaison.

Les rubriques comparées sont la version du devis, les deux adresses, le volume,
la formule connue au dossier, ainsi que les étages, ascenseurs, portages et
consignes d’accès renseignés. Les observations de visite utilisent les mêmes
règles de préremplissage que les nouveaux devis : elles priment sur les anciens
champs d’accès du formulaire public.

Une saisie absente ne signifie ni « Non » ni zéro et n’écrase pas le contrat.
Le portage renseigné à zéro reste une valeur connue. Les espaces et écritures
numériques équivalentes ne déclenchent pas d’écart. Une formule à conseiller
ne déclenche pas une fausse comparaison avec une formule contractuelle connue.

La date de départ affichée dans la comparaison provient de la réservation
actuelle. Les réservations annulées ou clôturées sont exclues. L’absence de
réservation ne transforme pas une ancienne date du dossier en créneau actif.
L’ancienne fonction de messages conserve sa compatibilité pour ses appels
sans réservation explicite.

Les actions sont regroupées par destination : devis, dossier, visite et créneau.
Elles respectent les protections de saisie existantes de la fiche. Les périodes
sont affichées au format français ; les valeurs s’empilent sur mobile et
utilisent les couleurs du thème CRM.

## Vérifications

- Typage, compilation et 54 suites de livraison réussis.
- Nouvelle suite pure `scripts/test-mission-handover.mjs` : valeurs comparées,
  zéro, observations absentes, normalisation, priorité du relevé, formules,
  périodes inclusives, réservations réelles, annulations, corrections ciblées,
  absence de mutation des données et compatibilité des anciens messages.
- Compilation et contrôle ciblé relancés après le formatage français des dates.
- Recette Chrome isolée : valeurs du devis et du relevé, ouverture de la visite,
  focus sur le créneau, saisie non enregistrée conservée, largeur de 390 px,
  thème sombre et copie du devis accepté inchangée.

Les essais utilisent des données isolées dans une base SQLite temporaire.
Aucun e-mail ni document de facturation de production n’est créé. Aucun réglage
de sécurité, de facturation ou de double authentification n’est modifié.

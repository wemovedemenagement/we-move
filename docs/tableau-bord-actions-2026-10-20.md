# Tableau de bord : actions du jour et raccourcis contextuels

La liste de travail s’ouvre sur « À faire maintenant » : dossiers en retard,
actions du jour et dossiers actifs sans échéance. Les suivis après mission sans
échéance connue restent visibles. Les dossiers terminés sans suivi ouvert et
les actions dont l’échéance principale est future sont consultables dans
« Tout voir ». Aucun dossier n’est archivé ou modifié par le choix de vue.

Les compteurs des deux vues tiennent compte de la recherche, du responsable et
du filtre d’échéance courants. Sélectionner une échéance « À venir » bascule sur
« Tout voir ». Les tuiles de catégorie ouvrent toute leur sélection, y compris
les échéances futures, et « Tous les dossiers » réinitialise les filtres. La
catégorie À planifier conserve son contrôle sur le planning effectivement chargé.

## Action principale selon le contexte

- « Visites aujourd’hui » présente la visite concernée, avec ses horaires, dans
  l’ordre des créneaux. Son bouton ouvre directement le formulaire de visite,
  même si une autre prochaine action est enregistrée dans le dossier.
- Dans les vues générales ou urgentes, une visite prévue aujourd’hui ressort
  devant une action future du même dossier. Une action déjà en retard ou du jour
  garde sa priorité générale. Le rappel enregistré n’est ni effacé ni déplacé :
  il reste consultable dans la fiche du dossier.
- Une action après déménagement ouvre directement le compte rendu de fin de
  mission plutôt que le début de la fiche déménagement.
- Les accès à la facturation conservent le comportement existant lié au rôle.

Un suivi après mission ancien, sans échéance valide, est affiché « Sans échéance »
avec une date à préciser ; il n’invente pas de retard et ne fait plus échouer la
lecture du tableau de bord. Un responsable vide reste non attribué. Une ancienne
action composée uniquement d’espaces ne devient pas un suivi ouvert.

Les recommandations sont des projections de lecture. Aucune visite n’est marquée
effectuée, aucun suivi n’est terminé et aucune facture n’est créée par une
navigation depuis le tableau de bord.

## Vérifications

- 60 suites de livraison réussies ; tests enrichis dans
  `test-crm-work-priorities.mjs` et `test-crm-aftercare.mjs`.
- Visites contextualisées et ordonnées, action enregistrée conservée, vue du jour,
  dossiers terminés et futurs accessibles, suivis sans date, responsables et
  absence de mutation.
- Compilation finale après rapprochement des priorités générales et des visites
  du jour, puis recette Chrome isolée : visite avec rappel futur, compte rendu
  direct, filtres, échéances futures, responsable non attribué, échec de planning
  masquant les réservations non vérifiées, mobile 390 px et thème sombre.
- Dossiers et réservations inchangés après navigation, aucun e-mail ni document
  comptable créé. Les données historiques sont simulées uniquement dans une
  réponse API du navigateur de recette, sur une base SQLite temporaire.

La facturation réelle, la double authentification et les permissions cloud ne
sont pas activées ou modifiées par cette livraison.

# Consulter le dossier pendant le devis — 20 octobre 2026

L’éditeur propose un volet « Dossier client », replié par défaut et disponible
à chacune des étapes. Il charge à l’ouverture les données enregistrées du dossier
par l’API déjà utilisée par la fiche client. Il ne prend pas les champs du devis
en cours comme source de la demande et ne synchronise pas automatiquement les
corrections entre les deux.

Le volet présente les coordonnées, les deux adresses complètes, le volume connu
ou « À estimer », la date souhaitée, la formule souhaitée, les besoins indiqués
et la note de la demande. Le relevé enregistré de visite reste dans sa propre
rubrique repliable, avec son statut réel, ses accès et son inventaire. L’absence
de relevé est explicite et ne devient pas une visite effectuée.

- Aucun chargement du dossier avant ouverture du volet.
- Actualisation et réouverture lisent le dossier côté serveur. L’heure de lecture
  est affichée ; ce n’est pas une promesse de synchronisation continue.
- En cas d’échec, les données précédentes sont masquées et une nouvelle lecture
  est proposée. Les saisies du devis restent conservées.
- Une réponse dont l’identifiant ne correspond pas au devis n’est pas affichée.
  Les résultats reçus après démontage du composant ne sont pas appliqués à un
  autre dossier.
- La consultation est hors du formulaire d’édition : navigation, repli, copie de
  synthèse ou actualisation ne rendent pas le devis modifié.
- Les liens téléphone utilisent le format déjà employé sur la fiche terrain ;
  l’adresse e-mail du lien est encodée. Aucun message n’est envoyé par le CRM.

Le volet ajoute une lecture seule. Il n’introduit aucune route, donnée persistée,
permission, import automatique ou réécriture de devis/PDF. La sauvegarde et les
confirmations de fermeture de l’éditeur restent indépendantes.

## Vérifications

Recette Chrome isolée : chargement à la demande, relevé programmé et valeurs zéro,
nom/prix saisis conservés, erreur de lecture sans ancienne fiche, volume inconnu,
identifiant incohérent, réponse tardive après changement de dossier, absence de
relevé, mobile et thème sombre. Les fixtures restent en SQLite temporaire avec
notifications et facturation réelle désactivées.

TypeScript, compilation finale, 61 suites de livraison et recette Chrome réussis.

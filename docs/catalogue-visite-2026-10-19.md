# Inventaire de visite assisté par le catalogue WE MOVE

Le formulaire de visite propose un catalogue repliable des biens courants,
alimenté par `INVENTORY_ITEMS`, la même source que le calculateur du site public.
Les volumes restent des références indicatives à ajuster au bien observé.

Sans recherche, les résultats correspondent à la pièce choisie. Une recherche
par mots couvre le catalogue complet, sans distinction de casse ou d’accent.
L’ajout se fait toujours dans la pièce explicitement choisie par l’utilisateur.
Les résultats sont affichés progressivement ; une ligne personnalisée reste possible.

Un nouvel ajout du même bien, dans la même pièce et au même volume unitaire,
augmente sa quantité. Une ligne dont le volume a été ajusté reste intacte : le
nouvel ajout utilise une ligne distincte. Le compteur du catalogue tient compte
de toutes les lignes portant ce nom dans la pièce, même si leurs volumes diffèrent.

L’utilisateur peut enchaîner les ajouts sans déplacement automatique de la vue,
puis rejoindre la première ligne de la pièce pour vérifier quantité et volume.
Les limites de 150 lignes et 500 unités par ligne sont conservées. Les actions
de recherche et de choix de pièce ne constituent pas une modification du relevé.

Les ajouts restent dans le formulaire jusqu’à l’enregistrement de la visite.
Le volume du dossier n’est appliqué que si l’option existante est cochée. Les
devis déjà enregistrés ne sont pas réécrits. Aucun nouveau champ ou stockage
n’est ajouté au dossier et aucun service externe d’estimation n’est appelé.

## Vérifications

- Typage, compilation et 56 suites de livraison réussis.
- Suite `scripts/test-visit-catalogue.mjs` : recherche, pièce choisie, quantités,
  volumes ajustés conservés, limites, validation du relevé et absence de mutation.
- Recette Chrome isolée : ajouts répétés, deux pièces, volume manuel conservé,
  compteur, recherche avec accents, résultat vide, sauvegarde explicite, volume
  du dossier inchangé sans option puis application explicite, devis inchangé,
  largeur de 390 px et thème sombre.
- Compilation et captures finales après correction de l’espacement de recherche.

Tous les essais utilisent une base SQLite temporaire et des données isolées.
Aucun e-mail ni document comptable n’est envoyé ou créé en production. La
facturation réelle et la double authentification ne sont pas activées.

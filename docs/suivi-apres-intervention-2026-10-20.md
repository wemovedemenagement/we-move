# Suivi après intervention

Dans Déménagements, le bloc « Après la mission » distingue les réserves et
incidents, les documents et les autres suivis. Ces motifs proviennent du compte
rendu enregistré. Un même suivi peut relever de plusieurs motifs ; filtrer par
documents ne masque pas une action qui comporte aussi une réserve.

Une lettre de voiture n’est présentée comme à récupérer que si sa réception est
explicitement enregistrée à `false`. Une ancienne donnée sans indicateur de
réception ne devient pas une déclaration de document manquant. Les textes des
réserves et des pièces manquantes sont consultables dans chaque carte repliable.

La recherche couvre les noms enregistrés et actuels du client, la référence du
dossier, l’action, le responsable, les réserves, les documents et les adresses.
Elle ignore la casse et les accents. Les cartes affichent uniquement les villes
de départ et d’arrivée ; les adresses complètes restent dans le dossier.

Les compteurs d’échéance portent sur les suivis ouverts dans la sélection
courante de motif, de responsable et de recherche. Ils ne dépendent pas du filtre
d’échéance afin de permettre de changer de priorité. « À compléter » signale
l’absence de responsable ou d’échéance valide ; ce compteur peut recouper une
échéance en retard, ce qui est expliqué dans l’interface.

Une échéance absente ou invalide est affichée comme à préciser, sans inventer
une date ni un retard. Le responsable vide est affiché comme non attribué et
peut être filtré. Le tri conserve les retards, le jour courant, les suivis sans
échéance puis les suivis à venir. Les actions traitées restent consultables ;
leurs observations d’origine ne sont ni effacées ni présentées comme de nouveaux
incidents ouverts.

L’utilisateur peut appeler un numéro valide ou rejoindre directement le compte
rendu pour traiter l’action. Les filtres, la recherche et les appels ne marquent
jamais une action comme traitée. Le bloc reste indépendant des filtres et de la
période du calendrier. Les cartes sont affichées par huit puis progressivement.
Un échec de lecture retire les anciennes cartes jusqu’à une nouvelle lecture
réussie ; les filtres restent conservés.

## Vérifications

- Typage, compilation et 60 suites de livraison réussis.
- `test-aftercare-queue.mjs` enrichi : motifs croisés, recherche des textes du
  retour, responsables vides, dates absentes ou invalides, réception inconnue,
  filtres combinés, suivis traités, annulations et absence de mutation.
- Chrome isolé : dix comptes rendus en SQLite temporaire, affichage progressif,
  recherche avec accents et casse, motifs, compteurs, responsables, dates à
  préciser, bouton d’appel, ouverture du compte rendu, échec puis reprise de
  lecture, mobile 390 px et thème sombre.
- Les données historiques incomplètes sont simulées uniquement dans la réponse
  de planning du navigateur de recette. Aucun enregistrement de test ne touche
  Firestore de production.
- Dossiers et planning identiques après consultation ; aucun e-mail ni document
  comptable créé. Aucune permission ou activation de facturation n’est modifiée.

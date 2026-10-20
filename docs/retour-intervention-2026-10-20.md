# Retour d’intervention guidé

La fiche Terrain propose un accès direct au retour d’intervention. Il rejoint
le formulaire existant dans Organisation et ouvre son panneau. Une mission
déjà terminée propose la consultation et la correction du compte rendu enregistré.

Le formulaire est organisé en trois parties :

1. Horaires constatés : réservation affichée à titre de repère, sans recopier
   ses horaires dans les champs réels. La fin doit suivre le début et ne peut
   pas être future. Les heures sont exprimées en horaires de Paris.
2. Retour terrain : observations facultatives, réception de la lettre de voiture
   signée et panneau pour les réserves, incidents ou documents manquants. Refermer
   un panneau ne supprime pas ses données.
3. Suite à donner : les motifs imposant un suivi sont nommés. Sans motif ni suivi
   saisi, cette partie peut rester repliée. Une action implique un responsable
   et une échéance. Un responsable ou une échéance isolés sont signalés avant
   envoi afin d’éviter leur effacement silencieux par la normalisation serveur.

La réception de la lettre est une déclaration de réception ; aucun téléversement
ou document signé n’est créé par la case à cocher. Un texte de réserve vide ne
constitue pas une certification générale d’absence d’incident.

Les erreurs de saisie sont présentées avant l’appel serveur avec un accès au
champ concerné. Les validations de droits, de révision et de contenu restent
sur le serveur, inchangées. Un échec d’enregistrement conserve la saisie et un
verrou local évite les soumissions simultanées du formulaire.

Après sauvegarde, le formulaire reprend le compte rendu normalisé renvoyé par
le serveur et utilise la révision actualisée pour les corrections suivantes.
Modifier l’action, son responsable, son échéance, les réserves, les documents
manquants ou la réception de la lettre remet le suivi en attente. Une correction
d’observation seule ne remet pas une action traitée en attente.

La première sauvegarde termine le dossier selon le fonctionnement métier déjà
en place. Le bouton annonce cet effet. Elle n’envoie aucun e-mail et ne prépare
ni n’émet automatiquement une facture.

## Vérifications

- 60 suites de livraison, avec `test-closure-guidance.mjs` : horaires de Paris
  hiver/été, ordre des dates, dates futures, motifs de suivi, responsable et
  échéance, prévention des champs orphelins, remise en attente et non-mutation.
- Chrome sur base SQLite temporaire : accès Terrain, horaires vides initialement,
  corrections ciblées sans requête, erreur réseau conservant la saisie, clôture
  et corrections persistées, nouvelles révisions, remise en attente, réouverture,
  mobile 390 px et thème sombre.
- Devis et ressources inchangés ; aucun e-mail ou document comptable créé.
- Compilation et contrôle visuel finaux après ajustement des aides de champ et
  des attributs d’accessibilité des champs en erreur.

Aucune donnée de recette n’est inscrite dans Firestore de production. La
facturation réelle et la double authentification ne sont pas activées.

# Premier contact depuis la fiche demande — 20 octobre 2026

La rubrique « Échanges et suivi » regroupe les coordonnées du client, le dernier
échange enregistré et la prochaine action. Le bouton « Prendre contact » ouvre
cette rubrique et place le focus sur une coordonnée disponible.

L’utilisateur coche « Consigner un échange effectué » uniquement après une
prise de contact réelle. Il choisit le canal et le résultat constaté, renseigne
un compte rendu facultatif (obligatoire pour des modifications demandées), puis
vérifie le responsable, l’action et son échéance avant d’enregistrer.

- Aucun résultat n’est présélectionné. Ouvrir un lien téléphone ou e-mail ne crée
  ni échange, ni envoi, ni changement de statut.
- La prochaine action existante est reprise dans le formulaire et conservée si
  l’utilisateur ne la modifie pas.
- La modification du suivi seule ne recrée pas d’échange. Le dernier échange et
  l’historique existant restent conservés.
- Le même point d’entrée serveur contrôle les droits, la révision concurrente,
  les responsables autorisés et les valeurs transmises. La date et l’auteur
  proviennent du serveur. Aucun nouveau stockage ni rôle cloud n’est ajouté.
- Les dossiers acceptés, refusés ou terminés restent consultables, mais ne
  proposent pas de consigner un échange commercial dans cette rubrique.
- Une erreur d’enregistrement conserve la saisie ; quitter avec une modification
  demande confirmation. Une liste de responsables indisponible bloque la saisie
  et offre une nouvelle tentative.
- Le numéro d’appel est normalisé avec l’utilitaire déjà employé sur les fiches
  terrain. Un volume explicitement inconnu reste « À estimer » dans le projet.

## Vérifications

Les 60 suites de livraison passent, avec un scénario serveur supplémentaire
sur une demande sans aucun devis : premier échange, prochaine action puis
modification du suivi seule, sans création de devis, e-mail ou facture.
La recette Chrome isolée vérifie le parcours réel, les validations, l’erreur
sans perte, l’annulation, la lecture d’un dossier clos et les vues mobile/sombre.
Les données de recette utilisent uniquement une base SQLite temporaire, avec
notifications et facturation réelle désactivées.

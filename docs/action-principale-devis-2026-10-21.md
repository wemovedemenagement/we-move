# Une action principale selon l’état du devis — 21 octobre 2026

La liste propose désormais un bouton principal par ligne. Le PDF reste visible
et les actions manuelles d’ouverture, de suivi, de dossier et de documents sont
regroupées dans le menu existant. Les informations de prochaine action et de
responsable restent au-dessus du bouton.

La décision suit les données enregistrées :

- Dossier terminé ou non retenu : consulter le dossier.
- Dossier accepté : organiser le déménagement dans la fiche existante.
- Envoi refusé, incertain ou en cours : vérifier l’envoi dans le panneau mail.
- Rappel ou relance échu : ouvrir le suivi commercial existant.
- Informations obligatoires manquantes : compléter le devis directement à
  l’étape du premier point à corriger, selon les contrôles partagés avec l’envoi.
- Version courante transmise : ouvrir le suivi.
- Proposition complète non transmise : préparer l’envoi.
- Dossier absent : conserver l’accès à la version de travail du devis.

Vérifier ou préparer l’envoi déclenche seulement la lecture de sa préparation
et de son historique. La confirmation et le bouton d’envoi restent nécessaires.
L’organisation ouvre la fiche déménagement avec ses lectures, droits, contrôles
d’accord et de réservation existants. Elle ne crée pas de mission ou de nouvelle
réservation au clic et ne suppose pas qu’une ancienne date constitue un créneau.
Les dossiers terminés ne sont pas renvoyés vers une nouvelle planification.

Le bouton principal et le suivi commercial sont désactivés si la lecture des
dossiers ou des devis a échoué. Les données conservées à l’écran ne sont pas
présentées comme une décision actualisée. Le tri, les filtres et la pagination
restent disponibles. Les textes restent lisibles sur mobile et en thème sombre.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis ;
tests de décision étendus pour les versions envoyées, incidents, dossiers clos,
accords, priorités et étapes à corriger. Parcours navigateur avec toutes les
destinations, lecture échouée et récupération, tris, pagination et filtres.
Toutes les mutations API sont interdites dans cette recette : aucun devis,
courrier, échange, réservation ou facture n’est créé par ces navigations.
Contrôle visuel ordinateur, mobile et sombre après ajustement du contraste PDF.

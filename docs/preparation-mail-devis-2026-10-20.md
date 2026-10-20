# Préparer le mail sans modifier le devis — 20 octobre 2026

La rubrique « Documents et envoi » était incluse dans le formulaire du devis.
Les événements de changement de la sélection PDF, de l’objet, du message et de
la confirmation remontaient donc au formulaire, qui marquait le devis comme
modifié et désactivait l’envoi. Une confirmation du mail pouvait elle-même
déclencher ce blocage.

La rubrique reste à l’étape « Vérification », mais se trouve désormais hors du
formulaire d’édition. Les champs du devis conservent leur suivi des modifications.
Les commandes du pied restent associées au formulaire par leur attribut `form`.
Les marges de la rubrique sont adaptées à cette nouvelle position sur ordinateur
et mobile. Les couleurs du panneau mail utilisent les variables du CRM et de
l’éditeur pour garder les textes et les coordonnées lisibles en thème sombre.

- Choisir un document ou personnaliser le mail ne crée pas de version du devis.
- Entrée dans l’objet du mail ne soumet pas le formulaire du devis.
- La confirmation reste nécessaire ; changer ensuite l’objet ou le message
  l’annule, conformément au fonctionnement existant.
- Une vraie modification du devis désactive toujours PDF et envoi jusqu’à son
  enregistrement. Le texte du mail reste présent pendant la navigation entre
  étapes ; l’enregistrement du devis réinitialise la préparation du mail.
- L’envoi conserve la révision courante, le verrou contre le double clic et
  l’historique existant. Aucun mécanisme d’envoi automatique n’est ajouté.

Validation : TypeScript, compilation et 61 contrôles de livraison réussis.
Parcours navigateur isolés pour l’indépendance des champs du mail, la sélection
PDF, la confirmation, Entrée, le blocage sur modification du prix, la sauvegarde
continue, la révision utilisée et le double clic. Vérification visuelle sur
ordinateur, mobile et thème sombre. Le transport e-mail est simulé dans la
recette : aucun courrier réel ni facture, aucune modification en production.

Le premier lancement des contrôles a rencontré un refus réseau du sandbox
(`EACCES` sur une connexion locale). La recette a été relancée avec les accès
loopback nécessaires et ses 61 contrôles ont réussi. Aucun changement de
permissions Firebase, de stockage, de compteur ou d’activation de facturation.

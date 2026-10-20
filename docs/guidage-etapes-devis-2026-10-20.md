# Guidage par étape du devis — 20 octobre 2026

L’éditeur affiche les points à compléter dès les étapes « Client et trajet » et
« Formule et prix ». Les compteurs de navigation et le repère de l’étape se
recalculent à partir du contrôle `quoteReadiness` déjà partagé avec le serveur.
La vérification finale conserve sa liste complète et les contrôles avant envoi.
Aucun prérequis supplémentaire ni pourcentage artificiel n’est introduit.

Un seul prochain point est présenté en premier ; les autres se déplient à la
demande. Chaque bouton ouvre l’étape concernée et les rubriques repliées, puis
place le focus sur le champ à corriger. Le chiffrage vide mène à « Ajouter une
ligne ». Avec des lignes présentes, la correction vise la description, la
quantité ou le prix de la première ligne incomplète ; les taux gardent leurs
cibles dédiées.

Le texte de provenance rappelle que le préremplissage intervient à la création,
puis que la version enregistrée conserve ses corrections. Il ne promet plus
une synchronisation automatique d’un devis existant. La note affichée est celle
actuellement enregistrée dans la demande, sans la présenter comme un original
immuable. Le préremplissage, les formules, prix, accords client et données
persistées ne sont pas modifiés par cette évolution.

La navigation et la consultation des repères ne rendent pas le devis modifié.
Le brouillon incomplet reste enregistrable selon les contrôles existants. Les
messages « Points renseignés » désignent les points contrôlés de l’étape, pas
une approbation du devis ou un accord client. Les saisies restent protégées lors
de la fermeture et l’envoi conserve son étape de confirmation.

## Vérifications

- Compilation et TypeScript ; 61 suites de livraison. Une première exécution a
  dépassé le délai sur le test d’acceptation des devis ; sa relance isolée a
  réussi, puis les 61 contrôles du parcours complet ont également réussi.
- Recette Chrome isolée : mise à jour des compteurs, focus e-mail/adresse,
  formule repliée, ajout de ligne, description, prix, TVA et versement.
- Devis renseigné, protection à la fermeture, données du devis conservées après
  modification de la demande source, valeurs zéro des accès préremplis.
- Mobile 390 px et thème sombre ; aucune mutation des demandes ou devis par la
  navigation, aucun e-mail et aucune facture de production.

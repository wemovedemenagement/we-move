# Consulter les notes du dossier depuis le suivi du devis — 21 octobre 2026

Le suivi commercial propose un panneau « Historique du dossier », replié par
défaut. Il affiche les notes réellement enregistrées, dont les échanges, les
reports et les actions terminées. Chaque entrée conserve son texte, son auteur
et sa date, affichée à l’heure de Paris. Les cinq notes les plus récentes sont
présentées d’abord ; « Afficher plus » révèle les suivantes sans nouvelle requête.

La lecture réutilise la route authentifiée de consultation du dossier. Elle a lieu
à l’ouverture du panneau, à sa réouverture ou sur « Actualiser ». Le dossier reçu
doit correspondre à l’identifiant attendu. Les données absentes ou invalides et
les erreurs de lecture sont distinguées d’un historique réellement vide. Aucun
échange n’est reconstitué depuis le champ « dernier contact ». Un auteur ou un
horodatage manquant reste signalé comme non renseigné.

La lecture reste indépendante de la saisie du suivi et de sa révision. Elle ne
remplit aucun champ, n’adopte pas de nouvelle version et ne contourne pas les
conflits de sauvegarde. Les réponses tardives d’un panneau démonté sont ignorées.
Un verrou bloque les lectures simultanées ; le texte des notes est rendu comme
du texte, sans interprétation HTML. Les échecs ne présentent pas d’anciennes notes
comme une lecture réussie. Aucun nouvel endpoint, droit ou stockage.

Validation : TypeScript, compilation et 62 contrôles de livraison réussis.
Parcours navigateur isolé : lecture à la demande, notes réellement enregistrées,
tri et affichage progressif, heure de Paris malgré un navigateur dans un autre
fuseau, contenu HTML rendu comme texte, valeurs inconnues, panne de lecture,
mauvais dossier, données invalides et historique réellement vide. Les doubles
lectures sont bloquées. La saisie et sa révision sont conservées, avec un conflit
de sauvegarde vérifié après une modification concurrente visible dans l’historique.
Affichage contrôlé sur ordinateur, mobile et sombre. Aucun e-mail ni facture réel.

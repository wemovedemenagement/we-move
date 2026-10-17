# Message et suivi des pièces manquantes

Dans la section « Pièces client » d'une fiche déménagement, « Préparer la demande de pièces » propose un texte relatif à la version acceptée. Il contient seulement les pièces manquantes ou à revérifier et ne reprend pas les pièces dont la réception est déjà renseignée. La préparation est réservée aux dossiers acceptés ; l'accord de référence doit être enregistré avant de générer le texte.

Le texte est modifiable et copiable, objet compris. Aucun endpoint d'envoi n'est appelé. Copier ne journalise ni échange effectué, ni réception de pièce. Les modifications du texte peuvent être abandonnées explicitement ou conservées dans le presse-papiers. Elles ne sont pas enregistrées dans la base.

Le formulaire existant de responsable et prochaine action est réutilisé. « Préparer le suivi des pièces » suggère l'action `documents`, sans date automatique ; l'utilisateur choisit son échéance. Le responsable existant reste sélectionné. Si une action est déjà affichée, son remplacement exige une confirmation et ne la marque pas terminée. La sauvegarde utilise la révision et l'historique du suivi existant, et ne modifie ni devis ni réception documentaire.

Le serveur accepte cette nouvelle action seulement pour un dossier au statut `confirme`. L'action datée apparaît dans les priorités et les notifications existantes. Depuis le tableau de bord et le dossier, son bouton ouvre directement la section des pièces. Lorsque les réceptions sont renseignées, son libellé devient « Vérifier le suivi des pièces » ; elle n'est pas terminée automatiquement. Le formulaire reste accessible pour clôturer explicitement l'action. Le compte rendu après mission conserve son propre suivi.

Les formulaires de mission, accord, réception, suivi et compte rendu se protègent mutuellement contre les modifications non enregistrées. Un conflit de suivi conserve la saisie et propose de recharger avec confirmation. Les tests utilisent SQLite isolé et le presse-papiers simulé du navigateur. Aucun client de production n'est contacté, aucune facture n'est émise et aucun nouveau service d'envoi n'est configuré.

# Départs depuis le tableau de bord

Le tableau de bord affiche « Vos prochains départs » avec le même contrôle de préparation que le planning : missions actives des sept prochains jours, incluant les missions en cours, points manquants et raccourcis vers le dossier ou la mission. Les filtres permettent de passer au jour même, à trente jours, ou de consulter aussi les missions sans point manquant détecté.

Il s'agit d'informations enregistrées, pas d'une certification de disponibilité terrain. Aucune nouvelle règle de préparation n'est dupliquée : `departureReadiness` et `CrmDepartureReadiness` sont communs aux deux vues. L'accès au planning reste direct.

Les résultats du planning sont liés à l'instantané des dossiers ayant déclenché leur lecture. Après une nouvelle lecture des dossiers, les compteurs de préparation sont masqués jusqu'à réception du planning correspondant. Une erreur de lecture du planning affiche une possibilité de réessayer. Une erreur de lecture des dossiers masque aussi les priorités et la liste de travail : d'anciennes valeurs ne sont pas présentées comme vérifiées.

Les raccourcis ouvrent les formulaires existants et gardent leurs contrôles d'accès, versions et confirmations. Aucun e-mail, facture ou modification métier n'est déclenché par la consultation du tableau de bord.

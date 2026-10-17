# Fiche dossier : l'essentiel d'abord

La fiche commence par l'action principale calculée depuis le dossier chargé, suivie du responsable du dossier et de l'échéance de sa prochaine action enregistrée. « Modifier le suivi » ouvre le formulaire existant et place le focus sur le responsable. Une date souhaitée de déménagement n'est pas utilisée comme échéance de suivi.

Le résumé présente les villes, le volume du dossier, la date souhaitée, la formule et le montant TTC du devis. Pour un dossier accepté ou terminé disposant d'une copie acceptée, cette copie fournit la formule, le montant et la référence/version affichés. Une version de travail différente est signalée. Sinon, le résumé utilise le devis enregistré ; à défaut de devis, il montre la formule souhaitée si elle est identifiable et indique qu'aucun devis n'est créé. Les montants non chiffrés ne sont pas remplacés par zéro.

Les raccourcis de contact et d'ouverture du devis restent disponibles, avec les protections existantes contre l'abandon d'un suivi non enregistré. Le parcours détaillé, les factures/avoirs, les PDF et l'historique sont repliables. Les informations manquantes du projet et les pièces client gardent leurs boutons de correction.

Le résumé réutilise la lecture privée du dossier et n'ajoute pas de requête. Une erreur de lecture n'affiche pas de synthèse issue d'une autre source. Les validations, rôles, envois et écritures restent ceux des formulaires existants.

Vérification : compilation, contrôles de livraison, parcours Chrome sur SQLite isolé avec devis accepté et version de travail différente, affichage du montant en euros, ouverture du suivi, protection des saisies, sections repliées et vues mobile/sombre.

Pour la maintenance : les montants des brouillons de devis sont exprimés en euros, contrairement aux montants en centimes des lignes de facturation. Le résumé n’applique aucune division par 100 au devis.

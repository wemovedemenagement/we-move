# Préparation des factures : source visible et contrôlée

La sélection d’un dossier charge sa version de référence avant d’autoriser la
création du brouillon. L’interface affiche le numéro de version et le total TTC
en euros, à partir de l’accord enregistré lorsqu’il existe. Une version de travail
différente est signalée sans remplacer le devis accepté.

Les anciens dossiers sans accord versionné restent utilisables, avec un message
explicite indiquant que le devis de travail sera repris. Un dossier incomplet ou
une lecture en échec empêche la création ; un ancien aperçu n’est pas conservé
à la place des informations indisponibles. L’utilisateur peut relancer la lecture.

La création transmet `expectedQuoteRevision`. Les stockages SQLite et Firestore
contrôlent cette version dans la transaction de création, après résolution du
devis accepté. Un écart renvoie 409 et entraîne une nouvelle lecture de l’aperçu.
Le paramètre reste facultatif pour les appels existants. Une valeur renseignée
invalide renvoie 400. Un brouillon déjà présent d’une autre version n’est jamais
retourné comme s’il correspondait à l’aperçu demandé.

Les préparations existantes affichent leur version figée et leur montant. Un
accord plus récent est signalé, sans recalcul ni réécriture automatique. Ce message
ne constitue pas un blocage supplémentaire de l’émission. La facturation de
production reste désactivée et la bascule depuis PARC reste à autoriser séparément.

Les changements de brouillon et la création d’un autre brouillon demandent de
confirmer l’abandon des notes ou de l’échéance non enregistrées. Un indicateur et
une action « Annuler la saisie » rendent cet état visible. Cette protection concerne
les actions internes à cette vue, pas la navigation globale du CRM.

## Vérifications

- Typage, compilation et 52 suites de livraison réussis.
- Recette métier étendue : versions attendues invalides ou périmées rejetées,
  aucune création sur conflit, ancien brouillon conservé.
- Recette Chrome isolée : montants des versions acceptée et de travail, absence
  d’accord versionné, chiffrage incomplet, erreur sans ancien aperçu et réessai,
  création, annulation des changements de brouillon, saisie conservée, accord
  ultérieur, absence de débordement à 390 px et thème sombre.
- Compilation et recette visuelle relancées après les ajustements de présentation.

Tous ces essais utilisent une base SQLite temporaire. Aucun e-mail n’a été envoyé,
aucun numéro ni document de production n’a été créé. Le nouveau contrôle de
transaction Firestore n’a pas été exécuté contre la base cloud dans cette recette.

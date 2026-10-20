# Sélection du dossier pour un devis — 20 octobre 2026

« Nouveau devis » ouvre une recherche de dossier, en remplacement de la liste
native de noms et d’identifiants complets. La recherche utilise le moteur CRM
existant : mots multiples, accents, coordonnées, villes et numéros français.
Six résultats sont proposés initialement ; les suivants s’affichent par six.

Chaque ligne présente le client, les villes de départ et d’arrivée, un moyen de
contact, le statut du dossier et la référence/version du devis existant. Les
adresses complètes ne prennent plus de place dans cette sélection.

Une sélection explicite précède l’action : « Reprendre le devis » lorsqu’un devis
est enregistré, sinon « Préparer le devis ». Modifier la recherche ou l’inclusion
des dossiers clos efface le choix précédent. Les dossiers terminés ou non retenus
restent accessibles par une case dédiée. Un lien permet de créer une demande
si le client n’a pas encore de dossier.

L’ouverture passe toujours par le point d’entrée serveur existant, qui relit et
reprend le devis du dossier de façon transactionnelle et idempotente. Le choix
affiché ne remplace pas ce contrôle serveur. Aucune route, règle Firestore,
permission ou structure persistée n’est ajoutée.

Si la lecture des demandes ou des devis échoue, les résultats de sélection ne
sont plus présentés comme vérifiés et l’ouverture est désactivée. La recherche
et le choix restent en mémoire jusqu’à une nouvelle lecture réussie. Un échec
d’ouverture conserve également la sélection. La recherche seule ne crée rien.

## Vérifications

- 61 suites de livraison, compilation et contrôle TypeScript réussis ; tests
  existants de recherche et d’idempotence des devis conservés.
- Recette Chrome sur SQLite temporaire : deux clients homonymes, recherche sans
  accents et par téléphone international, affichage progressif, effacement
  explicite du choix, reprise d’un devis sans modification, erreur de lecture,
  erreur d’ouverture et création uniquement après validation.
- Dossiers clos accessibles, absence de résultat, mobile 390 px et thème sombre.
- Aucun changement des demandes, aucun e-mail, aucune facture ni activation de
  la facturation réelle. Les fixtures restent hors de la production.

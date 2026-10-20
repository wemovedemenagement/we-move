# Repères du projet dans les demandes — 20 octobre 2026

La fiche d’une demande en cours présente « Les repères du projet », un volet
replié par défaut avec le nombre de points à préciser. Il remplace le message
linéaire des champs manquants et regroupe cinq informations :

- un nom et un moyen de contact utilisable ;
- les adresses de départ et d’arrivée renseignées ;
- le volume retenu au dossier, explicitement connu et positif ;
- une date souhaitée valide, à reconfirmer si elle est passée ;
- les étages, ascenseurs et distances de portage du relevé enregistré.

Chaque point manquant permet d’ouvrir le dossier ou le relevé de visite. Ces
boutons conservent la protection des saisies de suivi non enregistrées. Ils ne
créent pas de visite, de devis, d’envoi ou de réservation. Aucun prérequis
supplémentaire n’est ajouté au parcours : la date peut rester à convenir et le
volume à estimer.

« Repères renseignés » décrit uniquement les champs contrôlés : ce n’est ni une
validation du chiffrage, ni une vérification des adresses ou des coordonnées,
ni une confirmation de la disponibilité des équipes. Le souhait de date reste
bien distinct d’une réservation effective. Les conditions contractuelles et les
contrôles avant envoi restent dans le devis.

Un ancien volume numérique ne prend pas le dessus sur `unknownVolume` : il est
masqué dans les repères et dans le champ d’édition du volume connu. Les valeurs
par défaut des ascenseurs dans une demande ne prouvent pas l’absence d’ascenseur.
Le relevé explicite « Non », un étage « 0 » et un portage « 0 » sont reconnus.
Aucun relevé n’est déduit d’un formulaire non enregistré.

Les dossiers acceptés, terminés ou refusés conservent leurs contrôles métier et
n’affichent pas ce volet de qualification initiale. Un échec de lecture du
dossier masque les repères précédemment chargés, comme le reste de la synthèse.

## Vérifications

- Suite dédiée aux repères : contact, valeurs inconnues, adresses provisoires,
  dates invalides ou passées, flexibilité, accès zéro, données anciennes et
  absence de mutation.
- 61 suites de livraison ; compilation et contrôle TypeScript.
- Recette Chrome isolée : projet à compléter et projet renseigné, raccourcis de
  correction, garde des saisies, erreur de lecture, mobile et thème sombre.
- Les fixtures restent en SQLite temporaire, avec notifications et facturation
  réelle désactivées. Aucun envoi ni création de document de production.

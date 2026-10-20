# Dates et périodes du devis — 20 octobre 2026

La préparation du devis détecte les dates calendaires invalides et les fins de
période antérieures à leur début. La date de validité doit être réelle, non
expirée pour l’envoi, et ne pas précéder la date du devis. Ces règles reprennent
les contrôles existants d’enregistrement et d’envoi au lieu d’ajouter une
politique de planification.

Les dates de fin restent facultatives. Les bornes égales, les déménagements sur
plusieurs jours et les périodes de chargement/livraison qui se chevauchent restent
possibles. Aucune nouvelle interdiction des dates de prestation passées ni
comparaison générale entre date de chargement et date de livraison n’est ajoutée.

Le guide par étape et la vérification finale reprennent les mêmes anomalies que
le point d’entrée d’envoi serveur. Les champs concernés affichent un message
associé par `aria-describedby` et un état `aria-invalid`. Le sélecteur de date de
fin reprend le début de sa propre période comme borne minimale. La validité
conserve la date du devis comme borne minimale.

Les boutons de correction existants ciblent la date concernée. Aucune date n’est
corrigée automatiquement, aucune saisie n’est enregistrée par la navigation et
aucun devis, accord antérieur ou PDF archivé n’est réécrit.

## Vérifications

La suite `test-quote-readiness.mjs` couvre les dates impossibles, les types
incorrects, les périodes inversées, les bornes égales, les dates de fin absentes,
les périodes sur plusieurs jours, les chevauchements autorisés et la validité.
Elle vérifie également la concordance avec `sendIssues` et l’absence de mutation.
La recette Chrome isolée contrôle les messages associés, les cibles de focus,
la disparition des erreurs après correction et la conservation des brouillons.
Les fixtures sont exclusivement en SQLite temporaire et les envois sont désactivés.

Compilation, TypeScript et 61 suites de livraison réussis. Affichage mobile et
thème sombre vérifiés dans Chrome ; aucun envoi réel.

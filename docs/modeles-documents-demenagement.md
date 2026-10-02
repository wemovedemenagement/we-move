# Modèles des documents de déménagement

Références fournies le 28 septembre 2026 : `Ordre de mission 2600217.pdf` (1 page) et `Lettre de voiture 2600217.pdf` (8 pages). Documents examinés visuellement. Les données du client figurant dans ces exemples ne sont pas des valeurs par défaut et ne doivent pas être publiées dans les assets du site.

## Ordre de mission

Une page A4 : logo et société, numéro de mission, client et téléphone, référence et date du devis, entreprise exécutante, volume, distance, nature et formule. Deux colonnes chargement/livraison pour dates, heures, adresses, téléphones et accès. Garanties et valeurs déclarées. Véhicules, licence, chef d’équipe, chauffeur, déménageurs, matériel, instructions et montant à encaisser.

## Lettre de voiture

Conserver les huit pages et l’ordre du modèle :

1. Chargement / entreprise.
2. CGV.
3. Chargement / client.
4. CGV.
5. Livraison / entreprise.
6. CGV.
7. Livraison / client.
8. CGV.

Les quatre pages de CGV ont un texte identique dans le PDF source. Les conserver sans réécriture, ainsi que les mentions fixes et les instructions de fin de travail du modèle. Cette référence décrit le document fourni, sans constituer un audit juridique.

Au chargement : modalités contractuelles du devis, observations du représentant, départ dépôt, arrivée et départ du chargement, lieu/date et signatures entreprise/client.

À la livraison : déclaration de fin de travail, arrivée/départ livraison et retour dépôt, observations et signatures séparées du client et du représentant. Les choix « sans réserves » et « avec réserves » restent vierges jusqu’à la réception réelle.

## Une seule source pour les deux documents

| Information | Source et règle |
| --- | --- |
| Client, contacts, adresses, volume, distance, formule, garanties | Version du devis accepté et fiche déménagement confirmée ; ne pas utiliser silencieusement un brouillon modifié après acceptation. |
| Dates et heures d’exécution | Planning confirmé ; distinguer la date souhaitée par le prospect de la date planifiée. |
| Étages, digicodes, ascenseurs, monte-meubles, passage fenêtre, transbordement, portage, stationnement | Même fiche d’accès pour les deux documents. Conserver les précisions textuelles utiles (ex. dimensions d’ascenseur). |
| Référence de devis | Numéro du devis accepté, jamais la référence interne BR d’un brouillon. |
| Référence de mission | Numéro persistant commun à l’ordre de mission et aux quatre exemplaires de lettre de voiture. Ne pas réutiliser le numéro de l’exemple. |
| Véhicules, chauffeur, équipe, matériel | Affectations confirmées du planning. Chef d’équipe et licence à compléter s’ils ne sont pas enregistrés. |
| Entreprise exécutante | Identité confirmée pour la mission ; ne pas présumer une sous-traitance. |
| Montant à encaisser | Solde calculé à partir du montant contractuel et des paiements réellement enregistrés. Le pourcentage d’arrhes prévu ne prouve pas un encaissement. Afficher « à confirmer » si le suivi des paiements manque. |
| Observations, horaires réalisés, réserves, signatures | Saisie au moment de l’exécution ; aucune prévalidation ni signature automatique. |

## Points relevés et intégration restante

Les deux exemples diffèrent sur le stationnement : l’ordre de mission indique « Non » au chargement et « Grand » à la livraison ; la lettre indique « Oui » puis « Non ». Ne pas choisir arbitrairement une des valeurs : vérifier les accès du dossier réel.

Le CRM possède des coordonnées, un document de devis et des champs d’affectation. Il reste à relier une version acceptée du devis à une mission persistante, compléter les champs d’exécution, raccorder les encaissements réels et réaliser le générateur PDF privé.

Parcours cible : Déménagements → dossier → Documents → Ordre de mission / Lettre de voiture → contrôle des informations → PDF. Les documents contenant coordonnées et digicodes doivent être accessibles uniquement aux collaborateurs autorisés. Conserver la version émise ; une correction produit une nouvelle version, sans écraser les documents signés.

## Vérifications avant livraison du générateur

- Une même mission alimente les deux documents et les quatre exemplaires.
- Aucun nom, montant, numéro, horaire ou adresse issu des exemples ne sert de donnée métier.
- Champs manquants clairement signalés ; aucun zéro, « Non », paiement ou signature inventé.
- CGV inchangées, une page après chaque exemplaire de lettre de voiture.
- Vérification visuelle A4 : textes longs, adresses longues, garanties, signatures et absence de débordement.
- Téléchargements protégés par les droits CRM et données de paiement vérifiées.

État : modèles analysés et spécification d’intégration enregistrée. La génération et le téléchargement des PDF ne sont pas encore implémentés.

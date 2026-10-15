# Suivi du garde-meubles

Chaque séjour est lié à un dossier client. Le volume saisi concerne les biens de ce séjour et ne remplace pas le volume du déménagement. Plusieurs séjours peuvent être liés au même dossier.

## Parcours

- **Prévu** : préparation d’un stockage, sans occupation confirmée. Site, emplacement, volume et dates peuvent rester à préciser.
- **Stocké** : entrée réellement constatée. La date réelle, le site, le repère d’emplacement, le volume positif et les biens confiés sont nécessaires.
- **Sorti** : restitution complète des biens du séjour, à une date réelle au moins égale à la date d’entrée.
- **Annulé** : annulation avant toute entrée. Un séjour stocké passe par une restitution, jamais par une annulation.

Les mouvements réels futurs sont refusés. Une date de sortie prévue ne libère pas automatiquement un séjour. Les compteurs totalisent uniquement les séjours en état « Stocké » ; ils ne décrivent pas la capacité disponible d’un site.

Le repère d’emplacement est du texte libre. Ce module ne réserve pas un box exclusif, ne vérifie pas sa capacité et ne gère pas encore les sorties partielles. Le libellé « Sorti » correspond à la restitution complète du séjour.

## Conservation et accès

L’API `/api/crm/storage` et l’historique sont derrière l’authentification CRM existante. Le gérant et le secrétariat peuvent saisir les séjours. Le commercial dispose de la consultation. Après sortie ou annulation, une correction reste dans le même état et exige un gérant et un motif.

Les données sont enregistrées dans `crm_storage_stays/{id}` et les événements immuables dans `crm_storage_stays/{id}/events/{revision}`. La sauvegarde du séjour, de l’événement et de la note au dossier est transactionnelle. L’identifiant choisi à l’ouverture du formulaire et la révision empêchent la duplication d’une même sauvegarde et l’écrasement d’une modification concurrente.

Le dossier client est aussi écrit pendant la transaction, afin de sérialiser une création de séjour avec sa suppression. Un dossier possédant un historique de stockage, y compris annulé ou restitué, ne peut plus être supprimé par le CRM. Aucun endpoint de suppression d’un séjour ou d’un événement n’est proposé.

Firestore Standard, base `(default)` du projet `wemove-b0057`, région `europe-west9`. Accès par le SDK serveur existant ; aucune ouverture des règles navigateur, qui refusent les accès directs. Les requêtes utilisent des index simples : `updatedAt`, `leadId` et `revision` dans l’historique, paginé par groupes de 20.

## Vérifications

`scripts/test-crm-storage-stays.mjs` utilise SQLite dans un dossier temporaire : droits, validations, transitions, conflits, historique paginé et protection des dossiers. Le parcours mobile, les corrections et les erreurs réseau sont vérifiés avec le serveur local isolé. Aucun client, mouvement ou séjour de test n’est écrit dans la base de production.

Aucun envoi de message, calcul de loyer ou émission de facture n’est déclenché par une sauvegarde de séjour.

# Contrôle avant départ dans la vue Terrain

La fiche terrain présente un décompte repliable des points à vérifier, avec une
action par point. Le contrôle porte exclusivement sur les données enregistrées
du dossier, de la réservation et du planning chargé. Il n’autorise pas un départ
et ne remplace pas la vérification des conditions réelles avec l’équipe.

## Périmètre

- Téléphone utilisable pour appeler, volume connu et statut du dossier.
- Adresses renseignées, étages, ascenseurs et portages. Les valeurs zéro restent
  renseignées et les observations de visite explicitement vides restent inconnues.
- Accord sur une version précise et écarts avec le devis accepté, via le contrôle
  partagé existant. Aucun contrat n’est remplacé ou corrigé automatiquement.
- Créneau réellement réservé. Les dates souhaitées ne constituent pas une mission.
- Moyens actifs affectés, conflits avec les autres réservations, congés et
  maintenance sur toute la période. La propre réservation est exclue du conflit.
- Comparaison du volume avec les capacités de véhicules explicitement déclarées,
  si elles sont connues. Cette comparaison ne vaut pas plan de chargement,
  vérification de charge utile ou décision sur les rotations.
- Stationnements, contrôle des accès, préparation du matériel et pièces client
  rattachées à la version acceptée du devis.

Les missions annulées ou clôturées, et les dossiers terminés ou refusés, affichent
un contrôle inactif. Une mission sans problème détecté affiche « Champs contrôlés
renseignés », sans certification générale de préparation.

## Corrections et lecture

Les actions rejoignent directement la fiche client, la visite technique, l’accord,
le créneau, les moyens, la préparation ou les pièces. Une sortie vers un autre
formulaire conserve la protection existante contre la perte de saisie. Les
changements de vue conservent les formulaires ouverts dans Organisation.

« Actualiser le contrôle » relit le dossier et le planning. Cette action est
indisponible tant qu’une saisie est modifiée ou qu’un enregistrement est en cours.
Une lecture du planning en échec n’annonce pas les anciennes disponibilités
comme vérifiées : elle demande une nouvelle lecture. Une lecture du dossier
impossible retire la fiche terrain, selon le comportement déjà existant.

## Vérifications

- Typage, compilation et 59 suites de livraison réussis.
- Suite `scripts/test-mission-departure-check.mjs` : réservation propre exclue,
  chevauchements, créneaux adjacents, annulations, absences, moyens historiques,
  capacité, données anciennes, accès zéro ou inconnus, accord, pièces versionnées
  et absence de mutation des objets d’entrée.
- Chrome sur base SQLite temporaire : conflits nominatifs simulés uniquement
  dans la réponse de planning du navigateur isolé, corrections ciblées,
  actualisation, échec puis reprise de lecture, formulaire protégé, mobile 390 px
  et thème sombre. Dossier, devis et réservation inchangés après consultation.
- Aucun e-mail, activation de facturation ou changement de droits en production.

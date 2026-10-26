# Recette du CRM WE MOVE - 26 octobre 2026

## Résultat

Le typage, la compilation et les 62 contrôles de livraison passent, après la
correction décrite ci-dessous. Les quatre parcours navigateur contrôlés passent
également. Aucun échec métier bloquant n'a été constaté dans ce périmètre isolé.
Ce résultat ne constitue pas un feu vert pour la bascule depuis PARC.

Base du contrôle applicatif : commit `abb4ab5`, puis correction de l'affichage de
l'horaire dans l'ordre de mission enregistrée dans `3e3940d`. La session CLI WE MOVE,
initialement absente, a été rétablie pendant la reprise de cette mission.
Les contrôles cloud ci-dessous ont alors été effectués avant publication.

## Parcours et preuves

| Périmètre | Résultat constaté |
| --- | --- |
| Demande du site | Création par le même endpoint public, reprise dans le CRM, lecture anonyme refusée. Notifications et accusés désactivés dans la recette. |
| Visite vers devis | Inventaire, duplication, suppression rétablie, accès et portage zéro testés dans le navigateur. Un volume de 6 m³ explicitement adopté et un portage de 25 m sont repris dans le devis. |
| Édition du devis | Sauvegarde sur la même étape, versions successives, double clic, rechargement confirmé et conflit conservant la saisie vérifiés. Préparation d'envoi distincte, sans envoi réel. |
| Accord et facturation | Dans le scénario métier unique, la version acceptée reste la source de la facture après modification du devis de travail. Devis accepté : 1 481,48 € TTC ; facture : 148 148 centimes. |
| Planification et moyens | Affectations, réservation existante, congés, capacité inconnue ou insuffisante, conflit simultané et conservation de la sélection vérifiés dans le navigateur. |
| Clôture et règlement | Clôture explicite, émission et règlement uniquement dans une base SQLite jetable. Solde nul ; PDF émis conservé après règlement. |
| Brouillons de facture | Source acceptée, lecture en erreur, chiffrage incomplet, actualisation explicite d'un accord ultérieur et conservation des notes vérifiés dans le navigateur. Aucune émission dans ce parcours UI. |
| Documents | Export de recette du devis accepté (5 pages), ordre de mission (1), lettre de voiture avec ses exemplaires/CGV (8), facture simulée (1). Structure et textes relus, planche de rendu inspectée ; chiffrage, mission et facture inspectés en détail. |
| Mobile | Captures des interfaces visite, devis, affectations et facture inspectées à 390 px. Absence de débordement horizontal vérifiée dans les scénarios. Mode sombre vérifié pour devis, moyens et facture. |
| Accès publics de production | 10 routes privées contrôlées sans jeton puis avec jeton invalide : 20 réponses 401 avec `no-store`. HTML CRM : 200, `no-store`, `DENY`, `nosniff`. Configuration TOTP publique toujours désactivée. |

Le scénario métier unique passe par les API et un transport de mail injecté.
Les quatre parcours navigateur utilisent leurs propres dossiers temporaires ;
ils ne doivent pas être présentés comme une unique navigation intégrale de la
demande au règlement. Aucune nouvelle recette Firestore cloud n'a été exécutée.

## Correction effectuée

L'ordre de mission imprimait `2026-10-25T08:00`. Il réutilise maintenant le
formatteur déjà employé par la fiche terrain et affiche `25/10/2026 à 08:00`.
L'heure locale de planification reste identique : aucune conversion de fuseau
n'est appliquée. Les montants, dates contractuelles et annexes restent conservés.
Le PDF régénéré a été relu et rendu pour contrôle visuel.

Les anciens scripts de recette de visite et de devis utilisaient des points
d'entrée déplacés par les évolutions précédentes. Leurs copies de recette ont
été adaptées aux commandes actuelles : Demandes, ouverture du parcours replié,
puis visite ; ouverture du devis par son client. Ces ajustements ne sont pas des
corrections de l'application.

## Limites et suites avant bascule

- Le premier contrôle cloud était bloqué par `Session Google locale indisponible`.
  La reconnexion locale du compte `wemove.demenagement@gmail.com` a levé ce blocage.
  Aucune attribution IAM ni configuration cloud n'a été modifiée pour le résoudre.
- La publication du correctif est pilotée par le contrôle de déploiement du dépôt.
  Sa preuve finale doit confirmer le commit exact, le trafic à 100 %, les protections
  après publication et les réponses HTTP publiques. Cette preuve est conservée dans
  `output/crm-correctif-horaire-verification-2026-10-26.json` après réussite.
- Le gérant doit valider des dossiers représentatifs avec les ressources et les
  paramètres réels de l'entreprise avant une bascule. Aucun compteur de production
  n'a été réinitialisé ; le dernier numéro effectivement émis dans PARC reste à
  confirmer avant reprise de la numérotation.

Les données des essais sont isolées dans des bases temporaires. Le transport
d'envoi est simulé. Aucun e-mail client ni facture de production n'a été envoyé,
et aucun droit cloud ou réglage de production n'a été modifié.

## Contrôles cloud après reconnexion

Lectures du 26 octobre sur le projet `wemove-b0057`, avec le compte WE MOVE :

- Firestore `(default)` à Paris : protection de suppression active, PITR actif,
  fenêtre de récupération de 604 800 secondes et règles déployées refusant tous
  les accès des clients. Sept sauvegardes prêtes ; la plus récente date du
  26 octobre à 07:51 UTC. Sauvegarde quotidienne avec rétention de sept jours.
- Le compte serveur conserve les quatre rôles prévus : `datastore.user`,
  `firebaseauth.viewer`, `firebaseapphosting.computeRunner` et
  `developerconnect.readTokenAccessor`. Il s'agit d'un contrôle ciblé des attributions
  directes de ce compte, pas d'un audit exhaustif de toutes les permissions du projet.
- Photos à Paris : accès uniforme au bucket, prévention d'accès public imposée,
  aucune attribution publique observée. L'accès du service au secret de messagerie
  est limité à son rôle d'accès au secret ; aucune valeur secrète n'a été lue.
- Runtime : stockage Firestore, accès local désactivé, facturation réelle désactivée,
  notifications internes et accusés clients activés, fournisseur de mail Resend.
- Authentification : e-mail/mot de passe et Google activés, domaine `we-move.fr`
  autorisé, MFA désactivée conformément à la décision différée du gérant.

Ces lectures ne remplacent pas une nouvelle recette Firestore avec écritures,
un exercice de restauration complet ou une validation opérationnelle du gérant.

## Artefacts locaux

- `tmp/recette-finale-2026-10-26.log` et `.exit` : validation finale (code 0).
- `tmp/recette-{visite,devis,moyens,facture}-2026-10-26.log` et `.exit` : parcours navigateur.
- `output/recette-production-http-2026-10-26.json` : observations HTTP publiques.
- `output/controle-sauvegardes-2026-10-26.json` : sauvegardes, PITR et règles relus.
- `tmp/controle-cloud-2026-10-26.log` et `tmp/controle-auth-2026-10-26.log` : lectures ciblées de configuration et d'accès.
- `output/pdf/recette-2026-10-26/resultats.json` : montants et révisions du scénario unique.
- `output/pdf/recette-2026-10-26/controle-structure.json` : structure des PDF de recette.
- `output/recette-*-mobile-2026-10-26.png` : captures mobiles inspectées.

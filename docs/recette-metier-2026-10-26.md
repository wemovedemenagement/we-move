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

### Type de client proposé depuis le dossier

La vérification de facture reprend le type enregistré dans le dossier lié à
la préparation : particulier ou entreprise. Un dossier entreprise affiche ainsi
les champs professionnels existants, dont le SIREN, sans les renseigner ni en
déduire une identité juridique. Le destinataire reste à confirmer par l’utilisateur.

Une correction manuelle n’est pas remplacée par une actualisation de la liste
des demandes. Revenir au même brouillon conserve ce choix ; passer explicitement
à un autre brouillon reprend le type de son propre dossier. Si le dossier ou
son type est indisponible, le champ reste à préciser et devient obligatoire.
Cette proposition ne modifie ni le dossier ni les factures déjà émises.

Recette navigateur sur ordinateur et mobile : entreprise avec SIREN visible,
particulier, correction manuelle conservée, changement de source, dossier absent,
choix obligatoire et données reçues tardivement après une correction. Zéro
écriture API ni demande de PDF. Le test serveur de facturation existant passe
également (base temporaire, aucun envoi réel).

Résultats : `output/type-client-facture-2026-10-26.json` ; journal
`tmp/type-client-facture-ui-2026-10-26.log` (code 0). Typage et compilation :
`tmp/validation-type-client-facture-2026-10-26.log` (code 0).

### Référence lisible avant l’aperçu de facture

La vérification affiche désormais une synthèse distincte du sélecteur : nom
du client, référence du devis d’origine, version reprise et base TTC du brouillon.
Ces valeurs proviennent de la préparation sélectionnée, sans recalcul d’acompte
ou de solde et sans affirmation d’un accord non enregistré. Le montant du
document reste à contrôler dans l’aperçu PDF.

Le bloc reprend les couleurs du CRM, passe en une colonne sur mobile et laisse
le nom et la référence revenir à la ligne. Le défilement vers le formulaire
réserve aussi l’espace du header fixe afin de ne pas masquer son début.

Typage et compilation : `tmp/validation-synthese-facture-finale-2026-10-26.log`
(code 0). La recette navigateur existante de vérification a été rejouée pour
contrôler l’affichage et les changements de brouillon, sans écriture API,
demande de PDF ni émission. Captures : `output/synthese-facture-*-visible-2026-10-26.png`
et `output/verification-brouillon-*-2026-10-26.png`.

### Protection composée avant la sortie de Factures

Le contrôle de sortie de la rubrique consulte maintenant aussi l’état du
formulaire de vérification et des paramètres société. Une seule confirmation
est présentée lorsque plusieurs de ces saisies et les notes de préparation
sont modifiées. Annuler conserve les valeurs et la rubrique. Le contrôle refuse
également la navigation pendant une action de facturation en cours.

Le rechargement ou la fermeture du navigateur dispose de l’alerte native pour
les champs de vérification modifiés, les paramètres société modifiés et l’action
en cours. La protection disparaît après abandon explicite de la vérification ou
restauration des paramètres à leurs valeurs enregistrées. Cela n’enregistre
aucune saisie et ne modifie aucun rôle, compteur ou réglage d’activation.

Recettes isolées sur ordinateur et mobile : sortie refusée avec adresse/date
de vérification conservées, notes et vérification modifiées ensemble avec une
seule confirmation, paramètres conservés, alerte native présente puis retirée,
navigation suspendue pendant une lecture volontairement retardée. La recette
antérieure des notes, échéances et réponses tardives reste passante. Aucun envoi
ni document émis ; zéro écriture API et zéro demande de PDF dans le nouveau parcours.

Résultats : `output/protection-verification-2026-10-26.json` ; journaux
`tmp/protection-verification-ui-2026-10-26.log` et
`tmp/regression-navigation-verification-2026-10-26.log` (codes 0).
Typage et compilation : `tmp/validation-protection-verification-2026-10-26.log`
(code 0).

### Du brouillon préparé à sa vérification

Le bouton « Vérifier ce brouillon » ouvre directement l’onglet de préparation
du document, sélectionne le bon brouillon et place le focus sur le formulaire.
Il ne demande aucun PDF et n’émet aucun document. Il est désactivé si la
préparation contient des modifications non enregistrées ou une source périmée.

Revenir sur la même vérification conserve les informations saisies. Le passage
vers un autre brouillon (raccourci ou sélecteur) et le changement d’onglet de
facturation demandent confirmation si cette vérification a été modifiée. Les
paramètres de société restent contrôlés par leurs actions existantes ; aucun
réglage d’activation ou de compteur n’a changé.

Recette isolée sur ordinateur et mobile sombre : bon brouillon, focus,
préparation modifiée bloquée, retour sans perte, annulation et confirmation de
changement de source et d’onglet, source périmée bloquée après nouvel accord,
émission désactivée. Zéro écriture API ni demande de PDF dans le navigateur.
Le test serveur des mises à jour de source reste également passant.
Résultats : `output/verification-brouillon-2026-10-26.json` ; journal
`tmp/verification-brouillon-ui-2026-10-26.log` (code 0).

### Navigation protégée pendant la préparation d’une facture

Les notes et l’échéance non enregistrées d’un brouillon de préparation disposent
d’une confirmation avant de quitter Factures : navigation latérale, recherche de
module, paramètres du header, changement de connexion, ouverture d’un devis et
retour vers la facturation d’un autre dossier. Annuler conserve la rubrique, le
dossier éventuellement ouvert et la saisie ; confirmer ne sauvegarde rien.
Cliquer sur la rubrique Factures déjà ouverte ne redemande pas de confirmation.

Le changement est suspendu pendant la création, l’enregistrement ou la mise à
jour de source du brouillon. Une réponse tardive à une ouverture de devis ne
change plus de rubrique si une autre navigation est intervenue entre-temps.
Le devis demandé peut avoir été créé côté serveur ; son ouverture tardive ne
remplace pas l’écran courant.

La recette isolée a vérifié sur ordinateur : annulations via la sidebar, la
recherche, les paramètres, la connexion et le dossier ; changement confirmé de
dossier, y compris vers le même contexte initial ; erreur de sauvegarde ;
sauvegarde volontairement retardée ; réponse de devis volontairement retardée ;
sortie sans sauvegarde implicite ; navigation libre après enregistrement.
Sur mobile : annulation par la sidebar et la recherche, confirmation de sortie,
échéance conservée et thème sombre sans perte de saisie. Aucun envoi ni document
comptable émis. Le contrôle des notes et de l’échéance est désormais composé
avec celui de la vérification et des paramètres société, décrit plus haut.
Les formulaires de règlement, correction et envoi ne sont pas couverts par
ce nouveau contrôle.

Résultats : `output/navigation-factures-2026-10-26.json` ; journal
`tmp/navigation-factures-ui-2026-10-26.log` (code 0).
Validation finale : typage, compilation et 62 contrôles de livraison réussis
(`tmp/validation-navigation-factures-finale-2026-10-26.log`, code 0).

### Blocages de préparation de facture explicites

La référence de facture détaille maintenant les seuls points qui empêchent la
création du brouillon : acceptation du dossier, nom, adresse de facturation et
montant positif. Les conditions de création restent identiques. Une version
acceptée incomplète reste bloquante même si la version de travail est complète ;
le message précise qu’une modification de travail ne remplace pas l’accord.

Un bouton ouvre le dossier correspondant à la source effectivement chargée.
Il disparaît en cas d’échec de lecture et ne déclenche aucune création. Les notes
du brouillon restent présentes à la fermeture du dossier consulté. Une alerte
native protège également le rechargement ou la fermeture du navigateur lorsque
ces notes ou l’échéance sont modifiées. La confirmation de navigation interne
est détaillée dans la section précédente.

La recette navigateur isolée a vérifié le blocage sur la seule adresse de la
version acceptée, le blocage sur le seul chiffrage, la différence de versions et
de montants, l’absence d’aperçu périmé après erreur, le dossier ciblé, les saisies
conservées, le changement explicite de source et les thèmes clair/sombre avec
contrôle mobile. Journal : `tmp/facture-reperes-ui-2026-10-26.log` (code 0).
Capture : `output/facture-reperes-mobile-2026-10-26.png`.
Validation finale : typage, compilation et 62 contrôles de livraison réussis
(`tmp/validation-facture-reperes-finale-2026-10-26.log`, code 0), sans publication.

### Préparation de mission accessible directement

Les points manquants de la synthèse de mission sont maintenant des boutons :
ils rejoignent les moyens, la préparation, les pièces client ou l’accord, et
ouvrent l’édition du dossier lorsque les coordonnées manquent. La synthèse est
ouverte lorsqu’elle contient des points à vérifier. Les déplacements internes
ne sauvegardent ni n’effacent les saisies ; la sortie conserve la confirmation
d’abandon des modifications.

La synthèse utilise désormais aussi les heures de début et de fin saisies pour
repérer les périodes d’absence des ressources sélectionnées, comme le contrôle
des disponibilités déjà présent dans la section des moyens.

Trois parcours navigateur (ordinateur, mobile clair et mobile sombre) ont vérifié
les liens, le focus sur la section cible, une absence sur le créneau, les consignes
non enregistrées et la confirmation de fermeture. Aucune écriture API déclenchée.
Résultats : `output/mission-liens-2026-10-26.json` ; captures correspondantes
`output/mission-liens-*-2026-10-26.png`.

### Reprise du devis depuis un dossier

L’ouverture depuis le dossier ou une demande rejoint maintenant la première
étape incomplète dans l’ordre du formulaire : client et trajet, formule et prix,
puis vérification. Si tous les contrôles sont renseignés, elle ouvre la vérification.
Les onglets restent accessibles et aucune saisie, sauvegarde ou préparation
d’envoi n’est déclenchée par ce choix d’étape.

Quatre cas ont été contrôlés dans le navigateur local : prix seul manquant,
adresse client manquante, prix et garantie manquants ensemble, proposition complète.
Les trois derniers ont été vérifiés à 390 px, sans débordement du formulaire ;
le retour à l’étape client conserve l’adresse enregistrée. Les réponses de création
du devis ont été interceptées : aucun envoi ni mutation persistée par ce contrôle.
Résultats : `output/entree-devis-2026-10-26.json` et captures
`output/entree-devis-*-2026-10-26.png`.
La validation `npm run validate:release` a également réussi : typage,
compilation et 62 contrôles de livraison, sans publication. Journal :
`tmp/validation-entree-devis-2026-10-26.log` (code de sortie 0).

- `tmp/recette-finale-2026-10-26.log` et `.exit` : validation finale (code 0).
- `tmp/recette-{visite,devis,moyens,facture}-2026-10-26.log` et `.exit` : parcours navigateur.
- `output/recette-production-http-2026-10-26.json` : observations HTTP publiques.
- `output/controle-sauvegardes-2026-10-26.json` : sauvegardes, PITR et règles relus.
- `tmp/controle-cloud-2026-10-26.log` et `tmp/controle-auth-2026-10-26.log` : lectures ciblées de configuration et d'accès.
- `output/pdf/recette-2026-10-26/resultats.json` : montants et révisions du scénario unique.
- `output/pdf/recette-2026-10-26/controle-structure.json` : structure des PDF de recette.
- `output/recette-*-mobile-2026-10-26.png` : captures mobiles inspectées.

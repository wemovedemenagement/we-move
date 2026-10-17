# Recette de préproduction du CRM — 17 octobre 2026

## Décision à ce stade

Pas de feu vert pour une bascule complète depuis PARC. Les contrôles techniques ci-dessous passent et l'exercice de restauration cloud est terminé, avec nettoyage. La validation opérationnelle du gérant et les points de sécurité/configuration listés ci-dessous restent à terminer. Ce document n'est ni un audit de sécurité exhaustif ni une validation de conformité réglementaire.

Le contrôle local porte sur l'arbre de travail issu de `f37f443`, avec la recherche harmonisée non publiée et l'élargissement de la validation de livraison. Le site public contrôlé sert `/assets/index-DvP0aTb6.js` et `CrmPage-BgL7r85y.js` : ces résultats ne prouvent pas que les modifications locales sont déjà déployées.

## Contrôles effectués

| Périmètre | Résultat et preuve | Limite |
| --- | --- | --- |
| TypeScript et compilation | `npm run lint` et `npm run build` réussis ; 31 pages pré-rendues | Compilation de l'arbre local |
| Métier et API | `node scripts/check-release.mjs` : 50 suites réussies, SQLite temporaire et processus séparés | Pas une nouvelle recette Firestore de bout en bout |
| Demandes et devis | Validation, persistance, idempotence, calculs, conflits, versions acceptées et protections des révisions vérifiés par les suites | Approbation du gérant sur des cas représentatifs encore nécessaire |
| Visites et déménagements | Disponibilités, absences, chevauchements concurrents, préparation, clôture et suivi vérifiés | Ressources et affectations réelles à vérifier avec l'entreprise |
| Facturation | Verrou d'activation, reprise, concurrence, acomptes/solde, avoirs, règlements, remboursements et exports vérifiés en isolation | Aucune émission en production ; aucune reprise PARC exécutée |
| E-mails | Devis, transport Resend, notification interne, accusé client, double clic et résultat incertain vérifiés avec transports simulés | Pas de nouvel envoi ni de contrôle de réception réel durant cette recette |
| Authentification locale | E-mail vérifié, rôles, révocation et refus d'une session incomplète MFA vérifiés par tests simulés | Pas de nouveau test réel Google/mot de passe/MFA |
| Fiche dossier, navigateur | `tmp/check-dossier-essential-ui.mjs` réussi : copie acceptée, montant, formulaire protégé, erreur de lecture, mobile 390 px, sombre | Serveur et données locaux isolés ; capture mobile inspectée |
| Recherche, navigateur | `tmp/check-coherent-search-ui.mjs` réussi : trois entrées, accents, téléphone, tri, source, pagination, sélection, clavier et mobile | Recherche harmonisée encore locale |
| Site public, accès privés | 13 routes GET, chacune sans jeton puis avec jeton invalide : 26 réponses 401 avec `no-store` | N'évalue pas les droits d'un utilisateur authentifié ni IAM |
| Site public, HTML | HTTP 200, cache `private, no-store, max-age=0`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` | Ce sont des vérifications ciblées, pas un audit global |
| MFA public | `/api/crm/auth-config` indique `totpAvailable: false` | Activation toujours différée, conformément au choix du gérant |

Les observations HTTP sont conservées dans `recette-production-http-2026-10-17.json`. Seuls des GET sans authentification ou avec un jeton invalide ont été utilisés en production. Aucune création, suppression ou modification de dossier réel, aucun envoi client et aucun numéro de facture réel consommé.

La première tentative des tests API était empêchée par la restriction réseau locale (`EACCES` sur `127.0.0.1`). La reprise avec accès à la boucle locale a exécuté les 50 suites avec succès. Ce refus d'environnement n'a pas été traité comme une réussite.

## Correction apportée à la validation de livraison

Huit suites existantes n'étaient pas appelées par `check-release.mjs`. Elles sont désormais incluses dans `validate:release`, donc dans la matrice CI Node 22/24 : facturation TEST, recherche de factures, relances de factures, dates, envoi de devis, transport Resend, notification interne et accusé client. Le total passe de 42 à 50. Leur réussite locale ne préjuge pas du résultat du prochain lancement CI.

## Vérifications restant ouvertes

| Priorité | Action et critère de clôture |
| --- | --- |
| Renforcement cloud contrôlé | PITR, sept sauvegardes disponibles, règles fermées, photos privées, configuration Auth et runtime relus. Protection contre la suppression activée et confirmée. Réduction ciblée des rôles IAM appliquée après accord explicite ; nouvelle connexion et lectures tableau de bord, devis, planning et facturation réussies. Pas de test d'écriture ou d'envoi en production. Vérifier aussi la compilation et les attributions au prochain déploiement. Voir `recette-cloud-2026-10-17.md`. |
| Restauration contrôlée | Exercice terminé dans `crm-restore-check-20261017`, puis cible supprimée et disparition confirmée. 22 documents et 5 relations devis → demande contrôlés. Voir `recette-restauration-2026-10-17.json`. Limites : aucun raccordement applicatif ; pas de réservation/facture présente dans cette sauvegarde, ni de restauration de photos ou de comptes Auth. |
| Avant bascule | Recette guidée par le gérant sur des dossiers représentatifs : coordonnées, prestations par formule, chiffrage, PDF, accord, créneau et moyens. Traiter aussi annulation, modification après accord et conflit de réservation. Consigner résultat attendu, résultat constaté et validation du gérant. |
| Avant facturation réelle | Vérifier les mentions société, les paramètres de règlement, le dernier numéro effectivement émis dans PARC, les séries et la date d'arrêt des émissions PARC. `2600247` a été déclaré comme dernier numéro **envoyé**, pas confirmé comme dernier numéro **émis**. Ne pas l'appliquer automatiquement. |
| Avant facturation réelle | Vérifier les exigences de facturation électronique applicables avec le professionnel compétent et la solution retenue : l'envoi PDF actuel ne raccorde pas le CRM à une plateforme de facturation électronique. Voir `bascule-parc.md`. |
| Décision différée | MFA : préparer la récupération d'accès et obtenir l'accord déjà explicitement différé avant toute activation Identity Platform/TOTP ; effectuer ensuite un vrai test sur compte autorisé. |
| Publication | Publier la recherche harmonisée après commit/CI/déploiement et vérifier la version publique. Aucune publication n'est réalisée par la présente recette. |

## Scénarios de recette à faire valider par le gérant

Utiliser un environnement isolé pour les essais artificiels. Ne pas créer de fausses demandes en production. Les essais d'envoi réel éventuels doivent utiliser uniquement des destinataires de recette explicitement autorisés.

1. Demande du site et demande téléphone : informations conservées après relecture, source exacte, aucun doublon ni faux succès sur échec.
2. Visite puis devis : données reprises, formule et prestations conformes, montant et PDF relus, modification concurrente refusée sans écraser la saisie.
3. Envoi : destinataire et pièce jointe vérifiés avant confirmation ; double clic sans second envoi ; résultat incertain clairement bloqué et contrôlé chez le prestataire.
4. Accord puis réservation : bonne version acceptée ; modification ultérieure distincte ; indisponibilité d'une équipe ou d'un véhicule visible et conflit refusé.
5. Mission puis clôture : pièces manquantes visibles, heures et compte rendu enregistrés explicitement, suivi après mission correctement proposé.
6. Facturation en isolation : aperçu sans numéro, acompte/solde, règlement partiel, avoir et remboursement ; aucune activation ou remise à zéro du compteur de production.
7. Accès : commercial privé des opérations réservées ; secrétaire et gérant limités à leurs droits ; session révoquée refusée. Ne pas confondre le simple masquage d'un bouton avec un contrôle serveur.

Le feu vert de bascule devra citer les preuves de clôture des points ouverts et la décision du gérant. Il ne doit pas être déduit du seul nombre de tests réussis.

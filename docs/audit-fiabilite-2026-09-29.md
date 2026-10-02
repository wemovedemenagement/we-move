# Audit de fiabilité We Move — 29 septembre 2026

## Périmètre et méthode
Relecture ciblée du site, API CRM, authentification, modèles de demandes et navigation. Tests SQLite jetables, transports de mail simulés. Aucun client créé en production, aucun e-mail réel envoyé. Il ne s’agit pas d’un audit de sécurité exhaustif ni d’une validation comptable.

## Vérifié
- Demandes : persistance, validation, canaux site/téléphone/Ads et mises à jour.
- Devis : source réelle, préremplissage, calculs, validation, création idempotente et conflits de modification.
- Suivi : attribution, relances, historique, dates et clôture.
- Authentification : refus des sessions absentes/invalides, compte vérifié et autorisé, accès local interdit en production dans le code.
- Notifications : déduplication concurrente, erreurs certaines/incertaines, limites des accusés clients, destinataires et transport simulé.
- Site : 31 pages, métadonnées uniques, H1, canonical, liens et ressources, sitemap ; vraies 404, cache des assets et HEAD.
- Performance : corps des articles exclus du JavaScript initial. Ce contrôle ne mesure pas les Core Web Vitals réels.

## Corrections réalisées
1. Navigation : laisser le navigateur gérer les ancres, liens externes, téléchargements et cibles explicites ; retirer les fragments du traitement des chemins et paramètres.
2. Dates : rejeter les dates calendaires impossibles, notamment 30 février ; conserver les années bissextiles valides.
3. API : répondre en JSON avec 400 pour JSON invalide et 413 pour formulaire trop volumineux, au lieu de 500 générique.
4. HTTP : ajout nosniff, interdiction d’intégration en iframe et politique de referrer limitant le partage des chemins hors origine.

## Suite priorisée
### P1 — Terminer le cycle métier
Le menu Factures indique explicitement une intégration non réalisée. Construire un vrai registre de factures et encaissements, distinct des proformas, avec numérotation, historique, documents et rapprochement. Valider les règles de facturation avec le responsable avant automatisation. Le suivi manuel du statut d’une demande ne constitue pas une preuve de paiement ni une acceptation signée.

### P1 — Durcir la collecte publique
POST /api/quotes est public par conception. Étudier une protection anti-abus distribuée et une clé d’idempotence de soumission : la déduplication des notifications d’un dossier ne déduplique pas deux créations de dossier. Le canal transmis par un visiteur ne doit pas constituer une provenance vérifiée. Pas de limitation générale des créations repérée dans le routeur inspecté.

### P1 — Sauvegarde et récupération
Vérifier la configuration cloud des sauvegardes/PITR, rétention et droits, puis tester une restauration dans une base isolée. Non vérifié par les tests SQLite ; aucune garantie de restauration formulée ici. Compléter l’audit des règles Firestore et de l’IAM avec les configurations réellement déployées.

### P2 — Fluidité du CRM
Vérifier avec le gérant les passages visite → devis → acceptation → planning. Distinguer les transitions manuelles et les preuves réelles. Compléter les tests de rôles commercial/secrétaire dans un environnement isolé. La liste d’accès reste gérée côté serveur.

### P2 — Qualité des données
La distance du formulaire est actuellement un résultat d’affichage, pas une donnée transmise au dossier. Décider d’une conservation datée et indicative, avec les adresses associées, sans en faire une distance contractuelle automatique.

### P2 — Mobile, accessibilité et performance
Audit clavier complet du CRM et formulaires, contrastes et lecture d’écran. Mesures réseau/mobile puis optimisation selon résultats ; ne pas assimiler réussite du build à performance terrain.

### P3 — Acquisition
Search Console, GA4 et Ads restent en attente de la disponibilité du client pour la connexion Google. Préparer une mesure consentie sans envoyer noms, e-mails, adresses ou paramètres de devis à Analytics. Aucun lancement de campagne dans cet audit.

## Tests de cette passe
npm run lint ; test:crm ; test:crm:devis ; test:crm:suivi ; test:server ; test:performance ; test:seo ; test-crm-lead-notification.mjs ; test-crm-customer-receipt.mjs ; test-crm-resend.mjs ; test-crm-dates.mjs ; npm run build.

## Contrôle public après publication
Accueil : HTTP 200. Lecture non authentifiée des demandes et brouillons : HTTP 401. Fichier .env.local : HTTP 404. En-têtes nosniff et DENY présents sur ces réponses. Aucun dossier public soumis pour ce contrôle.

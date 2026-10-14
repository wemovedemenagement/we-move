# Connexion et double authentification du CRM

## État préparé le 14 octobre 2026

- E-mail/mot de passe et Google : même compte Firebase, accès limité aux membres autorisés dont l’e-mail est vérifié.
- Depuis Mon profil → Sécurité du compte, un utilisateur Google peut ajouter un mot de passe après réauthentification. Aucun formulaire public de création de compte.
- Mot de passe oublié : message neutre, lien envoyé directement par Firebase. Ne pas utiliser de compte réel pour les tests automatiques.
- TOTP : parcours d’inscription (QR local + clé manuelle + validation du code) et défi de connexion implémentés. **Activation différée à la demande du gérant.**
- Aucun changement Identity Platform effectué. `CRM_TOTP_AVAILABLE` reste absent (donc false). La facturation réelle reste désactivée.

## Activation ultérieure (accord requis)

1. Valider le passage à Firebase Authentication avec Identity Platform et ses conditions de tarification.
2. Activer TOTP dans la configuration du projet sans supprimer d’autres fournisseurs. Conserver Google et e-mail/mot de passe.
3. Après vérification du service, définir `CRM_TOTP_AVAILABLE=true` en runtime et déployer.
4. Chaque membre associe lui-même son application et valide son code. Ne jamais enregistrer les clés ou codes dans les logs, le CRM, un ticket ou un service de QR externe.
5. Tester la connexion Google et mot de passe avec le second facteur sur un compte de recette autorisé, puis la reconnexion du gérant.

Le serveur refuse une session sans second facteur lorsque le compte Firebase possède un facteur inscrit, même si la session est antérieure à cette inscription. Le contrôle de révocation Firebase reste actif. L’activation est individuelle, pas obligatoire pour tous les membres.

## Perte de l’application

Il n’y a pas de codes de secours Firebase TOTP générés par cette interface ni de bouton permettant de contourner la vérification. Prévoir une sauvegarde sécurisée de l’application d’authentification. Un administrateur Firebase doit vérifier l’identité hors bande avant toute réinitialisation des facteurs et révocation des sessions. Pour le gérant unique, conserver un accès administrateur au projet Google distinct du parcours CRM, lui-même sécurisé.

## Validation

- `node scripts/test-crm-auth.mjs` : autorisation serveur, e-mail vérifié, révocation, rejet d’un jeton de premier facteur après inscription MFA, échec fermé si Firebase est indisponible.
- Contrôle navigateur isolé : connexion mobile, mot de passe invalide, récupération, défi MFA et état en attente d’activation. Appels Identity Toolkit simulés, aucun mail réel.
- Un test réel de bout en bout TOTP reste à effectuer lors de l’activation Identity Platform.

Documentation : https://firebase.google.com/docs/auth/web/totp-mfa

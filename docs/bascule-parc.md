# Bascule opérationnelle PARC → WE MOVE

Préparation au 1er octobre 2026. Aucune activation ou émission réelle effectuée dans cette préparation.

## Informations attendues du gérant

- Dernier numéro de facture effectivement émis dans PARC, avec son préfixe et ses zéros éventuels.
- Date de bascule souhaitée.
- Existence d’une seule série ou de séries distinctes (factures et avoirs, établissements, etc.). Le système actuel utilise une séquence commune aux factures et aux avoirs : vérifier la compatibilité avant activation.
- Confirmation de l’arrêt de toute nouvelle émission dans PARC au moment de la bascule.

## Parcours dans le CRM

1. Ouvrir **Factures → Facturation réelle → Paramètres** avec le rôle gérant.
2. Vérifier l’identité de la société, les conditions de règlement et les coordonnées bancaires éventuelles.
3. Renseigner le dernier numéro PARC et la date de bascule, puis enregistrer.
4. Vérifier un aperçu PDF depuis un brouillon réel. L’aperçu ne consomme aucun numéro et n’est pas envoyé.
5. Après confirmation des informations ci-dessus, autoriser l’activation côté serveur. Le gérant confirme ensuite la reprise dans le CRM ; cette action fixe la séquence et ne peut pas être réinitialisée.
6. Émettre uniquement la première facture correspondant à une opération réelle, vérifier son numéro puis confirmer son envoi au client.

## Anciennes factures et relances

Les anciennes factures PARC ne sont pas importées par cette bascule. Conserver leurs PDF, leur registre et leur suivi de règlement ; ne pas les recréer comme de nouvelles factures WE MOVE.

Les relances manuelles concernent les factures émises dans WE MOVE dont l’échéance est dépassée et le solde positif. Enregistrer les règlements et avoirs avant de préparer une relance. Vérifier le message et confirmer l’envoi. En cas de résultat d’envoi incertain, vérifier Resend avant toute nouvelle tentative.

Le raccordement à une plateforme de facturation électronique reste un chantier distinct. Les e-mails et PDF actuels ne constituent pas ce raccordement.

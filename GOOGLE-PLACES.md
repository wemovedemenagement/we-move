# Autocomplétion des adresses du devis

Le formulaire utilise le widget officiel `PlaceAutocompleteElement` de Google
Places (New), en français, avec une préférence pour la France. Les adresses
étrangères restent disponibles. L'adresse formatée sélectionnée est reprise
dans le récapitulatif et dans l'e-mail du devis.

Pour activer les suggestions :

1. Dans un projet Google Cloud avec facturation active, activer **Maps JavaScript
   API** et **Places API (New)**.
2. Créer une clé navigateur, restreinte à ces API et aux référents HTTP autorisés
   (par exemple `http://127.0.0.1:3002/*`, `http://localhost:3002/*` et le domaine
   public utilisé).
3. Ajouter `VITE_GOOGLE_MAPS_API_KEY=...` dans `.env.local`, puis relancer Vite.
   Configurer aussi cette variable dans l'environnement de compilation de production.

Une clé Vite est exposée au navigateur : utiliser les restrictions Google Cloud,
pas une clé serveur non restreinte. Ne pas committer `.env.local`.

Sans clé, en cas d'erreur Google ou sur demande du visiteur, la saisie manuelle
reste disponible. Aucun faux résultat n'est généré. Le widget conserve son
attribution Google et ne demande que `formattedAddress` à la sélection.

Documentation : https://developers.google.com/maps/documentation/javascript/place-autocomplete-new

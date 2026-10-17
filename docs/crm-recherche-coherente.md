# Recherche des dossiers

La page Demandes, la liste de travail du tableau de bord et la recherche globale partagent la même règle de correspondance dans `shared/crmSearch.mjs` : accents ignorés, plusieurs mots pouvant porter sur des champs différents, nom, téléphone, e-mail, référence du dossier, adresses et responsable.

Les numéros français sont recherchables en format national, `+33` ou `0033`, avec espaces, parenthèses et tirets. La notation `+33 (0)` est aussi reconnue. Les formes normalisées sont uniquement des clés de recherche : aucune donnée du dossier n'est réécrite. Un numéro étranger n'est pas transformé en numéro français.

Les modules filtrent leurs dossiers avec un prédicat compilé une fois pour la saisie courante. Ils conservent leur propre tri, leur pagination et leurs règles de sélection. La recherche globale conserve son classement de pertinence et sa limite de résultats. Les filtres de source, de statut, d'échéance et de responsable restent cumulatifs.

La recherche n'ajoute ni requête réseau ni écriture. Les vérifications couvrent équivalence des résultats, combinaison nom/ville/téléphone, formats français, maintien du tri, absence de mutation et parcours navigateur dans les trois points d'entrée. Les actions en masse ne sont pas exécutées pour tester la recherche.

# Publication et vérification SEO

## Compilation

1. Vérifier `VITE_SITE_URL` dans l’environnement de production (origine sans chemin, par exemple `https://wemove.fr`). La même valeur alimente Vite et le pré-rendu.
2. Exécuter `npm run lint`, puis `npm run build` et `npm run test:seo`.
3. Publier le contenu de `dist/`, pas le serveur de développement Vite.

La compilation produit 21 pages, `/404.html`, `/sitemap.xml`, `/sitemap-blog.xml` (conservé pour compatibilité) et `/robots.txt`. Les pages légales sont exclues du sitemap et portent `noindex,follow`. Le fichier `robots.txt` permet leur exploration pour que la directive soit lue. Les paramètres de devis et d’inventaire ne créent pas de canoniques supplémentaires.

## Règles à appliquer chez l’hébergeur

- Servir les répertoires existants via leur `index.html` avant toute règle de réécriture.
- Rediriger HTTP vers HTTPS et la variante www vers l’origine choisie, en conservant chemin et paramètres.
- Normaliser les URL connues vers le slash final. Ne pas rediriger une page inconnue vers l’accueil.
- Servir les adresses inconnues avec HTTP 404 et le contenu de `/404.html`. Un fallback universel vers l’accueil avec HTTP 200 produit des soft 404 et des métadonnées inadaptées.
- Autoriser les fichiers JS/CSS/images et les PDF. Mise en cache longue pour les assets hachés ; renouvellement rapide du HTML, du sitemap et de robots.txt.
- Si une ancienne URL est effectivement connue et remplacée, créer une redirection permanente individuelle. Aucun slug historique d’article n’a été changé.

Le dépôt ne précise pas le fournisseur d’hébergement. Aucune configuration fournisseur ni redirection live n’a donc été inventée. Le serveur Vite local n’est pas un test des statuts HTTP de production.

## Recette après déploiement

Vérifier au minimum accueil, particuliers, monte-meubles, volume, un article, une page légale et une URL aléatoire : code HTTP, un seul title, une seule canonique, H1, contenu dans la source sans JS, image Open Graph accessible. Comparer les métadonnées avec celles obtenues après navigation interne.

Dans Search Console : vérifier le domaine, soumettre `/sitemap.xml`, inspecter un échantillon de pages et contrôler les exclusions. Une soumission ne garantit ni indexation ni classement. Tester les données structurées et la performance mobile sur le domaine publié. Reporter les résultats réels dans le suivi avant/après.

## Fichiers de maintenance

- `src/data/siteSeo.ts` : intentions, métadonnées et schémas des routes.
- `src/data/articles.ts`, `src/data/articleResources.ts` : guides et références utiles.
- `src/data/seoContent.ts` : contenus pratiques et liens des pages de services.
- `scripts/render-site.tsx` : correspondance des composants et des routes. Toute nouvelle page doit y être ajoutée ainsi qu’au routeur et au référentiel SEO.
- `scripts/prerender-site.mjs` : HTML, robots et sitemaps.
- `scripts/test-seo.mjs` : contrôles du résultat compilé.

L’application conserve `createRoot` : le HTML pré-rendu est remplacé par la version interactive au démarrage. Le contenu statique est destiné à tous les visiteurs et aux robots ; il utilise les mêmes composants et contenus, sans cloaking. Les formulaires et le calculateur nécessitent JavaScript pour leur fonctionnement.

## Firebase App Hosting (configuration ajoutée après le journal de build)

Le backend fourni utilise Firebase App Hosting. Le projet définit désormais `apphosting.yaml` avec `npm run build` et `npm start`. Le serveur `server.mjs` sert les fichiers pré-rendus de `dist/` sur `0.0.0.0:$PORT` ; il conserve les paramètres lors de la redirection vers les répertoires, renvoie HTTP 404 pour les pages inconnues et applique un cache long aux assets hachés.

Le conflit constaté pendant `npm prune --production` venait d’esbuild 0.25 alors que Vite 8.3 demande esbuild 0.27 ou 0.28. La dépendance directe et `package-lock.json` sont alignés sur 0.28. Aucune option `--force` ou `--legacy-peer-deps` n’est nécessaire.

Validation reproductible dans une copie propre : `npm ci`, `npm run build`, `npm run test:seo`, `npm prune --production`, puis `npm run test:server`. Ne pas exécuter le prune dans le répertoire du serveur de développement actif : il enlève les dépendances de développement.

Le journal du 25/09/2026 pointe encore sur `a728c81`. Il faut publier un nouveau commit incluant les sources, le lockfile, les scripts, les nouveaux contenus et les assets, puis lancer un déploiement sur ce commit. Relancer l’ancien commit reproduira l’ancienne configuration. Les redirects de domaine/HTTPS et le domaine canonique restent à vérifier sur le backend réel après publication.

Références : [configuration App Hosting](https://firebase.google.com/docs/app-hosting/configure), [frameworks et application Express](https://firebase.google.com/docs/app-hosting/frameworks-tooling). Express avec build/start est accepté au mieux par App Hosting ; sa compatibilité finale doit être confirmée par le prochain déploiement cloud.

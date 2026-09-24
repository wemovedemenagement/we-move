# Articles et SEO

Les six guides sont accessibles sous `/blog/<slug>/`. Les anciennes URL
`/blog/?article=<slug>` restent compatibles grâce au routeur client.

`npm run build` génère, pour chaque guide, un fichier
`dist/blog/<slug>/index.html` contenant le texte, les liens, les métadonnées,
la balise canonique et les données structurées BlogPosting et BreadcrumbList.
Le sitemap des articles est généré dans `dist/sitemap-blog.xml`.

Avant publication, définir `VITE_SITE_URL` dans `.env.production` si le domaine
public diffère de `https://wemove.fr`, puis reconstruire. Servir les fichiers
HTML générés en priorité avant toute réécriture vers l'application. Configurer
l'hébergement pour retourner un statut HTTP 404 sur les slugs inconnus ; le
routeur affiche déjà une page introuvable et une balise `noindex`.

Soumettre `/sitemap-blog.xml` dans Google Search Console après publication.
Si les anciennes URL étaient indexées, configurer aussi une redirection HTTP
301 sur l'hébergement : la compatibilité actuelle est une navigation client.

Les dates de publication ne sont pas inventées. Les ajouter aux contenus et
aux données structurées uniquement lorsqu'elles sont connues et affichées.

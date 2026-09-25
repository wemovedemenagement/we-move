export const ARTICLE_RESOURCES: Record<string, { label: string; href: string; external?: boolean }[]> = {
  'demenagement-sans-ascenseur-paris': [
    { label: 'Nos formules pour déménager un appartement', href: '/demenagement-particuliers/' },
    { label: 'Faire étudier un passage par monte-meubles', href: '/location-monte-meubles/' },
    { label: 'Comprendre les postes du devis', href: '/blog/prix-demenagement-paris-devis/' },
    { label: 'Stationnement et monte-meubles : démarches de la Ville de Paris', href: 'https://www.paris.fr/pages/faq-demenagements-4404', external: true },
  ],
  'prix-demenagement-paris-devis': [
    { label: 'Calculer mon volume avant de demander un devis', href: '/volume/' },
    { label: 'Comparer les formules de déménagement We Move', href: '/demenagement-particuliers/' },
    { label: 'Préparer ma demande de devis', href: '/devis/' },
    { label: 'Devis et documents du déménageur : la fiche Service Public', href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F33997', external: true },
  ],
  'checklist-demenagement-paris': [
    { label: 'Préparer un déménagement de particulier', href: '/demenagement-particuliers/' },
    { label: 'Estimer le volume de ses meubles', href: '/volume/' },
    { label: 'Comprendre le prix et comparer les devis', href: '/blog/prix-demenagement-paris-devis/' },
    { label: 'Stationnement de déménagement : les démarches de la Ville de Paris', href: 'https://www.paris.fr/pages/faq-demenagements-4404', external: true },
    { label: 'Déclarer son changement d’adresse sur Service Public', href: 'https://www.service-public.gouv.fr/particuliers/vosdroits/R11193', external: true },
  ],
  'comment-estimer-volume-m3': [{ label: 'Utiliser le calculateur de volume gratuit', href: '/volume/' }, { label: 'Choisir une formule de déménagement', href: '/demenagement-particuliers/' }],
  'monte-meuble-passage-difficile': [{ label: 'Préparer un déménagement sans ascenseur', href: '/blog/demenagement-sans-ascenseur-paris/' }, { label: 'Location de monte-meubles à Paris et en Île-de-France', href: '/location-monte-meubles/' }, { label: 'Stationnement et monte-meubles : les démarches à Paris', href: 'https://www.paris.fr/pages/faq-demenagements-4404', external: true }],
  'transfert-entreprise-continuite-activite': [{ label: 'Notre service de transfert de bureaux en Île-de-France', href: '/demenagement-entreprises/' }, { label: 'Étudier un stockage de mobilier de bureau', href: '/stockage-garde-meubles/' }],
  'garder-meubles-securise-paris': [{ label: 'Notre accompagnement en garde-meubles', href: '/stockage-garde-meubles/' }, { label: 'Calculer le volume à stocker', href: '/volume/' }],
  'proteger-objets-fragiles-demenagement': [{ label: 'Nos formules de déménagement et d’emballage', href: '/demenagement-particuliers/' }, { label: 'Consulter la checklist du déménagement', href: '/blog/checklist-demenagement-paris/' }],
};

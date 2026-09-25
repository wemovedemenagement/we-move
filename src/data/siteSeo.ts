import { BLOG_ARTICLES } from './articles';
import { articleSeo, SITE_URL } from './blogSeo';

export const SITE_PAGES: Record<string, { title: string; description: string; name: string; service?: string; noindex?: boolean }> = {
  '/': { name: 'Accueil', title: 'Déménagement à Paris et en Île-de-France | We Move', description: 'Déménagement de particuliers et d’entreprises à Paris et en Île-de-France, garde-meubles et monte-meubles. Préparez votre projet avec We Move : devis gratuit.' },
  '/services/': { name: 'Services', title: 'Services de déménagement à Paris et en Île-de-France | We Move', description: 'Comparez nos services : déménagement de particuliers, transfert de bureaux, stockage et location de monte-meubles. Un accompagnement adapté à votre projet.' },
  '/demenagement-particuliers/': { name: 'Déménagement de particuliers', service: 'Déménagement de particuliers', title: 'Déménagement de particuliers à Paris et en IDF | We Move', description: 'Préparez votre déménagement d’appartement ou de maison en Île-de-France : volume, emballage, accès et transport. Découvrez nos formules et demandez un devis.' },
  '/demenagement-entreprises/': { name: 'Déménagement d’entreprises', service: 'Transfert de bureaux et déménagement d’entreprises', title: 'Déménagement d’entreprises et bureaux en IDF | We Move', description: 'Organisez votre transfert de bureaux à Paris et en Île-de-France : inventaire, planning, mobilier et coordination des accès. Étudions votre projet professionnel.' },
  '/stockage-garde-meubles/': { name: 'Stockage et garde-meubles', service: 'Stockage et garde-meubles', title: 'Garde-meubles à Paris et en Île-de-France | We Move', description: 'Entre deux logements ou pendant des travaux, préparez le stockage de vos meubles : volume, durée, transport et restitution. Demandez une proposition adaptée.' },
  '/location-monte-meubles/': { name: 'Location de monte-meubles', service: 'Location de monte-meubles', title: 'Location de monte-meubles à Paris et en IDF | We Move', description: 'Escalier étroit ou mobilier volumineux ? Faites étudier une intervention de monte-meubles à Paris et en Île-de-France selon la façade, les accès et le stationnement.' },
  '/secteurs/': { name: 'Secteurs d’intervention', title: 'Déménagement en Île-de-France : nos secteurs | We Move', description: 'Retrouvez nos secteurs de déménagement : Paris, Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne, Yvelines, Essonne, Val-d’Oise et Seine-et-Marne.' },
  '/qui-sommes-nous/': { name: 'À propos de We Move', title: 'We Move : votre équipe de déménagement à Paris', description: 'Découvrez l’approche We Move : préparation du déménagement, soin du mobilier et accompagnement des particuliers et entreprises à Paris et en Île-de-France.' },
  '/blog/': { name: 'Conseils déménagement', title: 'Conseils et guides de déménagement en Île-de-France | We Move', description: 'Checklist, calcul du volume, emballage des objets fragiles, stockage et transfert de bureaux : nos guides pratiques pour préparer votre déménagement.' },
  '/volume/': { name: 'Calculateur de volume', title: 'Calculateur de volume de déménagement gratuit (m³) | We Move', description: 'Estimez votre volume de déménagement pièce par pièce : meubles, électroménager et cartons. Enregistrez votre inventaire et préparez votre devis We Move.' },
  '/devis/': { name: 'Devis de déménagement', title: 'Devis de déménagement à Paris et en IDF | We Move', description: 'Préparez votre demande de devis de déménagement : adresses, date, volume et prestations. Un parcours simple pour préciser votre projet, sans engagement.' },
  '/contact/': { name: 'Contact', title: 'Contacter We Move pour votre déménagement en IDF', description: 'Une question sur votre déménagement à Paris ou en Île-de-France ? Contactez We Move au 01 73 74 36 90 ou préparez votre demande de devis en ligne.' },
  '/mentions-legales/': { name: 'Mentions légales', title: 'Mentions légales | We Move', description: 'Informations relatives à l’éditeur du site We Move, aux contenus et aux responsabilités.', noindex: true },
  '/politique-confidentialite/': { name: 'Confidentialité', title: 'Politique de confidentialité et RGPD | We Move', description: 'Consultez les informations relatives au traitement de vos données personnelles, aux cookies et à l’exercice de vos droits auprès de We Move.', noindex: true },
  '/cgv/': { name: 'Conditions générales de vente', title: 'Conditions générales de vente du déménagement | We Move', description: 'Consultez les conditions générales de vente du contrat de déménagement We Move : prix, prestations, responsabilités et livraison.', noindex: true },
};

export function routeSeo(pathname: string, origin = SITE_URL) {
  const article = BLOG_ARTICLES.find(item => pathname === `/blog/${item.slug}/`);
  const page = SITE_PAGES[pathname];
  const missing = !article && !page;
  const entityId = origin + '/#organization';
  const organization = { '@type': 'Organization', '@id': entityId, name: 'We Move', url: origin + '/', telephone: '+33173743690', email: 'contact@wemove.fr', areaServed: { '@type': 'AdministrativeArea', name: 'Île-de-France' } };
  const base = article ? articleSeo(article, origin) : {
    title: page?.title || 'Page introuvable | We Move',
    description: page?.description || 'Cette page est introuvable. Retrouvez les services de déménagement et les conseils We Move.',
    url: origin + pathname,
    image: origin + '/images/we-move-demenagement-paris-hero.webp',
  };
  const schema = article ? articleSeo(article, origin).schema : { '@context': 'https://schema.org', '@graph': [organization, { '@type': 'WebSite', '@id': origin + '/#website', url: origin + '/', name: 'We Move', inLanguage: 'fr-FR', publisher: { '@id': entityId } }, { '@type': 'WebPage', '@id': base.url + '#webpage', url: base.url, name: base.title, description: base.description, inLanguage: 'fr-FR', isPartOf: { '@id': origin + '/#website' } }, ...(page?.service ? [{ '@type': 'Service', '@id': base.url + '#service', name: page.service, serviceType: page.service, url: base.url, provider: { '@id': entityId }, areaServed: { '@type': 'AdministrativeArea', name: 'Île-de-France' } }] : [])] };
  return { ...base, schema, missing, robots: missing || page?.noindex ? 'noindex,follow' : 'index,follow', type: article ? 'article' : 'website', imageAlt: article?.alt || 'We Move Déménagement' };
}

export interface SeoContentEntry {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; text: string }[];
  links: { href: string; label: string }[];
}

/** Practical supporting content: one search intent per existing page. */
export const SEO_CONTENT: Record<string, SeoContentEntry> = {
  '/': {
    eyebrow: 'BIEN PRÉPARER VOTRE PROJET',
    title: 'Votre déménagement à Paris et en Île-de-France, étape par étape',
    intro: 'Un déménagement se prépare à partir de votre situation réelle : un appartement parisien sans ascenseur, une maison en grande couronne ou des bureaux à transférer. Avant de choisir une prestation, réunissez les informations qui permettront d’organiser le départ et l’arrivée.',
    sections: [
      { title: 'Décrire les deux adresses', text: 'Indiquez les étages, les dimensions utiles de l’ascenseur, la présence d’une cour et la distance entre le camion et l’entrée. Un accès simple à destination peut demander une autre organisation au départ. Photos et dimensions aident à comprendre ces différences.' },
      { title: 'Choisir les prestations utiles', text: 'Commencez par inventorier les biens à transporter, puis précisez ce que vous souhaitez préparer vous-même : cartons, objets fragiles ou démontage. Le devis permet de définir le périmètre retenu, les moyens nécessaires et les éventuelles options de stockage ou de monte-meubles.' },
    ],
    links: [{ href: '/demenagement-particuliers/', label: 'Déménagement de particuliers' }, { href: '/demenagement-entreprises/', label: 'Transfert de bureaux' }, { href: '/secteurs/', label: 'Nos secteurs en Île-de-France' }],
  },
  '/demenagement-particuliers/': {
    eyebrow: 'LES REPÈRES POUR VOTRE LOGEMENT',
    title: 'Préparer son déménagement de particulier en Île-de-France',
    intro: 'Pour déménager un studio à Paris, un appartement en petite couronne ou une maison en Île-de-France, la surface ne suffit pas à définir les moyens nécessaires. Le volume réel du mobilier, les accès aux deux logements et les prestations choisies permettent de préparer une proposition adaptée.',
    sections: [
      { title: 'Les informations qui font la différence', text: 'Recensez les meubles, l’électroménager et les cartons, sans oublier cave, balcon et garage. Précisez les étages, la taille de l’ascenseur et la distance de portage. Pour une armoire ou un canapé encombrant, indiquez les dimensions et les possibilités de démontage. Des photos des passages étroits facilitent l’étude du projet.' },
      { title: 'Comparer les formules à périmètre égal', text: 'Vérifiez qui prépare les cartons, protège les objets fragiles et démonte les meubles. Identifiez les prestations incluses et les options dans chaque devis. Si les dates de départ et de remise des clés diffèrent, signalez-le dès la demande : un stockage temporaire et une livraison différée peuvent être étudiés. La disponibilité et les conditions se confirment avec l’équipe.' },
    ],
    links: [{ href: '/volume/', label: 'Calculer mon volume en m³' }, { href: '/blog/checklist-demenagement-paris/', label: 'La checklist de déménagement' }, { href: '/stockage-garde-meubles/', label: 'Stocker entre deux logements' }],
  },
  '/demenagement-entreprises/': {
    eyebrow: 'LES REPÈRES POUR VOS ÉQUIPES',
    title: 'Organiser un transfert de bureaux à Paris et en Île-de-France',
    intro: 'Un déménagement d’entreprise concerne autant les personnes que le mobilier. Pour préparer un transfert de bureaux en Île-de-France, partez du nombre de postes, des espaces à vider et de l’organisation souhaitée dans les nouveaux locaux. Ces éléments permettent de construire un calendrier avec vos référents.',
    sections: [
      { title: 'Un inventaire relié au plan d’arrivée', text: 'Attribuez un repère à chaque bureau, carton et équipement, puis reportez-le sur le plan des locaux. Identifiez séparément les archives, les salles de réunion et les éléments volumineux. À Paris comme en périphérie, vérifiez les accès de livraison, les dimensions du monte-charge et les créneaux imposés par le gestionnaire de l’immeuble.' },
      { title: 'Préparer la reprise avec votre équipe informatique', text: 'Définissez les postes prioritaires et les périodes pendant lesquelles une interruption est possible. Les sauvegardes, la déconnexion, le réseau et les tests de remise en service sont à organiser avec votre responsable informatique. Le devis précise le périmètre du déménageur ; les interventions en plusieurs phases ou en horaires décalés restent à étudier selon les contraintes et les disponibilités.' },
    ],
    links: [{ href: '/blog/transfert-entreprise-continuite-activite/', label: 'Préparer le transfert de ses bureaux' }, { href: '/stockage-garde-meubles/', label: 'Étudier un stockage de mobilier' }, { href: '/devis/?service=entreprises', label: 'Demander un devis entreprise' }],
  },
  '/location-monte-meubles/': {
    eyebrow: 'LES REPÈRES POUR VOS ACCÈS',
    title: 'Louer un monte-meubles à Paris et en Île-de-France : que prévoir ?',
    intro: 'Un meuble qui ne franchit pas un palier ou un ascenseur trop petit peut conduire à étudier un passage par l’extérieur. La location d’un monte-meubles avec technicien se prépare à partir du mobilier concerné et de la configuration du bâtiment, et non du seul numéro d’étage.',
    sections: [
      { title: 'Vérifier la faisabilité avant de réserver', text: 'Transmettez les dimensions et le poids connu des objets, ainsi que des photos de la façade et de l’ouverture envisagée. Signalez arbres, câbles, balcons, cour intérieure ou recul limité. La hauteur atteignable et la charge admise dépendent de l’appareil et de son installation : elles doivent être confirmées pour votre intervention.' },
      { title: 'Anticiper l’emplacement et la manutention', text: 'Précisez si l’installation est envisagée sur la rue ou dans un espace privé. Les conditions d’accès et les éventuelles démarches de stationnement doivent être clarifiées en amont auprès des interlocuteurs concernés. Vérifiez aussi dans le devis la durée retenue, les opérations prises en charge par le technicien et la manutention prévue de chaque côté de l’ouverture.' },
    ],
    links: [{ href: '/blog/monte-meuble-passage-difficile/', label: 'Évaluer un passage difficile' }, { href: '/demenagement-particuliers/', label: 'Préparer un déménagement complet' }, { href: '/devis/?service=monte-meubles', label: 'Décrire mon besoin de monte-meubles' }],
  },
  '/stockage-garde-meubles/': {
    eyebrow: 'LES REPÈRES POUR VOS BIENS',
    title: 'Choisir un garde-meubles pour un projet à Paris ou en Île-de-France',
    intro: 'Entre deux logements ou pendant des travaux, le stockage se prépare en fonction de ce que vous confiez et de la manière dont vous souhaitez le récupérer. Pour votre projet en Île-de-France, précisez le volume, la durée envisagée et le besoin éventuel de transport depuis votre adresse.',
    sections: [
      { title: 'Distinguer stockage et accès régulier', text: 'Avez-vous besoin de retrouver un carton chaque semaine ou de conserver tout votre mobilier jusqu’à votre installation ? Faites préciser les modalités d’accès, les horaires, les conditions de retrait et les objets admis. Le lieu de stockage, ses conditions de conservation et les garanties applicables sont à confirmer dans la proposition qui vous est remise.' },
      { title: 'Prévoir aussi la sortie du mobilier', text: 'Établissez un inventaire et identifiez les cartons sur plusieurs faces. Les meubles doivent être préparés selon leurs matériaux et les conditions de stockage prévues. Anticipez la date de restitution, les accès à la future adresse et la livraison éventuelle. Pour comparer les devis, regardez séparément le transport, les protections, le stockage et les modalités de prolongation de la durée.' },
    ],
    links: [{ href: '/volume/', label: 'Estimer mon volume à stocker' }, { href: '/blog/garder-meubles-securise-paris/', label: 'Les questions avant de stocker' }, { href: '/devis/?service=stockage', label: 'Demander une proposition de stockage' }],
  },
  '/secteurs/': {
    eyebrow: 'PARIS, PETITE ET GRANDE COURONNE',
    title: 'Préparer un déménagement entre deux villes d’Île-de-France',
    intro: 'La distance entre deux communes ne résume pas un déménagement. Un trajet court entre Paris et la petite couronne peut demander une préparation précise des accès, alors qu’un départ vers une maison en grande couronne présente d’autres contraintes de portage et de chargement.',
    sections: [
      { title: 'Une organisation pour chaque adresse', text: 'Relevez les étages, ascenseurs, cours, voies d’accès et possibilités de stationnement au départ et à l’arrivée. Les règles d’accès à un immeuble et les éventuelles démarches sur la voirie doivent être vérifiées auprès des interlocuteurs concernés pour chacune des deux adresses.' },
      { title: 'Au-delà de l’Île-de-France', text: 'Pour quitter la région parisienne, précisez la date de libération du logement et celle à laquelle la livraison est possible. Un inventaire à jour permet d’étudier le transport et, si nécessaire, une période de stockage. Le calendrier se définit avec l’équipe selon le trajet et les prestations retenues.' },
    ],
    links: [{ href: '/demenagement-particuliers/', label: 'Déménager mon logement' }, { href: '/demenagement-entreprises/', label: 'Transférer mon entreprise' }, { href: '/devis/', label: 'Faire étudier mon trajet' }],
  },
  '/volume/': {
    eyebrow: 'COMPRENDRE VOTRE ESTIMATION',
    title: 'Comment calculer le volume d’un déménagement en m³ ?',
    intro: 'Le calculateur additionne des volumes indicatifs à partir de votre inventaire. Il vous aide à préparer une demande de devis ; il ne remplace pas la vérification des dimensions du mobilier et des conditions de chargement par l’équipe.',
    sections: [
      { title: 'Compter ce qui part réellement', text: 'Passez en revue chaque pièce, puis les espaces annexes : cave, garage, balcon et placards. Ajoutez les cartons contenant vos affaires en plus du mobilier. Après un tri ou une vente, ajustez votre inventaire pour conserver une estimation utile.' },
      { title: 'Repérer les objets atypiques', text: 'Pour un meuble simple, longueur × largeur × hauteur, mesurées en mètres, donne le volume extérieur en m³. La configuration de transport, les protections et les éléments non empilables influencent la place nécessaire. Signalez les objets fragiles ou encombrants et faites confirmer le volume avant de réserver les moyens de transport.' },
    ],
    links: [{ href: '/blog/comment-estimer-volume-m3/', label: 'Le guide du calcul de volume' }, { href: '/demenagement-particuliers/', label: 'Comparer les formules de déménagement' }, { href: '/stockage-garde-meubles/', label: 'Préparer un garde-meubles' }],
  },
};

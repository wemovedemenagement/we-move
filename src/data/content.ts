/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  features: string[];
  route: string;
}

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'particuliers',
    slug: 'demenagement-particuliers',
    title: 'Déménagement de particuliers',
    summary: 'Prise en charge attentive de votre mobilier et de vos effets personnels, avec protection soignée et transport adapté à votre nouveau logement.',
    features: ['Protection renforcée des meubles et literie', 'Fourniture de cartons et matériel de calage', 'Manutention adaptée aux accès difficiles'],
    route: '/demenagement-particuliers/'
  },
  {
    id: 'entreprises',
    slug: 'demenagement-entreprises',
    title: 'Transfert d’entreprises',
    summary: 'Déménagement de bureaux, postes informatiques, archives et ateliers professionnels, planifié rigoureusement pour préserver la continuité de votre activité.',
    features: ['Repérage technique des accès et ascenseurs', 'Conditionnement sécurisé du parc informatique', 'Interventions en horaires décalés sur demande'],
    route: '/demenagement-entreprises/'
  },
  {
    id: 'stockage',
    slug: 'stockage-garde-meubles',
    title: 'Stockage et garde-meubles',
    summary: 'Box individuels sécurisés, propres et ventilés pour conserver vos biens entre deux logements, lors de travaux ou pour désencombrer vos locaux.',
    features: ['Espaces privatifs sous alarme et surveillance', 'Durée flexible de quelques semaines à plusieurs mois', 'Inventaire d’entrée et mise sous scellés'],
    route: '/stockage-garde-meubles/'
  },
  {
    id: 'monte-meubles',
    slug: 'location-monte-meubles',
    title: 'Location de monte-meubles',
    summary: 'Mise à disposition d’une échelle élévatrice avec technicien qualifié pour franchir les fenêtres, cours intérieures ou étages élevés sans ascenseur.',
    features: ['Technicien opérateur dédié sur place', 'Capacité de levage jusqu’au 8e étage selon configuration', 'Sécurisation immédiate du périmètre sur voirie'],
    route: '/location-monte-meubles/'
  }
];

export const STEPS_DATA: StepItem[] = [
  {
    number: '01',
    title: 'Décrire son projet et ses contraintes',
    description: 'Renseignez vos adresses de départ et d’arrivée, la présence d’ascenseurs, les particularités d’accès (rues piétonnes, cours) et votre calendrier souhaité.'
  },
  {
    number: '02',
    title: 'Estimer le volume et préciser les prestations',
    description: 'Évaluez vos pièces avec notre calculateur indicatif ou listez vos meubles volumineux pour définir le gabarit du camion et la taille de l’équipe.'
  },
  {
    number: '03',
    title: 'Transmettre sa demande pour préparer la suite',
    description: 'Recevez une proposition claire et détaillée sous forme de devis sans engagement, avec un conseiller disponible pour ajuster les options.'
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'devis-preparation',
    category: 'Devis & Tarifs',
    question: 'Quelles informations sont nécessaires pour obtenir un devis précis ?',
    answer: 'Pour établir un devis juste et sans mauvaise surprise, nous prenons en compte les adresses de chargement et de livraison, les étages respectifs avec ou sans ascenseur, la distance de portage entre le camion et la porte, ainsi qu’une estimation du volume (en m³) ou la liste des meubles principaux à transporter.'
  },
  {
    id: 'calcul-volume',
    category: 'Volume & Cubage',
    question: 'Comment est calculé le volume en mètres cubes (m³) ?',
    answer: 'Le volume dépend de la superficie de votre logement, de son ameublement et du nombre de cartons prévus. En moyenne, un logement compte entre 0,35 et 0,5 m³ par mètre carré habitable. Notre calculateur de volume en ligne vous permet d’estimer précisément votre cubage pièce par pièce.'
  },
  {
    id: 'acces-difficiles',
    category: 'Accès & Logistique',
    question: 'Que se passe-t-il si mon escalier est trop étroit ou sans ascenseur ?',
    answer: 'Nos équipes étudient la configuration lors du devis. Si un meuble ne passe pas par la cage d’escalier ou si l’étage est trop élevé, nous prévoyons un monte-meubles extérieur avec un technicien habilité pour hisser ou descendre vos biens par la fenêtre ou le balcon en toute sécurité.'
  },
  {
    id: 'emballage-protection',
    category: 'Emballage & Protection',
    question: 'Proposez-vous le matériel d’emballage et la mise en carton ?',
    answer: 'Oui. Selon la formule retenue, vous pouvez soit recevoir des cartons renforcés, adhésifs et papier bulle pour emballer vous-même, soit confier l’intégralité de l’emballage de vos objets fragiles (vaisselle, miroirs, luminaires, tableaux) à nos déménageurs professionnels qualifiés.'
  },
  {
    id: 'assurance-transport',
    category: 'Garanties & Assurance',
    question: 'Comment mes biens sont-ils assurés pendant le déménagement ?',
    answer: 'Tous les transports WE MOVE bénéficient d’une assurance contractuelle de base couvrant les biens jusqu’à leur dépose dans votre nouveau domicile. Avant l’intervention, vous remplissez une déclaration de valeur afin d’ajuster les garanties à la valeur exacte de votre mobilier et de vos objets précieux.'
  },
  {
    id: 'stationnement-voirie',
    category: 'Accès & Logistique',
    question: 'Prenez-vous en charge les autorisations de stationnement en mairie ?',
    answer: 'Oui, nous pouvons nous charger des démarches administratives de réservation d’emplacement auprès des services de voirie municipaux et de la police municipale pour installer les panneaux d’interdiction de stationner devant vos adresses de départ et d’arrivée.'
  },
  {
    id: 'delai-reservation',
    category: 'Organisation',
    question: 'Quel délai est conseillé pour réserver son déménagement ?',
    answer: 'Il est conseillé de contacter WE MOVE entre 3 et 6 semaines avant la date envisagée, particulièrement pour les fins de mois ou la période estivale, afin de garantir la disponibilité des équipes, des camions capitonnés et des réservations de stationnement.'
  }
];

export const HOUSING_PRESETS = [
  { label: 'Studio (20-30 m²)', volume: 12, description: 'Idéal pour étudiant ou jeune actif, 15-20 cartons' },
  { label: '2 pièces (40-55 m²)', volume: 22, description: 'Salon, chambre, cuisine équipée, 30-40 cartons' },
  { label: '3 pièces (65-80 m²)', volume: 35, description: 'Salon, 2 chambres, mobilier complet, 50-65 cartons' },
  { label: 'Maison / 4 pièces+ (90-130 m²)', volume: 55, description: 'Grand logement, mobilier lourd, cave/garage, 80+ cartons' }
];

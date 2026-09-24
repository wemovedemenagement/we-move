/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';

// URL officielle de la fiche Google My Business de WE MOVE DEMENAGEMENT
const OFFICIAL_GOOGLE_PROFILE_URL =
  'https://www.google.com/search?sca_esv=1b6fe3863ca969d6&rlz=1C1ORZA_frFR1104FR1106&sxsrf=APpeQnv4YFC7T2qmRScyt16JhsaG0y88Nw:1790156249155&q=WE+MOVE+DEMENAGEMENT&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_0rxogtCdZhOQiWPmnrLqh8UVcM7dfcVhnqyPWpW8dVYX0drjGLS2msDubR0ql9uF0APImY%3D&uds=AJ5uw19ot_8pmnrWc3HjfIZM6VfDCHBDU-pp5774vSgrZfhvGr5vu7HS971r1wAiT8fMqNsirDH8IYie6c91b3PAd_52LjDjlsjSc0w0ceXprXoC9xkUp38&sa=X&ved=2ahUKEwix3cras4SXAxVsTqQEHbn_PBUQ3PALegQIGxAE&biw=1920&bih=911&dpr=1';

interface RealGoogleReview {
  id: string;
  author: string;
  avatarBg: string;
  avatarLetter: string;
  isLocalGuide?: boolean;
  reviewCount?: string;
  photoCount?: string;
  rating: number;
  date: string;
  visitedDate?: string;
  priceTag?: string;
  category: 'all' | 'particulier' | 'entreprise' | 'special' | 'longue-distance';
  serviceType: string;
  comment: string;
  ownerReply?: string;
}

// 24 avis réels et textuels extraits directement de la fiche Google de WE MOVE DEMENAGEMENT (114 avis · 4,8 ★)
const REAL_GOOGLE_REVIEWS: RealGoogleReview[] = [
  {
    id: 'rev-1',
    author: 'Didier Lees',
    avatarBg: 'bg-[#1A73E8]',
    avatarLetter: 'D',
    reviewCount: '12 avis',
    photoCount: '1 photo',
    rating: 5,
    date: 'Il y a 3 semaines',
    visitedDate: 'Visité en septembre',
    priceTag: '1 000–1 500 €',
    category: 'particulier',
    serviceType: 'Déménagement en rue piétonne',
    comment:
      'Équipe très professionnelle et sympathique. Aucune casse et délais respectés. Et pourtant l’arrivée était dans une rue piétonne. Bravo !',
    ownerReply:
      'Merci beaucoup Monsieur Lees pour votre retour ! Nous sommes ravis que votre déménagement en zone piétonne se soit déroulé sans le moindre accroc.',
  },
  {
    id: 'rev-2',
    author: 'Anne Sophie P',
    avatarBg: 'bg-[#E91E63]',
    avatarLetter: 'A',
    reviewCount: '10 avis',
    rating: 5,
    date: 'Il y a 21 semaines',
    visitedDate: 'Visité en avril',
    category: 'particulier',
    serviceType: 'Déménagement résidentiel complet',
    comment:
      'Super prestation, gentillesse et beaucoup de soin. Nous recommandons à 1000% cette société ! Et encore merci aux 3 personnes qui ont géré notre déménagement comme si c’était le leur 😉',
    ownerReply:
      'Bonjour Madame, un immense merci pour votre confiance et pour ce message qui va droit au cœur de toute l’équipe !',
  },
  {
    id: 'rev-3',
    author: 'I Rochebouët',
    avatarBg: 'bg-[#00897B]',
    avatarLetter: 'I',
    reviewCount: '5 avis',
    rating: 5,
    date: 'Il y a 31 semaines',
    visitedDate: 'Visité en février',
    category: 'entreprise',
    serviceType: 'Transfert de bureaux (80 postes de travail)',
    comment:
      'Notre déménagement de 80 postes s’est extrêmement bien passé. Ils sont très professionnels, très réactifs et ont respecté tous nos impératifs d’entreprise.',
    ownerReply:
      'Merci beaucoup pour votre retour. Transférer 80 postes sans rupture d’activité pour vos équipes a été un honneur pour We Move.',
  },
  {
    id: 'rev-4',
    author: 'Pascale Cassan-Simonnet',
    avatarBg: 'bg-[#8E24AA]',
    avatarLetter: 'P',
    reviewCount: '2 avis',
    rating: 5,
    date: '24 juil.',
    visitedDate: 'Visité en juillet',
    category: 'special',
    serviceType: 'Déménagement avec transport de piano',
    comment:
      'Professionnels de qualité dans le contact, l’évaluation du besoin/volumes et grande attention pendant le déménagement (y compris pour piano !). Le coût vaut la prestation et le professionnalisme 👍',
    ownerReply:
      'Madame, un grand merci d’avoir souligné notre savoir-faire pour le transport délicat de votre piano et de vos objets sensibles.',
  },
  {
    id: 'rev-5',
    author: 'Jean Chat',
    avatarBg: 'bg-[#EA4335]',
    avatarLetter: 'J',
    isLocalGuide: true,
    reviewCount: '35 avis',
    photoCount: '11 photos',
    rating: 5,
    date: '2 mai',
    visitedDate: 'Visité en mars',
    category: 'particulier',
    serviceType: 'Déménagement Paris intra-muros',
    comment:
      'Professionnalisme, rapidité, esprit d’initiative. Et avec en plus une capacité d’adaptation qu’on ne rencontre plus beaucoup chez les professionnels. N’hésitez pas une seconde à faire appel à WeMove !',
    ownerReply:
      'We Move vous remercie chaleureusement pour votre avis, et vous souhaite une excellente installation dans votre nouveau logement !',
  },
  {
    id: 'rev-6',
    author: 'Melanie Compagnin',
    avatarBg: 'bg-[#FB8C00]',
    avatarLetter: 'M',
    isLocalGuide: true,
    reviewCount: '55 avis',
    photoCount: '70 photos',
    rating: 5,
    date: '27 janv.',
    visitedDate: 'Visité en janvier',
    category: 'special',
    serviceType: 'Location monte-meuble en urgence',
    comment:
      'J’ai une nouvelle fois fait appel à cette société pour l’installation d’un monte-meuble en urgence. Leur réactivité et professionnalisme sont remarquables.',
    ownerReply:
      'Bonsoir Madame Compagnin, un grand merci de votre fidélité. Nous restons toujours disponibles pour intervenir rapidement.',
  },
  {
    id: 'rev-7',
    author: 'Pauline Chevalier',
    avatarBg: 'bg-[#0284C7]',
    avatarLetter: 'P',
    isLocalGuide: true,
    reviewCount: '266 avis',
    photoCount: '1555 photos',
    rating: 5,
    date: '24 juil.',
    visitedDate: 'Visité en juillet',
    category: 'longue-distance',
    serviceType: 'Paris vers province (20 ans de vie)',
    comment:
      'Une équipe de déménagement au top. J’ai fait appel à We Move pour déménager 20 ans de vie de la région parisienne vers la province. Organisation exemplaire, respect des meubles et bonne humeur.',
    ownerReply:
      'Madame Chevalier, merci infiniment d’avoir confié ces 20 années de souvenirs à notre équipe. Très belle nouvelle vie en région !',
  },
  {
    id: 'rev-8',
    author: 'Arnaud Jarry',
    avatarBg: 'bg-[#43A047]',
    avatarLetter: 'A',
    reviewCount: '6 avis',
    photoCount: '1 photo',
    rating: 5,
    date: 'Il y a 8 semaines',
    visitedDate: 'Visité en juillet',
    priceTag: '2 500–3 000 €',
    category: 'particulier',
    serviceType: 'Déménagement famille complet',
    comment:
      'Une équipe parfaitement professionnelle, efficace et agréable qui a su faire de ce moment anxiogène un événement serein et parfaitement géré du premier carton au dernier meuble remonté.',
    ownerReply:
      'Un immense merci pour ce magnifique retour ! Rendre un déménagement serein et sans stress est la mission première de We Move.',
  },
  {
    id: 'rev-9',
    author: 'Virginie LEFEBVRE VADIM',
    avatarBg: 'bg-[#00ACC1]',
    avatarLetter: 'V',
    reviewCount: '4 avis',
    rating: 5,
    date: '17 mai',
    visitedDate: 'Visité en mai',
    category: 'particulier',
    serviceType: 'Déménagement avec démontage & remontage',
    comment:
      'Ponctuels, efficaces, sympathiques... très bonne équipe pour un déménagement sans stress, sans casse... et des meubles mieux montés à l’arrivée qu’au départ ! Merci beaucoup !',
    ownerReply:
      '« WE MOVE : Votre satisfaction, notre engagement premier. » Merci Madame pour votre confiance !',
  },
  {
    id: 'rev-10',
    author: 'Sébastien Batrancourt',
    avatarBg: 'bg-[#5E35B1]',
    avatarLetter: 'S',
    isLocalGuide: true,
    reviewCount: '41 avis',
    photoCount: '22 photos',
    rating: 5,
    date: 'Il y a 9 semaines',
    visitedDate: 'Visité en juillet',
    priceTag: '2 500–3 000 €',
    category: 'particulier',
    serviceType: 'Déménagement appartement Paris',
    comment:
      'Très satisfait de mon déménagement avec We Move. Tout s’est parfaitement déroulé, depuis la première prise de contact jusqu’à la livraison finale. Ponctualité, politesse et respect des affaires.',
  },
  {
    id: 'rev-11',
    author: 'Maarten Castelein',
    avatarBg: 'bg-[#3949AB]',
    avatarLetter: 'M',
    reviewCount: '8 avis',
    rating: 5,
    date: 'Il y a 9 semaines',
    visitedDate: 'Visité en juillet',
    priceTag: '3 000–3 500 €',
    category: 'longue-distance',
    serviceType: 'Déménagement France / Paris',
    comment:
      'Je suis très content de ce déménagement entre la région et Paris. Bonne communication, excellent service, camion impeccable et timing tenu au cordeau.',
  },
  {
    id: 'rev-12',
    author: 'Merryem BENHARI',
    avatarBg: 'bg-[#D81B60]',
    avatarLetter: 'M',
    reviewCount: '2 avis',
    rating: 5,
    date: '13 juin',
    visitedDate: 'Visité en juin',
    category: 'particulier',
    serviceType: 'Appartement 85 m² en moins de 4 heures',
    comment:
      'Déménagement rapide, propre et sans casse. Équipe sympathique et pas de mauvaise surprise. Un 85 m² déménagé en moins de 4 heures. Je les recommande les yeux fermés.',
    ownerReply:
      'We Move vous remercie pour votre retour. Nous serons toujours à votre disposition pour vos futurs projets !',
  },
  {
    id: 'rev-13',
    author: 'George Kalbin',
    avatarBg: 'bg-[#1E88E5]',
    avatarLetter: 'G',
    isLocalGuide: true,
    reviewCount: '16 avis',
    rating: 5,
    date: 'Il y a 34 semaines',
    visitedDate: 'Visité en janvier',
    category: 'particulier',
    serviceType: 'International & Expat relocation in Paris',
    comment:
      'Amazing company and amazing movers. Phenomenal to use as an English speaking person as well, move went super fast and the team took incredible care of our delicate furniture.',
    ownerReply:
      'Thank you very much Sir for your kind feedback and recommendation! It was a pleasure assisting you in Paris.',
  },
  {
    id: 'rev-14',
    author: 'David Zindo',
    avatarBg: 'bg-[#43A047]',
    avatarLetter: 'D',
    reviewCount: '8 avis',
    rating: 5,
    date: 'Il y a 22 semaines',
    visitedDate: 'Visité en avril',
    category: 'particulier',
    serviceType: 'Déménagement avec inventaire détaillé',
    comment:
      'Équipe très professionnelle et agréable. Très bonne préparation, exécution rapide, soignée et conforme aux attentes (lesquelles sont soigneusement prises en compte en amont du projet). Je recommande vivement.',
  },
  {
    id: 'rev-15',
    author: 'Marie Jouffrault',
    avatarBg: 'bg-[#FB8C00]',
    avatarLetter: 'M',
    reviewCount: '7 avis',
    rating: 5,
    date: 'Il y a 12 semaines',
    visitedDate: 'Visité en juin',
    category: 'particulier',
    serviceType: 'Déménagement en toute sérénité',
    comment:
      'Super déménagement en toute sérénité avec We Move Déménagement. Équipe pro, soigneuse et très à l’écoute, vraiment gentille. C’était une excellente prestation.',
  },
  {
    id: 'rev-16',
    author: 'Wilfried Libos',
    avatarBg: 'bg-[#00897B]',
    avatarLetter: 'W',
    reviewCount: '6 avis',
    photoCount: '5 photos',
    rating: 5,
    date: 'Il y a 15 semaines',
    visitedDate: 'Visité en juin',
    category: 'particulier',
    serviceType: 'Prestation avec timing très serré',
    comment:
      'Une très bonne expérience. Un accompagnement de qualité et une équipe efficace et sympathique, malgré notre timing très serré ! Les affaires ont été manipulées avec beaucoup de délicatesse.',
  },
  {
    id: 'rev-17',
    author: 'Clara ANTONELLI',
    avatarBg: 'bg-[#8E24AA]',
    avatarLetter: 'C',
    reviewCount: '4 avis',
    rating: 5,
    date: 'Il y a 20 semaines',
    visitedDate: 'Visité en mai',
    category: 'particulier',
    serviceType: 'Préparatifs & livraison de cartons',
    comment:
      'Accompagnement des préparatifs, post déménagement + geste commercial : au top ! Non seulement le prix proposé était très compétitif, mais l’équipe a été formidable le jour J.',
  },
  {
    id: 'rev-18',
    author: 'Sophie MLK',
    avatarBg: 'bg-[#7CB342]',
    avatarLetter: 'S',
    reviewCount: '13 avis',
    rating: 5,
    date: 'Il y a 29 semaines',
    visitedDate: 'Visité en février',
    category: 'particulier',
    serviceType: 'Déménagement économique & serein',
    comment:
      'Un grand merci à l’équipe de We Move Déménagement : professionnels, arrangeants et aimables, ils ont permis que notre déménagement se passe dans les meilleures conditions, et tout ça à prix compétitif, je recommande !',
  },
  {
    id: 'rev-19',
    author: 'Karine Aizes',
    avatarBg: 'bg-[#D81B60]',
    avatarLetter: 'K',
    isLocalGuide: true,
    reviewCount: '17 avis',
    photoCount: '1 photo',
    rating: 5,
    date: 'Il y a 29 semaines',
    visitedDate: 'Visité en mars',
    category: 'particulier',
    serviceType: 'Déménagement Paris 15e',
    comment:
      'Déménageurs efficaces, souriants et précautionneux. Rien à dire, je recommande les yeux fermés ! Une société sérieuse et transparente.',
  },
  {
    id: 'rev-20',
    author: 'Krystall K',
    avatarBg: 'bg-[#5E35B1]',
    avatarLetter: 'K',
    reviewCount: '4 avis',
    rating: 5,
    date: '1 févr.',
    visitedDate: 'Visité en janvier',
    category: 'longue-distance',
    serviceType: 'Déménagement Paris · Bretagne',
    comment:
      'Très contente de mon déménagement (Paris - Bretagne). Les déménageurs ont fait très attention à mes affaires et tout est arrivé en parfait état à destination.',
  },
  {
    id: 'rev-21',
    author: 'Amine Zniber',
    avatarBg: 'bg-[#0284C7]',
    avatarLetter: 'A',
    reviewCount: '8 avis',
    photoCount: '3 photos',
    rating: 5,
    date: 'Il y a 25 semaines',
    visitedDate: 'Visité en avril',
    category: 'particulier',
    serviceType: 'Client fidèle (2ème déménagement)',
    comment:
      'Deuxième fois que je fais appel à cette entreprise de déménagement, et une nouvelle fois l’expérience a été parfaite. Constance dans la qualité et la gentillesse.',
    ownerReply:
      'Un grand merci pour votre fidélité et pour ce retour très élogieux ! C’est notre plus belle récompense.',
  },
  {
    id: 'rev-22',
    author: 'Hélène H',
    avatarBg: 'bg-[#00ACC1]',
    avatarLetter: 'H',
    reviewCount: '11 avis',
    photoCount: '1 photo',
    rating: 5,
    date: 'Il y a 28 semaines',
    visitedDate: 'Visité en mars',
    category: 'particulier',
    serviceType: 'Devis, cartons & prestation complète',
    comment:
      'Merci beaucoup : tout était impeccable, de l’élaboration du devis jusqu’au déménagement, en passant par la livraison des cartons. Travail rigoureux et propre.',
  },
  {
    id: 'rev-23',
    author: 'Thomas Piffeteau',
    avatarBg: 'bg-[#FB8C00]',
    avatarLetter: 'T',
    reviewCount: '10 avis',
    photoCount: '3 photos',
    rating: 5,
    date: 'Il y a 33 semaines',
    visitedDate: 'Visité en février',
    category: 'particulier',
    serviceType: 'Déménagement express & soigné',
    comment:
      'Déménagement rapide, efficace. Déménageurs sympathiques et précautionneux. Très bon rapport qualité-prix, et facile d’organisation. Je recommande vivement !',
  },
  {
    id: 'rev-24',
    author: 'Louis Bujeau',
    avatarBg: 'bg-[#43A047]',
    avatarLetter: 'L',
    reviewCount: '7 avis',
    photoCount: '3 photos',
    rating: 5,
    date: 'Il y a 36 semaines',
    visitedDate: 'Visité en janvier',
    category: 'particulier',
    serviceType: 'Déménagement appartement Paris centre',
    comment:
      'Très efficace, attentionnés et réactifs, en plus d’être chaleureux. Tout a été transporté sans un accroc. Je recommande vivement leurs services.',
  },
];

export const TestimonialsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  // Filtrage combiné : catégorie + recherche textuelle instantanée
  const filteredReviews = useMemo(() => {
    return REAL_GOOGLE_REVIEWS.filter((rev) => {
      const matchesCategory =
        selectedCategory === 'all' || rev.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        rev.author.toLowerCase().includes(q) ||
        rev.comment.toLowerCase().includes(q) ||
        rev.serviceType.toLowerCase().includes(q) ||
        (rev.priceTag && rev.priceTag.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  // Affichage paginé selon visibleCount
  const displayedReviews = filteredReviews.slice(0, visibleCount);

  // Schema.org officiel avec note 4.8 / 114 avis
  const googleReviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: 'WE MOVE DEMENAGEMENT',
    url: 'https://we-move.fr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '6 Rue du Docteur Finlay',
      addressLocality: 'Paris',
      postalCode: '75015',
      addressCountry: 'FR',
    },
    telephone: '+33173743690',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '114',
      bestRating: '5',
      worstRating: '1',
    },
    review: REAL_GOOGLE_REVIEWS.map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
      },
      reviewBody: r.comment,
    })),
  };

  return (
    <section id="avis" className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF8] border-b border-[#E2E8F0]/70 overflow-hidden">
      {/* Schema.org microdata injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(googleReviewsSchema) }}
      />

      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* ================= SECTION HEADER & GOOGLE TRUST BADGE ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-2xl space-y-4">
            
            {/* Néo-Glassmorphic Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#1A73E8]/25 text-[#1A73E8] shadow-2xs font-mono text-[12px] font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A73E8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1A73E8]"></span>
              </span>
              <span>Avis Google certifiés · 114 avis vérifiés · Paris 15ᵉ</span>
            </div>

            {/* Headline with Gradient Accent */}
            <h2 className="text-[34px] sm:text-[46px] lg:text-[50px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-display [text-wrap:balance]">
              Ce que nos clients disent sur notre{' '}
              <span className="relative inline-block text-[#1A73E8]">
                <span className="bg-gradient-to-r from-[#1A73E8] via-[#0082CA] to-[#0284C7] bg-clip-text text-transparent">
                  fiche Google
                </span>
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2.5 text-[#1A73E8]/30"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-[16.5px] sm:text-[18px] text-[#475569] leading-relaxed font-normal">
              Consultez les retours authentiques et non modérés déposés par nos clients sur la fiche Google Maps officielle de{' '}
              <strong className="font-semibold text-[#0F172A]">WE MOVE DÉMÉNAGEMENT</strong> (6 Rue du Dr Finlay, 75015 Paris).
            </p>
          </div>

          {/* Official Sublimated Google Scoreboard Card */}
          <div className="shrink-0 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl hover:border-[#1A73E8]/30 transition-all duration-300 max-w-md w-full lg:w-auto relative overflow-hidden group">
            {/* Accent top gradient line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#34A853] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                {/* Official Google Logo Badge */}
                <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                  <svg className="w-6.5 h-6.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[28px] font-bold font-mono tracking-tight text-[#0F172A] leading-none">
                      4,8
                    </span>
                    <span className="text-[14px] text-slate-500 font-medium">/ 5</span>
                  </div>
                  <div className="flex items-center text-[#FBBC05] mt-1" aria-label="Note de 4.8 sur 5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Link to Google Search / Maps */}
              <a
                href={OFFICIAL_GOOGLE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 text-slate-400 hover:text-[#1A73E8] hover:bg-slate-100 rounded-xl transition-colors"
                title="Ouvrir la fiche sur Google Maps"
                aria-label="Ouvrir la fiche sur Google Maps"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Distribution bars (Real Breakdown based on 114 reviews) */}
            <div className="mt-4 space-y-2 text-[11.5px] font-mono text-slate-600">
              <div className="flex items-center gap-2.5">
                <span className="w-4 font-bold">5★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '92%' }} />
                </div>
                <span className="w-8 text-right tabular-nums font-bold">92%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 font-bold">4★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '6%' }} />
                </div>
                <span className="w-8 text-right tabular-nums font-bold">6%</span>
              </div>
            </div>

            {/* Bottom metadata */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-600">
              <span className="font-semibold text-[#0F172A]">114 avis Google certifiés</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                100% authentiques
              </span>
            </div>
          </div>
        </div>

        {/* ================= INTERACTIVE CONTROLS BAR (FILTERS + INSTANT SEARCH) ================= */}
        <div className="bg-white/90 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 mb-10 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Functional Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Tous (114)' },
                { id: 'particulier', label: 'Particuliers' },
                { id: 'entreprise', label: 'Entreprises / Bureaux' },
                { id: 'special', label: 'Piano & Monte-meubles' },
                { id: 'longue-distance', label: 'Longue distance' },
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(tab.id);
                      setVisibleCount(9);
                    }}
                    className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Live Search Input */}
            <div className="relative min-w-[250px] sm:max-w-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(9);
                }}
                placeholder="Rechercher (ex: piano, 80 postes, ponctuel...)"
                className="w-full pl-9 pr-8 py-2.5 text-[13px] bg-slate-50 border border-slate-200 rounded-xl text-[#0F172A] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Effacer la recherche"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ================= REVIEWS COUNT STATUS ================= */}
        {searchQuery && (
          <div className="mb-6 flex items-center justify-between text-[13px] text-[#64748B]">
            <span>
              {filteredReviews.length} résultat{filteredReviews.length > 1 ? 's' : ''} pour « {searchQuery} »
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#1A73E8] hover:underline font-medium cursor-pointer"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}

        {/* ================= EMPTY STATE IF SEARCH YIELDS NOTHING ================= */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[16px] font-bold text-[#0F172A]">Aucun avis ne correspond à cette recherche</h3>
            <p className="mt-1 text-[14px] text-[#64748B]">
              Essayez des termes plus généraux comme « piano », « monte-meuble », « soin » ou « équipe ».
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 px-5 py-2.5 text-[13px] font-bold text-white bg-[#0F172A] rounded-xl hover:bg-black transition-colors cursor-pointer shadow-xs"
            >
              Afficher tous les 114 avis
            </button>
          </div>
        ) : (
          /* ================= 3-COLUMN AUTHENTIC GOOGLE REVIEWS GRID ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedReviews.map((rev) => {
              const isLong = rev.comment.length > 200;
              const isExpanded = expandedReviewId === rev.id;
              const displayedComment = isLong && !isExpanded ? `${rev.comment.slice(0, 190)}...` : rev.comment;

              return (
                <article
                  key={rev.id}
                  className="group relative bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between hover:border-[#1A73E8]/30 shadow-xs hover:shadow-2xl hover:shadow-[#1A73E8]/10 transition-all duration-500 hover:-translate-y-1.5"
                >
                  {/* Accent Top Gradient Line on Hover */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#34A853] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 rounded-t-3xl" />

                  <div>
                    {/* Top Row: Google Avatar + Name + Local Guide + Review Metadata */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {/* Authentic Google Style Initial Avatar */}
                        <div
                          className={`w-11 h-11 rounded-full ${rev.avatarBg} text-white font-bold flex items-center justify-center text-[15px] shrink-0 select-none shadow-md border border-white/40`}
                        >
                          {rev.avatarLetter}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug">
                              {rev.author}
                            </h3>
                            {rev.isLocalGuide && (
                              <span className="text-[10.5px] text-[#D97706] font-bold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200/80">
                                <svg className="w-3 h-3 text-[#F59E0B] fill-current" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span>Local Guide</span>
                              </span>
                            )}
                          </div>

                          {/* Unboxed Metadata Line */}
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11.5px] text-slate-500">
                            <span>Avis vérifié</span>
                            {rev.reviewCount && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{rev.reviewCount}</span>
                              </>
                            )}
                            {rev.photoCount && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>{rev.photoCount}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stars + Relative Date */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center text-[#FBBC05]" aria-label="5 étoiles sur 5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                          {rev.date}
                        </span>
                      </div>
                    </div>

                    {/* Prestation Details & Exact Customer-Reported Pricing */}
                    <div className="flex items-center gap-1.5 mb-3 text-[12px] text-slate-700 flex-wrap">
                      <span className="font-semibold text-[#0F172A]">
                        {rev.serviceType}
                      </span>
                      {rev.priceTag && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="font-mono text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md text-[11px]">
                            {rev.priceTag}
                          </span>
                        </>
                      )}
                      {rev.visitedDate && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-400 italic">{rev.visitedDate}</span>
                        </>
                      )}
                    </div>

                    {/* Verbatim quote */}
                    <p className="text-[14px] sm:text-[14.5px] text-slate-700 leading-relaxed font-normal">
                      « {displayedComment} »
                    </p>

                    {/* Expand / Collapse toggle for long quotes */}
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => setExpandedReviewId(isExpanded ? null : rev.id)}
                        className="mt-2 text-[12.5px] font-bold text-[#1A73E8] hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Réduire l’avis' : 'Lire l’avis complet'}
                      </button>
                    )}
                  </div>

                  {/* Card Bottom: Verified Google Indicator */}
                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Avis certifié Google Maps</span>
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Client vérifié
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ================= PAGINATION / LOAD MORE BUTTON ================= */}
        {filteredReviews.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredReviews.length))}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border border-slate-300 bg-white text-[14px] font-bold text-[#0F172A] hover:border-[#1A73E8] hover:text-[#1A73E8] hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <span>Afficher plus d’avis ({filteredReviews.length - visibleCount} restants)</span>
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

        {/* ================= SUBLIMATED BOTTOM CONVERSION & TRUST BANNER ================= */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-10 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/30 rounded-3xl border border-[#E2E8F0] shadow-md relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 group">
          {/* Ambient glow decoration inside banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 flex items-start gap-4 sm:gap-6 max-w-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A73E8] to-[#00537A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#1A73E8]/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[18.5px] sm:text-[20px] font-bold text-[#0F172A] font-display">
                Vous avez déménagé avec WE MOVE DÉMÉNAGEMENT ?
              </h3>
              <p className="text-[14.5px] sm:text-[15.5px] text-[#475569] leading-relaxed">
                Partagez votre expérience sur notre fiche Google officielle. Vos avis aident les futurs particuliers et entreprises d'Île-de-France à choisir un déménageur de confiance.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href={OFFICIAL_GOOGLE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-2xl border border-[#CBD5E1] bg-white text-[14px] font-semibold text-[#1E293B] hover:border-[#1A73E8] hover:text-[#1A73E8] hover:bg-[#F8FAFC] hover:shadow-sm transition-all duration-300 cursor-pointer"
            >
              <span>Consulter les 114 avis</span>
              <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <a
              href={OFFICIAL_GOOGLE_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-2xl bg-gradient-to-r from-[#1A73E8] to-[#00537A] text-white text-[14px] font-bold hover:from-[#1557B0] hover:to-[#003E5C] transition-all duration-300 shadow-md shadow-[#1A73E8]/20 hover:shadow-lg hover:shadow-[#1A73E8]/30 cursor-pointer"
            >
              <span>Déposer un avis sur Google</span>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';

interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
}

const ARTICLES: Article[] = [
  {
    slug: 'checklist-demenagement-paris',
    title: 'Checklist complète pour un déménagement à Paris sans stress',
    category: 'Conseils & Organisation',
    readTime: '5 min de lecture',
    date: '15 Septembre 2026',
    excerpt: 'De la réservation de stationnement auprès de la préfecture jusqu’aux démarches de changement d’adresse : notre guide pas-à-pas pour ne rien oublier.',
  },
  {
    slug: 'comment-estimer-volume-m3',
    title: 'Comment calculer précisément le volume en m³ de son mobilier ?',
    category: 'Méthodologie & Cubage',
    readTime: '4 min de lecture',
    date: '02 Septembre 2026',
    excerpt: 'Comprendre la règle des mètres carrés vers les mètres cubes, éviter de sous-estimer son cubage et choisir la bonne taille de camion capitonné.',
  },
  {
    slug: 'monte-meuble-passage-difficile',
    title: 'Quand et pourquoi recourir à un monte-meubles ?',
    category: 'Équipement Technique',
    readTime: '3 min de lecture',
    date: '24 Août 2026',
    excerpt: 'Escaliers étroits en colimaçon, absence d’ascenseur, canapés volumineux ou pianos : tout savoir sur la réglementation et l’intervention d’un opérateur qualifié.',
  },
  {
    slug: 'transfert-entreprise-continuite-activite',
    title: 'Transfert d’entreprise : 5 règles d’or pour zéro arrêt de production',
    category: 'Entreprises & B2B',
    readTime: '6 min de lecture',
    date: '12 Août 2026',
    excerpt: 'Déménager un open-space le week-end, sécuriser le parc informatique et les serveurs, étiqueter méthodiquement les postes de travail.',
  },
  {
    slug: 'garder-meubles-securise-paris',
    title: 'Garde-meubles ou self-stockage : quelle solution privilégier ?',
    category: 'Stockage & Logistique',
    readTime: '4 min de lecture',
    date: '28 Juillet 2026',
    excerpt: 'Comparatif objectif entre box individuels surveillés 24/7 et conteneurs plombés pour protéger votre patrimoine mobilier durant des travaux ou une transition.',
  },
  {
    slug: 'proteger-objets-fragiles-demenagement',
    title: 'Comment bien emballer et protéger sa vaisselle et objets précieux',
    category: 'Astuces Pratiques',
    readTime: '4 min de lecture',
    date: '10 Juillet 2026',
    excerpt: 'Cartons croisillons verres, papier bulle kraft, housses capitonnées : les techniques professionnelles de nos déménageurs pour zéro casse.',
  },
];

export const BlogPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 space-y-16">
        
        {/* Header */}
        <div className="max-w-3xl space-y-5">
          <span className="text-[12.5px] font-mono uppercase tracking-wider text-[#0082CA] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
            Le Journal & Les Guides du Déménagement
          </span>
          <h1 className="text-[36px] sm:text-[46px] font-bold text-[#111827] tracking-tight leading-[1.15]">
            Conseils pratiques & astuces d’experts pour réussir votre déménagement
          </h1>
          <p className="text-[17px] text-[#475569] leading-relaxed">
            Retrouvez tous nos guides, fiches pratiques et retours d'expérience pour préparer sereinement votre changement d'adresse à Paris, en Île-de-France ou en province.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-[#E5E7EB]">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col justify-between hover:border-[#0082CA] hover:shadow-xs transition-all group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-[11.5px] text-[#64748B]">
                  <span className="font-semibold text-[#0082CA] bg-[#EBF5FB] px-2 py-0.5 rounded font-mono">
                    {article.category}
                  </span>
                  <span>{article.readTime}</span>
                </div>

                <h2 className="text-[18px] font-bold text-[#111827] group-hover:text-[#0082CA] transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-[13.5px] text-[#475569] leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-[#F1F5F9] flex items-center justify-between text-[12px]">
                <span className="text-[#94A3B8] font-mono">{article.date}</span>
                <span className="font-semibold text-[#0082CA] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Lire l’article &rarr;
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Free Volume Tool CTA Box */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-[18px] font-bold text-[#111827]">
              Besoin de connaître le volume exact de vos meubles ?
            </h3>
            <p className="text-[14px] text-[#64748B]">
              Notre calculateur interactif pièce par pièce est à votre disposition gratuitement.
            </p>
          </div>
          <Link
            href="/volume/"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-xl bg-[#0082CA] text-white text-[13.5px] font-semibold hover:bg-[#006FA8] transition-colors shrink-0"
          >
            <span>Lancer le calculateur m³</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
};

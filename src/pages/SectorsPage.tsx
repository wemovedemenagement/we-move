/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';

const PARIS_ARRONDISSEMENTS = [
  'Paris 1er - Louvre',
  'Paris 2e - Bourse',
  'Paris 3e - Temple',
  'Paris 4e - Hôtel-de-Ville',
  'Paris 5e - Panthéon',
  'Paris 6e - Luxembourg',
  'Paris 7e - Palais-Bourbon',
  'Paris 8e - Élysée',
  'Paris 9e - Opéra',
  'Paris 10e - Enclos Saint-Laurent',
  'Paris 11e - Popincourt',
  'Paris 12e - Reuilly',
  'Paris 13e - Gobelins',
  'Paris 14e - Observatoire',
  'Paris 15e - Vaugirard (Siège WE MOVE)',
  'Paris 16e - Passy',
  'Paris 17e - Batignolles-Monceau',
  'Paris 18e - Buttes-Montmartre',
  'Paris 19e - Buttes-Chaumont',
  'Paris 20e - Ménilmontant',
];

const ILE_DE_FRANCE_DEPTS = [
  {
    code: '92',
    name: 'Hauts-de-Seine',
    cities: 'Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Courbevoie, Issy-les-Moulineaux, Rueil-Malmaison, Antony...',
  },
  {
    code: '94',
    name: 'Val-de-Marne',
    cities: 'Créteil, Vincennes, Saint-Maur-des-Fossés, Nogent-sur-Marne, Ivry-sur-Seine, Maisons-Alfort, Charenton-le-Pont...',
  },
  {
    code: '93',
    name: 'Seine-Saint-Denis',
    cities: 'Montreuil, Saint-Denis, Pantin, Saint-Ouen, Noisy-le-Grand, Les Lilas, Aubervilliers, Bagnolet...',
  },
  {
    code: '78',
    name: 'Yvelines',
    cities: 'Versailles, Saint-Germain-en-Laye, Poissy, Sartrouville, Rambouillet, Saint-Quentin-en-Yvelines...',
  },
  {
    code: '91',
    name: 'Essonne',
    cities: 'Évry-Courcouronnes, Massy, Palaiseau, Sainte-Geneviève-des-Bois, Savigny-sur-Orge, Chilly-Mazarin...',
  },
  {
    code: '95',
    name: 'Val-d’Oise',
    cities: 'Cergy, Pontoise, Argenteuil, Enghien-les-Bains, Sarcelles, Franconville, Taverny...',
  },
  {
    code: '77',
    name: 'Seine-et-Marne',
    cities: 'Meaux, Melun, Chelles, Marne-la-Vallée, Fontainebleau, Torcy, Pontault-Combault...',
  },
];

const NATIONAL_AXES = [
  { from: 'Paris', to: 'Lyon & Rhône-Alpes', delay: '24h à 48h', type: 'Formule dédiée ou groupage' },
  { from: 'Paris', to: 'Bordeaux & Aquitaine', delay: '24h à 48h', type: 'Lignes régulières' },
  { from: 'Paris', to: 'Marseille, Nice & PACA', delay: '48h', type: 'Camions capitonnés grand volume' },
  { from: 'Paris', to: 'Nantes, Rennes & Bretagne', delay: '24h à 48h', type: 'Transferts complets' },
  { from: 'Paris', to: 'Lille & Hauts-de-France', delay: '24h', type: 'Liaisons express' },
  { from: 'Paris', to: 'Strasbourg & Grand-Est', delay: '24h à 48h', type: 'Lignes sécurisées' },
];

export const SectorsPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 space-y-16">
        
        {/* Header Section */}
        <div className="max-w-3xl space-y-5">
          <span className="text-[12.5px] font-mono uppercase tracking-wider text-[#0082CA] font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
            Couverture géographique certifiée
          </span>
          <h1 className="text-[36px] sm:text-[46px] font-bold text-[#111827] tracking-tight leading-[1.15]">
            Nos secteurs d’intervention : Paris, Île-de-France & National
          </h1>
          <p className="text-[17px] text-[#475569] leading-relaxed">
            Basée dans le 15ᵉ arrondissement de Paris, l’entreprise <strong>WE MOVE DÉMÉNAGEMENT</strong> mobilise ses camions capitonnés, ses monte-meubles et ses équipes qualifiées 7 jours sur 7 dans toute la région parisienne et sur l’ensemble du territoire français.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/devis/"
              className="inline-flex items-center gap-2 px-6 h-12 rounded-xl bg-[#0082CA] text-white text-[14.5px] font-semibold hover:bg-[#006FA8] transition-colors shadow-xs"
            >
              <span>Calculer le tarif pour mon trajet</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href="tel:0173743690"
              className="inline-flex items-center gap-2 px-5 h-12 rounded-xl border border-[#CBD5E1] text-[#1E293B] text-[14px] font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              <span>Ligne directe : 01 73 74 36 90</span>
            </a>
          </div>
        </div>

        {/* 1. Paris Intra-Muros */}
        <div className="pt-8 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111827]">
                Paris intra-muros (75) — Les 20 arrondissements
              </h2>
              <p className="text-[14px] text-[#64748B] mt-1">
                Autorisations de stationnement préfectorales, gestion des cours pavées, escaliers haussmanniens et passages étroits.
              </p>
            </div>
            <span className="text-[12px] font-mono text-[#0082CA] bg-[#EBF5FB] px-3 py-1 rounded-full font-semibold">
              Interventions quotidiennes 7j/7
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {PARIS_ARRONDISSEMENTS.map((arr) => (
              <div
                key={arr}
                className="p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0082CA] transition-colors text-[13px] font-medium text-[#334155] flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#0082CA] shrink-0" />
                <span>{arr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Île-de-France / Petite & Grande Couronne */}
        <div className="pt-8 border-t border-[#E5E7EB]">
          <div className="mb-6">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111827]">
              Île-de-France — Petite & Grande Couronne
            </h2>
            <p className="text-[14px] text-[#64748B] mt-1">
              Des déménagements clés en main pour appartements, pavillons résidentiels et sièges d’entreprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ILE_DE_FRANCE_DEPTS.map((dept) => (
              <div
                key={dept.code}
                className="p-5 rounded-2xl border border-[#E2E8F0] bg-white hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-[#EBF5FB] text-[#0082CA] font-bold font-mono text-[14px] flex items-center justify-center">
                    {dept.code}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#111827]">
                    {dept.name}
                  </h3>
                </div>
                <p className="text-[13px] text-[#64748B] leading-relaxed pt-1">
                  {dept.cities}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Liaisons Nationales & Longue Distance */}
        <div className="pt-8 border-t border-[#E5E7EB]">
          <div className="mb-6">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111827]">
              Déménagement national & province depuis / vers Paris
            </h2>
            <p className="text-[14px] text-[#64748B] mt-1">
              Liaisons régulières directes avec traçabilité GPS, équipement capitonné et assurance tous risques incluse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NATIONAL_AXES.map((axis) => (
              <div
                key={axis.to}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFAF8] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#111827]">
                    {axis.from} &harr; {axis.to}
                  </span>
                  <span className="text-[11px] font-mono text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded font-medium">
                    {axis.delay}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#64748B]">
                  {axis.type}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Card */}
        <div className="rounded-2xl bg-[#111827] text-white p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-[22px] sm:text-[26px] font-bold tracking-tight">
              Votre ville ou commune n'est pas listée ?
            </h3>
            <p className="text-[14.5px] text-[#94A3B8]">
              Nous intervenons partout en France sans exception. Demandez votre devis gratuit et personnalisé sous 24h.
            </p>
          </div>
          <Link
            href="/devis/"
            className="inline-flex items-center gap-2 px-7 h-12 rounded-xl bg-[#0082CA] text-white text-[14.5px] font-semibold hover:bg-[#006FA8] transition-colors shrink-0"
          >
            <span>Obtenir mon tarif ferme</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
};

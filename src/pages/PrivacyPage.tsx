/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[800px] mx-auto px-5 sm:px-8 space-y-8">
        
        <div>
          <h1 className="text-[32px] sm:text-[40px] font-semibold text-[#20252B] tracking-tight">
            Politique de confidentialité (RGPD)
          </h1>
          <p className="mt-2 text-[14px] text-[#59616C]">
            Protection et respect de vos données personnelles
          </p>
        </div>

        <section className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed border-t border-[#E6E8EB] pt-6">
          <h2 className="text-[18px] font-semibold text-[#20252B]">
            1. Collecte des données
          </h2>
          <p>
            Les données collectées par WE MOVE (nom, prénom, coordonnées téléphoniques, adresse électronique, adresses de départ et de destination, volume estimé) sont strictement nécessaires à l'établissement de votre devis et à la bonne exécution logistique de votre déménagement.
          </p>
        </section>

        <section className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed border-t border-[#E6E8EB] pt-6">
          <h2 className="text-[18px] font-semibold text-[#20252B]">
            2. Utilisation et transmission
          </h2>
          <p>
            Vos informations personnelles ne sont <strong>jamais vendues, louées ou cédées</strong> à des tiers à des fins publicitaires. Elles ne sont consultées que par le personnel habilité de WE MOVE en charge de votre dossier.
          </p>
        </section>

        <section className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed border-t border-[#E6E8EB] pt-6">
          <h2 className="text-[18px] font-semibold text-[#20252B]">
            3. Vos droits
          </h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en écrivant à : <a href="mailto:contact@wemove.fr" className="text-[#0082CA] underline">contact@wemove.fr</a>.
          </p>
        </section>

        <div className="pt-6 border-t border-[#E6E8EB]">
          <Link href="/" className="text-[14px] font-medium text-[#0082CA] hover:underline">
            ← Revenir à l'accueil
          </Link>
        </div>

      </div>
    </div>
  );
};

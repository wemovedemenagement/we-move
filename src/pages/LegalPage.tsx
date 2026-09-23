/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';

export const LegalPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[800px] mx-auto px-5 sm:px-8 space-y-8">
        
        <div>
          <h1 className="text-[32px] sm:text-[40px] font-semibold text-[#20252B] tracking-tight">
            Mentions légales
          </h1>
          <p className="mt-2 text-[14px] text-[#59616C]">
            En vigueur au {new Date().getFullYear()}
          </p>
        </div>

        <section className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed border-t border-[#E6E8EB] pt-6">
          <h2 className="text-[18px] font-semibold text-[#20252B]">
            1. Éditeur de la plateforme
          </h2>
          <p>
            Le site WE MOVE est édité par la société <strong>WE MOVE</strong>, société par actions simplifiée spécialisée dans le déménagement de particuliers, le transfert d'entreprises et le stockage en garde-meubles.
          </p>
          <p>
            Activité de transport routier de marchandises soumise aux règles de la Fédération Française des Déménageurs et aux conventions collectives nationales des transports routiers.
          </p>
        </section>

        <section className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed border-t border-[#E6E8EB] pt-6">
          <h2 className="text-[18px] font-semibold text-[#20252B]">
            2. Propriété intellectuelle
          </h2>
          <p>
            L'ensemble des contenus (textes, logos, photographies documentaires, graphismes, icônes) présents sur le site sont la propriété exclusive de WE MOVE ou de leurs auteurs respectifs sous licence. Toute reproduction ou utilisation non autorisée est passible de poursuites.
          </p>
        </section>

        <section className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed border-t border-[#E6E8EB] pt-6">
          <h2 className="text-[18px] font-semibold text-[#20252B]">
            3. Responsabilité & Assurances
          </h2>
          <p>
            Chaque opération de transport et de déménagement est couverte par une assurance contractuelle de base et fait l'objet d'une déclaration de valeur signée par le client avant l'opération. WE MOVE déploie tous les moyens humains et matériels certifiés pour garantir la parfaite sécurité des biens confiés.
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

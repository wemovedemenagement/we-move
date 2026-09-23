/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Hero } from '../components/Hero';
import { ServicesSection } from '../components/ServicesSection';
import { ProcessSection } from '../components/ProcessSection';
import { VolumeEstimatorSection } from '../components/VolumeEstimatorSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { FaqSection } from '../components/FaqSection';
import { CallToAction } from '../components/CallToAction';
import { useRouter } from '../router';

export const HomePage: React.FC = () => {
  const { push } = useRouter();

  return (
    <>
      {/* Premier écran */}
      <Hero 
        onOpenQuote={() => push('/devis/')}
        onScrollToVolume={() => push('/volume/')}
      />

      {/* Les prestations */}
      <ServicesSection 
        onSelectService={(slug) => push(`/${slug}/`)}
      />

      {/* La préparation du projet */}
      <ProcessSection />

      {/* Le calculateur de volume compact */}
      <VolumeEstimatorSection 
        onOpenVolumeModal={(vol) => push(`/volume/?initial=${vol || 22}`)}
        onOpenQuoteWithVolume={(vol) => push(`/devis/?volume=${vol}`)}
      />

      {/* Témoignages & Avis Google vérifiés */}
      <TestimonialsSection />

      {/* Les questions utiles */}
      <FaqSection />

      {/* L'invitation finale */}
      <CallToAction 
        onOpenQuote={() => push('/devis/')}
      />
    </>
  );
};

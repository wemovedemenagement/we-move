/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, useRouter, Link } from './router';
import { Header } from './components/Header';
import { Breadcrumb } from './components/Breadcrumb';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceParticuliersPage } from './pages/ServiceParticuliersPage';
import { ServiceEntreprisesPage } from './pages/ServiceEntreprisesPage';
import { ServiceStockagePage } from './pages/ServiceStockagePage';
import { ServiceMonteMeublesPage } from './pages/ServiceMonteMeublesPage';
import { AboutPage } from './pages/AboutPage';
import { SectorsPage } from './pages/SectorsPage';
import { BlogPage } from './pages/BlogPage';
import { VolumePage } from './pages/VolumePage';
import { QuotePage } from './pages/QuotePage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { PrivacyPage } from './pages/PrivacyPage';

function PageSwitch() {
  const { pathname } = useRouter();

  const renderCurrentPage = () => {
    switch (pathname) {
      case '/':
        return <HomePage />;
      case '/services/':
        return <ServicesPage />;
      case '/demenagement-particuliers/':
        return <ServiceParticuliersPage />;
      case '/demenagement-entreprises/':
        return <ServiceEntreprisesPage />;
      case '/stockage-garde-meubles/':
        return <ServiceStockagePage />;
      case '/location-monte-meubles/':
        return <ServiceMonteMeublesPage />;
      case '/qui-sommes-nous/':
        return <AboutPage />;
      case '/secteurs/':
        return <SectorsPage />;
      case '/blog/':
        return <BlogPage />;
      case '/volume/':
        return <VolumePage />;
      case '/devis/':
        return <QuotePage />;
      case '/contact/':
        return <ContactPage />;
      case '/mentions-legales/':
        return <LegalPage />;
      case '/politique-confidentialite/':
        return <PrivacyPage />;
      default:
        return (
          <div className="py-24 px-6 text-center max-w-xl mx-auto space-y-5">
            <div className="text-[14px] font-mono text-[#0082CA]">Erreur 404</div>
            <h1 className="text-[28px] font-semibold text-[#20252B]">
              Page introuvable
            </h1>
            <p className="text-[15px] text-[#59616C]">
              L'adresse <code className="bg-[#FAFAF8] px-2 py-0.5 border border-[#E6E8EB] rounded text-sm text-[#20252B]">{pathname}</code> n'existe pas ou a été déplacée.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 h-11 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors flex items-center justify-center"
              >
                Retour à l'accueil
              </Link>
              <Link
                href="/services/"
                className="px-6 h-11 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[14px] font-medium hover:bg-[#FAFAF8] transition-colors flex items-center justify-center"
              >
                Voir les prestations
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#20252B] selection:bg-[#0082CA]/10 selection:text-[#0082CA]">
      
      {/* Discreet Navigation Helper Bar */}
      <aside 
        aria-label="Informations d'environnement" 
        className="w-full bg-[#FAFAF8] border-b border-[#E6E8EB] py-1.5 px-4 text-center text-[12px] text-[#59616C]"
      >
        <span>
          WE MOVE · Architecture multi-pages Next.js intégrée · Route active : <strong className="font-mono text-[#20252B]">{pathname}</strong>
        </span>
      </aside>

      {/* Persistent Global Header */}
      <Header />

      {/* Breadcrumb Navigation Bar directly under Header */}
      <Breadcrumb />

      {/* Dynamic Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Persistent Global Footer */}
      <Footer />

    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <PageSwitch />
    </RouterProvider>
  );
}

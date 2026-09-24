import { lazy, Suspense } from 'react';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider, useRouter, Link } from './router';
import { Header } from './components/Header';
import { Breadcrumb } from './components/Breadcrumb';
import { Footer } from './components/Footer';
import { MobileQuickBar } from './components/MobileQuickBar';

// Pages
import { RouteSeo } from './components/RouteSeo';
import { BLOG_ARTICLES } from './data/articles';
import { ArticlePage } from './pages/ArticlePage';
import { HomePage } from './pages/HomePage';
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const ServiceParticuliersPage = lazy(() => import('./pages/ServiceParticuliersPage').then(module => ({ default: module.ServiceParticuliersPage })));
const ServiceEntreprisesPage = lazy(() => import('./pages/ServiceEntreprisesPage').then(module => ({ default: module.ServiceEntreprisesPage })));
const ServiceStockagePage = lazy(() => import('./pages/ServiceStockagePage').then(module => ({ default: module.ServiceStockagePage })));
const ServiceMonteMeublesPage = lazy(() => import('./pages/ServiceMonteMeublesPage').then(module => ({ default: module.ServiceMonteMeublesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const SectorsPage = lazy(() => import('./pages/SectorsPage').then(module => ({ default: module.SectorsPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then(module => ({ default: module.BlogPage })));
const VolumePage = lazy(() => import('./pages/VolumePage').then(module => ({ default: module.VolumePage })));
const QuotePage = lazy(() => import('./pages/QuotePage').then(module => ({ default: module.QuotePage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(module => ({ default: module.LegalPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({ default: module.PrivacyPage })));

function PageSwitch() {
  const { pathname } = useRouter();

  const renderCurrentPage = () => {
    if (pathname.startsWith('/blog/') && pathname !== '/blog/') {
      const article = BLOG_ARTICLES.find(item => pathname === `/blog/${item.slug}/`);
      if (article) return <ArticlePage key={article.slug} article={article} />;
    }
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
            <h1 className="text-[28px] font-semibold text-[#0F172A]">
              Page introuvable
            </h1>
            <p className="text-[15px] text-[#475569]">
              L'adresse <code className="bg-[#FAFAF8] px-2 py-0.5 border border-[#E2E8F0] rounded text-sm text-[#0F172A]">{pathname}</code> n'existe pas ou a été déplacée.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 h-11 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors flex items-center justify-center shadow-sm"
              >
                Retour à l'accueil
              </Link>
              <Link
                href="/services/"
                className="px-6 h-11 rounded-md border border-[#E2E8F0] bg-white text-[#0F172A] text-[14px] font-medium hover:bg-[#FAFAF8] transition-colors flex items-center justify-center"
              >
                Voir les prestations
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F172A] selection:bg-[#0082CA]/15 selection:text-[#0082CA]">
      {/* Persistent Global Header */}
      <RouteSeo />
      <Header />

      {/* Breadcrumb Navigation Bar directly under Header */}
      <Breadcrumb />

      {/* Dynamic Page Content with bottom padding on mobile for MobileQuickBar */}
      <main id="main-content" tabIndex={-1} className={`flex-1 ${pathname === '/' ? '' : 'interior-page'}`}>
        <Suspense fallback={<div className="wm-container py-20" role="status">Préparation de votre page…</div>}>{renderCurrentPage()}</Suspense>
      </main>

      {/* Persistent Global Footer */}
      <Footer />

      {/* Mobile Sticky Action Bar */}
      {pathname !== '/devis/' && <MobileQuickBar />}
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




import { ArrowUpRight, Star } from 'lucide-react';
import { GOOGLE_REVIEWS } from '../data/googleReviews';

function GoogleMark() {
  return <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59C7.19 7.72 9.4 5.96 12 5.96Z"/></svg>;
}
function Stars() {
  return <span className="google-stars" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}</span>;
}
export function GoogleReviewBadge() {
  return <a href="#avis-google" className="google-review-badge" aria-label={`${GOOGLE_REVIEWS.rating} sur 5 sur Google, ${GOOGLE_REVIEWS.count} avis. Voir les témoignages.`}>
    <GoogleMark /><span className="google-badge-rating"><strong>{GOOGLE_REVIEWS.rating}<small>/5</small></strong><Stars /></span><span className="google-badge-label"><strong>Avis Google</strong><small>{GOOGLE_REVIEWS.count} avis clients</small></span><ArrowUpRight size={16} aria-hidden="true" />
  </a>;
}
export function GoogleReviews() {
  return <section id="avis-google" className="google-reviews-section" aria-labelledby="google-reviews-title"><div className="wm-container">
    <div className="google-reviews-heading"><div><p className="eyebrow">LEURS MOTS, VOTRE CONFIANCE</p><h2 id="google-reviews-title">Un nouveau départ.<br /><span>Ils nous l’ont confié.</span></h2></div><p>Derrière chaque déménagement, une expérience à raconter. Retrouvez les retours de nos clients sur Google.</p></div>
    <div className="google-reviews-grid">
      <div className="google-review-score"><div className="google-review-brand"><GoogleMark /><span>Avis Google</span></div><div className="google-review-value">{GOOGLE_REVIEWS.rating}<span>/5</span></div><Stars /><p>Sur <strong>{GOOGLE_REVIEWS.count} avis</strong> publiés sur Google</p><a href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer">Consulter tous les avis <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a></div>
      {GOOGLE_REVIEWS.excerpts.map(review => <figure key={review.author} className="google-review-card"><div className="google-review-card-top"><span aria-label={`${review.rating} sur 5`}><Stars /></span><span className="google-review-quote" aria-hidden="true">“</span></div><blockquote>{review.text}</blockquote><figcaption><span className="google-review-avatar" aria-hidden="true">{review.initials}</span><span><strong>{review.author}</strong><small>Avis publié sur Google</small></span></figcaption><a href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer">Retrouver les avis sur Google <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a></figure>)}
    </div><div className="google-reviews-footnote"><p>Sélection d’extraits. Note et nombre d’avis relevés le <time dateTime={GOOGLE_REVIEWS.checkedAt}>{GOOGLE_REVIEWS.checkedLabel}</time>.</p><a href={GOOGLE_REVIEWS.url} target="_blank" rel="noopener noreferrer">Votre expérience compte aussi <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (Google, nouvel onglet)</span></a></div>
  </div></section>;
}

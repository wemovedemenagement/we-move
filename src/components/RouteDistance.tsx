import { useEffect, useState } from 'react';
import { Route } from 'lucide-react';
import { loadPlaces } from './AddressAutocomplete';
import { openCookiePreferences, useGooglePlacesConsent } from '../data/consent';

type RoutesLibrary = { Route: { computeRoutes: (request: Record<string, unknown>) => Promise<{ routes: { distanceMeters?: number }[] }> } };
type Result = { key: string; meters?: number; failed?: boolean };

export function RouteDistance({ departure, arrival, unknown }: { departure: string; arrival: string; unknown: boolean }) {
  const consent = useGooglePlacesConsent();
  const origin = departure.trim(), destination = arrival.trim();
  const key = JSON.stringify([origin, destination]);
  const [result, setResult] = useState<Result | null>(null);
  const eligible = !!origin && !!destination && !unknown;
  useEffect(() => {
    if (!eligible || !consent || !import.meta.env.VITE_GOOGLE_MAPS_API_KEY) return;
    let active = true;
    let timeout: ReturnType<typeof setTimeout>;
    const timer = setTimeout(async () => {
      timeout = setTimeout(() => { if (active) { active = false; setResult({ key, failed: true }); } }, 15000);
      try {
        await loadPlaces();
        const maps = (window as unknown as { google: { maps: { importLibrary: (name: string) => Promise<RoutesLibrary> } } }).google.maps;
        const { Route } = await maps.importLibrary('routes');
        if (!active) return;
        const { routes } = await Route.computeRoutes({ origin, destination, travelMode: 'DRIVING', routingPreference: 'TRAFFIC_UNAWARE', fields: ['distanceMeters'] });
        const meters = routes[0]?.distanceMeters;
        if (active) setResult(typeof meters === 'number' && Number.isFinite(meters) && meters >= 0 ? { key, meters } : { key, failed: true });
      } catch { if (active) setResult({ key, failed: true }); }
      finally { clearTimeout(timeout); }
    }, 1200);
    return () => { active = false; clearTimeout(timer); clearTimeout(timeout); };
  }, [origin, destination, key, eligible, consent]);
  const current = consent && eligible && result?.key === key ? result : null;
  return <div className="quote-distance" aria-live="polite"><dt><Route size={15} />Distance routière</dt><dd>
    {!eligible ? 'À préciser' : !consent ? <button type="button" className="text-link" onClick={openCookiePreferences}>Activer le calcul Google</button> : !import.meta.env.VITE_GOOGLE_MAPS_API_KEY || current?.failed ? <>À confirmer<small>Calcul indisponible. Vous pouvez continuer.</small></> : current?.meters !== undefined ? <><strong>{(current.meters / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km</strong><small>Google Maps · trajet indicatif, à confirmer selon les accès du camion.</small></> : 'Calcul en cours…'}
  </dd></div>;
}

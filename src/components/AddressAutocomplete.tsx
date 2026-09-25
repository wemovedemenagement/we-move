import { useGooglePlacesConsent, openCookiePreferences } from '../data/consent';
import { useEffect, useRef, useState } from 'react';

type AddressWidget = HTMLElement & { value: string; disabled: boolean; placeholder: string };
type PlacesLibrary = { PlaceAutocompleteElement: new (options: Record<string, unknown>) => AddressWidget };
type MapsWindow = Window & { google?: { maps: { importLibrary: (name: string) => Promise<PlacesLibrary> } }; weMoveMapsReady?: () => void };
let placesPromise: Promise<PlacesLibrary> | undefined;

function loadPlaces() {
  if (placesPromise) return placesPromise;
  const mapsWindow = window as MapsWindow;
  placesPromise = new Promise<PlacesLibrary>((resolve, reject) => {
    if (mapsWindow.google?.maps?.importLibrary) {
      mapsWindow.google.maps.importLibrary('places').then(resolve, reject);
      return;
    }
    const script = document.createElement('script');
    const timer = window.setTimeout(() => reject(new Error('Maps timeout')), 15000);
    mapsWindow.weMoveMapsReady = () => {
      window.clearTimeout(timer);
      mapsWindow.google!.maps.importLibrary('places').then(resolve, reject);
      delete mapsWindow.weMoveMapsReady;
    };
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, loading: 'async', callback: 'weMoveMapsReady', v: 'weekly', language: 'fr', region: 'FR' })}`;
    script.async = true;
    script.onerror = () => { window.clearTimeout(timer); reject(new Error('Maps unavailable')); };
    document.head.append(script);
  });
  return placesPromise;
}

type Props = { id: string; label: string; value: string; onChange: (value: string) => void; disabled?: boolean; required?: boolean; invalid?: boolean; describedBy?: string; placeholder: string };

export function AddressAutocomplete(props: Props) {
  const consent = useGooglePlacesConsent();
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<AddressWidget | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [ready, setReady] = useState(false);
  const [manual, setManual] = useState(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReady(false);
    if (manual || !consent) return;
    let active = true;
    let revision = 0;
    const fallback = () => { if (active) { setFailed(true); setManual(true); } };
    loadPlaces().then(({ PlaceAutocompleteElement }) => {
      if (!active || !host.current) return;
      const element = new PlaceAutocompleteElement({ requestedLanguage: 'fr', requestedRegion: 'fr', value: latest.current.value });
      widget.current = element;
      element.id = latest.current.id;
      element.placeholder = latest.current.placeholder;
      element.disabled = !!latest.current.disabled;
      element.setAttribute('aria-label', latest.current.label);
      element.setAttribute('aria-required', String(!!latest.current.required));
      element.setAttribute('aria-invalid', String(!!latest.current.invalid));
      if (latest.current.describedBy) element.setAttribute('aria-describedby', latest.current.describedBy);
      element.addEventListener('input', () => { revision++; latest.current.onChange(element.value); });
      element.addEventListener('gmp-error', fallback);
      element.addEventListener('gmp-select', async (event: Event) => {
        const selectedRevision = ++revision;
        const { placePrediction } = event as Event & { placePrediction: { toPlace: () => { formattedAddress?: string; fetchFields: (options: { fields: string[] }) => Promise<unknown> } } };
        latest.current.onChange(element.value);
        try {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['formattedAddress'] });
          if (!active || selectedRevision !== revision || latest.current.disabled) return;
          const address = place.formattedAddress || element.value;
          element.value = address;
          latest.current.onChange(address);
        } catch { fallback(); }
      });
      host.current.replaceChildren(element);
      setReady(true);
    }).catch(fallback);
    return () => { active = false; widget.current?.remove(); widget.current = null; };
  }, [manual, consent]);

  useEffect(() => {
    if (!widget.current) return;
    widget.current.disabled = !!props.disabled;
    if (widget.current.value !== props.value) widget.current.value = props.value;
    widget.current.setAttribute('aria-invalid', String(!!props.invalid));
    widget.current.setAttribute('aria-required', String(!!props.required));
    if (props.describedBy) widget.current.setAttribute('aria-describedby', props.describedBy);
    else widget.current.removeAttribute('aria-describedby');
  }, [props.value, props.disabled, props.invalid, props.required, props.describedBy]);

  return <div className="address-autocomplete">
    <div ref={host} hidden={manual || !ready || !consent} />
    {(manual || !ready || !consent) && <input id={props.id} aria-label={props.label} value={props.value} onChange={event => props.onChange(event.target.value)} placeholder={props.placeholder} autoComplete="street-address" maxLength={300} disabled={props.disabled} required={props.required} aria-invalid={props.invalid} aria-describedby={props.describedBy} />}
    {failed && <small role="status">Les suggestions sont indisponibles. Saisissez votre adresse directement.</small>}
    {!consent && !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && <button className="address-manual" type="button" disabled={props.disabled} onClick={openCookiePreferences}>Activer les suggestions Google</button>}
    {!manual && ready && consent && <button className="address-manual" type="button" disabled={props.disabled} onClick={() => setManual(true)}>Saisir mon adresse manuellement</button>}
  </div>;
}

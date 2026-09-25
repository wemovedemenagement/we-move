import { useEffect, useRef, useState } from 'react';
import { Cookie, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { googlePlacesAllowed, hasConsentChoice, saveConsent } from '../data/consent';
import { Link } from '../router';
export function CookieConsent() {
 const dialog = useRef<HTMLDialogElement>(null);
 const [details,setDetails] = useState(false);
 const [google,setGoogle] = useState(false);
 useEffect(()=>{
  const open = () => { setGoogle(googlePlacesAllowed()); setDetails(false); if(!dialog.current?.open) dialog.current?.showModal(); };
  const preferences = () => { open(); setDetails(true); };
  if(!hasConsentChoice()) open();
  window.addEventListener('wemove-open-cookies',preferences);
  const sync = () => { if(hasConsentChoice()) dialog.current?.close(); };
  window.addEventListener('storage',sync);
  return () => { window.removeEventListener('wemove-open-cookies',preferences); window.removeEventListener('storage',sync); };
 },[]);
 const choose = (allowed:boolean) => { saveConsent(allowed); dialog.current?.close(); };
 return <dialog ref={dialog} className="cookie-dialog" aria-labelledby="cookie-title" aria-describedby="cookie-description">
  <div className="cookie-top"><span className="cookie-symbol"><Cookie size={27} strokeWidth={1.4}/></span><span>WE MOVE · VOTRE CONFIDENTIALITÉ</span><button type="button" className="cookie-close" aria-label="Fermer sans modifier mes choix" onClick={()=>dialog.current?.close()}><X size={20}/></button></div>
  <h2 id="cookie-title">Votre visite.<br/><em>Vos préférences.</em></h2>
  <p id="cookie-description">Nous mémorisons vos choix pour faciliter votre visite. Avec votre accord, Google Places peut proposer des adresses dans le formulaire de devis. La saisie manuelle reste toujours disponible.</p>
  <div className="cookie-reassurance"><ShieldCheck size={16}/><span>Aucun outil publicitaire ni de mesure d’audience installé.</span></div>
  {details && <div className="cookie-settings">
   <div className="cookie-setting"><div><h3>Fonctionnement essentiel</h3><p>Mémorisation de vos préférences et de l’inventaire de votre calculateur de volume.</p></div><span className="cookie-required">Toujours actif</span></div>
   <div className="cookie-setting"><div><h3 id="cookie-google-label">Suggestions d’adresses Google</h3><p id="cookie-google-info">Autorise le chargement de Google Places dans le devis. Les adresses saisies sont alors transmises à Google pour proposer des résultats.</p><a href="https://policies.google.com/privacy?hl=fr" target="_blank" rel="noopener noreferrer">Confidentialité Google ↗</a></div><button type="button" role="switch" aria-checked={google} aria-labelledby="cookie-google-label" aria-describedby="cookie-google-info" className="cookie-switch" onClick={()=>setGoogle(!google)}><span/></button></div>
   <p className="cookie-duration">Votre choix est conservé pendant 6 mois dans ce navigateur. Vous pouvez le modifier à tout moment via « Gérer mes cookies » en bas de page.</p>
  </div>}
  <div className="cookie-actions"><button type="button" onClick={()=>choose(false)}>Tout refuser</button><button type="button" onClick={()=>choose(true)}>Tout accepter</button></div>
  {details ? <button type="button" className="cookie-custom" onClick={()=>choose(google)}>Enregistrer mes préférences</button> : <button type="button" className="cookie-custom" onClick={()=>setDetails(true)}><SlidersHorizontal size={15}/>Personnaliser mes choix</button>}
  <div className="cookie-bottom"><Link href="/politique-confidentialite/" onClick={()=>dialog.current?.close()}>Politique de confidentialité</Link><span>Un choix libre, à tout moment.</span></div>
 </dialog>;
}

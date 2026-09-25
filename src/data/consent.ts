import { useSyncExternalStore } from 'react';
export const CONSENT_KEY = 'wemove-consent-v1';
const EVENT = 'wemove-consent-changed';
type Consent = { version: 1; googlePlaces: boolean; expiresAt: number };
let memory: Consent | null = null;
function read(): Consent | null {
 if (typeof window === 'undefined') return null;
 try { const raw = localStorage.getItem(CONSENT_KEY); if(raw) { const value = JSON.parse(raw); if(value.version === 1 && typeof value.googlePlaces === 'boolean' && Number.isFinite(value.expiresAt) && value.expiresAt > Date.now()) return value; return null; } } catch { /* Storage may be unavailable. */ }
 return memory && memory.expiresAt > Date.now() ? memory : null;
}
export const hasConsentChoice = () => read() !== null;
export const googlePlacesAllowed = () => read()?.googlePlaces === true;
export function saveConsent(googlePlaces: boolean) {
 const expiry = new Date(); expiry.setMonth(expiry.getMonth()+6);
 memory = { version:1, googlePlaces, expiresAt:expiry.getTime() };
 try { localStorage.setItem(CONSENT_KEY, JSON.stringify(memory)); } catch { /* Keep the choice for this visit. */ }
 window.dispatchEvent(new Event(EVENT));
}
function subscribe(callback: () => void) {
 window.addEventListener(EVENT,callback); window.addEventListener('storage',callback);
 return () => { window.removeEventListener(EVENT,callback); window.removeEventListener('storage',callback); };
}
export function useGooglePlacesConsent() { return useSyncExternalStore(subscribe,googlePlacesAllowed,()=>false); }
export function openCookiePreferences() { window.dispatchEvent(new Event('wemove-open-cookies')); }

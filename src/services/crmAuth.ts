import {setCrmTokenProvider} from './crmService';
let authPromise:Promise<import('firebase/auth').Auth>|null=null;
export async function firebaseAuth(){
  if(!authPromise)authPromise=(async()=>{
    const [app,sdk,response]=await Promise.all([import('firebase/app'),import('firebase/auth'),fetch('/api/crm/auth-config',{cache:'no-store'})]);
    const data=await response.json();if(!response.ok||!data.config)throw new Error('Configuration de connexion indisponible.');
    const auth=sdk.getAuth(app.getApps().length?app.getApp():app.initializeApp(data.config));
    auth.languageCode='fr';
    await sdk.setPersistence(auth,sdk.browserSessionPersistence);
    await auth.authStateReady();
    setCrmTokenProvider(async()=>auth.currentUser?auth.currentUser.getIdToken():null);
    return auth;
  })().catch(error=>{authPromise=null;throw error;});
  return authPromise;
}
export function authError(error:unknown){
  const code=(error as {code?:string})?.code;
  const messages:Record<string,string>={
    'auth/invalid-credential':'Adresse e-mail ou mot de passe incorrect.',
    'auth/wrong-password':'Adresse e-mail ou mot de passe incorrect.',
    'auth/user-not-found':'Adresse e-mail ou mot de passe incorrect.',
    'auth/invalid-email':'Vérifiez votre adresse e-mail.',
    'auth/too-many-requests':'Trop de tentatives. Patientez avant de réessayer.',
    'auth/popup-closed-by-user':'Connexion annulée.',
    'auth/cancelled-popup-request':'Connexion annulée.',
    'auth/popup-blocked':'Autorisez la fenêtre de connexion Google dans votre navigateur.',
    'auth/operation-not-allowed':'Cette méthode de connexion n’est pas encore activée.',
    'auth/unauthorized-domain':'Ce domaine n’est pas autorisé pour la connexion.',
    'auth/network-request-failed':'Connexion interrompue. Vérifiez votre réseau et réessayez.',
    'auth/requires-recent-login':'Reconnectez-vous pour confirmer cette modification de sécurité.',
    'auth/invalid-verification-code':'Code incorrect ou expiré. Saisissez le code actuel de votre application.',
    'auth/code-expired':'Cette vérification a expiré. Recommencez la connexion.',
    'auth/invalid-multi-factor-session':'Cette vérification a expiré. Recommencez la connexion.',
    'auth/multi-factor-info-not-found':'Ce moyen de vérification n’est plus disponible. Recommencez la connexion.',
    'auth/user-token-expired':'Votre session a expiré. Reconnectez-vous.',
    'auth/user-disabled':'Ce compte est désactivé. Contactez le gérant.',
    'auth/weak-password':'Choisissez un mot de passe plus robuste.',
    'auth/password-does-not-meet-requirements':'Le mot de passe ne respecte pas les exigences de sécurité.',
    'auth/unverified-email':'Vérifiez votre adresse e-mail avant d’activer la double authentification.',
    'auth/account-exists-with-different-credential':'Utilisez votre méthode de connexion habituelle pour ce compte.',
  };
  return code ? messages[code]||'La vérification n’a pas abouti. Réessayez ou reconnectez-vous.' : error instanceof Error?error.message:'Connexion impossible.';
}

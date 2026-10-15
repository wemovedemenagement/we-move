export const storageStates={prevu:'Prévu',stocke:'Stocké',sorti:'Sorti',annule:'Annulé'};
export const storageFields={site:'Site de stockage',location:'Repère d’emplacement',volume:'Volume à stocker (m³)',expectedEntry:'Entrée prévue',expectedExit:'Sortie prévue',actualEntry:'Entrée réelle',actualExit:'Sortie réelle',goods:'Biens confiés',notes:'Notes',status:'État'};
export function storageOverview(stays,today){
 const stored=stays.filter(s=>s.status==='stocke');
 return {planned:stays.filter(s=>s.status==='prevu').length,stored:stored.length,volume:Math.round(stored.reduce((n,s)=>n+s.volume,0)*100)/100,exitDue:stored.filter(s=>s.expectedExit&&s.expectedExit<=today).length};
}

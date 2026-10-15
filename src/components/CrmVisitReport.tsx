import type {QuoteLead} from '../types/crm';
import {inventoryVolume} from '../../shared/technicalVisit.mjs';
export default function CrmVisitReport({lead}:{lead:QuoteLead}){
 const visit=lead.technicalVisit;if(!visit)return null;
 return <details className="technical-visit-access visit-report"><summary>Relevé de visite · {visit.items.length} ligne{visit.items.length>1?'s':''} · {inventoryVolume(visit.items).toLocaleString('fr-FR')} m³ inventoriés</summary>
  <p>Relevé de la visite pour préparer l’intervention. Volume retenu au dossier : {lead.volume||'à préciser'} m³. Les conditions contractuelles restent celles du devis.</p>
  <div className="visit-report-access">{(['departure','arrival'] as const).map(side=><div key={side}><h4>{side==='departure'?'Au départ':'À l’arrivée'}</h4><p>Étage : {visit[side].floor||'à vérifier'} · Ascenseur : {visit[side].elevator||'à vérifier'} · Portage : {visit[side].carry?`${visit[side].carry} m`:'à vérifier'}</p><p className="whitespace-pre-wrap">{visit[side].notes||'Aucune précision d’accès enregistrée.'}</p></div>)}</div>
  {visit.items.length>0&&<div className="visit-report-inventory">{visit.items.map((item,i)=><div key={i}><span>{item.quantity} × {item.label}<small>{item.room}</small></span><strong>{(item.quantity*item.unitVolume).toLocaleString('fr-FR')} m³</strong></div>)}</div>}
  {lead.visitNotes&&<p className="whitespace-pre-wrap">{lead.visitNotes}</p>}
 </details>;
}

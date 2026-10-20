import {Check,ChevronDown,ArrowUpRight,ClipboardList,Minus} from 'lucide-react';
import type {QuoteLead} from '../types/crm';
import {requestQualification} from '../../shared/requestQualification.mjs';
import './crmRequestQualification.css';

export default function CrmRequestQualification({lead,onEdit,onVisit}:{lead:QuoteLead;onEdit:()=>void;onVisit:()=>void}) {
  if (['confirme','termine','refuse'].includes(lead.status)) return null;
  const {rows,pending} = requestQualification(lead);
  return <details className="request-qualification">
    <summary><ClipboardList size={18} aria-hidden="true"/><span><strong>Les repères du projet</strong><small>{pending ? `${pending} point${pending>1?'s':''} à préciser` : 'Repères renseignés'}</small></span><ChevronDown size={17} aria-hidden="true"/></summary>
    <div className="request-qualification-content">
      <p>Les informations enregistrées pour préparer votre proposition. Vous pouvez avancer même si certains points restent à convenir.</p>
      <ul>{rows.map(row=><li key={row.id} data-recorded={row.recorded}>
        <span className="request-qualification-mark" aria-hidden="true">{row.recorded?<Check size={15}/>:<Minus size={15}/>}</span>
        <div><strong>{row.label}</strong><p>{row.detail}</p></div>
        {!row.recorded&&<button type="button" onClick={row.target==='visit'?onVisit:onEdit} aria-label={`${row.target==='visit'?'Ouvrir la visite':'Compléter le dossier'} : ${row.label}`}>{row.target==='visit'?'Ouvrir la visite':'Compléter'}<ArrowUpRight size={14} aria-hidden="true"/></button>}
      </li>)}</ul>
      <p className="request-qualification-note">Ces repères ne valident ni le chiffrage, ni la disponibilité des équipes. Les conditions se vérifient dans le devis.</p>
    </div>
  </details>;
}

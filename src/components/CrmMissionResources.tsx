import {useState} from 'react';
import {Users,Truck,Search,Check,Clock3,Box,RefreshCw} from 'lucide-react';
import type {PlanningData,CrmResource,MoveBooking,ResourceAbsence} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import {missionSelectionReview,missionCapacity} from '../../shared/missionResources.mjs';
import {absenceLabels} from '../../shared/resourceAvailability.mjs';
import './crmMissionResources.css';

type AvailabilityRow={resource:CrmResource;state:string;reservations:MoveBooking[];absences:ResourceAbsence[]};
const kinds={person:'Équipe',vehicle:'Véhicules',lift:'Monte-meubles'};
const states:Record<string,string>={available:'Libre sur tout le créneau',busy:'Déjà réservé',unavailable:'Indisponible',inactive:'Désactivé'};
const dateTime=(value:string)=>`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)} à ${value.slice(11)}`;
const number=(value:number)=>value.toLocaleString('fr-FR',{maximumFractionDigits:2});
const fold=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');

export default function CrmMissionResources({data,lead,start,end,ids,onSelection,stale,onRefresh,review}:{review:ReturnType<typeof missionSelectionReview>;data:PlanningData;lead:QuoteLead;start:string;end:string;ids:string[];onSelection:(ids:string[])=>void;stale:boolean;onRefresh:()=>void}){
  const [query,setQuery]=useState(''),[onlyFree,setOnlyFree]=useState(false),[limit,setLimit]=useState(12);
  const availability=review.availability as {valid:boolean;rows:AvailabilityRow[]};
  const verified=review.verified;
  // Invalid dates never imply availability. Keep saved selections removable.
  const rows=verified?availability.rows:data.registry.resources.map(resource=>({resource,state:'unchecked',reservations:[],absences:[]} as AvailabilityRow));
  const capacity=missionCapacity(lead,data.registry.resources,ids);
  const selected=data.registry.resources.filter(r=>ids.includes(r.id));
  const words=fold(query).trim().split(/\s+/).filter(Boolean);
  return <div className="crm-mission-resources">
    <div className="mission-selection-summary" aria-label="Moyens sélectionnés"><span><Users size={17}/><strong>{selected.filter(r=>r.kind==='person').length}</strong> équipier(s)</span><span><Truck size={17}/><strong>{selected.filter(r=>r.kind==='vehicle').length}</strong> véhicule(s)</span><span><Box size={17}/>{capacity.volumeM3===null?'Volume à préciser':`${number(capacity.volumeM3)} m³ à transporter`}</span></div>
    {!!review.issues.length&&<section className="mission-selection-review" aria-label="Moyens sélectionnés à vérifier"><header aria-live="polite"><strong>{review.issues.length} moyen{review.issues.length>1?'s':''} à vérifier</strong><p>Retirez ou remplacez les moyens signalés. La sélection ne sera enregistrée qu’après votre confirmation de la mission.</p></header><ul>{review.issues.map(issue=><li key={issue.id}><div><strong>{issue.name}</strong><span>{issue.message}</span>{issue.state==='missing'&&<small>Référence : {issue.id}</small>}</div><button type="button" className="crm-quiet-action" aria-label={'Retirer '+issue.name+' de la sélection'} onClick={()=>onSelection(ids.filter(id=>id!==issue.id))}>Retirer de la sélection</button></li>)}</ul>{!verified&&<p>Les disponibilités restent à actualiser. Aucun moyen n’est déclaré libre à partir d’anciennes données.</p>}</section>}
    <div className="mission-capacity" data-state={capacity.state} aria-live="polite"><strong>{capacity.state==='no_vehicle'?'Choisissez au moins un véhicule':capacity.state==='no_volume'?'Précisez le volume pour comparer les moyens':capacity.state==='unknown'?'Capacité à compléter dans le registre':capacity.state==='short'?'Volume supérieur à la capacité sélectionnée':'Capacité volumique renseignée couvrant le volume'}</strong><p>{capacity.vehicleCount>0&&`${number(capacity.capacityM3)} m³ renseignés pour ${capacity.vehicleCount} véhicule(s) sélectionné(s). `}{capacity.missing>0&&`${capacity.missing} capacité(s) non renseignée(s). `}{capacity.state==='short'?'Prévoyez un autre véhicule ou organisez les rotations. ':''}Cette comparaison ne valide ni la charge utile ni le passage du mobilier.</p></div>
    {!availability.valid&&<p className="mission-hint" role="status">Choisissez un début et une fin valides pour vérifier les disponibilités et sélectionner les moyens.</p>}
    {stale&&<p className="mission-warning" role="status">Actualisez les disponibilités avant de confirmer. Vos dates et votre sélection restent conservées.</p>}
    <button type="button" className="crm-quiet-action" onClick={onRefresh}><RefreshCw size={14}/>Actualiser les disponibilités</button>
    <div className="mission-resource-filters"><label className="mission-resource-search"><Search size={16}/><input type="search" aria-label="Rechercher une ressource pour la mission" placeholder="Nom, immatriculation, qualification…" value={query} onChange={e=>{e.stopPropagation();setQuery(e.target.value);setLimit(12);}}/></label><label><input type="checkbox" checked={onlyFree} onChange={e=>{e.stopPropagation();setOnlyFree(e.target.checked);setLimit(12);}} disabled={!verified}/>Uniquement les moyens libres</label></div>
    <p className="mission-hint">Les moyens sélectionnés restent affichés. Incluez les trajets et la préparation dans le créneau ; la disponibilité sera contrôlée à nouveau à l’enregistrement.</p>
    <div className="mission-resource-groups">
      {Object.entries(kinds).map(([kind,label])=>{
        const group=rows.filter(row=>row.resource.kind===kind&&(row.resource.active||ids.includes(row.resource.id)));
        const filtered=group.filter(row=>ids.includes(row.resource.id)||((!onlyFree||row.state==='available')&&words.every(word=>fold(row.resource.name+' '+row.resource.detail).includes(word))));
        const checked=filtered.filter(row=>ids.includes(row.resource.id)),others=filtered.filter(row=>!ids.includes(row.resource.id));
        return <fieldset key={kind}><legend>{kind==='person'?<Users size={16}/>:<Truck size={16}/>} {label}<small>{verified?`${group.filter(row=>row.state==='available').length} libre(s)`:'À vérifier'}</small></legend>
          {!group.length?<p className="mission-hint">Aucune ressource. À renseigner dans « Équipes et flotte ».</p>:!filtered.length?<p className="mission-hint">Aucun moyen ne correspond aux filtres.</p>:[...checked,...others.slice(0,limit)].map(row=>{
            const r=row.resource,isSelected=ids.includes(r.id),canSelect=verified&&row.state==='available';
            return <div className="mission-resource-card" data-state={row.state} data-selected={isSelected} key={r.id}><label className="mission-resource"><input type="checkbox" aria-label={`Affecter ${r.name}`} checked={isSelected} disabled={!isSelected&&!canSelect} onChange={e=>onSelection(e.target.checked?[...ids,r.id]:ids.filter(id=>id!==r.id))}/><span><strong>{r.name}</strong><small>{r.detail}</small>{r.kind==='vehicle'&&<small>{r.capacityM3?`${number(r.capacityM3)} m³`:'Capacité non renseignée'}</small>}</span></label><span className="mission-resource-state">{row.state==='available'?<Check size={13}/>:<Clock3 size={13}/>} {states[row.state]||'Créneau à vérifier'}</span>
              {!!(row.reservations.length+row.absences.length)&&<details className="mission-resource-constraints"><summary>Voir les contraintes ({row.reservations.length+row.absences.length})</summary>{row.absences.map((p,i)=><p key={'absence-'+i}><strong>{absenceLabels[p.reason]}</strong><br/>{dateTime(p.start)} → {dateTime(p.end)}</p>)}{row.reservations.map(b=><p key={b.leadId}><strong>Mission · {b.clientName}</strong><br/>{dateTime(b.start)} → {dateTime(b.end)}</p>)}</details>}
            </div>;
          })}
          {others.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(value=>value+12)}>Afficher plus de {label.toLocaleLowerCase('fr')} ({others.length-limit})</button>}
        </fieldset>;
      })}
    </div>
  </div>;
}

import {useState} from 'react';
import {Plus,Trash2,CalendarOff} from 'lucide-react';
import type {ResourceAbsence} from '../services/crmService';
import {absenceLabels} from '../../shared/resourceAvailability.mjs';
export default function CrmAbsenceEditor({initial,onDirty}:{initial:ResourceAbsence[];onDirty:()=>void}){
 const [periods,setPeriods]=useState(initial);
 const change=(next:ResourceAbsence[])=>{setPeriods(next);onDirty();};
 return <section className="resource-absences">
  <input type="hidden" name="unavailablePeriods" value={JSON.stringify(periods)}/>
  <h4><CalendarOff size={18}/>Indisponibilités temporaires</h4>
  <p>Congés, maintenance ou empêchement. Ces périodes bloquent toute nouvelle affectation. Horaires de Paris ; la ressource redevient disponible à l’heure de fin.</p>
  {!periods.length&&<p className="resource-absence-empty">Aucune période bloquée.</p>}
  {periods.map((p,i)=><fieldset key={i} className="resource-absence-row"><legend>Période {i+1}</legend><label>Du<input required aria-label={`Début indisponibilité ${i+1}`} type="datetime-local" value={p.start} onChange={e=>change(periods.map((v,j)=>i===j?{...v,start:e.target.value}:v))}/></label><label>Au<input required aria-label={`Fin indisponibilité ${i+1}`} type="datetime-local" value={p.end} onChange={e=>change(periods.map((v,j)=>i===j?{...v,end:e.target.value}:v))}/></label><label>Motif<select aria-label={`Motif indisponibilité ${i+1}`} value={p.reason} onChange={e=>change(periods.map((v,j)=>i===j?{...v,reason:e.target.value as ResourceAbsence['reason']}:v))}>{Object.entries(absenceLabels).map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label><button type="button" aria-label={`Retirer l’indisponibilité ${i+1}`} onClick={()=>change(periods.filter((_,j)=>i!==j))}><Trash2 size={17}/></button></fieldset>)}
  <button type="button" className="crm-quiet-action" disabled={periods.length>=100} onClick={()=>change([...periods,{start:'',end:'',reason:'autre'}])}><Plus size={16}/>Ajouter une indisponibilité</button>
 </section>;
}

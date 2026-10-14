import {useState} from 'react';
import {Plus, Trash2, Package, ArrowRight} from 'lucide-react';
import type {QuoteLead, TechnicalVisit} from '../types/crm';
import {inventoryVolume, visitRooms} from '../../shared/technicalVisit.mjs';

export default function CrmTechnicalVisit({lead,onDirty}:{lead:QuoteLead;onDirty:()=>void}) {
  const [value,setValue]=useState<TechnicalVisit>(()=>lead.technicalVisit||{
    items:[],
    departure:{floor:lead.departureFloor==='À préciser'?'':lead.departureFloor,elevator:lead.departureElevator?'Oui':'',carry:'',notes:''},
    arrival:{floor:lead.arrivalFloor==='À préciser'?'':lead.arrivalFloor,elevator:lead.arrivalElevator?'Oui':'',carry:'',notes:''},
  });
  const [apply,setApply]=useState(false);
  const update=(next:TechnicalVisit)=>{setValue(next);onDirty();};
  const volume=inventoryVolume(value.items);
  const itemChange=(index:number,patch:Partial<TechnicalVisit['items'][number]>)=>update({...value,items:value.items.map((item,i)=>i===index?{...item,...patch}:item)});
  return <section className="technical-visit">
    <input type="hidden" name="technicalVisit" value={JSON.stringify(value)}/>
    <input type="hidden" name="visitVolume" value={volume}/>
    <div className="technical-visit-heading"><Package size={22}/><div><h3>Les biens à déménager</h3><p>Relevez les meubles et cartons, pièce par pièce.</p></div></div>
    {value.items.length===0&&<p className="technical-visit-empty">Aucun bien recensé. Ajoutez votre première ligne pour commencer l’estimation.</p>}
    <div className="technical-visit-items">{value.items.map((item,index)=><fieldset key={index} className="technical-visit-item"><legend>Bien {index+1}</legend>
      <label>Pièce<select aria-label={`Pièce ${index+1}`} value={item.room} onChange={e=>itemChange(index,{room:e.target.value})}>{visitRooms.map(room=><option key={room}>{room}</option>)}</select></label>
      <label>Meuble ou cartons<input required maxLength={160} aria-label={`Bien ${index+1}`} placeholder="Ex. canapé, cartons livres" value={item.label} onChange={e=>itemChange(index,{label:e.target.value})}/></label>
      <div className="technical-visit-numbers"><label>Quantité<input required type="number" min={1} max={500} step={1} aria-label={`Quantité ${index+1}`} value={item.quantity||''} onChange={e=>itemChange(index,{quantity:Number(e.target.value)})}/></label><label>m³ par unité<input required type="number" min={0.01} max={100} step={0.01} aria-label={`Volume unitaire ${index+1}`} value={item.unitVolume||''} onChange={e=>itemChange(index,{unitVolume:Number(e.target.value)})}/></label><button type="button" aria-label={`Retirer le bien ${index+1}`} onClick={()=>update({...value,items:value.items.filter((_,i)=>i!==index)})}><Trash2 size={17}/></button></div>
    </fieldset>)}</div>
    <button type="button" className="technical-visit-add" disabled={value.items.length>=150} onClick={()=>update({...value,items:[...value.items,{room:'Séjour',label:'',quantity:1,unitVolume:0}]})}><Plus size={17}/> Ajouter un bien</button>
    <div className="technical-visit-total"><div><span>Volume inventorié</span><strong>{volume.toLocaleString('fr-FR')} <small>m³</small></strong></div><p>Estimation à partir de vos relevés. Vérifiez les volumes et les biens oubliés avant de l’utiliser.</p></div>
    <label className="technical-visit-apply"><input type="checkbox" name="applyVisitVolume" checked={apply&&volume>0} disabled={volume<=0||volume>1000} onChange={e=>{setApply(e.target.checked);onDirty();}}/>Utiliser ce volume pour le dossier à l’enregistrement{lead.volume>0?` (actuellement ${lead.volume} m³)`:''}</label>
    <div className="technical-visit-heading"><ArrowRight size={22}/><div><h3>Les accès aux deux adresses</h3><p>Ces précisions alimentent les nouveaux devis. Les devis existants restent inchangés.</p></div></div>
    {(['departure','arrival'] as const).map(side=><details key={side} className="technical-visit-access"><summary>{side==='departure'?'Chargement · départ':'Déchargement · arrivée'}</summary><p>{lead[`${side}Address`]||'Adresse à préciser'}</p><div className="technical-visit-access-grid">{(['floor','elevator','carry','notes'] as const).map(key=>{const label={floor:'Étage',elevator:'Ascenseur',carry:'Portage (m)',notes:'Contraintes et dimensions utiles'}[key];const props={value:value[side][key],onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>update({...value,[side]:{...value[side],[key]:e.target.value}}),'aria-label':`${label} ${side==='departure'?'départ':'arrivée'}`};return <label key={key}>{label}{key==='elevator'?<select {...props}><option value="">À vérifier</option><option>Oui</option><option>Non</option></select>:key==='notes'?<textarea {...props} maxLength={3000} rows={3}/>:<input {...props} type={key==='carry'?'number':'text'} min={0} max={5000} step="0.01" maxLength={80}/>}</label>;})}</div></details>)}
  </section>;
}

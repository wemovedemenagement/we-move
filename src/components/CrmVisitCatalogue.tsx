import {useState} from 'react';
import {Search,Plus,Package} from 'lucide-react';
import {INVENTORY_ITEMS,type FurnitureItem} from '../data/volumeData';
import {visitCatalogueResults} from '../../shared/visitCatalogue.mjs';
import type {TechnicalVisit} from '../types/crm';

export default function CrmVisitCatalogue({room,items,onAdd,onInspect}:{onInspect:()=>void;room:string;items:TechnicalVisit['items'];onAdd:(item:FurnitureItem)=>boolean}){
 const [query,setQuery]=useState(''),[limit,setLimit]=useState(8),[added,setAdded]=useState('');
 const results=visitCatalogueResults(INVENTORY_ITEMS,query,room) as FurnitureItem[];
 return <details className="visit-catalogue"><summary><Package size={18}/><span>Ajouter un bien courant<small>Mobilier, électroménager et cartons</small></span></summary><div className="visit-catalogue-content">
  <p>Ajout dans <strong>{room}</strong>. Les volumes du calculateur WE MOVE sont indicatifs : ajustez-les selon le bien réellement observé.</p>
  <label className="visit-catalogue-search"><Search size={16}/><span className="sr-only">Rechercher un bien courant</span><input type="search" aria-label="Rechercher un bien courant" value={query} onChange={e=>{e.stopPropagation();setQuery(e.target.value);setLimit(8);}} placeholder="Canapé, réfrigérateur, carton…"/></label>
  {added&&<p role="status">Ajout dans le relevé en cours : {added}. Enregistrez la visite pour conserver vos changements.</p>}<button type="button" className="crm-quiet-action" disabled={!items.some(item=>item.room===room)} onClick={onInspect}>Vérifier l’inventaire de {room}</button>
  <div className="visit-catalogue-results">{results.slice(0,limit).map(item=>{
   const same=items.find(row=>row.room===room&&row.label===item.name&&row.unitVolume===item.m3);
   const disabled=same?same.quantity>=500:items.length>=150;
   const recorded=items.filter(row=>row.room===room&&row.label===item.name).reduce((total,row)=>total+row.quantity,0);
   return <article key={item.id}><div><strong>{item.name}</strong><small>{item.subtitle}</small>{recorded>0&&<small>{recorded} recensé{recorded>1?'s':''} dans {room}</small>}<span>{item.m3.toLocaleString('fr-FR')} m³ / unité · estimation</span></div><button type="button" disabled={disabled} aria-label={'Ajouter '+item.name+' dans '+room} title={disabled?'Limite de lignes ou de quantité atteinte':undefined} onClick={()=>{if(onAdd(item))setAdded(item.name);}}><Plus size={16}/>Ajouter</button></article>;
  })}</div>
  {!results.length&&<p role="status">Aucun bien trouvé. Essayez un autre terme ou ajoutez une ligne personnalisée.</p>}
  {results.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(n=>n+8)}>Afficher plus de biens ({results.length-limit})</button>}
 </div></details>;
}

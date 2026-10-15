import {useEffect,useRef,useState} from 'react';
import {Camera,RefreshCw,Trash2} from 'lucide-react';
import {request,fetchCrmPhoto} from '../services/crmService';
type Photo={slot:number;caption:string;area:string;generation:string;createdAt:string;url?:string};
const areas={depart:'Accès au départ',arrivee:'Accès à l’arrivée',mobilier:'Mobilier'};
export default function CrmVisitPhotos({leadId,readOnly=false,disabled=false,onBusy}:{leadId:string;readOnly?:boolean;disabled?:boolean;onBusy?:(busy:boolean)=>void}){
 const [photos,setPhotos]=useState<Photo[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [caption,setCaption]=useState(''),[area,setArea]=useState('mobilier'),[preview,setPreview]=useState<Photo|null>(null);
 const file=useRef<HTMLInputElement>(null),alive=useRef(true),urls=useRef<string[]>([]),lock=useRef(false);
 const load=async()=>{
  setLoading(true);setError('');
  try{
   const data=await request<{photos:Photo[]}>('/api/crm/dossiers/'+encodeURIComponent(leadId)+'/photos');
   const blobs=await Promise.all(data.photos.map(p=>fetchCrmPhoto(leadId,p.slot)));
   const next=data.photos.map((p,i)=>({...p,url:URL.createObjectURL(blobs[i])}));
   if(!alive.current){next.forEach(p=>URL.revokeObjectURL(p.url));return;}
   urls.current.forEach(URL.revokeObjectURL);urls.current=next.map(p=>p.url);setPreview(null);setPhotos(next);
  }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Photos indisponibles.');}
  finally{if(alive.current)setLoading(false);}
 };
 useEffect(()=>{alive.current=true;void load();return()=>{alive.current=false;urls.current.forEach(URL.revokeObjectURL);};},[leadId]);
 const act=async(action:()=>Promise<void>)=>{
  if(lock.current||disabled)return;lock.current=true;setBusy(true);onBusy?.(true);setError('');setNotice('');
  try{await action();await load();}catch(e){setError(e instanceof Error?e.message:'Action impossible. Réessayez.');}
  finally{lock.current=false;setBusy(false);onBusy?.(false);}
 };
 const upload=(selected:File)=>void act(async()=>{
  if(!['image/jpeg','image/png','image/webp'].includes(selected.type)||selected.size>8*1024*1024)throw new Error('Choisissez un JPEG, PNG ou WebP de 8 Mo maximum.');
  const slot=Array.from({length:12},(_,i)=>i+1).find(i=>!photos.some(p=>p.slot===i));
  if(!slot)throw new Error('La limite de 12 photos est atteinte. Retirez une photo pour en ajouter une autre.');
  await request('/api/crm/dossiers/'+encodeURIComponent(leadId)+'/photos/'+slot+'?'+new URLSearchParams({caption,area}),{method:'PUT',headers:{'Content-Type':selected.type},body:selected,signal:AbortSignal.timeout(60000)});
  setCaption('');setNotice('Photo enregistrée dans le dossier.');
 });
 return <section className="visit-photos" aria-label="Photos de la visite">
  <div className="technical-visit-heading"><Camera size={22}/><div><h3>Photos du dossier <span>{photos.length}/12</span></h3><p>Accès étroits, mobilier fragile, escaliers… Photos privées, réservées à l’équipe autorisée.</p></div></div>
  <button type="button" disabled={disabled||busy||loading} onClick={()=>void load()} className="visit-photo-refresh"><RefreshCw size={14}/>Actualiser les photos</button>
  {loading?<p role="status">Chargement des photos…</p>:!photos.length&&!error?<p className="technical-visit-empty">Aucune photo ajoutée à ce dossier.</p>:null}
  <div className="visit-photo-grid">{photos.map(photo=><article key={photo.slot}><button type="button" onClick={()=>setPreview(preview?.slot===photo.slot?null:photo)} aria-label={`Agrandir ${photo.caption||areas[photo.area as keyof typeof areas]}`}><img src={photo.url} alt={photo.caption||areas[photo.area as keyof typeof areas]}/></button><p>{photo.caption||areas[photo.area as keyof typeof areas]}</p><small>{areas[photo.area as keyof typeof areas]}</small>{!readOnly&&<button type="button" disabled={disabled||busy||loading} aria-label={`Supprimer la photo ${photo.slot}`} onClick={()=>{if(window.confirm('Supprimer définitivement cette photo du dossier ?'))void act(async()=>{await request('/api/crm/dossiers/'+encodeURIComponent(leadId)+'/photos/'+photo.slot+'?'+new URLSearchParams({generation:photo.generation}),{method:'DELETE'});setNotice('Photo supprimée.');});}}><Trash2 size={15}/>Supprimer</button>}</article>)}</div>
  {preview&&<div className="visit-photo-preview"><button type="button" onClick={()=>setPreview(null)}>Fermer l’agrandissement</button><img src={preview.url} alt={preview.caption||'Photo de la visite'}/></div>}
  {!readOnly&&<div className="visit-photo-upload"><label>Emplacement<select aria-label="Emplacement de la photo" value={area} disabled={disabled||busy} onChange={e=>setArea(e.target.value)}>{Object.entries(areas).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><label>Légende facultative<input aria-label="Légende de la photo" value={caption} maxLength={200} disabled={disabled||busy} placeholder="Ex. escalier, passage de 75 cm" onChange={e=>setCaption(e.target.value)}/></label><input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{const selected=e.target.files?.[0];e.target.value='';if(selected)upload(selected);}}/><button type="button" className="technical-visit-add" disabled={disabled||busy||loading||photos.length>=12} onClick={()=>file.current?.click()}><Camera size={17}/>{busy?'Traitement en cours…':'Ajouter une photo'}</button><p>JPEG, PNG ou WebP · 8 Mo maximum. Les photos sont enregistrées immédiatement, séparément du formulaire.</p></div>}
  {error&&<p role="alert" className="text-rose-700">{error}</p>}{notice&&<p role="status" className="text-emerald-700">{notice}</p>}
 </section>;
}

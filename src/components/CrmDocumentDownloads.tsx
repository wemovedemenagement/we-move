import {useState} from 'react';
import {Download,FileText} from 'lucide-react';
import CrmQuoteSend from './CrmQuoteSend';
import {downloadCrmPdf,type CrmPdfType} from '../services/crmService';
export default function CrmDocumentDownloads({id,disabled=false,autoPrepare=false}:{id:string;disabled?:boolean;autoPrepare?:boolean}) {
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const [type,setType]=useState<CrmPdfType>('devis');
 return <><div className="crm-document-downloads"><div><FileText size={18}/><strong>Documents PDF</strong></div><p>Version enregistrée uniquement. Les documents restent préparatoires ; la pro forma ne constitue pas une facture.</p><div><label><span className="sr-only">Document à télécharger</span><select value={type} disabled={busy} onChange={e=>setType(e.target.value as CrmPdfType)}>{[['devis','Devis et annexes'],['mission','Ordre de mission'],['lettre-voiture','Lettre de voiture'],['declaration-valeur','Déclaration de valeur vierge'],['cgv-rgpd','CGV et RGPD'],['proforma','Pro forma']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button type="button" disabled={disabled||busy} onClick={async()=>{setBusy(true);setError('');try{await downloadCrmPdf(id,type);}catch(e){setError(e instanceof Error?e.message:'Téléchargement impossible.');}finally{setBusy(false);}}}><Download size={16}/>{busy?'Génération…':'Télécharger'}</button></div>{disabled&&<p>Enregistrez vos modifications pour générer le PDF à jour.</p>}{error&&<p role="alert">{error}</p>}</div><CrmQuoteSend id={id} disabled={disabled||busy} autoPrepare={autoPrepare}/></>;
}

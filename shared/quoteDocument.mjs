import {movingFormulas} from './movingFormulas.mjs';
export const serviceLabels = [
  'Procédure des demandes de stationnement', 'Chargement, transport, livraison et mise en place du mobilier',
  'Livraison des fournitures', 'Protection du mobilier sous couvertures', 'Protection de la literie sous housses',
  'Protection HI-FI et électronique', 'Vêtements sur cintres en penderies', 'Démontage et remontage du mobilier non fixé au mur',
  'Emballage et déballage des objets fragiles', 'Emballage et déballage de la vaisselle fragile',
  'Protection des éléments fragiles', 'Décrochage mural', 'Emballage des objets non fragiles', 'Vêtements non sur cintres',
];
export const documentSections = [
 {title:'Client et proposition', fields:[['clientName','Nom / raison sociale'],['clientReference','Référence client'],['clientAddress','Adresse de facturation','textarea'],['clientEmail','E-mail','email'],['clientPhone','Téléphone','tel'],['issueDate','Date du devis','date'],['formula','Formule','select',['',...movingFormulas.map(formula=>formula.documentName),'MOVE Standard','Sur mesure']],['nature','Nature du déménagement','select',['','Urbain','Groupage','Déménagement individuel']],['volume','Volume (m³)','number'],['distance','Distance (km)','number']]},
 {title:'Commercial et société',fields:[['salesName','Nom du commercial'],['salesEmail','E-mail du commercial','email'],['salesPhone','Téléphone fixe','tel'],['salesMobile','Portable','tel'],['companyName','Société'],['companyAddress','Adresse de la société','textarea'],['companyPhone','Téléphone société','tel'],['companyEmail','E-mail société','email'],['companyCapital','Capital social (€)','number'],['companyVat','TVA intracommunautaire'],['companySiret','SIRET'],['companyRcs','RCS'],['companyApe','Code APE']]},
 ...[['departure','Chargement'],['arrival','Livraison']].map(([prefix,title])=>({title,fields:[['Address','Adresse complète','textarea'],['Start','Date / début de période','date'],['End','Fin de période (facultatif)','date'],['Contact','Contact sur place'],['Phone','Téléphone','tel'],['Floor','Étage'],['Code','Digicode'],...['Ascenseur','Monte-meubles','Passage fenêtre','Transbordement','Stationnement'].map((label,i)=>[['Elevator','Lift','Window','Shuttle','Parking'][i],label,'select',['','Oui','Non']]),['Carry','Distance de portage (m)','number'],['AccessNotes','Précisions et difficultés d’accès','textarea']].map(([key,...rest])=>[prefix+key,...rest])})),
 {title:'Garanties et déclaration de valeur',fields:[['guarantee','Mode de garantie','select',['','Responsabilité contractuelle','Assurance dommage']],['coveredValue','Valeur garantie du mobilier (€)','number'],['itemLimit','Plafond par objet (€)','number'],['declaredValue','Valeur totale déclarée par le client (€)','number'],['declaredWords','Valeur déclarée en lettres'],['insuranceNotes','Conditions particulières de garantie','textarea']]},
 {title:'Règlement et conditions particulières',fields:[['paymentKind','Versement à la commande','select',['','Arrhes','Acompte']],['balanceWhen','Échéance du solde','select',['','À la livraison','À la fin du chargement','Autre (préciser)']],['paymentMethods','Moyens et instructions de règlement','textarea'],['liftExtra','Supplément monte-meubles / demi-journée HT (€)','number'],['vehicleExtra','Supplément véhicule léger / demi-journée HT (€)','number'],['staffExtra','Supplément personnel / demi-journée HT (€)','number'],['co2','Émissions CO₂ (kg)','number'],['co2Method','Source / méthode de calcul CO₂'],['signatureCity','Lieu de signature prévu'],['cgvVersion','Référence / version des CGV à joindre'],['privacyVersion','Référence / version de l’annexe RGPD à joindre']]},
];
export function emptyQuoteDocument(source={}) {
 const fields=Object.fromEntries(documentSections.flatMap(s=>s.fields.map(([key])=>[key,''])));
 Object.assign(fields,{clientName:source.fullName||source.clientName||'',clientEmail:source.email||source.clientEmail||'',clientPhone:source.phone||source.clientPhone||'',departureAddress:source.departureAddress||'',arrivalAddress:source.arrivalAddress||'',departureStart:source.moveDate||'',departureFloor:source.departureFloor||'',arrivalFloor:source.arrivalFloor||'',volume:source.volume?String(source.volume):'',companyName:'WE MOVE',companyAddress:'163 rue de la Convention, 75015 Paris',companyPhone:'01 73 74 36 90',companyEmail:'wemove.demenagement@gmail.com',companyCapital:'15000',companyVat:'FR87891587941',companySiret:'89158794100032',companyRcs:'891587941',companyApe:'4942Z'});
 fields.formula=movingFormulas.find(formula=>formula.id===source.formula)?.documentName || (source.formula==='standard'?'MOVE Standard':'');
 for(const prefix of ['departure','arrival']) {
  fields[prefix+'Phone']=source.phone||source.clientPhone||'';
  // An unchecked website checkbox means 'not indicated', never a confirmed absence.
  fields[prefix+'Elevator']=source[prefix+'Elevator']===true?'Oui':'';
  if(fields[prefix+'Floor']==='À préciser')fields[prefix+'Floor']='';
 }
 if(source.unknownVolume)fields.volume='';
 if(fields.arrivalAddress==='À préciser')fields.arrivalAddress='';
 return {fields,services:formulaServices(fields.formula)||[],valuables:[],sourcePrefillVersion:1};
}
export function validateQuoteDocument(value) {
 const fail=message=>{const e=new Error(message);e.status=400;throw e;};
 if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['fields','services','valuables','sourcePrefillVersion'].includes(k)))fail('Document de devis invalide.');
 if(value.sourcePrefillVersion!==undefined&&value.sourcePrefillVersion!==1)fail('Version de préremplissage invalide.');
 const fields={}; const definitions=documentSections.flatMap(s=>s.fields);
 if(!value.fields||typeof value.fields!=='object'||Array.isArray(value.fields)||Object.keys(value.fields).some(k=>!definitions.some(([key])=>key===k)))fail('Champ de document inconnu.');
 for(const [key,label,type,options] of definitions){const text=value.fields[key]??'';if(typeof text!=='string'||text.length>(type==='textarea'?3000:254))fail(label+' invalide.');fields[key]=text.trim();if(!fields[key])continue;
 if(type==='select'&&!options.includes(fields[key]))fail(label+' invalide.');
 if(type==='number'&&(!/^\d+(\.\d{1,3})?$/.test(fields[key])||Number(fields[key])>1000000000))fail(label+' invalide.');
 if(type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(fields[key])||!Number.isFinite(Date.parse(fields[key]))||new Date(fields[key]).toISOString().slice(0,10)!==fields[key]))fail(label+' invalide.');
 if(type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields[key]))fail(label+' invalide.');}
 if(!fields.clientName)fail('Indiquez le nom du client.');
 for(const prefix of ['departure','arrival'])if(fields[prefix+'End']&&(!fields[prefix+'Start']||fields[prefix+'End']<fields[prefix+'Start']))fail('Vérifiez la période de '+(prefix==='departure'?'chargement':'livraison')+'.');
 if(!Array.isArray(value.services)||value.services.length>50)fail('Prestations invalides.');
 const services=value.services.map(row=>{if(!row||Object.keys(row).some(k=>!['label','responsibility'].includes(k))||typeof row.label!=='string'||!row.label.trim()||row.label.length>1000||!['','entreprise','client','non_inclus'].includes(row.responsibility))fail('Répartition des prestations invalide.');return {label:row.label.trim(),responsibility:row.responsibility};});
 if(!Array.isArray(value.valuables)||value.valuables.length>100)fail('Déclaration de valeur invalide.');
 const valuables=value.valuables.map(row=>{if(!row||Object.keys(row).some(k=>!['label','value'].includes(k))||typeof row.label!=='string'||!row.label.trim()||row.label.length>500||typeof row.value!=='string'||!/^\d+(\.\d{1,2})?$/.test(row.value)||Number(row.value)>1000000000)fail('Objet déclaré invalide.');return {label:row.label.trim(),value:row.value};});
 return {fields,services:formulaServices(fields.formula)||[],valuables,...(value.sourcePrefillVersion===1?{sourcePrefillVersion:1}:{})};
}

// Répartition vérifiée sur les devis fournis 2601949/1, 2601984/2, 2601753/2 et 2601440/1, page 1.
export function formulaServices(formula) {
 if(formula === 'MOVE Confort')return [
  ...serviceLabels.map((label,index)=>({label:label==='Décrochage mural'?'Décrochage mural (hors électricité et éléments vissés)':label,responsibility:index<12?'entreprise':'client'})),
  {label:'Ménage du logement après le déménagement — conditions et tarif à valider',responsibility:'non_inclus'},
 ];
 if(formula === 'MOVE Premium')return [
  ...serviceLabels.map(label=>({label:label==='Décrochage mural'?'Décrochage mural (hors électricité et éléments vissés)':label,responsibility:'entreprise'})),
  {label:'Déballage des objets non fragiles',responsibility:'client'},
  {label:'Ménage du logement après le déménagement — conditions et tarif à valider',responsibility:'non_inclus'},
 ];
 const included = {'MOVE Économique':7,'MOVE Économique +':8}[formula];
 if(included === undefined)return null;
 return serviceLabels.map((label,index)=>({label,responsibility:index<included?'entreprise':'client'}));
}

// Fill legacy drafts once. A saved import marker preserves subsequent intentional blanks.
export function prefillQuoteDraft(draft, source) {
 if(!source||draft.document?.sourcePrefillVersion===1)return draft;
 const imported=emptyQuoteDocument(source);
 const current=draft.document;
 const fields={...imported.fields};
 if(current)for(const [key,value] of Object.entries(current.fields))if(value)fields[key]=value;
 const document={...imported,fields,services:formulaServices(fields.formula)||current?.services||[],valuables:current?.valuables||[]};
 return {...draft,document,notes:draft.notes||source.notes||''};
}

import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';
import {readFile} from 'node:fs/promises';
import {formulaServices,emptyQuoteDocument} from '../shared/quoteDocument.mjs';
import {quoteTotals} from '../shared/quoteTotals.mjs';
import {renderReferenceQuote} from './crmQuoteReference.mjs';
export const documentTypes={devis:'Devis',mission:'Ordre de mission','lettre-voiture':'Lettre de voiture','declaration-valeur':'Déclaration de valeur','cgv-rgpd':'CGV et RGPD',proforma:'Pro forma'};
const ink=rgb(.08,.19,.26),muted=rgb(.35,.43,.48),accent=rgb(0,.46,.63),soft=rgb(.94,.97,.98),line=rgb(.83,.88,.91);
const euro=n=>Number.isFinite(n)?new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n):'À compléter';
const date=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')?s.split('-').reverse().join('/'):s||'À préciser';
// Site wordmark: Roboto Slab 900 converted to outlines for crisp, font-independent PDFs.
const logoWordmark=JSON.parse(await readFile(new URL('./pdfAssets/logo-wordmark.json',import.meta.url),'utf8'));
export async function generateCrmPdf(type,draft,lead={}) {
 if(!Object.hasOwn(documentTypes,type)){const e=new Error('Type de document inconnu.');e.status=400;throw e;}
 const pdf=await PDFDocument.create();
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),sloganFont=await pdf.embedFont(StandardFonts.TimesRomanItalic),bodyItalic=await pdf.embedFont(StandardFonts.HelveticaOblique);
 const fields=draft.document?.fields||emptyQuoteDocument(lead).fields;
 if(['devis','declaration-valeur'].includes(type)&&fields.itemLimit&&Number(fields.itemLimit)!==1500){const e=new Error('Le formulaire de déclaration de valeur fourni mentionne un plafond de 1 500 €. Fournissez un modèle correspondant au plafond de ce devis avant de joindre cette annexe.');e.status=409;throw e;}
 const totals=quoteTotals(draft.items||[],draft.taxRate,draft.depositRate);
 const reference=draft.reference||'Sans référence';
 const generated=[];let page,y;
 const clean=value=>Array.from(String(value??'').replace(/[\u202f\u00a0]/g,' ').replace(/\t/g,' ')).map(c=>{if(c==='\n')return c;try{regular.encodeText(c);return c;}catch{return '?';}}).join('');
 const wrap=(value,width,size=10,font=regular)=>{
  const result=[];
  for(const paragraph of clean(value).split('\n')){let row='';for(const word of paragraph.split(/ +/)){if(font.widthOfTextAtSize((row?row+' ':'')+word,size)<=width){row+=(row?' ':'')+word;}else{if(row)result.push(row);row='';for(const char of word){if(font.widthOfTextAtSize(row+char,size)>width){result.push(row);row='';}row+=char;}}}result.push(row);}
  return result;
 };
 const draw=(value,x,top,size=10,font=regular,color=ink)=>page.drawText(clean(value),{x,y:842-top-size,font,size,color});
 const drawBrand=(target,left=40,top=30,scale=.82)=>{
  const originY=target.getHeight()-top;
  const brandBlue=rgb(0,130/255,202/255),brandRed=rgb(238/255,62/255,56/255);
  target.drawSvgPath('M 32,28 C 32,13 56,13 56,28 L 56,76 C 56,92 64,102 77,102 C 90,102 98,92 98,76 L 98,28 C 98,13 122,13 122,28 L 122,76 C 122,92 130,102 143,102 C 156,102 164,92 164,76 L 164,28 C 164,13 188,13 188,28 L 188,76 C 188,114 162,127 143,127 C 126,127 116,113 110,103 C 104,113 94,127 77,127 C 58,127 32,114 32,76 Z',{x:left-32*38/117*scale,y:originY+10*38/117*scale,scale:38/117*scale,color:brandBlue});

  for(const x of [64,130])target.drawSvgPath(`M ${x+13},10 C ${x+20.18},10 ${x+26},15.82 ${x+26},23 L ${x+26},75 C ${x+26},82.18 ${x+20.18},88 ${x+13},88 C ${x+5.82},88 ${x},82.18 ${x},75 L ${x},23 C ${x},15.82 ${x+5.82},10 ${x+13},10 Z`,{x:left-32*38/117*scale,y:originY+10*38/117*scale,scale:38/117*scale,color:brandRed});
  logoWordmark.forEach((path,i)=>target.drawSvgPath(path,{x:left,y:originY,scale,color:i?brandRed:brandBlue}));
  const baseline=originY-45*scale/.82,prefix='Notre Passion : ',size=10*scale/.82;
  target.drawLine({start:{x:left,y:baseline+3},end:{x:left+8,y:baseline+3},thickness:1.2,color:brandRed});
  target.drawText(prefix,{x:left+13,y:baseline,font:sloganFont,size,color:brandBlue});
  target.drawText('L’Excellence',{x:left+13+sloganFont.widthOfTextAtSize(prefix,size),y:baseline,font:sloganFont,size,color:brandRed});
 };
 const newPage=(subtitle='')=>{
  page=pdf.addPage([595,842]);generated.push(page);
  page.drawRectangle({x:0,y:834,width:595,height:8,color:accent});
  drawBrand(page);
  draw(documentTypes[type].toUpperCase(),40,99,21,bold);
  draw(subtitle||'Document préparatoire · Version enregistrée',40,129,9,regular,accent);
  draw(reference+' · révision '+draft.revision,40,148,9,regular,muted);
  page.drawLine({start:{x:40,y:674},end:{x:555,y:674},thickness:1,color:line});y=183;
 };
 const ensure=h=>{if(y+h>756)newPage('Suite · Document préparatoire');};
 const text=(value,{size=10,font=regular,color=ink,width=515,x=40}={})=>{for(const row of wrap(value,width,size,font)){ensure(size+6);draw(row,x,y,size,font,color);y+=size+(type==='lettre-voiture'?3:4);}};
 const section=title=>{ensure(44);y+=type==='lettre-voiture'?3:8;page.drawRectangle({x:40,y:842-y-25,width:515,height:25,color:soft});draw(title,50,y+6,10,bold,accent);y+=type==='lettre-voiture'?29:35;};
 const entry=(label,value)=>text(label+' : '+(value||'À compléter'),{size:9});
 const space=(height=42)=>{ensure(height);y+=height;};
 const append=async name=>{
  const src=await PDFDocument.load(await readFile(new URL('./pdfAssets/'+name,import.meta.url)));
  for(const p of await pdf.copyPages(src,src.getPageIndices())){
   if(name==='valeur-vierge.pdf'){
    // Replace only the legacy brand area; retain the supplied declaration and company details.
    p.drawRectangle({x:26,y:p.getHeight()-65,width:180,height:48,color:rgb(1,1,1)});
    drawBrand(p,28,18);
   }
   pdf.addPage(p);
  }
 };
 const identity=()=>{
  section('CLIENT ET PROPOSITION');
  text(fields.clientName||lead.fullName||'Client à préciser',{font:bold,size:13});
  if(fields.clientAddress)text(fields.clientAddress,{size:10});
  entry('Contact',[fields.clientEmail,fields.clientPhone].filter(Boolean).join(' · '));
  entry('Référence client',fields.clientReference);entry('Formule',fields.formula);entry('Volume / distance / nature',[fields.volume?fields.volume+' m³':'Volume à préciser',fields.distance?fields.distance+' km':'Distance à préciser',fields.nature||'Nature à préciser'].join(' · '));entry('Date du devis',date(fields.issueDate));entry('Validité',date(draft.validUntil));
  if(fields.salesName)entry('Votre interlocuteur',[fields.salesName,fields.salesPhone,fields.salesMobile,fields.salesEmail].filter(Boolean).join(' · '));
 };
 const route=()=>{
  section('LE DÉMÉNAGEMENT');
  entry('Formule',fields.formula);entry('Volume / distance',[fields.volume?fields.volume+' m³':'Volume à préciser',fields.distance?fields.distance+' km':'Distance à préciser'].join(' · '));entry('Nature',fields.nature);
  for(const [prefix,title] of [['departure','CHARGEMENT'],['arrival','LIVRAISON']]){
   section(title);text(fields[prefix+'Address']||'Adresse à compléter',{font:bold});
   entry('Période',date(fields[prefix+'Start'])+(fields[prefix+'End']?' au '+date(fields[prefix+'End']):''));
   entry('Contact',[fields[prefix+'Contact'],fields[prefix+'Phone']].filter(Boolean).join(' · '));
   entry('Étage / digicode',[fields[prefix+'Floor']||'Étage à préciser',fields[prefix+'Code']||'Digicode à préciser'].join(' · '));
   text([['Elevator','Ascenseur'],['Lift','Monte-meubles'],['Window','Passage fenêtre'],['Shuttle','Transbordement'],['Parking','Stationnement'],['Carry','Portage (m)']].map(([key,label])=>label+' : '+(fields[prefix+key]||'à préciser')).join(' · '),{size:9});
   if(fields[prefix+'AccessNotes'])text(fields[prefix+'AccessNotes'],{size:9});
  }
 };
 const quoteRouteTable=()=>{
  const prefixes=['departure','arrival'];
  const rows=[
   ['Adresse',p=>fields[p+'Address']||'Adresse à compléter'],
   ['Période',p=>date(fields[p+'Start'])+(fields[p+'End']?' au '+date(fields[p+'End']):'')],
   ['Contact',p=>[fields[p+'Contact'],fields[p+'Phone']].filter(Boolean).join(' · ')||'À préciser'],
   ...['Floor','Code','Elevator','Lift','Window','Shuttle','Parking','Carry'].map((key,i)=>[['Étage','Digicode','Ascenseur','Monte-meubles','Passage fenêtre','Transbordement','Stationnement','Portage (m)'][i],p=>fields[p+key]||'À préciser'])
  ];
  if(prefixes.some(p=>fields[p+'AccessNotes']))rows.push(['Précisions d’accès',p=>fields[p+'AccessNotes']||'—']);
  const columns=[40,307];
  const rule=top=>columns.forEach(x=>page.drawLine({start:{x,y:842-top},end:{x:x+248,y:842-top},thickness:.45,color:line}));
  const header=()=>{
   columns.forEach((x,c)=>{
    page.drawRectangle({x,y:842-y-28,width:248,height:28,color:soft});
    draw(c?'DÉCHARGEMENT':'CHARGEMENT',x+10,y+8,9,bold,accent);
   });
   y+=28;rule(y);
  };
  ensure(80);y+=8;header();
  for(const [label,value] of rows){
   const cells=prefixes.map(p=>wrap(value(p),138,8.5,label==='Adresse'?bold:regular));let offset=0;
   const length=Math.max(...cells.map(cell=>cell.length));
   while(offset<length){
    if(y+22>756){newPage('BROUILLON · Chargement et déchargement (suite)');header();}
    const count=Math.min(length-offset,Math.max(1,Math.floor((756-y-10)/11))),height=count*11+10;
    cells.forEach((cell,c)=>{
     const x=columns[c];
     draw(label,x+10,y+5,8,regular,muted);
     cell.slice(offset,offset+count).forEach((value,i)=>draw(value,x+100,y+5+i*11,8.5,label==='Adresse'?bold:regular));
    });
    y+=height;rule(y);offset+=count;
   }
  }
  y+=12;
  text('Garantie : '+(fields.guarantee||'à préciser')+' · Valeur globale : '+(fields.coveredValue?euro(Number(fields.coveredValue)):'à préciser')+' · Par objet : '+(fields.itemLimit?euro(Number(fields.itemLimit)):'à préciser'),{size:8});
 };
 const compactMission=(includeIdentity=true)=>{
  if(!includeIdentity){quoteRouteTable();return;}
  if(includeIdentity){
  text(fields.clientName||lead.fullName||'Client à préciser',{font:bold,size:13});
  entry('Contact',[fields.clientEmail,fields.clientPhone].filter(Boolean).join(' · '));
  entry('Devis source',reference+' du '+date(fields.issueDate));
  text((fields.formula||'Formule à préciser')+' · '+(fields.volume?fields.volume+' m³':'Volume à préciser')+' · '+(fields.distance?fields.distance+' km':'Distance à préciser'),{size:10});
  }
  // Long access descriptions use the flowing layout rather than overflowing columns.
  if(['departure','arrival'].some(prefix=>['Address','Code','Contact','Phone'].some(key=>(fields[prefix+key]||'').length>130))){route();guarantees();return;}
  y+=12;const top=y;let bottom=top;
  for(const [prefix,title,x] of [['departure','CHARGEMENT',40],['arrival','LIVRAISON',305]]){
   y=top;draw(title,x,y,10,bold,accent);y+=23;
   const lines=[fields[prefix+'Address']||'Adresse à compléter','Période : '+date(fields[prefix+'Start'])+(fields[prefix+'End']?' au '+date(fields[prefix+'End']):''),'Contact : '+([fields[prefix+'Contact'],fields[prefix+'Phone']].filter(Boolean).join(' · ')||'à préciser'),...['Floor','Code','Elevator','Lift','Window','Shuttle','Parking','Carry'].map((key,i)=>['Étage','Digicode','Ascenseur','Monte-meubles','Passage fenêtre','Transbordement','Stationnement','Portage (m)'][i]+' : '+(fields[prefix+key]||'à préciser'))];
   for(const value of lines)text(value,{size:8,width:240,x});bottom=Math.max(bottom,y);
  }y=bottom+10;
  for(const prefix of ['departure','arrival'])if(fields[prefix+'AccessNotes'])entry(prefix==='departure'?'Accès au chargement':'Accès à la livraison',fields[prefix+'AccessNotes']);
  text('Garantie : '+(fields.guarantee||'à préciser')+' · Valeur globale : '+(fields.coveredValue?euro(Number(fields.coveredValue)):'à préciser')+' · Par objet : '+(fields.itemLimit?euro(Number(fields.itemLimit)):'à préciser'),{size:8});
 };
 const guarantees=()=>{section('GARANTIES');entry('Mode',fields.guarantee);entry('Valeur globale',fields.coveredValue?euro(Number(fields.coveredValue)):'');entry('Plafond par objet',fields.itemLimit?euro(Number(fields.itemLimit)):'');if(fields.insuranceNotes)text(fields.insuranceNotes,{size:9});};
 const responsibilities=()=>{
  const services=formulaServices(fields.formula);
  if(!services){section('VOTRE FORMULE');text('Répartition des prestations à confirmer.',{size:9});return;}
  const columns=[['entreprise','WE MOVE','Nous prenons en charge'],['client','VOUS','À votre charge']].map(([owner,title,subtitle])=>({title,subtitle,rows:services.filter(row=>row.responsibility===owner).map(row=>wrap(row.label,208,9))}));
  for(const row of services.filter(row=>row.responsibility==='non_inclus'))columns[1].rows.push(['OPTION NON INCLUSE',...wrap(row.label,208,9)]);
  const positions=[0,0];let first=true;
  do {
   if(y+100>756)newPage('BROUILLON · Répartition des prestations');
   y+=14;const top=y,capacity=756-top-62;
   const chunks=columns.map((col,c)=>{const selected=[];let used=0;while(positions[c]<col.rows.length){const row=col.rows[positions[c]],height=row.length*13+9;if(used+height>capacity)break;selected.push(row);used+=height;positions[c]++;}return {selected,used};});
   const height=Math.max(...chunks.map(chunk=>chunk.used),34)+58;
   for(let c=0;c<2;c++){
    const x=c?307:40,col=columns[c];
    page.drawRectangle({x,y:842-top-height,width:248,height,color:c?rgb(.975,.978,.98):soft,borderColor:line,borderWidth:.7});
    page.drawRectangle({x,y:842-top-4,width:248,height:4,color:c?muted:accent});
    draw(col.title+(first?'':' · SUITE'),x+16,top+16,11,bold,c?ink:accent);draw(col.subtitle,x+16,top+33,8,regular,muted);
    let rowY=top+54;
    if(!chunks[c].selected.length)draw(positions[c]?'Suite sur la colonne opposée':'Aucune prestation à votre charge',x+16,rowY,8,regular,muted);
    for(const lines of chunks[c].selected){const optional=lines[0]==='OPTION NON INCLUSE';if(!optional)draw('•',x+13,rowY,9,bold,c?muted:accent);for(const [i,value] of lines.entries()){draw(value,x+26,rowY,9,optional&&i===0?bold:regular,optional?muted:ink);rowY+=13;}rowY+=9;}
   }
   y=top+height+8;first=false;
   if(columns.some((col,c)=>positions[c]<col.rows.length))newPage('BROUILLON · Répartition des prestations');
  }while(columns.some((col,c)=>positions[c]<col.rows.length));
 };
 const price=()=>{
  section('VOTRE PROPOSITION FINANCIÈRE');
  const header=()=>{ensure(38);page.drawRectangle({x:40,y:842-y-25,width:515,height:25,color:ink});for(const [label,x] of [['PRESTATION',50],['QTÉ',351],['P.U. HT',399],['TOTAL HT',488]])draw(label,x,y+8,8,bold,rgb(1,1,1));y+=25;};
  const right=(value,end,top,size=9,font=regular)=>draw(value,end-font.widthOfTextAtSize(clean(value),size),top,size,font);
  header();
  for(const item of draft.items||[]){
   const rows=wrap(item.description,280,9);let offset=0,first=true;
   while(offset<rows.length){
    if(y+42>756){newPage('BROUILLON · Détail du prix (suite)');header();}
    const count=Math.min(rows.length-offset,Math.max(1,Math.floor((756-y-22)/13))),height=count*13+22;
    page.drawRectangle({x:40,y:842-y-height,width:515,height,color:soft});
    for(let n=0;n<count;n++)draw(rows[offset+n],50,y+10+n*13,9);
    if(first){right(String(item.quantity),376,y+10,8);right(euro(item.unitPriceHT),468,y+10,8);right(euro(quoteTotals([item],null,null).amountHT),545,y+10,8,bold);first=false;}
    y+=height;page.drawLine({start:{x:40,y:842-y},end:{x:555,y:842-y},thickness:.6,color:line});offset+=count;
   }
  }
  if(!draft.items?.length){text('Prestations et prix à compléter.',{size:9});y+=8;}
  ensure(150);y+=16;const top=y;
  draw('MODALITÉS DE RÈGLEMENT',40,top+3,9,bold,accent);
  const terms=[(fields.paymentKind||'Versement à la commande')+(draft.depositRate!==null?' : '+draft.depositRate+' %':' : à préciser'), 'Échéance : '+(fields.balanceWhen||'à préciser'), 'Solde prévu : '+(totals.amountTTC!==null&&totals.depositAmount!==null?euro(Math.round((totals.amountTTC-totals.depositAmount)*100)/100):'à préciser')];
  let ty=top+24;for(const term of terms)for(const row of wrap(term,240,9)){draw(row,40,ty,9);ty+=13;}
  page.drawRectangle({x:307,y:842-top-124,width:248,height:124,color:soft});
  let ry=top+10;for(const [label,value] of [['Total HT',totals.amountHT],['TVA'+(draft.taxRate!==null?' ('+draft.taxRate+' %)':''),totals.taxAmount]]){draw(label,320,ry,9);right(euro(value),542,ry,9,bold);ry+=22;}
  page.drawRectangle({x:307,y:842-top-89,width:248,height:35,color:accent});draw('TOTAL TTC',320,top+64,11,bold,rgb(1,1,1));const amount=euro(totals.amountTTC);draw(amount,542-bold.widthOfTextAtSize(clean(amount),12),top+63,12,bold,rgb(1,1,1));
  draw(fields.paymentKind||'Versement prévu',320,top+101,9);right(euro(totals.depositAmount),542,top+101,9,bold);
  y=Math.max(top+136,ty+10);
  if(fields.paymentMethods)entry('Instructions de règlement',fields.paymentMethods);
  text('Le versement prévu ne constitue pas un paiement reçu.',{size:8,color:muted});
 };
 if(type==='cgv-rgpd'){await append('cgv.pdf');await append('rgpd-vierge.pdf');}
 else if(type==='declaration-valeur'){await append('valeur-vierge.pdf');}
 else if(type==='devis'){
  renderReferenceQuote({pdf,draft,fields,regular,bold,italic:bodyItalic,drawBrand});
  await append('cgv.pdf');await append('rgpd-vierge.pdf');await append('valeur-vierge.pdf');
 }
 else if(type==='devis'||type==='proforma'){
  newPage(type==='proforma'?'PRO FORMA · Ne constitue pas une facture':'BROUILLON · À vérifier avant émission');identity();
  if(type==='devis')responsibilities();
  newPage(type==='proforma'?'PRO FORMA · Conditions financières':'BROUILLON · Organisation et conditions financières');compactMission(false);price();
  if(fields.insuranceNotes)text(fields.insuranceNotes,{size:9});
  if(draft.notes){section('PRÉCISIONS SUR LA PRESTATION');text(draft.notes,{size:9});}
  if(type==='devis'){
   const extras=[['liftExtra','Monte-meubles / demi-journée HT'],['vehicleExtra','Véhicule léger / demi-journée HT'],['staffExtra','Personnel / demi-journée HT']].filter(([key])=>fields[key]);
   if(extras.length){section('SUPPLÉMENTS ÉVENTUELS');for(const [key,label] of extras)entry(label,euro(Number(fields[key])));}
   if(fields.co2)entry('Émissions CO2',fields.co2+' kg · '+(fields.co2Method||'Méthode à préciser'));
   ensure(100);section('ACCORD DU CLIENT');text('Fait à __________________  le __________________');text('Signature du client :');space(45);
   await append('cgv.pdf');await append('rgpd-vierge.pdf');await append('valeur-vierge.pdf');
  }
 }else if(type==='mission'){
  newPage('PRÉPARATOIRE · Référence dossier '+reference);compactMission();section('ÉQUIPE ET MOYENS');
  entry('Horaire planifié',lead.scheduledTime);entry('Véhicule',lead.assignedTruckName);entry('Chauffeur',lead.assignedDriver);entry('Déménageurs',(lead.teamMembers||[]).join(', '));entry('Matériel',(lead.assignedEquipment||[]).join(', '));entry('Chef d’équipe','');entry('N° de licence','');
  if(draft.notes){section('INSTRUCTIONS PARTICULIÈRES');text(draft.notes,{size:9});}
  section('ENCAISSEMENT');text('Montant à encaisser : à confirmer avec les paiements enregistrés.',{font:bold});
 }else{
  for(const stage of ['CHARGEMENT','LIVRAISON'])for(const copy of ['ENTREPRISE','CLIENT']){
   newPage(stage+' / '+copy+' · PRÉPARATOIRE');compactMission();section('EXÉCUTION');entry('Véhicule / licence',lead.assignedTruckName);text('Horaires réels : __________________________________________');
   if(stage==='CHARGEMENT'){entry('Conditions de paiement',[fields.paymentKind,draft.depositRate!==null?draft.depositRate+' %':'',fields.balanceWhen].filter(Boolean).join(' · '));text('Départ dépôt : ______  Arrivée chargement : ______  Départ chargement : ______',{size:9});section('OBSERVATIONS AU CHARGEMENT');space(55);}
   else{text('Arrivée livraison : ______  Départ livraison : ______  Retour dépôt : ______',{size:9});section('DÉCLARATION DE FIN DE TRAVAIL');text('Reçu mon mobilier :',{size:9});text('[ ] au complet et sans réserves après vérification de fin de travail avec le chef d’équipe',{size:9});text('[ ] avec réserves détaillées ci-dessous',{size:9});section('OBSERVATIONS ET RÉSERVES');draw('Client',40,y,9);draw('Représentant de l’entreprise',310,y,9);y+=14;space(38);text('Formalités de livraison et réserves : se reporter à l’article 16 des CGV jointes.',{size:9});}
   ensure(90);section('SIGNATURES');draw('Représentant de l’entreprise',40,y,9);draw('Client',310,y,9);y+=16;text('À ___________________________  le ____________________',{size:9});space(20);await append('cgv.pdf');
  }
 }
 for(const p of generated){page=p;page.drawLine({start:{x:40,y:66},end:{x:555,y:66},thickness:1,color:line});const footer=[fields.companyName||'WE MOVE',fields.companyAddress,fields.companyPhone,fields.companyEmail].filter(Boolean).join(' · ');for(const [i,row] of wrap(footer,515,7).entries())draw(row,40,785+i*9,7,regular,muted);draw('SIRET '+(fields.companySiret||'à compléter')+' · TVA '+(fields.companyVat||'à compléter'),40,812,7,regular,muted);draw(String(pdf.getPages().indexOf(p)+1)+' / '+pdf.getPageCount(),520,812,7,regular,muted);}
 pdf.setTitle(documentTypes[type]+' - '+reference);pdf.setAuthor('WE MOVE');pdf.setSubject('Document CRM privé - version enregistrée');
 return Buffer.from(await pdf.save());
}

import {rgb} from 'pdf-lib';
import {formulaServices} from '../shared/quoteDocument.mjs';
import {quoteTotals} from '../shared/quoteTotals.mjs';

// Layout based on the five-page WE MOVE reference supplied by the owner.
// Only saved dossier values are used; sample client data and signatures are never copied.
export function renderReferenceQuote({pdf,draft,fields,regular,bold,italic,drawBrand}) {
 const black=rgb(0,0,0),grey=rgb(.86,.86,.86),pages=[];
 const money=n=>Number.isFinite(n)?new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n):'À compléter';
 const date=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')?s.split('-').reverse().join('/'):s||'À préciser';
 const longDate=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return date(s);const value=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T12:00:00Z'));return value.charAt(0).toUpperCase()+value.slice(1);};
 const clean=v=>Array.from(String(v??'').replace(/[\u202f\u00a0]/g,' ')).map(c=>{if(c==='\n')return c;try{regular.encodeText(c);return c;}catch{return '?';}}).join('');
 const wrap=(v,width,size=8,font=regular)=>{
  const lines=[];
  for(const paragraph of clean(v).split('\n')){
   let row='';
   for(const word of paragraph.split(/ +/)){
    if(font.widthOfTextAtSize(row+(row?' ':'')+word,size)<=width){row+=(row?' ':'')+word;continue;}
    if(row)lines.push(row);row='';
    for(const c of word){if(font.widthOfTextAtSize(row+c,size)>width){lines.push(row);row='';}row+=c;}
   }lines.push(row);
  }return lines;
 };
 let page,y;
 const put=(v,x,t,size=8,font=regular,color=black)=>page.drawText(clean(v),{x,y:842-t-size,font,size,color});
 const box=(x,t,w,h,fill)=>page.drawRectangle({x,y:842-t-h,width:w,height:h,borderWidth:.55,borderColor:black,...(fill?{color:fill}:{})});
 const sides=(x,t,w,h,fill=rgb(1,1,1))=>{
  page.drawRectangle({x,y:842-t-h,width:w,height:h,color:fill});
  for(const edge of [x,x+w])page.drawLine({start:{x:edge,y:842-t},end:{x:edge,y:842-t-h},thickness:.55,color:black});
 };
 const center=(v,x,t,w,size=9,font=bold)=>put(v,x+(w-font.widthOfTextAtSize(clean(v),size))/2,t,size,font);
 const next=(withHeader=true)=>{
  page=pdf.addPage([595,842]);pages.push(page);y=28;
  if(withHeader){
   drawBrand(page,30,26);
   let headerY=27;
   const details=[fields.companyName||'WE MOVE',fields.companyAddress,fields.companyPhone?'Tél. : '+fields.companyPhone:'',fields.companyEmail].filter(Boolean);
   details.forEach((value,i)=>wrap(value,260,8,i===0?bold:regular).forEach(row=>{put(row,305,headerY,8,i===0?bold:regular);headerY+=10;}));
   y=Math.max(85,headerY+12);
  }
 };
 const ensure=h=>{if(y+h>775){next();put('DEVIS · '+draft.reference+' · Suite',28,y,9,bold);y+=24;}};
 const flow=(v,size=8,font=regular,width=539,x=28)=>{for(const row of wrap(v,width,size,font)){ensure(size+4);put(row,x,y,size,font);y+=size+3;}};
 const totals=quoteTotals(draft.items||[],draft.taxRate,draft.depositRate);
 const payment=fields.paymentKind||'Versement';
 const deposit=(draft.depositRate==null?'Taux à préciser':draft.depositRate+' %')+' de '+payment.toLowerCase()+' à la commande';
 const ref=draft.reference||'À préciser';
 const meta=[['Client n°',fields.clientReference||'À préciser'],['Devis n°',ref],['Date',date(fields.issueDate)],['Validité',date(draft.validUntil)]];
 const letterhead=()=>{
 drawBrand(page,30,36,.53);
 let cy=81;
 for(const v of [fields.companyAddress,'Tél. : '+(fields.companyPhone||'À préciser'),'Email : '+(fields.companyEmail||'À préciser')])for(const row of wrap(v,242,8)){put(row,30,cy);cy+=10;}
 let my=28;
 for(const [label,value] of meta){put(label,449,my,8);for(const row of wrap(value,70,8,bold)){put(row,497,my,8,bold);my+=10;}}
 let clientY=Math.max(91,my+12);
 for(const [v,font] of [[fields.clientName||draft.clientName||'Client à préciser',bold],[fields.clientAddress||'Adresse de facturation à préciser',regular]])for(const row of wrap(v,280,10,font)){put(row,285,clientY,10,font);clientY+=12;}
 cy=Math.max(cy+20,138);
 for(const value of ['Commercial : '+(fields.salesName||'À préciser'),'Port. : '+(fields.salesMobile||'À préciser'),'Fixe : '+(fields.salesPhone||fields.companyPhone||'À préciser')])for(const row of wrap(value,242,9,bold)){put(row,30,cy,9,bold);cy+=11;}
 return Math.max(213,cy+35,clientY+35);
 };
 next(false);y=letterhead();flow('Madame, Monsieur,');y+=9;
 flow('Suite à votre demande, veuillez trouver ci-après un devis concernant votre déménagement, ainsi que le détail de la prestation '+(fields.formula||'à préciser')+'.');y+=10;
 const services=formulaServices(fields.formula)||[];
 const serviceHeader=()=>{
  ensure(45);box(454,y,56,27,grey);box(510,y,57,27,grey);
  center('À notre',454,y+2,56);center('charge',454,y+13,56);center('À votre',510,y+2,57);center('charge',510,y+13,57);y+=27;
  box(28,y,426,14,grey);box(454,y,56,14,grey);box(510,y,57,14,grey);put('Détail des prestations',30,y+2,8.5,bold);y+=14;
 };
 serviceHeader();
 for(const service of services){
  const lines=wrap(service.label,420,8.5);const h=Math.max(14,lines.length*10+4);
  if(y+h+16>775){next();serviceHeader();}
  if(service.responsibility==='non_inclus'){box(28,y,539,14,grey);put('Prestation en option supplémentaire',30,y+2,8.5,bold);y+=14;}
  box(28,y,426,h);box(454,y,56,h);box(510,y,57,h);
  lines.forEach((v,i)=>put(v,30,y+2+i*10,8.5));
  if(service.responsibility==='non_inclus')center('En option',454,y+3,113,8,bold);
  else center('X',service.responsibility==='entreprise'?454:510,y+2,56,9,bold);
  y+=h;
 }
 if(!services.length){flow('Répartition des prestations à confirmer.');}
 y+=9;flow('Nos déménagements sont faits par nos équipes et nos salariés.',7.5,italic);
 flow('Nous pouvons également vous proposer une prestation ménage (conditions et tarif à valider).',7.5,italic);
 y+=8;flow('Particularités : '+(draft.notes||'—'));y+=8;
 const confirmations=['Votre devis signé et daté.','Les conditions générales de vente jointes, datées et signées.',payment+' prévu : '+money(totals.depositAmount)+' à l’ordre de '+(fields.companyName||'WE MOVE')+'.','Votre déclaration de valeur complétée.'];
 const confirmationRows=confirmations.flatMap(v=>wrap('•  '+v,510,8));
 ensure(26+confirmationRows.length*13);box(28,y,539,26+confirmationRows.length*13);put('Afin de confirmer votre déménagement, vous devez nous faire parvenir :',31,y+3,8,bold);y+=23;
 for(const row of confirmationRows){put(row,41,y,8);y+=13;}y+=14;
 flow('Nous espérons que cela correspond à votre attente et restons à votre disposition pour toute information complémentaire.');y+=8;
 flow('Nous vous prions d’agréer, Madame, Monsieur, l’expression de nos salutations distinguées.');y+=10;
 if(fields.salesName)flow(fields.salesName,9,bold);
 flow('Le service commercial',9,bold);flow(fields.companyName||'WE MOVE',9,bold);
 flow('Téléphone : '+(fields.salesPhone||fields.companyPhone||'À préciser'));
 if(fields.salesMobile)flow('Portable : '+fields.salesMobile);
 flow('Email : '+(fields.salesEmail||fields.companyEmail||'À préciser'));

 next(false);y=letterhead();
 const recap=[meta,[['Volume',fields.volume?fields.volume+' m³':'À préciser'],['Distance',fields.distance?fields.distance+' km':'À préciser'],['Nature',fields.nature||'À préciser'],['Prestation',fields.formula||'À préciser']]];
 for(const row of recap){
  const contents=row.map(([,v])=>wrap(v,68,8.5,bold)),height=Math.max(24,...contents.map(v=>v.length*10+8));
  row.forEach(([label],i)=>{const x=28+i*134.75;box(x,y,61,height,grey);box(x+61,y,73.75,height);center(label,x,y+7,61,8.5,regular);contents[i].forEach((v,j)=>center(v,x+61,y+4+j*10,73.75,8.5,bold));});y+=height;
 }
 y+=5;
 const routeHeader=()=>{box(87,y,232,20,grey);box(319,y,248,20,grey);center('Chargement',87,y+4,232,10);center('Livraison',319,y+4,248,10);y+=20;};
 routeHeader();
 const routeRows=[
  ['Période',p=>longDate(fields[p+'Start'])+(fields[p+'End']?' au '+longDate(fields[p+'End']):'')],
  ['Adresse',p=>fields[p+'Address']||'Adresse à compléter'],
  ['Téléphone',p=>[fields[p+'Contact'],fields[p+'Phone']].filter(Boolean).join(' · ')||'À préciser'],
  ['Accès',p=>[['Étage','Floor','Digicode','Code'],['Ascenseur','Elevator','Monte-meubles','Lift'],['Passage fenêtre','Window','Transbordement','Shuttle'],['Portage (m)','Carry','Stationnement','Parking']].map(([a,ak,b,bk])=>[a+' : '+(fields[p+ak]||'à préciser'),b+' : '+(fields[p+bk]||'à préciser')])]
 ];
 if(fields.departureAccessNotes||fields.arrivalAccessNotes)routeRows.push(['Précisions',p=>fields[p+'AccessNotes']||'—']);
 for(const [label,value] of routeRows){
  if(label==='Accès'){
   for(let i=0;i<4;i++){
    const values=['departure','arrival'].map(p=>value(p)[i].map(v=>wrap(v,112,7.5)));
    const h=Math.max(15,...values.flat().map(v=>v.length*10+5));
    if(y+h>775){next();routeHeader();}
    sides(28,y,59,h,grey);if(i===0)put('Accès',84-bold.widthOfTextAtSize('Accès',8),y+3,8,bold);
    values.forEach((pairs,c)=>{const x=c?319:87,w=c?248:232;sides(x,y,w,h);pairs.forEach((lines,k)=>lines.forEach((v,j)=>put(v,x+3+k*116,y+3+j*10,7.5)));});y+=h;
   }
   continue;
  }
  const cellFont=['Période','Téléphone'].includes(label)?bold:regular;
  const cells=['departure','arrival'].map(p=>wrap(value(p),226,8,cellFont));let offset=0;
  while(offset<Math.max(...cells.map(c=>c.length))){
   if(y+25>775){next();routeHeader();}
   const count=Math.min(Math.max(...cells.map(c=>c.length))-offset,Math.max(1,Math.floor((775-y-5)/11))),height=Math.max(label==='Adresse'?40:16,count*11+5);
   sides(28,y,59,height,grey);put(label,84-bold.widthOfTextAtSize(label,8),y+(label==='Adresse'?(height-8)/2:3),8,bold);
   cells.forEach((cell,c)=>{const x=c?319:87,w=c?248:232;sides(x,y,w,height);cell.slice(offset,offset+count).forEach((v,j)=>label==='Période'?center(v,x,y+3+j*11,w,8,bold):put(v,x+3,y+3+j*11,8,cellFont));});y+=height;offset+=count;
  }
 }
 page.drawLine({start:{x:28,y:842-y},end:{x:567,y:842-y},thickness:.55,color:black});y+=10;
 const priceHeader=()=>{box(28,y,539,19,grey);center('DÉTAIL DU PRIX',28,y+3,539,10);y+=19;};
 ensure(60);priceHeader();const priceStart=y,pricePage=page;
 for(const item of draft.items||[]){
  const description=item.description+(item.quantity!==1?' ('+item.quantity+' × '+money(item.unitPriceHT)+' HT)':'');
  const rows=wrap(description,444,8);
  for(const [i,v] of rows.entries()){
   if(y+13>775){next();priceHeader();}
   sides(28,y,539,12);
   put(v,31,y+1,8);
   if(i===0){const amount=money(quoteTotals([item],null,null).amountHT);put(amount,562-regular.widthOfTextAtSize(clean(amount),8),y+1,8);}y+=12;
  }
 }
 if(!draft.items?.length){box(28,y,539,16);put('Prestations et prix à compléter',31,y+3);y+=16;}
 const guarantee=(fields.guarantee||'Garantie à préciser')+' pour une valeur de '+(fields.coveredValue?money(Number(fields.coveredValue)):'À préciser');
 const guaranteeLines=wrap(guarantee,531,8,bold),gap=Math.max(16,page===pricePage?priceStart+90-y:16);
 ensure(gap+guaranteeLines.length*11+7);
 sides(28,y,539,gap+guaranteeLines.length*11+7);guaranteeLines.forEach((v,i)=>put(v,31,y+gap+i*11,8,bold));y+=gap+guaranteeLines.length*11+7;
 ensure(80);
 page.drawLine({start:{x:28,y:842-y},end:{x:567,y:842-y},thickness:.55,color:black});
 for(const [label,amount,strong] of [['TOTAL HT',totals.amountHT,false],['Montant TVA'+(draft.taxRate==null?'':' ('+draft.taxRate+' %)'),totals.taxAmount,false],['Total TTC',totals.amountTTC,true],[deposit+' · Solde '+(fields.balanceWhen||'à préciser'),totals.depositAmount,true]]){
  const labels=wrap(label,395,8.5,strong?bold:regular),h=Math.max(18,labels.length*10+6);ensure(h);sides(28,y,403,h,grey);sides(431,y,136,h);
  labels.forEach((v,i)=>put(v,426-(strong?bold:regular).widthOfTextAtSize(clean(v),8.5),y+3+i*10,8.5,strong?bold:regular));const amountText=money(amount);put(amountText,562-(strong?bold:regular).widthOfTextAtSize(clean(amountText),8.5),y+3,8.5,strong?bold:regular);y+=h;
 }
 page.drawLine({start:{x:28,y:842-y},end:{x:567,y:842-y},thickness:.55,color:black});
 y+=4;
 const warning='En cas de difficultés non signalées (art. 1 des conditions générales), un supplément sera appliqué.';
 ensure(15);const warningWidth=bold.widthOfTextAtSize(clean(warning),8);
 page.drawRectangle({x:28+(539-warningWidth)/2,y:842-y-10,width:warningWidth,height:11,color:rgb(1,1,.65)});
 center(warning,28,y,539,8,bold);y+=11;
 const extras=[['liftExtra','Monte-meubles / demi-journée'],['vehicleExtra','Véhicule léger / demi-journée'],['staffExtra','Personnel supplémentaire / demi-journée']].filter(([key])=>fields[key]);
 if(extras.length)flow(extras.map(([key,label])=>label+' : '+money(Number(fields[key]))+' HT').join(' · '),7,italic);
 if(fields.co2)flow('Émission CO2 : '+fields.co2+' kg'+(fields.co2Method?' · '+fields.co2Method:''));
 if(fields.insuranceNotes)flow(fields.insuranceNotes);
 if(fields.paymentMethods)flow(fields.paymentMethods);
 y+=10;flow('En accord avec les termes de ce devis et les conditions générales jointes, merci de nous retourner ces documents signés et accompagnés du versement prévu ('+money(totals.depositAmount)+') afin de confirmer votre déménagement. Le solde sera réglé selon l’échéance indiquée ci-dessus.',8,italic);
 ensure(63);y+=8;put('Fait à '+(fields.signatureCity||'________________')+', le ________________',315,y,9,bold);y+=12;put('Signature du client :',315,y,9,bold);
 for(const p of pages){page=p;
  page.drawLine({start:{x:28,y:52},end:{x:567,y:52},thickness:.8,color:black});
  const legal=[(fields.companyName||'WE MOVE')+(fields.companyCapital?' au capital de '+money(Number(fields.companyCapital)): '')+' · TVA intracommunautaire : '+(fields.companyVat||'À compléter'),'SIRET : '+(fields.companySiret||'À compléter')+' · APE : '+(fields.companyApe||'À compléter')+' · RCS : '+(fields.companyRcs||'À compléter')];
  legal.forEach((v,i)=>wrap(v,539,8,bold).forEach((row,j)=>center(row,28,791+i*10+j*9,539,8,bold)));
  put((draft.issuedAt?'DEVIS · ':'BROUILLON · ')+ref+' · Révision '+draft.revision,28,820,6,regular,rgb(.4,.4,.4));
 }
}

export function visitChecks(lead,visit) {
  const issues=[];
  if(!visit.items.length)issues.push({label:'Inventaire à compléter',fieldId:'visit-add-item'});
  for(const [index,item] of visit.items.entries()){
    const field=!item.label.trim()?'label':!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>500?'quantity':!Number.isFinite(item.unitVolume)||item.unitVolume<=0||item.unitVolume>100?'volume':'';
    if(field)issues.push({label:`Bien ${index+1} : ${field==='label'?'désignation à préciser':field==='quantity'?'quantité à vérifier':'volume unitaire à préciser'}`,fieldId:`visit-item-${index}-${field}`});
  }
  for(const side of ['departure','arrival']){
    const suffix=side==='departure'?'départ':'arrivée';
    for(const [key,label] of [['floor','Étage'],['elevator','Ascenseur'],['carry','Portage']])if(!visit[side][key]?.trim())issues.push({label:`${label} ${suffix} à vérifier`,fieldId:`visit-${side}-${key}`});
  }
  return issues;
}

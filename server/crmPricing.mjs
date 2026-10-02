import {movingFormulas} from '../shared/movingFormulas.mjs';
export const extraDefinitions=[['lift','Monte-meubles','intervention'],['stairs','Manutention sans ascenseur','étage'],['storage','Garde-meubles','m³ × mois'],['heavy','Objet lourd','objet']];
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export const emptyPricing=()=>({revision:0,enabled:false,formulas:movingFormulas.map(f=>({id:f.id,enabled:false,base:null,perM3:null,perKm:null,minimum:null})),extras:Object.fromEntries(extraDefinitions.map(([id])=>[id,null])),updatedAt:null,updatedBy:null});
export function revisePricing(current,payload,actor){
 if(actor?.role!=='gerant')fail('La tarification est réservée au gérant.',403);
 if(!payload||payload.revision!==current.revision)fail('La grille a changé. Rechargez-la avant de modifier les tarifs.',409);
 if(typeof payload.enabled!=='boolean'||!Array.isArray(payload.formulas)||payload.formulas.length!==movingFormulas.length)fail('Configuration tarifaire invalide.');
 const number=(v,label)=>{if(v===null)return null;if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1000000||Math.abs(v*100-Math.round(v*100))>0.00001)fail(label+' : montant positif avec deux décimales maximum.');return v;};
 const formulas=movingFormulas.map(f=>{const rows=payload.formulas.filter(r=>r?.id===f.id);if(rows.length!==1||typeof rows[0].enabled!=='boolean')fail('Formule invalide.');const r=rows[0],result={id:f.id,enabled:r.enabled};for(const k of ['base','perM3','perKm','minimum'])result[k]=number(r[k],f.name);if(r.enabled&&Object.values(result).includes(null))fail('Complétez tous les tarifs de la formule '+f.name+'.');return result;});
 const extras=Object.fromEntries(extraDefinitions.map(([id,label])=>[id,number(payload.extras?.[id],label)]));
 if(payload.enabled&&!formulas.some(f=>f.enabled))fail('Activez au moins une formule complète.');
 return {revision:current.revision+1,enabled:payload.enabled,formulas,extras,updatedAt:new Date().toISOString(),updatedBy:actor.email||actor.id||'local'};
}
export function estimatePricing(settings,payload){
 if(!settings.enabled)fail('Le gérant doit configurer et activer la tarification dans Paramètres.');
 const formula=movingFormulas.find(f=>f.documentName===payload?.formula),rule=settings.formulas.find(f=>f.id===formula?.id&&f.enabled);
 if(!rule)fail('Cette formule n’a pas de grille active. Contactez le gérant.');
 const quantity=(v,label,max=10000)=>{if(v===''||v===null||v===undefined||!['number','string'].includes(typeof v)||!/^\d+(\.\d{1,3})?$/.test(String(v))||!Number.isFinite(Number(v))||Number(v)<0||Number(v)>max)fail(label+' : renseignez une valeur valide.');return Number(v);};
 const volume=quantity(payload.volume,'Volume'),distance=quantity(payload.distance,'Distance');if(volume<=0)fail('Renseignez un volume supérieur à zéro.');
 const items=[];const add=(description,quantity,unitPriceHT)=>{if(quantity>0&&unitPriceHT>0)items.push({description,quantity,unitPriceHT});};
 add('Forfait '+formula.name,1,rule.base);add('Volume — '+formula.name+' (m³)',volume,rule.perM3);add('Transport — distance aller (km)',distance,rule.perKm);
 const baseCents=items.reduce((sum,i)=>sum+Math.round(i.quantity*i.unitPriceHT*100),0),minimumCents=Math.round(rule.minimum*100);
 if(baseCents<minimumCents)add('Complément au minimum de prestation',1,(minimumCents-baseCents)/100);
 for(const [id,label,unit] of extraDefinitions){const q=quantity(payload.extras?.[id]??0,label,10000);if(q>0&&settings.extras[id]===null)fail('Le tarif « '+label+' » n’est pas configuré.');add(label+' ('+unit+')',q,settings.extras[id]);}
 if(!items.length)fail('La grille ne produit aucun montant. Faites vérifier les tarifs par le gérant.');
 return {revision:settings.revision,items,amountHT:items.reduce((sum,i)=>sum+Math.round(i.quantity*i.unitPriceHT*100),0)/100,warnings:['Estimation selon la grille du gérant. Vérifiez les accès, les moyens, les dates et les suppléments avant validation.','Les options ne sont pas déduites automatiquement des adresses. Les quantités saisies doivent être confirmées.']};
}

export const absenceLabels={conges:'Congés',maintenance:'Maintenance',autre:'Indisponibilité'};
export function overlapsPeriod(a,start,end){return Boolean(start&&end&&end>start&&a.start<end&&a.end>start);}
export function resourceAbsence(resource,start,end){return (resource.unavailablePeriods||[]).find(p=>overlapsPeriod(p,start,end));}
export function validPlanningTime(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'Z'))&&new Date(value+'Z').toISOString().slice(0,16)===value;}
export function normalizeAbsences(input){
 const fail=()=>{throw Object.assign(new Error('Vérifiez les périodes d’indisponibilité : dates, motif et absence de chevauchement.'),{status:400});};
 if(!Array.isArray(input)||input.length>100)fail();
 const result=input.map(p=>{
  if(!p||typeof p!=='object'||Array.isArray(p)||Object.keys(p).some(k=>!['start','end','reason'].includes(k))||!validPlanningTime(p.start)||!validPlanningTime(p.end)||p.end<=p.start||!Object.hasOwn(absenceLabels,p.reason))fail();
  return {start:p.start,end:p.end,reason:p.reason};
 }).sort((a,b)=>a.start.localeCompare(b.start));
 if(result.some((p,i)=>i>0&&result[i-1].end>p.start))fail();
 return result;
}

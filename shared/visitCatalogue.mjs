import {visitRooms} from './technicalVisit.mjs';

const categories={Séjour:['Salon','Séjour'],Chambre:['Chambre','Enfants'],Cuisine:['Cuisine'],Bureau:['Bureau'],'Entrée':['Cartons','Objets Spéciaux'],'Cave / garage':['Extérieur & Garage','Cartons']};
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function visitCatalogueResults(catalogue,query,room){
 const words=fold(query).trim().split(/\s+/).filter(Boolean);
 return catalogue.filter(item=>words.length?words.every(word=>fold(item.name+' '+item.subtitle+' '+item.category).includes(word)):!categories[room]||categories[room].includes(item.category));
}
export function addVisitCatalogueItem(visit,item,room){
 if(!visitRooms.includes(room)||typeof item?.name!=='string'||!item.name.trim()||item.name.length>160||!Number.isFinite(item.m3)||item.m3<=0||item.m3>100)throw new Error('Ce bien ne peut pas être ajouté. Utilisez une ligne personnalisée.');
 const index=visit.items.findIndex(row=>row.room===room&&row.label===item.name&&row.unitVolume===item.m3);
 if(index>=0&&visit.items[index].quantity>=500)throw new Error('La quantité maximale est atteinte pour cette ligne.');
 if(index<0&&visit.items.length>=150)throw new Error('L’inventaire accepte au maximum 150 lignes.');
 const items=visit.items.map((row,i)=>i===index?{...row,quantity:row.quantity+1}:row);
 if(index<0)items.push({room,label:item.name,quantity:1,unitVolume:item.m3});
 return {value:{...visit,items},index:index>=0?index:items.length-1};
}

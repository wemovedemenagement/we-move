import assert from 'node:assert/strict';
import {visitReport} from '../shared/visitReport.mjs';

assert.equal(visitReport({}),null);
const access={floor:'0',elevator:'Non',carry:'0',notes:''};
const lead={id:'isolated',fullName:'Recette visite',volume:30,unknownVolume:false,
  departureAddress:'Paris',arrivalAddress:'Versailles',visitDate:'2026-11-02T09:30',
  visitType:'domicile',visitStatus:'programmee',visitNotes:'Protéger le palier.',
  technicalVisit:{departure:access,arrival:{...access,notes:'Passage étroit.'},items:[
    {room:'Chambre',label:'Lit',quantity:1,unitVolume:2},
    {room:'Séjour',label:'Fauteuil',quantity:3,unitVolume:0.8},
    {room:'Séjour',label:'Table',quantity:1,unitVolume:1.1},
  ]}};
const before=structuredClone(lead),report=visitReport(lead);
assert.equal(report.retainedVolume,'30 m³');assert.equal(report.estimate,'5,5 m³');
assert.deepEqual(report.groups.map(g=>g.room),['Séjour','Chambre']);
assert.equal(report.groups[0].volume,'3,5');assert.equal(report.groups[0].items.length,2);
assert.equal(report.date,'02/11/2026 à 09:30');assert.equal(report.status,'Programmée');
assert.equal(report.access[0].floor,'0');assert.equal(report.access[0].carry,'0 m');
assert.deepEqual(report.issues,[]);assert.match(report.text,/3 × Fauteuil — 2,4 m³/);
assert.match(report.text,/Passage étroit/);assert.match(report.text,/Protéger le palier/);
assert.match(report.text,/conditions contractuelles restent celles du devis accepté/);
assert.deepEqual(lead,before,'Une synthèse ne modifie aucune donnée enregistrée');

const incomplete=visitReport({...lead,unknownVolume:true,visitDate:'',visitStatus:'',visitType:'',
  technicalVisit:{items:[],departure:{floor:'',elevator:'',carry:'',notes:''},arrival:access}});
assert.equal(incomplete.retainedVolume,'À confirmer','Un ancien volume ne doit pas remplacer le statut inconnu');
assert.equal(incomplete.estimate,'Non renseigné','Un inventaire vide ne doit pas annoncer zéro m³');
assert.equal(incomplete.date,'Date à confirmer');assert.equal(incomplete.status,'Statut non renseigné');
assert.deepEqual(incomplete.issues,['Inventaire à compléter','Étage départ à vérifier','Ascenseur départ à vérifier','Portage départ à vérifier','Volume retenu au dossier à confirmer']);
assert.equal(visitReport({...lead,volume:0}).retainedVolume,'À confirmer');
assert.equal(visitReport({...lead,visitStatus:'effectuee',visitType:'visio'}).status,'Effectuée');
console.log('Synthèse de visite : données enregistrées, volumes distincts, regroupement, accès zéro, inconnus explicites et absence de mutation vérifiés.');

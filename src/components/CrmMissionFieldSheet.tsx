import {MapPin, Phone, Navigation, Truck, Users, CalendarDays, ArrowRight} from 'lucide-react';
import type {CrmDossier, MoveBooking, ResourceRegistry} from '../services/crmService';
import {missionFieldSheet} from '../../shared/missionFieldSheet.mjs';
import CrmVisitReport from './CrmVisitReport';
import './crmMissionFieldSheet.css';

export default function CrmMissionFieldSheet({dossier,booking,registry,dirty,stale,onOrganise}:{dossier:CrmDossier;booking:MoveBooking|null;registry:ResourceRegistry;dirty:boolean;stale:boolean;onOrganise:(section:string)=>void}) {
  const sheet=missionFieldSheet(dossier,booking,registry);
  return <section className="mission-field-sheet" aria-label="Fiche terrain">
    <div className="field-sheet-heading"><div><span className="crm-eyebrow">L’ESSENTIEL POUR L’ÉQUIPE</span><h3>Votre fiche terrain</h3><p>Informations enregistrées · horaires de Paris</p></div><span className="field-sheet-state" data-active={sheet.active}>{sheet.state}</span></div>
    {dirty&&<p className="field-sheet-notice" role="status">Des modifications ne sont pas enregistrées. Cette vue présente la dernière mission sauvegardée.</p>}
    {stale&&<p className="field-sheet-notice" role="status">Planning non actualisé. Vérifiez les moyens et le créneau avant de partir.</p>}
    <div className="field-sheet-essential"><div><CalendarDays size={18}/><span>Début<strong>{sheet.start}</strong></span></div><div><CalendarDays size={18}/><span>Fin de réservation<strong>{sheet.end}</strong></span></div><div><Truck size={18}/><span>Volume du dossier<strong>{sheet.volume}</strong></span></div></div>
    <div className="field-sheet-client"><div><strong>{dossier.lead.fullName}</strong><span>Client du dossier</span></div>{sheet.phoneLink?<a href={sheet.phoneLink}><Phone size={16}/>Appeler le client</a>:<span>{sheet.phone||'Téléphone à compléter'}</span>}</div>
    <div className="field-sheet-addresses">{sheet.access.map(part=><article key={part.side}>
      <h4><MapPin size={17}/>{part.title}</h4><p className="field-sheet-address">{part.address||'Adresse à confirmer'}</p>
      {part.directions&&<a className="field-sheet-route" href={part.directions} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"><Navigation size={16}/>Itinéraire · {part.title.toLocaleLowerCase('fr-FR')}</a>}
      <dl>{part.rows.map(row=><div key={row.label}><dt>{row.label}<small>{row.source}</small></dt><dd>{row.value}</dd></div>)}</dl>
      {part.notes&&<p className="field-sheet-notes">{part.notes}<small>{part.notesSource}</small></p>}
      <details className="field-sheet-contact"><summary>Contact sur place et digicode</summary><small>{part.referenceLabel}</small><p>{part.contact||'Contact sur place non renseigné'}</p>{part.phoneLink?<a href={part.phoneLink}><Phone size={15}/>{part.phone}</a>:<p>{part.phone||'Téléphone sur place non renseigné'}</p>}<p>Digicode : {part.code||'Non renseigné'}</p></details>
    </article>)}</div>
    <p className="field-sheet-map-note">Google Maps s’ouvre à votre demande. Vérifiez les restrictions de hauteur et de tonnage pour le véhicule.</p>
    <section className="field-sheet-resources"><h4><Users size={17}/>Équipe et moyens enregistrés</h4>{!booking||booking.cancelled?<p>Aucune affectation active pour cette mission.</p>:sheet.resources.length?<ul>{sheet.resources.map(resource=><li key={resource.id}><div><strong>{resource.name}</strong><small>{{person:'Équipe',vehicle:'Véhicule',lift:'Monte-meubles'}[resource.kind]||'Moyen'}</small></div>{resource.warning&&<span>{resource.warning}</span>}</li>)}</ul>:<p>Aucun moyen affecté.</p>}</section>
    <section className="field-sheet-instructions"><h4>Matériel et consignes</h4><dl>{sheet.parking.map(row=><div key={row.label}><dt>Stationnement · {row.label.toLocaleLowerCase('fr-FR')}</dt><dd>{row.value}</dd></div>)}<div><dt>Vérification des accès</dt><dd>{sheet.operations.accessVerified?'Enregistrée':'À effectuer'}</dd></div><div><dt>Matériel</dt><dd>{sheet.operations.equipmentReady?'Préparation confirmée':'À préparer'}</dd></div></dl>{sheet.operations.equipmentNotes&&<p className="field-sheet-notes"><b>À emporter</b>{sheet.operations.equipmentNotes}</p>}{sheet.operations.instructions&&<p className="field-sheet-notes"><b>Consignes de la mission</b>{sheet.operations.instructions}</p>}{!sheet.operations.instructions&&<p>Aucune consigne de mission enregistrée.</p>}</section>
    <div className="field-sheet-agreement"><div><strong>{sheet.formula}</strong><small>{sheet.referenceLabel}</small></div>{(!dossier.acceptance||sheet.agreementIssues.length>0)&&<p>{dossier.acceptance?`${sheet.agreementIssues.length} écart(s) avec le devis accepté à vérifier.`:'Accord sur une version du devis à vérifier.'}</p>}<button type="button" onClick={()=>onOrganise('mission-agreement')}>Vérifier le devis et l’accord<ArrowRight size={15}/></button></div>
    {!!sheet.services.length&&<details className="field-sheet-services"><summary>Prestations et répartition · {sheet.referenceLabel}</summary>{(['entreprise','client'] as const).map(kind=><section key={kind}><h4>{kind==='entreprise'?'À la charge de WE MOVE':'À la charge du client'}</h4><ul>{sheet.services.filter(row=>row.responsibility===kind).map((row,index)=><li key={index}>{row.label}</li>)}</ul></section>)}</details>}
    {dossier.lead.notes&&<details className="field-sheet-services"><summary>Précisions transmises par le client</summary><p className="field-sheet-notes">{dossier.lead.notes}</p></details>}
    <CrmVisitReport lead={dossier.lead}/>
    <button className="field-sheet-edit" type="button" onClick={()=>onOrganise('mission-slot')}>Revenir à l’organisation de la mission<ArrowRight size={16}/></button>
  </section>;
}

import {normalizeTechnicalVisit} from '../shared/technicalVisit.mjs';
import {leadFormulaIds} from '../shared/movingFormulas.mjs';
import { randomUUID } from 'node:crypto';
function invalid(message) { const error = new Error(message); error.status = 400; throw error; }
const channels = ['site', 'page_devis', 'modal_devis', 'modal_devis_rapide', 'formulaire_site', 'formulaire_client', 'estimation_volume', 'telephone', 'ads', 'recommandation', 'partenaire', 'email', 'crm_creation_manuelle', 'autre'];
const statuses = ['nouveau', 'prise_contact', 'visite_technique', 'devis_brouillon', 'devis_envoye', 'confirme', 'refuse', 'termine'];
function clean(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) invalid('Demande invalide.');
  const text = (key, max = 500) => {
    if (payload[key] != null && typeof payload[key] !== 'string') invalid(`Champ invalide : ${key}.`);
    const value = (payload[key] || '').trim();
    if (value.length > max) invalid(`Champ trop long : ${key}.`);
    return value;
  };
  const fullName = text('fullName', 160), email = text('email', 254), phone = text('phone', 30);
  if (!fullName || (!email && !phone)) invalid('Indiquez le nom et au moins un téléphone ou un e-mail.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid('Adresse e-mail invalide.');
  if (phone && !/^\+?[\d\s().-]{8,30}$/.test(phone)) invalid('Numéro de téléphone invalide.');
  const volume = payload.unknownVolume ? 0 : Number(payload.volume ?? 0);
  if (!Number.isFinite(volume) || volume < 0 || volume > 1000) invalid('Volume invalide.');
  const source = text('source', 80) || 'site';
  if (!channels.includes(source)) invalid('Canal d’origine invalide.');
  const formula = payload.formula || 'conseil';
  if (!leadFormulaIds.includes(formula)) invalid('Formule invalide.');
  const projectType = payload.projectType || 'particulier';
  if (!['particulier', 'entreprise'].includes(projectType)) invalid('Type de projet invalide.');
  const moveDate = text('moveDate', 10);
  if (moveDate && (!/^\d{4}-\d{2}-\d{2}$/.test(moveDate) || !Number.isFinite(Date.parse(moveDate)) || new Date(moveDate).toISOString().slice(0,10) !== moveDate)) invalid('Date invalide.');
  return { fullName, email, phone, source, sourceDetail: text('sourceDetail', 200), formula, projectType,
    departureAddress: text('departureAddress'), arrivalAddress: text('arrivalAddress'),
    departureFloor: String(payload.departureFloor || 'À préciser').slice(0, 80), arrivalFloor: String(payload.arrivalFloor || 'À préciser').slice(0, 80),
    departureElevator: payload.departureElevator === true, arrivalElevator: payload.arrivalElevator === true,
    volume, unknownVolume: volume === 0, moveDate, flexibleDate: payload.flexibleDate !== false,
    liftRequired: payload.liftRequired === true, storageRequired: payload.storageRequired === true, notes: text('notes', 5000) };
}
export function makeQuote(payload) {
  const values = clean(payload);
  const now = new Date().toISOString();
  const quote = { ...values, id: `WM-${new Date().getFullYear()}-${randomUUID()}`, createdAt: now, updatedAt: now,
    status: 'nouveau', estimatedPrice: 0,
    assignedAgent: 'Non assigné', internalNotes: [{ id: randomUUID(), author: 'Système', content: `Demande reçue via ${values.source}.`, createdAt: now }] };
  return {...quote,assigneeId:'',assigneeName:'',nextAction:null,followUpRevision:0};
}
export function mergeQuote(current, updates) {
  if (!updates || typeof updates !== "object" || Array.isArray(updates)) invalid("Modification invalide.");
    if (['assigneeId','assigneeName','nextAction','followUpRevision','assignedAgent','lastCommercialContact','storageRevision','documentChecklist','acceptedQuoteRevision'].some(key=>Object.hasOwn(updates,key))) invalid('Utilisez le suivi dédié pour modifier le responsable ou la relance.');
    if (Object.hasOwn(updates, 'status') && !statuses.includes(updates.status)) invalid('Statut invalide.');
    const allowed = ['status','visitDate','visitType','visitStatus','visitNotes','devisStatus','devisNumber','assignedTruckId','assignedTruckName','assignedDriver','scheduledTime','assignedEquipment','teamMembers','refusalReason'];
    for (const key of allowed.filter(key => Object.hasOwn(updates, key))) {
      const value = updates[key];
      if (['teamMembers', 'assignedEquipment'].includes(key)) {
        if (!Array.isArray(value) || value.length > 50 || value.some(item => typeof item !== 'string' || item.length > 200)) invalid('Liste invalide : ' + key);
      } else if (typeof value !== 'string' || value.length > 5000) invalid('Champ invalide : ' + key);
    }
    if(Object.hasOwn(updates,'visitDate')&&updates.visitDate&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(updates.visitDate)||!Number.isFinite(Date.parse(updates.visitDate+'Z'))||new Date(updates.visitDate+'Z').toISOString().slice(0,16)!==updates.visitDate))invalid('Date et heure de visite invalides.');
    if (updates.visitType && !['domicile','visio','telephonique'].includes(updates.visitType)) invalid('Format de visite invalide.');
    if (updates.visitStatus && !['programmee','effectuee'].includes(updates.visitStatus)) invalid('État de visite invalide.');
    const business = Object.fromEntries(allowed.filter(key => Object.hasOwn(updates, key)).map(key => [key, updates[key]]));
    const quote = { ...current, ...clean({ ...current, ...updates }), ...business, updatedAt: new Date().toISOString() };
    if(Object.hasOwn(updates,'expectedUpdatedAt')&&updates.expectedUpdatedAt!==current.updatedAt){const error=new Error('Ce dossier a changé. Fermez puis rouvrez la fiche avant de réessayer.');error.status=409;throw error;}
    if(Object.hasOwn(updates,'technicalVisit'))quote.technicalVisit=normalizeTechnicalVisit(updates.technicalVisit);
    const changed=['technicalVisit','status','visitDate','visitType','visitStatus','visitNotes','scheduledTime','assignedTruckName','assignedDriver','teamMembers','fullName','phone','email','departureAddress','arrivalAddress','volume','moveDate','formula','notes'].filter(k=>Object.hasOwn(updates,k)&&JSON.stringify(current[k])!==JSON.stringify(quote[k]));
    if(changed.length)quote.internalNotes=[{id:randomUUID(),author:String(updates.author||'Utilisateur').slice(0,160),content:'Dossier mis à jour : '+changed.map(k=>({technicalVisit:'fiche de visite',status:'statut',visitDate:'rendez-vous',visitType:'format de visite',visitStatus:'état de visite',visitNotes:'notes de visite',scheduledTime:'créneau',assignedTruckName:'véhicule',assignedDriver:'responsable',teamMembers:'équipe',fullName:'nom',phone:'téléphone',email:'e-mail',departureAddress:'départ',arrivalAddress:'arrivée',volume:'volume',moveDate:'date souhaitée',formula:'formule',notes:'informations du projet'}[k]||k)).join(', ')+'.',createdAt:quote.updatedAt},...(current.internalNotes||[])];
    if (updates.newNote) {
      if (typeof updates.newNote !== 'string' || updates.newNote.length > 5000) invalid('Note invalide.');
      quote.internalNotes = [{ id: randomUUID(), author: String(updates.author || 'Utilisateur').slice(0, 160), content: updates.newNote.trim(), createdAt: quote.updatedAt }, ...(quote.internalNotes || [])];
    }
  return quote;
}
export function quoteStats(quotes) {
  const totalLeads = quotes.length;
  const newLeadsCount = quotes.filter(q => q.status === 'nouveau').length;
  const contactedCount = quotes.filter(q => q.status === 'prise_contact').length;
  const quotesSentCount = quotes.filter(q => q.status === 'devis_envoye').length;
  const confirmedCount = quotes.filter(q => q.status === 'confirme').length;

  const totalVolumeM3 = quotes.reduce((acc, q) => acc + (Number(q.volume) || 0), 0);
  const totalEstimatedRevenue = quotes.reduce((acc, q) => acc + (Number(q.estimatedPrice) || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((confirmedCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    newLeadsCount,
    contactedCount,
    quotesSentCount,
    confirmedCount,
    totalVolumeM3,
    totalEstimatedRevenue,
    conversionRate
  };
}

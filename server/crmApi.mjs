import {listVisitPhotos,addVisitPhoto,readVisitPhoto,deleteVisitPhoto} from './crmVisitPhotos.mjs';
import {crmUiVersion} from './crmVersion.mjs';
import {getPricingSettings,savePricingSettings} from './crmStore.mjs';
import {estimatePricing} from './crmPricing.mjs';
import {getTestBillingDocuments,getTestBillingDocument,createTestBillingDocument,saveTestBillingPayment} from './crmStore.mjs';
import {billingSettings,saveBillingSettings,prepareBillingDocument,saveBillingPayment,prepareBillingMail,sendBillingMail,resolveBillingMail} from './crmBilling.mjs';
import {listBillingDocuments,getBillingDocument,getBillingRelated} from './crmStore.mjs';
import {publicBillingDocument} from './crmBillingModel.mjs';
import {getBillingOverviewRecords} from './crmStore.mjs';
import {billingOverview,billingRow} from './crmBillingOverview.mjs';
import {billingExport,billingExportPeriod} from './crmBillingExport.mjs';
import {billingSearch} from './crmBillingSearch.mjs';
import {publicTestDocument} from './crmTestBillingModel.mjs';
import {generateTestBillingPdf} from './crmTestBillingPdf.mjs';
import {getPlanning,saveResource,saveBooking} from './crmStore.mjs';
import {getStorageStays,saveStorageStay,getStorageHistory} from './crmStore.mjs';
import {withMoveFollowUps} from '../shared/moveFollowUp.mjs';
import {getDossierRecords} from './crmStore.mjs';
import {saveDocumentChecklist,getDocumentCheckHistory} from './crmStore.mjs';
import {recordQuoteAcceptance,getQuoteAcceptance,getQuoteAcceptanceHistory} from './crmStore.mjs';
import {generateCrmPdf,documentTypes} from './crmPdf.mjs';
import {prepareQuoteMail,sendQuoteMail} from './crmMail.mjs';
import {getQuoteMails} from './crmStore.mjs';
import {notifyWebsiteLead,notifyCustomerLead} from './crmLeadNotification.mjs';
import {authenticateCrm,crmMembers,firebaseWebConfig} from './crmAuth.mjs';
import express from 'express';
import {getInvoiceTestState,changeInvoiceTestState} from './crmStore.mjs';
import {getInvoicePreparations,createInvoicePreparation,saveInvoicePreparation,refreshInvoicePreparation} from './crmStore.mjs';
import { getAllQuotes, createQuoteLead, updateQuoteLead, deleteQuoteLead, getCrmStats, getQuoteDrafts, createQuoteDraft, saveQuoteDraft, saveFollowUp } from './crmStore.mjs';

const route = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
export function crmRouter() {
  const router = express.Router();
  router.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/api/crm/auth-config', (_req,res)=>res.json({success:true,config:firebaseWebConfig,totpAvailable:process.env.CRM_TOTP_AVAILABLE==='true'}));
  router.use('/api', (req,res,next)=>{
    if(req.method==='POST'&&req.path==='/quotes')return next();
    return authenticateCrm(req,res,next);
  });
  router.get('/api/crm/dossiers/:id/photos',route(async(req,res)=>res.json({success:true,photos:await listVisitPhotos(req.params.id)})));
  router.put('/api/crm/dossiers/:id/photos/:slot',express.raw({type:'image/*',limit:'8mb'}),route(async(req,res)=>{
    await addVisitPhoto(req.params.id,Number(req.params.slot),req.body,{caption:req.query.caption,area:req.query.area});res.status(201).json({success:true});
  }));
  router.get('/api/crm/dossiers/:id/photos/:slot',route(async(req,res)=>res.set({'Content-Type':'image/jpeg','Cache-Control':'private, no-store','Content-Disposition':'inline; filename="visite.jpg"'}).send(await readVisitPhoto(req.params.id,Number(req.params.slot)))));
  router.delete('/api/crm/dossiers/:id/photos/:slot',route(async(req,res)=>{await deleteVisitPhoto(req.params.id,Number(req.params.slot),req.query.generation);res.json({success:true});}));
  router.get('/api/crm/dossiers/:id',route(async(req,res)=>{
    const dossier=await getDossierRecords(req.params.id);
    if(!dossier.lead)return res.status(404).json({success:false,error:'Dossier introuvable.'});
    dossier.acceptance=dossier.quote?.clientAcceptance?await getQuoteAcceptance(req.params.id,dossier.quote.clientAcceptance.quoteRevision):null;
    dossier.acceptanceHistory=await getQuoteAcceptanceHistory(req.params.id);
    dossier.lead=withMoveFollowUps([dossier.lead],(await getPlanning()).bookings)[0];
    if(req.crmIdentity.role==='commercial')dossier.invoice=null;
    dossier.billing=req.crmIdentity.role==='commercial'?[]:(await getBillingOverviewRecords(req.params.id)).filter(d=>d.mode==='live').map(d=>billingRow(d)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
    res.json({success:true,dossier});
  }));
  router.get('/api/crm/planning',route(async(req,res)=>res.json({success:true,planning:await getPlanning()})));
  router.put('/api/crm/dossiers/:id/document-checks',route(async(req,res)=>res.json({success:true,...await saveDocumentChecklist(req.params.id,req.body,req.crmIdentity)})));
  router.get('/api/crm/dossiers/:id/document-checks',route(async(req,res)=>res.json({success:true,...await getDocumentCheckHistory(req.params.id,req.query.before)})));
  router.get('/api/crm/storage',route(async(_req,res)=>res.json({success:true,stays:await getStorageStays()})));
  router.post('/api/crm/storage',route(async(req,res)=>res.json({success:true,...await saveStorageStay(req.body,req.crmIdentity)})));
  router.get('/api/crm/storage/:id/history',route(async(req,res)=>res.json({success:true,...await getStorageHistory(req.params.id,req.query.before)})));
  router.post('/api/crm/resources',route(async(req,res)=>res.json({success:true,registry:await saveResource(req.body,req.crmIdentity)})));
  router.put('/api/crm/planning/:id',route(async(req,res)=>res.json({success:true,...await saveBooking(req.params.id,req.body,req.crmIdentity)})));
  router.get('/api/crm/pricing',route(async(req,res)=>{if(req.crmIdentity.role!=='gerant')return res.status(403).json({success:false,error:'Configuration réservée au gérant.'});res.json({success:true,settings:await getPricingSettings()});}));
  router.put('/api/crm/pricing',route(async(req,res)=>{if(req.crmIdentity.role!=='gerant')return res.status(403).json({success:false,error:'Configuration réservée au gérant.'});res.json({success:true,settings:await savePricingSettings(req.body,req.crmIdentity)});}));
  router.post('/api/crm/pricing/estimate',route(async(req,res)=>res.json({success:true,estimate:estimatePricing(await getPricingSettings(),req.body)})));
  router.get('/api/crm/version',route(async(_req,res)=>res.json({success:true,version:crmUiVersion()})));
  router.get('/api/crm/session', (req,res)=>res.json({success:true,identity:req.crmIdentity}));
  router.use('/api/crm/billing',(req,res,next)=>['gerant','secretaire'].includes(req.crmIdentity.role)?next():res.status(403).json({success:false,error:'Accès facturation non autorisé.'}));
  router.get('/api/crm/billing/overview',route(async(req,res)=>res.json({success:true,overview:billingOverview(await getBillingOverviewRecords())})));
  router.get('/api/crm/billing/search',route(async(req,res)=>{
    if(req.query.invoiceId !== undefined && (typeof req.query.invoiceId !== 'string' || !/^[A-Za-z0-9_-]{1,180}$/.test(req.query.invoiceId)))return res.status(400).json({success:false,error:'Dossier invalide.'});
    res.json({success:true,...billingSearch(await getBillingOverviewRecords(req.query.invoiceId),req.query)});
  }));
  router.get('/api/crm/billing/export',route(async(req,res)=>{
    const period=billingExportPeriod(req.query);
    const result=billingExport(await getBillingOverviewRecords(),period);
    res.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="'+result.filename+'"','Cache-Control':'private, no-store','X-Export-Count':String(result.count),'X-Content-Type-Options':'nosniff'}).send(result.csv);
  }));
  router.get('/api/crm/billing/dossier/:id',route(async(req,res)=>res.json({success:true,documents:(await getBillingOverviewRecords(req.params.id)).filter(d=>d.mode==='live').map(d=>billingRow(d))})));
  router.get('/api/crm/billing/settings',route(async(req,res)=>res.json({success:true,...await billingSettings()})));
  router.put('/api/crm/billing/settings',route(async(req,res)=>res.json({success:true,...await saveBillingSettings(req.body,req.crmIdentity)})));
  router.get('/api/crm/billing/documents',route(async(req,res)=>{const result=typeof req.query.invoiceId==='string'?{documents:(await getBillingRelated(req.query.invoiceId)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)),cursor:null}:await listBillingDocuments(req.query.cursor||'');res.json({success:true,...result,documents:result.documents.map(publicBillingDocument)});}));
  router.post('/api/crm/billing/preview',route(async(req,res)=>{const {pdf}=await prepareBillingDocument(req.body,req.crmIdentity,{preview:true});res.set({'Content-Type':'application/pdf','Cache-Control':'private, no-store'}).send(pdf);}));
  router.post('/api/crm/billing/documents',route(async(req,res)=>res.status(201).json({success:true,...await prepareBillingDocument(req.body,req.crmIdentity)})));
  router.get('/api/crm/billing/documents/:id',route(async(req,res)=>{const d=await getBillingDocument(req.params.id);if(!d)return res.status(404).json({success:false,error:'Document introuvable.'});res.json({success:true,document:publicBillingDocument(d)});}));
  router.get('/api/crm/billing/documents/:id/pdf',route(async(req,res)=>{const d=await getBillingDocument(req.params.id);if(!d)return res.status(404).json({success:false,error:'Document introuvable.'});res.set({'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="WE-MOVE-'+d.number+'.pdf"','Cache-Control':'private, no-store'}).send(Buffer.from(d.pdfBase64,'base64'));}));
  router.patch('/api/crm/billing/documents/:id/payments',route(async(req,res)=>res.json({success:true,document:await saveBillingPayment(req.params.id,req.body,req.crmIdentity)})));
  router.get('/api/crm/billing/documents/:id/mail',route(async(req,res)=>res.json({success:true,preparation:await prepareBillingMail(req.params.id,req.query.purpose||'document')})));
  router.post('/api/crm/billing/documents/:id/mail',route(async(req,res)=>res.json({success:true,document:await sendBillingMail(req.params.id,req.body,req.crmIdentity)})));
  router.patch('/api/crm/billing/documents/:id/mail/:mailId',route(async(req,res)=>res.json({success:true,document:await resolveBillingMail(req.params.id,req.params.mailId,req.body,req.crmIdentity)})));
  router.use('/api/crm/invoice-tests',(req,res,next)=>req.crmIdentity.role==='gerant'?next():res.status(403).json({success:false,error:'Action réservée au gérant.'}));
  router.get('/api/crm/invoice-tests/documents',route(async(req,res)=>res.json({success:true,documents:(await getTestBillingDocuments()).map(publicTestDocument)})));
  router.post('/api/crm/invoice-tests/documents',route(async(req,res)=>{const result=await createTestBillingDocument(req.body,req.crmIdentity);res.status(201).json({success:true,state:result.state,document:publicTestDocument(result.document)});}));
  router.patch('/api/crm/invoice-tests/documents/:id/payments',route(async(req,res)=>res.json({success:true,document:publicTestDocument(await saveTestBillingPayment(req.params.id,req.body,req.crmIdentity))})));
  router.get('/api/crm/invoice-tests/documents/:id/pdf',route(async(req,res)=>{const doc=await getTestBillingDocument(req.params.id);if(!doc)return res.status(404).json({success:false,error:'Simulation introuvable.'});res.set({'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="WE-MOVE-'+doc.number+'.pdf"','Cache-Control':'private, no-store'}).send(await generateTestBillingPdf(doc));}));
  router.get('/api/crm/invoice-tests',route(async(req,res)=>res.json({success:true,state:await getInvoiceTestState()})));
  router.post('/api/crm/invoice-tests',route(async(req,res)=>res.json({success:true,state:await changeInvoiceTestState(req.body,req.crmIdentity)})));
  router.use('/api/crm/invoice-preparations',(req,res,next)=>req.crmIdentity.role==='gerant'||req.crmIdentity.role==='secretaire'?next():res.status(403).json({success:false,error:'Facturation réservée au gérant et au secrétariat.'}));
  router.get('/api/crm/invoice-preparations',route(async(req,res)=>res.json({success:true,invoices:await getInvoicePreparations()})));
  router.post('/api/crm/invoice-preparations',route(async(req,res)=>res.status(201).json({success:true,invoice:await createInvoicePreparation(req.body?.quoteId,req.crmIdentity,req.body?.expectedQuoteRevision)})));
  router.patch('/api/crm/invoice-preparations/:id',route(async(req,res)=>res.json({success:true,invoice:await saveInvoicePreparation(req.params.id,req.body,req.crmIdentity)})));
  router.post('/api/crm/invoice-preparations/:id/refresh-source',route(async(req,res)=>res.json({success:true,invoice:await refreshInvoicePreparation(req.params.id,req.body,req.crmIdentity)})));
  router.get('/api/crm/members', (_req,res)=>res.json({success:true,members:crmMembers()}));
  router.patch('/api/quotes/:id/follow-up', route(async(req,res)=>{
    const quote=await saveFollowUp(req.params.id,req.body,req.crmIdentity);
    if(!quote)return res.status(404).json({success:false,error:'Demande introuvable.'});
    res.json({success:true,quote});
  }));
  router.get('/api/quotes', route(async (req, res) => {
    const search = String(req.query.search || '').trim().toLocaleLowerCase('fr');
    const status = req.query.status;
    const [leads,planning]=await Promise.all([getAllQuotes(),getPlanning()]);
    const quotes = withMoveFollowUps(leads,planning.bookings).filter(quote => (!status || status === 'all' || quote.status === status) && (!search || [quote.fullName, quote.email, quote.phone, quote.id, quote.departureAddress, quote.arrivalAddress].some(value => String(value || '').toLocaleLowerCase('fr').includes(search))));
    res.json({ success: true, count: quotes.length, quotes });
  }));
  router.post('/api/quotes', route(async (req, res) => {
    const quote=await createQuoteLead(req.body);
    // Await on Cloud Run: work after the response may be suspended. Mail failure must
    // never turn a saved request into a failed form submission and cause duplicates.
    const notices=await Promise.allSettled([notifyWebsiteLead(quote),notifyCustomerLead(quote)]);
    notices.forEach((result,index)=>{if(result.status==='rejected')console.error(JSON.stringify({event:index?'customer_receipt_unavailable':'lead_notification_unavailable',leadId:quote.id}));});
    res.status(201).json({success:true,quote});
  }));
  router.patch('/api/quotes/:id', route(async (req, res) => {
    if(['scheduledTime','scheduledEnd','assignedTruckId','assignedTruckName','assignedDriver','assignedEquipment','teamMembers'].some(k=>Object.hasOwn(req.body||{},k)))return res.status(400).json({success:false,error:'Utilisez la planification pour réserver les ressources et contrôler les conflits.'});
    const quote = await updateQuoteLead(req.params.id, {...req.body,author:req.crmIdentity.name});
    if (!quote) return res.status(404).json({ success: false, error: 'Demande introuvable.' });
    res.json({ success: true, quote });
  }));
  router.delete('/api/quotes/:id', route(async (req, res) => {
    if(req.crmIdentity.role!=='gerant')return res.status(403).json({success:false,error:'Action réservée au gérant.'});
    if((await listVisitPhotos(req.params.id)).length)return res.status(409).json({success:false,error:'Retirez les photos du dossier avant de supprimer la demande.'});
    if (!(await deleteQuoteLead(req.params.id))) return res.status(404).json({ success: false, error: 'Demande introuvable.' });
    res.json({ success: true });
  }));
  router.get('/api/crm/stats', route(async (_req, res) => res.json({ success: true, stats: await getCrmStats() })));
  router.get('/api/crm/quote-drafts', route(async (_req, res) => res.json({success:true, drafts:await getQuoteDrafts()})));
  router.post('/api/crm/quote-drafts', route(async (req, res) => res.status(201).json({success:true, draft:await createQuoteDraft(req.body?.leadId)})));
  router.patch('/api/crm/quote-drafts/:id', route(async (req, res) => res.json({success:true, draft:await saveQuoteDraft(req.params.id,req.body)})));
  router.post('/api/crm/quote-drafts/:id/acceptance',route(async(req,res)=>res.json({success:true,...await recordQuoteAcceptance(req.params.id,req.body,req.crmIdentity)})));
  router.get('/api/crm/quote-drafts/:id/acceptance/:revision/pdf/:type',route(async(req,res)=>{
    if(!['devis','mission','lettre-voiture'].includes(req.params.type))return res.status(400).json({success:false,error:'Type de document inconnu.'});
    const acceptance=await getQuoteAcceptance(req.params.id,req.params.revision);
    if(!acceptance)return res.status(404).json({success:false,error:'Version acceptée introuvable.'});
    const {lead}=await getDossierRecords(req.params.id);
    const bytes=await generateCrmPdf(req.params.type,acceptance.quote,lead||{});
    res.set({'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="WE-MOVE-${req.params.type}-version-${acceptance.quoteRevision}.pdf"`,'X-Quote-Revision':String(acceptance.quoteRevision),'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}).send(bytes);
  }));
  router.get('/api/crm/quote-drafts/:id/email',route(async(req,res)=>res.json({success:true,preparation:await prepareQuoteMail(req.params.id)})));
  router.post('/api/crm/quote-drafts/:id/email',route(async(req,res)=>res.json({success:true,delivery:await sendQuoteMail(req.params.id,req.body,req.crmIdentity)})));
  router.get('/api/crm/quote-drafts/:id/email/:key/pdf',route(async(req,res)=>{
    const record=(await getQuoteMails(req.params.id)).find(r=>r.id===req.params.key);
    if(!record)return res.status(404).json({success:false,error:'Archive introuvable.'});
    res.set({'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+record.reference.replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf"','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}).send(Buffer.from(record.pdfBase64,'base64'));
  }));
  router.get('/api/crm/quote-drafts/:id/pdf/:type', route(async(req,res)=>{
    if(!Object.hasOwn(documentTypes,req.params.type))return res.status(400).json({success:false,error:'Type de document inconnu.'});
    const draft=(await getQuoteDrafts()).find(row=>row.id===req.params.id);
    if(!draft)return res.status(404).json({success:false,error:'Enregistrez un brouillon de devis pour ce dossier avant de générer son PDF.'});
    const lead=(await getAllQuotes()).find(row=>row.id===draft.leadId)||{};
    const bytes=await generateCrmPdf(req.params.type,draft,lead);
    const filename='WE-MOVE-'+req.params.type+'-'+draft.reference.replace(/[^a-zA-Z0-9_-]/g,'_')+'.pdf';
    res.set({'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="'+filename+'"','X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}).send(bytes);
  }));
  router.use('/api', (error, _req, res, _next) => {
    if(error.type==='entity.too.large')return res.status(413).json({success:false,error:'Choisissez une image de 8 Mo maximum.'});
    const validation = [400,403,404,409].includes(error.status);
    res.status(validation ? error.status : 503).json({ success: false, error: validation ? error.message : 'Le service CRM est indisponible. Veuillez réessayer.' });
  });
  return router;
}

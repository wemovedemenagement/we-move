import {FileCheck2, FileText, AlertCircle} from 'lucide-react';
import type {CrmDossier, InvoicePreparation} from '../services/crmService';
import {quoteTotals} from '../../shared/quoteTotals.mjs';
import './crmInvoiceSource.css';

export function invoiceSource(dossier:CrmDossier|null) {
  if(!dossier?.quote)return null;
  const working=dossier.quote,accepted=dossier.acceptance;
  if(working.clientAcceptance&&(!accepted||accepted.quoteRevision!==working.clientAcceptance.quoteRevision||accepted.quote.revision!==accepted.quoteRevision||accepted.quote.id!==working.id||accepted.quote.leadId!==dossier.lead.id))return null;
  const quote=working.clientAcceptance?accepted!.quote:working;
  const totals=quoteTotals(quote.items,quote.taxRate,quote.depositRate);
  return {quote,amount:totals.amountTTC,accepted:!!working.clientAcceptance,workingRevision:working.revision,
    ready:['confirme','termine'].includes(dossier.lead.status)&&!!quote.document?.fields.clientName?.trim()&&!!quote.document?.fields.clientAddress?.trim()&&totals.amountTTC!==null&&totals.amountTTC>0};
}
const money=(value:number)=>value.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
export default function CrmInvoiceSource({dossier,preparation,acceptedRevision,workingRevision}:{dossier?:CrmDossier|null;preparation?:InvoicePreparation;acceptedRevision?:number;workingRevision?:number}) {
  const source=invoiceSource(dossier||null);
  const referenceRevision=acceptedRevision||workingRevision||source?.quote.revision;
  const changed=!!preparation&&!!referenceRevision&&preparation.quoteRevision!==referenceRevision;
  const warning=preparation?changed:!source?.accepted;
  const quote=preparation||source?.quote;
  if(!quote)return <p role="alert">La version de référence est indisponible. Actualisez avant de préparer le brouillon.</p>;
  const amount=preparation?.amountTTC??source?.amount;
  return <aside className="crm-invoice-source" data-tone={warning?'attention':'reference'} aria-label={preparation?'Origine du brouillon':'Devis de référence pour la facture'}>
    <div className="invoice-source-icon">{warning?<AlertCircle size={20}/>:preparation?<FileText size={20}/>:<FileCheck2 size={20}/>}</div>
    <div className="invoice-source-content"><span className="invoice-source-eyebrow">{preparation?'Brouillon conservé':source?.accepted?'Accord client enregistré':'Accord sur une version à enregistrer'}</span>
      <strong>{preparation?preparation.quoteReference:source?.quote.reference} · version {preparation?preparation.quoteRevision:source?.quote.revision}</strong>
      <p>{preparation?changed?`${acceptedRevision?'Un accord plus récent est enregistré':'Le devis de travail est maintenant'} en version ${referenceRevision}. Ce brouillon conserve sa version ${preparation.quoteRevision} : mettez sa source à jour avant de facturer.`:'Cette copie est figée. Une modification du devis ne la met pas à jour.':source?.accepted?source.workingRevision!==source.quote.revision?`La version de travail ${source.workingRevision} est différente. Le brouillon reprendra uniquement la version acceptée ${source.quote.revision}.`:'Le brouillon reprendra le montant et les prestations de cette version acceptée.':'Ce dossier est marqué accepté, mais aucun accord versionné n’est enregistré. Le brouillon reprendra le devis de travail.'}</p>
      {!preparation&&source&&!source.ready&&<p role="alert">Complétez le chiffrage, le nom et l’adresse de facturation, et vérifiez que le dossier est accepté.</p>}
    </div>
    <div className="invoice-source-amount"><span>Total TTC</span><strong>{amount===null||amount===undefined?'À compléter':money(amount)}</strong></div>
  </aside>;
}

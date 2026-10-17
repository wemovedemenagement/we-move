import {documentChecklistDetails} from './documentChecklist.mjs';

export function documentReminderText(lead,acceptedQuote) {
  const issues=documentChecklistDetails(lead).filter(row=>row.state!=='received');
  if(lead?.status!=='confirme'||!acceptedQuote||!issues.length)return '';
  const line=value=>String(value||'').replace(/[\r\n]+/g,' ').trim();
  const documents=issues.map(issue=>'- '+(issue.key==='signedQuote'?(issue.state==='stale'?'la version actualisée de votre devis signé':'votre devis signé'):(issue.state==='stale'?'la déclaration de valeur complétée correspondant à cette version':'votre déclaration de valeur complétée'))).join('\n');
  return `Objet : Votre déménagement WE MOVE — documents à compléter\n\nBonjour ${line(lead.fullName)},\n\nPour compléter votre dossier relatif au devis ${line(acceptedQuote.reference)} (version ${acceptedQuote.revision}), pourriez-vous nous transmettre :\n${documents}\n\nSi vous nous avez déjà adressé ces pièces, merci de nous indiquer la date et le moyen d’envoi pour que nous puissions les retrouver.\n\nNous restons disponibles pour vous accompagner.\n\nBien cordialement,\nL’équipe WE MOVE`;
}
export function documentFollowUpNote(lead) {
  return 'Vérifier les pièces client : '+documentChecklistDetails(lead).filter(row=>row.state!=='received').map(row=>row.label+(row.state==='stale'?' (version à revérifier)':'')).join(' ; ')+'.';
}

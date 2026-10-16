export const documentKinds={signedQuote:'Devis signé',valueDeclaration:'Déclaration de valeur remplie'};
export function documentChecklistDetails(lead) {
  return Object.entries(documentKinds).map(([key,label])=>{
    const receipt=lead?.documentChecklist?.[key];
    const state=!receipt?.received?'missing':lead.acceptedQuoteRevision&&receipt.quoteRevision!==lead.acceptedQuoteRevision?'stale':'received';
    return {key,label,state};
  });
}
export function documentChecklistIssues(lead) {
  return documentChecklistDetails(lead).filter(row=>row.state!=='received').map(row=>row.label+(row.state==='missing'?' à réunir':' à revérifier pour la version acceptée'));
}

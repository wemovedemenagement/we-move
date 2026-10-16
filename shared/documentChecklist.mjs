export const documentKinds={signedQuote:'Devis signé',valueDeclaration:'Déclaration de valeur remplie'};
export function documentChecklistIssues(lead) {
  return Object.entries(documentKinds).flatMap(([key,label])=>{
    const receipt=lead?.documentChecklist?.[key];
    if(!receipt?.received)return [label+' à réunir'];
    if(lead.acceptedQuoteRevision&&receipt.quoteRevision!==lead.acceptedQuoteRevision)return [label+' à revérifier pour la version acceptée'];
    return [];
  });
}

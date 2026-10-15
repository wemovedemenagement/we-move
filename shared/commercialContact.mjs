export const contactOutcomes={no_answer:'Client injoignable',exchanged:'Échange effectué',changes:'Modifications demandées',callback:'Rappel convenu'};
export const contactChannels={phone:'Téléphone',email:'E-mail',other:'Autre canal'};
export function quoteReminderText(draft) {
  return `Bonjour ${draft.clientName},\n\nJe reviens vers vous au sujet de notre devis ${draft.reference} pour votre déménagement. Avez-vous pu le consulter ? Nous sommes disponibles pour répondre à vos questions ou revoir votre projet avec vous.\n\nBien cordialement,\nL’équipe WE MOVE`;
}

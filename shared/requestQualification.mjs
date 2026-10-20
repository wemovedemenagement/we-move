import {parisToday} from './followUp.mjs';
import {requestedDate} from './planningQueue.mjs';
import {missionPhoneLink} from './missionFieldSheet.mjs';

const text = value => String(value ?? '').trim();
const known = value => {
  const valueText = text(value);
  return valueText && !['à préciser', 'à confirmer', 'à définir', 'inconnu'].includes(valueText.toLocaleLowerCase('fr'));
};

// Reading aids for the request, not prerequisites for quoting or evidence of availability.
export function requestQualification(lead, today = parisToday()) {
  const rows = [];
  const add = (id, label, recorded, detail, target = 'details') => rows.push({id, label, recorded:!!recorded, detail, target});
  const email = /^[^\s<>\r\n,;]+@[^\s<>\r\n,;]+\.[^\s<>\r\n,;]+$/.test(text(lead.email));
  const contact = missionPhoneLink(lead.phone) || email;
  add('contact', 'Joindre le client', known(lead.fullName) && contact,
    !known(lead.fullName) ? 'Nom du client à compléter.' : !contact ? 'Un téléphone ou un e-mail utilisable est à renseigner.' : 'Un moyen de contact est renseigné.');
  const addresses = ['departure', 'arrival'].filter(side => !known(lead[side + 'Address']));
  add('addresses', 'Les deux adresses', !addresses.length,
    addresses.length === 2 ? 'Départ et arrivée à préciser.' : addresses.length ? `Adresse ${addresses[0] === 'departure' ? 'de départ' : 'd’arrivée'} à préciser.` : 'Départ et arrivée renseignés. Les accès restent à vérifier.');
  const volume = !lead.unknownVolume && typeof lead.volume === 'number' && Number.isFinite(lead.volume) && lead.volume > 0;
  add('volume', 'Le volume à transporter', volume,
    volume ? `${lead.volume.toLocaleString('fr-FR', {maximumFractionDigits:2})} m³ retenus au dossier.` : 'Volume à estimer ou à confirmer dans le dossier.');
  const date = requestedDate(lead.moveDate), past = date && date < today;
  add('date', 'La date souhaitée', date && !past,
    !date ? 'Date à convenir avec le client.' : `${date.split('-').reverse().join('/')}${past ? ' · Date passée, à reconfirmer.' : lead.flexibleDate ? ' · Flexibilité signalée par le client.' : ' · Souhait du client, sans réservation de moyens.'}`);
  const access = ['departure', 'arrival'].filter(side => {
    const value = lead.technicalVisit?.[side];
    return !value || !known(value.floor) || !['Oui', 'Non'].includes(value.elevator) ||
      !/^\d+(\.\d{1,2})?$/.test(text(value.carry)) || Number(value.carry) > 5000;
  });
  add('access', 'Les accès aux logements', !access.length,
    access.length === 2 ? 'Étages, ascenseurs et portages à relever aux deux adresses.' : access.length ? `Accès ${access[0] === 'departure' ? 'au départ' : 'à l’arrivée'} à compléter dans le relevé.` : 'Étages, ascenseurs et portages renseignés dans le relevé enregistré.', 'visit');
  return {rows, pending:rows.filter(row => !row.recorded).length};
}

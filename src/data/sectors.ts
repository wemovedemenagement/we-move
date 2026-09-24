export const PARIS_ARRONDISSEMENTS = [
  { code: '75001', name: 'Paris 1er - Louvre', zone: 'Centre' },
  { code: '75002', name: 'Paris 2e - Bourse', zone: 'Centre' },
  { code: '75003', name: 'Paris 3e - Temple', zone: 'Centre' },
  { code: '75004', name: 'Paris 4e - Hôtel-de-Ville', zone: 'Centre' },
  { code: '75005', name: 'Paris 5e - Panthéon', zone: 'Rive Gauche' },
  { code: '75006', name: 'Paris 6e - Luxembourg', zone: 'Rive Gauche' },
  { code: '75007', name: 'Paris 7e - Palais-Bourbon', zone: 'Rive Gauche' },
  { code: '75008', name: 'Paris 8e - Élysée', zone: 'Rive Droite' },
  { code: '75009', name: 'Paris 9e - Opéra', zone: 'Rive Droite' },
  { code: '75010', name: 'Paris 10e - Enclos Saint-Laurent', zone: 'Rive Droite' },
  { code: '75011', name: 'Paris 11e - Popincourt', zone: 'Rive Droite' },
  { code: '75012', name: 'Paris 12e - Reuilly', zone: 'Rive Droite' },
  { code: '75013', name: 'Paris 13e - Gobelins', zone: 'Rive Gauche' },
  { code: '75014', name: 'Paris 14e - Observatoire', zone: 'Rive Gauche' },
  { code: '75015', name: 'Paris 15e - Vaugirard (Siège WE MOVE)', zone: 'Rive Gauche', isHeadquarters: true },
  { code: '75016', name: 'Paris 16e - Passy', zone: 'Rive Droite' },
  { code: '75017', name: 'Paris 17e - Batignolles-Monceau', zone: 'Rive Droite' },
  { code: '75018', name: 'Paris 18e - Buttes-Montmartre', zone: 'Rive Droite' },
  { code: '75019', name: 'Paris 19e - Buttes-Chaumont', zone: 'Rive Droite' },
  { code: '75020', name: 'Paris 20e - Ménilmontant', zone: 'Rive Droite' },
];

export const ILE_DE_FRANCE_DEPTS = [
  {
    code: '92',
    name: 'Hauts-de-Seine',
    badge: 'Petite Couronne',
    cities: 'Boulogne-Billancourt, Neuilly-sur-Seine, Levallois-Perret, Courbevoie, Issy-les-Moulineaux, Rueil-Malmaison, Antony...',
  },
  {
    code: '94',
    name: 'Val-de-Marne',
    badge: 'Petite Couronne',
    cities: 'Créteil, Vincennes, Saint-Maur-des-Fossés, Nogent-sur-Marne, Ivry-sur-Seine, Maisons-Alfort, Charenton-le-Pont...',
  },
  {
    code: '93',
    name: 'Seine-Saint-Denis',
    badge: 'Petite Couronne',
    cities: 'Montreuil, Saint-Denis, Pantin, Saint-Ouen, Noisy-le-Grand, Les Lilas, Aubervilliers, Bagnolet...',
  },
  {
    code: '78',
    name: 'Yvelines',
    badge: 'Grande Couronne',
    cities: 'Versailles, Saint-Germain-en-Laye, Poissy, Sartrouville, Rambouillet, Saint-Quentin-en-Yvelines...',
  },
  {
    code: '91',
    name: 'Essonne',
    badge: 'Grande Couronne',
    cities: 'Évry-Courcouronnes, Massy, Palaiseau, Sainte-Geneviève-des-Bois, Savigny-sur-Orge, Chilly-Mazarin...',
  },
  {
    code: '95',
    name: 'Val-d’Oise',
    badge: 'Grande Couronne',
    cities: 'Cergy, Pontoise, Argenteuil, Enghien-les-Bains, Sarcelles, Franconville, Taverny...',
  },
  {
    code: '77',
    name: 'Seine-et-Marne',
    badge: 'Grande Couronne',
    cities: 'Meaux, Melun, Chelles, Marne-la-Vallée, Fontainebleau, Torcy, Pontault-Combault...',
  },
];

export const NATIONAL_AXES = [
  { from: 'Paris', to: 'Lyon & Rhône-Alpes', delay: '24h à 48h', type: 'Formule dédiée ou groupage', dist: '~465 km' },
  { from: 'Paris', to: 'Bordeaux & Aquitaine', delay: '24h à 48h', type: 'Lignes régulières', dist: '~580 km' },
  { from: 'Paris', to: 'Marseille, Nice & PACA', delay: '48h', type: 'Camions capitonnés grand volume', dist: '~775 km' },
  { from: 'Paris', to: 'Nantes, Rennes & Bretagne', delay: '24h à 48h', type: 'Transferts complets', dist: '~385 km' },
  { from: 'Paris', to: 'Lille & Hauts-de-France', delay: '24h', type: 'Liaisons express', dist: '~220 km' },
  { from: 'Paris', to: 'Strasbourg & Grand-Est', delay: '24h à 48h', type: 'Lignes sécurisées', dist: '~490 km' },
];


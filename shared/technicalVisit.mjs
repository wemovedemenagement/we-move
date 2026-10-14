export const visitRooms = ['Séjour', 'Chambre', 'Cuisine', 'Bureau', 'Entrée', 'Cave / garage', 'Autre'];
export function inventoryVolume(items = []) {
  return Math.round(items.reduce((sum, item) => sum + item.quantity * item.unitVolume, 0) * 100) / 100;
}
export function normalizeTechnicalVisit(value) {
  const fail = () => { const error = new Error('Fiche de visite invalide. Vérifiez les quantités, volumes et accès.'); error.status = 400; throw error; };
  const object = (v, keys) => { if (!v || typeof v !== 'object' || Array.isArray(v) || Object.keys(v).some(k => !keys.includes(k))) fail(); };
  const text = (v, max) => { if (typeof v !== 'string' || v.length > max) fail(); return v.trim(); };
  object(value, ['items', 'departure', 'arrival']);
  if (!Array.isArray(value.items) || value.items.length > 150) fail();
  const items = value.items.map(item => {
    object(item, ['room', 'label', 'quantity', 'unitVolume']);
    if (!visitRooms.includes(item.room) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 500 || typeof item.unitVolume !== 'number' || !Number.isFinite(item.unitVolume) || item.unitVolume <= 0 || item.unitVolume > 100) fail();
    const label = text(item.label, 160); if (!label) fail();
    return { room: item.room, label, quantity: item.quantity, unitVolume: item.unitVolume };
  });
  if (inventoryVolume(items) > 1000) fail();
  const result = { items };
  for (const side of ['departure', 'arrival']) {
    object(value[side], ['floor', 'elevator', 'carry', 'notes']);
    const { floor, elevator, carry, notes } = value[side];
    if (!['', 'Oui', 'Non'].includes(elevator) || typeof carry !== 'string' || (carry !== '' && (!/^\d+(\.\d{1,2})?$/.test(carry) || Number(carry) > 5000))) fail();
    result[side] = { floor: text(floor, 80), elevator, carry, notes: text(notes, 3000) };
  }
  return result;
}

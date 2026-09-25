import assert from 'node:assert/strict';
import { sanitizeInventory, inventoryVolume, normalizeSearch } from '../src/data/volumeCalculator.ts';
import { INVENTORY_ITEMS, VOLUME_PRESETS } from '../src/data/volumeData.ts';

assert.deepEqual(sanitizeInventory(null), {});
assert.deepEqual(sanitizeInventory([]), {});
assert.deepEqual(sanitizeInventory({ canape_2: -5, fauteuil: Infinity, cartons_std: '9', unknown: 2 }), {});
assert.deepEqual(sanitizeInventory({ canape_2: 2.8, cartons_std: 140 }), { canape_2: 2, cartons_std: 99 });
assert.equal(inventoryVolume({ canape_droit_3: 1, frigo_combine: 1 }), 4);
assert.equal(inventoryVolume({ cartons_std: 3, cartons_livres: 2 }), 4.2);
assert.equal(inventoryVolume({}), 0);
assert.equal(normalizeSearch('  Réfrigérateur  '), 'refrigerateur');
assert.equal(new Set(INVENTORY_ITEMS.map(item => item.id)).size, INVENTORY_ITEMS.length);
for (const preset of VOLUME_PRESETS) {
  assert.deepEqual(sanitizeInventory(preset.quantities), preset.quantities, `Invalid preset: ${preset.id}`);
  assert.ok(inventoryVolume(preset.quantities) > 0);
}
console.log('Volume: saved-data validation, quantity limits, known totals, search accents and all presets passed.');

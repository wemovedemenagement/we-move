import { INVENTORY_ITEMS } from './volumeData';

export type Inventory = Record<string, number>;
export const INVENTORY_STORAGE_KEY = 'wemove_calculator_inventory';
export const formatVolume = (value: number) => value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
export const normalizeSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function sanitizeInventory(value: unknown): Inventory {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Inventory = {};
  for (const item of INVENTORY_ITEMS) {
    const quantity = (value as Inventory)[item.id];
    if (typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0) {
      const whole = Math.min(99, Math.floor(quantity));
      if (whole > 0) result[item.id] = whole;
    }
  }
  return result;
}

export function inventoryVolume(inventory: Inventory) {
  return Math.round(INVENTORY_ITEMS.reduce((sum, item) => sum + item.m3 * (inventory[item.id] || 0), 0) * 100) / 100;
}

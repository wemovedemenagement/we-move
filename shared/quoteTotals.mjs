// Shared by the editor and server. Integer arithmetic avoids fractional-cent drift.
export function quoteTotals(items, taxRate, depositRate) {
  const empty = { amountHT: null, taxAmount: null, amountTTC: null, depositAmount: null };
  if (!items.length || items.some(item => !Number.isFinite(item.quantity) || !Number.isFinite(item.unitPriceHT) || item.quantity <= 0 || item.unitPriceHT < 0)) return empty;
  const cents = items.reduce((sum, item) => sum + (BigInt(Math.round(item.unitPriceHT * 100)) * BigInt(Math.round(item.quantity * 1000)) + 500n) / 1000n, 0n);
  const percent = (base, rate) => rate === null || !Number.isFinite(rate) || rate < 0 || rate > 100 ? null : (base * BigInt(Math.round(rate * 100)) + 5000n) / 10000n;
  const tax = percent(cents,taxRate), total = tax === null ? null : cents + tax;
  const deposit = total === null ? null : percent(total,depositRate);
  return { amountHT: Number(cents)/100, taxAmount: tax === null ? null : Number(tax)/100, amountTTC: total === null ? null : Number(total)/100, depositAmount: deposit === null ? null : Number(deposit)/100 };
}

// Display only a locality; keep the original address intact in the dossier.
export function requestCity(address) {
  const value = String(address || '').trim();
  if (!value || /^(à préciser|inconnue?|à définir)$/iu.test(value)) return 'À préciser';
  const parts = value.split(/[,\n]/).map(part => part.trim()).filter(Boolean);
  while (parts.length && /^(france|fr|france métropolitaine)$/iu.test(parts.at(-1))) parts.pop();
  const postal = parts.join(', ').match(/\b\d{5}\s+([^,]+)/u);
  const candidate = (postal?.[1] || parts.at(-1) || '').replace(/\s+\d{5}$/u, '').replace(/\s+cedex(?:\s+\d+)?$/iu, '').trim();
  // A street-only or ambiguous address must not be presented as a city.
  if (!candidate || /\d/u.test(candidate) || /\b(rue|avenue|boulevard|route|chemin|impasse|allée|place|quai|résidence|bâtiment)\b/iu.test(candidate)) return 'À préciser';
  return candidate;
}

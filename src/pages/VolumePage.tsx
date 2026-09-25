import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUpRight, ArrowRight, Box, Check, CheckCheck, ClipboardList, Download, House, Info, Minus, Plus, RotateCcw, Search, ShieldCheck, X } from 'lucide-react';
import { Link, useRouter } from '../router';
import { INVENTORY_ITEMS, VOLUME_PRESETS, type FurnitureCategory } from '../data/volumeData';
import { formatVolume, INVENTORY_STORAGE_KEY, inventoryVolume, normalizeSearch, sanitizeInventory, type Inventory } from '../data/volumeCalculator';
import { FurnitureIcon } from '../components/FurnitureIcon';

const rooms: { id: string; label: string; icon: string; categories: FurnitureCategory[] }[] = [
  { id: 'salon', label: 'Salon & séjour', icon: 'sofa-large', categories: ['Salon', 'Séjour'] },
  { id: 'chambre', label: 'Chambres', icon: 'bed-double', categories: ['Chambre', 'Enfants'] },
  { id: 'cuisine', label: 'Cuisine', icon: 'fridge', categories: ['Cuisine'] },
  { id: 'bain', label: 'Salle de bain', icon: 'bath', categories: ['Salle de bain'] },
  { id: 'bureau', label: 'Bureau', icon: 'desk', categories: ['Bureau'] },
  { id: 'cartons', label: 'Cartons & valises', icon: 'boxes', categories: ['Cartons'] },
  { id: 'autres', label: 'Extérieur & autres', icon: 'outdoor', categories: ['Extérieur & Garage', 'Objets Spéciaux'] },
];
const presetNames: Record<string, string> = { studio: 'Studio', t2: '2 pièces', t3_t4: '3–4 pièces', maison: 'Maison', bureau_pro: 'Bureau' };

export const VolumePage = () => {
  const { query, push } = useRouter();
  const [inventory, setInventory] = useState<Inventory>(() => {
    try { const saved = localStorage.getItem(INVENTORY_STORAGE_KEY); if (saved !== null) return sanitizeInventory(JSON.parse(saved)); } catch { /* Manual use remains available. */ }
    const initial = Number(query.initial);
    if (Number.isFinite(initial) && initial > 0) {
      const id = initial >= 45 ? 'maison' : initial >= 30 ? 't3_t4' : initial >= 18 ? 't2' : 'studio';
      return { ...VOLUME_PRESETS.find(p => p.id === id)!.quantities };
    }
    return {};
  });
  const [room, setRoom] = useState('salon');
  const [search, setSearch] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [undo, setUndo] = useState<Inventory | null>(null);
  const [notice, setNotice] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try { localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  }, [inventory]);
  const total = inventoryVolume(inventory);
  const selected = INVENTORY_ITEMS.filter(item => (inventory[item.id] || 0) > 0);
  const activePreset = VOLUME_PRESETS.find(p => INVENTORY_ITEMS.every(i => (p.quantities[i.id] || 0) === (inventory[i.id] || 0)));
  const currentRoom = rooms.find(r => r.id === room)!;
  const filtered = useMemo(() => INVENTORY_ITEMS.filter(item => {
    const matchesSearch = normalizeSearch(`${item.name} ${item.subtitle} ${item.category}`).includes(normalizeSearch(search));
    if (search.trim()) return matchesSearch && (!selectedOnly || inventory[item.id] > 0);
    if (selectedOnly) return inventory[item.id] > 0;
    return currentRoom.categories.includes(item.category);
  }), [search, selectedOnly, inventory, currentRoom]);
  const breakdown = rooms.map(r => ({ ...r, volume: inventoryVolume(Object.fromEntries(INVENTORY_ITEMS.filter(i => r.categories.includes(i.category)).map(i => [i.id, inventory[i.id] || 0]))) })).filter(r => r.volume > 0);
  const updateQuantity = (id: string, value: number) => {
    setInventory(prev => { const next = { ...prev }; const quantity = Math.max(0, Math.min(99, Math.floor(Number.isFinite(value) ? value : 0))); if (quantity) next[id] = quantity; else delete next[id]; return next; });
    setUndo(null); setNotice('');
  };
  const replaceInventory = (next: Inventory, message: string) => { setUndo({ ...inventory }); setInventory({ ...next }); setNotice(message); };
  const resetFilters = () => { setSearch(''); setSelectedOnly(false); };
  const showSelection = () => { setSearch(''); setSelectedOnly(true); document.getElementById('volume-catalogue')?.scrollIntoView({ behavior: 'instant', block: 'start' }); };
  const quote = () => push(`/devis/?volume=${total}`);
  const download = () => {
    const text = ['WE MOVE · INVENTAIRE DE DÉMÉNAGEMENT', `Volume indicatif : ${formatVolume(total)} m³`, '', ...selected.map(item => `${inventory[item.id]} × ${item.name} (${item.category}) : ${formatVolume(item.m3 * inventory[item.id])} m³`), '', 'Estimation indicative à confirmer avec un conseiller selon les dimensions, l’emballage et les accès.', 'We Move · 01 73 74 36 90 · contact@wemove.fr'].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mon-inventaire-we-move.txt'; anchor.hidden = true; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Votre inventaire a été préparé pour le téléchargement.');
  };
  return <div className="volume-page">
    <section className="volume-hero"><div className="wm-container volume-hero-grid">
      <div><p className="eyebrow">BIEN PRÉPARER VOTRE NOUVEAU DÉPART</p><h1>Une place pour tout.<br/><em>Un volume pour prévoir.</em></h1><p className="volume-intro">Du canapé préféré aux derniers cartons, faites le tour de votre intérieur. Votre estimation prend forme, pièce après pièce.</p><a href="#volume-calculator" className="wm-button">Estimer mon volume <ArrowDown size={17}/></a><div className="volume-promises"><span><Check size={14}/>Gratuit, sans inscription</span><span><ShieldCheck size={14}/>À votre rythme</span></div></div>
      <div className="volume-scene" aria-hidden="true"><span className="volume-scene-caption">VOTRE INTÉRIEUR, EN QUELQUES CLICS</span><div className="volume-scene-orbit"/><div className="volume-scene-tile scene-sofa"><FurnitureIcon name="category-mobilier" className="scene-icon"/><span>Les essentiels</span><strong>Votre salon</strong></div><div className="volume-scene-tile scene-box"><FurnitureIcon name="boxes" className="scene-icon"/><strong>Vos souvenirs</strong><span>Bien emballés.</span></div><span className="volume-scene-note"><CheckCheck size={19}/> Tout commence par un inventaire.</span><span className="volume-scene-unit">m³</span></div>
    </div></section>
    <section className="volume-workspace wm-container" id="volume-calculator" aria-labelledby="volume-calculator-title">
      <div className="volume-section-heading"><div><p className="eyebrow">01 / VOTRE POINT DE DÉPART</p><h2 id="volume-calculator-title">Votre intérieur. Votre inventaire.</h2></div><p>Partez d’un exemple de logement,<br/>ou ajoutez directement vos meubles.</p></div>
      <div className="volume-presets">{VOLUME_PRESETS.map(p => <button key={p.id} aria-pressed={activePreset?.id === p.id} onClick={() => replaceInventory(p.quantities, `L’exemple « ${presetNames[p.id]} » est chargé. Ajustez-le à votre intérieur.`)}><House size={22} strokeWidth={1.4}/><span><strong>{presetNames[p.id]}</strong><small>{p.area}</small></span><span className="volume-preset-check">{activePreset?.id === p.id ? <Check size={14}/> : <Plus size={14}/>}</span></button>)}</div>
      <p className="volume-preset-note"><Info size={14}/> Un exemple remplace la sélection actuelle. Vous pouvez annuler juste après.</p>
      <div className="volume-notice" role="status">{notice && <><span>{notice}</span>{undo && <button onClick={() => { setInventory(undo); setUndo(null); setNotice('Votre inventaire précédent a été restauré.'); }}><RotateCcw size={14}/>Annuler</button>}</>}</div>
      <div className="volume-layout">
        <div className="volume-catalogue" id="volume-catalogue">
          <div className="volume-catalogue-heading"><div><p className="eyebrow">02 / PIÈCE PAR PIÈCE</p><h2>Qu’emportez-vous ?</h2></div><span>{INVENTORY_ITEMS.length} références</span></div>
          <div className="volume-search"><Search size={19}/><input aria-label="Rechercher dans toutes les pièces" placeholder="Un canapé, un lit, des cartons…" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button aria-label="Effacer la recherche" onClick={() => setSearch('')}><X size={17}/></button>}</div>
          <div className="volume-room-tabs" role="group" aria-label="Filtrer par pièce">{rooms.map(r => <button key={r.id} aria-pressed={!search.trim() && !selectedOnly && room === r.id} onClick={() => { setRoom(r.id); resetFilters(); }}><FurnitureIcon name={r.icon} className="volume-room-icon"/>{r.label}{INVENTORY_ITEMS.some(i => r.categories.includes(i.category) && inventory[i.id] > 0) && <span className="volume-room-dot"/>}</button>)}</div>
          <div className="volume-results-heading"><h3>{search.trim() ? `Recherche · ${filtered.length} résultat${filtered.length > 1 ? 's' : ''}` : selectedOnly ? 'Votre sélection complète' : currentRoom.label}</h3><button className="volume-selection-toggle" aria-pressed={selectedOnly} onClick={() => setSelectedOnly(v => !v)}><ClipboardList size={15}/>Ma sélection ({selected.length})</button></div>
          <div className="volume-items">{filtered.map(item => { const qty = inventory[item.id] || 0; const lot = /^(10 |Lot de |Tabourets)/.test(item.name); return <article className={`volume-item ${qty ? 'is-selected' : ''}`} key={item.id}><div className="volume-item-top"><span className="volume-item-icon"><FurnitureIcon name={item.iconType} className="volume-furniture-icon"/></span><span className="volume-item-unit">{formatVolume(item.m3)} m³ / {lot ? 'lot' : 'unité'}</span></div><h4>{item.name}</h4><p>{item.subtitle}</p><div className="volume-item-bottom"><span>{qty > 0 ? <strong>{formatVolume(qty * item.m3)} m³</strong> : lot ? 'Nombre de lots' : 'Quantité'}</span><div className="volume-stepper"><button disabled={qty === 0} aria-label={`Retirer : ${item.name}`} onClick={() => updateQuantity(item.id, qty - 1)}><Minus size={15}/></button><input type="number" inputMode="numeric" min={0} max={99} step={1} aria-label={`Quantité : ${item.name}`} value={qty} onChange={e => updateQuantity(item.id, Number(e.target.value))}/><button disabled={qty === 99} aria-label={`Ajouter : ${item.name}`} onClick={() => updateQuantity(item.id, qty + 1)}><Plus size={15}/></button></div></div>{item.id.startsWith('cartons_') && <small className="volume-lot-note">1 lot = 10 cartons{qty > 0 ? ` · ${qty * 10} cartons sélectionnés` : ''}</small>}</article>; })}</div>
          {filtered.length === 0 && <div className="volume-empty"><Search size={30} strokeWidth={1.3}/><h4>{selectedOnly && !search ? 'Votre prochain départ commence ici.' : 'Aucun résultat pour cette recherche.'}</h4><p>{selectedOnly && !search ? 'Ajoutez votre premier meuble ou choisissez un exemple de logement.' : 'Essayez un autre mot, comme « lit » ou « réfrigérateur ».'}</p><button onClick={resetFilters}>Explorer les meubles <ArrowRight size={15}/></button></div>}
          <div className="volume-help-note"><Info size={20}/><p>Un objet absent de la liste ou des dimensions atypiques ? <Link href="/contact/">Parlons-en ensemble <ArrowUpRight size={13}/></Link></p></div>
        </div>
        <aside className="volume-summary" aria-label="Votre estimation"><div className="volume-summary-card"><p className="eyebrow">VOTRE DÉMÉNAGEMENT PREND FORME</p><div className="volume-total" role="status" aria-live="polite" aria-atomic="true"><span className="volume-total-label">Volume estimé</span><strong>{formatVolume(total)}<small>m³</small></strong><span>{selected.length ? `${selected.length} référence${selected.length > 1 ? 's' : ''} dans votre inventaire` : 'Ajoutez vos premiers meubles'}</span></div>
          <div className="volume-breakdown">{breakdown.length ? <><div className="volume-distribution" aria-hidden="true">{breakdown.map(r => <span key={r.id} className={`room-color-${r.id}`} style={{ flex: r.volume }}/>)}</div>{breakdown.map(r => <div className="volume-breakdown-row" key={r.id}><span><i className={`room-color-${r.id}`}/>{r.label}</span><strong>{formatVolume(r.volume)} m³</strong></div>)}</> : <div className="volume-summary-empty"><Box size={35} strokeWidth={1}/><p>Chaque meuble compte.<br/>Votre total se met à jour ici.</p></div>}</div>
          <button className="volume-quote-button" disabled={total <= 0} onClick={quote}>Obtenir mon devis gratuit <ArrowUpRight size={18}/></button><p className="volume-summary-reassurance">Votre volume sera repris dans le devis.<br/>Sans engagement.</p><div className="volume-summary-actions"><button disabled={!selected.length} onClick={showSelection}><ClipboardList size={15}/>Revoir la liste</button><button disabled={!selected.length} onClick={download}><Download size={15}/>Télécharger</button></div>
        </div><div className="volume-summary-note"><ShieldCheck size={18}/><p>{storageAvailable ? 'Votre sélection est enregistrée dans ce navigateur. Revenez quand vous voulez.' : 'La sauvegarde locale est indisponible. Téléchargez votre inventaire avant de quitter.'}</p></div><button className="volume-reset" disabled={!selected.length} onClick={() => replaceInventory({}, 'Votre inventaire a été vidé.')}><RotateCcw size={14}/>Recommencer à zéro</button></aside>
      </div>
    </section>
    <section className="volume-guide"><div className="wm-container volume-guide-grid"><div><p className="eyebrow">UN CHIFFRE UTILE. UN ACCOMPAGNEMENT HUMAIN.</p><h2>Une estimation pour avancer.<br/><em>Notre équipe pour affiner.</em></h2><p>Ce calcul additionne les volumes moyens des éléments choisis. L’emballage, le démontage et les dimensions réelles peuvent faire varier le volume à transporter.</p><a href="tel:0173743690" className="text-link">Parlons de votre projet · 01 73 74 36 90 <ArrowUpRight size={16}/></a></div><div className="volume-faq"><details><summary>Comment obtenir une estimation plus précise ? <Plus size={17}/></summary><p>Parcourez chaque pièce, puis pensez aux placards, à la cave et au garage. Modifiez les quantités des exemples pour ne conserver que ce que vous emportez. Un conseiller pourra ensuite confirmer votre volume.</p></details><details><summary>Comment compter mes cartons et mes lots ? <Plus size={17}/></summary><p>Les cartons standard et les cartons livres sont proposés par lots de 10 : une quantité de 3 correspond à 30 cartons. Pour les chaises, chevets ou valises, la quantité correspond au lot indiqué dans le nom.</p></details><details><summary>Le volume suffit-il à déterminer le prix ? <Plus size={17}/></summary><p>Il permet de préparer votre devis. La distance, les accès, les étages, les dates et les prestations choisies sont également pris en compte. Cette estimation ne constitue pas un devis.</p></details></div></div></section>
    <div className="volume-mobile-bar"><button className="volume-mobile-total" onClick={showSelection} aria-label={`Revoir ma sélection, ${formatVolume(total)} mètres cubes`}><small>MON VOLUME ESTIMÉ</small><strong>{formatVolume(total)} <span>m³</span><ClipboardList size={16}/></strong></button><button disabled={total <= 0} onClick={quote}>Mon devis gratuit <ArrowUpRight size={17}/></button></div>
  </div>;
};

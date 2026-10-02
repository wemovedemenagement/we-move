import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

process.env.CRM_STORAGE = 'sqlite';
process.env.CRM_LOCAL_ACCESS = 'true';
// Dedicated disposable database; never touches the running CRM's customer data.
process.env.CRM_DATA_DIR = mkdtempSync(path.join(tmpdir(), 'wemove-crm-test-'));
writeFileSync(path.join(process.env.CRM_DATA_DIR, 'quotes.json'), JSON.stringify([{ id: 'legacy-test', createdAt: '2026-01-01T00:00:00.000Z', fullName: 'Migration test', status: 'nouveau' }]));
const { createApp } = await import('../server.mjs');
const app = createApp().listen(0, '127.0.0.1');
await new Promise(resolve => app.once('listening', resolve));
const base = `http://127.0.0.1:${app.address().port}`;
async function api(route = '/api/quotes', method = 'GET', body) {
  const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  return { status: response.status, body: await response.json(), cache: response.headers.get('cache-control') };
}
try {
  const forbidden = await fetch(base + '/api/quotes', {headers: {Origin: 'https://outside.example'}});
  assert.equal(forbidden.status, 401);
  process.env.CRM_LOCAL_ACCESS = 'false';
  assert.equal((await api()).status, 401);
  process.env.CRM_LOCAL_ACCESS = 'true';
  let result = await api();
  assert.equal(result.body.quotes.length, 1);
  assert.equal(result.body.quotes[0].id, 'legacy-test');
  assert.equal(result.cache, 'no-store');
  const website = await api('/api/quotes', 'POST', { fullName: 'Test site', email: 'site@example.test', source: 'page_devis', departureAddress: 'Paris', arrivalAddress: 'Lyon', unknownVolume: true });
  assert.equal(website.status, 201);
  assert.equal(website.body.quote.volume, 0);
  assert.equal(website.body.quote.estimatedPrice, 0);
  const phone = await api('/api/quotes', 'POST', { fullName: 'Test téléphone', phone: '0100000000', source: 'telephone' });
  assert.equal(phone.status, 201);
  assert.equal(phone.body.quote.email, '');
  const ads = await api('/api/quotes', 'POST', { fullName: 'Test Ads', email: 'ads@example.test', source: 'ads', sourceDetail: 'Campagne test', volume: 30, formula: 'standard' });
  assert.equal(ads.status, 201);
  assert.equal(ads.body.quote.estimatedPrice, 0, 'Aucun tarif arbitraire généré');
  assert.equal(ads.body.quote.sourceDetail, 'Campagne test');
  assert.equal((await api('/api/quotes', 'POST', { fullName: 'Sans contact' })).status, 400);
  assert.equal((await api('/api/quotes', 'POST', { fullName: 'Email invalide', email: 'bad', source: 'ads' })).status, 400);
  assert.equal((await api('/api/quotes', 'POST', { fullName: 'Invalide', phone: '0100000000', volume: -1 })).status, 400);
  const id = website.body.quote.id;
  const updated = await api(`/api/quotes/${id}`, 'PATCH', { status: 'prise_contact', id: 'forged', createdAt: 'forged', newNote: 'Contact test', author: 'Test' });
  assert.equal(updated.body.quote.id, id);
  assert.equal(updated.body.quote.createdAt, website.body.quote.createdAt);
  assert.equal(updated.body.quote.internalNotes[0].content, 'Contact test');
  assert.equal((await api('/api/quotes/' + id, 'PATCH', {teamMembers: ['Un nom', 42]})).status, 400);
  const visit = await api('/api/quotes/' + id, 'PATCH', {visitDate:'2026-10-01T10:00',visitType:'domicile',visitStatus:'programmee'});
  assert.equal(visit.body.quote.visitDate, '2026-10-01T10:00');
  const move = await api('/api/quotes/' + id, 'PATCH', {status:'confirme',scheduledTime:'2026-10-10T09:00',assignedTruckName:'Véhicule saisi',teamMembers:['Nom saisi']});
  assert.equal(move.status,400); // Ressources réservées via l’API de planification dédiée.
  assert.equal((await api('/api/quotes/'+id,'PATCH',{status:'confirme'})).status,200);
  // New process proves persistence and ensures legacy import is not repeated.
  const count = execFileSync(process.execPath, ['--input-type=module', '-e', "import {getAllQuotes} from './server/crmStore.mjs'; console.log((await getAllQuotes()).length)"], { cwd: process.cwd(), env: process.env, encoding: 'utf8' }).trim();
  assert.equal(count, '4');
  assert.equal((await api('/api/quotes?search=Test%20Ads')).body.count, 1);
  assert.equal((await api('/api/crm/stats')).body.stats.totalLeads, 4);
  assert.equal((await api(`/api/quotes/${phone.body.quote.id}`, 'DELETE')).status, 200);
  assert.equal((await api()).body.count, 3);
  const brokenDir = mkdtempSync(path.join(tmpdir(), 'wemove-crm-invalid-'));
  writeFileSync(path.join(brokenDir, 'quotes.json'), '{broken');
  assert.throws(() => execFileSync(process.execPath, ['--input-type=module', '-e', "import {getAllQuotes} from './server/crmStore.mjs'; await getAllQuotes()"], { cwd: process.cwd(), env: { ...process.env, CRM_DATA_DIR: brokenDir }, stdio: 'pipe' }));
  console.log('CRM : migration, persistance, canaux site/téléphone/Ads, validation, modifications et erreurs vérifiés.');
} finally { await new Promise(resolve => app.close(resolve)); }

import assert from 'node:assert/strict';import sharp from 'sharp';import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
process.env.NODE_ENV='test';process.env.CRM_STORAGE='sqlite';process.env.CRM_LOCAL_ACCESS='true';process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wemove-photos-'));process.env.CRM_LEAD_NOTIFICATIONS='false';process.env.CRM_CUSTOMER_RECEIPTS='false';
const store=await import('../server/crmStore.mjs');const {createApp}=await import('../server.mjs');
const lead=await store.createQuoteLead({fullName:'Photos isolées',email:'test@example.invalid'});const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;const url=base+'/api/crm/dossiers/'+lead.id+'/photos';
const jpeg=await sharp({create:{width:2200,height:1700,channels:3,background:'#3388aa'}}).jpeg().withMetadata({exif:{IFD0:{Artist:'Private metadata'}}}).toBuffer();
try{
 assert.equal((await fetch(url,{headers:{Authorization:'Bearer invalid'}})).status,401);
 assert.equal((await fetch(url+'/1',{method:'PUT',headers:{'Content-Type':'image/jpeg',Authorization:'Bearer invalid'},body:jpeg})).status,401);
 assert.equal((await fetch(url+'/1',{method:'PUT',headers:{'Content-Type':'image/jpeg'},body:Buffer.from('<svg></svg>')})).status,400);
 assert.equal((await fetch(url+'/13',{method:'PUT',headers:{'Content-Type':'image/jpeg'},body:jpeg})).status,400);
 const results=await Promise.all([1,2].map(()=>fetch(url+'/1?caption=Escalier&area=depart',{method:'PUT',headers:{'Content-Type':'image/jpeg'},body:jpeg})));assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);
 const listing=await (await fetch(url)).json();assert.equal(listing.photos.length,1);assert.equal(listing.photos[0].caption,'Escalier');
 const response=await fetch(url+'/1');assert.match(response.headers.get('cache-control'),/private, no-store/);const meta=await sharp(Buffer.from(await response.arrayBuffer())).metadata();assert.ok(meta.width<=1600);assert.equal(meta.exif,undefined);assert.equal(meta.format,'jpeg');
 assert.equal((await fetch(base+'/api/quotes/'+lead.id,{method:'DELETE'})).status,409);
 assert.equal((await fetch(url+'/1?generation=0',{method:'DELETE'})).status,409);
 assert.equal((await fetch(url+'/1?generation='+listing.photos[0].generation,{method:'DELETE'})).status,200);
 assert.equal((await fetch(url+'/1')).status,404);
 assert.equal((await fetch(url+'/2',{method:'PUT',headers:{'Content-Type':'image/jpeg'},body:Buffer.alloc(8*1024*1024+1)})).status,413);
 assert.equal((await fetch(base+'/api/crm/dossiers/absent/photos')).status,404);
 console.log('Photos privées : authentification, JPEG réencodé sans EXIF, limites, concurrence, versions de suppression et cache validés.');
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}

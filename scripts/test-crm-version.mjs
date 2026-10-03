import assert from 'node:assert/strict';
import {crmUiVersion} from '../server/crmVersion.mjs';
process.env.NODE_ENV='test';
process.env.CRM_LOCAL_ACCESS='true';
const {createApp}=await import('../server.mjs');
const server=createApp().listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
try {
 const url='http://127.0.0.1:'+server.address().port+'/api/crm/version';
 const response=await fetch(url);
 assert.equal(response.status,200);
 assert.match(response.headers.get('cache-control'),/no-store/);
 assert.equal((await response.json()).version,crmUiVersion());
 process.env.CRM_LOCAL_ACCESS='false';
 assert.equal((await fetch(url)).status,401);
 console.log('Version CRM : build publié, cache désactivé et accès authentifié validés.');
} finally {
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
}

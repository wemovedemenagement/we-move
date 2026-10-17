import {spawnSync} from 'node:child_process';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

// Each suite gets its own process and local data directory. No production writes.
const suites=[
  'test-mission-timeline',
  'test-mission-resources',
  'test-document-reminder',
  'test-document-queue',
  'test-crm-document-checklist',
  'test-crm-quote-acceptance',
  'test-crm-storage-stays',
  'test-visit-checks',
  'test-crm-commercial-contact','test-crm-quote-follow-up',
  'test-quote-readiness',
  'test-departure-readiness',
  'test-aftercare-queue',
  'test-crm-aftercare',
  'test-crm-move-closure',
  'test-planning-availability',
  'test-crm-absences',
  'test-crm-visit-photos',
  'test-crm-technical-visit',
  'test-crm-move-operations','test-crm-auth','test-server','test-seo','test-crm-cache','test-crm-version',
  'test-crm','test-crm-drafts','test-crm-follow-up','test-crm-visits',
  'test-crm-workspace','test-crm-invoices','test-crm-billing',
  'test-crm-billing-overview','test-crm-billing-export','test-crm-pricing',
  'test-crm-dossier-workflow','test-crm-dossier-stages','test-crm-work-priorities',
  'test-move-preparation','test-crm-search','test-crm-notifications',
];
for(const suite of suites){
  console.log('\nVérification : '+suite);
  const result=spawnSync(process.execPath,['scripts/'+suite+'.mjs'],{
    stdio:'inherit',timeout:120000,
    env:{...process.env,NODE_ENV:'test',CRM_STORAGE:'sqlite',CRM_LOCAL_ACCESS:'true',
      CRM_DATA_DIR:mkdtempSync(path.join(tmpdir(),'wemove-release-')),
      CRM_LEAD_NOTIFICATIONS:'false',CRM_CUSTOMER_RECEIPTS:'false',CRM_BILLING_LIVE_ENABLED:'false'},
  });
  if(result.error||result.status!==0){
    console.error('Validation interrompue : '+suite+(result.error?' · '+result.error.message:''));
    process.exit(1);
  }
}
console.log('\n'+suites.length+' contrôles de livraison réussis. Aucune publication déclenchée.');

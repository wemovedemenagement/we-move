// All Firestore fixtures use isolated collections, never the CRM's live data.
process.argv.push('--firestore-isolated');
await import('./test-crm-drafts.mjs');

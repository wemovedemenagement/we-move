export const target = Object.freeze({
  project: 'wemove-b0057', backend: 'we-move', region: 'europe-west4',
  account: 'firebase-app-hosting-compute@wemove-b0057.iam.gserviceaccount.com',
  repository: 'wemovedemenagement-we-move', origin: 'https://we-move.fr',
});
export const runtimeRoles = Object.freeze([
  'roles/datastore.user', 'roles/developerconnect.readTokenAccessor',
  'roles/firebaseapphosting.computeRunner', 'roles/firebaseauth.viewer',
]);
const requireState = (condition, message) => { if (!condition) throw new Error(message); };
const repositoryPattern = /^projects\/(wemove-b0057|694105269612)\/locations\/europe-west4\/connections\/[^/]+\/gitRepositoryLinks\/wemovedemenagement-we-move$/;

export function parseDeploymentArgs(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === '--check')) return {commit: null};
  if (args.length === 2 && args[0] === '--commit' && /^[a-f0-9]{40}$/.test(args[1])) return {commit: args[1]};
  throw new Error('Usage : npm run deploy:crm -- --check ou --commit <SHA Git complet de 40 caractères>.');
}

export function rolloutArgs(commit) {
  requireState(/^[a-f0-9]{40}$/.test(commit), 'Commit complet obligatoire.');
  return ['apphosting:rollouts:create', target.backend, '--git-commit', commit,
    '--project', target.project, '--account', 'wemove.demenagement@gmail.com', '--force', '--non-interactive'];
}

export function verifyCloudSnapshot({policy, database, backend, run}) {
  const member = 'serviceAccount:' + target.account;
  const own = (policy?.bindings || []).filter(b => b.members?.includes(member));
  requireState(own.every(b => !b.condition), 'Attribution IAM conditionnelle inattendue : revue nécessaire.');
  const roles = [...new Set(own.map(b => b.role))].sort();
  requireState(JSON.stringify(roles) === JSON.stringify([...runtimeRoles].sort()), 'Les rôles du compte serveur ne correspondent pas aux rôles réduits attendus.');
  requireState(!(policy.bindings || []).some(b => b.members?.some(m => ['allUsers','allAuthenticatedUsers'].includes(m))), 'Attribution IAM publique au niveau projet.');
  requireState(database?.name === `projects/${target.project}/databases/(default)` && database.databaseEdition === 'STANDARD' && database.locationId === 'europe-west9', 'Base Firestore cible inattendue.');
  requireState(database.deleteProtectionState === 'DELETE_PROTECTION_ENABLED', 'Protection contre la suppression inactive.');
  requireState(database.pointInTimeRecoveryEnablement === 'POINT_IN_TIME_RECOVERY_ENABLED', 'Récupération historique inactive.');
  requireState(backend?.name === `projects/${target.project}/locations/${target.region}/backends/${target.backend}`, 'Backend inattendu.');
  requireState(backend.serviceAccount === target.account && repositoryPattern.test(backend.codebase?.repository||''), 'Compte serveur ou dépôt du backend inattendu.');
  requireState(run?.template?.serviceAccount === target.account, 'Identité Cloud Run inattendue.');
  const env = Object.fromEntries((run.template.containers?.[0]?.env || []).map(v => [v.name, v.value]));
  const totp = (run.template.containers?.[0]?.env || []).find(v => v.name === 'CRM_TOTP_AVAILABLE');
  requireState(env.CRM_STORAGE === 'firestore' && env.FIRESTORE_DATABASE_ID === '(default)', 'Stockage CRM inattendu.');
  requireState(env.CRM_LOCAL_ACCESS === 'false', 'Accès local activé ou indéterminé en production.');
  requireState(env.CRM_BILLING_LIVE_ENABLED === 'false', 'La facturation réelle doit rester désactivée pour cette phase.');
  requireState(!totp || totp.value === 'false', 'Activation MFA non attendue ou indéterminée dans cette phase.');
  return {roles, deleteProtection: true, pitr: true, firestore: true, localAccess: false, billingLive: false, totpAvailable: false};
}

export function verifyCiRuns(runs, commit) {
  const latest = runs.filter(r => r.headSha === commit && r.headBranch === 'main' && r.workflowName === 'Validation de livraison')
    .sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)) || b.databaseId-a.databaseId)[0];
  requireState(latest?.status === 'completed' && latest?.conclusion === 'success', 'La dernière validation GitHub du commit exact sur main doit être terminée avec succès.');
  return {commit,runId:latest.databaseId,url:latest.url,conclusion:'success'};
}

export function verifyPublishedBuild(traffic, build, commit) {
  const splits = traffic?.current?.splits;
  requireState(!traffic?.reconciling && splits?.length === 1 && splits[0].percent === 100, 'Le trafic ne dessert pas encore une version unique à 100 %.');
  requireState(build?.name === splits[0].build && /^projects\/(wemove-b0057|694105269612)\/locations\/europe-west4\/backends\/we-move\/builds\/[^/]+$/.test(build.name), 'Build servi hors du backend attendu.');
  requireState(build.state === 'READY', 'Build servi non prêt.');
  requireState(build.source?.codebase?.hash === commit, 'Le commit effectivement servi ne correspond pas au commit demandé.');
  requireState(repositoryPattern.test(build.source.codebase.repository||''), 'Dépôt du build servi inattendu.');
  return {build: build.name, commit, trafficPercent: 100};
}

// No IAM writes. Always recheck cloud state after a rollout attempt, including failure.
export async function runVerifiedDeployment(options, io) {
  const before = verifyCloudSnapshot(await io.readCloud());
  if (!options.commit) return {mode: 'check', before, public: await io.checkPublic()};
  const ci = verifyCiRuns(await io.readCi(options.commit),options.commit);
  let launchError;
  try { await io.launch(options.commit); } catch (error) { launchError = error; }
  let after;
  try { after = verifyCloudSnapshot(await io.readCloud()); }
  catch (error) { throw new Error('Contrôle après tentative de publication échoué : ' + error.message + (launchError ? ' Le lancement a également échoué.' : ' La version peut déjà être publiée ; intervention nécessaire.')); }
  if (launchError) throw new Error('La commande de publication a échoué ; les protections cloud ont été recontrôlées.');
  const {traffic, build} = await io.readPublished();
  const published = verifyPublishedBuild(traffic, build, options.commit);
  return {mode: 'deploy', ci, before, after, published, public: await io.checkPublic()};
}

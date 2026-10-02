import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  FileText,
  Download,
  Mail,
  Settings2,
  Plus,
  RefreshCw,
  LockKeyhole,
  CheckCircle2,
} from 'lucide-react';
import {
  request,
  billingPdf,
  downloadBillingExport,
  type InvoicePreparation,
  type TestBillingPayment,
} from '../services/crmService';
import type { CrmIdentity } from '../types/crm';
import { parisToday } from '../../shared/followUp.mjs';
type Settings = {
  revision: number;
  active: boolean;
  counter: number | null;
  prefix?: string;
  digits?: number;
  company: Record<string, string | boolean>;
  terms: {
    discount: string;
    latePenalty: string;
    exemption: string;
    defaultDays: number;
  };
  migration: { lastParcNumber: string; cutoverDate: string };
};
type Config = { state: Settings; issues: string[]; liveAllowed: boolean };
type Bill = {
  id: string;
  number: string;
  kind: string;
  invoiceId: string;
  revision: number;
  clientName: string;
  clientEmail: string;
  quoteReference: string;
  amountHT: number;
  amountTTC: number;
  creditedHT: number;
  creditedTTC: number;
  paidCents: number;
  dueCents: number;
  refundDueCents: number;
  status: string;
  dueDate: string;
  issueDate: string;
  creditNumber: string | null;
  payments: (TestBillingPayment & { kind: string })[];
  mails: {
    purpose?: string;
    id: string;
    state: string;
    createdAt: string;
    to: string;
    error?: string;
  }[];
};
type BillingListItem = Pick<Bill,'id'|'number'|'kind'|'clientName'|'status'|'amountTTC'|'dueCents'|'creditNumber'|'quoteReference'>;
type BillingSearchResult = {documents:BillingListItem[];page:number;pages:number;pageSize:number;total:number;totalDocuments:number};
type MailPreparation = {
  purpose: 'document' | 'reminder';
  dueCents?: number;
  revision: number;
  to: string;
  subject: string;
  message: string;
  configuration: { ready: boolean; from: string; provider: string };
  history: Bill['mails'];
};
const money = (c: number) =>
  (c / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const names: Record<string, string> = {
  facture: 'Facture complète',
  acompte: 'Facture d’acompte',
  solde: 'Facture de solde',
  avoir: 'Avoir',
};
const statuses: Record<string, string> = {
  a_regler: 'À régler',
  partiel: 'Partiellement réglée',
  regle: 'Réglée',
  retard: 'Échéance dépassée',
  credite: 'Créditée',
  avoir: 'Avoir',
};
const companyLabels: Record<string, string> = {
  name: 'Dénomination sociale',
  address: 'Adresse du siège',
  legalForm: 'Forme juridique',
  capital: 'Capital social (€)',
  siret: 'SIRET',
  vat: 'N° TVA intracommunautaire',
  registration: 'RCS et ville',
  email: 'E-mail société',
  phone: 'Téléphone',
  iban: 'IBAN',
  bic: 'BIC',
  insurance: 'Assurance professionnelle (mentions applicables)',
};
const base = '/api/crm/billing';
const dateLabel=(value:string)=>value?value.split('-').reverse().join('/'):'—';
export default function CrmBillingWorkbench({
  preparations,
  identity,
  dirtyPreparationId,
  initialDocumentId,
  initialLeadId,
}: {
  preparations: InvoicePreparation[];
  identity: CrmIdentity;
  dirtyPreparationId?: string;
  initialDocumentId?:string;
  initialLeadId?:string;
}) {
  const [config, setConfig] = useState<Config | null>(null),
    [draft, setDraft] = useState<Settings | null>(null),
    [documents, setDocuments] = useState<BillingListItem[]>([]),
    [page, setPage] = useState(1),
    [result, setResult] = useState<BillingSearchResult | null>(null),
    [sort,setSort] = useState('recent'),
    [listLoading,setListLoading] = useState(true),
    [listError,setListError] = useState(''),
    [listVersion,setListVersion] = useState(0),
    [selected, setSelected] = useState<Bill | null>(null),
    [tab, setTab] = useState('documents'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('all'),
    [sourceId, setSourceId] = useState(initialLeadId||''),
    [scopeId,setScopeId]=useState(initialLeadId),
    [kind, setKind] = useState('facture'),
    [rate, setRate] = useState('30'),
    [clientType, setClientType] = useState('particulier'),
    [mail, setMail] = useState<MailPreparation | null>(null),
    [correction, setCorrection] = useState(false);
  const lock = useRef(false),
    isManager = identity.role === 'gerant';
  const source = preparations.find((i) => i.id === sourceId);
  const sourceDirty=!!source&&source.id===dirtyPreparationId;
  const dirty =
    !!config && JSON.stringify(config.state) !== JSON.stringify(draft);
  const load = async () => {
    const c = await request<Config>(base + '/settings');
    setConfig(c);
    setDraft(structuredClone(c.state));
    setListVersion(v=>v+1);
  };
  useEffect(() => { void load().catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    if(!initialDocumentId)return;
    let alive=true;
    void request<{document:Bill}>(base+'/documents/'+encodeURIComponent(initialDocumentId)).then(r=>{if(alive)setSelected(r.document);}).catch(e=>{if(alive)setError(e.message);});
    return ()=>{alive=false;};
  }, [initialDocumentId]);
  useEffect(() => {
    const controller=new AbortController();let alive=true;
    setListLoading(true);setListError('');
    const timer=setTimeout(()=>{
      const params=new URLSearchParams({search,status:filter,sort,page:String(page),...(scopeId?{invoiceId:scopeId}:{})});
      void request<BillingSearchResult>(base+'/search?'+params,{signal:controller.signal}).then(r=>{
        if(!alive)return;setDocuments(r.documents);setResult(r);
      }).catch(e=>{if(alive)setListError(e.message);}).finally(()=>{if(alive)setListLoading(false);});
    },250);
    return ()=>{alive=false;clearTimeout(timer);controller.abort();};
  },[search,filter,sort,page,scopeId,listVersion]);
  const run = async (fn: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const replace = (d: Bill) => {
    setListVersion(v=>v+1);
    setSelected(d);
    setMail(null);
  };
  const fresh = async () => {
    const c = await request<Config>(base + '/settings');
    setConfig(c);
    if (!dirty) setDraft(structuredClone(c.state));
  };
  const open = (d: BillingListItem) =>
    void run(async () => {
      setSelected(
        (await request<{ document: Bill }>(base + '/documents/' + d.id))
          .document,
      );
      setMail(null);
      setCorrection(false);
    });
  const saveSettings = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (!draft || !config) return;
      const c = await request<Config>(base + '/settings', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'save',
          revision: config.state.revision,
          company: draft.company,
          terms: draft.terms,
          migration: draft.migration,
        }),
      });
      setConfig(c);
      setDraft(structuredClone(c.state));
      setNotice(
        'Paramètres enregistrés. Les documents déjà émis restent inchangés.',
      );
    });
  };
  const issue = (form: HTMLFormElement, preview: boolean) =>
    void run(async () => {
      if (!source || !config) return;
      if(sourceDirty)throw new Error("Enregistrez les modifications du brouillon avant de poursuivre.");
      const f = new FormData(form);
      const p = {
        revision: config.state.revision,
        invoiceId: source.id,
        sourceRevision: source.revision,
        kind,
        depositRate: Number(rate),
        dueDate: String(f.get('dueDate')),
        details: {
          clientType,
          serviceDate: String(f.get('serviceDate')),
          clientSiren: String(f.get('clientSiren') || ''),
          clientVat: String(f.get('clientVat') || ''),
          orderNumber: String(f.get('orderNumber') || ''),
          deliveryAddress: String(f.get('deliveryAddress') || ''),
        },
      };
      if (preview) {
        await billingPdf(base + '/preview', 'WE-MOVE-apercu-non-emis.pdf', p);
        return;
      }
      if (
        !window.confirm(
          'Émettre définitivement ' +
            names[kind].toLowerCase() +
            ' pour ' +
            source.clientName +
            ' ? Le numéro et le PDF seront figés. Consultez l’aperçu avant de confirmer.',
        )
      )
        return;
      const r = await request<{ document: Bill }>(base + '/documents', {
        method: 'POST',
        body: JSON.stringify({ ...p, confirm: true }),
      });
      replace(r.document);
      await fresh();
      setTab('documents');
      setNotice('Document émis et archivé. Aucun e-mail envoyé à ce stade.');
    });
  const credit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void run(async () => {
      if (!selected || !config) return;
      const ht = Number(f.get('amount'));
      if (Math.abs(ht * 100 - Math.round(ht * 100)) > 0.00001)
        throw Error('Deux décimales maximum.');
      const p = {
        revision: config.state.revision,
        kind: 'avoir',
        targetId: selected.id,
        documentRevision: selected.revision,
        creditHT: Math.round(ht * 100),
        reason: String(f.get('reason')),
      };
      if (f.get('intent') === 'preview') {
        await billingPdf(base + '/preview', 'WE-MOVE-apercu-avoir.pdf', p);
        return;
      }
      if (
        !window.confirm(
          'Émettre cet avoir de ' +
            money(p.creditHT) +
            ' HT sur ' +
            selected.number +
            ' ? La facture originale sera conservée.',
        )
      )
        return;
      const r = await request<{ document: Bill }>(base + '/documents', {
        method: 'POST',
        body: JSON.stringify({ ...p, confirm: true }),
      });
      await load();
      replace(r.document);
      setCorrection(false);
      setNotice(
        'Avoir émis. Tout remboursement éventuel doit être enregistré séparément sur la facture.',
      );
    });
  };
  const payment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form);
    void run(async () => {
      if (!selected) return;
      const amount = Number(f.get('amount'));
      if (Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001)
        throw Error('Deux décimales maximum.');
      const r = await request<{ document: Bill }>(
        base + '/documents/' + selected.id + '/payments',
        {
          method: 'PATCH',
          body: JSON.stringify({
            revision: selected.revision,
            action: 'add',
            kind: String(f.get('kind')),
            amountCents: Math.round(amount * 100),
            date: String(f.get('date')),
            method: String(f.get('method')),
            reference: String(f.get('reference')),
          }),
        },
      );
      replace(r.document);
      await fresh();
      form.reset();
      setNotice(
        'Mouvement enregistré. Aucun débit bancaire effectué par le CRM.',
      );
    });
  };
  if (!config || !draft)
    return (
      <div className="crm-surface p-6" role="status">
        {error || 'Chargement de la facturation…'}
        {error && (
          <button className="crm-quiet-action" onClick={() => void run(load)}>
            Réessayer
          </button>
        )}
      </div>
    );
  const active = config.state.active && config.liveAllowed;
  return (
    <section
      className="crm-live-billing space-y-5"
      aria-label="Facturation réelle"
    >
      <div className="crm-billing-banner">
        <div>
          {active ? <CheckCircle2 size={22} /> : <LockKeyhole size={22} />}
          <div>
            <strong>
              {active
                ? 'Votre facturation est active'
                : 'Préparons votre passage à la facturation'}
            </strong>
            <p>
              {active
                ? 'Documents figés, règlements suivis et historique conservé.'
                : 'Paramétrez votre société et vérifiez les aperçus. Aucun numéro réel ne sera attribué avant activation.'}
            </p>
          </div>
        </div>
        <button
          disabled={busy}
          className="crm-quiet-action"
          onClick={() =>
            void run(async () => {
              if (
                dirty &&
                !window.confirm(
                  'Actualiser et abandonner les modifications de paramètres non enregistrées ?',
                )
              )
                return;
              await load();
              setSelected(null);
              setMail(null);
            })
          }
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>
      <nav className="crm-billing-tabs" aria-label="Onglets de facturation">
        {[
          ['documents', 'Documents', FileText],
          ['issue', 'Émettre', Plus],
          ['export', 'Exporter', Download],
          ['settings', 'Paramètres', Settings2],
        ].map(([id, label, Icon]) => (
          <button
            key={String(id)}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(String(id))}
          >
            <Icon size={16} />
            {String(label)}
          </button>
        ))}
      </nav>
      {error && (
        <p role="alert" className="crm-billing-feedback text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="crm-billing-feedback text-emerald-700">
          {notice}
        </p>
      )}
      {tab === 'export' && (
        <form className="crm-surface border p-6" onSubmit={e=>{
          e.preventDefault();const form=new FormData(e.currentTarget);
          void run(async()=>{const count=await downloadBillingExport(String(form.get('kind')),String(form.get('from')),String(form.get('to')));setNotice(count ? `${count} ligne${count>1?'s':''} exportée${count>1?'s':''}.` : 'Aucune donnée réelle pour cette période. Le fichier contient uniquement les en-têtes.');});
        }}>
          <h3 className="text-xl font-semibold">Vos données, prêtes à transmettre</h3>
          <p className="text-sm text-slate-500 mt-2">Export CSV compatible Excel, sur tous les dossiers. Les simulations TEST sont exclues.</p>
          <fieldset disabled={busy} className="crm-live-fields mt-5">
            <label className="crm-span-full">Données à exporter<select name="kind" defaultValue="documents"><option value="documents">Factures et avoirs — par date d’émission</option><option value="payments">Règlements et remboursements — par date du mouvement</option></select></label>
            <label>Du<input type="date" name="from" required defaultValue={parisToday().slice(0,7)+'-01'} /></label>
            <label>Au<input type="date" name="to" required defaultValue={parisToday()} /></label>
            <p className="crm-span-full text-sm text-slate-500">Période inclusive, 366 jours maximum. Les soldes reflètent la situation actuelle ; les mouvements annulés restent identifiés avec un montant net retenu nul. Les avoirs et remboursements sont négatifs.</p>
            <button className="requests-primary" type="submit"><Download size={16}/>{busy?'Préparation…':'Télécharger le CSV'}</button>
          </fieldset>
          <p className="text-sm text-slate-500 mt-4">Document de suivi à transmettre à votre comptable. Cet export n’est pas un fichier FEC ni un rapprochement bancaire.</p>
        </form>
      )}
      {tab === 'settings' && (
        <form className="crm-surface border p-6" onSubmit={saveSettings}>
          <h3 className="text-xl font-semibold">
            Les informations de votre société
          </h3>
          <p className="text-sm text-slate-500 my-3">
            Ces informations apparaîtront sur vos prochains documents.
            Vérifiez-les avec vos documents comptables.
          </p>
          <fieldset disabled={busy || !isManager} className="crm-live-fields">
            {Object.entries(companyLabels).map(([k, label]) => (
              <label key={k}>
                {label}
                <input
                  maxLength={k === 'insurance' ? 1200 : 500}
                  value={String(draft.company[k] || '')}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      company: { ...draft.company, [k]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <label className="crm-span-full flex gap-2">
              <input
                type="checkbox"
                checked={!!draft.company.vatOnDebits}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    company: {
                      ...draft.company,
                      vatOnDebits: e.target.checked,
                    },
                  })
                }
              />
              Option TVA sur les débits
            </label>
            <h4 className="crm-span-full font-semibold mt-4">
              Conditions de règlement
            </h4>
            <label>
              Échéance par défaut (jours)
              <input
                type="number"
                min="0"
                max="30"
                value={draft.terms.defaultDays}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    terms: {
                      ...draft.terms,
                      defaultDays: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
            {[
              ['discount', 'Conditions d’escompte'],
              ['latePenalty', 'Pénalités de retard · clients professionnels'],
              ['exemption', 'Mention de TVA à 0 % · si applicable'],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                <input
                  maxLength={500}
                  value={String(draft.terms[k as keyof Settings['terms']])}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      terms: { ...draft.terms, [k]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <h4 className="crm-span-full font-semibold mt-4">
              Reprise depuis PARC
            </h4>
            <label>
              Dernier numéro de facture PARC
              <input
                disabled={config.state.active}
                value={draft.migration.lastParcNumber}
                maxLength={24}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    migration: {
                      ...draft.migration,
                      lastParcNumber: e.target.value,
                    },
                  })
                }
                placeholder="Le dernier numéro réellement émis"
              />
            </label>
            <label>
              Date de bascule
              <input
                type="date"
                disabled={config.state.active}
                value={draft.migration.cutoverDate}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    migration: {
                      ...draft.migration,
                      cutoverDate: e.target.value,
                    },
                  })
                }
              />
            </label>
            <p className="crm-span-full text-sm text-slate-500">
              La série est poursuivie à partir du dernier numéro PARC. Après
              activation, elle ne peut plus être réinitialisée. Factures et
              avoirs partagent cette séquence continue.
            </p>
            <button className="requests-primary" disabled={!dirty}>
              Enregistrer les paramètres
            </button>
          </fieldset>
          {config.issues.length > 0 && (
            <div className="crm-billing-feedback mt-5">
              <strong>À compléter avant activation</strong>
              <p className="text-sm mt-2">{config.issues.join(' · ')}</p>
            </div>
          )}
          {!config.state.active && (
            <p className="text-sm text-slate-500 mt-5">
              {config.liveAllowed
                ? 'La reprise peut être confirmée après vérification des paramètres.'
                : 'Activation réelle verrouillée : dernier numéro PARC et date de bascule à confirmer.'}
            </p>
          )}
          {isManager && !config.state.active && config.liveAllowed && (
            <button
              type="button"
              className="requests-primary mt-4"
              disabled={busy || dirty || !!config.issues.length}
              onClick={() =>
                void run(async () => {
                  if (
                    !window.confirm(
                      'Activer définitivement la facturation ? Vous confirmez le dernier numéro et l’arrêt de toute émission dans PARC.',
                    )
                  )
                    return;
                  const c = await request<Config>(base + '/settings', {
                    method: 'PUT',
                    body: JSON.stringify({
                      action: 'activate',
                      revision: config.state.revision,
                      confirm: true,
                      parcClosed: true,
                    }),
                  });
                  setConfig(c);
                  setDraft(structuredClone(c.state));
                  setNotice('Facturation activée.');
                })
              }
            >
              Confirmer la reprise et activer
            </button>
          )}
          <p className="text-xs text-slate-500 mt-6">
            L’envoi d’un PDF ne remplace pas la transmission réglementaire par
            une plateforme agréée. Le raccordement à cette plateforme reste à
            réaliser.
          </p>
        </form>
      )}
      {tab === 'issue' && (
        <form
          key={sourceId+String(source?.revision)}
          className="crm-surface border p-6"
          onSubmit={(e) => {
            e.preventDefault();
            issue(e.currentTarget, false);
          }}
        >
          <h3 className="text-xl font-semibold">
            Du brouillon au document définitif
          </h3>
          <p className="text-sm text-slate-500 my-3">
            Préparez un brouillon depuis un devis accepté dans la section
            ci-dessous, puis sélectionnez-le ici.
          </p>
          <fieldset className="crm-live-fields" disabled={busy}>
            <label className="crm-span-full">
              Brouillon à facturer
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                <option value="">Choisir un brouillon…</option>
                {preparations.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.clientName} · {i.quoteReference} ·{' '}
                    {money(Math.round(i.amountTTC * 100))}
                  </option>
                ))}
              </select>
            </label>
            {source && (
              <>
                <label>
                  Type de document
                  <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    {Object.entries(names)
                      .filter(([k]) => k !== 'avoir')
                      .map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                  </select>
                </label>
                {kind === 'acompte' && (
                  <label>
                    Acompte (%)
                    <input
                      type="number"
                      min="0.01"
                      max="99.99"
                      step="0.01"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </label>
                )}
                <label>
                  Type de client
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value)}
                  >
                    <option value="particulier">Particulier</option>
                    <option value="entreprise">Entreprise</option>
                  </select>
                </label>
                <label>
                  {kind === 'acompte'
                    ? 'Date du versement de l’acompte'
                    : 'Date de réalisation de la prestation'}
                  <input
                    required
                    name="serviceDate"
                    type="date"
                    max={parisToday()}
                  />
                </label>
                <label>
                  Échéance de règlement
                  <input
                    required
                    name="dueDate"
                    type="date"
                    min={parisToday()}
                    defaultValue={
                      source.dueDate ||
                      new Date(
                        Date.parse(parisToday()) +
                          config.state.terms.defaultDays * 86400000,
                      )
                        .toISOString()
                        .slice(0, 10)
                    }
                  />
                </label>
                {clientType === 'entreprise' && (
                  <>
                    <label>
                      SIREN client
                      <input
                        required
                        name="clientSiren"
                        pattern="[0-9]{9}"
                        maxLength={9}
                      />
                    </label>
                    <label>
                      TVA client (si redevable)
                      <input name="clientVat" maxLength={40} />
                    </label>
                    <label>
                      Bon de commande (si établi)
                      <input name="orderNumber" maxLength={120} />
                    </label>
                  </>
                )}
                <label className="crm-span-full">
                  Adresse de prestation, si différente
                  <input name="deliveryAddress" maxLength={500} />
                </label>
                <div className="crm-span-full flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="crm-quiet-action"
                    onClick={(e) => {
                      const form = e.currentTarget.form!;
                      if (form.reportValidity()) issue(form, true);
                    }}
                  >
                    <Download size={16} />
                    Vérifier l’aperçu PDF
                  </button>
                  <button className="requests-primary" disabled={!active||sourceDirty}>
                    Émettre définitivement
                  </button>
                </div>
                <p className="crm-span-full text-xs text-slate-500">
                  L’aperçu ne réserve aucun numéro. L’émission archive le PDF
                  original ; les corrections ultérieures passent par un avoir.
                </p>
              </>
            )}
          </fieldset>
        </form>
      )}
      {tab === 'documents' && (
        <>
          {scopeId&&<div className="crm-billing-feedback flex flex-wrap justify-between gap-3"><span>Facturation du dossier sélectionné</span><button className="crm-quiet-action" disabled={busy} onClick={()=>{setScopeId(undefined);setPage(1);setSelected(null);}}>Tous les dossiers</button></div>}
          <div className="crm-live-filters">
            <label>
              Rechercher
              <input
                value={search}
                maxLength={180}
                onChange={(e) => {setSearch(e.target.value);setPage(1);}}
                placeholder="Client, numéro ou devis…"
              />
            </label>
            <label>
              Statut
              <select
                aria-label="Statut des factures"
                value={filter}
                onChange={(e) => {setFilter(e.target.value);setPage(1);}}
              >
                <option value="all">Tous les statuts</option>
                <option value="refund">À rembourser</option>
                {Object.entries(statuses).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>Trier par<select aria-label="Tri des factures" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="recent">Plus récent</option><option value="oldest">Plus ancien</option><option value="client">Client, de A à Z</option><option value="due">Échéance</option></select></label>
            {(search||filter!=='all'||sort!=='recent')&&<button className="crm-quiet-action" onClick={()=>{setSearch('');setFilter('all');setSort('recent');setPage(1);}}>Réinitialiser les filtres</button>}
            <p className="text-xs text-slate-500">Recherche sur tous les documents{scopeId?' du dossier':''}.</p>
          </div>
          {listLoading ? <div className="crm-surface border p-6" role="status">Recherche des factures…</div> : listError ? <div className="crm-billing-feedback" role="alert">{listError}<button className="crm-quiet-action" onClick={()=>setListVersion(v=>v+1)}>Réessayer la recherche</button></div> : !documents.length ? (
            <div className="crm-surface border p-8"><FileText size={26}/><h3 className="font-semibold mt-3">{result?.totalDocuments ? 'Aucune facture ne correspond' : 'Vos factures apparaîtront ici'}</h3><p className="text-sm text-slate-500 mt-2">{result?.totalDocuments ? 'Modifiez les critères ou réinitialisez les filtres.' : 'Aucune facture réelle n’a été émise pour ce périmètre.'}</p></div>
          ) : <>
            <p className="text-sm text-slate-500" role="status">{result?.total} document{result?.total===1?'':'s'} · page {result?.page} sur {result?.pages}</p>
            <div className="crm-live-documents">{documents.map(d=><button disabled={busy} key={d.id} aria-pressed={selected?.id===d.id} onClick={()=>open(d)}><div><small>{d.number} · {names[d.kind]}</small><strong>{d.clientName}</strong><span>{statuses[d.status]}</span></div><div><strong>{money(d.amountTTC)}</strong><small>{d.kind==='avoir'?'Correction de '+d.creditNumber:'Reste : '+money(d.dueCents)}</small></div></button>)}</div>
            {result&&result.pages>1&&<nav aria-label="Pagination des factures" className="flex flex-wrap items-center justify-between gap-3"><button className="crm-quiet-action" disabled={busy||result.page<=1} onClick={()=>setPage(result.page-1)}>Précédent</button><span className="text-sm">Page {result.page} / {result.pages}</span><button className="crm-quiet-action" disabled={busy||result.page>=result.pages} onClick={()=>setPage(result.page+1)}>Suivant</button></nav>}
          </>}
          {selected && (
            <article className="crm-surface border p-6">
              <header className="flex justify-between flex-wrap gap-3">
                <div>
                  <p className="crm-eyebrow">
                    {names[selected.kind]} · {dateLabel(selected.issueDate)}
                  </p>
                  <h3 className="text-xl font-semibold mt-2">
                    {selected.number} — {selected.clientName}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    {selected.kind === 'avoir'
                      ? 'Facture corrigée : ' + selected.creditNumber
                      : 'Échéance : ' + dateLabel(selected.dueDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={busy}
                    className="crm-quiet-action"
                    onClick={() =>
                      void run(() =>
                        billingPdf(
                          base + '/documents/' + selected.id + '/pdf',
                          'WE-MOVE-' + selected.number + '.pdf',
                        ),
                      )
                    }
                  >
                    <Download size={16} />
                    PDF original
                  </button>
                  <button
                    disabled={busy}
                    className="crm-quiet-action"
                    onClick={() =>
                      void run(async () => {
                        setMail(
                          (
                            await request<{ preparation: MailPreparation }>(
                              base + '/documents/' + selected.id + '/mail',
                            )
                          ).preparation,
                        );
                        setCorrection(false);
                      })
                    }
                  >
                    <Mail size={16} />
                    Préparer l’envoi
                  </button>
                  {selected.kind !== 'avoir' && selected.dueCents > 0 && selected.dueDate < parisToday() && (
                    <button disabled={busy} className="requests-primary" onClick={() => void run(async () => {
                      setMail((await request<{preparation: MailPreparation}>(base + '/documents/' + selected.id + '/mail?purpose=reminder')).preparation);
                      setCorrection(false);
                    })}><Mail size={16} />Préparer une relance</button>
                  )}
                </div>
              </header>
              <div className="crm-billing-totals my-5">
                {[
                  ['Total TTC', selected.amountTTC],
                  ['Avoirs TTC', selected.creditedTTC],
                  ['Reste à régler', selected.dueCents],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{money(Number(value))}</strong>
                  </div>
                ))}
              </div>
              {selected.refundDueCents > 0 && (
                <p className="crm-billing-feedback">
                  À rembourser au client :{' '}
                  <strong>{money(selected.refundDueCents)}</strong>
                </p>
              )}
              {selected.kind !== 'avoir' && (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Règlements nets enregistrés : {money(selected.paidCents)}.
                    Le CRM constate vos mouvements ; il ne débite aucun compte
                    bancaire.
                  </p>
                  {(selected.dueCents > 0 || selected.refundDueCents > 0) && (
                    <form key={selected.id + 'pay'} onSubmit={payment}>
                      <fieldset disabled={busy} className="crm-live-fields">
                        <label>
                          Mouvement
                          <select name="kind">
                            {selected.dueCents > 0 && (
                              <option value="payment">Règlement reçu</option>
                            )}
                            {selected.refundDueCents > 0 && (
                              <option value="refund">
                                Remboursement effectué
                              </option>
                            )}
                          </select>
                        </label>
                        <label>
                          Montant (€)
                          <input
                            name="amount"
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            max={
                              Math.max(
                                selected.dueCents,
                                selected.refundDueCents,
                              ) / 100
                            }
                          />
                        </label>
                        <label>
                          Date du mouvement
                          <input
                            name="date"
                            type="date"
                            required
                            min={selected.issueDate}
                            max={parisToday()}
                            defaultValue={parisToday()}
                          />
                        </label>
                        <label>
                          Moyen
                          <select name="method">
                            {[
                              'virement',
                              'carte',
                              'cheque',
                              'especes',
                              'autre',
                            ].map((m) => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Référence du mouvement
                          <input name="reference" maxLength={120} />
                        </label>
                        <button className="requests-primary">
                          Enregistrer le mouvement
                        </button>
                      </fieldset>
                    </form>
                  )}
                  <div className="mt-5 space-y-3">
                    {selected.payments.map((p) => (
                      <div className="crm-test-payment" key={p.id}>
                        <div>
                          <strong>
                            {p.kind === 'refund'
                              ? 'Remboursement'
                              : 'Règlement'}{' '}
                            · {money(p.amountCents)}
                          </strong>
                          <p>
                            {dateLabel(p.date)} · {p.method} · {p.reference}
                          </p>
                          {p.reversedAt && <p>Annulé : {p.reversalReason}</p>}
                        </div>
                        {!p.reversedAt && (
                          <button
                            disabled={busy}
                            className="crm-quiet-action"
                            onClick={() => {
                              const reason = window.prompt(
                                'Motif d’annulation de ce mouvement enregistré ?',
                              );
                              if (reason?.trim())
                                void run(async () => {
                                  replace(
                                    (
                                      await request<{ document: Bill }>(
                                        base +
                                          '/documents/' +
                                          selected.id +
                                          '/payments',
                                        {
                                          method: 'PATCH',
                                          body: JSON.stringify({
                                            revision: selected.revision,
                                            action: 'reverse',
                                            paymentId: p.id,
                                            reason,
                                          }),
                                        },
                                      )
                                    ).document,
                                  );
                                  await fresh();
                                });
                            }}
                          >
                            Annuler la saisie
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {selected.creditedHT < selected.amountHT && (
                    <button
                      className="crm-quiet-action mt-5"
                      onClick={() => {
                        setCorrection(!correction);
                        setMail(null);
                      }}
                    >
                      Établir un avoir
                    </button>
                  )}
                </>
              )}
              {correction && (
                <form onSubmit={credit} className="crm-billing-correction mt-5">
                  <h4 className="font-semibold">
                    Corriger {selected.number} par un avoir
                  </h4>
                  <fieldset disabled={busy} className="crm-live-fields mt-3">
                    <label>
                      Montant à créditer HT (€)
                      <input
                        required
                        name="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={(selected.amountHT - selected.creditedHT) / 100}
                        defaultValue={
                          (selected.amountHT - selected.creditedHT) / 100
                        }
                      />
                    </label>
                    <label>
                      Motif de correction
                      <input required name="reason" maxLength={1000} />
                    </label>
                    <label>
                      Action
                      <select name="intent">
                        <option value="preview">Vérifier l’aperçu</option>
                        <option value="issue">Émettre l’avoir définitif</option>
                      </select>
                    </label>
                    <button className="requests-primary">Continuer</button>
                  </fieldset>
                </form>
              )}
              {mail && (
                <form
                  className="crm-billing-correction mt-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const resend =
                      new FormData(e.currentTarget).get('resend') === 'on';
                    void run(async () => {
                      if (
                        !window.confirm(
                          'Envoyer ' + selected.number + ' à ' + mail.to + ' ?',
                        )
                      )
                        return;
                      const r = await request<{ document: Bill }>(
                        base + '/documents/' + selected.id + '/mail',
                        {
                          method: 'POST',
                          body: JSON.stringify({
                            revision: mail.revision,
                            purpose: mail.purpose,
                            confirm: true,
                            confirmResend: resend,
                            subject: mail.subject,
                            message: mail.message,
                          }),
                          signal: AbortSignal.timeout(60000),
                        },
                      );
                      replace(r.document);
                      await fresh();
                      setNotice(
                        r.document.mails.at(-1)?.state === 'accepted'
                          ? 'E-mail accepté par Resend. La livraison dans la boîte client reste à confirmer.'
                          : 'Consultez le résultat dans l’historique des envois.',
                      );
                    });
                  }}
                >
                  <h4 className="font-semibold">{mail.purpose === 'reminder' ? 'Vérifier la relance de règlement' : 'Vérifier l’envoi'}</h4>
                  {mail.purpose === 'reminder' && <p className="crm-inline-notice mt-3">Reste à régler : <strong>{money(mail.dueCents || 0)}</strong>. Vérifiez les derniers règlements avant l’envoi. La facture originale sera jointe ; aucun frais supplémentaire n’est ajouté.</p>}
                  <p className="text-sm my-3">
                    De : {mail.configuration.from} · À : {mail.to}
                  </p>
                  <fieldset className="crm-live-fields" disabled={busy}>
                    <label className="crm-span-full">
                      Objet
                      <input
                        required
                        maxLength={180}
                        value={mail.subject}
                        onChange={(e) =>
                          setMail({ ...mail, subject: e.target.value })
                        }
                      />
                    </label>
                    <label className="crm-span-full">
                      Message
                      <textarea
                        rows={7}
                        required
                        maxLength={6000}
                        value={mail.message}
                        onChange={(e) =>
                          setMail({ ...mail, message: e.target.value })
                        }
                      />
                    </label>
                    {mail.history.some((m) => m.state === 'accepted') && (
                      <label className="crm-span-full flex gap-2">
                        <input required type="checkbox" name="resend" />
                        Je confirme le renvoi de ce document déjà envoyé.
                      </label>
                    )}
                    <button
                      className="requests-primary"
                      disabled={
                        !mail.configuration.ready ||
                        mail.configuration.provider !== 'resend'
                      }
                    >
                      {mail.purpose === 'reminder' ? 'Envoyer la relance au client' : 'Envoyer le PDF au client'}
                    </button>
                  </fieldset>
                </form>
              )}
              {selected.mails.length > 0 && (
                <div className="mt-5">
                  <h4 className="font-semibold mb-3">Historique des envois</h4>
                  {selected.mails.map((m) => (
                    <div className="text-sm py-2" key={m.id}>
                      {m.purpose === 'reminder' ? 'Relance de règlement · ' : ''}{m.createdAt.slice(0, 16).replace('T', ' ')} · {m.to} ·{' '}
                      {
                        {
                          sending: 'En cours',
                          accepted: 'Accepté par Resend',
                          failed: 'Refusé',
                          uncertain: 'À vérifier chez Resend',
                        }[m.state]
                      }
                      {m.error ? ' · ' + m.error : ''}
                      {isManager&&['sending','uncertain'].includes(m.state)&&<form className="crm-live-fields mt-3" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void run(async()=>{if(!window.confirm('Confirmer le résultat vérifié dans Resend ? Aucun e-mail ne sera envoyé par cette action.'))return;replace((await request<{document:Bill}>(base+'/documents/'+selected.id+'/mail/'+m.id,{method:'PATCH',body:JSON.stringify({revision:selected.revision,confirm:true,outcome:f.get('outcome'),evidence:f.get('evidence')})})).document);await fresh();setNotice('Résultat d’envoi rapproché. La vérification reste tracée.');});}}><label>Résultat constaté chez Resend<select name="outcome"><option value="accepted">Envoi accepté</option><option value="failed">Envoi refusé / non exécuté</option></select></label><label>Référence et vérification Resend<input required name="evidence" maxLength={500}/></label><button disabled={busy} className="crm-quiet-action">Enregistrer le rapprochement</button></form>}
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}
        </>
      )}
    </section>
  );
}

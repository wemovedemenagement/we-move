import { useEffect, useState, useRef, type FormEvent } from 'react';
import {
  RotateCcw,
  FlaskConical,
  Download,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  fetchInvoiceTestState,
  changeInvoiceTestState,
  fetchTestBillingDocuments,
  issueTestBillingDocument,
  saveTestBillingPayment,
  downloadTestBillingPdf,
  type InvoiceTestState,
  type TestBillingDocument,
} from '../services/crmService';
import { parisToday } from '../../shared/followUp.mjs';
const money = (cents: number) =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const kinds = {
  facture: 'Facture complète',
  acompte: 'Acompte',
  solde: 'Solde',
};
const statusLabels = {
  a_regler: 'À régler en test',
  partiel: 'Partiellement réglé en test',
  regle: 'Réglé en test',
};
export default function CrmInvoiceTests({
  invoiceId,
  clientName,
  sourceDirty = false,
}: {
  invoiceId?: string;
  clientName?: string;
  sourceDirty?: boolean;
}) {
  const [state, setState] = useState<InvoiceTestState | null>(null),
    [documents, setDocuments] = useState<TestBillingDocument[]>([]),
    [selectedId, setSelectedId] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [confirm, setConfirm] = useState(false),
    [history, setHistory] = useState(false),
    [kind, setKind] = useState<TestBillingDocument['kind']>('facture'),
    [rate, setRate] = useState('30');
  const lock = useRef(false);
  const selected = documents.find((d) => d.id === selectedId),
    archived = !!selected && selected.session !== state?.session;
  const related = documents.filter(
    (d) => d.session === state?.session && d.invoiceId === invoiceId,
  );
  const available: TestBillingDocument['kind'][] = related.some(
    (d) => d.kind === 'facture' || d.kind === 'solde',
  )
    ? []
    : related.some((d) => d.kind === 'acompte')
      ? ['solde']
      : ['facture', 'acompte'];
  const effectiveKind = available.includes(kind)
    ? kind
    : available[0] || 'facture';
  async function load() {
    const [s, d] = await Promise.all([
      fetchInvoiceTestState(),
      fetchTestBillingDocuments(),
    ]);
    setState(s);
    setDocuments(d);
  }
  useEffect(() => {
    void load().catch((e) => setError(e.message));
  }, []);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action impossible.');
      try {
        await load();
      } catch {}
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const replace = (doc: TestBillingDocument) =>
    setDocuments((old) => [doc, ...old.filter((d) => d.id !== doc.id)]);
  const create = () =>
    run(async () => {
      if (!state || !invoiceId) return;
      const result = await issueTestBillingDocument(
        state,
        invoiceId,
        effectiveKind,
        Number(rate),
      );
      setState(result.state);
      replace(result.document);
      setSelectedId(result.document.id);
      setHistory(false);
      setNotice('Document de test créé. Aucun envoi effectué.');
    });
  const reset = () =>
    run(async () => {
      if (!state) return;
      setState(await changeInvoiceTestState(state, 'reset'));
      setSelectedId('');
      setConfirm(false);
      setHistory(false);
      setNotice(
        'Nouvelle session ouverte. Les essais précédents restent archivés.',
      );
    });
  const pay = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget,
      values = new FormData(form);
    void run(async () => {
      if (!selected) return;
      const amount = Number(values.get('amount'));
      if (
        !Number.isFinite(amount) ||
        Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001
      )
        throw new Error('Indiquez un montant avec deux décimales maximum.');
      replace(
        await saveTestBillingPayment(selected, {
          action: 'add',
          amountCents: Math.round(amount * 100),
          date: String(values.get('date')),
          method: String(values.get('method')),
          reference: String(values.get('reference')),
        }),
      );
      form.reset();
      setNotice('Règlement simulé enregistré. Aucun encaissement réel.');
    });
  };
  const visible = documents.filter(
    (d) => history || d.session === state?.session,
  );
  return (
    <section
      className="crm-billing-lab crm-surface border p-5 sm:p-6"
      aria-label="Essais de facturation"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="crm-eyebrow flex items-center gap-2">
            <FlaskConical size={17} />
            VOTRE ESPACE D’ESSAI
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            Tester la facturation, simplement.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Documents et règlements simulés uniquement. Chaque PDF est marqué
            TEST, sans valeur comptable. Aucun e-mail n’est envoyé.
          </p>
        </div>
        <button
          disabled={busy}
          className="crm-quiet-action"
          onClick={() => void run(load)}
        >
          <RefreshCw size={15} />
          Actualiser les essais
        </button>
      </header>
      {state && (
        <>
          <div className="crm-billing-session">
            <span>
              Session <strong>{state.session}</strong>
            </span>
            <span>
              Prochain numéro{' '}
              <strong className="font-mono">
                TEST-S{state.session}-
                {String(state.counter + 1).padStart(5, '0')}
              </strong>
            </span>
            <button
              disabled={busy}
              className="crm-quiet-action"
              onClick={() => setConfirm(true)}
            >
              <RotateCcw size={14} />
              Réinitialiser les essais
            </button>
          </div>
          {confirm && (
            <div className="rounded-xl border p-4 mb-5">
              <p className="text-sm">
                Ouvrir une nouvelle session à 00001 ? Les PDF et règlements
                existants seront conservés en lecture seule. Les brouillons
                restent disponibles.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  disabled={busy}
                  className="requests-primary"
                  onClick={() => void reset()}
                >
                  Confirmer la remise à zéro
                </button>
                <button
                  disabled={busy}
                  className="crm-quiet-action"
                  onClick={() => setConfirm(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          <div className="crm-billing-create">
            {invoiceId ? (
              <>
                <p className="w-full text-sm font-medium">
                  Brouillon sélectionné : {clientName}
                </p>
                <label>
                  Document à simuler
                  <select
                    value={effectiveKind}
                    disabled={busy || !available.length || confirm}
                    onChange={(e) => setKind(e.target.value as typeof kind)}
                  >
                    {!available.length && <option value="facture">Dossier déjà facturé en test</option>}
                    {available.map((k) => (
                      <option key={k} value={k}>
                        {kinds[k]}
                      </option>
                    ))}
                  </select>
                </label>
                {effectiveKind === 'acompte' && (
                  <label>
                    Acompte (%)
                    <input
                      type="number"
                      min="0.01"
                      max="99.99"
                      step="0.01"
                      value={rate}
                      disabled={busy || confirm}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </label>
                )}
                <button
                  disabled={busy || !available.length || confirm || sourceDirty}
                  className="requests-primary"
                  onClick={() => void create()}
                >
                  Créer le document de test
                  <ArrowRight size={16} />
                </button>
                <p className="text-xs text-slate-500 w-full">
                  {sourceDirty
                    ? 'Enregistrez les modifications du brouillon avant de créer le document de test.'
                    : available.length
                      ? 'À partir du brouillon sélectionné et enregistré ci-dessous. Les montants sont figés dans le document créé.'
                      : 'Ce dossier a déjà une facture complète ou un solde dans cette session.'}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Sélectionnez un brouillon ci-dessous pour tester une facture ou
                un acompte.
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-between gap-3 my-5">
            <h4 className="font-semibold">Documents de test</h4>
            <label className="text-xs flex items-center gap-2">
              <input
                type="checkbox"
                checked={history}
                onChange={(e) => setHistory(e.target.checked)}
              />
              Inclure les sessions archivées
            </label>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Les 200 simulations les plus récentes sont accessibles ici.
          </p>
          {!visible.length ? (
            <p className="crm-work-empty">
              Aucun document de test dans cette session.
            </p>
          ) : (
            <div className="crm-test-documents">
              {visible.map((d) => (
                <button
                  key={d.id}
                  disabled={busy}
                  aria-pressed={selectedId === d.id}
                  onClick={() => {
                    setSelectedId(d.id);
                    setError('');
                    setNotice('');
                  }}
                >
                  <span className="text-xs text-slate-500">
                    {d.number}
                    {d.session !== state.session ? ' · Archivé' : ''}
                  </span>
                  <strong>{d.clientName}</strong>
                  <span>
                    {kinds[d.kind]} · {money(d.amountTTC)}
                  </span>
                  <small>{statusLabels[d.status]}</small>
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="crm-test-detail">
              <header className="flex flex-wrap justify-between gap-3">
                <div>
                  <h4 className="font-semibold">{selected.number}</h4>
                  <p className="text-sm text-slate-500 mt-2">
                    {selected.clientName} · {selected.quoteReference}
                  </p>
                </div>
                <button
                  disabled={busy}
                  className="crm-quiet-action"
                  onClick={() =>
                    void run(() => downloadTestBillingPdf(selected.id, selected.number))
                  }
                >
                  <Download size={16} />
                  Télécharger le PDF TEST
                </button>
              </header>
              <div className="crm-billing-totals">
                {[
                  ['Montant TTC', selected.amountTTC],
                  ['Règlements simulés', selected.paidCents],
                  ['Reste à régler en test', selected.dueCents],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{money(value as number)}</strong>
                  </div>
                ))}
              </div>
              {selected.kind === 'solde' && (
                <p className="text-xs text-slate-500 mb-4">
                  L’acompte {selected.depositNumber} reste suivi séparément : un
                  acompte simulé n’est pas nécessairement réglé.
                </p>
              )}
              {archived ? (
                <p className="text-sm text-slate-500">
                  Session archivée : documents et règlements consultables en
                  lecture seule.
                </p>
              ) : (
                selected.dueCents > 0 && (
                  <form key={selected.id} onSubmit={pay}>
                    <h5 className="text-sm font-semibold mb-3">
                      Ajouter un règlement simulé
                    </h5>
                    <fieldset
                      disabled={busy}
                      className="crm-billing-payment-fields"
                    >
                      <label>
                        Montant (€)
                        <input
                          required
                          name="amount"
                          type="number"
                          min="0.01"
                          max={selected.dueCents / 100}
                          step="0.01"
                        />
                      </label>
                      <label>
                        Date
                        <input
                          required
                          name="date"
                          type="date"
                          defaultValue={parisToday()}
                        />
                      </label>
                      <label>
                        Moyen
                        <select name="method">
                          <option value="virement">Virement</option>
                          <option value="carte">Carte</option>
                          <option value="cheque">Chèque</option>
                          <option value="especes">Espèces</option>
                          <option value="autre">Autre</option>
                        </select>
                      </label>
                      <label>
                        Référence facultative
                        <input name="reference" maxLength={120} />
                      </label>
                      <button className="requests-primary">
                        Enregistrer le règlement de test
                      </button>
                    </fieldset>
                  </form>
                )
              )}
              <div className="mt-5 space-y-3">
                {selected.payments.map((p) => (
                  <article key={p.id} className="crm-test-payment">
                    <div>
                      <strong>{money(p.amountCents)}</strong>
                      <span>
                        {' '}
                        · {p.date} · {p.method}
                      </span>
                      {p.reference && <p>{p.reference}</p>}
                      {p.reversedAt && (
                        <p className="text-slate-500">
                          Annulé : {p.reversalReason}
                        </p>
                      )}
                    </div>
                    {!p.reversedAt && !archived && (
                      <button
                        disabled={busy}
                        className="crm-quiet-action"
                        onClick={() => {
                          const reason = window.prompt(
                            'Pourquoi annuler ce règlement de test ?',
                          );
                          if (reason?.trim())
                            void run(async () => {
                              replace(
                                await saveTestBillingPayment(selected, {
                                  action: 'reverse',
                                  paymentId: p.id,
                                  reason,
                                }),
                              );
                              setNotice(
                                'Règlement de test annulé, historique conservé.',
                              );
                            });
                        }}
                      >
                        Annuler ce règlement
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-4 text-sm text-emerald-700">
          {notice}
        </p>
      )}
    </section>
  );
}

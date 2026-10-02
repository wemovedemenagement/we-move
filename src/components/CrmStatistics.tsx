import { useState } from 'react';
import { Download } from 'lucide-react';
import type { QuoteLead } from '../types/crm';
import { channelName, requestStatus } from './CrmRequests';
import { parisToday } from '../../shared/followUp.mjs';
export default function CrmStatistics({ leads }: { leads: QuoteLead[] }) {
  const [from, setFrom] = useState(() => parisToday().slice(0, 7) + '-01'),
    [to, setTo] = useState(parisToday());
  const rows = leads.filter((l) => {
    if (!Number.isFinite(Date.parse(l.createdAt))) return false;
    const d = parisToday(new Date(l.createdAt));
    return (!from || d >= from) && (!to || d <= to);
  });
  const accepted = rows.filter((l) =>
    ['confirme', 'termine'].includes(l.status),
  ).length;
  const sources = Object.entries(
    rows.reduce<Record<string, { total: number; accepted: number }>>(
      (out, l) => {
        const label = channelName(l.source);
        out[label] ||= { total: 0, accepted: 0 };
        out[label].total++;
        if (['confirme', 'termine'].includes(l.status)) out[label].accepted++;
        return out;
      },
      {},
    ),
  ).sort((a, b) => b[1].total - a[1].total);
  const exportCsv = () => {
    const csv =
      '\ufeff' +
      [
        ['Source', 'Demandes reçues', 'Dossiers acceptés ou terminés'],
        ...sources.map(([s, n]) => [s, n.total, n.accepted]),
      ]
        .map((row) =>
          row.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(';'),
        )
        .join('\r\n');
    const u = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = u;
    a.download = 'we-move-statistiques.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  };
  return (
    <section className="space-y-5">
      <header className="crm-worklist-head">
        <div>
          <span className="crm-eyebrow">COMPRENDRE POUR MIEUX PILOTER</span>
          <h2>Votre activité, en chiffres</h2>
          <p>
            Statuts actuels des demandes reçues sur la période sélectionnée.
          </p>
        </div>
        <button
          disabled={!rows.length || (!!from && !!to && from > to)}
          className="crm-quiet-action"
          onClick={exportCsv}
        >
          <Download size={16} />
          Exporter le bilan
        </button>
      </header>
      <div className="crm-planning-toolbar">
        <label>
          Reçues depuis le
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Jusqu’au
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button
          className="crm-quiet-action"
          onClick={() => {
            setFrom('');
            setTo('');
          }}
        >
          Toute la période
        </button>
      </div>
      {from && to && from > to && (
        <p role="alert" className="text-rose-700">
          La date de fin doit suivre la date de début.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Demandes reçues', rows.length],
          ['Acceptées ou terminées', accepted],
          [
            'Part des demandes acceptées',
            rows.length
              ? Math.round((accepted / rows.length) * 100) + ' %'
              : '—',
          ],
        ].map(([label, value]) => (
          <div key={label} className="crm-surface border p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <strong className="mt-4 block text-3xl">{value}</strong>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="crm-worklist">
          <div className="crm-worklist-head">
            <h3>Répartition des dossiers</h3>
          </div>
          {Object.entries(requestStatus).map(([status, label]) => {
            const n = rows.filter((l) => l.status === status).length;
            return (
              <div className="px-6 pb-5" key={status}>
                <div className="flex justify-between gap-4 text-sm">
                  <span>{label}</span>
                  <strong>{n}</strong>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#087eaa]"
                    style={{
                      width: `${rows.length ? (n / rows.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="crm-worklist">
          <div className="crm-worklist-head">
            <h3>Origine des demandes</h3>
          </div>
          {sources.length ? (
            sources.map(([source, n]) => (
              <div key={source} className="crm-work-row">
                <strong className="flex-1 text-sm">{source}</strong>
                <span className="text-sm">
                  {n.total} demande{n.total > 1 ? 's' : ''}
                </span>
                <span className="text-xs text-slate-500">
                  {n.accepted} acceptée{n.accepted > 1 ? 's' : ''}
                </span>
              </div>
            ))
          ) : (
            <p className="p-6 text-sm text-slate-500">
              Aucune demande sur cette période.
            </p>
          )}
          <p className="p-6 text-xs leading-6 text-slate-500">
            Les canaux correspondent aux sources enregistrées dans les demandes.
            Ce bilan ne mesure ni les dépenses publicitaires ni les
            encaissements.
          </p>
        </div>
      </div>
    </section>
  );
}

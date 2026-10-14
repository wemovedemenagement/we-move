import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X, CalendarDays } from 'lucide-react';
import {
  fetchPlanning,
  saveCrmBooking,
  type PlanningData,
} from '../services/crmService';
import type { QuoteLead } from '../types/crm';
export default function CrmBookingEditor({
  lead,
  onClose,
  onSaved,
}: {
  lead: QuoteLead;
  onClose: () => void;
  onSaved: (lead: QuoteLead) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    lock = useRef(false);
  const [data, setData] = useState<PlanningData | null>(null),
    [start, setStart] = useState(lead.scheduledTime || ''),
    [end, setEnd] = useState(''),
    [ids, setIds] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [dirty, setDirty] = useState(false),
    [success, setSuccess] = useState('');
  useUnsavedChanges(dirty||busy);
  const booking = data?.bookings.find((b) => b.leadId === lead.id);
  const close = () => {
    if (
      !busy &&
      (!dirty || window.confirm('Fermer sans enregistrer la réservation ?'))
    )
      onClose();
  };
  const load = async () => {
    try {
      const result = await fetchPlanning();
      setData(result);
      const b = result.bookings.find((b) => b.leadId === lead.id);
      if (b && !b.cancelled) {
        setStart(b.start);
        setEnd(b.end);
        setIds(b.resourceIds);
      }
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible.');
    }
  };
  useEffect(() => {
    dialog.current?.showModal();
    void load();
  }, []);
  const overlaps =
    data?.bookings.filter(
      (b) =>
        !b.cancelled &&
        b.leadId !== lead.id &&
        start &&
        end &&
        b.start < end &&
        b.end > start,
    ) || [];
  const unavailable = new Set(overlaps.flatMap((b) => b.resourceIds));
  const save = async (cancel = false) => {
    if (!data || lock.current) return;
    if (
      cancel &&
      !window.confirm('Annuler cette réservation et libérer ses ressources ?')
    )
      return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await saveCrmBooking(
        lead.id,
        cancel
          ? { revision: booking?.revision || 0, cancel: true }
          : { revision: booking?.revision || 0, start, end, resourceIds: ids },
      );
      setDirty(false);
      setSuccess(cancel ? 'Réservation annulée.' : 'Mission enregistrée.');
      onSaved(result.lead);
      setData({
        ...data,
        bookings: [
          ...data.bookings.filter((b) => b.leadId !== lead.id),
          result.booking,
        ],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <dialog
      ref={dialog}
      className="crm-request-dialog request-edit-dialog"
      aria-labelledby="booking-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <span className="crm-eyebrow">MISSION · {lead.fullName}</span>
          <h2 id="booking-title" className="mt-2">
            Organiser le déménagement
          </h2>
        </div>
        <button aria-label="Fermer" disabled={busy} onClick={close}>
          <X size={21} />
        </button>
      </header>
      <p className="mt-4 text-sm text-slate-500">
        Réservez le créneau complet, trajets et préparation compris. Horaires de
        Paris.
      </p>
      {!booking && lead.scheduledTime && (
        <p className="mt-3 text-sm text-amber-700">
          Ancienne affectation : {lead.assignedTruckName}. Confirmez-la avec les
          ressources du registre pour activer le contrôle des conflits.
        </p>
      )}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save();
        }}
        onChange={() => {
          setDirty(true);
          setSuccess('');
        }}
        className="mt-5 space-y-5"
      >
        <fieldset disabled={busy || !data} className="crm-resource-fields">
          <label>
            Début
            <input
              required
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            Fin
            <input
              required
              type="datetime-local"
              min={start}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
          <legend>Ressources à réserver</legend>
          {data?.registry.resources
            .filter((r) => r.active || ids.includes(r.id))
            .map((r) => (
              <label key={r.id} className="crm-resource-choice">
                <input
                  type="checkbox"
                  checked={ids.includes(r.id)}
                  disabled={
                    (!r.active || unavailable.has(r.id)) && !ids.includes(r.id)
                  }
                  onChange={(e) =>
                    setIds((old) =>
                      e.target.checked
                        ? [...old, r.id]
                        : old.filter((id) => id !== r.id),
                    )
                  }
                />
                <span>
                  {r.name}
                  <small>
                    {r.kind === 'person'
                      ? 'Équipier'
                      : r.kind === 'lift'
                        ? 'Monte-meubles'
                        : 'Véhicule'}
                    {!r.active
                      ? ' · désactivé'
                      : unavailable.has(r.id)
                        ? ' · déjà réservé sur ce créneau'
                        : ''}
                  </small>
                </span>
              </label>
            ))}
          {data && !data.registry.resources.length && (
            <p>
              Ajoutez vos ressources dans « Équipes et flotte » avant de
              planifier.
            </p>
          )}
        </fieldset>
        {error && (
          <div role="alert" className="text-sm text-rose-700">
            {error}
            <button
              type="button"
              className="crm-quiet-action mt-2"
              disabled={busy}
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm('Recharger et abandonner vos modifications ?')
                ) {
                  setDirty(false);
                  void load();
                }
              }}
            >
              Recharger la réservation
            </button>
          </div>
        )}
        {success && (
          <p role="status" className="text-emerald-700">
            {success}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy || !data || !ids.length}
            className="requests-primary"
          >
            <CalendarDays size={16} />
            {busy ? 'Enregistrement…' : 'Confirmer la réservation'}
          </button>
          <button
            type="button"
            className="crm-quiet-action"
            disabled={busy}
            onClick={close}
          >
            Retour au dossier
          </button>
          {booking && !booking.cancelled && (
            <button
              type="button"
              className="crm-quiet-action"
              disabled={busy}
              onClick={() => void save(true)}
            >
              Annuler la réservation
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}

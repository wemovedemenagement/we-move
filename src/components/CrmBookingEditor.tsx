import {resourceAbsence,absenceLabels} from '../../shared/resourceAvailability.mjs';
import CrmVisitPhotos from './CrmVisitPhotos';
import CrmVisitReport from './CrmVisitReport';
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  X,
  CalendarDays,
  Truck,
  Users,
  MapPin,
  Phone,
  Box,
  ClipboardCheck,
  Download,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import {
  fetchPlanning,
  fetchCrmDossier,
  saveCrmBooking,
  downloadCrmPdf,
  type PlanningData,
  type CrmDossier,
  type MoveOperations,
  type CrmPdfType,
} from "../services/crmService";
import type { QuoteLead } from "../types/crm";
import {
  emptyMoveOperations,
  parkingStates,
} from "../../shared/moveOperations.mjs";
import { movePreparation } from "../../shared/movePreparation.mjs";
import { requestCity } from "../../shared/requestCity.mjs";

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
    lock = useRef(false),
    alive = useRef(true);
  const [data, setData] = useState<PlanningData | null>(null),
    [dossier, setDossier] = useState<CrmDossier | null>(null);
  const [start, setStart] = useState(lead.scheduledTime || ""),
    [end, setEnd] = useState(""),
    [ids, setIds] = useState<string[]>([]);
  const [operations, setOperations] = useState<MoveOperations>(
    () => emptyMoveOperations() as MoveOperations,
  );
  const [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(""),
    [documentError, setDocumentError] = useState(""),
    [dirty, setDirty] = useState(false),
    [success, setSuccess] = useState("");
  useUnsavedChanges(dirty || busy);
  const booking = data?.bookings.find((b) => b.leadId === lead.id);
  const close = () => {
    if (
      !busy &&
      (!dirty ||
        window.confirm("Fermer sans enregistrer la fiche déménagement ?"))
    )
      onClose();
  };
  const load = async () => {
    setLoading(true);
    const [planning, documents] = await Promise.allSettled([
      fetchPlanning(),
      fetchCrmDossier(lead.id),
    ]);
    if (!alive.current) return;
    if (planning.status === "fulfilled") {
      const b = planning.value.bookings.find((b) => b.leadId === lead.id);
      setData(planning.value);
      setStart(b && !b.cancelled ? b.start : lead.scheduledTime || "");
      setEnd(b && !b.cancelled ? b.end : "");
      setIds(b && !b.cancelled ? b.resourceIds : []);
      setOperations({
        ...emptyMoveOperations(),
        ...b?.operations,
      } as MoveOperations);
      setDirty(false);
      setError("");
      setSuccess("");
    } else
      setError(
        planning.reason instanceof Error
          ? planning.reason.message
          : "Chargement de la mission impossible.",
      );
    if (documents.status === "fulfilled") {
      setDossier(documents.value);
      setDocumentError("");
    } else {
      setDossier(null);
      setDocumentError(
        "Le devis et ses documents sont temporairement indisponibles. La réservation reste accessible.",
      );
    }
    setLoading(false);
  };
  useEffect(() => {
    alive.current = true;
    dialog.current?.showModal();
    void load();
    return () => {
      alive.current = false;
    };
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
  const unavailable = new Set([...overlaps.flatMap((b) => b.resourceIds),...(data?.registry.resources.filter(r=>resourceAbsence(r,start,end)).map(r=>r.id)||[])]);
  const issues = data
    ? movePreparation(
        lead,
        { resourceIds: ids, cancelled: false, operations },
        data.registry,
      )
    : [];
  const selectedUnavailable = ids.some(
    (id) =>
      unavailable.has(id) ||
      !data?.registry.resources.some((r) => r.id === id && r.active),
  );
  const fields = dossier?.quote?.document?.fields || {};
  const changeOperation = <K extends keyof MoveOperations>(
    key: K,
    value: MoveOperations[K],
  ) => setOperations((current) => ({ ...current, [key]: value }));
  const save = async (cancel = false) => {
    if (!data || lock.current || loading) return;
    if (
      cancel &&
      !window.confirm(
        "Annuler cette réservation et libérer ses ressources ? Les dernières consignes enregistrées seront conservées. Les modifications non enregistrées seront abandonnées.",
      )
    )
      return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await saveCrmBooking(
        lead.id,
        cancel
          ? { revision: booking?.revision || 0, cancel: true }
          : {
              revision: booking?.revision || 0,
              start,
              end,
              resourceIds: ids,
              operations,
            },
      );
      setDirty(false);
      setSuccess(
        cancel
          ? "Réservation annulée. Consignes conservées."
          : "Fiche déménagement enregistrée.",
      );
      setData({
        ...data,
        bookings: [
          ...data.bookings.filter((b) => b.leadId !== lead.id),
          result.booking,
        ],
      });
      setOperations({
        ...emptyMoveOperations(),
        ...result.booking.operations,
      } as MoveOperations);
      if (cancel) {
        setStart("");
        setEnd("");
        setIds([]);
      }
      onSaved(result.lead);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const download = async (type: CrmPdfType) => {
    if (!dossier?.quote || downloading) return;
    setDownloading(true);
    setDocumentError("");
    try {
      await downloadCrmPdf(dossier.quote.id, type);
    } catch (e) {
      setDocumentError(
        e instanceof Error ? e.message : "Document indisponible.",
      );
    } finally {
      setDownloading(false);
    }
  };
  return (
    <dialog
      ref={dialog}
      className="crm-request-dialog request-edit-dialog crm-mission-dialog"
      aria-labelledby="booking-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <header className="mission-header">
        <div>
          <span className="crm-eyebrow">FICHE DÉMÉNAGEMENT</span>
          <h2 id="booking-title">{lead.fullName}</h2>
          <p>Une mission, toutes les informations utiles.</p>
        </div>
        <button
          type="button"
          aria-label="Fermer la mission"
          disabled={busy}
          onClick={close}
        >
          <X size={21} />
        </button>
      </header>
      <div className="mission-overview">
        <div>
          <strong>{requestCity(lead.departureAddress)}</strong>
          <ArrowRight size={18} />
          <strong>{requestCity(lead.arrivalAddress)}</strong>
        </div>
        <p>
          <span>
            <Box size={15} />
            {lead.volume ? `${lead.volume} m³` : "Volume à préciser"}
          </span>
          {lead.phone && (
            <a href={"tel:" + lead.phone}>
              <Phone size={15} />
              {lead.phone}
            </a>
          )}
          {fields.formula && <span>{fields.formula}</span>}
        </p>
      </div>
      {loading && (
        <p role="status" className="mission-hint">
          Chargement de la mission…
        </p>
      )}
      {!loading && data && (
        <details className="mission-preparation">
          <summary>
            <ClipboardCheck size={18} />
            {issues.length
              ? `${issues.length} points à vérifier`
              : "Points de préparation renseignés"}
            <span>{dirty ? "Saisie non enregistrée" : "Voir le détail"}</span>
          </summary>
          <ul>
            {issues.length ? (
              issues.map((issue) => <li key={issue}>{issue}</li>)
            ) : (
              <li>
                Vérifiez les consignes et les moyens avec l’équipe avant le
                départ.
              </li>
            )}
          </ul>
        </details>
      )}
      <CrmVisitReport lead={lead}/>
      <details className="technical-visit-access"><summary>Photos de la visite</summary><CrmVisitPhotos leadId={lead.id} readOnly/></details>
      <section className="mission-addresses" aria-label="Adresses et accès">
        {(["departure", "arrival"] as const).map((prefix) => {
          const address =
            lead[(prefix + "Address") as "departureAddress" | "arrivalAddress"];
          const quoteAddress = fields[prefix + "Address"];
          return (
            <article key={prefix}>
              <h3>
                <MapPin size={16} />
                {prefix === "departure" ? "Chargement" : "Déchargement"}
              </h3>
              <strong>
                {address || "Adresse à compléter dans le dossier"}
              </strong>
              <p>
                Étage :{" "}
                {lead[
                  (prefix + "Floor") as "departureFloor" | "arrivalFloor"
                ] || "À préciser"}
              </p>
              {fields[prefix + "Elevator"] && (
                <p>Ascenseur (devis) : {fields[prefix + "Elevator"]}</p>
              )}
              {quoteAddress && address && quoteAddress !== address && (
                <p className="mission-warning">
                  Adresse différente dans le devis : {quoteAddress}. À
                  rapprocher avant le départ.
                </p>
              )}
              {[
                ["Contact", "Contact"],
                ["Phone", "Téléphone"],
                ["Code", "Digicode"],
                ["Carry", "Portage (m)"],
                ["AccessNotes", "Accès"],
              ].map(([key, label]) =>
                fields[prefix + key] ? (
                  <p key={key}>
                    <b>{label} (devis) :</b> {fields[prefix + key]}
                  </p>
                ) : null,
              )}
            </article>
          );
        })}
      </section>
      {lead.notes && (
        <details className="mission-client-notes">
          <summary>Précisions transmises par le client</summary>
          <p>{lead.notes}</p>
        </details>
      )}
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void save();
        }}
        onChange={() => {
          setDirty(true);
          setSuccess("");
        }}
      >
        <fieldset
          disabled={busy || loading || !data || lead.status !== "confirme"}
          className="mission-fields"
        >
          <section className="mission-section">
            <h3>
              <span>01</span>Créneau de la mission
            </h3>
            <p>
              Incluez la préparation et les trajets dans la réservation.
              Horaires de Paris.
            </p>
            {!booking && lead.scheduledTime && (
              <p className="mission-warning">
                Ancienne affectation : {lead.assignedTruckName}. Confirmez les
                ressources du registre.
              </p>
            )}
            <div className="mission-two-columns">
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
            </div>
          </section>
          <section className="mission-section">
            <h3>
              <span>02</span>Équipe et moyens
            </h3>
            <p>Les réservations, congés et maintenances sont vérifiés sur toute la durée de la mission.</p>
            {selectedUnavailable && (
              <p className="mission-warning" role="alert">
                <AlertCircle size={16} />
                Une ressource sélectionnée est indisponible. Retirez-la ou
                ajustez le créneau.
              </p>
            )}
            <div className="mission-resource-groups">
              {(["person", "vehicle", "lift"] as const).map((kind) => (
                <fieldset key={kind}>
                  <legend>
                    {kind === "person" ? (
                      <Users size={16} />
                    ) : (
                      <Truck size={16} />
                    )}{" "}
                    {kind === "person"
                      ? "Équipe"
                      : kind === "vehicle"
                        ? "Véhicules"
                        : "Monte-meubles"}
                  </legend>
                  {data?.registry.resources
                    .filter(
                      (r) =>
                        r.kind === kind && (r.active || ids.includes(r.id)),
                    )
                    .map((r) => (
                      <label
                        key={r.id}
                        className="mission-resource"
                        data-selected={ids.includes(r.id)}
                      >
                        <input
                          type="checkbox"
                          checked={ids.includes(r.id)}
                          disabled={
                            (!r.active || unavailable.has(r.id)) &&
                            !ids.includes(r.id)
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
                            {!r.active
                              ? "Désactivé"
                              : resourceAbsence(r,start,end)
                                ? absenceLabels[resourceAbsence(r,start,end)!.reason as keyof typeof absenceLabels]
                              : unavailable.has(r.id)
                                ? "Déjà réservé"
                                : !start||!end||end<=start?"Choisissez un créneau pour vérifier": "Disponible sur ce créneau"}
                          </small>
                        </span>
                      </label>
                    ))}
                  {!data?.registry.resources.some(
                    (r) => r.kind === kind && (r.active || ids.includes(r.id)),
                  ) && (
                    <p className="mission-hint">
                      Aucune ressource. À renseigner dans « Équipes et flotte ».
                    </p>
                  )}
                </fieldset>
              ))}
            </div>
            {ids
              .filter(
                (id) => !data?.registry.resources.some((r) => r.id === id),
              )
              .map((id) => (
                <button
                  type="button"
                  key={id}
                  className="crm-quiet-action"
                  onClick={() => {
                    setIds((old) => old.filter((v) => v !== id));
                    setDirty(true);
                    setSuccess("");
                  }}
                >
                  Retirer la ressource supprimée
                </button>
              ))}
          </section>
          <section className="mission-section">
            <h3>
              <span>03</span>Préparation et consignes
            </h3>
            <p>
              Validez chaque point après vérification. Ces informations restent
              propres à cette mission.
            </p>
            <div className="mission-two-columns">
              {(["departureParking", "arrivalParking"] as const).map((key) => (
                <label key={key}>
                  Stationnement{" "}
                  {key === "departureParking" ? "au départ" : "à l’arrivée"}
                  <select
                    aria-label={
                      key === "departureParking"
                        ? "Stationnement au départ"
                        : "Stationnement à l’arrivée"
                    }
                    value={operations[key]}
                    onChange={(e) =>
                      changeOperation(
                        key,
                        e.target.value as MoveOperations[typeof key],
                      )
                    }
                  >
                    {Object.entries(parkingStates).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label as string}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <label className="mission-check">
              <input
                type="checkbox"
                checked={operations.accessVerified}
                onChange={(e) =>
                  changeOperation("accessVerified", e.target.checked)
                }
              />
              <span>
                Accès aux deux adresses vérifiés
                <small>
                  Passages, ascenseurs, portage et objets encombrants.
                </small>
              </span>
            </label>
            <label>
              Matériel à emporter
              <textarea
                aria-label="Matériel à emporter"
                rows={2}
                maxLength={3000}
                value={operations.equipmentNotes}
                onChange={(e) =>
                  changeOperation("equipmentNotes", e.target.value)
                }
                placeholder="Ex. housses, penderies, chariots, protections particulières…"
              />
            </label>
            <label className="mission-check">
              <input
                type="checkbox"
                checked={operations.equipmentReady}
                onChange={(e) =>
                  changeOperation("equipmentReady", e.target.checked)
                }
              />
              <span>Matériel préparé pour cette mission</span>
            </label>
            <label>
              Consignes pour l’équipe
              <textarea
                aria-label="Consignes pour l’équipe"
                rows={3}
                maxLength={3000}
                value={operations.instructions}
                onChange={(e) =>
                  changeOperation("instructions", e.target.value)
                }
                placeholder="Contact sur place, stationnement, ordre des opérations, précautions…"
              />
            </label>
          </section>
        </fieldset>
        <section className="mission-section">
          <h3>
            <span>04</span>Documents liés
          </h3>
          {documentError && (
            <p role="alert" className="mission-warning">
              {documentError}
            </p>
          )}
          {dossier?.quote ? (
            <>
              <p>
                Devis {dossier.quote.reference} · PDF issus du devis enregistré.
                Les consignes de préparation restent dans cette fiche.
              </p>
              <div className="mission-documents">
                {(
                  [
                    ["mission", "Ordre de mission"],
                    ["lettre-voiture", "Lettre de voiture"],
                    ["devis", "Devis et annexes"],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    disabled={downloading || busy}
                    onClick={() => void download(type)}
                  >
                    <Download size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            !loading &&
            !documentError && <p>Aucun devis enregistré dans ce dossier.</p>
          )}
        </section>
        {error && (
          <div role="alert" className="mission-error">
            {error}
            <button
              type="button"
              className="crm-quiet-action"
              disabled={busy || loading}
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm("Recharger et abandonner les modifications ?")
                )
                  void load();
              }}
            >
              Recharger la mission
            </button>
          </div>
        )}
        {success && (
          <p role="status" className="mission-success">
            {success}
          </p>
        )}
        <footer className="mission-footer">
          <p aria-live="polite">
            {busy
              ? "Enregistrement…"
              : dirty
                ? "Modifications non enregistrées"
                : "La préparation ne modifie pas le devis ni la facturation."}
          </p>
          <div>
            <button
              disabled={
                busy ||
                loading ||
                !data ||
                !ids.length ||
                selectedUnavailable ||
                lead.status !== "confirme"
              }
              className="requests-primary"
            >
              <CalendarDays size={16} />
              {busy ? "Enregistrement…" : "Enregistrer la mission"}
            </button>
            <button
              type="button"
              className="crm-quiet-action"
              disabled={busy}
              onClick={close}
            >
              Retour au dossier
            </button>
          </div>
          {booking && !booking.cancelled && (
            <button
              type="button"
              className="mission-cancel"
              disabled={busy || loading}
              onClick={() => void save(true)}
            >
              Annuler la réservation
            </button>
          )}
        </footer>
      </form>
    </dialog>
  );
}

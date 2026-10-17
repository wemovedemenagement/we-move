import CrmAbsenceEditor from './CrmAbsenceEditor';
import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import {absenceLabels} from '../../shared/resourceAvailability.mjs';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Plus, Truck, Users, ArrowUpRight, RefreshCw } from 'lucide-react';
import {
  fetchPlanning,
  saveCrmResource,
  type PlanningData,
  type CrmResource,
} from '../services/crmService';
import type { CrmIdentity } from '../types/crm';
const labels = {
  vehicle: 'Véhicule',
  person: 'Équipier',
  lift: 'Monte-meubles',
};
export default function CrmResources({ identity }: { identity: CrmIdentity }) {
  const [data, setData] = useState<PlanningData | null>(null),
    [edit, setEdit] = useState<CrmResource | null | undefined>(undefined),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [kind, setKind] = useState('all');
  const lock = useRef(false);
  const [dirty,setDirty]=useState(false),[editRevision,setEditRevision]=useState(0);
  const [editKind,setEditKind]=useState<CrmResource['kind']>('vehicle');
  useUnsavedChanges(dirty||busy);
  const beginEdit=(value:CrmResource|null|undefined)=>{
    if(busy||dirty&&!window.confirm('Fermer sans enregistrer les modifications de cette ressource ?'))return;
    setEdit(value);setEditKind(value?.kind||'vehicle');setEditRevision(data?.registry.revision||0);setDirty(false);
  };
  const load = async () => {
    try {
      setData(await fetchPlanning());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lecture impossible.');
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data || lock.current) return;
    const form = new FormData(e.currentTarget);
    lock.current = true;
    setBusy(true);
    try {
      const registry = await saveCrmResource({
        revision: editRevision,
        unavailablePeriods:JSON.parse(String(form.get("unavailablePeriods"))),
        id: edit?.id,
        name: String(form.get('name')),
        detail: String(form.get('detail')),
        kind: String(form.get('kind')) as CrmResource['kind'],
        ...(form.get('kind')==='vehicle'?{capacityM3:form.get('capacityM3')?Number(form.get('capacityM3')):null}:{}),
        active: form.has('active'),
      });
      setData({ ...data, registry });
      setEdit(undefined);setDirty(false);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
      try {
        setData(await fetchPlanning());
      } catch {}
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <section className="crm-resources space-y-5">
      <header className="crm-worklist-head">
        <div>
          <span className="crm-eyebrow">LES MOYENS DE VOS MISSIONS</span>
          <h2>Équipes et flotte</h2>
          <p>
            Un registre partagé, des disponibilités contrôlées lors de chaque
            réservation.
          </p>
        </div>
        {identity.role === 'gerant' && (
          <button
            className="requests-primary"
            disabled={busy}
            onClick={() => beginEdit(null)}
          >
            <Plus size={17} />
            Ajouter une ressource
          </button>
        )}
      </header>
      {error && (
        <p role="alert" className="text-rose-700">
          {error}
        </p>
      )}
      {edit !== undefined && (
        <form
          key={edit?.id || 'new'}
          onSubmit={submit}
          onChange={()=>setDirty(true)}
          className="crm-surface border p-5 space-y-4"
        >
          <h3>{edit ? 'Modifier la ressource' : 'Nouvelle ressource'}</h3>
          <fieldset disabled={busy} className="crm-resource-fields">
            <label>
              Nom ou immatriculation
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={edit?.name}
              />
            </label>
            <label>
              Type
              <select name="kind" value={editKind} onChange={e=>setEditKind(e.target.value as CrmResource['kind'])}>
                {Object.entries(labels)
                  .filter(([key]) => !edit || key === edit.kind)
                  .map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
              </select>
            </label>
            {editKind==='vehicle'&&<label>Capacité volumique (m³) · facultatif<input name="capacityM3" type="number" min="0.01" max="200" step="0.01" defaultValue={edit?.capacityM3??''} placeholder="Ex. 20"/><small>Laissez vide si elle n’est pas connue. Cette valeur aide à comparer les moyens au volume du dossier.</small></label>}
            <label>
              Précision
              <input
                name="detail"
                maxLength={200}
                defaultValue={edit?.detail}
                placeholder="Équipement, qualification…"
              />
            </label>
            <label>
              <input
                name="active"
                type="checkbox"
                defaultChecked={edit?.active ?? true}
              />{' '}
              Ressource active dans le registre
            </label>
          <CrmAbsenceEditor initial={edit?.unavailablePeriods||[]} onDirty={()=>setDirty(true)}/>
          </fieldset>
          {edit && (
            <p className="text-xs text-slate-500">
              Désactiver une ressource ne supprime pas ses réservations
              existantes.
            </p>
          )}
          <div className="flex gap-3">
            <button disabled={busy} className="requests-primary">
              Enregistrer
            </button>
            <button
              type="button"
              disabled={busy}
              className="crm-quiet-action"
              onClick={() => beginEdit(undefined)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      <div className="flex flex-wrap gap-3">
        {[['all', 'Toutes'], ...Object.entries(labels)].map(([id, label]) => (
          <button
            key={id}
            className="crm-quiet-action"
            aria-pressed={kind === id}
            onClick={() => setKind(id)}
          >
            {label}
          </button>
        ))}
        <button
          className="crm-quiet-action"
          disabled={busy}
          onClick={() => void load()}
        >
          <RefreshCw size={15} />
          Actualiser
        </button>
      </div>
      {!data ? (
        <p role="status">Chargement du registre…</p>
      ) : !data.registry.resources.length ? (
        <div className="crm-work-empty">
          <Truck size={30} />
          <h3>Votre registre est prêt</h3>
          <p>
            Ajoutez vos vrais véhicules, équipiers et monte-meubles avant de les
            affecter à une mission.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.registry.resources
            .filter((r) => kind === 'all' || r.kind === kind)
            .map((r) => (
              <article key={r.id} className="crm-surface border p-5">
                <div className="flex items-center justify-between">
                  <span className="crm-eyebrow">{labels[r.kind]}</span>
                  {r.kind === 'person' ? (
                    <Users size={21} />
                  ) : (
                    <Truck size={21} />
                  )}
                </div>
                <h3 className="mt-3 text-lg">{r.name}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {r.detail || 'Aucune précision'}
                </p>
                {r.kind==='vehicle'&&<p className="mt-2 text-sm">{r.capacityM3?`${r.capacityM3.toLocaleString('fr-FR')} m³ · capacité renseignée`:'Capacité non renseignée'}</p>}
                <p className="mt-4 text-sm">
                  {r.active
                    ? 'Active · disponibilité selon le planning'
                    : 'Indisponible aux nouvelles réservations'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {
                    data.bookings.filter(
                      (b) => !b.cancelled && b.resourceIds.includes(r.id),
                    ).length
                  }{' '}
                  réservation(s) enregistrée(s)
                </p>
                {!!r.unavailablePeriods?.length&&<details className="resource-absence-summary"><summary>{r.unavailablePeriods.length} période(s) d’indisponibilité</summary>{r.unavailablePeriods.map((p,i)=><p key={i}><strong>{absenceLabels[p.reason]}</strong> · {p.start.replace('T',' à ')} → {p.end.replace('T',' à ')}</p>)}</details>}
                {identity.role === 'gerant' && (
                  <button
                    className="crm-quiet-action mt-4"
                    onClick={() => beginEdit(r)}
                  >
                    Modifier
                    <ArrowUpRight size={15} />
                  </button>
                )}
              </article>
            ))}
        </div>
      )}
    </section>
  );
}

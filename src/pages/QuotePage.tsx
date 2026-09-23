/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useRouter } from '../router';

export const QuotePage: React.FC = () => {
  const { query } = useRouter();

  const [projectType, setProjectType] = useState<'particulier' | 'entreprise'>(() => {
    return query.service === 'entreprises' ? 'entreprise' : 'particulier';
  });

  const [departureCity, setDepartureCity] = useState('');
  const [departureFloor, setDepartureFloor] = useState('0');
  const [departureElevator, setDepartureElevator] = useState(false);
  const [departureDistance, setDepartureDistance] = useState('Moins de 20m');

  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalFloor, setArrivalFloor] = useState('1');
  const [arrivalElevator, setArrivalElevator] = useState(true);

  const [volume, setVolume] = useState<string>(() => {
    return query.volume ? String(query.volume) : '25';
  });

  const [formule, setFormule] = useState<'economique' | 'standard' | 'confort'>(() => {
    if (query.formule === 'economique') return 'economique';
    if (query.formule === 'confort') return 'confort';
    return 'standard';
  });

  const [needLift, setNeedLift] = useState(query.service === 'monte-meubles');
  const [needStorage, setNeedStorage] = useState(query.service === 'stockage');

  const [moveDate, setMoveDate] = useState('');
  const [dateFlexibility, setDateFlexibility] = useState('Date exacte');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureCity.trim() || !arrivalCity.trim()) {
      setErrorMessage('Veuillez renseigner les adresses ou villes de départ et d’arrivée.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Veuillez renseigner votre nom, email et téléphone pour recevoir le devis.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    setErrorMessage('');
    setSubmitted(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
            Devis gratuit & sans engagement
          </span>
          <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight mt-2 [text-wrap:balance]">
            Décrivez votre projet de déménagement.
          </h1>
          <p className="mt-4 text-[17px] text-[#59616C] leading-relaxed">
            Remplissez ce formulaire pour recevoir une proposition tarifaire détaillée et ajustée à vos contraintes réelles sous 24 à 48 heures ouvrées.
          </p>
        </div>

        {submitted ? (
          <div className="max-w-2xl p-8 sm:p-12 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#0082CA]/10 text-[#0082CA] flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-[26px] font-semibold text-[#20252B]">
              Demande enregistrée avec succès
            </h2>

            <p className="text-[16px] text-[#59616C] leading-relaxed max-w-lg mx-auto">
              Merci <strong className="text-[#20252B]">{fullName}</strong>. Votre demande pour le trajet <strong className="text-[#20252B]">{departureCity} → {arrivalCity}</strong> (cubage estimé : {volume} m³) a bien été enregistrée.
            </p>

            <div className="p-4 bg-white rounded-md border border-[#E6E8EB] text-left text-[14px] text-[#59616C] space-y-1.5 max-w-md mx-auto">
              <div><strong className="text-[#20252B]">Type :</strong> {projectType === 'particulier' ? 'Particulier' : 'Professionnel / Bureaux'}</div>
              <div><strong className="text-[#20252B]">Formule :</strong> {formule}</div>
              <div><strong className="text-[#20252B]">Date souhaitée :</strong> {moveDate || 'Non spécifiée'} ({dateFlexibility})</div>
              <div><strong className="text-[#20252B]">Contact :</strong> {email} · {phone}</div>
            </div>

            <p className="text-[13px] text-[#59616C]/80">
              Un conseiller WE MOVE vous recontactera avec votre proposition chiffrée.
            </p>

            <div className="pt-4 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-6 h-11 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[14px] font-medium hover:bg-[#FAFAF8] cursor-pointer"
              >
                Modifier ma demande
              </button>
              <Link
                href="/"
                className="px-6 h-11 rounded-md bg-[#20252B] text-white text-[14px] font-medium hover:bg-[#323942] transition-colors flex items-center justify-center"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
            
            {errorMessage && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-[14px]">
                {errorMessage}
              </div>
            )}

            {/* 1. Type de projet */}
            <div className="p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] space-y-4">
              <h2 className="text-[18px] font-semibold text-[#20252B]">
                1. Type de déménagement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setProjectType('particulier')}
                  className={`p-4 rounded-md border text-left transition-colors cursor-pointer ${
                    projectType === 'particulier'
                      ? 'border-[#0082CA] bg-white font-medium text-[#20252B] shadow-2xs'
                      : 'border-[#E6E8EB] text-[#59616C] hover:bg-white'
                  }`}
                >
                  <div className="font-semibold text-[15px]">Particulier</div>
                  <div className="text-[13px] text-[#59616C] mt-1">Appartement, maison, studio, chambre d'étudiant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProjectType('entreprise')}
                  className={`p-4 rounded-md border text-left transition-colors cursor-pointer ${
                    projectType === 'entreprise'
                      ? 'border-[#0082CA] bg-white font-medium text-[#20252B] shadow-2xs'
                      : 'border-[#E6E8EB] text-[#59616C] hover:bg-white'
                  }`}
                >
                  <div className="font-semibold text-[15px]">Entreprise & Bureaux</div>
                  <div className="text-[13px] text-[#59616C] mt-1">Siège social, parc informatique, archives, commerces</div>
                </button>
              </div>
            </div>

            {/* 2. Adresses & Accès */}
            <div className="p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] space-y-6">
              <h2 className="text-[18px] font-semibold text-[#20252B]">
                2. Adresses et accès
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Départ */}
                <div className="p-4 bg-white rounded-md border border-[#E6E8EB] space-y-3">
                  <div className="text-[14px] font-semibold text-[#20252B]">Adresse de chargement (Départ) *</div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Ville ou code postal de départ"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[12px] text-[#59616C] mb-1">Étage</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={departureFloor}
                        onChange={(e) => setDepartureFloor(e.target.value)}
                        className="w-full h-9 px-2 rounded border border-[#E6E8EB] text-[13px]"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-[13px] text-[#20252B] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={departureElevator}
                          onChange={(e) => setDepartureElevator(e.target.checked)}
                          className="rounded text-[#0082CA]"
                        />
                        Ascenseur
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#59616C] mb-1">Distance portage camion</label>
                    <select
                      value={departureDistance}
                      onChange={(e) => setDepartureDistance(e.target.value)}
                      className="w-full h-9 px-2 rounded border border-[#E6E8EB] text-[13px] bg-white"
                    >
                      <option>Moins de 20 mètres (accès facile)</option>
                      <option>De 20 à 50 mètres</option>
                      <option>Plus de 50 mètres / cour intérieure</option>
                    </select>
                  </div>
                </div>

                {/* Arrivée */}
                <div className="p-4 bg-white rounded-md border border-[#E6E8EB] space-y-3">
                  <div className="text-[14px] font-semibold text-[#20252B]">Adresse de livraison (Arrivée) *</div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Ville ou code postal d'arrivée"
                      value={arrivalCity}
                      onChange={(e) => setArrivalCity(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[12px] text-[#59616C] mb-1">Étage</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={arrivalFloor}
                        onChange={(e) => setArrivalFloor(e.target.value)}
                        className="w-full h-9 px-2 rounded border border-[#E6E8EB] text-[13px]"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 text-[13px] text-[#20252B] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arrivalElevator}
                          onChange={(e) => setArrivalElevator(e.target.checked)}
                          className="rounded text-[#0082CA]"
                        />
                        Ascenseur
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Prestation, Formule & Volume */}
            <div className="p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] space-y-6">
              <h2 className="text-[18px] font-semibold text-[#20252B]">
                3. Prestation & Volume
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                <div>
                  <label htmlFor="form-volume" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Volume estimé en mètres cubes (m³)
                  </label>
                  <div className="relative">
                    <input
                      id="form-volume"
                      type="number"
                      min="5"
                      max="200"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] font-mono font-medium text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#59616C]">m³</span>
                  </div>
                </div>

                <div>
                  <Link
                    href="/volume/"
                    className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#0082CA] hover:underline"
                  >
                    <span>Vous hésitez ? Ouvrir le calculateur de volume</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Formules */}
              {projectType === 'particulier' && (
                <div>
                  <label className="block text-[13px] font-medium text-[#20252B] mb-2">
                    Formule souhaitée
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormule('economique')}
                      className={`p-3 rounded-md border text-left transition-colors cursor-pointer ${
                        formule === 'economique'
                          ? 'border-[#0082CA] bg-white font-medium text-[#20252B]'
                          : 'border-[#E6E8EB] text-[#59616C] bg-white/50 hover:bg-white'
                      }`}
                    >
                      <div className="font-semibold text-[14px]">Économique</div>
                      <div className="text-[12px] text-[#59616C] mt-0.5">Vous emballez vos cartons</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormule('standard')}
                      className={`p-3 rounded-md border text-left transition-colors cursor-pointer ${
                        formule === 'standard'
                          ? 'border-[#0082CA] bg-white font-medium text-[#20252B]'
                          : 'border-[#E6E8EB] text-[#59616C] bg-white/50 hover:bg-white'
                      }`}
                    >
                      <div className="font-semibold text-[14px]">Standard (Recommandé)</div>
                      <div className="text-[12px] text-[#59616C] mt-0.5">Démontage meubles & objets fragiles</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormule('confort')}
                      className={`p-3 rounded-md border text-left transition-colors cursor-pointer ${
                        formule === 'confort'
                          ? 'border-[#0082CA] bg-white font-medium text-[#20252B]'
                          : 'border-[#E6E8EB] text-[#59616C] bg-white/50 hover:bg-white'
                      }`}
                    >
                      <div className="font-semibold text-[14px]">Confort</div>
                      <div className="text-[12px] text-[#59616C] mt-0.5">Clé en main, emballage complet</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Options complémentaires */}
              <div className="pt-2 flex flex-wrap gap-6 text-[13.5px] text-[#20252B]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needLift}
                    onChange={(e) => setNeedLift(e.target.checked)}
                    className="rounded text-[#0082CA]"
                  />
                  <span>Prévoir un monte-meubles</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needStorage}
                    onChange={(e) => setNeedStorage(e.target.checked)}
                    className="rounded text-[#0082CA]"
                  />
                  <span>Besoin de garde-meubles temporaire</span>
                </label>
              </div>

            </div>

            {/* 4. Calendrier & Coordonnées */}
            <div className="p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] space-y-6">
              <h2 className="text-[18px] font-semibold text-[#20252B]">
                4. Date souhaitée et coordonnées
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="move-date" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Date envisagée
                  </label>
                  <input
                    id="move-date"
                    type="date"
                    value={moveDate}
                    onChange={(e) => setMoveDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Flexibilité sur la date
                  </label>
                  <select
                    value={dateFlexibility}
                    onChange={(e) => setDateFlexibility(e.target.value)}
                    className="w-full h-10 px-2 rounded-md border border-[#E6E8EB] bg-white text-[13px]"
                  >
                    <option>Date exacte impérative</option>
                    <option>Flexible à ± 2 ou 3 jours</option>
                    <option>Flexible sur la semaine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label htmlFor="user-name" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Nom & Prénom *
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="user-email" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Adresse courriel *
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    required
                    placeholder="jean@exemple.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label htmlFor="user-phone" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Téléphone *
                  </label>
                  <input
                    id="user-phone"
                    type="tel"
                    required
                    placeholder="06 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user-notes" className="block text-[13px] font-medium text-[#20252B] mb-1">
                  Précisions complémentaires (objets lourds, difficultés d'accès, etc.)
                </label>
                <textarea
                  id="user-notes"
                  rows={3}
                  placeholder="Ex : stationnement difficile dans la rue, piano droit au 2e étage, besoin de 20 cartons avant la fin du mois..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-md border border-[#E6E8EB] bg-white text-[13.5px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden resize-none"
                />
              </div>

            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[13px] text-[#59616C]">
                * Champs obligatoires · Sans aucun engagement de votre part
              </div>
              <button
                type="submit"
                className="px-8 h-12 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] transition-colors cursor-pointer shadow-xs"
              >
                Envoyer ma demande de devis
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

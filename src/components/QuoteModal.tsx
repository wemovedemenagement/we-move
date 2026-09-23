/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVolume?: number;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, initialVolume = 25 }) => {
  const [projectType, setProjectType] = useState<'particulier' | 'entreprise'>('particulier');
  const [departureCity, setDepartureCity] = useState('');
  const [departureFloor, setDepartureFloor] = useState('0');
  const [departureElevator, setDepartureElevator] = useState(false);
  const [arrivalCity, setArrivalCity] = useState('');
  const [arrivalFloor, setArrivalFloor] = useState('1');
  const [arrivalElevator, setArrivalElevator] = useState(true);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [moveDate, setMoveDate] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureCity.trim() || !arrivalCity.trim()) {
      setErrorMessage('Veuillez renseigner les villes de départ et d’arrivée.');
      return;
    }
    if (!email.trim() || !phone.trim() || !fullName.trim()) {
      setErrorMessage('Veuillez renseigner vos coordonnées pour recevoir votre devis.');
      return;
    }
    setErrorMessage('');
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20252B]/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
    >
      <div 
        className="w-full max-w-xl bg-white rounded-lg border border-[#E6E8EB] shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E6E8EB] flex items-center justify-between bg-[#FAFAF8]">
          <div>
            <h3 id="quote-modal-title" className="text-[18px] font-semibold text-[#20252B]">
              Demande de devis sans engagement
            </h3>
            <p className="text-[13px] text-[#59616C] mt-0.5">
              Étude gratuite et personnalisée de votre projet
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#59616C] hover:text-[#20252B] hover:bg-[#E6E8EB]/50 transition-colors cursor-pointer"
            aria-label="Fermer la boîte de dialogue"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#0082CA]/10 text-[#0082CA] flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-[20px] font-semibold text-[#20252B]">
                Demande transmise avec succès
              </h4>
              <p className="text-[14.5px] text-[#59616C] max-w-md mx-auto leading-relaxed">
                Merci {fullName}. Un conseiller WE MOVE analyse vos contraintes d'accès pour {departureCity} → {arrivalCity} (~{volume} m³) et vous contactera sous 24 à 48 heures ouvrées.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 h-11 rounded-md bg-[#20252B] text-white text-[14px] font-medium hover:bg-[#323942] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMessage && (
                <div className="p-3 text-[13px] bg-red-50 text-red-700 border border-red-200 rounded-md">
                  {errorMessage}
                </div>
              )}

              {/* Type de projet */}
              <div>
                <label className="block text-[13px] font-medium text-[#20252B] mb-2">
                  Type de déménagement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProjectType('particulier')}
                    className={`py-2 px-3 text-[13.5px] rounded-md border text-center transition-colors cursor-pointer ${
                      projectType === 'particulier'
                        ? 'border-[#0082CA] bg-[#0082CA]/5 font-medium text-[#0082CA]'
                        : 'border-[#E6E8EB] text-[#59616C] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    Particulier
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectType('entreprise')}
                    className={`py-2 px-3 text-[13.5px] rounded-md border text-center transition-colors cursor-pointer ${
                      projectType === 'entreprise'
                        ? 'border-[#0082CA] bg-[#0082CA]/5 font-medium text-[#0082CA]'
                        : 'border-[#E6E8EB] text-[#59616C] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    Entreprise / Bureaux
                  </button>
                </div>
              </div>

              {/* Villes départ et arrivée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dept-city" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Adresse ou ville de départ *
                  </label>
                  <input
                    id="dept-city"
                    type="text"
                    required
                    placeholder="Ex: Paris 15e, Lyon..."
                    value={departureCity}
                    onChange={(e) => setDepartureCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#59616C]">
                    <span className="flex items-center gap-1.5">
                      Étage:
                      <input 
                        type="number" 
                        min="0" 
                        max="30" 
                        value={departureFloor} 
                        onChange={(e) => setDepartureFloor(e.target.value)}
                        className="w-12 h-6 px-1 border border-[#E6E8EB] rounded text-center"
                      />
                    </span>
                    <label className="flex items-center gap-1 cursor-pointer">
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
                  <label htmlFor="arr-city" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Adresse ou ville d'arrivée *
                  </label>
                  <input
                    id="arr-city"
                    type="text"
                    required
                    placeholder="Ex: Bordeaux, Nantes..."
                    value={arrivalCity}
                    onChange={(e) => setArrivalCity(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[12px] text-[#59616C]">
                    <span className="flex items-center gap-1.5">
                      Étage:
                      <input 
                        type="number" 
                        min="0" 
                        max="30" 
                        value={arrivalFloor} 
                        onChange={(e) => setArrivalFloor(e.target.value)}
                        className="w-12 h-6 px-1 border border-[#E6E8EB] rounded text-center"
                      />
                    </span>
                    <label className="flex items-center gap-1 cursor-pointer">
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

              {/* Volume & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quote-vol" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Volume estimé (m³)
                  </label>
                  <div className="relative">
                    <input
                      id="quote-vol"
                      type="number"
                      min="5"
                      max="150"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden font-mono"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-[#59616C]">m³</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="quote-date" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Date souhaitée (indicative)
                  </label>
                  <input
                    id="quote-date"
                    type="date"
                    value={moveDate}
                    onChange={(e) => setMoveDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Coordonnées */}
              <div className="pt-2 border-t border-[#E6E8EB] space-y-3">
                <div className="text-[13px] font-medium text-[#20252B]">
                  Vos coordonnées pour l’envoi
                </div>
                
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Nom et prénom *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    placeholder="Adresse courriel *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Numéro de téléphone *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Précisions utiles (stationnement difficile, piano, objets fragiles...)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 rounded-md border border-[#E6E8EB] text-[13.5px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 h-11 rounded-md text-[#59616C] hover:text-[#20252B] text-[14px] cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 h-11 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors cursor-pointer"
                >
                  Recevoir mon devis gratuit
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

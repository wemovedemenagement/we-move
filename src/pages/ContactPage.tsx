/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from '../router';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Renseignement commercial');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSent(true);
  };

  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
            Échange & Renseignements
          </span>
          <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight mt-2 [text-wrap:balance]">
            Contacter les équipes WE MOVE.
          </h1>
          <p className="mt-4 text-[17px] text-[#59616C] leading-relaxed">
            Vous avez une question sur votre organisation, une demande de faisabilité technique ou un besoin spécifique de stockage ? Nous vous répondons sous 24h ouvrées.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#0082CA]/10 text-[#0082CA] flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-[20px] font-semibold text-[#20252B]">
                  Message transmis
                </h3>
                <p className="text-[14.5px] text-[#59616C] max-w-md mx-auto">
                  Merci {name}, votre demande a bien été envoyée à notre service client. Nous reviendrons vers vous dans les plus brefs délais à l'adresse {email}.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setMessage('');
                    }}
                    className="px-5 h-10 rounded-md border border-[#E6E8EB] bg-white text-[13.5px] font-medium text-[#20252B] hover:bg-[#FAFAF8]"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-[18px] font-semibold text-[#20252B]">
                  Formulaire de contact direct
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ct-name" className="block text-[13px] font-medium text-[#20252B] mb-1">
                      Nom complet *
                    </label>
                    <input
                      id="ct-name"
                      type="text"
                      required
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label htmlFor="ct-email" className="block text-[13px] font-medium text-[#20252B] mb-1">
                      Adresse courriel *
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      required
                      placeholder="nom@exemple.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ct-subject" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Objet de votre demande
                  </label>
                  <select
                    id="ct-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden"
                  >
                    <option>Renseignement commercial</option>
                    <option>Question sur un devis en cours</option>
                    <option>Vérification d'accès technique (monte-meubles)</option>
                    <option>Question sur le garde-meubles</option>
                    <option>Autre demande</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="ct-message" className="block text-[13px] font-medium text-[#20252B] mb-1">
                    Votre message *
                  </label>
                  <textarea
                    id="ct-message"
                    required
                    rows={5}
                    placeholder="Précisez votre demande, vos contraintes de dates ou de lieu..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-md border border-[#E6E8EB] bg-white text-[14px] text-[#20252B] focus:border-[#0082CA] focus:outline-hidden resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[12.5px] text-[#59616C]">
                    * Champs obligatoires
                  </span>
                  <button
                    type="submit"
                    className="px-6 h-11 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors cursor-pointer"
                  >
                    Envoyer le message
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Information Column */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-white space-y-5">
              <h3 className="text-[18px] font-semibold text-[#20252B]">
                Coordonnées & Horaires
              </h3>

              <div className="space-y-4 text-[14px] text-[#59616C]">
                <div>
                  <div className="font-semibold text-[#20252B]">Courriel d'information :</div>
                  <a href="mailto:contact@wemove.fr" className="text-[#0082CA] hover:underline">
                    contact@wemove.fr
                  </a>
                </div>

                <div>
                  <div className="font-semibold text-[#20252B]">Horaires d'accueil téléphonique :</div>
                  <div>Du lundi au vendredi : 08h00 - 19h00</div>
                  <div>Samedi : 09h00 - 17h00</div>
                </div>

                <div>
                  <div className="font-semibold text-[#20252B]">Zone d’intervention :</div>
                  <div>Île-de-France, province et transferts nationaux</div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] space-y-4">
              <h3 className="text-[18px] font-semibold text-[#20252B]">
                Vous avez un projet précis ?
              </h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Pour une estimation financière chiffrée, privilégiez le formulaire de devis complet avec volume et adresses d'accès.
              </p>
              <Link
                href="/devis/"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-[#0082CA] hover:underline"
              >
                <span>Accéder au formulaire de devis détaillé</span>
                <span>→</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

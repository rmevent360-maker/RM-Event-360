import React, { useState } from 'react';
import { Building2, Heart, ArrowRight } from 'lucide-react';
import { PACKAGES } from '../data';

interface SectorsProps {
  setCurrentTab: (tab: string) => void;
  setSelectedPackage: (packageId: 'standard' | 'bronze' | 'argent' | 'prestige') => void;
}

export default function Sectors({ setCurrentTab, setSelectedPackage }: SectorsProps) {
  const [activeSector, setActiveSector] = useState<'corporate' | 'b2c'>('b2c');

  const selectPackageAndGo = (pkgId: 'standard' | 'bronze' | 'argent' | 'prestige') => {
    setSelectedPackage(pkgId);
    setCurrentTab('booking');
    // Scroll smoothly to form if available
    setTimeout(() => {
      document.getElementById('booking-view-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section id="sectors-section" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 uppercase">
            Nos Offres Photobooth 360°
          </h2>
          <p className="font-sans text-gray-500 mt-2 text-sm">
            Découvrez nos configurations de tournage optimisées pour les particuliers et professionnels à Dakar.
          </p>
        </div>

        {/* Sector Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveSector('b2c')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
              activeSector === 'b2c'
                ? 'bg-gold-500 text-white border-gold-500 shadow-md'
                : 'bg-gray-55 text-gray-650 border-gray-200 hover:text-gray-905 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Offre Particulier</span>
          </button>

          <button
            onClick={() => setActiveSector('corporate')}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
              activeSector === 'corporate'
                ? 'bg-gold-500 text-white border-gold-500 shadow-md'
                : 'bg-gray-55 text-gray-650 border-gray-200 hover:text-gray-905 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Offre Corporate</span>
          </button>
        </div>

        {/* Tab Panel Content */}
        <div className="bg-gray-50 border border-gray-200 rounded-none p-6 sm:p-8 shadow-sm">

          {/* 1. PARTICULIERS (B2C) */}
          {activeSector === 'b2c' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-gold-500 text-xs font-extrabold uppercase tracking-widest block">Événements Privés</span>
                <h3 className="font-display text-2xl font-bold text-gray-900 tracking-tight mt-2">
                  Nos Forfaits Pour Particuliers
                </h3>
                <p className="font-sans text-xs sm:text-sm text-gray-500 mt-2">
                  Mariages, fiançailles, baptêmes ou anniversaires. Choisissez la formule idéale pour votre célébration chaleureuse à Dakar.
                </p>
              </div>

              {/* Grid of the 4 packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white border border-gray-200 rounded-none p-5 flex flex-col justify-between hover:border-gold-500/50 transition-all duration-300 relative group overflow-hidden shadow-sm"
                  >
                    {pkg.id === 'argent' && (
                      <div className="absolute top-0 right-0 bg-gold-500 text-white text-[9px] font-bold px-3 py-1 rounded-none uppercase tracking-widest">
                        Recommandé
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] text-gold-500 uppercase font-black tracking-widest block mb-1">DAKAR TIER</span>
                        <h4 className="font-display font-extrabold text-gray-900 text-base">{pkg.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 min-h-[40px] leading-relaxed">
                          {pkg.description}
                        </p>
                      </div>

                      {/* Display price in FCFA */}
                      <div className="bg-gray-50 rounded-none p-3 border border-gray-150 text-center">
                        <span className="text-[9px] text-gray-405 block uppercase tracking-wider">Tarif Prévu</span>
                        <span className="text-sm font-mono font-black text-gold-500">{pkg.price}</span>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={() => selectPackageAndGo(pkg.id)}
                        className={`w-full py-3 rounded-none text-xs tracking-widest uppercase font-bold transition-all duration-300 cursor-pointer ${
                          pkg.id === 'argent'
                            ? 'bg-gold-500 text-white shadow-md hover:bg-gold-600'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        Sélectionner
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Special Custom Request Option */}
              <div className="mt-8 bg-gray-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gold-500/20">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] text-gold-500 uppercase font-black tracking-widest block font-mono">Besoin de quelque chose de particulier ?</span>
                  <h4 className="font-display font-extrabold text-base md:text-lg">Demande Spécifique & Devis Sur-Mesure</h4>
                  <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                    Pour des besoins spécifiques, des durées plus longues (+4h) ou tout projet particulier à Dakar, demandez un devis personnalisé ajusté à votre cahier des charges.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPackage('prestige');
                    setCurrentTab('booking');
                  }}
                  className="w-full md:w-auto px-6 py-3 bg-gold-500 text-white hover:bg-gold-600 text-[11px] font-black uppercase tracking-widest transition-all shrink-0 rounded-none cursor-pointer"
                >
                  Demander un devis
                </button>
              </div>
            </div>
          )}

          {/* 2. CORPORATE & B2B */}
          {activeSector === 'corporate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fadeIn">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="text-gold-500 text-xs font-extrabold uppercase tracking-widest block">Solutions Entreprises</span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  Des Événements Professionnels d'Exception
                </h3>
                <p className="font-sans text-gray-650 text-sm leading-relaxed">
                  Offrez une visibilité digitale maximale à votre marque à Dakar. Chaque vidéo générée est marquée avec votre logo et partagée directement par vos invités pour un impact maximal sur les réseaux sociaux.
                </p>

                <div className="pt-4">
                  <button
                    onClick={() => selectPackageAndGo('prestige')}
                    className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white px-6 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    <span>Réserver le Pack Prestige Corporate</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* 4 Custom Corporate Categories */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-none border border-gray-200 shadow-xs">
                  <span className="text-gold-500 font-extrabold text-xs uppercase tracking-wider block mb-1">Soirée de Gala</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Sublimez vos réceptions prestigieuses d'entreprise, remises de prix et dîners de gala VIP avec tapis rouge et barrières dorées.</p>
                </div>
                
                <div className="bg-white p-5 rounded-none border border-gray-200 shadow-xs">
                  <span className="text-gold-500 font-extrabold text-xs uppercase tracking-wider block mb-1">Team Building</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Fédérez vos collaborateurs, renforcez la cohésion d'équipe et créez des souvenirs impérissables et rassembleurs.</p>
                </div>

                <div className="bg-white p-5 rounded-none border border-gray-200 shadow-xs">
                  <span className="text-gold-500 font-extrabold text-xs uppercase tracking-wider block mb-1">Lancement produit</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Marquez les esprits de vos clients et maximisez la couverture médiatique de vos nouvelles créations sur internet.</p>
                </div>

                <div className="bg-white p-5 rounded-none border border-gray-200 shadow-xs">
                  <span className="text-gold-500 font-extrabold text-xs uppercase tracking-wider block mb-1">Animation Commerciale</span>
                  <p className="text-[11px] text-gray-500 leading-relaxed">Attirez les foules, divertissez vos clients et augmentez l'engagement autour de vos campagnes physiques.</p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}

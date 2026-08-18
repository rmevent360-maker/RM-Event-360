import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Maximize2,
  Minimize2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { CATALOG_PRODUCTS, CATALOG_META, CatalogProduct } from '../data/catalog';
import { downloadCatalogEbookPdf } from '../utils/generateCatalogPdf';

interface EbookCatalogProps {
  setCurrentTab: (tab: string) => void;
}

export default function EbookCatalog({ setCurrentTab }: EbookCatalogProps) {
  // Spreads:
  // 0: Couverture (Page 1)
  // 1: Photobooth 360° (Page 2)
  // 2: Jeu de Réflexe (Page 3)
  // 3: Lyre de Scène (Page 4)
  // 4: Projecteur LED (Page 5)
  // 5: Potelets Dorés (Page 6)
  // 6: Sublimez vos événements / Clôture (Page 7)
  const [currentSpread, setCurrentSpread] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [mobileActiveTab, setMobileActiveTab] = useState<'image' | 'details'>('image');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');

  const totalPages = 7;

  const handleDownloadEbookPdf = async () => {
    if (isDownloadingPdf) return;
    try {
      setIsDownloadingPdf(true);
      await downloadCatalogEbookPdf((msg) => setPdfProgressText(msg));
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de la génération du catalogue PDF.");
    } finally {
      setIsDownloadingPdf(false);
      setPdfProgressText('');
    }
  };

  const goToNext = () => {
    if (currentSpread < totalPages - 1) {
      setDirection('next');
      setCurrentSpread((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentSpread > 0) {
      setDirection('prev');
      setCurrentSpread((prev) => prev - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSpread]);

  const currentProduct: CatalogProduct | undefined =
    currentSpread >= 1 && currentSpread <= 5 ? CATALOG_PRODUCTS[currentSpread - 1] : undefined;

  const handleWhatsAppInquiry = (productName?: string) => {
    const msg = productName
      ? `Bonjour RM Events, je souhaite avoir des informations et un devis pour la location de : *${productName}* découvert dans votre catalogue Ebook.`
      : `Bonjour RM Events, je souhaite avoir des informations et réserver du matériel de votre catalogue premium.`;
    window.open(`https://wa.me/221779762075?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100 overflow-y-auto p-4 sm:p-8' : 'py-8 sm:py-12'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BAR: Header & Quick Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold tracking-wider text-xs uppercase mb-1">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Catalogue Interactif</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Catalogue Matériel & Solutions VIP
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Feuilletez notre sélection de matériel événementiel haut de gamme disponible à Dakar.
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-lg p-1 text-xs text-gray-700">
              <span className="px-2 py-1 font-mono text-amber-600 font-bold">
                Page {currentSpread + 1} / {totalPages}
              </span>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadEbookPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              title="Télécharger le catalogue en format PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{pdfProgressText || 'Téléchargement...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger le Catalogue (PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium shadow-sm transition-colors"
              title={isFullscreen ? 'Quitter plein écran' : 'Mode Plein Écran'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Réduire' : 'Plein Écran'}</span>
            </button>
          </div>
        </div>

        {/* EBOOK CONTAINER - WHITE & GOLD LUXURY THEME */}
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
          
          {/* Subtle warm decorative light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

          {/* SPREAD DISPLAY */}
          <div className="relative min-h-[560px] lg:min-h-[640px] flex items-center justify-center">
            
            <AnimatePresence mode="wait" custom={direction}>
              {/* SPREAD 0: COUVERTURE DU CATALOGUE (WHITE & GOLD LUXURY) */}
              {currentSpread === 0 && (
                <motion.div
                  key="cover-page"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full max-w-4xl bg-gradient-to-b from-white via-amber-50/20 to-white border-2 border-amber-400/60 rounded-xl p-6 sm:p-12 lg:p-16 text-center shadow-lg relative overflow-hidden"
                >
                  {/* Decorative book framing */}
                  <div className="absolute inset-2 sm:inset-4 border border-amber-300/40 rounded-lg pointer-events-none" />
                  <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                  {/* RM Events Logo / Badge */}
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-50 border border-amber-300/60 rounded-full shadow-sm">
                      <img
                        src={CATALOG_META.logo}
                        alt="RM Events Logo"
                        className="w-8 h-8 rounded-full object-cover border border-amber-400/60"
                      />
                      <span className="text-amber-700 font-bold tracking-widest text-xs uppercase">
                        RM Events Prestige
                      </span>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-wider uppercase mb-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">
                      {CATALOG_META.title}
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm font-bold tracking-[0.25em] text-gray-600 uppercase mb-8 sm:mb-12">
                    {CATALOG_META.subtitle}
                  </p>

                  {/* Inner Box Showcase */}
                  <div className="max-w-2xl mx-auto bg-white/90 border border-amber-300/60 rounded-xl p-6 sm:p-8 mb-8 sm:mb-10 shadow-sm backdrop-blur-sm">
                    <p className="text-amber-700 font-bold text-base sm:text-lg mb-2 uppercase tracking-wide">
                      Gamme RM Events
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      Photobooth 360° motorisé, jeux de réflexe interactifs, éclairages de scène asservis (Lyres Beam), projecteurs LED studio et potelets VIP dorés à cordon velours rouge.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-amber-700 font-semibold text-xs sm:text-sm tracking-wide">
                      {CATALOG_META.tagline}
                    </p>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Contact / WhatsApp : <span className="text-gray-900 font-mono font-bold">{CATALOG_META.phone}</span>
                    </p>
                    
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={goToNext}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm tracking-wider uppercase cursor-pointer"
                      >
                        <span>Ouvrir le Catalogue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleDownloadEbookPdf}
                        disabled={isDownloadingPdf}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold rounded-xl text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-75"
                      >
                        {isDownloadingPdf ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            <span>{pdfProgressText || 'Téléchargement...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 text-amber-600" />
                            <span>Télécharger le Catalogue (PDF)</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setCurrentTab('booking')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>Réserver un Pack</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 text-[11px] text-gray-400">
                    RM Events - Catalogue Produits &bull; Page 1
                  </div>
                </motion.div>
              )}

              {/* SPREAD 1..5: PRODUITS (PAGE GAUCHE = IMAGE SUR FOND BLANC, PAGE DROITE = DESCRIPTION SUR FOND BLANC) */}
              {currentProduct && (
                <motion.div
                  key={`product-page-${currentProduct.pageNumber}`}
                  initial={{ opacity: 0, x: direction === 'next' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === 'next' ? -20 : 20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xl"
                >
                  {/* MOBILE VIEW TOGGLE: Toggle between Photo & Details on mobile */}
                  <div className="lg:hidden flex border-b border-gray-200 bg-gray-50">
                    <button
                      onClick={() => setMobileActiveTab('image')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                        mobileActiveTab === 'image'
                          ? 'bg-white text-amber-700 border-b-2 border-amber-500'
                          : 'text-gray-500'
                      }`}
                    >
                      Photo du Matériel
                    </button>
                    <button
                      onClick={() => setMobileActiveTab('details')}
                      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                        mobileActiveTab === 'details'
                          ? 'bg-white text-amber-700 border-b-2 border-amber-500'
                          : 'text-gray-500'
                      }`}
                    >
                      Fiche & Caractéristiques
                    </button>
                  </div>

                  {/* ==================================================== */}
                  {/* PAGE GAUCHE : IMAGE DU PRODUIT (FOND BLANC & GRAND CADRE) */}
                  {/* ==================================================== */}
                  <div
                    className={`${
                      mobileActiveTab === 'details' ? 'hidden lg:flex' : 'flex'
                    } flex-col justify-between p-4 sm:p-6 lg:p-7 bg-gray-50/70 border-b lg:border-b-0 lg:border-r border-gray-200 relative`}
                  >
                    {/* Top Header of Left Page */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pb-2.5 border-b border-gray-200 mb-3">
                      <span className="font-bold text-gray-800 tracking-wider">RM Events</span>
                    </div>

                    {/* Image Container with Enlarged Framing */}
                    <div className="relative flex-1 w-full my-1 group flex flex-col justify-center">
                      <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden border-2 border-amber-400/90 bg-white shadow-lg">
                        <img
                          src={currentProduct.image}
                          alt={currentProduct.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Overlay Label matching the PDF layout */}
                        <div className="absolute bottom-4 left-4">
                          <span className="px-4 py-2 bg-white/95 backdrop-blur-md border border-amber-400 text-gray-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md">
                            {currentProduct.imageLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Footer of Left Page */}
                    <div className="pt-3 mt-3 border-t border-gray-200 flex items-center justify-end text-[11px] text-gray-400">
                      <span className="font-mono font-semibold text-gray-500">Page {currentProduct.pageNumber}</span>
                    </div>
                  </div>

                  {/* ==================================================== */}
                  {/* PAGE DROITE : DESCRIPTION & CARACTÉRISTIQUES (FOND BLANC) */}
                  {/* ==================================================== */}
                  <div
                    className={`${
                      mobileActiveTab === 'image' ? 'hidden lg:flex' : 'flex'
                    } flex-col justify-between p-6 sm:p-8 lg:p-10 bg-white relative`}
                  >
                    {/* Top Header of Right Page matching PDF */}
                    <div>
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-gray-200 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-4 bg-amber-500 rounded-sm" />
                          <span className="text-amber-700 font-bold tracking-widest text-[11px] uppercase">
                            {currentProduct.category}
                          </span>
                        </div>
                        <span className="text-gray-500 font-mono text-[11px] font-semibold">
                          RM EVENTS | {CATALOG_META.phone}
                        </span>
                      </div>

                      {/* Main Product Title */}
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight mb-5">
                        {currentProduct.title}
                      </h2>

                      {/* SECTION 1: DESCRIPTION DU PRODUIT */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                            DESCRIPTION DU PRODUIT
                          </h3>
                          <div className="flex-1 h-px bg-amber-200" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                          {currentProduct.description}
                        </p>
                      </div>

                      {/* SECTION 2: POINTS FORTS & CARACTÉRISTIQUES */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                            POINTS FORTS & CARACTÉRISTIQUES
                          </h3>
                          <div className="flex-1 h-px bg-amber-200" />
                        </div>
                        <ul className="space-y-2.5">
                          {currentProduct.pointsForts.map((pt, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                              <span className="text-amber-600 font-black text-sm leading-4 mt-0.5">◆</span>
                              <span className="leading-snug">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* SECTION 3: IDÉAL POUR */}
                      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 mb-6">
                        <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                          Idéal pour :
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 font-medium">
                          {currentProduct.idealPour}
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Button within page */}
                    <div>
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleWhatsAppInquiry(currentProduct.title)}
                          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-lg text-xs tracking-wider uppercase shadow-md transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Demander ce Matériel</span>
                        </button>
                        <button
                          onClick={() => setCurrentTab('booking')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Réserver</span>
                        </button>
                      </div>

                      {/* Bottom Footer matching PDF */}
                      <div className="pt-3 mt-3 flex items-center justify-between text-[11px] text-gray-400">
                        <span>RM Events - Catalogue Produits</span>
                        <span className="font-mono font-semibold text-gray-600">Page {currentProduct.pageNumber}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SPREAD 6: DERNIÈRE PAGE (PAGE 7 / CLÔTURE & RÉSERVATION SUR FOND BLANC) */}
              {currentSpread === 6 && (
                <motion.div
                  key="outro-page"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="w-full max-w-4xl bg-gradient-to-b from-white via-amber-50/20 to-white border-2 border-amber-400/60 rounded-xl p-6 sm:p-12 lg:p-16 text-center shadow-lg relative overflow-hidden"
                >
                  <div className="absolute inset-2 sm:inset-4 border border-amber-300/40 rounded-lg pointer-events-none" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

                  {/* RM Events Logo */}
                  <div className="flex justify-center mb-6">
                    <img
                      src={CATALOG_META.logo}
                      alt="RM Events Logo"
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/60 shadow-md"
                    />
                  </div>

                  <p className="text-amber-700 font-bold tracking-widest text-xs uppercase mb-2">
                    RM Events Dakar
                  </p>

                  <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-wider uppercase mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">
                      SUBLIMEZ VOS ÉVÉNEMENTS
                    </span>
                  </h2>

                  <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-600 leading-relaxed mb-10">
                    Mariage, gala, lancement de produit ou soirée privée : RM Events met à votre disposition du matériel premium et un accompagnement sur-mesure.
                  </p>

                  <div className="max-w-md mx-auto space-y-3">
                    <button
                      onClick={() => setCurrentTab('booking')}
                      className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black rounded-xl shadow-lg shadow-amber-500/25 transition-all text-sm tracking-wider uppercase cursor-pointer"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>RÉSERVER VOTRE CRÉNEAU</span>
                    </button>

                    <button
                      onClick={handleDownloadEbookPdf}
                      disabled={isDownloadingPdf}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-amber-50 border-2 border-amber-400 text-amber-900 font-bold rounded-xl shadow-sm text-sm transition-colors cursor-pointer disabled:opacity-75"
                    >
                      {isDownloadingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                          <span>{pdfProgressText || 'Téléchargement du catalogue...'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-amber-600" />
                          <span>Télécharger le Catalogue (PDF)</span>
                        </>
                      )}
                    </button>

                    <div className="pt-4 bg-amber-50/80 border border-amber-200 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Assistance directe & Réservation instantanée</p>
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Contact / WhatsApp :
                      </p>
                      <a
                        href={CATALOG_META.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-base sm:text-lg font-mono font-bold text-amber-700 hover:text-amber-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                        <span>{CATALOG_META.phone}</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-8 text-[11px] text-gray-400">
                    RM Events - Catalogue Produits &bull; Page 7
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SPREAD NAVIGATION BAR (PREVIOUS / NEXT & THUMBNAILS) */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Prev Button */}
            <button
              onClick={goToPrev}
              disabled={currentSpread === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentSpread === 0
                  ? 'text-gray-300 bg-gray-100 cursor-not-allowed border border-gray-200'
                  : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 hover:border-amber-500 shadow-sm'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Page Précédente</span>
            </button>

            {/* Quick Page Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 px-2">
              {[
                { label: 'Couverture', num: 0 },
                { label: 'Photobooth 360°', num: 1 },
                { label: 'Jeu de Réflexe', num: 2 },
                { label: 'Lyre de Scène', num: 3 },
                { label: 'Projecteur LED', num: 4 },
                { label: 'Potelets Dorés', num: 5 },
                { label: 'Fin & Contact', num: 6 },
              ].map((item) => (
                <button
                  key={item.num}
                  onClick={() => {
                    setDirection(item.num > currentSpread ? 'next' : 'prev');
                    setCurrentSpread(item.num);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    currentSpread === item.num
                      ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={goToNext}
              disabled={currentSpread === totalPages - 1}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                currentSpread === totalPages - 1
                  ? 'text-gray-300 bg-gray-100 cursor-not-allowed border border-gray-200'
                  : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 hover:border-amber-500 shadow-sm'
              }`}
            >
              <span>Page Suivante</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

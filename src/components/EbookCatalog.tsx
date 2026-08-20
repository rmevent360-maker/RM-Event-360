import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, BookOpen, Download } from 'lucide-react';
import { CATALOG_PRODUCTS, CATALOG_META } from '../data/catalog';

// Component wrapper for individual pages
const Page = React.forwardRef((props: any, ref: any) => {
  return (
    <div className="page bg-white overflow-hidden relative" style={{ boxShadow: "none" }} ref={ref} data-density={props.density || 'soft'}>
      {props.children}
      {!props.hidePageNumber && (
        <div className="absolute bottom-4 left-0 w-full flex justify-center text-[10px] font-bold text-gray-300">
          - {props.number} -
        </div>
      )}
    </div>
  );
});

interface EbookCatalogProps {
  onStartBooking: (item?: string) => void;
}

export default function EbookCatalog({ onStartBooking }: EbookCatalogProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const flipBookRef = useRef<any>(null);

  // Total pages = Cover(1) + 5 Products(10) + Back Cover(1) = 12
  const totalPages = 12;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextButtonClick = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext();
    }
  };

  const prevButtonClick = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev();
    }
  };

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const handleReserve = (productTitle: string) => {
    onStartBooking(productTitle);
  };

  return (
    <div id="catalog-view" className="bg-white min-h-screen pt-24 pb-12 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="font-display font-black text-2xl text-gray-900 uppercase">
              Catalogue <span className="text-orange-500">Interactif</span>
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              Tournez les pages pour découvrir
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={prevButtonClick}
              disabled={currentPage === 0}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-gray-400 min-w-[60px] text-center">
              {currentPage} / {totalPages - 1}
            </span>
            <button 
              onClick={nextButtonClick}
              disabled={currentPage >= totalPages - 1}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Flipbook Container */}
        <div className="flex justify-center items-center w-full relative">
          <div className="w-full drop-shadow-2xl flex justify-center">
            {/* @ts-ignore - react-pageflip types are incomplete */}
            <HTMLFlipBook
              width={isMobile ? 320 : 450}
              height={isMobile ? 480 : 600}
              size="stretch"
              minWidth={300}
              maxWidth={500}
              minHeight={400}
              maxHeight={700}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              onFlip={onPage}
              className="catalog-flipbook"
              ref={flipBookRef}
              usePortrait={true}
            >
              {/* PAGE 0: FRONT COVER (Right) */}
              <Page number={0} density="hard" hidePageNumber>
                <div className="w-full h-full bg-white border-l-8 border-orange-500 p-8 sm:p-12 flex flex-col items-center justify-center text-center relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />
                  
                  <img src={CATALOG_META.logo} alt="RM Events Logo" className="w-24 h-24 sm:w-32 sm:h-32 mb-8 object-contain drop-shadow-sm" />
                  
                  <div className="inline-block px-3 py-1 bg-gray-900 text-white font-bold text-[9px] uppercase tracking-widest mb-4">
                    Collection 2026
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none mb-3">
                    Catalogue <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">RM Events</span>
                  </h1>
                  
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-12">
                    Matériel & Éclairage VIP
                  </p>
                  
                  <button 
                    onClick={nextButtonClick}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold uppercase text-xs tracking-widest rounded-none hover:bg-orange-500 transition-colors"
                  >
                    <span>Ouvrir le Catalogue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Page>

              {/* PRODUCT PAGES */}
              {CATALOG_PRODUCTS.flatMap((product, index) => {
                const pageNumLeft = 1 + (index * 2);
                const pageNumRight = 2 + (index * 2);
                
                return [
                    /* LEFT PAGE: IMAGE (Odd Pages: 1, 3, 5, 7) */
                    <Page key={`${product.title}-left`} number={pageNumLeft}>
                      <div className="w-full h-full bg-white p-6 sm:p-10 flex flex-col justify-center shadow-none border-none">
                        <div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center shadow-none border-none overflow-hidden group">
                          {/* Subtle background element */}
                          
                          
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-full h-full object-contain relative z-10"
                          />
                        </div>
                      </div>
                    </Page>,

                    /* RIGHT PAGE: DETAILS (Even Pages: 2, 4, 6, 8) */
                    <Page key={`${product.title}-right`} number={pageNumRight}>
                      <div className="w-full h-full bg-white p-6 sm:p-10 flex flex-col justify-center">
                        <div className="inline-block px-3 py-1 bg-orange-100 text-orange-600 font-bold text-[9px] uppercase tracking-wider rounded-sm mb-4 w-fit">
                          {product.category}
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl font-black text-black uppercase leading-tight mb-4">
                          {product.title}
                        </h2>
                        
                        <p className="text-xs sm:text-sm text-gray-600 mb-6 font-medium leading-relaxed">
                          {product.description}
                        </p>
                        
                        <div className="space-y-3 mb-8">
                          {product.pointsForts.slice(0, 3).map((point, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-700 font-medium leading-tight">{point}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-3">
                          <button 
                            onClick={() => handleReserve(product.title)}
                            className="w-full py-3.5 bg-black hover:bg-orange-500 text-white font-bold uppercase text-xs tracking-widest rounded-none transition-colors flex items-center justify-center gap-2"
                          >
                            <span>Ajouter au devis</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleReserve(product.title)}
                            className="w-full py-3.5 bg-white border-2 border-black hover:bg-black hover:text-white text-black font-bold uppercase text-xs tracking-widest rounded-none transition-colors flex items-center justify-center gap-2"
                          >
                            <span>Simuler mon devis</span>
                          </button>
                        </div>
                      </div>
                    </Page>
                ];
              })}

              {/* PAGE 11: BACK COVER (Left) */}
              <Page number={11} density="hard" hidePageNumber>
                <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-12 text-center border-r-8 border-orange-500 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0%,transparent_70%)] pointer-events-none" />
                  
                  <h3 className="text-2xl font-black uppercase mb-2">RM Events</h3>
                  <p className="text-xs text-orange-500 font-bold tracking-widest uppercase mb-8">Contact & Réservation</p>
                  
                  <div className="space-y-4 text-sm font-medium">
                    <p className="flex items-center justify-center gap-2 text-gray-300">
                      <span className="text-orange-500">Tél:</span> {CATALOG_META.phone}
                    </p>
                    <p className="flex items-center justify-center gap-2 text-gray-300">
                      <span className="text-orange-500">Dakar, Sénégal</span>
                    </p>
                  </div>
                  
                  <div className="mt-12 text-[9px] text-gray-500 uppercase tracking-widest">
                    © 2026 RM Events - Tous droits réservés.
                  </div>
                </div>
              </Page>
            </HTMLFlipBook>
          </div>
        </div>

        {/* Minimalist Navigation Dots */}
        <div className="flex justify-center items-center gap-2 mt-4 pb-8">
          {Array.from({ length: Math.ceil(totalPages / 2) }).map((_, idx) => {
            const spreadIdx = idx * 2;
            const isActive = currentPage === spreadIdx || currentPage === spreadIdx + 1 || (idx === 0 && currentPage === 0) || (idx === 5 && currentPage === 11);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (flipBookRef.current) {
                    flipBookRef.current.pageFlip().turnToPage(idx === 0 ? 0 : idx === 5 ? 11 : spreadIdx);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${isActive ? 'bg-orange-500 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                title={`Aller à la page ${spreadIdx}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

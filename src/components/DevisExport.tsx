import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Loader2 } from 'lucide-react';
import { formatPrice } from '../utils/format';

// Helper pour garantir le formatage correct du prix avec un espace standard


// Mock data as requested
const MOCK_DEVIS_DATA = {
  devisNumber: 'RM-RES-6869',
  date: '20/08/2026',
  client: {
    name: 'Melaine TCHENOU',
    email: 'rtchenou23@gmail.com',
    phone: '772721304',
  },
  event: {
    date: '2026-07-21',
    time: '20:00',
    duration: 'Demi-journée ou Soirée entière',
    location: 'Almadies / Ngor / Ouakam',
  },
  items: [
    { name: 'Photobooth 360° Motorisé', qty: 1, price: 60000 },
    { name: 'Jeu de Réflexe / Catching Stick Game', qty: 1, price: 120000 },
    { name: 'Lyre de Scène Asservie Paires', qty: 1, price: 150000 },
    { name: 'Projecteur LED Studio Paires', qty: 1, price: 10000 },
    { name: 'Barre VIP / Potelets Paires', qty: 1, price: 10000 },
  ],
  total: 350000,
};

export default function DevisExport() {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGenerating(true);
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Devis_${MOCK_DEVIS_DATA.devisNumber}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Bouton d'export visible */}
      <button
        onClick={handleDownloadPdf}
        disabled={isGenerating}
        className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-none hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        <span>{isGenerating ? 'Génération...' : 'Télécharger le Devis PDF'}</span>
      </button>

      {/* 
        Conteneur A4 caché pour la capture 
        Il ne doit SURTOUT PAS être en "display: none" (hidden) 
        On utilise absolute, -z-10, opacity-0, pointer-events-none 
      */}
      <div className="overflow-hidden absolute top-0 left-0 -z-10 opacity-0 pointer-events-none">
        <div
          ref={printRef}
          className="w-[794px] h-[1123px] bg-white text-black p-12 flex flex-col box-border font-sans"
        >
          {/* 1. En-tête */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                Devis Provisoire
              </h1>
              <p className="text-gray-600 text-sm font-medium">Émis le : {MOCK_DEVIS_DATA.date}</p>
              <p className="text-gray-600 text-sm font-medium">Devis N° : {MOCK_DEVIS_DATA.devisNumber}</p>
            </div>
            {/* Logo RM en très gros */}
            <div className="w-24 h-24 bg-orange-600 text-white flex items-center justify-center font-black text-5xl">
              RM
            </div>
          </div>

          {/* 2. Blocs Adresses (2 colonnes) */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* Émetteur */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Émetteur
              </h3>
              <p className="font-bold text-lg text-gray-900">RM Events</p>
              <p className="text-sm text-gray-700 mt-1">Contact: Melaine TCHENOU</p>
              <p className="text-sm text-gray-700">Téléphone: 77 976 20 75</p>
              <p className="text-sm text-gray-700">Email: rmevent360@gmail.com</p>
            </div>

            {/* Destinataire */}
            <div className="border-l-4 border-gray-800 pl-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Destinataire
              </h3>
              <p className="font-bold text-lg text-gray-900">{MOCK_DEVIS_DATA.client.name}</p>
              <p className="text-sm text-gray-700 mt-1">Téléphone: {MOCK_DEVIS_DATA.client.phone}</p>
              <p className="text-sm text-gray-700">Email: {MOCK_DEVIS_DATA.client.email}</p>
            </div>
          </div>

          {/* 3. Détails de l'événement */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-10">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
              Détails de l'événement
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Date</span>
                <p className="text-sm font-bold text-gray-900">{MOCK_DEVIS_DATA.event.date}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Heure</span>
                <p className="text-sm font-bold text-gray-900">{MOCK_DEVIS_DATA.event.time}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Durée</span>
                <p className="text-sm font-bold text-gray-900">{MOCK_DEVIS_DATA.event.duration}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold">Localité</span>
                <p className="text-sm font-bold text-gray-900">{MOCK_DEVIS_DATA.event.location}</p>
              </div>
            </div>
          </div>

          {/* 4. Tableau des articles */}
          <div className="flex-grow mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y-2 border-black">
                  <th className="py-3 text-sm font-bold uppercase tracking-wider text-gray-900 w-1/2">Désignation</th>
                  <th className="py-3 text-sm font-bold uppercase tracking-wider text-gray-900 text-right">Prix Unitaire</th>
                  <th className="py-3 text-sm font-bold uppercase tracking-wider text-gray-900 text-center">Quantité</th>
                  <th className="py-3 text-sm font-bold uppercase tracking-wider text-gray-900 text-right">S. Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_DEVIS_DATA.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-4 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="py-4 text-sm text-gray-600 text-right">{formatPrice(item.price)} FCFA</td>
                    <td className="py-4 text-sm text-gray-600 text-center">{item.qty}</td>
                    <td className="py-4 text-sm font-bold text-gray-900 text-right">{formatPrice(item.price * item.qty)} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Total */}
            <div className="flex justify-end mt-4">
              <div className="w-1/2 border-y-2 border-black py-4 flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-widest text-gray-900">Total Général</span>
                <span className="text-xl font-black text-orange-600">{formatPrice(MOCK_DEVIS_DATA.total)} FCFA</span>
              </div>
            </div>
          </div>

          {/* 5. Pied de page (Conditions) */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs font-bold text-gray-800 uppercase mb-1">Validité : <span className="font-normal text-gray-600">30 jours</span></p>
                <p className="text-xs font-bold text-gray-800 uppercase">Statut : <span className="font-bold text-green-600">DEVIS ENREGISTRÉ AVEC SUCCÈS.</span></p>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded text-[10px] text-gray-700 leading-relaxed text-justify mb-8 border border-orange-100">
              Après validation du devis, une avance de 50% est requise pour confirmation. Le solde est perçu après la prestation. <span className="font-bold">Note importante:</span> RM Events assure l'installation des terminaux mobiles (tablettes et smartphones) des utilisateurs. Les prestations de RM Events n'incluent aucun déploiement d'appareil photo destiné à filmer les participants.
            </div>

            <div className="text-center text-[9px] text-gray-400 font-medium tracking-wide uppercase">
              <p>Contact WhatsApp / Téléphone : +221 77 976 20 75</p>
              <p className="mt-1">Page 1 sur 1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

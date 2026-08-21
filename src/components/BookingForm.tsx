import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, Mail, User, ShieldCheck, Ticket, Download, ArrowRight, Check, MapPin, Sparkles, ChevronDown, Camera, Zap, Lightbulb, Award, Plus, Minus, ShoppingCart, X, Target } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Booking } from '../types';
import rmEventsLogo from '../assets/images/rm_events_logo_1781896594927.jpg';

// Helper function to load and convert image URL to base64 for PDF document embedding
const getBase64Image = (imgUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgUrl;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          resolve(dataURL);
        } else {
          resolve('');
        }
      } catch (err) {
        console.warn('Canvas export warning:', err);
        resolve('');
      }
    };
    img.onerror = () => {
      resolve('');
    };
  });
};

// Helper pour garantir le formatage correct du prix avec un espace standard
const formatPrice = (value: number | string): string => {
  let numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/\//g, ''), 10) 
    : value;
    
  if (isNaN(numericValue)) numericValue = 0;
  
  return numericValue.toLocaleString('fr-FR').replace(/\u202f/g, ' ');
};

interface BookingFormProps {
  onAddBooking: (newBooking: Booking) => void;
  preselectedItem?: string | null;
}

export default function BookingForm({ onAddBooking, preselectedItem }: BookingFormProps) {
  // Client Detail States (Step 2)
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('2026-07-20');
  const [eventHour, setEventHour] = useState('18:00');
  const [dakarDistrict, setDakarDistrict] = useState('Almadies / Ngor / Ouakam');

  // Dakar neighborhood list
  const neighborhoods = [
    'Almadies / Ngor / Ouakam',
    'Mermoz / Sacré-Cœur',
    'Fann / Point E / Amitié',
    'Plateau (Centre-Ville)',
    'Parcelles Assainies / Patte d\'Oie',
    'Hann Maristes',
    'Guédiawaye / Pikine',
    'Rufisque / Lac Rose',
    'Autre secteur (Région Dakar)'
  ];

  // Duration options requested by client
  const durationOptions = [
    'Demi-journée ou Soirée entière',
    'Journée Pleine'
  ];

  // Duration selector (Step 1)
  const [duration, setDuration] = useState<string>('Demi-journée ou Soirée entière');
  const [customWishes, setCustomWishes] = useState('');

  // Options states (Step 1)
  const [optPhotobooth, setOptPhotobooth] = useState(true);
  const [optReflexe, setOptReflexe] = useState(false);
  const [qtyLyre, setQtyLyre] = useState(0); // 0, 1, 2 paires
  const [qtyProjecteur, setQtyProjecteur] = useState(0); // up to 4 paires
  const [qtyPotelets, setQtyPotelets] = useState(0); // up to 6 paires

  useEffect(() => {
    if (preselectedItem) {
      setOptPhotobooth(false);
      setOptReflexe(false);
      setQtyLyre(0);
      setQtyProjecteur(0);
      setQtyPotelets(0);
      
      const item = preselectedItem.toLowerCase();
      if (item.includes('photobooth')) setOptPhotobooth(true);
      else if (item.includes('réflexe') || item.includes('reflexe')) setOptReflexe(true);
      else if (item.includes('lyre')) setQtyLyre(1);
      else if (item.includes('projecteur')) setQtyProjecteur(1);
      else if (item.includes('potelet') || item.includes('barre')) setQtyPotelets(1);
    }
  }, [preselectedItem]);


  // Calculate total based on rules
  const calculateTotal = () => {
    let total = 0;
    const isLong = duration === 'Journée Pleine';
    
    if (optPhotobooth) {
      total += isLong ? 100000 : 60000;
    }
    
    if (optReflexe) {
      total += isLong ? 200000 : 120000;
    }
    
    total += qtyLyre * 100000;
    total += qtyProjecteur * (isLong ? 15000 : 10000);
    total += qtyPotelets * (isLong ? 15000 : 10000);
    
    return total;
  };
  
  const totalPrice = calculateTotal();

  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Success Modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<Booking | null>(null);

  // Submit handler (Step 1) - Opens the Summary Pre-Booking Modal
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPrice === 0) {
      alert('Veuillez sélectionner au moins un équipement pour simuler un devis.');
      return;
    }
    setShowSummaryModal(true);
  };

  // Final Submit handler (Step 2)
  const confirmAndSendBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !eventDate || !eventHour || !dakarDistrict) {
      alert('Veuillez renseigner toutes vos coordonnées pour la réservation.');
      return;
    }
    
    const ticketId = `RM-RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const calculatedSlot = `${eventHour} (${duration})`;

    const newBooking: Booking = {
      id: ticketId,
      clientName,
      clientEmail,
      clientPhone,
      date: eventDate,
      timeSlot: calculatedSlot,
      duration,
      options: {
        photobooth360: optPhotobooth,
        reflexeGame: optReflexe,
        lyreScene: qtyLyre > 0,
        lyreSceneQty: qtyLyre,
        projecteurLed: qtyProjecteur > 0,
        projecteurLedQty: qtyProjecteur,
        poteletsDores: qtyPotelets > 0,
        poteletsDoresQty: qtyPotelets,
      },
      totalPrice: totalPrice,
      discountApplied: 0,
      paymentStatus: 'pending',
      amountPaid: 0,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setShowSummaryModal(false);
    onAddBooking(newBooking);
    setGeneratedTicket(newBooking);
    setShowConfirmationModal(true);
    triggerAutoNotificationEmail(newBooking);
  };

  const triggerAutoNotificationEmail = async (booking: Booking) => {
    try {
      const payload = {
        type: 'reservation',
        id: booking.id,
        paymentStatus: booking.paymentStatus,
        client: {
          nom: booking.clientName,
          email: booking.clientEmail || 'Non spécifié',
          telephone: booking.clientPhone
        },
        details: `Date de l'événement : ${booking.date}\nCréneau : ${booking.timeSlot}\nDurée : ${booking.duration}\nAdresse/Quartier : ${dakarDistrict || 'Dakar, Sénégal'}\nOptions Sélectionnées :\n- Photobooth 360° : ${booking.options.photobooth360 ? 'Oui' : 'Non'}\n- Jeu de Réflexe : ${booking.options.reflexeGame ? 'Oui' : 'Non'}\n- Lyre de Scène : ${booking.options.lyreSceneQty || 0} paires\n- Projecteur LED : ${booking.options.projecteurLedQty || 0} paires\n- Potelets Dorés VIP : ${booking.options.poteletsDoresQty || 0} paires\nTotal Devis : ${formatPrice(booking.totalPrice)} FCFA\nCommentaire : ${customWishes.trim() || 'Aucun'}`,
      };

      const response = await fetch('/api/valider-evenement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('Notification envoyée:', result);
    } catch (err) {
      console.error('Erreur lors du déclenchement du mail automatique:', err);
    }
  };

  // Downloadable ticket as a professional PDF with the brand logo embedded
  const handleDownloadReceipt = async () => {
    if (!generatedTicket) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top decorative stripe
      doc.setFillColor(249, 115, 22); // Orange F97316
      doc.rect(0, 0, pageWidth, 5, 'F');
      doc.setFillColor(26, 26, 26); // Dark
      doc.rect(0, 5, pageWidth, 2, 'F');

      const centerText = (text: string, yValue: number, style: 'normal' | 'bold' = 'normal', size = 11, color = [30, 41, 59]) => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, yValue);
      };

      // Load logo
      try {
        const logoBase64 = await getBase64Image(rmEventsLogo);
        if (logoBase64) {
          doc.addImage(logoBase64, 'JPEG', (pageWidth - 32) / 2, 14, 32, 32);
        } else {
          centerText("RM EVENTS DAKAR", 26, 'bold', 18, [249, 115, 22]);
        }
      } catch (err) {
        centerText("RM EVENTS DAKAR", 26, 'bold', 18, [249, 115, 22]);
      }

      // Title & Header details
      const currentY = 54;
      centerText("DEVIS OFFICIEL", currentY, 'bold', 14, [26, 26, 26]);

      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(0.6);
      doc.line((pageWidth - 70) / 2, currentY + 3, (pageWidth + 70) / 2, currentY + 3);

      // Metadata Block
      let y = currentY + 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);

      const docIdLabel = `Devis N° : ${generatedTicket.id}`;
      const docDateLabel = `Émis le : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 26, 26);
      doc.text(docIdLabel, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      const dateWidth = doc.getTextWidth(docDateLabel);
      doc.text(docDateLabel, pageWidth - 20 - dateWidth, y);

      y += 6;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(20, y, pageWidth - 20, y);

      // Client Details
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("1. COORDONNÉES DU CLIENT", 20, y);

      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);

      const drawDetailRow = (label: string, value: string, rowY: number) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(label, 20, rowY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        doc.text(value, 70, rowY);
      };

      drawDetailRow("Client / Société :", generatedTicket.clientName, y);
      y += 6;
      drawDetailRow("Adresse E-mail :", generatedTicket.clientEmail || "Non communiqué", y);
      y += 6;
      drawDetailRow("Téléphone :", generatedTicket.clientPhone, y);
      y += 6;
      drawDetailRow("Prestataire :", "RM EVENTS SÉNÉGAL (Dakar)", y);

      // Event Details
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, pageWidth - 20, y);

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("2. DÉTAILS DE L'ÉVÉNEMENT", 20, y);

      y += 6;
      drawDetailRow("Date de Prestation :", generatedTicket.date, y);
      y += 6;
      drawDetailRow("Heure de Début :", generatedTicket.timeSlot, y);
      y += 6;
      drawDetailRow("Durée de présence :", generatedTicket.duration, y);
      y += 6;
      drawDetailRow("Localité / Secteur :", dakarDistrict, y);

      // Options & Tarifs
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, pageWidth - 20, y);

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("3. DEVIS DÉTAILLÉ & ÉQUIPEMENTS", 20, y);

      y += 8;
      // Header row
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y, pageWidth - 40, 8, 'F');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("DÉSIGNATION", 22, y + 5);
      doc.text("QTÉ", 130, y + 5);
      doc.text("S. TOTAL", 170, y + 5, { align: 'right' });
      
      y += 12;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      
      const isLong = generatedTicket.duration === 'Journée Pleine';

      const drawItemRow = (name: string, qty: string, price: number) => {
        doc.text(name, 22, y);
        doc.text(qty, 130, y);
        doc.text(`${formatPrice(price)} FCFA`, 170, y, { align: 'right' });
        y += 7;
      };

      if (generatedTicket.options.photobooth360) {
        drawItemRow("Photobooth 360° Motorisé", "1", isLong ? 100000 : 60000);
      }
      if (generatedTicket.options.reflexeGame) {
        drawItemRow("Jeu de Réflexe (Catching Stick Game)", "1", isLong ? 200000 : 120000);
      }
      if (generatedTicket.options.lyreSceneQty) {
        drawItemRow("Lyre de Scène Asservie (Paires)", generatedTicket.options.lyreSceneQty.toString(), generatedTicket.options.lyreSceneQty * 100000);
      }
      if (generatedTicket.options.projecteurLedQty) {
        drawItemRow("Projecteur LED Studio (Paires)", generatedTicket.options.projecteurLedQty.toString(), generatedTicket.options.projecteurLedQty * (isLong ? 15000 : 10000));
      }
      if (generatedTicket.options.poteletsDoresQty) {
        drawItemRow("Barre VIP / Potelets (Paires)", generatedTicket.options.poteletsDoresQty.toString(), generatedTicket.options.poteletsDoresQty * (isLong ? 15000 : 10000));
      }

      y += 2;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, pageWidth - 20, y);
      
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      doc.text("TOTAL DEVIS ESTIMATIF", 22, y);
      doc.setTextColor(249, 115, 22);
      doc.text(`${formatPrice(generatedTicket.totalPrice)} FCFA`, 170, y, { align: 'right' });

      // Special wishes
      if (customWishes.trim()) {
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(80, 80, 80);
        doc.text("Remarques / Souhaits :", 20, y);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const splitWishes = doc.splitTextToSize(customWishes.trim(), pageWidth - 40);
        doc.text(splitWishes, 20, y + 5);
        y += splitWishes.length * 5 + 4;
      }

      // Status Box
      y += 10;
      doc.setFillColor(255, 247, 237); // orange-50
      doc.setDrawColor(253, 186, 116); // orange-300
      doc.roundedRect(20, y, pageWidth - 40, 22, 2, 2, 'FD');

      doc.setTextColor(194, 65, 12); // orange-700
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("STATUT : DEVIS ENREGISTRÉ AVEC SUCCÈS", pageWidth / 2, y + 8, { align: 'center' });

      doc.setTextColor(90, 90, 90);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text("Notre régisseur vous contactera afin de valider la logistique et la réservation finale.", pageWidth / 2, y + 15, { align: 'center' });

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("RM EVENTS SÉNÉGAL • Dakar, Sénégal • WhatsApp : +221 77 976 20 75", pageWidth / 2, pageHeight - 16, { align: 'center' });
      doc.text("Document officiel de devis et d'estimation", pageWidth / 2, pageHeight - 11, { align: 'center' });

      doc.save(`Devis-${generatedTicket.id}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Une erreur s'est produite lors de la génération du PDF.");
    }
  };

  return (
    <div id="booking-view-anchor" className="space-y-6">
      
      {/* ÉTAPE 1: MAIN RESERVATION FORM */}
      <form onSubmit={handleBookingSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-sm space-y-8 rounded-2xl relative overflow-hidden">
          {/* Subtle bg glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl mx-auto text-center space-y-3 pb-4 border-b border-gray-100 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-orange-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Étape 1 sur 2</span>
            </div>
            <h4 className="font-display font-black text-gray-950 text-2xl sm:text-3xl tracking-tight">
              Simulateur de Devis Instantané
            </h4>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Configurez votre événement sans engagement. Ajustez les quantités pour estimer le tarif instantanément.
            </p>
          </div>

          <div className="relative z-10">

            {/* Section 1: Choix de la durée */}
            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl mb-8">
              <h5 className="font-display font-black text-gray-900 text-sm uppercase tracking-wider flex items-center space-x-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>1. Choix de la Durée</span>
              </h5>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                  Durée de la prestation
                </label>
                <div className="relative max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 pointer-events-none">
                    <Clock className="w-4 h-4" />
                  </span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border-2 border-orange-200 hover:border-orange-400 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 font-bold cursor-pointer appearance-none transition-all"
                  >
                    {durationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Le tarif de certains équipements s'ajustera automatiquement si vous choisissez la journée pleine.</p>
              </div>
            </div>

            {/* Section 2: Equipment from Catalog */}
            <div className="space-y-6">
              <h5 className="font-display font-black text-gray-900 text-sm uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <span>2. Sélection du Matériel & Équipements</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Photobooth 360 */}
                <div className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl p-4 flex flex-col justify-between ${optPhotobooth ? 'border-orange-500 bg-orange-50/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {optPhotobooth && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">Inclus</div>}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${optPhotobooth ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-gray-900 text-sm">Photobooth 360°</h6>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">Plateforme motorisée, Ring Light LED & accessoires.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/50 pt-3">
                    <span className="text-sm font-black text-orange-600">
                      {formatPrice(duration === 'Journée Pleine' ? 100000 : 60000)} FCFA
                    </span>
                    <button
                      type="button"
                      onClick={() => setOptPhotobooth(!optPhotobooth)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${optPhotobooth ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-900 text-white hover:bg-black'}`}
                    >
                      {optPhotobooth ? 'Retirer' : 'Ajouter'}
                    </button>
                  </div>
                </div>


                {/* Jeu de Réflexe */}
                <div className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl p-4 flex flex-col justify-between ${optReflexe ? 'border-orange-500 bg-orange-50/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {optReflexe && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">Inclus</div>}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${optReflexe ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-gray-900 text-sm">Jeu de Réflexe</h6>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">Borne interactive Catching Stick Game.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/50 pt-3">
                    <span className="text-sm font-black text-orange-600">
                      {formatPrice(duration === 'Journée Pleine' ? 200000 : 120000)} FCFA
                    </span>
                    <button
                      type="button"
                      onClick={() => setOptReflexe(!optReflexe)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${optReflexe ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-900 text-white hover:bg-black'}`}
                    >
                      {optReflexe ? 'Retirer' : 'Ajouter'}
                    </button>
                  </div>
                </div>

                {/* Lyre de Scène */}
                <div className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl p-4 flex flex-col justify-between ${qtyLyre > 0 ? 'border-orange-500 bg-orange-50/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {qtyLyre > 0 && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">{qtyLyre} PAIRE{qtyLyre > 1 ? 'S' : ''}</div>}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${qtyLyre > 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h6 className="font-bold text-gray-900 text-sm">Lyre de Scène</h6>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">Moving head beam asservi pour effets dynamiques.</p>
                      <span className="text-[9px] font-bold text-gray-400 block mt-1">Tarif fixe: 100 000 FCFA / paire</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/50 pt-3">
                    <span className="text-sm font-black text-orange-600">
                      {formatPrice(qtyLyre * 100000)} FCFA
                    </span>
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                      <button type="button" onClick={() => setQtyLyre(Math.max(0, qtyLyre - 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 hover:bg-gray-50 disabled:opacity-50" disabled={qtyLyre === 0}>
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{qtyLyre}</span>
                      <button type="button" onClick={() => setQtyLyre(Math.min(2, qtyLyre + 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 hover:bg-gray-50 disabled:opacity-50" disabled={qtyLyre === 2}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Projecteur LED */}
                <div className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl p-4 flex flex-col justify-between ${qtyProjecteur > 0 ? 'border-orange-500 bg-orange-50/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {qtyProjecteur > 0 && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">{qtyProjecteur} PAIRE{qtyProjecteur > 1 ? 'S' : ''}</div>}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${qtyProjecteur > 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Lightbulb className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-gray-900 text-sm">Projecteur LED (Trépied)</h6>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">Éclairage d'ambiance et studio haute puissance.</p>
                      <span className="text-[9px] font-bold text-gray-400 block mt-1">{formatPrice(duration === 'Journée Pleine' ? 15000 : 10000)} FCFA / paire</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/50 pt-3">
                    <span className="text-sm font-black text-orange-600">
                      {formatPrice(qtyProjecteur * (duration === 'Journée Pleine' ? 15000 : 10000))} FCFA
                    </span>
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                      <button type="button" onClick={() => setQtyProjecteur(Math.max(0, qtyProjecteur - 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 hover:bg-gray-50 disabled:opacity-50" disabled={qtyProjecteur === 0}>
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{qtyProjecteur}</span>
                      <button type="button" onClick={() => setQtyProjecteur(Math.min(4, qtyProjecteur + 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 hover:bg-gray-50 disabled:opacity-50" disabled={qtyProjecteur === 4}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Potelets VIP */}
                <div className={`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl p-4 flex flex-col justify-between ${qtyPotelets > 0 ? 'border-orange-500 bg-orange-50/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  {qtyPotelets > 0 && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">{qtyPotelets} PAIRE{qtyPotelets > 1 ? 'S' : ''}</div>}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${qtyPotelets > 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-gray-900 text-sm">Potelets Dorés VIP</h6>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">Cordon velours rouge pour accueil VIP.</p>
                      <span className="text-[9px] font-bold text-gray-400 block mt-1">{formatPrice(duration === 'Journée Pleine' ? 15000 : 10000)} FCFA / paire</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/50 pt-3">
                    <span className="text-sm font-black text-orange-600">
                      {formatPrice(qtyPotelets * (duration === 'Journée Pleine' ? 15000 : 10000))} FCFA
                    </span>
                    <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                      <button type="button" onClick={() => setQtyPotelets(Math.max(0, qtyPotelets - 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-500 hover:bg-gray-50 disabled:opacity-50" disabled={qtyPotelets === 0}>
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{qtyPotelets}</span>
                      <button type="button" onClick={() => setQtyPotelets(Math.min(6, qtyPotelets + 1))} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 hover:bg-gray-50 disabled:opacity-50" disabled={qtyPotelets === 6}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-8">
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">
                Commentaire, détails de l'événement ou souhaits particuliers (Optionnel)
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Soirée d'anniversaire au bord de la piscine, précisions sur l'accès et le lieu..."
                value={customWishes}
                onChange={(e) => setCustomWishes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Action & Bottom Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-white p-5 md:p-6 border border-gray-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden shadow-sm mt-6">
            {/* Subtle highlight */}
            <div className="absolute top-0 left-0 w-1 bg-orange-500 h-full"></div>
            
            <div className="text-center md:text-left">
              <span className="text-[10px] font-extrabold text-gray-500 block uppercase tracking-wider mb-1">
    Total Estimé
  </span>
              <div className="flex items-end justify-center md:justify-start gap-2">
                <span className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                  {formatPrice(totalPrice)}
                </span>
                <span className="text-sm font-bold text-gray-400 mb-1">FCFA</span>
              </div>
              <span className="text-[10px] text-gray-500 block mt-1">
                Prestation : {duration}. <span className="text-orange-600 font-bold">Sans engagement.</span>
              </span>
            </div>
            <button
              type="submit"
              disabled={totalPrice === 0}
              className="w-full md:w-auto px-10 py-4 bg-gray-950 hover:bg-black disabled:bg-gray-400 text-white font-black uppercase text-xs tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Recevoir mon devis par e-mail</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* ÉTAPE 2: PRE-BOOKING SUMMARY MODAL & CONTACT FORM */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border-2 border-orange-500 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-fade-in my-8 relative flex flex-col md:flex-row">
            
            {/* Left Col: Summary */}
            <div className="w-full md:w-1/3 bg-gray-950 text-white p-6 sm:p-8 flex flex-col">
              <div className="mb-8">
                <h5 className="font-display font-extrabold text-xl uppercase tracking-wider">
                  Votre Devis
                </h5>
                <p className="text-gray-400 text-xs mt-1">
                  Étape 2 sur 2 : Récapitulatif
                </p>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h6 className="font-bold text-xs text-orange-500 uppercase tracking-wider mb-3">Matériel Inclus</h6>
                  <ul className="space-y-3 text-sm text-gray-300 font-medium">
                    {optPhotobooth && (
                      <li className="flex gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>Photobooth 360°</span>
                      </li>
                    )}

                    {optReflexe && (
                      <li className="flex gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>Jeu de Réflexe</span>
                      </li>
                    )}
                    {qtyLyre > 0 && (
                      <li className="flex gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>Lyre de Scène ({qtyLyre} paire{qtyLyre > 1 ? 's' : ''})</span>
                      </li>
                    )}
                    {qtyProjecteur > 0 && (
                      <li className="flex gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>Projecteur LED ({qtyProjecteur} paire{qtyProjecteur > 1 ? 's' : ''})</span>
                      </li>
                    )}
                    {qtyPotelets > 0 && (
                      <li className="flex gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>Potelets Dorés ({qtyPotelets} paire{qtyPotelets > 1 ? 's' : ''})</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-800">
                <span className="text-xs font-bold text-gray-500 uppercase block mb-2">Total Estimé</span>
                <span className="text-3xl font-black text-orange-500 leading-none">{formatPrice(totalPrice)} FCFA</span>
                <span className="text-[10px] text-gray-400 block mt-2">{duration}</span>
                <span className="text-[10px] text-gray-400 italic block mt-1">simulation sans engagement - Ajustez vos choix librement</span>
              </div>
            </div>

            {/* Right Col: Contact Form */}
            <form onSubmit={confirmAndSendBooking} className="w-full md:w-2/3 bg-white p-6 sm:p-8 relative">
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h4 className="font-display font-black text-gray-950 text-2xl tracking-tight mb-2">
                Recevoir mon devis par e-mail
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                Veuillez saisir vos coordonnées et les détails de l'événement pour recevoir votre devis officiel.
              </p>

              <div className="space-y-6">
                {/* Logistics */}
                <div className="space-y-4">
                  <h5 className="font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">
                    Détails Logistiques
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                        Date Prestation
                      </label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                        Heure de Début
                      </label>
                      <input
                        type="time"
                        required
                        value={eventHour}
                        onChange={(e) => setEventHour(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                        Localité de la prestation (Dakar)
                      </label>
                      <select
                        value={dakarDistrict}
                        onChange={(e) => setDakarDistrict(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-bold"
                      >
                        {neighborhoods.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h5 className="font-bold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mt-4">
                    Vos Coordonnées
                  </h5>
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                      Nom Complet / Entreprise
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sokhna Diagne ou BDE Supdeco"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nom@exemple.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+221 77 976 20 75"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors shadow-lg flex justify-center items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Confirmer & Recevoir le Devis</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION TICKET MODAL */}
      {showConfirmationModal && generatedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-orange-500/30 rounded-none max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-fade-in my-8">
            
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>

              <div className="space-y-1">
                <h5 className="font-display font-extrabold text-gray-950 text-xl">
                  Devis Généré avec Succès !
                </h5>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Votre demande de devis a été enregistrée dans notre planning. Notre équipe RM EVENTS vous contactera par téléphone pour les détails logistiques.
                </p>
              </div>
            </div>

            {/* Ticket representation */}
            <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-left text-xs space-y-3.5 relative overflow-hidden">
              
              {/* Decorative stamp */}
              <div className="absolute -top-3 -right-3 w-20 h-20 border-4 border-dashed border-orange-500/25 rounded-full flex items-center justify-center rotate-12 text-[7.5px] text-orange-500 font-extrabold select-none text-center leading-tight">
                RÉSERVÉ
              </div>

              <div className="border-b border-gray-200 pb-2.5">
                <span className="text-[9px] text-gray-500 font-mono block uppercase">
                  ID Devis
                </span>
                <strong className="text-base text-gray-900 font-mono">{generatedTicket.id}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 text-gray-650">
                <div>Client : <strong className="text-gray-900 block">{generatedTicket.clientName}</strong></div>
                <div>Téléphone : <span className="font-mono block text-gray-900">{generatedTicket.clientPhone}</span></div>
                <div>Date : <strong className="text-gray-900 block">{generatedTicket.date}</strong></div>
                <div>Créneau : <span className="font-mono block text-gray-900">{generatedTicket.timeSlot}</span></div>
                <div>Durée : <strong className="text-gray-900 block">{generatedTicket.duration}</strong></div>
                <div>Quartier : <span className="block text-gray-900">{dakarDistrict}</span></div>
              </div>

              <div className="pt-2.5 border-t border-dashed border-gray-200 space-y-1 text-gray-550">
                <div className="flex justify-between font-bold text-amber-700 bg-amber-50/70 p-2 border border-amber-100">
                  <span>Total Devis :</span>
                  <span>{formatPrice(generatedTicket.totalPrice)} FCFA</span>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-1 font-sans">
                  Aucun paiement n'est exigé en ligne. Vous pouvez télécharger votre devis officiel ci-dessous.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="flex-1 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs uppercase flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-orange-500" />
                <span>Télécharger le Devis (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmationModal(false);
                  setClientName('');
                  setClientEmail('');
                }}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase cursor-pointer shadow-sm"
              >
                Terminer
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Phone, Mail, User, ShieldCheck, Ticket, QrCode, CreditCard, Sparkles, Download, ArrowRight, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { BASE_PRICES, EXTRA_OPTIONS, INITIAL_PROMO_CODES } from '../data';
import { Booking, PromoCode } from '../types';
import rmEventsLogo from '../assets/images/rm_events_logo_1781896594927.jpg';

// Helper function to load and convert image URL to base64 for PDF document embedding
const getBase64Image = (imgUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgUrl;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve(dataURL);
      } else {
        reject(new Error('Failed to get 2d context'));
      }
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};

interface BookingFormProps {
  selectedPackageId: 'standard' | 'bronze' | 'argent' | 'prestige';
  onAddBooking: (newBooking: Booking) => void;
}

export default function BookingForm({ selectedPackageId, onAddBooking }: BookingFormProps) {
  // Navigation tabs for scheduling options
  const [bookingTab, setBookingTab] = useState<'calendar' | 'instant'>('calendar');

  // Client Detail States
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [eventDate, setEventDate] = useState('2026-07-20');
  const [eventHour, setEventHour] = useState('18:00');
  const [dakarDistrict, setDakarDistrict] = useState('Almadies / Ngor / Ouakam');

  // Package & Duration selectors
  const [packageType, setPackageType] = useState<'standard' | 'bronze' | 'argent' | 'prestige'>(selectedPackageId);
  const [duration, setDuration] = useState<number>(3); // hours
  const [isCustomQuoteMode, setIsCustomQuoteMode] = useState(false);
  const [customWishes, setCustomWishes] = useState('');

  // On mounting or modification of selectedPackageId, update state appropriately
  useEffect(() => {
    setPackageType(selectedPackageId);
    if (selectedPackageId === 'standard') setDuration(1);
    else if (selectedPackageId === 'bronze') setDuration(2);
    else if (selectedPackageId === 'argent') setDuration(3);
    else if (selectedPackageId === 'prestige') setDuration(4);
  }, [selectedPackageId]);

  // Options states
  const [customOverlay, setCustomOverlay] = useState(false);
  const [redCarpet, setRedCarpet] = useState(false);
  const [usbMedia, setUsbMedia] = useState(false);
  const [ledLighting, setLedLighting] = useState(false);

  // Promo Code mechanics
  const [typedPromo, setTypedPromo] = useState('');
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Payment configuration
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'orange_money'>('wave');
  const [paymentTier, setPaymentTier] = useState<'total' | 'deposit_only'>('deposit_only');

  // Transaction simulation
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'scan' | 'processing' | 'success'>('scan');
  const [generatedTicket, setGeneratedTicket] = useState<Booking | null>(null);

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

  // Price calculations based on duration
  const basePrice = BASE_PRICES[duration] || (150000 + (duration - 4) * 35000);
  
  // Calculate extras
  let extrasPrice = 0;
  if (customOverlay) extrasPrice += 25000;
  if (redCarpet) extrasPrice += 30000;
  if (usbMedia) extrasPrice += 10000;
  if (ledLighting) extrasPrice += 30000;

  const preDiscountPrice = basePrice + extrasPrice;

  // Apply promo discount
  const discountPercent = activePromo ? activePromo.discountPercent : 0;
  const discountApplied = Math.round(preDiscountPrice * (discountPercent / 100));
  const totalPrice = isCustomQuoteMode ? 0 : (preDiscountPrice - discountApplied);

  // Wave / Orange Money fraction values
  const amountToPayNow = isCustomQuoteMode ? 0 : (paymentTier === 'deposit_only' ? Math.round(totalPrice * 0.5) : totalPrice);

  // Handle Promo Code submission
  const handleValidatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (!typedPromo.trim()) return;

    const matched = INITIAL_PROMO_CODES.find(
      (p) => p.code.toUpperCase() === typedPromo.trim().toUpperCase() && p.active
    );

    if (matched) {
      setActivePromo(matched);
      setPromoSuccess(`Code promo "${matched.code}" validé ! Rabais de ${matched.discountPercent}% appliqué.`);
    } else {
      setActivePromo(null);
      setPromoError('Code promo invalide ou expiré.');
    }
  };

  const handleClearPromo = () => {
    setActivePromo(null);
    setTypedPromo('');
    setPromoSuccess('');
    setPromoError('');
  };

  // Submit handler for Direct Reservation Form (Tab 1 replacement)
  const handleCalendarBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
      alert('Veuillez renseigner toutes vos coordonnées pour la réservation.');
      return;
    }

    const ticketId = `RM-RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const endTimeHour = parseInt(eventHour.split(':')[0]) + duration;
    const calculatedSlot = `${eventHour} - ${endTimeHour}:00`;

    // CalculateTotalPrice with extras
    let extrasPriceVal = 0;
    if (customOverlay) extrasPriceVal += 25000;
    if (redCarpet) extrasPriceVal += 30000;
    if (usbMedia) extrasPriceVal += 10000;
    if (ledLighting) extrasPriceVal += 30000;

    const calcBasePrice = BASE_PRICES[duration] || (150000 + (duration - 4) * 35000);
    const calculatedTotalPrice = calcBasePrice + extrasPriceVal;

    const newBooking: Booking = {
      id: ticketId,
      clientName,
      clientEmail,
      clientPhone,
      date: eventDate,
      timeSlot: calculatedSlot,
      duration,
      packageType,
      options: {
        customOverlay,
        redCarpet,
        usbMedia,
        ledLighting
      },
      totalPrice: calculatedTotalPrice,
      promoCodeUsed: activePromo?.code || undefined,
      discountApplied: discountApplied,
      paymentStatus: 'pending',
      amountPaid: 0,
      paymentMethod: undefined,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      prescripteurId: activePromo?.prescripteurId
    };

    onAddBooking(newBooking);
    setGeneratedTicket(newBooking);
    setCheckoutStep('success'); // skip mock scan / payment steps directly to the confirmation ticket screen
    setShowCheckoutModal(true);
    triggerAutoNotificationEmail(newBooking);
  };

  // Launch checkout simulation
  const handleOpenCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
      alert('Veuillez renseigner toutes vos coordonnées pour la réservation.');
      return;
    }

    if (isCustomQuoteMode) {
      // Direct success for devis / custom quote request
      const ticketId = `RM-DEVIS-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: Booking = {
        id: ticketId,
        clientName,
        clientEmail,
        clientPhone,
        date: eventDate,
        timeSlot: `${eventHour} (Sur Devis)`,
        duration: duration,
        packageType: packageType,
        options: {
          customOverlay,
          redCarpet,
          usbMedia,
          ledLighting
        },
        totalPrice: 0,
        promoCodeUsed: undefined,
        discountApplied: 0,
        paymentStatus: 'pending',
        amountPaid: 0,
        paymentMethod: paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      onAddBooking(newBooking);
      setGeneratedTicket(newBooking);
      setCheckoutStep('success');
      setShowCheckoutModal(true);
      triggerAutoNotificationEmail(newBooking);
    } else {
      setCheckoutStep('scan');
      setShowCheckoutModal(true);
    }
  };

  // Confirm payment in sandbox Simulation
  const handleConfirmMockPayment = () => {
    setCheckoutStep('processing');
    
    // Simulate Senegal telecom check
    setTimeout(() => {
      const ticketId = `RM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const endTimeHour = parseInt(eventHour.split(':')[0]) + duration;
      const calculatedSlot = `${eventHour} - ${endTimeHour}:00`;

      const newBooking: Booking = {
        id: ticketId,
        clientName,
        clientEmail,
        clientPhone,
        date: eventDate,
        timeSlot: calculatedSlot,
        duration,
        packageType,
        options: {
          customOverlay,
          redCarpet,
          usbMedia,
          ledLighting
        },
        totalPrice,
        promoCodeUsed: activePromo?.code,
        discountApplied,
        paymentStatus: paymentTier,
        amountPaid: amountToPayNow,
        paymentMethod,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        prescripteurId: activePromo?.prescripteurId
      };

      // Push to main state
      onAddBooking(newBooking);
      setGeneratedTicket(newBooking);
      setCheckoutStep('success');
      triggerAutoNotificationEmail(newBooking);
    }, 2000);
  };

  const triggerAutoNotificationEmail = async (booking: Booking) => {
    try {
      const isQuote = booking.id.includes('DEVIS') || booking.totalPrice === 0;
      const type = isQuote ? 'devis' : 'reservation';
      
      const payload = {
        type: type,
        id: booking.id,
        paymentStatus: booking.paymentStatus,
        client: {
          nom: booking.clientName,
          email: booking.clientEmail || 'Non spécifié',
          telephone: booking.clientPhone
        },
        details: `Date de l'événement : ${booking.date}\nCréneau : ${booking.timeSlot}\nAdresse/Quartier : ${dakarDistrict || 'Dakar, Sénégal'}\nFormule : ${booking.packageType.toUpperCase()}\nOptions :\n- Cadre vidéo personnalisé : ${booking.options.customOverlay ? 'Oui' : 'Non'}\n- Tapis Rouge et Barrière VIP : ${booking.options.redCarpet ? 'Oui' : 'Non'}\n- Clé USB : ${booking.options.usbMedia ? 'Oui' : 'Non'}\n- Éclairage LED supplémentaire : ${booking.options.ledLighting ? 'Oui' : 'Non'}\nDurée : ${booking.duration} H\nCommentaire : ${customWishes.trim() || 'Aucun'}`,
        montant: isQuote ? undefined : `${booking.totalPrice.toLocaleString()} F CFA (Acompte payé: ${booking.amountPaid.toLocaleString()} F CFA)`
      };

      const response = await fetch('/api/valider-evenement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      console.log('Réponse notification d\'envoi d\'email:', result);
    } catch (err) {
      console.error('Erreur lors du déclenchement du mail automatique:', err);
    }
  };

  // Downloadable ticket as a professional PDF with the brand logo embedded
  const handleDownloadReceipt = async () => {
    if (!generatedTicket) return;

    try {
      const isQuote = isCustomQuoteMode;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Draw top luxury double-stripe (gold & dark slate)
      doc.setFillColor(212, 175, 55); // Gold
      doc.rect(0, 0, pageWidth, 4, 'F');
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 4, pageWidth, 2, 'F');

      // Helper to add centered text
      const centerText = (text: string, yValue: number, style: 'normal' | 'bold' = 'normal', size = 11, color = [30, 41, 59]) => {
        doc.setFont('helvetica', style);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        const textWidth = doc.getTextWidth(text);
        doc.text(text, (pageWidth - textWidth) / 2, yValue);
      };

      // Load and add RM Events Logo
      try {
        const logoBase64 = await getBase64Image(rmEventsLogo);
        // Place logo centered at the top
        // Image aspect ratio: 1:1 square
        doc.addImage(logoBase64, 'JPEG', (pageWidth - 36) / 2, 12, 36, 36);
      } catch (err) {
        console.error("Could not load logo into PDF, falling back to text banner:", err);
        centerText("RM EVENTS 360", 25, 'bold', 20, [212, 175, 55]);
      }

      // Title & Header details (centered)
      const currentY = 56;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      centerText(isQuote ? "PROPOSITION DE DEVIS COMMERCIAL" : "REÇU DE CONFIRMATION DE RÉSERVATION", currentY, 'bold', 12, [30, 41, 59]);

      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.line((pageWidth - 60) / 2, currentY + 3, (pageWidth + 60) / 2, currentY + 3);

      // Metadata Block
      let y = currentY + 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139); // Slate-500

      const docIdLabel = isQuote ? `Devis N° : ${generatedTicket.id}` : `Réservation N° : ${generatedTicket.id}`;
      const docDateLabel = `Date d'émission : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

      doc.setFont('helvetica', 'bold');
      doc.text(docIdLabel, 20, y);
      doc.setFont('helvetica', 'normal');
      const dateWidth = doc.getTextWidth(docDateLabel);
      doc.text(docDateLabel, pageWidth - 20 - dateWidth, y);

      // Horizontal dashed separation
      y += 6;
      doc.setDrawColor(226, 232, 240); // Lead-200 Light gray
      doc.setLineWidth(0.25);
      doc.line(20, y, pageWidth - 20, y);

      // Client Details Header
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text("INFORMATIONS DU CLIENT", 20, y);

      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);

      // Grid Layout for details
      const drawDetailRow = (label: string, value: string, rowY: number) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, rowY);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 65, rowY);
      };

      drawDetailRow("Client", generatedTicket.clientName, y);
      y += 6;
      drawDetailRow("Adresse Email", generatedTicket.clientEmail || "Non communiqué", y);
      y += 6;
      drawDetailRow("Téléphone", generatedTicket.clientPhone, y);
      y += 6;
      drawDetailRow("Organisateur", "RM EVENTS SÉNÉGAL", y);

      // Section Event details
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, pageWidth - 20, y);

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text("DÉTAILS DE LA PRESTATION", 20, y);

      y += 6;
      drawDetailRow("Date de Prestation", generatedTicket.date, y);
      y += 6;
      drawDetailRow("Créneau Horaire", generatedTicket.timeSlot, y);
      if (!isQuote) {
        y += 6;
        drawDetailRow("Durée de l'animation", `${generatedTicket.duration} H (Inclus)`, y);
      }
      y += 6;
      drawDetailRow("Lieu (Dakar)", dakarDistrict, y);
      y += 6;
      drawDetailRow("Formule de l'offre", isQuote ? "Solution Entreprises / Sur-Mesure" : generatedTicket.packageType.toUpperCase(), y);

      // Payment Box / Pricing
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, pageWidth - 20, y);

      y += 10;
      // Draw a gold/grey bordered highlighted container for prices or custom request status
      doc.setFillColor(248, 250, 252); // slate-50 background
      doc.setDrawColor(212, 175, 55); // Gold border
      doc.setLineWidth(0.3);
      doc.rect(20, y, pageWidth - 40, isQuote ? 28 : 58, 'FD');

      y += 8;
      if (isQuote) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(212, 175, 55);
        doc.text("ESTIMATION PRESTATION : DEVIS EN COURS D'ÉTUDE", 25, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text("Votre proposition tarifaire personnalisée vous sera envoyée d'ici 24H.", 25, y);
        y += 5;
        doc.text("Un conseiller RM Events vous contactera par téléphone pour finaliser le projet.", 25, y);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        
        // Montant Total
        doc.text("MONTANT TOTAL PRESTATION", 25, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        const totalStr = `${generatedTicket.totalPrice.toLocaleString()} F CFA`;
        doc.text(totalStr, pageWidth - 25 - doc.getTextWidth(totalStr), y);

        // Payment details according to payment status
        let paidLabel = "Acompte Réglé pour Réservation";
        let paidValueStr = `- ${generatedTicket.amountPaid.toLocaleString()} F CFA`;
        let paidColor = [16, 185, 129]; // emerald-500
        
        let remainsLabel = "SOLDE À RÉGLER SUR PLACE";
        let remainsValueStr = `${(generatedTicket.totalPrice - generatedTicket.amountPaid).toLocaleString()} F CFA`;
        let remainsColor = [220, 38, 38]; // red-600

        if (generatedTicket.paymentStatus === 'pending') {
          paidLabel = "Versement Reçu (Sans Paiement)";
          paidValueStr = "0 F CFA";
          paidColor = [100, 116, 139]; // slate-500
          
          remainsLabel = "MONTANT À RÉGLER SUR PLACE";
          remainsValueStr = `${generatedTicket.totalPrice.toLocaleString()} F CFA`;
          remainsColor = [217, 119, 6]; // amber-600
        } else if (generatedTicket.paymentStatus === 'total') {
          paidLabel = "Paiement Effectué (100% Intégral)";
          paidValueStr = `- ${generatedTicket.amountPaid.toLocaleString()} F CFA`;
          paidColor = [16, 185, 129]; // emerald-500
          
          remainsLabel = "SOLDE RESTANT À RÉGLER";
          remainsValueStr = "0 F CFA (Réglé)";
          remainsColor = [16, 185, 129]; // emerald-500
        }

        // Row 2: Paid
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(paidColor[0], paidColor[1], paidColor[2]);
        doc.text(paidLabel, 25, y);
        doc.setFont('helvetica', 'bold');
        doc.text(paidValueStr, pageWidth - 25 - doc.getTextWidth(paidValueStr), y);

        // Row 3: Remains
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(remainsColor[0], remainsColor[1], remainsColor[2]);
        doc.text(remainsLabel, 25, y);
        doc.setFont('helvetica', 'bold');
        doc.text(remainsValueStr, pageWidth - 25 - doc.getTextWidth(remainsValueStr), y);

        // Dash separator inside the box
        y += 4;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(25, y, pageWidth - 25, y);

        // Row 4: Status confirmation text
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text("Statut & Confirmation officielle :", 25, y);

        y += 4.5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        
        let confirmationText = "";
        if (generatedTicket.paymentStatus === 'pending') {
          confirmationText = "Créneau réservé avec succès ! Votre prestation est bloquée dans notre planning. Aucun paiement n'a été effectué pour le moment. Notre équipe vous contactera rapidement par téléphone.";
        } else if (generatedTicket.paymentStatus === 'deposit_only') {
          confirmationText = "Acompte de 50% reçu avec succès - Réservation validée ! Votre événement photobooth 360° est officiellement programmé dans notre planning.";
        } else {
          confirmationText = "Paiement intégral de 100% validé ! Prestation photobooth de prestige entièrement réglée et figée de manière définitive dans notre planning.";
        }
        
        const splitText = doc.splitTextToSize(confirmationText, pageWidth - 50);
        doc.text(splitText, 25, y);
        
        // Adjust coordinate offset to keep final spacing perfect
        y += (splitText.length > 1 ? 6 : 2);
      }

      // Final note
      y += isQuote ? 16 : 22;
      centerText("Merci de faire confiance à RM EVENTS pour illuminer vos moments d'exception !", y, 'bold', 9.5, [212, 175, 55]);

      y += 8;
      // Stamp-like elegant footer
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(20, y, pageWidth - 20, y);

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // Slate-400
      centerText("RM EVENTS SÉNÉGAL • DAKAR Prestige 360 Video Booth", y);
      y += 4.5;
      centerText("Contact : +221 77 976 20 75 • Email : rmevent360@gmail.com", y);

      // Save PDF document
      doc.save(isQuote ? `devis_rm_events_${generatedTicket.id}.pdf` : `reservation_rm_events_${generatedTicket.id}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Une erreur s'est produite lors de la génération du PDF. Les données n'ont pas pu s'exporter.");
    }
  };

  return (
    <div id="booking-view-anchor" className="space-y-8">
      
      {/* Visual Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setBookingTab('calendar')}
          className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            bookingTab === 'calendar'
              ? 'border-gold-500 text-gold-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-650'
          }`}
        >
          📅 Réservation
        </button>
        <button
          type="button"
          onClick={() => setBookingTab('instant')}
          className={`flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
            bookingTab === 'instant'
              ? 'border-gold-500 text-gold-600 font-extrabold'
              : 'border-transparent text-gray-400 hover:text-gray-650'
          }`}
        >
          ⚡ Devis & Acompte en Ligne (Wave/OM)
        </button>
      </div>

      {/* RENDER VIEW 1: PREMIUM DIRECT RESERVATION FORM */}
      {bookingTab === 'calendar' && (
        <form onSubmit={handleCalendarBookingSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h4 className="font-display font-extrabold text-gray-950 text-xl">
                Réservation Directe de votre Créneau
              </h4>
              <p className="text-xs text-gray-500">
                Planifiez votre prestation RM Event 360° en remplissant ce formulaire. Vous et l'équipe RM EVENT recevrez instantanément une confirmation de réservation officielle par e-mail.
              </p>
            </div>

            {/* Form grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Box 1: Client details */}
              <div className="space-y-4 border-r border-gray-100 pr-0 md:pr-6">
                <h5 className="font-display font-black text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <User className="w-4 h-4 text-gold-500" />
                  <span>1. Coordonnées de contact</span>
                </h5>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nom Complet / Entreprise</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sokhna Diagne ou BDE Supdeco"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">E-mail de confirmation</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="nom@exemple.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Téléphone (Sénégal)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 976 20 75"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Localité de la prestation (Dakar)</label>
                  <select
                    value={dakarDistrict}
                    onChange={(e) => setDakarDistrict(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-bold"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Box 2: Offer details */}
              <div className="space-y-4">
                <h5 className="font-display font-black text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
                  <Sparkles className="w-4 h-4 text-gold-500" />
                  <span>2. Choix de la Formule & Date</span>
                </h5>

                <div>
                  <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Formule choisie</label>
                  <select
                    value={packageType}
                    onChange={(e) => {
                      const val = e.target.value as 'standard' | 'bronze' | 'argent' | 'prestige';
                      setPackageType(val);
                      if (val === 'standard') setDuration(1);
                      else if (val === 'bronze') setDuration(2);
                      else if (val === 'argent') setDuration(3);
                      else if (val === 'prestige') setDuration(4);
                    }}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-bold uppercase"
                  >
                    <option value="standard">Standard (1 Heure - 50.000 F)</option>
                    <option value="bronze">Pack Bronze (2 Heures - 90.000 F)</option>
                    <option value="argent">Pack Argent (3 Heures - 130.000 F)</option>
                    <option value="prestige">Pack Prestige (4 Heures - 150.000 F)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Date Prestation</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Heure de Début</label>
                    <input
                      type="time"
                      required
                      value={eventHour}
                      onChange={(e) => setEventHour(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Section & Options (Full width) */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <h5 className="font-display font-black text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-2">
                <span>3. Options Additionnelles & Commentaire</span>
              </h5>

              {/* Core Options switches for luxury touch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 border border-gray-150">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customOverlay}
                    onChange={(e) => setCustomOverlay(e.target.checked)}
                    className="accent-gold-500 h-4 w-4"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Cadre vidéo personnalisé (+25k)</span>
                    <span className="block text-[9px] text-gray-500">Logo & filtre de marque</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={redCarpet}
                    onChange={(e) => setRedCarpet(e.target.checked)}
                    className="accent-gold-500 h-4 w-4"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Tapis Rouge & Barrière VIP (+30k)</span>
                    <span className="block text-[9px] text-gray-500">Décoration de prestige</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usbMedia}
                    onChange={(e) => setUsbMedia(e.target.checked)}
                    className="accent-gold-500 h-4 w-4"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Clé USB (+10k)</span>
                    <span className="block text-[9px] text-gray-500">Tous les rushs vidéos</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ledLighting}
                    onChange={(e) => setLedLighting(e.target.checked)}
                    className="accent-gold-500 h-4 w-4"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Éclairage LED (+30k)</span>
                    <span className="block text-[9px] text-gray-500">Luminosité de nuit pro</span>
                  </div>
                </label>
              </div>

              {/* Textarea comment */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Commentaire, détails de l'événement ou souhaits particuliers</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Soirée d'anniversaire au bord de la piscine, merci de prévoir des accessoires masques et chapeaux..."
                  value={customWishes}
                  onChange={(e) => setCustomWishes(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500"
                />
              </div>
            </div>

            {/* Price Recap overview in first tab */}
            <div className="bg-gold-500/5 p-4 border border-gold-500/20 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-left">
                <span className="text-[10px] font-extrabold text-gold-600 block uppercase tracking-wider">Récapitulatif Estimé du Devis</span>
                <span className="text-sm font-black text-gray-900">
                  Formule {(packageType).toUpperCase()} ({(duration)}H) : {((BASE_PRICES[duration] || (150000 + (duration - 4) * 35000)) + extrasPrice).toLocaleString()} F CFA
                </span>
                <span className="text-[9px] text-gray-500 block mt-0.5">Note : Aucun acompte n'est requis à l'étape de réservation. Notre équipe validera votre créneau rapidement.</span>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gray-950 hover:bg-gold-500 hover:text-white text-gold-500 font-bold uppercase text-[10px] tracking-widest border border-gold-500/30 rounded-none transition-all duration-300"
              >
                Confirmer ma Réservation
              </button>
            </div>
          </div>
        </form>
      )}

      {/* RENDER VIEW 2: CUSTOM DEVIS & SENEGALESE MOBILE MONEY INSTANT SIMULATION */}
      {bookingTab === 'instant' && (
        <div className="space-y-8">
          <div className="border-b border-gray-250 pb-5">
            <h3 className="font-display text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <span>Devis Sur-Mesure & Réservation Immédiate</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Ajustez la durée, cochez vos options exclusives et configurez votre acompte de 50%.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Controls & Form Inputs */}
            <form onSubmit={handleOpenCheckout} className="lg:col-span-7 space-y-6">
              
              {/* Section A: Event Particulars */}
              <div className="bg-white border border-gray-200 rounded-none p-6 space-y-4 shadow-sm">
                <h4 className="font-display font-black text-gray-900 text-sm flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <Calendar className="w-5 h-5 text-gold-500" />
                  <span>1. Détails de l'Événement</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Date Souhaitée</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Heure de Début</label>
                    <input
                      type="time"
                      required
                      value={eventHour}
                      onChange={(e) => setEventHour(e.target.value)}
                      className="w-full bg-white border border-gray-250 rounded-none px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Localité de la prestation (Dakar)</label>
                  <select
                    value={dakarDistrict}
                    onChange={(e) => setDakarDistrict(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-bold"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section B: Duration Specification */}
              <div className="bg-white border border-gray-200 rounded-none p-6 space-y-4 shadow-sm">
                <h4 className="font-display font-black text-gray-900 text-sm flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <Clock className="w-5 h-5 text-gold-500" />
                  <span>2. Durée requise</span>
                </h4>
                <p className="text-xs text-gray-500">
                  Sélectionnez le nombre d'heures de présence de la borne 360° :
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => {
                        setDuration(h);
                        setIsCustomQuoteMode(false); // turn off custom mode if picking standard hours
                      }}
                      className={`p-3 rounded-none border text-center transition-all ${
                        !isCustomQuoteMode && duration === h
                          ? 'bg-gold-500/10 text-gold-600 border-gold-500 font-extrabold'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="block text-sm font-black font-mono">{h} H</span>
                      <span className="block text-[9px] text-gray-500 mt-0.5">
                        {(BASE_PRICES[h]).toLocaleString()} F
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Quote Choice */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomQuoteMode}
                      onChange={(e) => setIsCustomQuoteMode(e.target.checked)}
                      className="accent-gold-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-gray-800">
                      Demander un devis personnalisé (événement particulier, +4h, etc.)
                    </span>
                  </label>

                  {isCustomQuoteMode && (
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mt-1">
                        Décrivez vos besoins particuliers
                      </label>
                      <textarea
                        value={customWishes}
                        onChange={(e) => setCustomWishes(e.target.value)}
                        placeholder="Ex: Prestation de 6 heures, marquage thématique du stand de l'événement et partage instantané de vidéos personnalisées."
                        rows={3}
                        className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-850 focus:outline-none focus:border-gold-500 leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section C: Optional Extra Add-ons */}
              <div className="bg-white border border-gray-200 rounded-none p-6 space-y-4 shadow-sm">
                <h4 className="font-display font-black text-gray-900 text-sm flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <Sparkles className="w-5 h-5 text-gold-500" />
                  <span>3. Options Additionnelles (VIP)</span>
                </h4>

                <div className="space-y-3">
                  <label className="flex items-start justify-between p-3 rounded-none border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3 pr-2">
                      <input
                        type="checkbox"
                        checked={customOverlay}
                        onChange={(e) => setCustomOverlay(e.target.checked)}
                        className="mt-1 accent-gold-500 rounded h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Cadre vidéo personnalisé (+25.000 F)</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Intégration de votre logo et d'effets visuels stylisés de marque ou thématiques.</span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start justify-between p-3 rounded-none border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3 pr-2">
                      <input
                        type="checkbox"
                        checked={redCarpet}
                        onChange={(e) => setRedCarpet(e.target.checked)}
                        className="mt-1 accent-gold-500 rounded h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Tapis Rouge et Barrière VIP (+30.000 F)</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Ambiance tapis rouge de festival de cinéma et barrières dorées de prestige.</span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start justify-between p-3 rounded-none border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3 pr-2">
                      <input
                        type="checkbox"
                        checked={usbMedia}
                        onChange={(e) => setUsbMedia(e.target.checked)}
                        className="mt-1 accent-gold-500 rounded h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Clé USB (+10.000 F)</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Récupérez toutes les captures vidéos 360° en Haute Définition brutes ou finalisées.</span>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start justify-between p-3 rounded-none border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start space-x-3 pr-2">
                      <input
                        type="checkbox"
                        checked={ledLighting}
                        onChange={(e) => setLedLighting(e.target.checked)}
                        className="mt-1 accent-gold-500 rounded h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Éclairage LED supplémentaire (+30.000 F)</span>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Projecteurs et spots LED haut de gamme d'ambiance nocturne pro.</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Section D: Client coordinates */}
              <div className="bg-white border border-gray-200 rounded-none p-6 space-y-4 shadow-sm">
                <h4 className="font-display font-black text-gray-900 text-sm flex items-center space-x-2 pb-2 border-b border-gray-100">
                  <User className="w-5 h-5 text-gold-500" />
                  <span>4. Vos Coordonnées</span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Nom Complet / Entreprise</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sokhna Diagne ou BDE Supdeco"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white border border-gray-250 rounded-none pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">E-mail de confirmation</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="nom@exemple.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-none pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">Téléphone (Sénégal)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="+221 77 XXX XX XX"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-none pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Launch button */}
              <button
                type="submit"
                className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-widest rounded-none transition-all duration-300 shadow-md cursor-pointer"
              >
                {isCustomQuoteMode ? "Transmettre ma demande de devis" : "Procéder au Paiement"}
              </button>

            </form>

            {/* RIGHT COLUMN: Realtime Quote & Promo codes */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Quote Card */}
              <div className="bg-white border border-gray-200 rounded-none p-6 sm:p-8 space-y-6 shadow-sm">
                <h4 className="font-display font-bold text-gray-900 text-sm uppercase tracking-wider border-b border-gray-100 pb-4">
                  Votre Devis Automatique
                </h4>

                {/* Dynamic Items list */}
                {isCustomQuoteMode ? (
                  <div className="space-y-3 text-xs text-gray-700 bg-gold-500/5 p-4 border border-gold-500/10">
                    <strong className="block text-gray-900 font-display">Demande Spécifique (Sur Devis)</strong>
                    <p className="text-[11px] text-gray-605 leading-normal">
                      Notre équipe commerciale à Dakar étudiera vos besoins de personnalisation (durée, décor, animations) pour vous proposer une offre financière sur-mesure sous 24 heures.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Prestation Photobooth 360° ({duration}h)</span>
                      <span className="font-mono font-bold">{basePrice.toLocaleString()} F</span>
                    </div>

                    {customOverlay && (
                      <div className="flex justify-between">
                        <span>Option : Cadre vidéo personnalisé</span>
                        <span className="font-mono font-bold text-gold-600">+25.000 F</span>
                      </div>
                    )}

                    {redCarpet && (
                      <div className="flex justify-between">
                        <span>Option : Tapis Rouge et Barrière VIP</span>
                        <span className="font-mono font-bold text-gold-600">+30.000 F</span>
                      </div>
                    )}

                    {usbMedia && (
                      <div className="flex justify-between">
                        <span>Option : Clé USB</span>
                        <span className="font-mono font-bold text-gold-600">+10.000 F</span>
                      </div>
                    )}

                    {ledLighting && (
                      <div className="flex justify-between">
                        <span>Option : Éclairage LED supplémentaire</span>
                        <span className="font-mono font-bold text-gold-600">+30.000 F</span>
                      </div>
                    )}

                    {activePromo && (
                      <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-none border border-emerald-100">
                        <span>Remise promo ({activePromo.discountPercent}%)</span>
                        <span className="font-mono">-{discountApplied.toLocaleString()} F</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Total Balance */}
                <div className="pt-5 border-t border-dashed border-gray-200 flex justify-between items-baseline">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Total Estimé</span>
                  <span className="text-xl font-mono font-black text-gold-500">
                    {isCustomQuoteMode ? "Sur Devis" : `${totalPrice.toLocaleString()} FCFA`}
                  </span>
                </div>

                {/* Deposit selection */}
                {!isCustomQuoteMode ? (
                  <div className="bg-gray-50 rounded-none p-4 border border-gray-200 space-y-3">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Format de Paiement souhaité :</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentTier('deposit_only')}
                        className={`p-2.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
                          paymentTier === 'deposit_only'
                            ? 'bg-gold-500 text-white font-black'
                            : 'bg-white text-gray-655 border border-gray-200'
                        }`}
                      >
                        Acompte (50%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentTier('total')}
                        className={`p-2.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
                          paymentTier === 'total'
                            ? 'bg-gold-500 text-white font-black'
                            : 'bg-white text-gray-655 border border-gray-200'
                        }`}
                      >
                        Intégral (100%)
                      </button>
                    </div>

                    <div className="text-[11px] text-gray-500 mt-1 leading-normal">
                      {paymentTier === 'deposit_only' ? (
                        <span>
                          Réglez <strong className="text-gold-500 font-mono">{(amountToPayNow).toLocaleString()} F</strong> d'acompte aujourd'hui. Le solde sera réglé sur place à Dakar lors de la mise en place.
                        </span>
                      ) : (
                        <span>
                          Réglez la totalité soit <strong className="text-gold-500 font-mono">{totalPrice.toLocaleString()} F</strong> dès maintenant pour figer définitivement la planification.
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-none p-4 border border-gray-200">
                    <p className="text-[11.5px] text-gray-650 leading-relaxed">
                      💡 <strong>Aucun acompte requis :</strong> Vous soumettez simplement votre cahier des charges. RM EVENTS vous enverra par email votre devis détaillé sous 24h ouvrées.
                    </p>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-emerald-500/5 p-3 rounded-none flex items-center space-x-2.5 text-[10px] text-gray-600 border border-emerald-500/10">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Validation instantanée sécurisée. Remboursement total garanti sous 48h.</span>
                </div>
              </div>

              {/* Promo Code Input panel */}
              <div className="bg-white border border-gray-200 rounded-none p-6 space-y-4 shadow-sm">
                <h5 className="font-display font-extrabold text-gray-900 text-xs uppercase tracking-widest flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-gold-500" />
                  <span>Code Promo / Parrain</span>
                </h5>

                <form onSubmit={handleValidatePromo} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Saisir code promotionnel"
                    value={typedPromo}
                    onChange={(e) => setTypedPromo(e.target.value)}
                    disabled={activePromo !== null}
                    className="flex-grow bg-white border border-gray-250 rounded-none px-3 py-2 text-xs uppercase text-gray-800 font-mono"
                  />
                  {activePromo === null ? (
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 text-xs font-bold uppercase transition"
                    >
                      Appliquer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleClearPromo}
                      className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs font-bold uppercase transition"
                    >
                      Retirer
                    </button>
                  )}
                </form>

                {promoError && <p className="text-[11px] text-red-500 font-bold">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-emerald-600 font-bold">{promoSuccess}</p>}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* WAVE & ORANGE MONEY PAYOUT SCANNER MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-none p-6 sm:p-8 max-w-sm w-full shadow-2xl relative space-y-6 text-gray-800">
            
            {/* Close Button / Cancel */}
            {checkoutStep !== 'processing' && (
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            )}

            {/* STEP 1: Scan QR Code simulator */}
            {checkoutStep === 'scan' && (
              <div className="text-center space-y-5">
                <span className="text-[11px] text-gold-500 uppercase tracking-[0.2em] font-extrabold block">
                  Simulateur de Paiement Local
                </span>

                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wave')}
                    className={`px-4 py-2 rounded-none border text-xs font-bold transition-all ${
                      paymentMethod === 'wave'
                        ? 'bg-[#1b85ff] text-white border-[#1b85ff] shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🌊 Wave Sénégal
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`px-4 py-2 rounded-none border text-xs font-bold transition-all ${
                      paymentMethod === 'orange_money'
                        ? 'bg-[#ff6600] text-white border-[#ff6600] shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🍊 Orange Money
                  </button>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-none p-6 flex flex-col items-center justify-center space-y-4">
                  <div className={`p-4 ${paymentMethod === 'wave' ? 'bg-[#1b85ff]/10' : 'bg-[#ff6600]/10'}`}>
                    <QrCode className={`w-28 h-28 ${paymentMethod === 'wave' ? 'text-[#1b85ff]' : 'text-[#ff6600]'}`} />
                  </div>

                  <p className="text-[11px] text-gray-600">
                    Ouvrez votre application <strong className="capitalize text-gray-800">{paymentMethod.replace('_', ' ')}</strong> d'argent sur votre mobile, et scannez le code ci-dessus ou simulez le paiement.
                  </p>

                  <div className="bg-white px-4 py-3 border border-gray-200 text-center shadow-xs">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wide block">Montant requis</span>
                    <strong className="text-base font-mono font-black text-gold-500">{(amountToPayNow).toLocaleString()} F</strong>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-left">
                      Téléphone du Compte Débiteur
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 77 123 45 67"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full text-center bg-gray-50 border border-gray-200 rounded-none py-2 text-xs text-gray-800 font-mono font-bold focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmMockPayment}
                    className={`w-full py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 ${
                      paymentMethod === 'wave' ? 'bg-[#1b85ff] hover:bg-[#0070e0]' : 'bg-[#ff6600] hover:bg-[#e05900]'
                    }`}
                  >
                    Confirmer le transfert simulé
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Processing transaction simulation spinner */}
            {checkoutStep === 'processing' && (
              <div className="text-center py-10 space-y-4">
                <div className={`w-12 h-12 rounded-full border-4 border-dashed animate-spin mx-auto ${
                  paymentMethod === 'wave' ? 'border-[#1b85ff]' : 'border-[#ff6600]'
                }`}></div>
                <h5 className="font-display font-bold text-gray-900 text-sm">
                  Vérification du transfert d'argent...
                </h5>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Veuillez confirmer la transaction d'acompte depuis votre mobile.
                </p>
              </div>
            )}

            {/* STEP 3: SUCCESS Receipt Display */}
            {checkoutStep === 'success' && generatedTicket && (
              <div className="text-center space-y-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>

                <div className="space-y-1">
                  <h5 className="font-display font-extrabold text-gray-900 text-base">
                    {isCustomQuoteMode 
                      ? "Demande de Devis Envoyée !" 
                      : generatedTicket.paymentStatus === 'pending'
                        ? "Créneau Réservé avec Succès !"
                        : generatedTicket.paymentStatus === 'deposit_only'
                          ? "Acompte Reçu - Réservation Validée !"
                          : "Paiement Intégral Reçu - Réservation Garantie !"}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {isCustomQuoteMode 
                      ? "Nos conseillers à Dakar analysent vos besoins pour vous envoyer le devis sous 24h." 
                      : generatedTicket.paymentStatus === 'pending'
                        ? "Votre créneau a été bloqué dans notre agenda. Aucun paiement n'a été effectué pour le moment. Notre équipe vous contactera."
                        : generatedTicket.paymentStatus === 'deposit_only'
                          ? "Nous avons bien reçu votre acompte de 50%. Votre événement 360° est officiellement bloqué et programmé !"
                          : "Votre paiement de 100% a été validé. Votre prestation photobooth est entièrement réglée et fégée dans notre planning."}
                  </p>
                </div>

                {/* Simulated Invoice/Ticket printable design */}
                <div id="invoice-bill-element" className="bg-gray-50 border border-gray-200 rounded-none p-5 text-left text-xs space-y-3.5 relative overflow-hidden">
                  
                  {/* Decorative stamp */}
                  <div className="absolute -top-3 -right-3 w-20 h-20 border-4 border-dashed border-gold-500/25 rounded-full flex items-center justify-center rotate-12 text-[7.5px] text-gold-500 font-extrabold select-none text-center leading-tight">
                    {isCustomQuoteMode 
                      ? "DEVIS RM" 
                      : generatedTicket.paymentStatus === 'pending'
                        ? "RÉSERVÉ"
                        : generatedTicket.paymentStatus === 'deposit_only'
                          ? "ACOMPTE PAYÉ"
                          : "SOLDE RÉGLÉ"}
                  </div>

                  <div className="border-b border-gray-200 pb-2.5">
                    <span className="text-[9px] text-gray-550 font-mono block uppercase">
                      {isCustomQuoteMode ? "N° Demande Devis" : "ID Réservation"}
                    </span>
                    <strong className="text-sm text-gray-900 font-mono">{generatedTicket.id}</strong>
                  </div>

                  <div className="space-y-1.5 text-gray-650">
                    <div>Client : <strong className="text-gray-900">{generatedTicket.clientName}</strong></div>
                    <div>Téléphone : <span className="font-mono">{generatedTicket.clientPhone}</span></div>
                    <div>Date : <strong className="text-gray-900">{generatedTicket.date}</strong></div>
                    <div>Créneau : <span className="font-mono">{generatedTicket.timeSlot} {!isCustomQuoteMode && `(${generatedTicket.duration} h)`}</span></div>
                    <div>Quartier : <span>{dakarDistrict}</span></div>
                    <div>Formule : <span className="uppercase text-gold-600 font-bold">{isCustomQuoteMode ? "Sur-Mesure / Devis" : generatedTicket.packageType}</span></div>
                  </div>

                  {isCustomQuoteMode ? (
                    <div className="pt-2.5 border-t border-dashed border-gray-200 space-y-1 text-gray-550">
                      <div className="flex justify-between font-bold text-gold-600">
                        <span>Estimation tarifaire :</span>
                        <span>Gratuit (Sous 24h)</span>
                      </div>
                      <p className="text-[10px] text-gray-500 italic mt-1 font-sans">
                        Un conseiller RM EVENTS de Dakar vous contactera pour valider l'overlay et valider les détails logistiques.
                      </p>
                    </div>
                  ) : generatedTicket.paymentStatus === 'pending' ? (
                    <div className="pt-2.5 border-t border-dashed border-gray-200 space-y-1 text-gray-550">
                      <div className="flex justify-between text-gray-500">
                        <span>Montant total estimé :</span>
                        <strong className="text-gray-900 font-mono">{(generatedTicket.totalPrice).toLocaleString()} F</strong>
                      </div>
                      <div className="flex justify-between font-bold text-amber-600 bg-amber-50/70 p-2 border border-amber-100 mt-1">
                        <span>Statut paiement :</span>
                        <span>Sans Paiement (En Attente)</span>
                      </div>
                      <p className="text-[10px] text-gray-550 italic mt-1 font-sans">
                        Aucun versement n'a été prélevé. Notre équipe vous contactera sous peu pour finaliser la logistique.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="pt-2.5 border-t border-dashed border-gray-200 flex justify-between text-gray-550">
                        <span>Versement reçu ({generatedTicket.paymentStatus === 'deposit_only' ? 'Acompte 50%' : 'Total 100%'}) :</span>
                        <strong className="text-gray-900 font-mono">{(generatedTicket.amountPaid).toLocaleString()} F</strong>
                      </div>
                      
                      <div className="flex justify-between font-bold text-gold-600">
                        <span>Solde à régler sur place :</span>
                        <strong className="font-mono">{(generatedTicket.totalPrice - generatedTicket.amountPaid).toLocaleString()} F</strong>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    className="flex-1 py-2.5 rounded-none border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setClientName('');
                      setClientEmail('');
                    }}
                    className="flex-1 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs uppercase rounded-none"
                  >
                    Terminer
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

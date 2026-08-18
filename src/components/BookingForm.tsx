import React, { useState } from 'react';
import { Calendar, Clock, Phone, Mail, User, ShieldCheck, Ticket, Download, ArrowRight, Check, MapPin, Sparkles, ChevronDown } from 'lucide-react';
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

interface BookingFormProps {
  onAddBooking: (newBooking: Booking) => void;
}

export default function BookingForm({ onAddBooking }: BookingFormProps) {
  // Client Detail States
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
    'Maximum 3h',
    'La demi Journée',
    'Toute la soirée',
    'Toute la Journée'
  ];

  // Duration selector
  const [duration, setDuration] = useState<string>('Maximum 3h');
  const [customWishes, setCustomWishes] = useState('');

  // Options states (strictly matching catalog products)
  const [optPhotobooth, setOptPhotobooth] = useState(true);
  const [optReflexe, setOptReflexe] = useState(false);
  const [optLyre, setOptLyre] = useState(false);
  const [optProjecteur, setOptProjecteur] = useState(false);
  const [optPotelets, setOptPotelets] = useState(false);

  // Success Modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<Booking | null>(null);

  // Submit handler for Direct Reservation Form
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone) {
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
        lyreScene: optLyre,
        projecteurLed: optProjecteur,
        poteletsDores: optPotelets,
      },
      totalPrice: 0,
      discountApplied: 0,
      paymentStatus: 'pending',
      amountPaid: 0,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

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
        details: `Date de l'événement : ${booking.date}\nCréneau : ${booking.timeSlot}\nDurée : ${booking.duration}\nAdresse/Quartier : ${dakarDistrict || 'Dakar, Sénégal'}\nOptions Sélectionnées :\n- Photobooth 360° : ${booking.options.photobooth360 ? 'Oui' : 'Non'}\n- Jeu de Réflexe : ${booking.options.reflexeGame ? 'Oui' : 'Non'}\n- Lyre de Scène : ${booking.options.lyreScene ? 'Oui' : 'Non'}\n- Projecteur LED : ${booking.options.projecteurLed ? 'Oui' : 'Non'}\n- Potelets Dorés VIP : ${booking.options.poteletsDores ? 'Oui' : 'Non'}\nCommentaire : ${customWishes.trim() || 'Aucun'}`,
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
      doc.setFillColor(217, 155, 38); // Gold
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
          centerText("RM EVENTS DAKAR", 26, 'bold', 18, [217, 155, 38]);
        }
      } catch (err) {
        centerText("RM EVENTS DAKAR", 26, 'bold', 18, [217, 155, 38]);
      }

      // Title & Header details
      const currentY = 54;
      centerText("CONFIRMATION DE RÉSERVATION", currentY, 'bold', 14, [26, 26, 26]);

      doc.setDrawColor(217, 155, 38);
      doc.setLineWidth(0.6);
      doc.line((pageWidth - 70) / 2, currentY + 3, (pageWidth + 70) / 2, currentY + 3);

      // Metadata Block
      let y = currentY + 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);

      const docIdLabel = `Réservation N° : ${generatedTicket.id}`;
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

      // Options
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, y, pageWidth - 20, y);

      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(26, 26, 26);
      doc.text("3. MATÉRIEL & OPTIONS CHOISIES", 20, y);

      y += 6;
      const selectedOpts: string[] = [];
      if (generatedTicket.options.photobooth360) selectedOpts.push("Photobooth 360° Motorisé avec Ring Light LED");
      if (generatedTicket.options.reflexeGame) selectedOpts.push("Jeu de Réflexe Interactif (Catching Stick Game)");
      if (generatedTicket.options.lyreScene) selectedOpts.push("Lyre de Scène Asservie (Moving Head Beam)");
      if (generatedTicket.options.projecteurLed) selectedOpts.push("Projecteur LED Studio sur Trépied");
      if (generatedTicket.options.poteletsDores) selectedOpts.push("Potelets Dorés VIP avec Cordons Velours Rouge");

      if (selectedOpts.length === 0) {
        selectedOpts.push("Photobooth 360° Standard");
      }

      selectedOpts.forEach((opt) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(217, 155, 38);
        doc.text("◆", 22, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        doc.text(opt, 28, y);
        y += 6;
      });

      // Special wishes
      if (customWishes.trim()) {
        y += 4;
        doc.setFont('helvetica', 'bold');
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
      doc.setFillColor(254, 250, 240);
      doc.setDrawColor(235, 195, 100);
      doc.roundedRect(20, y, pageWidth - 40, 22, 2, 2, 'FD');

      doc.setTextColor(160, 105, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("STATUT : CRÉNEAU ENREGISTRÉ AVEC SUCCÈS", pageWidth / 2, y + 8, { align: 'center' });

      doc.setTextColor(90, 90, 90);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text("Notre régisseur vous contactera afin de valider l'installation et l'animation sur site.", pageWidth / 2, y + 15, { align: 'center' });

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("RM EVENTS SÉNÉGAL • Dakar, Sénégal • WhatsApp : +221 77 976 20 75", pageWidth / 2, pageHeight - 16, { align: 'center' });
      doc.text("Document officiel de confirmation de réservation", pageWidth / 2, pageHeight - 11, { align: 'center' });

      doc.save(`Reservation-${generatedTicket.id}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Une erreur s'est produite lors de la génération du PDF.");
    }
  };

  return (
    <div id="booking-view-anchor" className="space-y-6">
      
      {/* MAIN RESERVATION FORM */}
      <form onSubmit={handleBookingSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2 pb-2 border-b border-gray-100">
            <h4 className="font-display font-black text-gray-950 text-xl sm:text-2xl">
              Réservation Directe de votre Créneau
            </h4>
            <p className="text-xs sm:text-sm text-gray-500">
              Planifiez votre prestation événementielle en remplissant ce formulaire. Vous recevrez instantanément votre confirmation officielle.
            </p>
          </div>

          {/* Form grid layout: 2 equal balanced columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

            {/* Box 1: Client details */}
            <div className="space-y-4 border-r-0 md:border-r border-gray-100 pr-0 md:pr-6">
              <h5 className="font-display font-black text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
                <User className="w-4 h-4 text-gold-500" />
                <span>1. Coordonnées de contact</span>
              </h5>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  Nom Complet / Entreprise
                </label>
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
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  E-mail de confirmation
                </label>
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
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  Téléphone (Sénégal)
                </label>
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
            </div>

            {/* Box 2: Event details (Durations: Maximum 3h, La demi Journée, Toute la soirée, Toute la Journée) */}
            <div className="space-y-4">
              <h5 className="font-display font-black text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-2 border-b border-gray-100 pb-2">
                <Clock className="w-4 h-4 text-gold-500" />
                <span>2. Date, Heure, Durée & Lieu</span>
              </h5>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  Durée de la prestation
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none pl-9 pr-8 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-bold cursor-pointer appearance-none"
                  >
                    {durationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                    Date Prestation
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
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
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                  Localité de la prestation (Dakar)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={dakarDistrict}
                    onChange={(e) => setDakarDistrict(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none pl-9 pr-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500 font-bold"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Equipment from Catalog & Comments */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <h5 className="font-display font-black text-gray-900 text-xs uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>3. Matériel Catalogue & Remarques</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-gray-50 p-4 border border-gray-150">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2.5 border border-gray-200 hover:border-gold-500 transition-colors">
                <input
                  type="checkbox"
                  checked={optPhotobooth}
                  onChange={(e) => setOptPhotobooth(e.target.checked)}
                  className="accent-gold-500 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-900">Photobooth 360°</span>
                  <span className="block text-[9px] text-gray-500">Plateforme rotative & anneau LED</span>
                </div>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2.5 border border-gray-200 hover:border-gold-500 transition-colors">
                <input
                  type="checkbox"
                  checked={optReflexe}
                  onChange={(e) => setOptReflexe(e.target.checked)}
                  className="accent-gold-500 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-900">Jeu de Réflexe</span>
                  <span className="block text-[9px] text-gray-500">Catching stick & chrono digital</span>
                </div>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2.5 border border-gray-200 hover:border-gold-500 transition-colors">
                <input
                  type="checkbox"
                  checked={optLyre}
                  onChange={(e) => setOptLyre(e.target.checked)}
                  className="accent-gold-500 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-900">Lyre de Scène</span>
                  <span className="block text-[9px] text-gray-500">Moving head beam asservi</span>
                </div>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2.5 border border-gray-200 hover:border-gold-500 transition-colors">
                <input
                  type="checkbox"
                  checked={optProjecteur}
                  onChange={(e) => setOptProjecteur(e.target.checked)}
                  className="accent-gold-500 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-900">Projecteur LED sur Trépied</span>
                  <span className="block text-[9px] text-gray-500">Panneau avec volets coupe-flux</span>
                </div>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer bg-white p-2.5 border border-gray-200 hover:border-gold-500 transition-colors sm:col-span-2 lg:col-span-1">
                <input
                  type="checkbox"
                  checked={optPotelets}
                  onChange={(e) => setOptPotelets(e.target.checked)}
                  className="accent-gold-500 h-4 w-4"
                />
                <div>
                  <span className="block text-xs font-bold text-gray-900">Potelets Dorés avec Cordon</span>
                  <span className="block text-[9px] text-gray-500">Potelets VIP & cordons rouges</span>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1">
                Commentaire, détails de l'événement ou souhaits particuliers
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Soirée d'anniversaire au bord de la piscine, précisions sur l'accès et le lieu..."
                value={customWishes}
                onChange={(e) => setCustomWishes(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Action & Bottom Bar */}
          <div className="bg-gold-500/5 p-4 border border-gold-500/20 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-left">
              <span className="text-[10px] font-extrabold text-gold-600 block uppercase tracking-wider">
                Récapitulatif de votre réservation
              </span>
              <span className="text-sm font-black text-gray-900">
                Prestation Événementielle • {duration}
              </span>
              <span className="text-[9px] text-gray-500 block mt-0.5">
                Note : Aucun paiement immédiat en ligne. Notre équipe validera votre créneau et coordonnera la logistique avec vous.
              </span>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gray-950 hover:bg-gold-500 hover:text-white text-gold-500 font-bold uppercase text-[11px] tracking-widest border border-gold-500/30 rounded-none transition-all duration-300 cursor-pointer shadow-sm"
            >
              Confirmer ma Réservation
            </button>
          </div>
        </div>
      </form>

      {/* CONFIRMATION TICKET MODAL */}
      {showConfirmationModal && generatedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gold-500/30 rounded-none max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-fade-in my-8">
            
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>

              <div className="space-y-1">
                <h5 className="font-display font-extrabold text-gray-950 text-xl">
                  Créneau Réservé avec Succès !
                </h5>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Votre demande a été enregistrée dans notre planning officiel. Notre équipe RM EVENTS vous contactera par téléphone pour les détails logistiques.
                </p>
              </div>
            </div>

            {/* Ticket representation */}
            <div className="bg-gray-50 border border-gray-200 rounded-none p-5 text-left text-xs space-y-3.5 relative overflow-hidden">
              
              {/* Decorative stamp */}
              <div className="absolute -top-3 -right-3 w-20 h-20 border-4 border-dashed border-gold-500/25 rounded-full flex items-center justify-center rotate-12 text-[7.5px] text-gold-500 font-extrabold select-none text-center leading-tight">
                RÉSERVÉ
              </div>

              <div className="border-b border-gray-200 pb-2.5">
                <span className="text-[9px] text-gray-500 font-mono block uppercase">
                  ID Réservation
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
                  <span>Statut de la réservation :</span>
                  <span>Confirmée & Enregistrée</span>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-1 font-sans">
                  Aucun paiement n'est exigé en ligne. Vous pouvez télécharger votre reçu officiel ci-dessous.
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
                <Download className="w-4 h-4 text-gold-500" />
                <span>Télécharger le Reçu PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConfirmationModal(false);
                  setClientName('');
                  setClientEmail('');
                }}
                className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs uppercase cursor-pointer shadow-sm"
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

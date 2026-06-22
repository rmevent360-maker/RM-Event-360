import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Sectors from './components/Sectors';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import { MessageCircle, Instagram } from 'lucide-react';

// Icons for the main navigation summary
import { QrCode, Building, Star, GraduationCap, ChevronRight, HelpCircle, Check, Award, Calculator } from 'lucide-react';

import {
  INITIAL_BOOKINGS,
  INITIAL_PROMO_CODES,
  INITIAL_PARTNERS,
  INITIAL_PARTNER_ACTIVITIES,
  INITIAL_PAYOUT_REQUESTS,
  BASE_PRICES,
  PACKAGES,
} from './data';
import { Booking, PromoCode, PartnerAccount, PartnerActivity, PayoutRequest } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('accueil');
  const [selectedPackageId, setSelectedPackageId] = useState<'standard' | 'bronze' | 'argent' | 'prestige'>('argent');

  // Unified Reactive Databases in local state to allow cross-system reactivity
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [partners, setPartners] = useState<PartnerAccount[]>(INITIAL_PARTNERS);
  const [partnerActivities, setPartnerActivities] = useState<PartnerActivity[]>(INITIAL_PARTNER_ACTIVITIES);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(INITIAL_PAYOUT_REQUESTS);

  // Callback to insert a new booking after checkout
  const handleAddBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);

    // If newBooking has an active prescripteur reference, increment metrics instantly
    if (newBooking.promoCodeUsed) {
      // Find matching promo code in database
      const codeStr = newBooking.promoCodeUsed.toUpperCase();
      const codeMatched = promoCodes.find((p) => p.code === codeStr);
      
      if (codeMatched) {
        // If it matches a partner, increase their total earnings directly
        const pId = codeMatched.prescripteurId;
        setPartners((currPartners) =>
          currPartners.map((prevPartner) => {
            if (prevPartner.id === pId) {
              const commissionEarned = Math.round(newBooking.totalPrice * (codeMatched.commissionPercent / 100));
              return {
                ...prevPartner,
                totalEarnings: prevPartner.totalEarnings + commissionEarned,
              };
            }
            return prevPartner;
          })
        );
      }
    }
  };

  // Callback to register a custom promo code
  const handleAddPromoCode = (newCode: PromoCode) => {
    setPromoCodes((prev) => [...prev, newCode]);
    
    // Registering as a mock partner so they can log in too!
    const newPartnerObj: PartnerAccount = {
      id: newCode.prescripteurId,
      name: newCode.prescripteurName,
      type: 'boutique',
      location: 'Dakar, Sénégal',
      revenueSharePercent: newCode.commissionPercent,
      totalEarnings: 0,
      withdrawnAmount: 0,
    };
    setPartners((prev) => [...prev, newPartnerObj]);
  };

  // Callback to submit a payout request (withdrawal)
  const handleAddPayoutRequest = (newRequest: PayoutRequest) => {
    setPayoutRequests((prev) => [newRequest, ...prev]);

    // Update partner accounts withdrawn value immediately on mock balance!
    if (newRequest.status === 'pending') {
      setPartners((prevList) =>
        prevList.map((p) => {
          if (p.id === newRequest.targetId) {
            return {
              ...p,
              withdrawnAmount: p.withdrawnAmount + newRequest.amount,
            };
          }
          return p;
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col justify-between selection:bg-gold-500 selection:text-white">
      
      {/* 1. Brand Header */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />

      {/* 2. Primary viewport renderer */}
      <main className="flex-grow">
        
        {/* VIEW: ACCUEIL */}
        {currentTab === 'accueil' && (
          <div className="space-y-0">
            {/* Hero Banner Component */}
            <Hero setCurrentTab={setCurrentTab} />

            {/* Quick FAQ / Dakar focus sector */}
            <section className="py-16 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100 text-center sm:text-left">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
                  <div className="sm:col-span-8 space-y-4">
                    <h5 className="text-gold-500 text-xs font-bold uppercase tracking-widest">Questions Fr&eacute;quentes</h5>
                    <h4 className="font-display font-black text-gray-900 text-xl sm:text-2xl">
                      Comment se passe l'installation de la Borne 360° ?
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Notre &eacute;quipe s'occupe de tout : livraison, montage des &eacute;clairages LED, tapis rouge, et animation complète du stand d&egrave;s 1h30 avant votre &eacute;v&eacute;nement.
                    </p>
                  </div>
                  <div className="sm:col-span-4 flex justify-center sm:justify-end">
                    <button
                      onClick={() => setCurrentTab('booking')}
                      className="px-6 py-3.5 bg-gold-500 text-white hover:bg-gold-600 text-xs font-bold uppercase tracking-widest rounded-none transition-all hover:scale-105 shadow-md"
                    >
                      R&eacute;server Maintenant
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: SECTORS */}
        {currentTab === 'offres' && (
          <Sectors 
            setCurrentTab={setCurrentTab} 
            setSelectedPackage={setSelectedPackageId} 
          />
        )}

        {/* VIEW: TRANSACTIONNAL BOOKING FORM */}
        {currentTab === 'booking' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <BookingForm 
              selectedPackageId={selectedPackageId} 
              onAddBooking={handleAddBooking} 
            />
          </div>
        )}

      </main>

      {/* 3. Footer */}
      <Footer setCurrentTab={setCurrentTab} />

      {/* Floating Interactive WhatsApp Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2 group" id="whatsapp-floating-bubble">
        {/* Subtle tooltip banner that expands on hover */}
        <div className="bg-white text-gray-900 border border-gray-150 px-3 py-1.5 shadow-lg text-[10px] font-bold uppercase tracking-wider rounded-none opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none mb-1">
          <span className="text-[#25D366] mr-1 animate-pulse">●</span> Service Client RM Events
        </div>
        
        <a
          href="https://wa.me/221779762075"
          target="_blank"
          rel="noreferrer"
          className="relative w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group active:scale-95 border-2 border-white"
          title="Discuter sur WhatsApp : +221 77 976 20 75"
        >
          {/* Pulsing visual halo under bubble */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75 animate-duration-1000"></span>
          
          <MessageCircle className="w-7 h-7 text-white fill-white relative z-10" />
        </a>
      </div>

    </div>
  );
}

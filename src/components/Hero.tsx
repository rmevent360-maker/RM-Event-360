import React from 'react';
import { Camera } from 'lucide-react';
import rmEventsLogo from '../assets/images/rm_events_logo_1781896594927.jpg';

interface HeroProps {
  setCurrentTab: (tab: string) => void;
}

export default function Hero({ setCurrentTab }: HeroProps) {
  return (
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 border-b border-gray-150">
      
      {/* Background visual graphics - faint glowing light representing the photobooth hoop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-gold-500/5 blur-3xl pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Block */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight tracking-tight text-gray-900 uppercase">
              NOTRE <span className="text-gold-500 italic">CONCEPT 360°</span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
              🎉 Bienvenue dans l'univers festif de RM EVENTS ! ✨ Que ce soit pour enflammer le dancefloor de votre mariage, célébrer un anniversaire ou donner un coup de boost mémorable à votre événement d'entreprise, notre incroyable 360 Vidéo Booth capture l'ambiance de votre fête sous tous les angles ! 🎥💥
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={() => setCurrentTab('booking')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gold-500 text-white font-black text-xs uppercase tracking-widest rounded-none shadow-lg hover:bg-gold-600 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Réserver en ligne
              </button>
            </div>
          </div>

          {/* Rotating frame with RM Events logo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-64 sm:w-72 md:w-80 h-64 sm:h-72 md:h-80 bg-white rounded-full border border-gold-500/20 shadow-2xl p-4 flex items-center justify-center" id="rotating-logo-frame">
              
              {/* Spinning Camera Hoop / Ring Light simulation */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold-500/35 animate-[spin_12s_linear_infinite] pointer-events-none">
                {/* Simulated high-speed camera mounting node */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2.5 w-6 h-6 bg-gold-500 rounded-full shadow-md flex items-center justify-center">
                  <Camera className="w-3 h-3 text-white" />
                </div>
                {/* Subtle blinking light */}
                <div className="absolute top-12 right-12 w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              </div>

              {/* Inner ambient luxury subtle spinning rings */}
              <div className="absolute inset-2 rounded-full border border-gold-500/10 pointer-events-none"></div>
              <div className="absolute inset-4 rounded-full border border-dashed border-gray-200 animate-[spin_20s_linear_infinite_reverse] pointer-events-none"></div>

              {/* Logo Container perfectly centered */}
              <div className="relative w-48 sm:w-52 md:w-56 h-48 sm:h-52 md:h-56 rounded-full overflow-hidden border-2 border-gold-500 shadow-lg bg-black flex items-center justify-center">
                <img 
                  src={rmEventsLogo} 
                  alt="RM Events Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              </div>

              {/* Luxury external gold ring glow detail */}
              <div className="absolute inset-0 rounded-full border border-gold-500/10 pointer-events-none shadow-[0_0_25px_rgba(212,175,55,0.15)]"></div>
            </div>

            <p className="text-[11px] text-gray-500 mt-4 uppercase tracking-widest text-center font-bold font-mono">
              ★ Prestige RM Events ★
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}


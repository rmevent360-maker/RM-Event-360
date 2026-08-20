import React from 'react';
import { Camera, Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  return (
    <footer id="footer" className="bg-gray-50 text-gray-600 border-t border-gray-200 pt-10 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Info and brand logo */}
          <div className="space-y-3 hidden md:block">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gold-500 text-white flex items-center justify-center font-black text-sm">
                RM
              </div>
              <span className="font-display font-extrabold tracking-widest text-gray-900 text-sm">
                RM EVENTS
              </span>
            </div>
            
            <p className="text-xs text-gray-500 max-w-xs">
              Location de plateforme de prise de vue tournante 360° à Dakar.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="hidden md:block">
            <h4 className="font-display font-bold text-gray-900 text-[11px] uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>
                <button onClick={() => setCurrentTab('accueil')} className="hover:text-gold-500 transition-colors">
                  Concept 360°
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('catalogue')} className="hover:text-gold-500 transition-colors">
                  Catalogue
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('booking')} className="hover:text-gold-500 transition-colors">
                  Réservation
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact info / Dakar focus */}
          <div>
            <h4 className="font-display font-bold text-gray-900 text-[11px] uppercase tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0" />
                <span>Dakar, Sénégal</span>
              </li>
              
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <a 
                  href="https://wa.me/221779762075" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-gold-500 transition-colors"
                >
                  +221 77 976 20 75
                </a>
              </li>

              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <a href="mailto:rmevent360@gmail.com" className="hover:text-gold-500 transition-colors">
                  rmevent360@gmail.com
                </a>
              </li>
            </ul>

            <div className="flex space-x-4 pt-5 mt-4 border-t border-gray-100" id="footer-socials">
              <a 
                href="https://www.instagram.com/rmevent360" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-400 hover:text-[#E1306C] transition-all duration-200 transform hover:scale-110" 
                title="Instagram @rmevent360"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.tiktok.com/@rmevent_360" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-400 hover:text-[#000000] transition-all duration-200 transform hover:scale-110" 
                title="TikTok @rmevent_360"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://wa.me/221779762075" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-400 hover:text-[#25D366] transition-all duration-200 transform hover:scale-110" 
                title="WhatsApp wa.me/221779762075"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright and shipping info removed per user request */}

      </div>
    </footer>
  );
}

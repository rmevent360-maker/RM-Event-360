import React, { useState } from 'react';
import { Camera, Calendar, Users, Award, ShieldAlert, KeyRound, Menu, X, Instagram, MessageCircle } from 'lucide-react';
import rmEventsLogo from '../assets/images/rm_events_logo_1781896594927.jpg';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Header({ currentTab, setCurrentTab }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'accueil', label: 'Notre Concept' },
    { id: 'offres', label: 'Nos Offres' },
    { id: 'booking', label: 'Réserver En Ligne' },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand matching image_e0cc99.jpg aesthetic */}
          <div 
            onClick={() => setCurrentTab('accueil')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {/* Custom high-quality logo branding from image attachment */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0 overflow-hidden rounded-full shadow-sm border border-gray-100">
              <img 
                id="header-navigation-logo"
                src={rmEventsLogo} 
                alt="RM Event 360 Logo" 
                className="w-14 h-14 object-cover rounded-full" 
                referrerPolicy="no-referrer" 
              />
            </div>
            
            <div className="flex flex-col">
              <span className="font-display text-lg tracking-wider font-extrabold text-gray-900 group-hover:text-gold-500 transition-colors duration-300">
                RM EVENT 360 APP
              </span>
              <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-gold-500 font-bold">
                Photobooth de Prestige • Dakar
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 sm:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3.5 py-2 rounded-none font-sans text-xs sm:text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                  currentTab === item.id
                    ? 'text-gold-500 bg-gold-500/5 border-b-2 border-gold-500'
                    : 'text-gray-600 hover:text-gold-500 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Callouts removed per user request */}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-none text-gray-600 hover:text-gold-500 hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu, show/hide based on menu state */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-150 shadow-2xl animate-fadeIn">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-none text-sm font-bold tracking-wide uppercase ${
                  currentTab === item.id
                    ? 'text-gold-500 bg-gold-500/5 border-l-4 border-gold-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            
              {/* Mobile bottom callouts removed per user request */}
          </div>
        </div>
      )}
    </header>
  );
}

import React, { useState } from 'react';
import { Play, Download, QrCode, Search, Film, Sparkles, AlertCircle } from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  category: 'corporate' | 'b2c';
  location: string;
  date: string;
  duration: string;
  videoThumb: string;
  colors: string;
}

export default function Mediatheque() {
  const [ticketQuery, setTicketQuery] = useState('');
  const [retrievedVideo, setRetrievedVideo] = useState<MediaItem | null>(null);
  const [searchError, setSearchError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initial list is Empty as requested ("vider les vidéos générées")
  const mediaItems: MediaItem[] = [];

  const handleRetrieveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setRetrievedVideo(null);

    if (!ticketQuery.trim()) return;

    // Simulate finding a private video for any query containing "RM"
    if (ticketQuery.toUpperCase().includes('RM')) {
      setRetrievedVideo({
        id: ticketQuery.toUpperCase(),
        title: 'Vidéo Souvenir Photobooth 360°',
        category: 'b2c',
        location: 'RM EVENTS, Dakar',
        date: new Date().toISOString().split('T')[0],
        duration: '15s Slow Motion',
        videoThumb: 'Votre Rendu 360°',
        colors: 'from-amber-600 via-orange-500 to-yellow-500'
      });
    } else {
      setSearchError("Aucun enregistrement trouvé pour ce code. Essayez un code contenant 'RM' (ex: RM-2026-101) pour tester la récupération de vidéo.");
    }
  };

  return (
    <div id="galerie-view" className="space-y-12 text-gray-800">
      
      {/* Title block */}
      <div className="border-b border-gray-150 pb-6 text-center md:text-left">
        <h3 className="font-display text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          La Galerie Privée
        </h3>
        <p className="text-xs text-gray-500 mt-2 max-w-2xl">
          Saisissez votre numéro de réservation RM EVENTS pour accéder instantanément à vos tournages Slow Motion HD et les télécharger sur votre mobile.
        </p>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Search Portal */}
        <div className="lg:col-span-5 bg-gray-50 border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="font-display font-bold text-gray-950 text-sm uppercase tracking-wider">
              Accès Téléspectateur
            </h4>
            <p className="text-[11.5px] text-gray-550 leading-relaxed">
              Vos clips vidéo 360° sont hautement sécurisés. Entrez le code figurant sur votre reçu imprimé ou reçu par email pour débloquer votre film.
            </p>
          </div>

          <form onSubmit={handleRetrieveVideo} className="space-y-3">
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mb-1.5">
                Code de Réservation / Événement
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: RM-2026-9812 ou RM"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  className="w-full bg-white border border-gray-250 py-3 pl-4 pr-12 text-xs font-mono font-bold text-gray-850 focus:outline-none focus:border-gold-500 rounded-none uppercase"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-4 bg-gray-900 text-gold-500 text-xs font-bold uppercase transition-all hover:bg-gray-800 cursor-pointer"
                >
                  Valider
                </button>
              </div>
            </div>

            {searchError && (
              <div className="bg-red-50 text-red-700 border border-red-150 p-2.5 text-[11px] font-semibold leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 transition-transform mt-0.5" />
                <span>{searchError}</span>
              </div>
            )}
          </form>

          <div className="pt-4 border-t border-gray-200">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Instructions de partage :</span>
            <ul className="space-y-2 text-[11px] text-gray-500">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0"></span>
                <span>Scannez le Code QR généré avec l'appareil photo de votre téléphone</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0"></span>
                <span>Enregistrez votre vidéo directement dans votre galerie locale</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Video Render Screen placeholder or item */}
        <div className="lg:col-span-7">
          {retrievedVideo ? (
            <div className="bg-white border border-gray-200 p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-150 pb-4">
                <div>
                  <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded uppercase font-black tracking-widest font-mono">
                    Rendu Prêt ✓
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-gray-900 mt-1">{retrievedVideo.title}</h4>
                </div>
                <span className="text-xs font-mono text-gray-400">{retrievedVideo.id}</span>
              </div>

              {/* Animated Screen */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-950 to-gray-800 overflow-hidden flex flex-col items-center justify-center p-6 border border-gray-250">
                <div className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr ${retrievedVideo.colors} opacity-50 blur-xl ${isPlaying ? 'animate-pulse' : ''}`}></div>
                
                {isPlaying ? (
                  <div className="z-10 text-center space-y-3">
                    {/* Simulated 365 spin animation element */}
                    <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-gold-500 animate-spin mx-auto"></div>
                    <span className="text-[10px] text-white/90 font-mono tracking-widest uppercase block animate-pulse">Lecture Slow Motion 360°...</span>
                    <button 
                      onClick={() => setIsPlaying(false)}
                      className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Mettre en pause
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="z-10 w-16 h-16 rounded-full bg-white/15 hover:bg-gold-500 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-xl"
                  >
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </button>
                )}

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[10px] text-white/50">
                  <span>📍 {retrievedVideo.location}</span>
                  <span>⏱ {retrievedVideo.duration}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="bg-gold-500 hover:bg-gold-600 text-white py-3.5 px-4 rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Transférer sur smartphone</span>
                </button>

                <button
                  onClick={() => {
                    alert(`Téléchargement du fichier de ${retrievedVideo.id}.mp4 démarré en Haute Définition !`);
                  }}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-3.5 px-4 rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger MP4 HD</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-10 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Film className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-display font-extrabold text-sm text-gray-900 uppercase tracking-wide">Galerie Vide</h5>
                <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                  Pas de vidéo publique disponible. Saisissez votre code dans la section de gauche pour déverrouiller votre espace privé de téléchargement.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* QR MODAL RETRIEVAL */}
      {showQrModal && retrievedVideo && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 border border-gray-200 rounded-none p-6 sm:p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold"
            >
              ✕
            </button>

            <span className="text-[9px] text-gold-500 tracking-widest uppercase font-black block font-mono">Partage Direct</span>
            <h5 className="font-display font-extrabold text-base">Transférer vers mobile</h5>
            
            <p className="text-xs text-gray-500 leading-normal">
              Ouvrez l'appareil photo ou le lecteur de code QR de votre mobile pour récupérer instantanément votre vidéo HD sur votre téléphone.
            </p>

            <div className="bg-gray-100 border border-gray-200 rounded-none p-6 flex flex-col items-center justify-center">
              <QrCode className="w-36 h-36 text-gray-900" />
              <span className="text-[10px] text-gray-550 font-mono mt-3 font-bold uppercase">{retrievedVideo.id}</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-widest rounded-none cursor-pointer"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

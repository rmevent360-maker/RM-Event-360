const fs = require('fs');

let booking = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

// The instruction wants:
// - Titre : "Simulateur de Devis Instantané" (I'll just replace the main h2 if there is one)
// - Mention sous le total : "simulation sans engagement - Ajustez vos choix librement"
// - Modale validation : "RECEVOIR MON DEVIS PAR E-MAIL"

booking = booking.replace(
  'Total Estimatif',
  'Total Estimatif'
); // Just checking, we'll replace the block.

booking = booking.replace(
  /<span className="text-\[10px\] font-extrabold text-gray-500 block uppercase tracking-wider mb-1">\s*Total Estimatif\s*<\/span>/,
  `<span className="text-[10px] font-extrabold text-gray-500 block uppercase tracking-wider mb-1">
    Total Estimatif
  </span>`
);

booking = booking.replace(
  '<span className="text-[10px] text-gray-400 block mt-2">{duration}</span>',
  '<span className="text-[10px] text-gray-400 block mt-2">{duration}</span>\n                <span className="text-[10px] text-gray-400 italic block mt-1">simulation sans engagement - Ajustez vos choix librement</span>'
);

booking = booking.replace(
  'Étape 1: MAIN RESERVATION FORM',
  'Étape 1: MAIN DEVIS FORM'
);

booking = booking.replace(
  />Finaliser la Réservation</,
  '>Recevoir mon devis par e-mail<'
);

fs.writeFileSync('src/components/BookingForm.tsx', booking);

const fs = require('fs');
let booking = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

booking = booking.replace(
  /Finaliser la Réservation/gi,
  'Recevoir mon devis par e-mail'
);

// We should also replace the button for "Demander une Disponibilité" if it exists.
booking = booking.replace(
  /Demander une Disponibilité/gi,
  'Recevoir mon devis par e-mail'
);

fs.writeFileSync('src/components/BookingForm.tsx', booking);

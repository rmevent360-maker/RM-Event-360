const fs = require('fs');
let booking = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

booking = booking.replace(
  /Simulateur de Devis en Ligne/g,
  'Simulateur de Devis Instantané'
);

fs.writeFileSync('src/components/BookingForm.tsx', booking);

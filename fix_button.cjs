const fs = require('fs');
let booking = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

booking = booking.replace(
  />\s*Obtenir mon Devis & Réserver\s*</gi,
  '>Recevoir mon devis par e-mail<'
);
// Also replacing if it's nested
booking = booking.replace(
  /Obtenir mon Devis & Réserver/gi,
  'Recevoir mon devis par e-mail'
);

fs.writeFileSync('src/components/BookingForm.tsx', booking);

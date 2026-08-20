const fs = require('fs');

// 1. Header
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(/>\s*Réserver en ligne\s*</gi, '>Simuler un devis<');
fs.writeFileSync('src/components/Header.tsx', header);

// 2. Hero
let hero = fs.readFileSync('src/components/Hero.tsx', 'utf8');
hero = hero.replace(/>\s*Réserver en Ligne\s*</gi, '>Simuler mon devis<');
fs.writeFileSync('src/components/Hero.tsx', hero);

// 3. EbookCatalog
let ebook = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');
ebook = ebook.replace(/>\s*Réserver Immédiatement\s*</g, '>Simuler mon devis<');
fs.writeFileSync('src/components/EbookCatalog.tsx', ebook);

// 4. BookingForm
let booking = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');
booking = booking.replace(/>\s*Réserver en Ligne\s*</gi, '>Simulateur de Devis Instantané<');
booking = booking.replace(
  'Total Réservation :',
  'Total Estimé :'
);
booking = booking.replace(
  'Total Estimé :',
  'Total Estimé :<div className="text-[10px] text-gray-500 font-normal italic mt-1 normal-case tracking-normal">simulation sans engagement - Ajustez vos choix librement</div>'
);
booking = booking.replace(
  />\s*Demander une Disponibilité\s*</gi, '>Recevoir mon devis par e-mail<'
);
// Make sure to replace any other "Réservation" mentions if appropriate, but keeping it simple for now.
fs.writeFileSync('src/components/BookingForm.tsx', booking);

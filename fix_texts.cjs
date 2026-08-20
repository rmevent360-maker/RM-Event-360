const fs = require('fs');

// 1. Header
let header = fs.readFileSync('src/components/Header.tsx', 'utf8');
header = header.replace(/Réserver En Ligne/gi, 'Simuler un devis');
fs.writeFileSync('src/components/Header.tsx', header);

// 2. App.tsx (if "Réserver Maintenant" is there)
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/Réserver Maintenant/gi, 'Simuler un devis');
fs.writeFileSync('src/App.tsx', app);

// 3. EbookCatalog
let ebook = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');
ebook = ebook.replace(/Réserver Immédiatement/gi, 'Simuler mon devis');
fs.writeFileSync('src/components/EbookCatalog.tsx', ebook);

// 4. BookingForm
let booking = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');
// "Total Réservation" might not be exactly that. Let's find out what the total text is.

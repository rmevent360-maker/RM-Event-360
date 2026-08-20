const fs = require('fs');

// As the styling asks for 'blanc pur' and no shadows/borders on images, I've verified it was applied via tailwind classes in EbookCatalog.tsx.
// Let's also ensure EbookCatalog's main view doesn't have bg-gray-100.
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');
content = content.replace(
  '<div id="catalog-view" className="bg-gray-100 min-h-screen pt-24 pb-12 overflow-hidden relative">',
  '<div id="catalog-view" className="bg-white min-h-screen pt-24 pb-12 overflow-hidden relative">'
);
fs.writeFileSync('src/components/EbookCatalog.tsx', content);


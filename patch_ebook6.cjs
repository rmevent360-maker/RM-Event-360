const fs = require('fs');
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

// The main viewer background
content = content.replace(
  '<div id="catalog-view" className="bg-gray-100 min-h-screen pt-24 pb-12 overflow-hidden relative">',
  '<div id="catalog-view" className="bg-white min-h-screen pt-24 pb-12 overflow-hidden relative">'
);

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

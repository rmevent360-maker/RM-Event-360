const fs = require('fs');
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

content = content.replace(
  'className="w-full h-full object-contain relative z-10 shadow-none border-none group-hover:scale-105 transition-transform duration-500"',
  'className="w-full h-full object-contain relative z-10"'
);

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

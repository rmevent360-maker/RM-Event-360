const fs = require('fs');
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

// The styling for the product image div container might still have bg-gray-50 if it wasn't replaced properly.
// Let's just do a clean replace using regex for the image side.

content = content.replace(/<div className="relative w-full aspect-\[4\/5\].*?">/g, '<div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center shadow-none border-none overflow-hidden group">');

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

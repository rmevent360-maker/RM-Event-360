const fs = require('fs');
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

// Ensure the page container on the left is totally clean without padding blocking the image if they wanted it massive, but standard p-6 is usually fine.
// The user asked for: "Applique un fond BLANC PUR (#FFFFFF ou classe Tailwind bg-white) sur tous les conteneurs d'images et les cartes de présentation"
// "Assure une intégration fluide sans ombres grises ou bordures colorées (shadow-none, border-none)"

content = content.replace(
  '<div className="w-full h-full bg-white p-6 sm:p-10 flex flex-col justify-center">',
  '<div className="w-full h-full bg-white p-6 sm:p-10 flex flex-col justify-center shadow-none border-none">'
);

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

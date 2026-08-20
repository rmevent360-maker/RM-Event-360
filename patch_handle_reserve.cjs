const fs = require('fs');

let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

content = content.replace(
  "interface EbookCatalogProps {\n  onStartBooking: () => void;\n}",
  "interface EbookCatalogProps {\n  onStartBooking: (item?: string) => void;\n}"
);

content = content.replace(
  "  const handleReserve = () => {\n    onStartBooking();\n  };",
  "  const handleReserve = (productTitle: string) => {\n    onStartBooking(productTitle);\n  };"
);

content = content.replace(
  "                          <button \n                            onClick={handleReserve}",
  "                          <button \n                            onClick={() => handleReserve(product.title)}"
);
// Replace it multiple times in the map loop. Let's just use a regex replace all
content = content.replace(/onClick=\{handleReserve\}/g, "onClick={() => handleReserve(product.title)}");

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

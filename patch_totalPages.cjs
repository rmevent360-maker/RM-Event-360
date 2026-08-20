const fs = require('fs');

let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

// Update totalPages to 12
content = content.replace(
  "  // Total pages = Cover(1) + 4 Products(8) + Back Cover(1) = 10\n  const totalPages = 10;",
  "  // Total pages = Cover(1) + 5 Products(10) + Back Cover(1) = 12\n  const totalPages = 12;"
);

// Update Back Cover page number
content = content.replace(
  "              {/* PAGE 9: BACK COVER (Left) */}\n              <Page number={9} density=\"hard\" hidePageNumber>",
  "              {/* PAGE 11: BACK COVER (Left) */}\n              <Page number={11} density=\"hard\" hidePageNumber>"
);

content = content.replace(
  "idx === 4 ? 9 : spreadIdx",
  "idx === 5 ? 11 : spreadIdx"
);

content = content.replace(
  "|| (idx === 4 && currentPage === 9)",
  "|| (idx === 5 && currentPage === 11)"
);

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

// Completely remove any shadow on the pages if it's too noticeable.
content = content.replace(
  'style={{ boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}',
  'style={{ boxShadow: "none" }}'
);

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

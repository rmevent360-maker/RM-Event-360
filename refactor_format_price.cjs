const fs = require('fs');
const path = require('path');

const files = [
  { path: 'src/components/DevisExport.tsx', importPath: '../utils/format' },
  { path: 'src/components/BookingForm.tsx', importPath: '../utils/format' },
  { path: 'src/components/PartnerDashboard.tsx', importPath: '../utils/format' }
];

for (const file of files) {
  let content = fs.readFileSync(file.path, 'utf8');
  
  // Remove local formatPrice function
  const startRegex = /const formatPrice = \(value: string \| number\): string => \{/;
  const match = content.match(startRegex);
  
  if (match) {
    const startIndex = match.index;
    const endIndex = content.indexOf('};', startIndex) + 2;
    content = content.substring(0, startIndex) + content.substring(endIndex);
    
    // Add import statement at the top (after other imports)
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    
    const importStatement = `\nimport { formatPrice } from '${file.importPath}';`;
    content = content.substring(0, endOfLastImport) + importStatement + content.substring(endOfLastImport);
    
    fs.writeFileSync(file.path, content, 'utf8');
    console.log(`Refactored ${file.path}`);
  } else {
    console.log(`Could not find formatPrice in ${file.path}`);
  }
}

const fs = require('fs');
let content = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

// The instructions mentioned: "Total Estimé :" inside the form, let's verify if "Total Estimatif" was replaced by "Total Estimé" completely, or if we need to do one last check.

content = content.replace(
  /Total Estimatif/gi,
  'Total Estimé'
);

// Check for "simulation sans engagement - Ajustez vos choix librement"
if (!content.includes('simulation sans engagement - Ajustez vos choix librement')) {
  // we add it under the Total Estimé in the bottom bar
  content = content.replace(
    /<span className="text-\[10px\] text-gray-400 block mt-2">\{duration\}<\/span>/,
    '<span className="text-[10px] text-gray-400 block mt-2">{duration}</span>\n                <span className="text-[10px] text-gray-500 italic block mt-1 normal-case tracking-normal">simulation sans engagement - Ajustez vos choix librement</span>'
  );
}

fs.writeFileSync('src/components/BookingForm.tsx', content);

const fs = require('fs');
const file = 'src/components/BookingForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Inject formatPrice function
if (!content.includes('const formatPrice')) {
  const insertIndex = content.indexOf('interface BookingFormProps');
  const func = `// Helper pour garantir le formatage correct du prix avec un espace standard
const formatPrice = (value: number | string): string => {
  let numericValue = typeof value === 'string' 
    ? parseInt(value.replace(/\\//g, ''), 10) 
    : value;
    
  if (isNaN(numericValue)) numericValue = 0;
  
  return numericValue.toLocaleString('fr-FR').replace(/\\u202f/g, ' ');
};

`;
  content = content.slice(0, insertIndex) + func + content.slice(insertIndex);
}

// Replacements
content = content.replace(/\$\{booking\.totalPrice\.toLocaleString\('fr-FR'\)\}/g, '${formatPrice(booking.totalPrice)}');
content = content.replace(/\$\{price\.toLocaleString\('fr-FR'\)\}/g, '${formatPrice(price)}');
content = content.replace(/\$\{generatedTicket\.totalPrice\.toLocaleString\('fr-FR'\)\}/g, '${formatPrice(generatedTicket.totalPrice)}');

content = content.replace(/\{\(duration === 'Journée Pleine' \? 100000 : 60000\)\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(duration === 'Journée Pleine' ? 100000 : 60000)}");

content = content.replace(/\{\(duration === 'Journée Pleine' \? 200000 : 120000\)\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(duration === 'Journée Pleine' ? 200000 : 120000)}");

content = content.replace(/\{\(qtyLyre \* 100000\)\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(qtyLyre * 100000)}");

content = content.replace(/\{\(duration === 'Journée Pleine' \? 15000 : 10000\)\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(duration === 'Journée Pleine' ? 15000 : 10000)}");

content = content.replace(/\{\(qtyProjecteur \* \(duration === 'Journée Pleine' \? 15000 : 10000\)\)\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(qtyProjecteur * (duration === 'Journée Pleine' ? 15000 : 10000))}");

content = content.replace(/\{\(qtyPotelets \* \(duration === 'Journée Pleine' \? 15000 : 10000\)\)\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(qtyPotelets * (duration === 'Journée Pleine' ? 15000 : 10000))}");

content = content.replace(/\{totalPrice\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(totalPrice)}");
content = content.replace(/\{generatedTicket\.totalPrice\.toLocaleString\('fr-FR'\)\}/g, "{formatPrice(generatedTicket.totalPrice)}");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed BookingForm.tsx');

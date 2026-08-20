const fs = require('fs');

let content = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

content = content.replace(
  "interface BookingFormProps {\n  onAddBooking: (newBooking: Booking) => void;\n}",
  "interface BookingFormProps {\n  onAddBooking: (newBooking: Booking) => void;\n  preselectedItem?: string | null;\n}"
);

content = content.replace(
  "export default function BookingForm({ onAddBooking }: BookingFormProps) {",
  "export default function BookingForm({ onAddBooking, preselectedItem }: BookingFormProps) {"
);

// We need to add a useEffect to handle preselectedItem.
// We'll place it right after the states declarations.
const searchStr = "const [qtyPotelets, setQtyPotelets] = useState(0); // up to 6 paires";
const effectBlock = `
  useEffect(() => {
    if (preselectedItem) {
      setOptPhotobooth(false);
      setOptReflexe(false);
      setQtyLyre(0);
      setQtyProjecteur(0);
      setQtyPotelets(0);
      
      const item = preselectedItem.toLowerCase();
      if (item.includes('photobooth')) setOptPhotobooth(true);
      else if (item.includes('réflexe') || item.includes('reflexe')) setOptReflexe(true);
      else if (item.includes('lyre')) setQtyLyre(1);
      else if (item.includes('projecteur')) setQtyProjecteur(1);
      else if (item.includes('potelet') || item.includes('barre')) setQtyPotelets(1);
    }
  }, [preselectedItem]);
`;

content = content.replace(searchStr, searchStr + "\n" + effectBlock);

fs.writeFileSync('src/components/BookingForm.tsx', content);

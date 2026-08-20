const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Add preselectedItem state
appContent = appContent.replace(
  "const [currentTab, setCurrentTab] = useState<string>('accueil');",
  "const [currentTab, setCurrentTab] = useState<string>('accueil');\n  const [preselectedItem, setPreselectedItem] = useState<string | null>(null);"
);

// Fix EbookCatalog props
appContent = appContent.replace(
  "<EbookCatalog setCurrentTab={setCurrentTab} />",
  "<EbookCatalog onStartBooking={(item) => { setPreselectedItem(item || null); setCurrentTab('booking'); }} />"
);

// Fix BookingForm props
appContent = appContent.replace(
  "<BookingForm \n              onAddBooking={handleAddBooking} \n            />",
  "<BookingForm \n              onAddBooking={handleAddBooking} \n              preselectedItem={preselectedItem}\n            />"
);
// Also match single-line if it is formatted differently
appContent = appContent.replace(
  "<BookingForm onAddBooking={handleAddBooking} />",
  "<BookingForm onAddBooking={handleAddBooking} preselectedItem={preselectedItem} />"
);

fs.writeFileSync('src/App.tsx', appContent);

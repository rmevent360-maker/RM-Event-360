const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The user asked for "Blanc pur", we should probably change the bg-gray-50 wrapper in App.tsx just to be safe.
content = content.replace(
  '<div className="bg-gray-50 min-h-[85vh]">',
  '<div className="bg-white min-h-[85vh]">'
);

fs.writeFileSync('src/App.tsx', content);

const fs = require('fs');
let content = fs.readFileSync('src/components/EbookCatalog.tsx', 'utf8');

// Update image container styles strictly to match user instructions:
content = content.replace(
  'className="relative w-full aspect-[4/5] bg-white rounded-none p-6 flex items-center justify-center shadow-none border-none overflow-hidden group"',
  'className="relative w-full aspect-[4/5] bg-white flex items-center justify-center overflow-hidden group shadow-none border-none"'
);

// We should also remove the bg-gray-50 from the Page components that we don't want
content = content.replace(
  '<div className="w-full h-full bg-gray-50 flex items-center justify-center p-12 text-center">',
  '<div className="w-full h-full bg-white flex items-center justify-center p-12 text-center">'
);

// We should remove the shadow from the overall book component wrapper.
content = content.replace(
  '<div className="page bg-white shadow-xl overflow-hidden relative" ref={ref} data-density={props.density || \'soft\'}>',
  '<div className="page bg-white overflow-hidden relative" style={{ boxShadow: "0 0 10px rgba(0,0,0,0.1)" }} ref={ref} data-density={props.density || \'soft\'}>'
);

fs.writeFileSync('src/components/EbookCatalog.tsx', content);

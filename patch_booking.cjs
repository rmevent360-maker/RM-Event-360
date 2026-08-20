const fs = require('fs');
let content = fs.readFileSync('src/components/BookingForm.tsx', 'utf8');

content = content.replace(
  "import { Calendar, Clock, Phone, Mail, User, ShieldCheck, Ticket, Download, ArrowRight, Check, MapPin, Sparkles, ChevronDown, Camera, Zap, Lightbulb, Award, Plus, Minus, ShoppingCart, X } from 'lucide-react';",
  "import { Calendar, Clock, Phone, Mail, User, ShieldCheck, Ticket, Download, ArrowRight, Check, MapPin, Sparkles, ChevronDown, Camera, Zap, Lightbulb, Award, Plus, Minus, ShoppingCart, X, Target } from 'lucide-react';"
);

content = content.replace(
  "  const [optPhotobooth, setOptPhotobooth] = useState(true);",
  "  const [optPhotobooth, setOptPhotobooth] = useState(true);\n  const [optReflexe, setOptReflexe] = useState(false);"
);

content = content.replace(
  "    if (optPhotobooth) {\n      total += isLong ? 100000 : 60000;\n    }",
  "    if (optPhotobooth) {\n      total += isLong ? 100000 : 60000;\n    }\n    \n    if (optReflexe) {\n      total += isLong ? 200000 : 120000;\n    }"
);

content = content.replace(
  "        photobooth360: optPhotobooth,",
  "        photobooth360: optPhotobooth,\n        reflexeGame: optReflexe,"
);

content = content.replace(
  "- Photobooth 360° : ${booking.options.photobooth360 ? 'Oui' : 'Non'}",
  "- Photobooth 360° : ${booking.options.photobooth360 ? 'Oui' : 'Non'}\\n- Jeu de Réflexe : ${booking.options.reflexeGame ? 'Oui' : 'Non'}"
);

content = content.replace(
  "      if (generatedTicket.options.photobooth360) {\n        drawItemRow(\"Photobooth 360° Motorisé\", \"1\", isLong ? 100000 : 60000);\n      }",
  "      if (generatedTicket.options.photobooth360) {\n        drawItemRow(\"Photobooth 360° Motorisé\", \"1\", isLong ? 100000 : 60000);\n      }\n      if (generatedTicket.options.reflexeGame) {\n        drawItemRow(\"Jeu de Réflexe (Catching Stick Game)\", \"1\", isLong ? 200000 : 120000);\n      }"
);

const reflexeBlock = `
                {/* Jeu de Réflexe */}
                <div className={\`relative overflow-hidden transition-all duration-300 border-2 rounded-2xl p-4 flex flex-col justify-between \${optReflexe ? 'border-orange-500 bg-orange-50/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-gray-200 bg-white hover:border-gray-300'}\`}>
                  {optReflexe && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">Inclus</div>}
                  <div className="flex items-start gap-4">
                    <div className={\`p-3 rounded-xl \${optReflexe ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}\`}>
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-gray-900 text-sm">Jeu de Réflexe</h6>
                      <p className="text-[10px] text-gray-500 leading-tight mt-1">Borne interactive Catching Stick Game.</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100/50 pt-3">
                    <span className="text-sm font-black text-orange-600">
                      {(duration === 'Journée Pleine' ? 200000 : 120000).toLocaleString('fr-FR')} FCFA
                    </span>
                    <button
                      type="button"
                      onClick={() => setOptReflexe(!optReflexe)}
                      className={\`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors \${optReflexe ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-900 text-white hover:bg-black'}\`}
                    >
                      {optReflexe ? 'Retirer' : 'Ajouter'}
                    </button>
                  </div>
                </div>
`;

content = content.replace(
  "                {/* Lyre de Scène */}",
  reflexeBlock + "\n                {/* Lyre de Scène */}"
);

const summaryBlock = `
                    {optReflexe && (
                      <li className="flex gap-2">
                        <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>Jeu de Réflexe</span>
                      </li>
                    )}
`;

content = content.replace(
  "                    {qtyLyre > 0 && (",
  summaryBlock + "                    {qtyLyre > 0 && ("
);

fs.writeFileSync('src/components/BookingForm.tsx', content);

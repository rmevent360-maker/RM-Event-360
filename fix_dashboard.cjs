const fs = require('fs');
const file = 'src/components/PartnerDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Inject formatPrice function
if (!content.includes('const formatPrice')) {
  const insertIndex = content.indexOf('interface PartnerDashboardProps');
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

// Replace all .toLocaleString() with formatPrice
content = content.replace(/\$\{payoutAmount\.toLocaleString\(\)\}/g, '${formatPrice(payoutAmount)}');
content = content.replace(/\(activePartner\?\.totalEarnings \|\| 0\)\.toLocaleString\(\)/g, 'formatPrice(activePartner?.totalEarnings || 0)');
content = content.replace(/accruedCommissions\.toLocaleString\(\)/g, 'formatPrice(accruedCommissions)');
content = content.replace(/\(activePartner\?\.withdrawnAmount \|\| 0\)\.toLocaleString\(\)/g, 'formatPrice(activePartner?.withdrawnAmount || 0)');
content = content.replace(/\(\(activePartner\?\.totalEarnings \|\| 0\) - \(activePartner\?\.withdrawnAmount \|\| 0\)\)\.toLocaleString\(\)/g, 'formatPrice((activePartner?.totalEarnings || 0) - (activePartner?.withdrawnAmount || 0))');
content = content.replace(/\(accruedCommissions - 30000 > 0 \? accruedCommissions - 30000 : 0\)\.toLocaleString\(\)/g, 'formatPrice(accruedCommissions - 30000 > 0 ? accruedCommissions - 30000 : 0)');
content = content.replace(/\{\(act\.visitorCount\)\.toLocaleString\(\)\}/g, '{formatPrice(act.visitorCount)}');
content = content.replace(/\{\(act\.totalRevenue\)\.toLocaleString\(\)\}/g, '{formatPrice(act.totalRevenue)}');
content = content.replace(/\{\(act\.partnerEarnings\)\.toLocaleString\(\)\}/g, '{formatPrice(act.partnerEarnings)}');
content = content.replace(/\{\(b\.totalPrice\)\.toLocaleString\(\)\}/g, '{formatPrice(b.totalPrice)}');
content = content.replace(/\{\(comm\)\.toLocaleString\(\)\}/g, '{formatPrice(comm)}');
content = content.replace(/\{pay\.amount\.toLocaleString\(\)\}/g, '{formatPrice(pay.amount)}');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed PartnerDashboard.tsx');

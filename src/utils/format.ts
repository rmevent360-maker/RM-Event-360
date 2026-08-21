export const formatPrice = (value: string | number): string => {
  if (value === undefined || value === null) return "0";

  // 1. Nettoyage strict : on supprime tous les slashs, points, virgules ou espaces
  const cleanString = String(value).replace(/[\s\/\.,]/g, '');
  
  // 2. Conversion en entier
  const numericValue = parseInt(cleanString, 10);
  if (isNaN(numericValue)) return "0";

  // 3. Formatage français
  let formatted = numericValue.toLocaleString('fr-FR');

  // 4. FIX PDF : Remplacement de l'espace insécable (\u202F) par un espace standard
  formatted = formatted.replace(/\u202F/g, ' ');

  return formatted;
};

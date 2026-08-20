import { jsPDF } from 'jspdf';
import { CATALOG_PRODUCTS, CATALOG_META } from '../data/catalog';

const getImageDataUrl = (imgUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imgUrl;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 900;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve('');
        }
      } catch (err) {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
  });
};

export async function downloadCatalogEbookPdf(onProgress?: (msg: string) => void) {
  try {
    if (onProgress) onProgress('Préparation du catalogue haute définition...');
    
    // Create A4 portrait document (210 x 297 mm)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;

    if (onProgress) onProgress('Chargement des visuels...');
    const logoBase64 = await getImageDataUrl(CATALOG_META.logo);
    const productImages = await Promise.all(
      CATALOG_PRODUCTS.map(async (p) => ({ pageNumber: p.pageNumber, base64: await getImageDataUrl(p.image) }))
    );

    // ==========================================
    // PAGE 1: FRONT COVER (Like Flipbook)
    // ==========================================
    if (onProgress) onProgress('Génération de la couverture...');
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    // Left orange border
    doc.setFillColor(234, 88, 12);
    doc.rect(0, 0, 8, pageHeight, 'F');

    // Logo
    if (logoBase64) doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 25, 60, 50, 50);

    // Black tag "Collection 2026"
    doc.setFillColor(17, 24, 39);
    doc.rect(pageWidth / 2 - 25, 130, 50, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('COLLECTION 2026', pageWidth / 2, 135.5, { align: 'center' });

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(40);
    doc.text('CATALOGUE', pageWidth / 2, 160, { align: 'center' });
    doc.setTextColor(234, 88, 12);
    doc.text('RM EVENTS', pageWidth / 2, 175, { align: 'center' });

    // Subtitle
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(12);
    doc.text('MATÉRIEL & ÉCLAIRAGE VIP', pageWidth / 2, 210, { align: 'center' });

    // ==========================================
    // PRODUCT PAGES (Landscape: Left Image, Right Details)
    // ==========================================
    for (let i = 0; i < CATALOG_PRODUCTS.length; i++) {
      const product = CATALOG_PRODUCTS[i];
      if (onProgress) onProgress(`Génération de la page ${product.title}...`);

      doc.addPage('a4', 'landscape');
      const landWidth = 297;
      const landHeight = 210;

      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, landWidth, landHeight, 'F');
      
      // Left Side: Image
      const imgBase64 = productImages.find(p => p.pageNumber === product.pageNumber)?.base64;
      if (imgBase64) {
        // Center image on the left half
        const imgSize = 130;
        doc.addImage(imgBase64, 'JPEG', (landWidth / 2 - imgSize) / 2, (landHeight - imgSize) / 2, imgSize, imgSize);
      }
      
      // Divider line (optional, but looks clean)
      doc.setDrawColor(243, 244, 246);
      doc.setLineWidth(0.5);
      doc.line(landWidth / 2, 20, landWidth / 2, landHeight - 20);

      // Right Side: Details
      const rightX = landWidth / 2 + 20;

      // Category Tag
      doc.setFillColor(255, 237, 213);
      const catWidth = doc.getStringUnitWidth(product.category.toUpperCase()) * 4 + 10;
      doc.rect(rightX, 40, catWidth, 10, 'F');
      doc.setTextColor(234, 88, 12);
      doc.setFontSize(10);
      doc.text(product.category.toUpperCase(), rightX + 5, 46.5);

      // Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(28);
      doc.text(product.title.toUpperCase(), rightX, 70);

      // Description
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      const splitDesc = doc.splitTextToSize(product.description, landWidth / 2 - 40);
      doc.text(splitDesc, rightX, 90);

      // Points forts
      let curY = 90 + (splitDesc.length * 6) + 15;
      product.pointsForts.forEach(pt => {
        doc.setTextColor(234, 88, 12);
        doc.setFont('helvetica', 'bold');
        doc.text('>', rightX, curY); 
        
        doc.setTextColor(55, 65, 81);
        doc.setFont('helvetica', 'normal');
        const splitPt = doc.splitTextToSize(pt, landWidth / 2 - 48);
        doc.text(splitPt, rightX + 8, curY);
        curY += splitPt.length * 6 + 3;
      });

      // Page number bottom center
      doc.setTextColor(209, 213, 219);
      doc.setFontSize(10);
      doc.text(`- ${2 + i} -`, landWidth / 2, landHeight - 15, { align: 'center' });
    }

    // ==========================================
    // BACK COVER (Portrait)
    // ==========================================
    if (onProgress) onProgress('Finalisation...');
    doc.addPage('a4', 'portrait');
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    // Right orange border
    doc.setFillColor(234, 88, 12);
    doc.rect(pageWidth - 8, 0, 8, pageHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('RM EVENTS', pageWidth / 2, 120, { align: 'center' });

    doc.setTextColor(234, 88, 12);
    doc.setFontSize(12);
    doc.text('CONTACT & RÉSERVATION', pageWidth / 2, 140, { align: 'center' });

    doc.setTextColor(209, 213, 219);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`Tél: ${CATALOG_META.phone}`, pageWidth / 2, 170, { align: 'center' });
    doc.text('Dakar, Sénégal', pageWidth / 2, 180, { align: 'center' });

    doc.setTextColor(107, 114, 128);
    doc.setFontSize(10);
    doc.text('© 2026 RM Events - Tous droits réservés.', pageWidth / 2, pageHeight - 30, { align: 'center' });

    // Save
    doc.save('Catalogue-RM-Events-2026.pdf');
    if (onProgress) onProgress('Téléchargement terminé !');
  } catch (error) {
    console.error('Erreur PDF:', error);
    throw error;
  }
}
import { jsPDF } from 'jspdf';
import { CATALOG_PRODUCTS, CATALOG_META } from '../data/catalog';

// Helper function to load an image URL into a high-quality base64 Data URL for jsPDF
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
          const dataURL = canvas.toDataURL('image/jpeg', 0.95);
          resolve(dataURL);
        } else {
          resolve('');
        }
      } catch (err) {
        console.warn('Canvas export warning:', err);
        resolve('');
      }
    };
    img.onerror = () => {
      console.warn('Could not load image for PDF:', imgUrl);
      resolve('');
    };
  });
};

export async function downloadCatalogEbookPdf(onProgress?: (msg: string) => void) {
  try {
    if (onProgress) onProgress('Préparation du catalogue haute définition...');
    
    // Create A4 portrait document (210 x 297 mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182 mm

    // Pre-load all product images to base64
    if (onProgress) onProgress('Chargement des visuels grand format...');
    const logoBase64 = await getImageDataUrl(CATALOG_META.logo);
    const productImages = await Promise.all(
      CATALOG_PRODUCTS.map(async (p) => {
        const b64 = await getImageDataUrl(p.image);
        return { pageNumber: p.pageNumber, base64: b64 };
      })
    );

    const getImageForPage = (pageNumber: number) => {
      return productImages.find((pi) => pi.pageNumber === pageNumber)?.base64 || '';
    };

    // =========================================================================
    // PAGE 1 : COUVERTURE E-BOOK DE PRESTIGE
    // =========================================================================
    if (onProgress) onProgress('Génération de la couverture...');

    // Background luxury borders
    doc.setFillColor(254, 252, 247); // warm luxury off-white
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer double gold border
    doc.setDrawColor(217, 155, 38); // Gold
    doc.setLineWidth(0.8);
    doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

    doc.setDrawColor(235, 195, 100);
    doc.setLineWidth(0.3);
    doc.rect(9, 9, pageWidth - 18, pageHeight - 18);

    // Decorative header band
    doc.setFillColor(26, 26, 26);
    doc.rect(14, 18, pageWidth - 28, 2, 'F');

    // Larger Logo embedding on Cover (46 x 46 mm)
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 23, 26, 46, 46);
      } catch (e) {
        console.warn('Could not add logo on cover', e);
      }
    }

    // Brand Name
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('RM EVENTS PRESTIGE', pageWidth / 2, 80, { align: 'center' });

    doc.setTextColor(190, 130, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LOCATION ÉVÉNEMENTIELLE VIP • DAKAR - SÉNÉGAL', pageWidth / 2, 87, { align: 'center' });

    // Main Catalog Big Title Box
    doc.setFillColor(26, 26, 26);
    doc.roundedRect(18, 98, pageWidth - 36, 42, 2, 2, 'F');

    doc.setTextColor(245, 190, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(23);
    doc.text('CATALOGUE MATÉRIEL', pageWidth / 2, 115, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text("SOLUTIONS ÉVÉNEMENTIELLES & D'ANIMATION PREMIUM", pageWidth / 2, 127, { align: 'center' });

    // Center summary box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(217, 155, 38);
    doc.setLineWidth(0.4);
    doc.roundedRect(20, 152, pageWidth - 40, 68, 3, 3, 'FD');

    doc.setTextColor(190, 130, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ÉQUIPEMENTS & ANIMATIONS DISPONIBLES', pageWidth / 2, 165, { align: 'center' });

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const items = [
      '• Photobooth 360° Motorisé Haute Définition avec Ring Light LED',
      '• Jeu de Réflexe Interactif (Catching Stick Game & Chrono Digital)',
      '• Lyres de Scène Asservies (Moving Head Beam) & Effets DMX',
      '• Projecteurs LED Studio Professionnels avec Volets & Trépieds',
      '• Potelets Dorés Miroir VIP avec Cordons en Velours Rouge'
    ];

    let itemY = 176;
    items.forEach((item) => {
      doc.text(item, 28, itemY);
      itemY += 7.5;
    });

    // Tagline and Contact at bottom
    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Sublimez vos mariages, galas, séminaires & soirées privées', pageWidth / 2, 238, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Service logistique, installation et régie technique incluses sur Dakar et environs.', pageWidth / 2, 245, { align: 'center' });

    // WhatsApp Contact bar
    doc.setFillColor(37, 211, 102); // WhatsApp green
    doc.roundedRect(pageWidth / 2 - 45, 256, 90, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('WhatsApp Direct : +221 77 976 20 75', pageWidth / 2, 262.5, { align: 'center' });

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(7.5);
    doc.text('Catalogue Officiel RM Events • Édition 2026 • Page 1 / 7', pageWidth / 2, 282, { align: 'center' });

    // =========================================================================
    // PAGES 2 à 6 : LES FICHES MATÉRIEL DÉTAILLÉES AVEC GRANDES IMAGES
    // =========================================================================
    for (let i = 0; i < CATALOG_PRODUCTS.length; i++) {
      const product = CATALOG_PRODUCTS[i];
      if (onProgress) onProgress(`Génération de la fiche ${product.title} (Grand Format)...`);

      doc.addPage();

      // Page background & frame
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.4);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

      // Top Header line
      doc.setFillColor(217, 155, 38);
      doc.rect(14, 14, 3, 10, 'F');

      doc.setTextColor(190, 130, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(product.category.toUpperCase(), 20, 19);

      doc.setTextColor(110, 110, 110);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('RM EVENTS DAKAR • +221 77 976 20 75', pageWidth - 14, 19, { align: 'right' });

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.25);
      doc.line(14, 26, pageWidth - 14, 26);

      // Product Title
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.text(product.title, 14, 35);

      // =======================================================================
      // SECTION IMAGE GRAND FORMAT (Agrandie à 182mm x 118mm)
      // =======================================================================
      const imgBase64 = getImageForPage(product.pageNumber);
      const imgBoxY = 40;
      const imgBoxHeight = 118; // Significantly increased size for maximum visual clarity
      const imgBoxWidth = contentWidth; // 182 mm

      // Outer luxury container frame for image
      doc.setFillColor(248, 248, 248);
      doc.setDrawColor(217, 155, 38);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, imgBoxY, imgBoxWidth, imgBoxHeight, 2, 2, 'FD');

      if (imgBase64) {
        try {
          // Embed large photo within the frame with clean 2mm padding
          doc.addImage(
            imgBase64,
            'JPEG',
            margin + 2,
            imgBoxY + 2,
            imgBoxWidth - 4,
            imgBoxHeight - 4
          );
        } catch (e) {
          console.warn('Could not add image for product', product.title, e);
        }
      }

      // Small luxury badge on the corner of the image
      doc.setFillColor(26, 26, 26);
      doc.roundedRect(margin + 5, imgBoxY + imgBoxHeight - 11, 56, 7.5, 1, 1, 'F');
      doc.setTextColor(245, 190, 60);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(product.imageLabel, margin + 33, imgBoxY + imgBoxHeight - 6, { align: 'center' });

      // =======================================================================
      // LOWER SECTION : INFORMATIONS, POINTS FORTS & RECOMMANDATION
      // =======================================================================
      let curY = imgBoxY + imgBoxHeight + 8;

      // Section 1: Description
      doc.setFillColor(190, 130, 20);
      doc.rect(margin, curY, 2, 5, 'F');

      doc.setTextColor(190, 130, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('DESCRIPTION DU MATÉRIEL', margin + 5, curY + 4);

      curY += 7.5;
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      const splitDesc = doc.splitTextToSize(product.description, contentWidth);
      doc.text(splitDesc, margin, curY);
      curY += splitDesc.length * 4.2 + 5;

      // Section 2: Points Forts & Caractéristiques
      doc.setFillColor(190, 130, 20);
      doc.rect(margin, curY, 2, 5, 'F');

      doc.setTextColor(190, 130, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('POINTS FORTS & CARACTÉRISTIQUES CLÉS', margin + 5, curY + 4);

      curY += 7.5;
      doc.setFontSize(8);
      product.pointsForts.forEach((pt) => {
        doc.setTextColor(190, 130, 20);
        doc.setFont('helvetica', 'bold');
        doc.text('◆', margin + 1, curY);

        doc.setTextColor(45, 45, 45);
        doc.setFont('helvetica', 'normal');
        const splitPt = doc.splitTextToSize(pt, contentWidth - 7);
        doc.text(splitPt, margin + 6, curY);
        curY += splitPt.length * 3.8 + 1.2;
      });

      // Section 3: Idéal Pour Box
      curY += 2;
      doc.setFillColor(254, 250, 240);
      doc.setDrawColor(235, 195, 100);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, curY, contentWidth, 14, 2, 2, 'FD');

      doc.setTextColor(160, 105, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('RECOMMANDÉ POUR :', margin + 4, curY + 5);

      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      const splitIdeal = doc.splitTextToSize(product.idealPour, contentWidth - 8);
      doc.text(splitIdeal, margin + 4, curY + 10);

      // Page Footer
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, 277, pageWidth - margin, 277);

      doc.setTextColor(130, 130, 130);
      doc.setFontSize(7.5);
      doc.text('RM Events Dakar - Catalogue Matériel & Équipements Événementiels', margin, 283);
      doc.text(`Page ${product.pageNumber} / 7`, pageWidth - margin, 283, { align: 'right' });
    }

    // =========================================================================
    // PAGE 7 : DERNIÈRE PAGE (CLÔTURE & RÉSERVATION DIRECTE)
    // =========================================================================
    if (onProgress) onProgress('Finalisation du document...');
    doc.addPage();

    // Background luxury cream
    doc.setFillColor(254, 252, 247);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer double gold border
    doc.setDrawColor(217, 155, 38);
    doc.setLineWidth(0.8);
    doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

    doc.setDrawColor(235, 195, 100);
    doc.setLineWidth(0.3);
    doc.rect(9, 9, pageWidth - 18, pageHeight - 18);

    // Center Larger Logo (44 x 44 mm)
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', pageWidth / 2 - 22, 30, 44, 44);
      } catch (e) {
        console.warn('Could not add logo on outro', e);
      }
    }

    doc.setTextColor(190, 130, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RM EVENTS SÉNÉGAL', pageWidth / 2, 82, { align: 'center' });

    doc.setTextColor(26, 26, 26);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('SUBLIMEZ VOS ÉVÉNEMENTS', pageWidth / 2, 96, { align: 'center' });

    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const outroTxt = "Mariage, gala de prestige, lancement de produit, anniversaire ou soirée d'entreprise : notre équipe assure la livraison, l'installation professionnelle et la régie de votre animation pour des souvenirs inoubliables.";
    const splitOutro = doc.splitTextToSize(outroTxt, contentWidth - 20);
    doc.text(splitOutro, pageWidth / 2, 108, { align: 'center' });

    // Commitments cards
    const cardY = 135;
    const cardW = (contentWidth - 8) / 2;

    // Card 1
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(217, 155, 38);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cardY, cardW, 40, 2, 2, 'FD');

    doc.setTextColor(190, 130, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('SERVICE CLÉ EN MAIN', margin + cardW / 2, cardY + 10, { align: 'center' });

    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    const card1Txt = '• Arrivée sur site 1h30 avant\n• Montage & tests rigoureux\n• Animateur dédié sur place\n• Partage vidéo instantané';
    doc.text(card1Txt, margin + 5, cardY + 18);

    // Card 2
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(217, 155, 38);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + cardW + 8, cardY, cardW, 40, 2, 2, 'FD');

    doc.setTextColor(190, 130, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('ZONE DAKAR & ENVIRONS', margin + cardW + 8 + cardW / 2, cardY + 10, { align: 'center' });

    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    const card2Txt = '• Almadies, Ngor, Ouakam\n• Plateau, Fann, Point E\n• Maristes, Mermoz, VDN\n• Somone, Saly, Lac Rose';
    doc.text(card2Txt, margin + cardW + 13, cardY + 18);

    // Reservation info box
    doc.setFillColor(26, 26, 26);
    doc.roundedRect(18, 188, pageWidth - 36, 52, 2, 2, 'F');

    doc.setTextColor(245, 190, 60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RÉSERVATION & CONTACT DIRECT', pageWidth / 2, 201, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Réservez directement votre créneau sur notre application web ou contactez-nous :', pageWidth / 2, 209, { align: 'center' });

    doc.setTextColor(37, 211, 102);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('WhatsApp / Téléphone : +221 77 976 20 75', pageWidth / 2, 221, { align: 'center' });

    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('E-mail : rmevent360@gmail.com • Dakar, Sénégal', pageWidth / 2, 230, { align: 'center' });

    // Bottom copyright
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(7.5);
    doc.text('© 2026 RM Events - Tous droits réservés • Page 7 / 7', pageWidth / 2, 276, { align: 'center' });

    // Save and download file
    const fileName = 'Catalogue-RM-Events-2026.pdf';
    doc.save(fileName);

    if (onProgress) onProgress('Téléchargement terminé !');
  } catch (error) {
    console.error('Erreur lors du téléchargement du catalogue PDF:', error);
    throw error;
  }
}

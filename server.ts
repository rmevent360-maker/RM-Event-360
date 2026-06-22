import express, { Request, Response } from 'express';
import path from 'path';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

async function startServer() {
  app.use(express.json());

  // Configuration env
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
  const EMAIL_SENDER = process.env.EMAIL_SENDER || "rmevent360@gmail.com";
  // The account password belongs in env secrets for security
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "";
  const DESTINATION_EMAIL = 'rmevent360@gmail.com';

  const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_SENDER,
      pass: EMAIL_PASSWORD
    }
  });

  // API endpoint for automatic notification mailing
  app.post('/api/valider-evenement', async (req: Request, res: Response) => {
    try {
      const { type, id, client, details, montant } = req.body;

      if (!type || !id || !client || !details) {
        return res.status(400).json({ 
          success: false, 
          message: "Données manquantes (type, id, client ou details requis)." 
        });
      }

      let emailContent = "";

      // 1. Call to Google AI Studio (Gemini) using gemini-3.5-flash
      if (GEMINI_API_KEY) {
        try {
          const promptSystem = `Tu es un assistant de gestion d'événements. Rédige un e-mail de notification de validation de ${type} interne, clair, structuré et professionnel destiné à l'équipe de rmevent360@gmail.com.`;
          const promptUtilisateur = `Voici les détails de la validation :
            - Type de transaction : ${type} (Devis ou Réservation)
            - Référence : ${id}
            - Client : ${client.nom} (${client.email}, ${client.telephone})
            - Détails de la prestation : ${details}
            - Montant total : ${montant ? montant : 'Non spécifié'}
            
            Rédige un e-mail synthétique contenant un récapitulatif clair sous forme de liste à puces.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [{ parts: [{ text: promptUtilisateur }] }],
            config: {
              systemInstruction: promptSystem,
            }
          });

          emailContent = response.text || "";
        } catch (aiError) {
          console.error("Erreur avec l'API Gemini, génération du mail par défaut :", aiError);
          emailContent = genererMailDeSecours(type, id, client, details, montant);
        }
      } else {
        emailContent = genererMailDeSecours(type, id, client, details, montant);
      }

      // 2. Configuration du contenu du mail haut de gamme (style Reçu officiel pour le Client et RM Event)
      const recipients = [DESTINATION_EMAIL];
      if (client.email && client.email.trim() !== "" && client.email.includes('@')) {
        recipients.push(client.email.trim());
      }

      const isQuote = type.toLowerCase() === 'devis';
      const htmlReceipt = genererHtmlRecu(type, id, client, details, montant);

      const mailOptions = {
        from: `"RM Event 360° Dakar" <${EMAIL_SENDER}>`,
        to: recipients.join(', '),
        subject: isQuote 
          ? `📄 DEMANDE DE DEVIS ENREGISTRÉE - Réf: ${id}` 
          : `🎉 REÇU DE CONFIRMATION DE PAIEMENT - Réf: ${id}`,
        text: emailContent, 
        html: htmlReceipt
      };

      // 3. Envoi de l'e-mail avec gestion gracieuse d'erreur
      let emailSent = false;
      let emailErrorDetails = "";

      if (!EMAIL_PASSWORD || EMAIL_PASSWORD === "YOUR_APP_PASSWORD_HERE" || EMAIL_PASSWORD === "R98533540M") {
        const warningMsg = "Configuration SMTP Gmail incomplète. Veuillez renseigner EMAIL_PASSWORD avec un code de mot de passe d'application Google à 16 caractères.";
        console.error(`⚠️ [SMTP] ${warningMsg}`);
        emailErrorDetails = warningMsg;
        printGmailAppPasswordInstructions();
      } else {
        try {
          await transporter.sendMail(mailOptions);
          emailSent = true;
          console.log(`✅ Notification e-mail envoyée avec succès à ${recipients.join(', ')}`);
        } catch (mailError: any) {
          console.error("⚠️ Échec de l'envoi de l'e-mail de notification :");
          console.error(mailError);
          emailErrorDetails = mailError.message || String(mailError);

          if (emailErrorDetails.includes("Application-specific password required") || emailErrorDetails.includes("534-5.7.9")) {
            printGmailAppPasswordInstructions();
          }
        }
      }

      // We return 200 success: true so that the checkout flow completes and generates tickets/pdfs
      // even if SMTP failed, but we include email details so client console or devs can see it.
      return res.status(200).json({
        success: true,
        message: emailSent 
          ? `Notification de ${type} envoyée avec succès.`
          : `Validation enregistrée, mais la notification par e-mail n'a pas pu être envoyée.`,
        emailSent,
        emailErrorDetails: emailSent ? null : emailErrorDetails
      });

    } catch (error) {
      console.error("Erreur lors du traitement de la validation :", error);
      return res.status(500).json({
        success: false,
        message: "Une erreur est survenue lors de la validation."
      });
    }
  });

  function printGmailAppPasswordInstructions() {
    console.error("\n========================== CONFIGURATION SMTP GMAIL REQUISE ==========================");
    console.error("Votre compte Gmail requiert un 'Mot de passe d'application' à 16 caractères pour envoyer des e-mails.");
    console.error("Pour générer un mot de passe d'application Gmail :");
    console.error("1. Rendez-vous sur votre compte Google : https://myaccount.google.com");
    console.error("2. Accédez à la section 'Sécurité' dans le panneau de gauche.");
    console.error("3. Activez la 'Validation en deux étapes' si ce n'est pas déjà fait.");
    console.error("4. Dans la barre de recherche en haut, cherchez 'Mots de passe d'application' (App passwords).");
    console.error("5. Saisissez un nom pour identifier l'application (ex: 'Nodemailer' ou 'RM Events App').");
    console.error("6. Copiez le code de sécurité à 16 caractères généré par Google (s'affiche dans un encadré jaune).");
    console.error("7. Ouvrez l'onglet Secrets de votre projet d'AI Studio, et définissez EMAIL_PASSWORD avec cette valeur.");
    console.error("======================================================================================\n");
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

function genererMailDeSecours(type: string, id: string, client: any, details: string, montant: any) {
  return `Bonjour,

Une nouvelle transaction a été validée sur la plateforme RM Event 360.

--- Récapitulatif ---
Type : ${type}
Référence : ${id}
Montant : ${montant ? montant : 'Non spécifié'}

--- Informations Client ---
Nom : ${client.nom}
E-mail : ${client.email}
Téléphone : ${client.telephone}

--- Détails de l'événement ---
${details}

Merci pour votre confiance.
RM Event Photobooth 360° Dakar`;
}

function extraireMontants(montantStr: string) {
  if (!montantStr) {
    return { total: "À définir", acompte: "À définir", restants: "À définir" };
  }
  
  // Ex: "130.000 F CFA (Acompte payé: 40.000 F CFA)"
  const totalMatch = montantStr.match(/^([\d.,\s\w]+F?\s*CFA)/i) || montantStr.match(/^([\d.,\s\w]+)/);
  const total = totalMatch ? totalMatch[1].trim() : montantStr;
  
  const acompteMatch = montantStr.match(/Acompte payé:\s*([\d.,\s\w]+F?\s*CFA)/i) || montantStr.match(/Acompte payé:\s*([\d.,\s\w]+)/i);
  const acompte = acompteMatch ? acompteMatch[1].trim() : "Non précisé";
  
  let soldeStr = "À définir";
  try {
    const totalNum = parseInt(total.replace(/[^\d]/g, ''), 10);
    const acompteNum = parseInt(acompte.replace(/[^\d]/g, ''), 10);
    if (!isNaN(totalNum) && !isNaN(acompteNum)) {
      soldeStr = (totalNum - acompteNum).toLocaleString() + " F CFA";
    }
  } catch (e) {
    // ignore
  }

  return { total, acompte, restants: soldeStr };
}

function genererHtmlRecu(type: string, id: string, client: any, details: string, montant: any) {
  const isQuote = type.toLowerCase() === 'devis' || !montant;
  const montants = extraireMontants(montant || "");
  
  // Parse elements
  const rows = [];
  const lines = details.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      rows.push({ label: parts[0].trim(), value: parts.slice(1).join(':').trim() });
    } else {
      rows.push({ label: "", value: trimmed });
    }
  }

  const badgeColor = isQuote ? '#4b5563' : '#D4AF37';
  const badgeText = isQuote ? 'DEMANDE DE DEVIS EXTRA-VIP REÇUE' : 'RÉSERVATION VALIDÉE - REÇU DE PAIEMENT';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reçu - RM Event 360</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background-color: #0d0d0d;
        color: #e5e7eb;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .wrapper {
        background-color: #0d0d0d;
        padding: 30px 15px;
        text-align: center;
      }
      .container {
        max-width: 520px;
        margin: 0 auto;
        background-color: #161616;
        border: 2px solid #D4AF37;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.2);
        text-align: left;
      }
      .border-accent {
        height: 6px;
        background: linear-gradient(90deg, #D4AF37 0%, #aa841e 100%);
      }
      .header {
        padding: 25px;
        text-align: center;
        background-color: #1a1a1a;
        border-bottom: 1px solid #232323;
      }
      .brand-title {
        color: #D4AF37;
        font-size: 22px;
        font-weight: 800;
        letter-spacing: 2.5px;
        margin: 8px 0 2px 0;
        text-transform: uppercase;
      }
      .brand-subtitle {
        color: #9ca3af;
        font-size: 11px;
        letter-spacing: 4px;
        text-transform: uppercase;
        margin: 0;
      }
      .badge-status {
        display: inline-block;
        background-color: ${badgeColor};
        color: #ffffff;
        font-size: 11px;
        font-weight: bold;
        letter-spacing: 1.5px;
        padding: 8px 18px;
        border-radius: 30px;
        margin-top: 15px;
        text-align: center;
        text-transform: uppercase;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      }
      .content {
        padding: 25px;
      }
      .receipt-card {
        background-color: #1f1f1f;
        border: 1px dashed #3a3a3a;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 20px;
      }
      .section-title {
        font-size: 12px;
        font-weight: bold;
        color: #D4AF37;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-top: 0;
        margin-bottom: 12px;
        border-bottom: 1px solid #333333;
        padding-bottom: 6px;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 8px;
        line-height: 1.4;
      }
      .info-row:last-child {
        margin-bottom: 0;
      }
      .info-label {
        color: #9cb3af;
        font-weight: 500;
        width: 45%;
        text-align: left;
      }
      .info-value {
        color: #ffffff;
        font-weight: bold;
        width: 55%;
        text-align: right;
      }
      .financial-grid {
        background-color: #181c18;
        border: 1px solid #233e21;
        border-radius: 8px;
        padding: 12px;
        margin-top: 10px;
      }
      .financial-row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        margin-bottom: 6px;
      }
      .financial-row:last-child {
        margin-bottom: 0;
      }
      .financial-label {
        color: #9ca3af;
      }
      .financial-value {
        color: #ffffff;
        font-weight: bold;
      }
      .total-highlight {
        font-size: 15px;
        color: #D4AF37 !important;
      }
      .footer-note {
        text-align: center;
        padding: 20px;
        background-color: #121212;
        border-top: 1px solid #1f1f1f;
        font-size: 11px;
        color: #888888;
        line-height: 1.6;
      }
      .support-link {
        color: #D4AF37;
        text-decoration: none;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="border-accent"></div>
        
        <div class="header">
          <div style="margin: 0 auto; width: 44px; height: 44px; background: #000; border: 2px solid #D4AF37; border-radius: 50%; padding: 4px; display: inline-block;">
            <span style="color: #D4AF37; font-size: 15px; font-weight: bold; line-height: 36px; display: block; letter-spacing: 1px;">RM</span>
          </div>
          <h1 class="brand-title">RM Event 360°</h1>
          <p class="brand-subtitle">Photobooth de Prestige • Dakar</p>
          <div class="badge-status">${badgeText}</div>
        </div>

        <div class="content">
          <p style="font-size: 13px; color: #9ca3af; margin-top: 0; margin-bottom: 20px; line-height: 1.5; text-align: center;">
            Merci pour votre commande. Cet e-mail est une archive officielle faisant foi de recu pour votre prestation RM Event.
          </p>

          <div class="receipt-card">
            <h2 class="section-title">Informations Reçu / Archivage</h2>
            <div class="info-row">
              <span class="info-label">Référence Prestation :</span>
              <span class="info-value" style="color: #D4AF37; font-family: monospace; font-size: 14px;">${id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date d'Émission :</span>
              <span class="info-value">${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })} (Dakar GMT)</span>
            </div>
            <div class="info-row">
              <span class="info-label">Statut Document :</span>
              <span class="info-value">${isQuote ? 'Devis Sans Engagement' : 'Reçu Contractuel'}</span>
            </div>
          </div>

          <div class="receipt-card">
            <h2 class="section-title">Client Bénéficiaire</h2>
            <div class="info-row">
              <span class="info-label">Nom complet :</span>
              <span class="info-value">${client.nom}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Adresse Email :</span>
              <span class="info-value" style="color: #D4AF37;">${client.email}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Numéro Téléphone :</span>
              <span class="info-value">${client.telephone}</span>
            </div>
          </div>

          <div class="receipt-card">
            <h2 class="section-title">Prestation Choisie & Options</h2>
            ${rows.map(row => {
              if (row.label) {
                return `
                  <div class="info-row">
                    <span class="info-label">${row.label} :</span>
                    <span class="info-value">${row.value}</span>
                  </div>
                `;
              } else {
                return `
                  <div style="font-size: 12px; color: #9ca3af; padding: 4px 0; border-top: 1px dashed #333333; margin-top: 6px;">
                    ${row.value}
                  </div>
                `;
              }
            }).join('')}
          </div>

          ${!isQuote ? `
            <div class="receipt-card">
              <h2 class="section-title">Bilan des Règlements</h2>
              <div class="financial-grid">
                <div class="financial-row">
                  <span class="financial-label">Montant Total Prestation :</span>
                  <span class="financial-value">${montants.total}</span>
                </div>
                <div class="financial-row">
                  <span class="financial-label" style="color: #10B981;">Acompte d'Engagement Payé :</span>
                  <span class="financial-value" style="color: #10B981;">${montants.acompte}</span>
                </div>
                <div class="financial-row" style="border-top: 1px dashed #233e21; margin-top: 6px; padding-top: 6px;">
                  <span class="financial-label">Solde Restant à Régler :</span>
                  <span class="financial-value total-highlight">${montants.restants}</span>
                </div>
              </div>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 25px; margin-bottom: 5px;">
            <div style="font-family: 'Courier New', monospace; font-size: 13px; letter-spacing: 5px; color: #4b5563;">
              * VALIDE-RM360-${id.replace(/[^\d\w]/g, '').slice(-6).toUpperCase()} *
            </div>
          </div>
        </div>

        <div class="footer-note">
          Ce message s'affiche de manière interactive comme un reçu officiel de paiement.<br>
          Pour toute assistance complémentaire, l'équipe RM Event est disponible par WhatsApp ou Appel au <a href="tel:+221773003030" class="support-link">+221 77 300 30 30</a>.
          <br><br>
          © 2026 RM Event. Tous droits réservés. Dakar, Sénégal.
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

startServer();

export default app;

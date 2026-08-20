const fs = require('fs');

const content = `import logoImg from '../assets/images/logo.png';
import photoboothImg from '../assets/images/photobooth.png';
import reflexeImg from '../assets/images/reflexe.png';
import lyreImg from '../assets/images/lyre.png';
import projecteurImg from '../assets/images/projecteur.png';
import poteletsImg from '../assets/images/potelets.png';

export interface CatalogProduct {
  pageNumber: number;
  category: string;
  title: string;
  imageLabel: string;
  image: string;
  description: string;
  pointsForts: string[];
  idealPour: string;
  contactWhatsApp: string;
}

export const CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    pageNumber: 2,
    category: 'ANIMATION & DIVERTISSEMENT',
    title: 'Photobooth 360°',
    imageLabel: 'Photobooth 360',
    image: photoboothImg,
    description: "L'animation star incontournable pour capturer des vidéos immersives en haute définition avec effets de slow-motion et d'accéléré dynamiques, prêtes à être partagées instantanément.",
    pointsForts: [
      'Plateforme rotative automatique avec éclairage LED dynamique.',
      'Bras rotatif ajustable avec Ring Light et support smartphone/caméra.',
      'Livré avec son flight case professionnel sur roulettes.'
    ],
    idealPour: "Mariages, soirées de gala, événements d'entreprise, salons et soirées VIP.",
    contactWhatsApp: '+221 77 976 20 75',
  },
  {
    pageNumber: 3,
    category: 'ANIMATION & DIVERTISSEMENT',
    title: 'Jeu de Réflexe (Catching Stick Game)',
    imageLabel: 'Jeu de Reflexe',
    image: reflexeImg,
    description: "Borne d'animation interactive testant la rapidité et la concentration des participants qui doivent attraper des bâtons tombant de manière aléatoire. Une attraction ludique et très captivante.",
    pointsForts: [
      'Structure moderne au design incurvé ergonomique.',
      'Compteur de score digital et effets sonores immersifs intégrés.',
      'Niveaux de vitesse et de difficulté entièrement configurables.'
    ],
    idealPour: "Team building, stands d'exposition, centres commerciaux et espaces de jeux.",
    contactWhatsApp: '+221 77 976 20 75',
  },
  {
    pageNumber: 4,
    category: 'ÉCLAIRAGE & AMBIANCE',
    title: 'Lyre de Scène (Moving Head Beam)',
    imageLabel: 'Lyre de Scène',
    image: lyreImg,
    description: "Projetez des faisceaux lumineux puissants, des couleurs vibrantes et des effets de gobos dynamiques. Transforme instantanément chaque piste de danse ou scène en un lieu d'exception.",
    pointsForts: [
      'Faisceau lumineux haute intensité à balayage ultra-rapide.',
      "Anneau LED circulaire multicolore (Aura LED effect) sur l'optique.",
      'Contrôle DMX professionnel, mode automatique ou détection musicale.'
    ],
    idealPour: 'Concerts, pistes de danse, spectacles, défilés de mode et réceptions de mariage.',
    contactWhatsApp: '+221 77 976 20 75',
  },
  {
    pageNumber: 5,
    category: 'ÉCLAIRAGE & ACCUEIL',
    title: 'Projecteurs LED',
    imageLabel: 'Projecteur LED',
    image: projecteurImg,
    description: "Panneau LED professionnel assurant un éclairage doux, homogène et réglable pour vos espaces d'accueil, plateaux de tournage, zones de prise de vue ou stands.",
    pointsForts: [
      "Variateur d'intensité et de température de couleur (chaud/froid).",
      'Trépied télescopique réglable en hauteur, stable et résistant.',
      'Diffuseur dépoli intégré pour un rendu doux sans éblouissement.'
    ],
    idealPour: 'Corners photo, interviews vidéo, éclairage d’exposition et scènes VIP.',
    contactWhatsApp: '+221 77 976 20 75',
  },
  {
    pageNumber: 6,
    category: 'ACCUEIL & ÉLÉGANCE',
    title: 'Barres de Bienvenue / Potelets VIP',
    imageLabel: 'Potelets VIP',
    image: poteletsImg,
    description: "Apportez une touche de prestige et un esprit \"Tapis Rouge VIP\" dès l'entrée de vos événements. Potelets de guidage en finition dorée miroir accompagnés de cordons en velours.",
    pointsForts: [
      "Acier inoxydable avec placage doré haute brillance luxueux.",
      "Cordon épais en velours rouge avec crochets de fixation dorés.",
      "Parfait pour guider les invités et délimiter les accès VIP."
    ],
    idealPour: 'Entrées VIP, cérémonies, remises de prix, galas et événements de marque.',
    contactWhatsApp: '+221 77 976 20 75',
  }
];

export const CATALOG_META = {
  title: 'CATALOGUE MATÉRIEL',
  subtitle: "SOLUTIONS ÉVÉNEMENTIELLES & D'ANIMATION PREMIUM",
  tagline: "Location de Matériel d'Éclairage & Animation VIP",
  brand: 'RM Events',
  phone: '+221 77 976 20 75',
  whatsappUrl: 'https://wa.me/221779762075',
  logo: logoImg,
  totalSpreads: 7, // Cover(1), 5 Products(5), Back Cover(1)
};
`;

fs.writeFileSync('src/data/catalog.ts', content);

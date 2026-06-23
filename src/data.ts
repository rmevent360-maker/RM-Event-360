/**
 * data.ts
 * Static configuration, pricing matrices, and initial mock database seeds.
 */
import { Booking, PromoCode, PartnerAccount, PartnerActivity, PayoutRequest } from './types';

// Price configuration according to specification:
// 1 Hour: 50,000 FCFA
// 2 Hours: 90,000 FCFA
// 3 Hours: 130,000 FCFA
// 4 Hours: 150,000 FCFA
export const BASE_PRICES: Record<number, number> = {
  1: 50000,
  2: 90000,
  3: 130000,
  4: 150000,
};

// Rates / Extra per hours if exceeding 4
export const ADDITIONAL_HOUR_RATE = 35000;

export interface PackageDetail {
  id: 'standard' | 'bronze' | 'argent' | 'prestige';
  name: string;
  price: string;
  recommendedDuration: number;
  description: string;
  features: string[];
}

export const PACKAGES: PackageDetail[] = [
  {
    id: 'standard',
    name: 'Pack Standard',
    price: '50.000 FCFA (1 H)',
    recommendedDuration: 1,
    description: 'Structure agile parfaite pour les petits événements privés et anniversaires intimes.',
    features: [
      'Plateforme 360° Standard (80cm, 1-2 personnes)',
      'Caméra HD avec stabilisateur',
      'Partage de fichiers vidéo ultra-rapide par QR Code',
      'Galerie web de l\'événement (active 7 jours)',
      '1 Hôte d\'exploitation souriant et professionnel',
      'Effets ralentis et accélérés standard (Slow-Motion)'
    ]
  },
  {
    id: 'bronze',
    name: 'Pack Bronze',
    price: '90.000 FCFA (2 H)',
    recommendedDuration: 2,
    description: 'Idéal pour les baptêmes, fiançailles et réceptions conviviales nécessitant plus de temps.',
    features: [
      'Plateforme 360° Medium (100cm, 2-3 personnes)',
      'Durée de prestation : 2 H incluses',
      'Éclairage LED circulaire (Ring Light pro)',
      'Overlay personnalisé de base (Texte : Noms & Date)',
      'Partage par SMS, QR Code and AirDrop à Dakar',
      '1 Technicien RM dédié sur place',
      'Galerie web active pendant 30 jours'
    ]
  },
  {
    id: 'argent',
    name: 'Pack Argent (Best-Seller)',
    price: '130.000 FCFA (3 H)',
    recommendedDuration: 3,
    description: 'La référence RM Events la plus plébiscitée pour les mariages dakarois et événements d\'entreprise.',
    features: [
      'Plateforme 360° XL Premium (115cm, jusqu\'à 4 personnes)',
      'Durée de prestation : 3 H incluses',
      'Tapis Rouge d\'accueil VIP et barrières dorées de sécurité',
      'Pack de déguisements fun (chapeaux de gala, lunettes XXL, pistolet à billets, bulles)',
      'Filtre de traitement vidéo d\'effet cinématique',
      'Overlay personnalisé premium avec intégration de logo / thématique',
      '2 Hôtes RM habillés pour l\'assistance et l\'animation',
      'Galerie web privée sécurisée pendant 6 mois'
    ]
  },
  {
    id: 'prestige',
    name: 'Pack Prestige VIP',
    price: '150.000 FCFA (4 H)',
    recommendedDuration: 4,
    description: 'Conçu pour le corporate de haut rang, les soirées de gala VIP ou les mariages haut de gamme originaux.',
    features: [
      'Plateforme 360° XXL Star (120cm, 4-5 personnes simultanées)',
      'Durée de prestation : 4 H incluses',
      'Espace VIP complet avec tapis rouge luxueux et projecteurs LED d\'ambiance',
      'Overlay vidéo sur-mesure de niveau publicitaire (animations 3D, musique)',
      'Machine à fumée d\'ambiance ou canon à bulles automatique',
      'Clé USB souvenir remise à la fin avec toutes les captures HD',
      'Hôtesses RM VIP dédiées à la gestion des invités',
      'Galerie web sécurisée à vie + Accès prioritaire au téléchargement'
    ]
  }
];

export const EXTRA_OPTIONS = [
  {
    id: 'customOverlay',
    name: 'Cadre vidéo personnalisé',
    description: 'Incrustation de logo d\'entreprise, bordures de marque ou bande-son thématique.',
    price: 25000,
  },
  {
    id: 'redCarpet',
    name: 'Tapis Rouge et Barrière VIP',
    description: 'Installation d\'un véritable tapis de gala avec cordons de velours de prestige.',
    price: 30000,
  },
  {
    id: 'usbMedia',
    name: 'Clé USB',
    description: 'Remise directe de tous les rushs originaux bruts et vidéos finales de la soirée.',
    price: 10000,
  },
  {
    id: 'ledLighting',
    name: 'Éclairage LED supplémentaire',
    description: 'Projecteurs LED d\'ambiance et éclairages pros additionnels pour illuminer l\'espace.',
    price: 30000,
  }
];

// Seed Data for initial application state!
export const INITIAL_PROMO_CODES: PromoCode[] = [
  {
    code: 'WEDDING2026',
    prescripteurId: 'presc_1',
    prescripteurName: 'Fatou Diarra (Wedding Planner)',
    role: 'wedding_planner',
    discountPercent: 5, // Client gets 5% off
    commissionPercent: 10, // Prescriber gets 10% commission
    active: true,
  },
  {
    code: 'DAKAR360',
    prescripteurId: 'presc_2',
    prescripteurName: 'Amadou Sy (Traiteur Haut de Gamme)',
    role: 'traiteur',
    discountPercent: 10,
    commissionPercent: 5,
    active: true,
  },
  {
    code: 'GALA_STUDI',
    prescripteurId: 'presc_3',
    prescripteurName: 'Khadija BEYE (BDE Université Dakar)',
    role: 'autre',
    discountPercent: 8,
    commissionPercent: 7,
    active: true,
  }
];

export const INITIAL_PARTNERS: PartnerAccount[] = [
  {
    id: 'part_1',
    name: 'Canal Olympia Dakar',
    type: 'cinema',
    location: 'Dakar Fann, Sénégal',
    logoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&h=80&fit=crop',
    revenueSharePercent: 30, // 30% of visitors tickets shared with Cinema
    totalEarnings: 685000,
    withdrawnAmount: 450000,
  },
  {
    id: 'part_2',
    name: 'Sea Plaza Shopping Mall',
    type: 'mall',
    location: 'Corniche Ouest, Dakar',
    logoUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=80&h=80&fit=crop',
    revenueSharePercent: 25,
    totalEarnings: 1240000,
    withdrawnAmount: 900000,
  },
  {
    id: 'part_3',
    name: 'Radisson Blu Hotel',
    type: 'hotel',
    location: 'Corniche Ouest, Dakar',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=80&h=80&fit=crop',
    revenueSharePercent: 20,
    totalEarnings: 450000,
    withdrawnAmount: 300000,
  }
];

export const INITIAL_PARTNER_ACTIVITIES: PartnerActivity[] = [
  // Canal Olympia March 2026
  {
    id: 'act_1',
    partnerId: 'part_1',
    partnerName: 'Canal Olympia Dakar',
    location: 'Dakar Fann',
    month: 'Mars 2026',
    visitorCount: 12400,
    boothSessions: 850,
    ticketPrice: 1500, // session ticket
    totalRevenue: 1275000, // 850 * 1500
    revenueSharePercent: 30,
    partnerEarnings: 382500, // 1275000 * 0.3
    status: 'paye'
  },
  // Canal Olympia April 2026
  {
    id: 'act_2',
    partnerId: 'part_1',
    partnerName: 'Canal Olympia Dakar',
    location: 'Dakar Fann',
    month: 'Avril 2026',
    visitorCount: 15100,
    boothSessions: 1010,
    ticketPrice: 1500,
    totalRevenue: 1515000,
    revenueSharePercent: 30,
    partnerEarnings: 454500,
    status: 'paye'
  },
  // Canal Olympia May 2026 (En attente)
  {
    id: 'act_3',
    partnerId: 'part_1',
    partnerName: 'Canal Olympia Dakar',
    location: 'Dakar Fann',
    month: 'Mai 2026',
    visitorCount: 18200,
    boothSessions: 1200,
    ticketPrice: 1500,
    totalRevenue: 1800000,
    revenueSharePercent: 30,
    partnerEarnings: 540000,
    status: 'valide'
  },
  // Sea Plaza March 2026
  {
    id: 'act_4',
    partnerId: 'part_2',
    partnerName: 'Sea Plaza Shopping Mall',
    location: 'Corniche Ouest',
    month: 'Mars 2026',
    visitorCount: 45000,
    boothSessions: 2200,
    ticketPrice: 2000,
    totalRevenue: 4400000,
    revenueSharePercent: 25,
    partnerEarnings: 1100000,
    status: 'paye'
  },
  // Sea Plaza April 2026
  {
    id: 'act_5',
    partnerId: 'part_2',
    partnerName: 'Sea Plaza Shopping Mall',
    location: 'Corniche Ouest',
    month: 'Avril 2026',
    visitorCount: 52000,
    boothSessions: 2560,
    ticketPrice: 2000,
    totalRevenue: 5120000,
    revenueSharePercent: 25,
    partnerEarnings: 1280000,
    status: 'valide'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'RM-2026-9811',
    clientName: 'Sokhna Diagne',
    clientEmail: 'sokhna.diagne@gmail.com',
    clientPhone: '+221 77 564 89 22',
    date: '2026-07-12',
    timeSlot: '16:00 - 19:00',
    duration: 3,
    packageType: 'argent',
    options: {
      customOverlay: true,
      redCarpet: true,
      usbMedia: false
    },
    totalPrice: 170000, // 130000 + 15000 + 25000
    promoCodeUsed: 'WEDDING2026',
    discountApplied: 8500, // 5% of 170000
    paymentStatus: 'deposit_only',
    amountPaid: 85000, // 50% deposit paid
    paymentMethod: 'wave',
    status: 'confirmed',
    createdAt: '2026-06-15T10:30:00Z',
    prescripteurId: 'presc_1'
  },
  {
    id: 'RM-2026-9812',
    clientName: 'Société Orange Sénégal (HQ)',
    clientEmail: 'marketing@orange.sn',
    clientPhone: '+221 33 889 00 00',
    date: '2026-07-28',
    timeSlot: '19:00 - 23:00',
    duration: 4,
    packageType: 'prestige',
    options: {
      customOverlay: true,
      redCarpet: true,
      usbMedia: true
    },
    totalPrice: 200000, // 150000 + 15000 (overlay in list has price index but package standard has some. wait, let's look: 150000 base + 15k overlay + 25k carpet + 10k usb = 200000)
    promoCodeUsed: 'DAKAR360',
    discountApplied: 20000, // 10%
    paymentStatus: 'total',
    amountPaid: 180000, // full payment with discount
    paymentMethod: 'orange_money',
    status: 'confirmed',
    createdAt: '2026-06-16T15:45:00Z',
    prescripteurId: 'presc_2'
  },
  {
    id: 'RM-2026-9813',
    clientName: 'BDE ISMP Dakar',
    clientEmail: 'bde@ismp.edu.sn',
    clientPhone: '+221 70 821 33 45',
    date: '2026-06-30',
    timeSlot: '14:00 - 16:00',
    duration: 2,
    packageType: 'bronze',
    options: {
      customOverlay: false,
      redCarpet: false,
      usbMedia: true
    },
    totalPrice: 100000, // 90000 + 10000
    promoCodeUsed: 'GALA_STUDI',
    discountApplied: 8000, // 8% of 100000
    paymentStatus: 'pending',
    amountPaid: 0,
    status: 'pending',
    createdAt: '2026-06-17T11:20:00Z',
    prescripteurId: 'presc_3'
  }
];

export const INITIAL_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'PAY-101',
    targetId: 'part_1',
    targetName: 'Canal Olympia Dakar',
    type: 'partner',
    amount: 150000,
    method: 'orange_money',
    phone: '+221 77 121 21 21',
    status: 'approved',
    date: '2026-05-10',
  },
  {
    id: 'PAY-102',
    targetId: 'presc_1',
    targetName: 'Fatou Diarra (Wedding Planner)',
    type: 'prescripteur',
    amount: 50000,
    method: 'wave',
    phone: '+221 77 345 56 67',
    status: 'pending',
    date: '2026-06-17',
  }
];

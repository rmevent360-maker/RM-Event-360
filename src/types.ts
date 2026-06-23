/**
 * types.ts
 * Type definitions for RM Events platform 360° Photobooth
 */

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  timeSlot: string; // e.g. "15:00 - 17:00"
  duration: number; // 1, 2, 3, 4 hours
  packageType: 'standard' | 'bronze' | 'argent' | 'prestige';
  options: {
    customOverlay: boolean;
    redCarpet: boolean;
    usbMedia: boolean;
    ledLighting?: boolean;
  };
  totalPrice: number;
  promoCodeUsed?: string;
  discountApplied: number; // Amount in FCFA
  paymentStatus: 'total' | 'deposit_only' | 'pending';
  amountPaid: number; // Amount paid so far in FCFA
  paymentMethod?: 'wave' | 'orange_money';
  status: 'pending' | 'confirmed' | 'completed';
  createdAt: string;
  prescripteurId?: string;
}

export interface PromoCode {
  code: string;
  prescripteurId: string;
  prescripteurName: string;
  role: 'wedding_planner' | 'traiteur' | 'photographe' | 'influenceur' | 'autre';
  discountPercent: number; // client gets this discount (e.g. 5%)
  commissionPercent: number; // prescriber gets this cash back (e.g. 10%)
  active: boolean;
}

export interface PartnerActivity {
  id: string;
  partnerId: string;
  partnerName: string;
  location: string;
  month: string;
  visitorCount: number;
  boothSessions: number;
  ticketPrice: number; // e.g. 1500 FCFA per session
  totalRevenue: number;
  revenueSharePercent: number; // e.g. 30% for Mall, 70% RM Events
  partnerEarnings: number;
  status: 'valide' | 'en_attente' | 'paye';
}

export interface PartnerAccount {
  id: string;
  name: string;
  type: 'cinema' | 'mall' | 'boutique' | 'hotel';
  location: string;
  logoUrl?: string;
  revenueSharePercent: number;
  totalEarnings: number;
  withdrawnAmount: number;
}

export interface PayoutRequest {
  id: string;
  targetId: string; // Partner id or prescripteur id
  targetName: string;
  type: 'partner' | 'prescripteur';
  amount: number;
  method: 'wave' | 'orange_money';
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

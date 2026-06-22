import React, { useState } from 'react';
import { KeyRound, TrendingUp, HandCoins, Award, PlusCircle, CheckSquare, Search, Wallet, FileText, Smartphone, Send, ListCollapse } from 'lucide-react';
import { PromoCode, Booking, PartnerAccount, PartnerActivity, PayoutRequest } from '../types';

interface PartnerDashboardProps {
  bookings: Booking[];
  promoCodes: PromoCode[];
  onAddPromoCode: (newCode: PromoCode) => void;
  partners: PartnerAccount[];
  partnerActivities: PartnerActivity[];
  payoutRequests: PayoutRequest[];
  onAddPayoutRequest: (newRequest: PayoutRequest) => void;
}

export default function PartnerDashboard({
  bookings,
  promoCodes,
  onAddPromoCode,
  partners,
  partnerActivities,
  payoutRequests,
  onAddPayoutRequest,
}: PartnerDashboardProps) {
  
  // Login flow state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'partner' | 'prescripteur'>('partner');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('part_1');
  const [loginError, setLoginError] = useState<string>('');

  // Registering a newly created prescriber promo code state
  const [newPromoCode, setNewPromoCode] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'wedding_planner' | 'traiteur' | 'photographe' | 'influenceur' | 'autre'>('wedding_planner');
  const [newDiscount, setNewDiscount] = useState<number>(5);
  const [newCommission, setNewCommission] = useState<number>(10);
  const [promoRegSuccess, setPromoRegSuccess] = useState('');

  // Payout submission state
  const [payoutAmount, setPayoutAmount] = useState<number>(50000);
  const [payoutMethod, setPayoutMethod] = useState<'wave' | 'orange_money'>('wave');
  const [payoutPhone, setPayoutPhone] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');

  // Filter state
  const [bookingSearch, setBookingSearch] = useState('');

  // Handle Demo login pre-fill
  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticated(true);
  };

  // Find active accounts based on user selection
  const activePartner = partners.find((p) => p.id === selectedAccountId);
  // Filter activities corresponding to active partner
  const activePartnerActivities = partnerActivities.filter((act) => act.partnerId === selectedAccountId);

  // Fetch relevant promo code if logging in as prescripteur (Fatou Diarra is presc_1 with code WEDDING2026)
  const isFatou = selectedAccountId === 'presc_1';
  const representativeCodeStr = isFatou ? 'WEDDING2026' : (promoCodes.find(p => p.prescripteurId === selectedAccountId)?.code || '');
  const representativeCode = promoCodes.find(c => c.code === representativeCodeStr);

  // Calculate live statistics from bookings matching promoCode/prescripteur
  const trackedBookings = bookings.filter((b) => {
    if (userRole === 'partner') {
      return false; // Partners track via ticket sales at cinema, not referral promo codes
    } else {
      return b.promoCodeUsed === representativeCodeStr;
    }
  });

  const accruedCommissions = trackedBookings.reduce((sum, b) => {
    const rate = representativeCode?.commissionPercent || 10;
    const comm = Math.round(b.totalPrice * (rate / 100));
    return sum + comm;
  }, 0);

  // Handle Registering a custom promo code
  const handleRegisterPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoRegSuccess('');

    if (!newPromoCode || !newName) {
      alert('Veuillez remplir le code promo et votre nom.');
      return;
    }

    const codeToRegister = newPromoCode.trim().toUpperCase();
    
    // Check duplication
    if (promoCodes.some(p => p.code === codeToRegister)) {
      alert('Ce code promo existe déjà. Veuillez en choisir un autre.');
      return;
    }

    const newCodeObject: PromoCode = {
      code: codeToRegister,
      prescripteurId: `presc_custom_${Date.now()}`,
      prescripteurName: newName,
      role: newRole,
      discountPercent: Number(newDiscount),
      commissionPercent: Number(newCommission),
      active: true,
    };

    onAddPromoCode(newCodeObject);
    setPromoRegSuccess(`Code promo "${codeToRegister}" enregistré ! Testez-le dans l'onglet réservation.`);
    setNewPromoCode('');
  };

  // Submit withdrawal request (payout)
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSuccess('');

    if (!payoutPhone) {
      alert('Veuillez renseigner votre numéro.');
      return;
    }

    // Determine target name
    const targetName = userRole === 'partner' ? (activePartner?.name || '') : 'Fatou Diarra (Wedding Planner)';
    const maxAvailable = userRole === 'partner' 
      ? ((activePartner?.totalEarnings || 0) - (activePartner?.withdrawnAmount || 0))
      : 85000; // Simulated wallet balance for standard demo

    if (payoutAmount <= 0) {
      alert('Montant invalide.');
      return;
    }

    if (payoutAmount > maxAvailable) {
      alert('Le montant demandé dépasse votre solde disponible.');
      return;
    }

    const newRequest: PayoutRequest = {
      id: `PAY-${Math.floor(100 + Math.random() * 900)}`,
      targetId: selectedAccountId,
      targetName,
      type: userRole,
      amount: payoutAmount,
      method: payoutMethod,
      phone: payoutPhone,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };

    onAddPayoutRequest(newRequest);
    setPayoutSuccess(`Demande de versement de ${payoutAmount.toLocaleString()} FCFA soumise avec succès !`);
  };

  return (
    <div className="space-y-8 text-gray-800">
      
      {/* Title */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="font-display text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <span>Espace Professionnels</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Gérez vos parrainages d'événements à Dakar et suivez vos gains de partage de revenus.
        </p>
      </div>

      {!isAuthenticated ? (
        /* GUEST LOGIN VIEWPORT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Signin component */}
          <div className="lg:col-span-6 bg-white border border-gray-200 rounded-none p-6 sm:p-8 space-y-5 shadow-sm">
            <span className="text-gold-500 text-[10px] font-extrabold uppercase tracking-widest block">Connexion Partenaire</span>
            
            <div>
              <h4 className="font-display font-bold text-gray-900 text-base">Portail Pro</h4>
              <p className="text-xs text-gray-500 mt-1">Sélectionnez un compte test pour découvrir les rapports financiers d'établissement.</p>
            </div>

            <form onSubmit={handleDemoSignIn} className="space-y-4">
              
              {/* Selector role */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Type d'Activité</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUserRole('partner');
                      setSelectedAccountId('part_1');
                    }}
                    className={`py-2 px-3 rounded-none text-xs font-bold uppercase transition ${
                      userRole === 'partner'
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-150 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🏢 Revenue Sharing
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setUserRole('prescripteur');
                      setSelectedAccountId('presc_1');
                    }}
                    className={`py-2 px-3 rounded-none text-xs font-bold uppercase transition ${
                      userRole === 'prescripteur'
                        ? 'bg-gold-500 text-white'
                        : 'bg-gray-150 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👑 Code Parrainage
                  </button>
                </div>
              </div>

              {/* Account Dropdown list autofilled */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-sans">Identité d'Affiliation</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-850 font-bold focus:outline-none"
                >
                  {userRole === 'partner' ? (
                    <>
                      <option value="part_1">Canal Olympia Dakar (Cinéma)</option>
                      <option value="part_2">Sea Plaza Shopping Mall (Centre commercial)</option>
                      <option value="part_3">Radisson Blu Dakar (Hôtel VIP)</option>
                    </>
                  ) : (
                    <>
                      <option value="presc_1">Fatou Diarra (Wedding Planner - WEDDING2026)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Password field simulation */}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Clef de Securité</label>
                <input
                  type="password"
                  value="DEMO_DAKAR_360"
                  readOnly
                  placeholder="DEMO_DAKAR_360"
                  className="w-full bg-gray-50 border border-gray-200 rounded-none px-3 py-2 text-xs text-gray-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-widest transition duration-300 shadow-sm"
              >
                Accéder au Dashboard Test
              </button>

            </form>
          </div>

          {/* PRESCRIPTEUR REGISTRATION FORM - TRACKING COMMERCIAL ON THE FLY */}
          <div className="lg:col-span-6 bg-white border border-gray-200 rounded-none p-6 sm:p-8 space-y-5 shadow-sm">
            <span className="text-gold-500 text-[10px] font-extrabold uppercase tracking-widest block">Nouveau Parrainage</span>
            
            <div>
              <h4 className="font-display font-bold text-gray-900 text-base">Créez votre Code d'Apporteur</h4>
              <p className="text-xs text-gray-500 mt-1">Wedding planners, hôtels et traiteurs : générez un code unique pour gagner des commissions sur chaque événement.</p>
            </div>

            <form onSubmit={handleRegisterPromoCode} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nom / Nom de l'Agence</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Astou Events"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Code Souhaité</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: ASTOU360"
                    maxLength={15}
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs uppercase text-gray-800 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Activité Événementielle</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 font-bold"
                >
                  <option value="wedding_planner">Wedding Planner (Mariages)</option>
                  <option value="traiteur">Traiteur Réception</option>
                  <option value="photographe">Photographe / Caméraman</option>
                  <option value="influenceur">Créateur de Contenu</option>
                  <option value="autre">Autre métier d'événements</option>
                </select>
              </div>

              {/* Ratios distribution */}
              <div className="bg-gray-50 p-4 border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2 text-center">Formule de Partenariat</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">
                      Remise client : {newDiscount}%
                    </label>
                    <select
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value))}
                      className="w-full bg-white text-[10px] text-gray-800 p-1.5 border border-gray-250 rounded-none font-bold"
                    >
                      <option value="5">5% de réduction</option>
                      <option value="8">8% de réduction</option>
                      <option value="10">10% de réduction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] text-gray-500 uppercase font-bold mb-1">
                      Votre Com. : {newCommission}%
                    </label>
                    <select
                      value={newCommission}
                      onChange={(e) => setNewCommission(Number(e.target.value))}
                      className="w-full bg-white text-[10px] text-gray-800 p-1.5 border border-gray-250 rounded-none font-bold"
                    >
                      <option value="5">5% de commission</option>
                      <option value="10">10% de commission</option>
                      <option value="12">12% de commission</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-widest transition shadow-sm"
              >
                Générer mon Code Partenaire
              </button>

              {promoRegSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-none border border-emerald-200 leading-relaxed font-bold">
                  {promoRegSuccess}
                </div>
              )}

            </form>
          </div>

        </div>
      ) : (
        /* LOGGED IN ACCOUNT VIEWPORT */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Identity Box */}
          <div className="bg-white border border-gray-200 rounded-none p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gold-500 text-white flex items-center justify-center text-xl">
                {userRole === 'partner' ? '🏢' : '👑'}
              </div>
              <div>
                <strong className="text-gray-900 text-lg block font-display font-bold">
                  {userRole === 'partner' ? activePartner?.name : 'Fatou Diarra (Wedding Planner)'}
                </strong>
                <span className="text-xs text-gray-500">
                  {userRole === 'partner' ? `Partenariat d'Établissement — Dakar (${activePartner?.location})` : 'Apporteur d\'affaires privilège'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 font-bold">
                ● SESSION DEMO ACTIVE
              </span>

              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setPromoRegSuccess('');
                  setPayoutSuccess('');
                }}
                className="text-xs text-gray-500 hover:text-red-500 underline font-bold"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* KEY FINANCIAL KPI PANEL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1 : Total earnings */}
            <div className="bg-white p-5 rounded-none border border-gray-200 space-y-2 shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider block font-bold">Gains Cumulés</span>
              <strong className="text-2xl font-mono text-gray-950 block">
                {userRole === 'partner' 
                  ? (activePartner?.totalEarnings || 0).toLocaleString()
                  : accruedCommissions.toLocaleString()
                } F
              </strong>
              <div className="text-[10px] text-emerald-600 font-bold">Revenus acquis</div>
            </div>

            {/* KPI 2 : Already withdrawn */}
            <div className="bg-white p-5 rounded-none border border-gray-200 space-y-2 shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider block font-bold font-sans">Réglé</span>
              <strong className="text-2xl font-mono text-gray-400 block">
                {userRole === 'partner' 
                  ? (activePartner?.withdrawnAmount || 0).toLocaleString()
                  : '30.000'
                } F
              </strong>
              <div className="text-[10px] text-gray-550">Retiré via Wave/OM</div>
            </div>

            {/* KPI 3 : Wallet Balance */}
            <div className="bg-white p-5 rounded-none border border-gold-500/30 space-y-2 shadow-sm relative">
              <span className="text-gold-600 text-[10px] uppercase tracking-wider block font-black">Solde Dispo</span>
              <strong className="text-2xl font-mono text-gold-500 block">
                {userRole === 'partner' 
                  ? ((activePartner?.totalEarnings || 0) - (activePartner?.withdrawnAmount || 0)).toLocaleString()
                  : (accruedCommissions - 30000 > 0 ? accruedCommissions - 30000 : 0).toLocaleString()
                } F
              </strong>
              <div className="text-[10px] text-gold-500 font-bold">Transférable vers Wave / OM</div>
            </div>

            {/* KPI 4 : Referral codes statistics */}
            <div className="bg-white p-5 rounded-none border border-gray-200 space-y-2 shadow-sm">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider block font-bold">Partenariat</span>
              <strong className="text-sm font-mono text-gray-900 block uppercase font-bold">
                {userRole === 'partner' 
                  ? `Revenue Share ${activePartner?.revenueSharePercent}%`
                  : representativeCodeStr || 'N/A'
                }
              </strong>
              <div className="text-[10px] text-gray-500">
                {userRole === 'partner' ? 'Attribution locale' : `Remise ${representativeCode?.discountPercent || 5}% / Commission ${representativeCode?.commissionPercent || 10}%`}
              </div>
            </div>

          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Ledger / History table */}
            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-none p-5 sm:p-6 space-y-5 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h5 className="font-display font-bold text-gray-950 text-base">
                    {userRole === 'partner' ? 'Rapports de Fréquentation' : 'Clients Parrainés'}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {userRole === 'partner' ? 'Suivi mensuel de la borne d\'exposition' : 'Suivi des réservations utilisant votre code'}
                  </p>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Filtrer client..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="bg-white border border-gray-250 text-gray-800 rounded-none pl-9 pr-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* TABLE: CINEMA / MALL AUDIENCE DATA */}
              {userRole === 'partner' ? (
                <div className="space-y-4">
                  
                  {/* Visual simulated growth chart */}
                  <div className="bg-gray-50 p-4 space-y-4 border border-gray-200">
                    <strong className="text-[10px] uppercase text-gray-500 block font-bold tracking-wider">Sessions de la borne 360°</strong>
                    <div className="flex items-end justify-between h-24 pt-4 px-2">
                      {activePartnerActivities.map((act) => {
                        const heightPct = Math.round((act.boothSessions / 2800) * 100);
                        return (
                          <div key={act.id} className="flex flex-col items-center flex-grow space-y-1">
                            <span className="text-[9px] font-mono font-bold text-gold-500">{act.boothSessions}</span>
                            <div 
                              className="w-6 bg-gold-500 rounded-t-sm transition-all"
                              style={{ height: `${heightPct}%`, minHeight: '12%' }}
                            ></div>
                            <span className="text-[10px] text-gray-500 font-sans">{act.month.split(' ')[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-[9px] uppercase font-bold tracking-wider text-gray-500">
                          <th className="py-2.5">Période</th>
                          <th>Visiteurs</th>
                          <th>Sessions 360°</th>
                          <th>Taux</th>
                          <th>Recette brute</th>
                          <th>Vos Gains</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-sans text-gray-700">
                        {activePartnerActivities.map((act) => (
                          <tr key={act.id} className="hover:bg-gray-50">
                            <td className="py-3 text-gray-900 font-bold">{act.month}</td>
                            <td>{(act.visitorCount).toLocaleString()}</td>
                            <td className="font-mono text-gray-900 font-bold">{act.boothSessions}</td>
                            <td>{((act.boothSessions / act.visitorCount) * 100).toFixed(1)} %</td>
                            <td className="font-mono">{(act.totalRevenue).toLocaleString()} F</td>
                            <td className="font-mono text-gold-600 font-bold">{(act.partnerEarnings).toLocaleString()} F</td>
                            <td>
                              <span className={`px-2 py-0.5 rounded-none text-[8px] font-bold uppercase ${
                                act.status === 'paye' ? 'bg-emerald-100 text-emerald-850' : 'bg-amber-100 text-amber-850'
                              }`}>
                                {act.status === 'paye' ? 'Transféré' : 'En calcul'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              ) : (
                /* TABLE: APPORTEUR CODE REFERRALS */
                <div className="overflow-x-auto">
                  {trackedBookings.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <p className="text-xs text-gray-500">Aucun événement n'a encore utilisé votre code.</p>
                      <span className="text-[11px] text-gold-500 block">Astuce : Utilisez <strong>WEDDING2026</strong> lors d'une commande test.</span>
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs text-gray-600 border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-[9px] uppercase font-bold tracking-wider text-gray-500">
                          <th className="py-2.5">Référence</th>
                          <th>Nom du Client</th>
                          <th>Date Event</th>
                          <th>Durée</th>
                          <th>Valeur Brut</th>
                          <th>Votre Com.</th>
                          <th>Statut Comm.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {trackedBookings
                          .filter(b => b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()))
                          .map((b) => {
                            const rate = representativeCode?.commissionPercent || 10;
                            const comm = Math.round(b.totalPrice * (rate / 100));
                            return (
                              <tr key={b.id} className="hover:bg-gray-50">
                                <td className="py-3 font-mono font-bold text-gray-900">{b.id}</td>
                                <td>
                                  <div className="text-gray-900 font-bold">{b.clientName}</div>
                                  <div className="text-[10px] text-gray-500">{b.clientPhone}</div>
                                </td>
                                <td>{b.date}</td>
                                <td>{b.duration}h</td>
                                <td className="font-mono">{(b.totalPrice).toLocaleString()} F</td>
                                <td className="font-mono text-gold-600 font-bold">{(comm).toLocaleString()} F</td>
                                <td>
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-none text-[8px] font-bold uppercase">
                                    En attente d'event
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

            </div>

            {/* Right Withdrawal Console */}
            <div className="lg:col-span-4 bg-white border border-gray-200 rounded-none p-5 sm:p-6 space-y-5 shadow-sm text-gray-800">
              
              <div className="space-y-1">
                <h5 className="font-display font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Retrait Direct
                </h5>
                <p className="text-[11px] text-gray-500">
                  Déclenchez le transfert immédiat de votre solde vers votre compte Wave ou Orange Money.
                </p>
              </div>

              {/* Form payout submission */}
              <form onSubmit={handleRequestPayout} className="space-y-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Montant (FCFA)</label>
                  <input
                    type="number"
                    required
                    min={5000}
                    step={5000}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs font-mono font-bold text-gray-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Opérateur mobile</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('wave')}
                      className={`p-2 rounded-none font-mono font-bold text-[10px] text-center border uppercase transition ${
                        payoutMethod === 'wave'
                          ? 'bg-[#1b85ff] text-white border-[#1b85ff] font-bold'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🌊 Wave SN
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('orange_money')}
                      className={`p-2 rounded-none font-mono font-bold text-[10px] text-center border uppercase transition ${
                        payoutMethod === 'orange_money'
                          ? 'bg-[#ff6600] text-white border-[#ff6600] font-bold'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🍊 OM Sénégal
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Numéro de Téléphone</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 77 123 45 67"
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded-none px-3 py-2 text-xs text-gray-800 font-mono font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-white font-bold text-xs uppercase tracking-widest rounded-none transition"
                >
                  Initier le Transfert
                </button>

                {payoutSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-[11px] rounded-none border border-emerald-200 leading-normal text-center font-bold">
                    {payoutSuccess}
                  </div>
                )}

              </form>

              {/* Running payout requests historical */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Historique des envois</span>
                
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {payoutRequests
                    .filter((p) => p.targetId === selectedAccountId)
                    .map((pay) => (
                      <div key={pay.id} className="flex justify-between items-center text-[10px] bg-gray-55 p-2.5 rounded-none border border-gray-200">
                        <div>
                          <span className="font-bold text-gray-800 block">{pay.amount.toLocaleString()} FCFA</span>
                          <span className="text-[9px] text-gray-500 font-mono block uppercase">
                            {pay.method} • {pay.date}
                          </span>
                        </div>

                        <div>
                          <span className={`px-2 py-0.5 rounded-none text-[8px] font-bold uppercase ${
                            pay.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {pay.status === 'approved' ? 'Payé' : 'En examen'}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

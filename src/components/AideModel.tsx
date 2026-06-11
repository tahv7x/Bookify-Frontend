import React, { useState, useEffect } from 'react';
import {
  X, Search, CalendarCheck, UserCheck, CheckCircle2,
  ChevronRight, ChevronLeft, Star, Clock, MapPin,
  Bell, BookOpen, Briefcase, Calendar, CheckSquare, Activity, CreditCard, Mail, Phone
} from 'lucide-react';

interface AideModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: 'guide' | 'astuces' | 'blog' | 'support';
}

const clientSteps = [
  {
    id: 1,
    icon: Search,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    borderClass: 'border-blue-100 dark:border-blue-500/20',
    glowClass: 'shadow-blue-500/30',
    title: 'Recherchez un service',
    subtitle: 'Trouvez le bon professionnel',
    description: 'Utilisez la barre de recherche pour trouver les spécialistes selon vos besoins et votre ville.',
    tips: [
      { icon: MapPin, text: 'Filtrez par ville ou quartier' },
      { icon: Star, text: 'Consultez les avis et notes' },
      { icon: Clock, text: 'Vérifiez les disponibilités en temps réel' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2 bg-white dark:bg-[#1A1D24] rounded-xl p-2.5 border border-gray-200 dark:border-white/10 shadow-sm">
          <Search size={15} className="text-gray-400" />
          <span className="text-xs text-gray-400 flex-1">Plombier à Casablanca...</span>
          <div className="bg-blue-600 text-white rounded-lg px-3 py-1 text-xs font-semibold">Chercher</div>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {['Ahmed Moussaoui · Plombier ⭐4.9', 'Karim Bennis · Électricien ⭐4.7'].map((item, i) => (
            <div key={i} className="bg-white dark:bg-[#1A1D24] rounded-xl p-2.5 text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5 flex items-center gap-2 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {item.charAt(0)}
              </div>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: CalendarCheck,
    colorClass: 'text-cyan-600 dark:text-cyan-400',
    bgClass: 'bg-cyan-50 dark:bg-cyan-500/10',
    btnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    borderClass: 'border-cyan-100 dark:border-cyan-500/20',
    glowClass: 'shadow-cyan-500/30',
    title: 'Choisissez un créneau',
    subtitle: 'Réservez à votre convenance',
    description: 'Sélectionnez la date et l\'heure qui vous conviennent parmi les créneaux disponibles du praticien.',
    tips: [
      { icon: CalendarCheck, text: 'Calendrier interactif avec disponibilités' },
      { icon: Bell, text: 'Rappel automatique 24h avant' },
      { icon: Clock, text: 'Créneaux matin, après-midi et soir' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center justify-between">
          <span>Janvier 2026</span>
          <div className="flex gap-1">
            <ChevronLeft size={14} className="text-gray-400" />
            <ChevronRight size={14} className="text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['L','M','M','J','V','S','D'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-gray-400 py-0.5">{d}</div>
          ))}
          {[...Array(4)].map((_, i) => <div key={i} />)}
          {[15,16,17,18,19,20,21].map(d => (
            <div key={d} className={`text-center text-xs rounded-lg py-1 ${d === 18 ? 'font-bold bg-cyan-600 text-white' : d === 19 || d === 20 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>{d}</div>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap justify-center">
          {['09:00','10:30','14:00','15:30'].map((t, i) => (
            <div key={i} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${i === 1 ? 'bg-cyan-600 border-cyan-600 text-white' : 'bg-white dark:bg-[#1A1D24] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>{t}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: UserCheck,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    borderClass: 'border-purple-100 dark:border-purple-500/20',
    glowClass: 'shadow-purple-500/30',
    title: 'Confirmez votre profil',
    subtitle: 'Vos infos en un clic',
    description: 'Vérifiez vos informations personnelles avant de confirmer. Votre profil est rempli automatiquement depuis votre compte.',
    tips: [
      { icon: UserCheck, text: 'Données pré-remplies depuis votre compte' },
      { icon: CheckCircle2, text: 'Relisez avant de valider' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 flex items-center justify-center text-white font-bold text-sm shrink-0">A</div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">Ahmed Moussaoui</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">ahmed.m@email.com</div>
          </div>
          <div className="ml-auto text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/20 px-2 py-1 rounded-md">Vérifié ✓</div>
        </div>
        {[{ label: 'Date', value: '18 Jan · 10:30' }, { label: 'Spécialiste', value: 'Karim Bennis' }].map((row, i) => (
          <div key={i} className={`flex justify-between py-2 ${i === 0 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{row.label}</span>
            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{row.value}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    icon: CheckCircle2,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    borderClass: 'border-emerald-100 dark:border-emerald-500/20',
    glowClass: 'shadow-emerald-500/30',
    title: 'Rendez-vous confirmé !',
    subtitle: 'C\'est tout !',
    description: 'Votre rendez-vous est enregistré. Vous recevrez une confirmation et un rappel. Retrouvez-le dans "Mes Rendez-vous".',
    tips: [
      { icon: Bell, text: 'Notification de confirmation immédiate' },
      { icon: CalendarCheck, text: 'Visible dans "Mes Rendez-vous"' },
      { icon: Star, text: 'Laissez un avis après la consultation' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/10 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-1">Rendez-vous confirmé !</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-4">Karim Bennis · 18 Jan à 10:30</div>
        <div className="flex gap-2 justify-center">
          <div className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white">Voir le RDV</div>
          <div className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300">Annuler</div>
        </div>
      </div>
    ),
  },
];

const providerSteps = [
  {
    id: 1,
    icon: Briefcase,
    colorClass: 'text-blue-600 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    btnClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    borderClass: 'border-blue-100 dark:border-blue-500/20',
    glowClass: 'shadow-blue-500/30',
    title: 'Configurez vos services',
    subtitle: 'Vos prestations et tarifs',
    description: "Ajoutez les services que vous proposez avec leur durée et leur prix pour que les clients sachent exactement ce que vous faites.",
    tips: [
      { icon: Briefcase, text: 'Titres clairs et descriptifs' },
      { icon: CreditCard, text: 'Fixez des prix transparents' },
      { icon: Clock, text: 'Durée précise pour le calcul de l\'agenda' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        <div className="bg-white dark:bg-[#1A1D24] rounded-xl p-3 border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">Plomberie Générale</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Réparation et installation</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">150 DH</div>
            <div className="text-[10px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded flex items-center gap-1 mt-1 justify-end"><Clock size={10}/> 1 Heure</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    icon: Calendar,
    colorClass: 'text-cyan-600 dark:text-cyan-400',
    bgClass: 'bg-cyan-50 dark:bg-cyan-500/10',
    btnClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    borderClass: 'border-cyan-100 dark:border-cyan-500/20',
    glowClass: 'shadow-cyan-500/30',
    title: 'Gérez votre emploi du temps',
    subtitle: 'Définissez vos horaires',
    description: "Choisissez vos jours de travail et vos créneaux horaires. Seuls ces horaires seront proposés aux clients pour réserver.",
    tips: [
      { icon: CalendarCheck, text: 'Horaires personnalisés par jour' },
      { icon: X, text: 'Désactivez les jours de repos' },
      { icon: Clock, text: 'Génération automatique de la grille' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        {[{ d: 'Lundi', a: true, t: '09:00 - 18:00' }, { d: 'Mardi', a: true, t: '09:00 - 18:00' }, { d: 'Dimanche', a: false, t: 'Repos' }].map((row, i) => (
          <div key={i} className={`flex items-center justify-between py-2 ${i < 2 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{row.d}</span>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${row.a ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>{row.t}</span>
              <div className={`w-8 h-4 rounded-full relative ${row.a ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${row.a ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    icon: CheckSquare,
    colorClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    borderClass: 'border-purple-100 dark:border-purple-500/20',
    glowClass: 'shadow-purple-500/30',
    title: 'Acceptez ou Refusez',
    subtitle: 'Gardez le contrôle',
    description: "Lorsqu'un client réserve, vous recevez une demande. Vous avez le contrôle total pour l'accepter ou la refuser selon vos contraintes.",
    tips: [
      { icon: Bell, text: 'Soyez notifié des nouvelles demandes' },
      { icon: UserCheck, text: 'Vérifiez les infos du client avant' },
      { icon: CheckCircle2, text: 'Répondez rapidement pour un bon profil' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        <div className="bg-white dark:bg-[#1A1D24] rounded-xl p-3 border border-purple-100 dark:border-purple-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-50 dark:border-white/5 pb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">YM</div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">Yassine Mansouri</div>
              <div className="text-[9px] text-gray-500">Demande le 18 Jan à 10:00</div>
            </div>
            <div className="ml-auto text-[9px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded">En attente</div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-purple-600 text-white text-[10px] font-bold py-1.5 rounded-lg">Accepter</button>
            <button className="flex-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold py-1.5 rounded-lg border border-red-100 dark:border-red-500/20">Refuser</button>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    icon: Activity,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    borderClass: 'border-emerald-100 dark:border-emerald-500/20',
    glowClass: 'shadow-emerald-500/30',
    title: 'Suivez vos statistiques',
    subtitle: 'Analysez votre activité',
    description: "Retrouvez tout votre historique, le nombre de clients, et vos notes depuis votre tableau de bord global.",
    tips: [
      { icon: Activity, text: 'Tableau de bord complet' },
      { icon: Star, text: 'Surveillez votre note moyenne' },
      { icon: MapPin, text: 'Analysez les demandes de vos clients' },
    ],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 grid grid-cols-2 gap-2">
        <div className="bg-white dark:bg-[#1A1D24] rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center shadow-sm">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">RDV Totaux</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">128</div>
        </div>
        <div className="bg-white dark:bg-[#1A1D24] rounded-xl p-3 border border-gray-100 dark:border-white/10 text-center shadow-sm">
          <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">Note globale</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">4.8<Star size={12} className="fill-emerald-600 dark:fill-emerald-400"/></div>
        </div>
      </div>
    ),
  },
];

const astucesSteps = [
  {
    id: 1,
    icon: Star,
    colorClass: 'text-amber-500 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-500/10',
    btnClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    borderClass: 'border-amber-100 dark:border-amber-500/20',
    glowClass: 'shadow-amber-500/30',
    title: 'Obtenez des avis 5 étoiles',
    subtitle: 'La clé de la confiance',
    description: 'Les clients font confiance aux profils bien notés. Encouragez vos clients satisfaits à laisser un avis après chaque rendez-vous.',
    tips: [{icon: Star, text: 'Plus d\'avis = Plus de visibilité'}, {icon: UserCheck, text: 'Répondez toujours aux avis (même négatifs)'}],
    visual: <div className="text-center py-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10"><Star size={40} className="text-amber-500 mx-auto mb-2"/><div className="text-lg font-bold text-gray-900 dark:text-white">4.9/5</div></div>
  },
  {
    id: 2,
    icon: Clock,
    colorClass: 'text-blue-500 dark:text-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    btnClass: 'bg-blue-500 hover:bg-blue-600 text-white',
    borderClass: 'border-blue-100 dark:border-blue-500/20',
    glowClass: 'shadow-blue-500/30',
    title: 'Soyez réactif',
    subtitle: 'Acceptez vite les demandes',
    description: 'Un profil qui répond rapidement aux demandes de réservation est mis en avant dans l\'algorithme de recherche Bookify.',
    tips: [{icon: Bell, text: 'Activez les notifications'}, {icon: CheckCircle2, text: 'Temps de réponse idéal < 1h'}],
    visual: <div className="text-center py-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10"><Clock size={40} className="text-blue-500 mx-auto mb-2"/><div className="text-lg font-bold text-gray-900 dark:text-white">Réponse : 15 min</div></div>
  }
];

const blogSteps = [
  {
    id: 1,
    icon: BookOpen,
    colorClass: 'text-indigo-500 dark:text-indigo-400',
    bgClass: 'bg-indigo-50 dark:bg-indigo-500/10',
    btnClass: 'bg-indigo-500 hover:bg-indigo-600 text-white',
    borderClass: 'border-indigo-100 dark:border-indigo-500/20',
    glowClass: 'shadow-indigo-500/30',
    title: 'Actualités Bookify',
    subtitle: 'Découvrez nos nouveautés',
    description: 'Nous mettons régulièrement à jour la plateforme. Gardez un oeil sur nos articles pour utiliser les nouveaux outils mis à votre disposition.',
    tips: [{icon: Activity, text: 'Nouvelles fonctionnalités'}, {icon: Star, text: 'Témoignages de réussite'}],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10 flex flex-col gap-3">
        {[
          { title: "Comment optimiser votre emploi du temps ?", date: "10 Juin 2026", tag: "Astuce", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { title: "Nouvelle mise à jour : Gestion des factures", date: "05 Juin 2026", tag: "Nouveauté", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" }
        ].map((article, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1D24] border border-gray-100 dark:border-white/10 rounded-xl p-3 flex gap-3 items-center hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${article.bg} ${article.color}`}>
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${article.bg} ${article.color}`}>{article.tag}</span>
                <span className="text-[9px] text-gray-400">{article.date}</span>
              </div>
              <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{article.title}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
];

const supportSteps = [
  {
    id: 1,
    icon: Bell,
    colorClass: 'text-rose-500 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-500/10',
    btnClass: 'bg-rose-500 hover:bg-rose-600 text-white',
    borderClass: 'border-rose-100 dark:border-rose-500/20',
    glowClass: 'shadow-rose-500/30',
    title: 'Besoin d\'aide ?',
    subtitle: 'Contactez notre support',
    description: 'Vous avez un problème technique ou une question sur votre facturation ? Notre équipe est là pour vous aider 7j/7.',
    tips: [{icon: Mail, text: 'bookifyrend@gmail.com'}, {icon: Phone, text: '+212 7 72 11 47 55'}],
    visual: (
      <div className="bg-gray-50/50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
        <div className="mb-3">
          <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Sujet</label>
          <input type="text" placeholder="Ex: Problème technique" className="w-full mt-1 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-rose-500 transition-colors" />
        </div>
        <div className="mb-3">
          <label className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-1">Message</label>
          <textarea placeholder="Comment pouvons-nous vous aider ?" rows={3} className="w-full mt-1 bg-white dark:bg-[#1A1D24] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-rose-500 resize-none transition-colors"></textarea>
        </div>
        <button className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2">
          Envoyer le message <ChevronRight size={14} />
        </button>
      </div>
    )
  }
];

const AideModal: React.FC<AideModalProps> = ({ isOpen, onClose, topic = 'guide' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animDir, setAnimDir] = useState<'left' | 'right'>('right');
  const [visible, setVisible] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'PRESTATAIRE' || user.role === 'PROVIDER' || user.Role === 'PRESTATAIRE' || user.Role === 'PROVIDER') {
          setIsProvider(true);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) { setTimeout(() => setVisible(true), 10); setCurrentStep(0); }
    else setVisible(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = topic === 'astuces' ? astucesSteps 
              : topic === 'blog' ? blogSteps 
              : topic === 'support' ? supportSteps 
              : (isProvider ? providerSteps : clientSteps);
  const step = steps[currentStep];
  const Icon = step.icon;

  const goTo = (idx: number) => {
    setAnimDir(idx > currentStep ? 'right' : 'left');
    setCurrentStep(idx);
  };
  const next = () => { if (currentStep < steps.length - 1) goTo(currentStep + 1); else onClose(); };
  const prev = () => { if (currentStep > 0) goTo(currentStep - 1); };

  return (
    <>
      <style>{`
        @keyframes aideBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes aideModalIn { from { opacity: 0; transform: scale(0.94) translateY(20px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes aideStepIn { from { opacity: 0; transform: translateX(32px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes aideStepInLeft { from { opacity: 0; transform: translateX(-32px) } to { opacity: 1; transform: translateX(0) } }
        .aide-backdrop { animation: aideBackdropIn 0.25s ease both; }
        .aide-modal { animation: aideModalIn 0.3s cubic-bezier(.16,1,.3,1) both; }
        .aide-step-right { animation: aideStepIn 0.35s cubic-bezier(.16,1,.3,1) both; }
        .aide-step-left { animation: aideStepInLeft 0.35s cubic-bezier(.16,1,.3,1) both; }
      `}</style>
      <div
        className="aide-backdrop fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <div
          className="aide-modal w-full max-w-lg bg-white/95 dark:bg-[#1A1D24]/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.4)] overflow-hidden relative border border-white/50 dark:border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-black pt-6 pb-5 px-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
            
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-tight">Guide d'utilisation</div>
                <div className="text-sm text-blue-100 dark:text-blue-200 opacity-90">Comment fonctionne {isProvider ? 'votre espace pro' : 'la plateforme'}</div>
              </div>
              <button 
                onClick={onClose} 
                className="ml-auto bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors border border-white/5"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Step indicators */}
            <div className="flex gap-2 relative z-10">
              {steps.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => goTo(i)} 
                  className={`h-1.5 rounded-full border-0 transition-all duration-300 ${i === currentStep ? 'flex-[3] bg-white' : 'flex-1 bg-white/30 hover:bg-white/50'}`} 
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div key={currentStep} className={`aide-step-${animDir} px-6 pt-6 pb-5`}>
            {/* Step badge */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${step.bgClass} ${step.borderClass}`}>
                <Icon size={24} className={step.colorClass} />
              </div>
              <div>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${step.colorClass}`}>
                  Étape {step.id} sur {steps.length} · {step.subtitle}
                </div>
                <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{step.title}</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{step.description}</p>

            {/* Visual */}
            <div className="mb-5">{step.visual}</div>

            {/* Tips */}
            <div className="flex flex-col gap-2">
              {step.tips.map((tip, i) => {
                const TipIcon = tip.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${step.bgClass} border-transparent dark:border-white/5`}>
                    <TipIcon size={14} className={`shrink-0 ${step.colorClass}`} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{tip.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer navigation */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200/50 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 backdrop-blur-md">
            <button
              onClick={prev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                currentStep === 0 
                  ? 'border-gray-200 dark:border-white/5 text-gray-400 dark:text-gray-600 bg-transparent cursor-not-allowed' 
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-[#1A1D24] bg-transparent'
              }`}
            >
              <ChevronLeft size={16} />Précédent
            </button>
            <div className="flex gap-1.5 hidden sm:flex">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-200 dark:bg-white/10'}`} />
              ))}
            </div>
            <button
              onClick={next}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 ${step.btnClass} ${step.glowClass}`}
            >
              {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}<ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AideModal;
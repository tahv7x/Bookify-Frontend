import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, BadgeCheck, Star, MapPin, Zap, Users,
  Calendar, MessageCircle, ChevronDown, ChevronUp, Send
} from 'lucide-react';

const PROVIDERS: Record<string, any> = {
  'dr-youssef-alami': {
    name: 'Dr. Youssef Alami', business: 'Cabinet Alami', title: 'Médecin Généraliste',
    rating: 4.9, reviews: 127, hired: 43, location: 'Casablanca, Maarif',
    responseTime: 'Répond en 1h', memberSince: '2021',
    image: 'https://i.pravatar.cc/150?img=12', badge: 'Top Pro', verified: true,
    price: '300 MAD', priceNote: 'séance',
    intro: "Professionnel certifié avec plus de 10 ans d'expérience. Spécialiste en médecine générale, suivi chronique, et bilans complets. Je m'engage pour votre santé.",
    credentials: ['Certifié', 'Assurance incluse', "Contrôle d'antécédents", 'Licence vérifiée'],
    photos: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=400&fit=crop',
    ],
    services: ['Consultation générale', 'Suivi médical', 'Bilan complet', 'Téléconsultation'],
    faq: [
      { q: 'Quelles sont vos disponibilités ?', a: 'Je suis disponible du lundi au samedi, de 9h à 19h. Les rendez-vous urgents peuvent être arrangés.' },
      { q: 'Acceptez-vous les mutuelles ?',     a: 'Oui, je travaille avec la plupart des mutuelles marocaines. Contactez-moi pour vérifier la vôtre.' },
      { q: 'Proposez-vous des consultations à domicile ?', a: 'Oui, pour les patients à mobilité réduite ou sur demande spéciale.' },
    ],
    reviewsList: [
      { name: 'Fatima Z.', avatar: 'https://i.pravatar.cc/40?img=5',  rating: 5, date: 'Il y a 2 semaines', text: 'Excellent professionnel, très à l\'écoute. Je recommande vivement.' },
      { name: 'Mohamed A.', avatar: 'https://i.pravatar.cc/40?img=7', rating: 5, date: 'Il y a 1 mois',    text: 'Très professionnel et ponctuel. Exactement ce dont j\'avais besoin.' },
      { name: 'Aicha B.',   avatar: 'https://i.pravatar.cc/40?img=9', rating: 4, date: 'Il y a 2 mois',    text: 'Bon service, explications claires et détaillées. Reviendrai.' },
      { name: 'Omar K.',   avatar: 'https://i.pravatar.cc/40?img=11', rating: 5, date: 'Il y a 3 mois',    text: 'Rapide, efficace et très compétent. Parfait pour toute la famille.' },
    ],
  },
  'sara-bennis': {
    name: 'Sara Bennis', business: 'Cabinet Bennis', title: 'Spécialiste Premium',
    rating: 5.0, reviews: 89, hired: 61, location: 'Rabat, Agdal',
    responseTime: 'Répond en 30min', memberSince: '2020',
    image: 'https://i.pravatar.cc/150?img=45', badge: 'Top Pro', verified: true,
    price: '350 MAD', priceNote: 'séance',
    intro: "Spécialiste avec une approche 100% personnalisée. Chaque client mérite une attention particulière. Mon objectif : des résultats exceptionnels, à chaque fois.",
    credentials: ['Certifiée', 'Assurance incluse', "Contrôle d'antécédents"],
    photos: [
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop',
    ],
    services: ['Consultation premium', 'Suivi personnalisé', 'Pack complet'],
    faq: [
      { q: 'Quelle est votre spécialité principale ?', a: 'Je me spécialise dans le suivi personnalisé et les approches intégratives adaptées à chaque profil.' },
    ],
    reviewsList: [
      { name: 'Khadija M.', avatar: 'https://i.pravatar.cc/40?img=11', rating: 5, date: 'Il y a 3 jours',    text: 'Parfaite ! Service irréprochable et très sympathique.' },
      { name: 'Yassine T.', avatar: 'https://i.pravatar.cc/40?img=13', rating: 5, date: 'Il y a 3 semaines', text: 'La meilleure de sa catégorie. Résultats au-delà de mes attentes.' },
    ],
  },
};

const StarsRow = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={rating >= i ? '#f59e0b' : '#e5e7eb'}/>
      </svg>
    ))}
  </div>
);

export default function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [activePhoto, setActivePhoto] = useState(0);
  const [openFaq,     setOpenFaq]     = useState<number | null>(null);
  const [showAll,     setShowAll]     = useState(false);
  const [quoteStep,   setQuoteStep]   = useState(0); // 0=idle 1=form 2=sent
  const [userName,    setUserName]    = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  const handleAuthAction = (action : () => void) =>{
    if(isLoggedIn()){
      action();
    }else{
      navigate("/Login");
    }
  }
  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) { try { const u = JSON.parse(s); setUserName(u.nom || u.NomComplet || u.name || ''); } catch(e){} }
  }, []);

  const key = providerId || 'dr-youssef-alami';
  const p   = PROVIDERS[key] || PROVIDERS['dr-youssef-alami'];
  const displayedReviews = showAll ? p.reviewsList : p.reviewsList.slice(0, 2);

  const ratingPcts: Record<number, number> = { 5:78, 4:16, 3:4, 2:2, 1:0 };

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700;800&display=swap');
        * { font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif; }
        .heading-font { font-family:'Fraunces',Georgia,serif; }
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn {from{opacity:0}to{opacity:1}}
        .fade-up   {animation:fadeInUp .45s cubic-bezier(.16,1,.3,1) both;}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards;}
      `}</style>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}/>
      )}

      {/* Sticky top nav */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-4 sm:px-8 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-dark-muted hover:text-gray-900 dark:hover:text-dark-text px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
          >
            <ChevronRight size={16} className="rotate-180"/>
            Retour aux résultats
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Hero card */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-dark-border fade-up">
              {/* Photo gallery */}
              {p.photos.length > 0 && (
                <div className="relative h-56 sm:h-72 bg-gray-900 overflow-hidden">
                  <img src={p.photos[activePhoto]} alt="work"
                    className="w-full h-full object-cover opacity-90 transition-all duration-500"/>
                  {/* Dots */}
                  {p.photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {p.photos.map((_: any, i: number) => (
                        <button key={i} onClick={() => setActivePhoto(i)}
                          className={`h-1.5 rounded-full transition-all duration-200 ${i === activePhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}/>
                      ))}
                    </div>
                  )}
                  {/* Counter */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                    {activePhoto + 1} / {p.photos.length}
                  </div>
                </div>
              )}

              {/* Profile info */}
              <div className="p-5 sm:p-6">
                <div className="flex gap-4 items-start">
                  <div className="relative shrink-0">
                    <img src={p.image} alt={p.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gray-100 dark:border-dark-border"/>
                    {p.verified && (
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#0059B2] rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface">
                        <BadgeCheck size={13} color="#fff"/>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text heading-font">{p.business}</h1>
                      {p.badge && (
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                          ★ {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-dark-muted mb-2">{p.name} · {p.title}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <StarsRow rating={p.rating} size={14}/>
                        <span className="font-bold text-sm text-gray-900 dark:text-dark-text">{p.rating.toFixed(1)}</span>
                        <span className="text-xs text-[#0059B2] dark:text-blue-400 font-medium">({p.reviews} avis)</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted">
                        <Users size={11}/>{p.hired} recrutements
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted">
                        <MapPin size={11} className="text-[#0059B2]"/>{p.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border fade-up" style={{animationDelay:'.05s'}}>
              <h2 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-4">Vérifications & licences</h2>
              <div className="flex flex-wrap gap-2">
                {p.credentials.map((c: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border fade-up" style={{animationDelay:'.1s'}}>
              <h2 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-3">Introduction</h2>
              <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed mb-5">{p.intro}</p>

              <div className="border-t border-gray-100 dark:border-dark-border pt-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text mb-3">Services proposés</h3>
                <div className="flex flex-wrap gap-2">
                  {p.services.map((s: string, i: number) => (
                    <span key={i} className="bg-blue-50 dark:bg-blue-500/10 text-[#0059B2] dark:text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-dark-border pt-4 flex flex-wrap gap-4">
                {[
                  { icon: <Zap size={13} className="text-[#0059B2]"/>,      label: p.responseTime },
                  { icon: <Calendar size={13} className="text-[#0059B2]"/>, label: `Membre depuis ${p.memberSince}` },
                  { icon: <Users size={13} className="text-[#0059B2]"/>,    label: `${p.hired} clients` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-muted">
                    {item.icon}{item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border fade-up" style={{animationDelay:'.15s'}}>
              <h2 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-4">Questions fréquentes</h2>
              {p.faq.map((item: any, i: number) => (
                <div key={i} className={`${i < p.faq.length - 1 ? 'border-b border-gray-100 dark:border-dark-border' : ''}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-dark-text pr-4">{item.q}</span>
                    {openFaq === i
                      ? <ChevronUp size={16} className="text-[#0059B2] shrink-0"/>
                      : <ChevronDown size={16} className="text-gray-400 shrink-0"/>
                    }
                  </button>
                  {openFaq === i && (
                    <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed pb-4">{item.a}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-dark-border fade-up" style={{animationDelay:'.2s'}}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-dark-text mb-1">Avis clients</h2>
                  <div className="flex items-center gap-2">
                    <StarsRow rating={p.rating} size={16}/>
                    <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{p.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 dark:text-dark-muted">sur 5 · {p.reviews} avis</span>
                  </div>
                </div>
              </div>

              {/* Rating bars */}
              <div className="mb-5 space-y-2">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-dark-muted w-3">{star}</span>
                    <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0"/>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{width:`${ratingPcts[star]}%`}}/>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-dark-muted w-7">{ratingPcts[star]}%</span>
                  </div>
                ))}
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {displayedReviews.map((r: any, i: number) => (
                  <div key={i} className={`${i > 0 ? 'border-t border-gray-100 dark:border-dark-border pt-4' : ''}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0"/>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">{r.name}</p>
                          <StarsRow rating={r.rating} size={11}/>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-dark-muted">{r.date}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed">{r.text}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      A engagé ce professionnel
                    </div>
                  </div>
                ))}
              </div>

              {p.reviewsList.length > 2 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-semibold text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                >
                  {showAll ? 'Voir moins' : `Voir les ${p.reviews} avis`}
                </button>
              )}
            </div>

          </div>

          {/* RIGHT STICKY COLUMN */}
          <div className="lg:sticky lg:top-20 flex flex-col gap-4">

            {/* Booking panel */}
            {quoteStep === 0 && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-md border border-gray-100 dark:border-dark-border fade-up">
                <p className="text-xs text-gray-400 dark:text-dark-muted mb-1">À partir de</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-dark-text mb-1">
                  {p.price}
                  <span className="text-sm font-normal text-gray-400 dark:text-dark-muted"> / {p.priceNote}</span>
                </p>

                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2.5 mb-4 mt-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"/>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{p.responseTime}</span>
                </div>

                <button onClick={() => handleAuthAction(() => setQuoteStep(1))}
                  className="w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] hover:from-[#003d80] hover:to-[#1560b8] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg mb-2.5"
                >
                  Obtenir un devis
                </button>
                <button onClick={() => handleAuthAction(() => setQuoteStep(1))} className="w-full bg-white ...">
                  <MessageCircle size={14} className="inline mr-2"/>Contacter
                </button>
                <p className="text-xs text-gray-400 dark:text-dark-muted text-center mt-3">Aucun engagement requis</p>
              </div>
            )}

            {quoteStep === 1 && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-md border border-gray-100 dark:border-dark-border fade-up">
                <button onClick={() => setQuoteStep(0)} className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-muted hover:text-gray-700 mb-4">
                  <ChevronRight size={14} className="rotate-180"/>Retour
                </button>
                <h3 className="text-base font-bold text-gray-900 dark:text-dark-text mb-4">Demander un devis</h3>
                <div className="space-y-3">
                  {['Votre nom', 'Téléphone', 'Ville'].map(label => (
                    <div key={label}>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-dark-muted mb-1.5">{label}</label>
                      <input className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text outline-none focus:border-[#0059B2] dark:focus:border-blue-500 transition-colors"/>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-dark-muted mb-1.5">Description du besoin</label>
                    <textarea rows={3} className="w-full px-3 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text outline-none focus:border-[#0059B2] dark:focus:border-blue-500 transition-colors resize-none"/>
                  </div>
                  <button
                    onClick={() => setQuoteStep(2)}
                    className="w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-[#003d80] hover:to-[#1560b8] transition-all"
                  >
                    <Send size={14}/>Envoyer la demande
                  </button>
                </div>
              </div>
            )}

            {quoteStep === 2 && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md border border-gray-100 dark:border-dark-border text-center fade-up">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-dark-text mb-1">Demande envoyée !</h3>
                <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">{p.name} vous répondra dans les plus brefs délais.</p>
                <button onClick={() => setQuoteStep(0)} className="text-sm text-[#0059B2] dark:text-blue-400 font-semibold hover:underline">
                  Retour au profil
                </button>
              </div>
            )}

            {/* Stats mini card */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border fade-up" style={{animationDelay:'.05s'}}>
              {[
                { label: 'Recrutements', value: p.hired,              icon: <Users size={14} className="text-[#0059B2]"/>    },
                { label: 'Note',         value: `${p.rating.toFixed(1)}/5`, icon: <Star  size={14} className="text-yellow-400 fill-yellow-400"/> },
                { label: 'Avis',         value: p.reviews,            icon: <MessageCircle size={14} className="text-[#0059B2]"/>},
              ].map((stat, i) => (
                <div key={i} className={`flex justify-between items-center py-3 ${i < 2 ? 'border-b border-gray-50 dark:border-dark-border' : ''}`}>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-dark-muted">
                    {stat.icon}{stat.label}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-dark-text">{stat.value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 dark:text-dark-muted text-center">🔒 Vos informations sont sécurisées</p>
          </div>

        </div>
      </div>
    </div>
  );
}

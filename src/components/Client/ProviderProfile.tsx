import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight, BadgeCheck, Star, MapPin, Zap, Users,
  Calendar, MessageCircle, ChevronDown, ChevronUp, Send
} from 'lucide-react';
import { getProviderProfile } from '../../services/provider/providerService';



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
  const [isRedirecting, setIsRedirecting] = useState(false);  const [provider,setProvider] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
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
      setIsRedirecting(true);
      setTimeout(() =>{
        navigate("/login");
      },800);
    }
  }
  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) { try { const u = JSON.parse(s); setUserName(u.nom || u.NomComplet || u.name || ''); } catch(e){} }
  }, []);
  const displayedReviews = showAll 
  ? provider?.reviewList || []
  : provider?.reviewList?.slice(0, 2) || []
  useEffect(() =>{
    const fetchProvider = async() => {
      try{
        setLoading(true);
        const data = await getProviderProfile(Number(providerId));
        const apiData = data;
        const mappedProvider = {
          id: apiData.id,
          name: apiData.nom,
          business: apiData.nom,
          title: apiData.specialite,
          rating: apiData.note,
          reviews: 0,
          hired: 0,
          location: "Casablanca",
          intro: apiData.bio,
          services: apiData.services.map((s: any) => s.name),
          photos: [],
          reviewsList: [],
          credentials: [],
          faq: [],
          price: apiData.services[0]?.prix || 0,
          priceNote: "par service",
          responseTime: "Réponse rapide",
          memberSince: "2024"
        };
        setProvider(mappedProvider);
      }catch(err: any){
        setError(err.message);
      }finally{
        setTimeout(() => {
          setLoading(false);
        },800);
      }
    };
    if(providerId) fetchProvider();
  },[providerId]);
  const ratingPcts: Record<number, number> = { 5:78, 4:16, 3:4, 2:2, 1:0 };
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FE] gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0059B2] rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">
          Chargement en cours...
        </p>
      </div>
    );
  }
  if (error) {
    return <div className="p-10 text-red-500">{error}</div>;
  }

  if (!provider) {
    return (
      <div className="p-10 text-center text-gray-500">
        Aucun prestataire trouvé
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      {isRedirecting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-xl animate-scaleIn">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-[#0059B2] rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-gray-600">
              Redirection vers login...
            </p>
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700;800&display=swap');
        * { font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif; }
        .heading-font { font-family:'Fraunces',Georgia,serif; }
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn {from{opacity:0}to{opacity:1}}
        .fade-up   {animation:fadeInUp .45s cubic-bezier(.16,1,.3,1) both;}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards;}
      `}</style>
      {isSidebarOpen && (
        <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}/>
      )}
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
              {provider.photos.length > 0 && (
                <div className="relative h-56 sm:h-72 bg-gray-900 overflow-hidden">
                  <img src={provider.photos[activePhoto]} alt="work"
                    className="w-full h-full object-cover opacity-90 transition-all duration-500"/>
                  {/* Dots */}
                  {provider.photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {provider.photos.map((_: any, i: number) => (
                        <button key={i} onClick={() => setActivePhoto(i)}
                          className={`h-1.5 rounded-full transition-all duration-200 ${i === activePhoto ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}/>
                      ))}
                    </div>
                  )}
                  {/* Counter */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                    {activePhoto + 1} / {provider.photos.length}
                  </div>
                </div>
              )}

              {/* Profile info */}
              <div className="p-5 sm:p-6">
                <div className="flex gap-4 items-start">
                  <div className="relative shrink-0">
                    <img src={provider.image} alt={provider.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gray-100 dark:border-dark-border"/>
                    {provider.verified && (
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#0059B2] rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface">
                        <BadgeCheck size={13} color="#fff"/>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text heading-font">{provider.business}</h1>
                      {provider.badge && (
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                          ★ {provider.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-dark-muted mb-2">{provider.name} · {provider.title}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <StarsRow rating={provider.rating} size={14}/>
                        <span className="font-bold text-sm text-gray-900 dark:text-dark-text">{provider.rating.toFixed(1)}</span>
                        <span className="text-xs text-[#0059B2] dark:text-blue-400 font-medium">({provider.reviews} avis)</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted">
                        <Users size={11}/>{provider.hired} recrutements
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted">
                        <MapPin size={11} className="text-[#0059B2]"/>{provider.location}
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
                {provider.credentials.map((c: string, i: number) => (
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
              <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed mb-5">{provider.intro}</p>

              <div className="border-t border-gray-100 dark:border-dark-border pt-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text mb-3">Services proposés</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map((s: string, i: number) => (
                    <span key={i} className="bg-blue-50 dark:bg-blue-500/10 text-[#0059B2] dark:text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-dark-border pt-4 flex flex-wrap gap-4">
                {[
                  { icon: <Zap size={13} className="text-[#0059B2]"/>,      label: provider.responseTime },
                  { icon: <Calendar size={13} className="text-[#0059B2]"/>, label: `Membre depuis ${provider.memberSince}` },
                  { icon: <Users size={13} className="text-[#0059B2]"/>,    label: `${provider.hired} clients` },
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
              {provider.faq.map((item: any, i: number) => (
                <div key={i} className={`${i < provider.faq.length - 1 ? 'border-b border-gray-100 dark:border-dark-border' : ''}`}>
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
                    <StarsRow rating={provider.rating} size={16}/>
                    <span className="text-2xl font-bold text-gray-900 dark:text-dark-text">{provider.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500 dark:text-dark-muted">sur 5 · {provider.reviews} avis</span>
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

              {provider.reviewsList.length > 2 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-4 py-2.5 border border-gray-200 dark:border-dark-border rounded-xl text-sm font-semibold text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                >
                  {showAll ? 'Voir moins' : `Voir les ${provider.reviews} avis`}
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
                  {provider.price}
                  <span className="text-sm font-normal text-gray-400 dark:text-dark-muted"> / {provider.priceNote}</span>
                </p>

                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2.5 mb-4 mt-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"/>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{provider.responseTime}</span>
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
                <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">{provider.name} vous répondra dans les plus brefs délais.</p>
                <button onClick={() => setQuoteStep(0)} className="text-sm text-[#0059B2] dark:text-blue-400 font-semibold hover:underline">
                  Retour au profil
                </button>
              </div>
            )}

            {/* Stats mini card */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-dark-border fade-up" style={{animationDelay:'.05s'}}>
              {[
                { label: 'Recrutements', value: provider.hired,              icon: <Users size={14} className="text-[#0059B2]"/>    },
                { label: 'Note',         value: `${provider.rating.toFixed(1)}/5`, icon: <Star  size={14} className="text-yellow-400 fill-yellow-400"/> },
                { label: 'Avis',         value: provider.reviews,            icon: <MessageCircle size={14} className="text-[#0059B2]"/>},
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Search, SlidersHorizontal, ChevronRight, BadgeCheck, Zap, Users } from 'lucide-react';
import TopBar from '../../components/Client/TopBar';
import Navbar from '../../components/Client/Navbar';

const providers = [
  {
    id: 'dr-youssef-alami',
    name: 'Dr. Youssef Alami',
    rating: 4.9, reviews: 127, location: 'Casablanca',
    price: 300, priceLabel: '300 MAD', priceNote: '/ séance',
    image: 'https://i.pravatar.cc/150?img=12',
    badge: 'Top Pro', hired: 43, responseTime: 'Répond en 1h',
    tags: ['Certifié', 'Expérimenté', 'Disponible'],
    description: "Professionnel certifié avec plus de 10 ans d'expérience. Je m'engage à fournir un service de haute qualité adapté à vos besoins.",
    verified: true,
  },
  {
    id: 'sara-bennis',
    name: 'Sara Bennis',
    rating: 5.0, reviews: 89, location: 'Rabat',
    price: 350, priceLabel: '350 MAD', priceNote: '/ séance',
    image: 'https://i.pravatar.cc/150?img=45',
    badge: 'Top Pro', hired: 61, responseTime: 'Répond en 30min',
    tags: ['Certifiée', 'Bilingue', 'Premium'],
    description: 'Spécialiste reconnue dans son domaine. Mon approche personnalisée garantit des résultats exceptionnels pour chaque client.',
    verified: true,
  },
  {
    id: 'karim-tahiri',
    name: 'Karim Tahiri',
    rating: 4.7, reviews: 54, location: 'Marrakech',
    price: 250, priceLabel: '250 MAD', priceNote: '/ séance',
    image: 'https://i.pravatar.cc/150?img=33',
    badge: null, hired: 28, responseTime: 'Répond en 2h',
    tags: ['Expérimenté', 'Flexible'],
    description: 'Passionné par mon métier, je propose des services flexibles adaptés à votre emploi du temps et votre budget.',
    verified: false,
  },
  {
    id: 'nadia-oufkir',
    name: 'Nadia Oufkir',
    rating: 4.8, reviews: 112, location: 'Fès',
    price: 280, priceLabel: '280 MAD', priceNote: '/ séance',
    image: 'https://i.pravatar.cc/150?img=47',
    badge: 'Top Pro', hired: 39, responseTime: 'Répond en 45min',
    tags: ['Certifiée', 'Multi-spécialités'],
    description: 'Professionnelle dévouée avec une expertise dans plusieurs spécialités. Satisfaction client garantie à chaque prestation.',
    verified: true,
  },
  {
    id: 'hassan-berrada',
    name: 'Hassan Berrada',
    rating: 4.6, reviews: 37, location: 'Tanger',
    price: 220, priceLabel: '220 MAD', priceNote: '/ séance',
    image: 'https://i.pravatar.cc/150?img=15',
    badge: null, hired: 19, responseTime: 'Répond en 3h',
    tags: ['Disponible', 'Tarif abordable'],
    description: 'Je mets mon expertise au service de vos projets avec sérieux et professionnalisme. Devis gratuit sur demande.',
    verified: false,
  },
  {
    id: 'leila-mansouri',
    name: 'Leila Mansouri',
    rating: 4.9, reviews: 203, location: 'Casablanca',
    price: 400, priceLabel: '400 MAD', priceNote: '/ séance',
    image: 'https://i.pravatar.cc/150?img=44',
    badge: 'Top Pro', hired: 88, responseTime: 'Répond en 20min',
    tags: ['Premium', 'Certifiée', 'Experte'],
    description: "L'excellence comme standard. Avec plus de 8 ans d'expérience, je vous offre une prestation haut de gamme personnalisée.",
    verified: true,
  },
];

const CITIES = ['all', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger'];
const SORTS  = [
  { val: 'recommended', label: 'Recommandés'    },
  { val: 'rating',      label: 'Meilleure note' },
  { val: 'price_asc',   label: 'Prix croissant' },
  { val: 'price_desc',  label: 'Prix décroissant'},
];
const RATINGS = [
  { val: 0,   label: 'Toutes les notes' },
  { val: 4,   label: '4+ ⭐'            },
  { val: 4.5, label: '4.5+ ⭐'          },
  { val: 4.8, label: '4.8+ ⭐'          },
];

const Stars = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={rating >= i ? '#f59e0b' : '#e5e7eb'}/>
      </svg>
    ))}
  </div>
);

export default function ServiceProviders() {
  const { serviceName } = useParams();
  const navigate = useNavigate();

  const [sortBy,        setSortBy]        = useState('recommended');
  const [selectedCity,  setSelectedCity]  = useState('all');
  const [minRating,     setMinRating]     = useState(0);
  const [userName,      setUserName]      = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showFilters,   setShowFilters]   = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) { try { const u = JSON.parse(s); setUserName(u.nom || u.NomComplet || u.name || ''); } catch(e){} }
  }, []);

  const filtered = providers
    .filter(p => selectedCity === 'all' || p.location === selectedCity)
    .filter(p => p.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === 'rating')      return b.rating - a.rating;
      if (sortBy === 'price_asc')   return a.price  - b.price;
      if (sortBy === 'price_desc')  return b.price  - a.price;
      return b.hired - a.hired;
    });

  const FilterPanel = () => (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
      <p className="text-sm font-bold text-gray-900 dark:text-dark-text mb-5">Filtres</p>

      {/* Sort */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-3">Trier par</p>
        {SORTS.map(opt => (
          <label key={opt.val} className="flex items-center gap-3 py-2 cursor-pointer group">
            <input type="radio" name="sort" value={opt.val} checked={sortBy === opt.val}
              onChange={() => setSortBy(opt.val)}
              className="accent-[#0059B2] w-4 h-4"/>
            <span className={`text-sm transition-colors ${sortBy === opt.val ? 'text-[#0059B2] font-semibold' : 'text-gray-600 dark:text-dark-muted group-hover:text-gray-900 dark:group-hover:text-dark-text'}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      {/* City */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-3">Ville</p>
        {CITIES.map(city => (
          <label key={city} className="flex items-center gap-3 py-2 cursor-pointer group">
            <input type="radio" name="city" value={city} checked={selectedCity === city}
              onChange={() => setSelectedCity(city)}
              className="accent-[#0059B2] w-4 h-4"/>
            <span className={`text-sm transition-colors ${selectedCity === city ? 'text-[#0059B2] font-semibold' : 'text-gray-600 dark:text-dark-muted group-hover:text-gray-900 dark:group-hover:text-dark-text'}`}>
              {city === 'all' ? 'Toutes les villes' : city}
            </span>
          </label>
        ))}
      </div>

      {/* Rating */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-3">Note minimale</p>
        {RATINGS.map(opt => (
          <label key={opt.val} className="flex items-center gap-3 py-2 cursor-pointer group">
            <input type="radio" name="rating" value={opt.val} checked={minRating === opt.val}
              onChange={() => setMinRating(opt.val)}
              className="accent-[#0059B2] w-4 h-4"/>
            <span className={`text-sm transition-colors ${minRating === opt.val ? 'text-[#0059B2] font-semibold' : 'text-gray-600 dark:text-dark-muted group-hover:text-gray-900 dark:group-hover:text-dark-text'}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-dark-bg transition-colors duration-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700;800&display=swap');
        * { font-family:'Poppins',-apple-system,BlinkMacSystemFont,sans-serif; }
        .heading-font { font-family:'Fraunces',Georgia,serif; }
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn {from{opacity:0}                          to{opacity:1}}
        .card-in{animation:fadeInUp .45s cubic-bezier(.16,1,.3,1) both;}
        .sidebar-overlay{animation:fadeIn .3s ease-out forwards;}
        .provider-card{transition:border-color .2s ease, box-shadow .2s ease;}
        .provider-card:hover{border-color:#0059B2 !important; box-shadow:0 8px 30px rgba(0,89,178,0.10);}
      `}</style>

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}/>
      )}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-surface transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeSection} onSectionChange={s => { setActiveSection(s); setIsSidebarOpen(false); }}/>
      </div>

      {/* TopBar */}
      <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen}/>

      {/* Sub-header */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border px-4 sm:px-8 py-4 sticky top-[73px] z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border text-gray-500 dark:text-dark-muted transition-colors"
            >
              <ChevronRight size={18} className="rotate-180"/>
            </button>
            <div>
              <p className="text-xs text-gray-400 dark:text-dark-muted font-medium">Résultats pour</p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-dark-text heading-font">
                {decodeURIComponent(serviceName || 'Service')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-[#0059B2] dark:text-blue-400 text-sm font-semibold px-4 py-2 rounded-full">
              <Search size={14}/>{filtered.length} prestataires
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text rounded-xl font-medium text-sm"
            >
              <SlidersHorizontal size={15}/>Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">

          {/* Filter sidebar — desktop */}
          <div className="hidden lg:block w-64 shrink-0 sticky top-36">
            <FilterPanel/>
          </div>

          {/* Mobile filters drawer */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)}/>
              <div className="relative ml-auto w-72 h-full bg-white dark:bg-dark-surface overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-gray-900 dark:text-dark-text">Filtres</p>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <FilterPanel/>
              </div>
            </div>
          )}

          {/* Provider cards */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-16 text-center border border-gray-100 dark:border-dark-border">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-bold text-gray-900 dark:text-dark-text mb-1">Aucun prestataire trouvé</p>
                <p className="text-sm text-gray-500 dark:text-dark-muted">Essayez de modifier vos filtres</p>
              </div>
            ) : filtered.map((p, i) => (
              <div
                key={p.id}
                className="provider-card bg-white dark:bg-dark-surface rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-dark-border shadow-sm card-in"
                style={{animationDelay:`${i * 0.06}s`}}
              >
                <div className="flex flex-col sm:flex-row gap-5">

                  {/* Avatar */}
                  <div className="relative shrink-0 self-start">
                    <img src={p.image} alt={p.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-gray-100 dark:border-dark-border"/>
                    {p.verified && (
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#0059B2] rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface">
                        <BadgeCheck size={13} color="#fff"/>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-dark-text">{p.name}</h3>
                      {p.badge && (
                        <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/30">
                          ★ {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Stars rating={p.rating}/>
                        <span className="text-sm font-bold text-gray-900 dark:text-dark-text">{p.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500 dark:text-dark-muted">({p.reviews} avis)</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted">
                        <MapPin size={11} className="text-[#0059B2]"/>{p.location}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed mb-3 line-clamp-2">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap gap-2 items-center">
                      {p.tags.map((tag, ti) => (
                        <span key={ti} className="bg-blue-50 dark:bg-blue-500/10 text-[#0059B2] dark:text-blue-400 text-xs font-medium px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-dark-muted">
                        <Users size={11}/>{p.hired} clients
                      </span>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <Zap size={11}/>{p.responseTime}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 sm:min-w-[140px]">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-dark-text">{p.priceLabel}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted">{p.priceNote}</p>
                    </div>
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none bg-gradient-to-r from-[#004a96] to-[#1A6FD1] hover:from-[#003d80] hover:to-[#1560b8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                        Contacter
                      </button>
                      <button
                        onClick={() => navigate(`/Service-Provider-Profile/${p.id}`)}
                        className="flex-1 sm:flex-none bg-white dark:bg-dark-bg border-2 border-[#0059B2] dark:border-blue-500 text-[#0059B2] dark:text-blue-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                        Voir profil
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

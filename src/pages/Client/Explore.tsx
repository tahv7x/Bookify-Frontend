import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';
import { Search, Filter, Star, MapPin, ChevronDown, Check, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['Tous', 'Santé & médical', 'Beauté & Bien-être', 'Services professionnels', 'Services techniques'];
const CITIES = ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'];

const normalizeCategory = (cat: string): string => {
  if (!cat) return 'Tous';
  // Enlever les accents et mettre en minuscules pour une comparaison robuste
  const c = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  if (c.includes('sante') || c.includes('medical')) return 'Santé & médical';
  if (c.includes('beaute') || c.includes('bien') || c.includes('etre') || c.includes('tre')) return 'Beauté & Bien-être';
  if (c.includes('professionnel') || c.includes('profesionnel') || c.includes('prof')) return 'Services professionnels';
  if (c.includes('technique')) return 'Services techniques';
  
  // Fallback exact match
  const exactMatch = CATEGORIES.find(x => x.toLowerCase() === cat.toLowerCase());
  if (exactMatch) return exactMatch;

  return 'Tous';
};

const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Navigation State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Client");

  useEffect(() => { 
    const s = localStorage.getItem('user'); 
    if (s) { 
      try { 
        const u = JSON.parse(s); 
        setUserName(u.nomComplet); 
      } catch (e) {} 
    } 
  }, []);
  // Filtres State
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'Tous';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);

  // Fetch Providers
  useEffect(() => {
    setIsLoading(true);
      api.get('/prestataires/all')
        .then(res => {
          setProviders(res.data.map((p: any) => ({
            id: p.id,
            name: p.nom,
            specialty: p.specialite || 'Spécialiste',
            location: p.location || 'Maroc',
            rating: p.rating || 0,
            reviews: Math.floor(Math.random() * 200), 
            img: p.avatar,
            available: p.availableToday,
            price: 'Sur devis',
            category: normalizeCategory(p.categorie)
          })));
        })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Mettre à jour l'URL quand la catégorie change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedCategory && selectedCategory !== 'Tous') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, setSearchParams]);

  // (Loading handled by API now)

  // Filtrage des résultats
  const filteredResults = providers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Tous' || p.category === selectedCategory; // Adjust logic if needed later
    const matchCity = selectedCity === 'Toutes' || p.location.includes(selectedCity);
    const matchRating = p.rating >= minRating;
    const matchAvailability = onlyAvailable ? p.available : true;

    return matchSearch && matchCategory && matchCity && matchRating && matchAvailability;
  });

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Catégories (Pills) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Catégorie</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedCategory === cat ? 'bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white shadow-md shadow-[#1A6FD1]/20' : 'bg-gray-100 dark:bg-[#1a1d27]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2d3148]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ville (Select) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ville</h3>
        <div className="relative group">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#1A6FD1] transition-colors duration-300" />
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full appearance-none bg-white/40 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 hover:border-[#1A6FD1]/50 dark:hover:border-[#1A6FD1]/50 text-gray-900 dark:text-white text-sm font-semibold rounded-3xl pl-12 pr-10 py-3.5 outline-none focus:border-[#1A6FD1] focus:ring-4 focus:ring-[#1A6FD1]/10 transition-all duration-300 cursor-pointer shadow-[0_4px_16px_rgba(31,38,135,0.05)] hover:shadow-[0_4px_16px_rgba(26,111,209,0.15)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
          >
            {CITIES.map(city => <option key={city} value={city} className="font-medium text-gray-900 dark:text-white bg-white dark:bg-[#0B0F19]">{city}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#1A6FD1] transition-colors duration-300" size={16} pointerEvents="none" />
        </div>
      </div>

      {/* Note globale (Interactive Stars) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Note Globale</h3>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setMinRating(star === minRating ? 0 : star)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${minRating >= star ? 'bg-amber-100 dark:bg-amber-500/20 shadow-inner' : 'bg-gray-50 dark:bg-[#1a1d27]/60 hover:bg-gray-100 dark:hover:bg-[#2d3148]'}`}
            >
              <Star size={18} className={minRating >= star ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-gray-600"} />
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {minRating > 0 ? `${minRating} étoiles et plus` : 'Toutes les notes'}
        </p>
      </div>

      {/* Disponibilité (Toggle Switch) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Disponibilité</h3>
        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1d27]/60 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2d3148] transition-colors border border-transparent hover:border-gray-200 dark:hover:border-[#2d3148]">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Disponible aujourd'hui</span>
          <input type="checkbox" className="hidden" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
          <div className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${onlyAvailable ? 'bg-[#1A6FD1]' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${onlyAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>
      </div>
    </div>
  );

  return (
    <div
      className="relative min-h-screen text-slate-900 dark:text-[#e2e8f0] font-sans selection:bg-blue-500/30 transition-colors duration-300"
      style={{ background: isDark ? '#0d1117' : '#eef2fc', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:wght@600;700&display=swap');
        .font-fraunces { font-family: 'Fraunces', serif; }

        .bg-dot-pattern {
          background-image: radial-gradient(${
            isDark ? 'rgba(255,255,255,0.022)' : 'rgba(26,111,209,0.06)'
          } 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .glass-card {
          background: ${
            isDark
              ? 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))'
              : 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,255,0.85))'
          };
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid ${ isDark ? 'rgba(255,255,255,0.09)' : 'rgba(200,215,255,0.6)' };
          box-shadow: ${
            isDark
              ? '0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 8px 48px rgba(30,60,180,0.08), inset 0 1px 0 rgba(255,255,255,1)'
          };
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-3px);
          box-shadow: ${
            isDark
              ? '0 14px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 14px 60px rgba(26,111,209,0.15), inset 0 1px 0 rgba(255,255,255,1)'
          };
          border-color: ${ isDark ? 'rgba(26,111,209,0.35)' : 'rgba(26,111,209,0.3)' };
        }

        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg,
            ${ isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,215,255,0.35)'} 25%,
            ${ isDark ? 'rgba(255,255,255,0.09)' : 'rgba(220,232,255,0.65)'} 50%,
            ${ isDark ? 'rgba(255,255,255,0.05)' : 'rgba(200,215,255,0.35)'} 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.5s infinite linear;
          border-radius: 12px;
        }
      `}</style>
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* Main Navigation Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 ease-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>        
        <Navbar activeSection="explore" onSectionChange={() => setIsSidebarOpen(false)} />
      </div>

      <main className="min-h-screen relative bg-dot-pattern pb-20 md:pb-0 transition-all duration-300">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        {/* HERO SEARCH HEADER */}
        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/20 dark:border-[#151B2B] pt-10 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold font-fraunces text-gray-900 dark:text-white mb-6 tracking-tight">Trouvez le prestataire idéal.</h1>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Que cherchez-vous ? (ex: Dentiste, Plombier...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-[0_4px_16px_rgba(31,38,135,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] text-gray-900 dark:text-white rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#1A6FD1] focus:ring-4 focus:ring-[#1A6FD1]/10 transition-all"
                />
              </div>
              <button 
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden flex items-center justify-center bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/60 dark:border-white/10 shadow-[0_4px_16px_rgba(31,38,135,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.2)] text-gray-700 dark:text-white rounded-2xl w-14"
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
          
          {/* DESKTOP FILTERS SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-8">
                <Filter size={18} className="text-[#1A6FD1]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-fraunces">Filtres</h2>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* RESULTS GRID */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-700 dark:text-gray-300 font-medium">
                <span className="font-bold text-gray-900 dark:text-white text-lg">{filteredResults.length}</span> prestataires trouvés
              </h2>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="glass-card rounded-3xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-[#2d3148] rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-[#2d3148] rounded w-3/4" />
                        <div className="h-4 bg-gray-200 dark:bg-[#2d3148] rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-[#2d3148] rounded w-1/3 mb-4" />
                    <div className="h-10 bg-gray-200 dark:bg-[#2d3148] rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {filteredResults.map(provider => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={provider.id} 
                    className="glass-card rounded-3xl p-6 flex flex-col hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1A6FD1]/5 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/Service-Provider-Profile/${provider.id}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      {provider.img ? (
                        <img src={provider.img} alt={provider.name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-[#1a1d27] shadow-sm bg-white" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-xl border-2 border-white dark:border-[#1a1d27] shadow-sm">
                          {provider.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <Star size={12} className="fill-current" /> {provider.rating}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1">({provider.reviews} avis)</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#1A6FD1] transition-colors">{provider.name}</h3>
                    <p className="text-sm text-[#1A6FD1] font-semibold mb-3">{provider.specialty}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-5">
                      <MapPin size={14} /> {provider.location}
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-1" />
                      {provider.price}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2d3148]">
                      {provider.available ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Dispo. aujourd'hui
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <span className="w-2 h-2 rounded-full bg-gray-300" /> Dispo. demain
                        </div>
                      )}
                      <button className="bg-gray-100 dark:bg-[#2d3148] hover:bg-[#1A6FD1] hover:text-white text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                        Voir profil
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a1d27] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun résultat</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">Essayez de modifier vos filtres ou de chercher avec d'autres mots-clés.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Tous'); setSelectedCity('Toutes'); setMinRating(0); setOnlyAvailable(false); }}
                  className="mt-6 text-[#1A6FD1] font-semibold text-sm hover:underline"
                >
                  Effacer tous les filtres
                </button>
              </div>
            )}
          </div>
        </div>

        <Footer />
        <MobileBottomNav />
      </main>

      {/* MOBILE FILTERS DRAWER */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#1a1d27] rounded-t-3xl z-[70] max-h-[85vh] overflow-y-auto pb-safe lg:hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold font-fraunces text-gray-900 dark:text-white">Filtres</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 dark:bg-[#2d3148] rounded-full text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                <FilterContent />
                
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full mt-8 bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white font-bold py-4 rounded-2xl shadow-lg"
                >
                  Afficher les résultats
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Explore;

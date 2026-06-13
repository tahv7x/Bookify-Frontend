import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';
import { MapPin, ChevronDown, Check, SlidersHorizontal, X, Map as MapIcon, Layers, Star, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = ['Tous', 'Santé & médical', 'Beauté & Bien-être', 'Services professionnels', 'Services techniques'];
const CITIES = ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Salé', 'Meknès', 'Oujda'];

const CITY_COORDINATES: Record<string, [number, number]> = {
  'Casablanca': [33.5731, -7.5898],
  'Rabat': [34.0209, -6.8416],
  'Marrakech': [31.6295, -7.9811],
  'Tanger': [35.7595, -5.8340],
  'Fès': [34.0331, -5.0003],
  'Agadir': [30.4278, -9.5981],
  'Salé': [34.0389, -6.8166],
  'Meknès': [33.8935, -5.5547],
  'Oujda': [34.6814, -1.9086]
};
const DEFAULT_CENTER: [number, number] = [33.5731, -7.5898];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

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
  const [userName] = useState(() => {
    const s = localStorage.getItem('user');
    if (s) {
      try {
        const u = JSON.parse(s);
        return u.nomComplet || 'Client';
      } catch { /* ignore */ }
    }
    return 'Client';
  });
  // Filtres State
  const initialMode = (searchParams.get('mode') as 'service' | 'provider') || 'service';
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'Tous';
  const initialEnLocal = searchParams.get('enLocal') === 'true';
  const initialADomicile = searchParams.get('aDomicile') === 'true';
  
  const [searchMode, setSearchMode] = useState<'service' | 'provider'>(initialMode);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState('Toutes');
  const [minRating, setMinRating] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [filterEnLocal, setFilterEnLocal] = useState(initialEnLocal);
  const [filterADomicile, setFilterADomicile] = useState(initialADomicile);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);

  // Synchroniser l'état local quand les paramètres de l'URL changent (ex: depuis la TopBar)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const mode = (searchParams.get('mode') as 'service' | 'provider') || 'service';
    const cat = searchParams.get('category') || 'Tous';
    const enLocal = searchParams.get('enLocal') === 'true';
    const aDomicile = searchParams.get('aDomicile') === 'true';

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync URL params to local state
    setSearchQuery(prev => q !== prev ? q : prev);
    setSearchMode(prev => mode !== prev ? mode : prev);
    setSelectedCategory(prev => cat !== prev ? cat : prev);
    setFilterEnLocal(prev => enLocal !== prev ? enLocal : prev);
    setFilterADomicile(prev => aDomicile !== prev ? aDomicile : prev);
  }, [searchParams]);

  // Fetch Results Server-Side Search
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading state reset before async fetch
    setIsLoading(true);
    setProviders([]);
    const params: any = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedCategory && selectedCategory !== 'Tous') params.category = selectedCategory;
    if (selectedCity && selectedCity !== 'Toutes') params.city = selectedCity;
    if (minRating > 0) params.minRating = minRating;

    const endpoint = searchMode === 'service' ? '/services/explore' : '/prestataires/all';

    api.get(endpoint, { params })
      .then(res => {
        setProviders(res.data.map((item: any) => {
          const locationStr = searchMode === 'service' ? item.prestataire?.adresse : item.location;
          let cityMatch = CITIES.find(c => locationStr?.toLowerCase().includes(c.toLowerCase()));
          if (!cityMatch || cityMatch === 'Toutes') cityMatch = 'Casablanca';
          const baseCoord = CITY_COORDINATES[cityMatch] || DEFAULT_CENTER;
          
          let lat, lng;
          if (searchMode === 'service') {
            lat = item.prestataire?.latitude ?? (baseCoord[0] + (Math.random() - 0.5) * 0.05);
            lng = item.prestataire?.longitude ?? (baseCoord[1] + (Math.random() - 0.5) * 0.05);
            
            return {
              isService: true,
              id: item.idService,
              name: item.nom,
              price: item.prix,
              duration: item.duree + ' ' + item.uniteDuree,
              images: item.imageUrls ? item.imageUrls.split(',').filter(Boolean) : [],
              providerId: item.prestataire.id,
              providerName: item.prestataire.nom,
              rating: item.prestataire.note || 4.5,
              reviews: Math.floor(Math.random() * 200),
              img: item.prestataire.avatar,
              location: locationStr || 'Maroc',
              enLocal: item.prestataire.enLocal,
              aDomicile: item.prestataire.aDomicile,
              lat, lng
            };
          } else {
            lat = item.latitude ?? (baseCoord[0] + (Math.random() - 0.5) * 0.05);
            lng = item.longitude ?? (baseCoord[1] + (Math.random() - 0.5) * 0.05);
            
            return {
              isService: false,
              id: item.id,
              name: item.nom,
              specialty: item.specialite || 'Spécialiste',
              location: item.location || 'Maroc',
              rating: item.rating || 4.5,
              reviews: Math.floor(Math.random() * 200), 
              img: item.avatar,
              available: item.availableToday,
              price: 'Sur devis',
              category: normalizeCategory(item.categorie),
              lat, lng,
              enLocal: item.enLocal,
              aDomicile: item.aDomicile
            };
          }
        }));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedCategory, selectedCity, minRating, searchMode]);

  // L'URL est gérée par le TopBar, on a supprimé la synchronisation inverse pour éviter la boucle infinie.

  // (Loading handled by API now)

  // Filtrage des résultats - Local filters (others handled by server)
  const filteredResults = providers.filter(p => {
    const matchAvailability = onlyAvailable ? p.available : true;
    
    // Si aucun filtre de lieu n'est activé, on montre tout
    const matchLieu = (!filterEnLocal && !filterADomicile) ||
                      (filterEnLocal && p.enLocal) ||
                      (filterADomicile && p.aDomicile);

    return matchAvailability && matchLieu;
  });

  const filterContent = (
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

      {/* Lieu (Pills) */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Lieu de la prestation</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilterEnLocal(!filterEnLocal)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${filterEnLocal ? 'bg-gradient-to-br from-blue-500 to-[#1A6FD1] text-white shadow-md shadow-[#1A6FD1]/20' : 'bg-gray-100 dark:bg-[#1a1d27]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2d3148]'}`}
          >
            🏢 Sur place
          </button>
          <button 
            onClick={() => setFilterADomicile(!filterADomicile)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${filterADomicile ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20' : 'bg-gray-100 dark:bg-[#1a1d27]/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2d3148]'}`}
          >
            🏠 À domicile
          </button>
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

        /* LEAFLET POPUP OVERRIDES */
        .leaflet-popup-content-wrapper {
          background: ${isDark ? 'rgba(11, 15, 25, 0.75)' : 'rgba(255, 255, 255, 0.75)'} !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          color: ${isDark ? '#ffffff' : '#111827'} !important;
          border-radius: 20px !important;
          box-shadow: 0 10px 30px -5px rgba(0,0,0,0.15) !important;
          padding: 0 !important;
          overflow: hidden;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 250px !important;
        }
        .leaflet-popup-tip {
          background: ${isDark ? 'rgba(11, 15, 25, 0.85)' : 'rgba(255, 255, 255, 0.85)'} !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
          border-left: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'} !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: ${isDark ? '#9ca3af' : '#6b7280'} !important;
          padding: 8px 8px 0 0 !important;
          width: 24px !important;
          height: 24px !important;
          z-index: 10;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: ${isDark ? '#ffffff' : '#111827'} !important;
          background: transparent !important;
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
        <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/20 dark:border-[#151B2B] pt-10 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-3xl font-bold font-fraunces text-gray-900 dark:text-white mb-6 tracking-tight">Trouvez le prestataire idéal.</h1>
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder={searchMode === 'service' ? "Quel service cherchez-vous ? (ex: Installation caméra...)" : "Qui cherchez-vous ? (ex: Dentiste, Plombier...)"}
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
            
            <div className="flex items-center gap-4">
               <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                 <button onClick={() => setSearchMode('service')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${searchMode === 'service' ? 'bg-white dark:bg-[#1A6FD1] text-[#1A6FD1] dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Par Service</button>
                 <button onClick={() => setSearchMode('provider')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${searchMode === 'provider' ? 'bg-white dark:bg-[#1A6FD1] text-[#1A6FD1] dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>Par Prestataire</button>
               </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* DESKTOP FILTERS SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-8">
                <Filter size={18} className="text-[#1A6FD1]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-fraunces">Filtres</h2>
              </div>
              {filterContent}
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
                {filteredResults.map(provider => provider.isService ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`srv-${provider.id}`} 
                    className="glass-card rounded-3xl p-5 flex flex-col hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1A6FD1]/5 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/service/${provider.id}/book`)}
                  >
                    <div className="flex gap-4 mb-3">
                      {provider.images && provider.images.length > 0 ? (
                        <img src={provider.images[0]} alt={provider.name} className="w-24 h-24 rounded-2xl object-cover border border-white/10" />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#004a96] to-[#1A6FD1] flex items-center justify-center text-white font-bold text-3xl opacity-80">
                          {provider.name?.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#1A6FD1] transition-colors leading-tight mb-1">{provider.name}</h3>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Durée: {provider.duration}</div>
                        </div>
                        <div className="text-xl font-extrabold text-[#1A6FD1]">{provider.price} MAD</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      {provider.enLocal && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] rounded-md font-medium border border-blue-200 dark:border-blue-800/50">
                          🏢 En Local
                        </span>
                      )}
                      {provider.aDomicile && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] rounded-md font-medium border border-purple-200 dark:border-purple-800/50">
                          🚗 À Domicile
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#2d3148] flex justify-between items-center">
                      <div className="flex items-center gap-2" onClick={(e) => { e.stopPropagation(); navigate(`/Service-Provider-Profile/${provider.providerId}`); }}>
                        {provider.img ? (
                          <img src={provider.img} alt={provider.providerName} className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">{provider.providerName?.charAt(0)}</div>
                        )}
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white hover:underline">{provider.providerName}</div>
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold"><Star size={10} className="fill-current"/> {provider.rating}</div>
                        </div>
                      </div>
                      <button className="bg-gradient-to-r from-[#004a96] to-[#1A6FD1] hover:scale-105 text-white px-4 py-2 rounded-xl text-xs font-bold transition-transform shadow-md">
                        Réserver
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`prv-${provider.id}`} 
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
                      {provider.enLocal && (
                        <>
                          <MapPin size={14} /> {provider.location}
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mx-1" />
                        </>
                      )}
                      {provider.price}
                    </div>

                    <div className="flex gap-2 mb-4">
                      {provider.enLocal && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] rounded-md font-medium border border-blue-200 dark:border-blue-800/50">
                          🏢 En Local
                        </span>
                      )}
                      {provider.aDomicile && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] rounded-md font-medium border border-purple-200 dark:border-purple-800/50">
                          🚗 À Domicile
                        </span>
                      )}
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

          {/* MAP CONTAINER */}
          <aside className="hidden xl:block w-[400px] 2xl:w-[500px] flex-shrink-0">
            <div className="sticky top-32 h-[calc(100vh-140px)] rounded-3xl overflow-hidden glass-card border border-white/20 dark:border-white/5 shadow-xl relative z-10">
              <MapContainer 
                center={selectedCity && selectedCity !== 'Toutes' && CITY_COORDINATES[selectedCity] ? CITY_COORDINATES[selectedCity] : DEFAULT_CENTER} 
                zoom={12} 
                className="h-full w-full"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url={isDark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  }
                />
                <MapUpdater center={selectedCity && selectedCity !== 'Toutes' && CITY_COORDINATES[selectedCity] ? CITY_COORDINATES[selectedCity] : DEFAULT_CENTER} />
                
                {filteredResults.filter(provider => provider.enLocal).map(provider => (
                  <Marker key={provider.id} position={[provider.lat, provider.lng]}>
                    <Popup className="custom-popup" closeButton={false}>
                      <div className="flex flex-col p-4 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(200,215,255,0.5)'}` }}>
                            {provider.img ? (
                              <img src={provider.img} alt={provider.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-[#004a96] to-[#1A6FD1] text-white flex items-center justify-center font-bold text-lg">
                                {provider.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                              style={{
                                background: isDark ? 'rgba(26,111,209,0.14)' : 'rgba(26,111,209,0.08)',
                                color: isDark ? '#60a5fa' : '#1a6fd1',
                                border: `1px solid ${isDark ? 'rgba(26,111,209,0.3)' : 'rgba(26,111,209,0.18)'}`,
                              }}>
                              {provider.specialty}
                            </span>
                            <h4 className="font-fraunces font-bold text-sm mt-1 truncate" style={{ color: isDark ? '#f1f5f9' : '#1a2540' }}>
                              {provider.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={10} className="text-amber-400 fill-amber-400" />
                              <span className="text-[10px] font-bold" style={{ color: isDark ? '#f1f5f9' : '#1a2540' }}>
                                {provider.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => navigate(`/Service-Provider-Profile/${provider.id}`)}
                          className="bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white px-3 py-2 rounded-xl font-semibold text-[11px] w-full transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                        >
                          Voir profil
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </aside>
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
                {filterContent}
                
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
      <MobileBottomNav/>
    </div>
  );
};

export default Explore;

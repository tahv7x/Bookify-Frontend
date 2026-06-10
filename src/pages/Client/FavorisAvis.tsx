import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, MapPin, Calendar, Clock, Edit2, Trash2, 
  Search, SlidersHorizontal, ArrowUpRight, Check, X, 
  MessageSquare, User, Sparkles, Smile, ShieldCheck, HeartOff,
  UserCheck, ThumbsUp, AlertCircle
} from 'lucide-react';
import { useTheme } from "../../context/ThemeContext";
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Client/Navbar';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import MobileBottomNav from '../../components/Client/MobileBottomNav';

// Define Interfaces
interface Professional {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  location: string;
  image: string;
  city: string;
  availability: string;
}

interface Review {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerImage: string;
  date: string;
  rating: number;
  text: string;
  aspects?: {
    welcome: number;
    cleanliness: number;
    quality: number;
    value: number;
  };
}

// Initial Mock Data
const INITIAL_FAVORITES: Professional[] = [
  {
    id: '1',
    name: 'Dr. Leila Bensouda',
    specialty: 'Dermatologue',
    rating: 4.9,
    reviewsCount: 128,
    location: 'Casablanca, Gauthier',
    city: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300&h=300',
    availability: 'Disponible demain'
  },
  {
    id: '2',
    name: 'Yassine Barber & Spa',
    specialty: 'Salon de coiffure & Soins',
    rating: 4.8,
    reviewsCount: 92,
    location: 'Rabat, Agdal',
    city: 'Rabat',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300&h=300',
    availability: 'Disponible jeudi'
  },
  {
    id: '3',
    name: 'Dr. Amine Lahlou',
    specialty: 'Chirurgien Dentiste',
    rating: 4.95,
    reviewsCount: 210,
    location: 'Marrakech, Guéliz',
    city: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
    availability: 'Disponible aujourd\'hui'
  },
  {
    id: '4',
    name: 'Maison de Beauté',
    specialty: 'Esthétique & Massage',
    rating: 4.7,
    reviewsCount: 75,
    location: 'Casablanca, Maarif',
    city: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=300&h=300',
    availability: 'Disponible vendredi'
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    providerId: '3',
    providerName: 'Dr. Amine Lahlou',
    providerSpecialty: 'Chirurgien Dentiste',
    providerImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
    date: '08 Juin 2026',
    rating: 5,
    text: 'Cabinet ultra-moderne et dentiste d\'une grande gentillesse. Il prend vraiment le temps d\'expliquer chaque étape. Le soin s\'est déroulé sans aucune douleur. Je recommande vivement les yeux fermés !',
    aspects: { welcome: 5, cleanliness: 5, quality: 5, value: 5 }
  },
  {
    id: 'rev-2',
    providerId: '2',
    providerName: 'Yassine Barber & Spa',
    providerSpecialty: 'Salon de coiffure & Soins',
    providerImage: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=300&h=300',
    date: '25 Mai 2026',
    rating: 4,
    text: 'Très satisfait de ma coupe de cheveux et du soin du visage. L\'équipe est super accueillante et le salon est magnifiquement décoré. Seul petit bémol : 15 minutes d\'attente malgré mon rendez-vous pris à l\'avance.',
    aspects: { welcome: 4, cleanliness: 5, quality: 5, value: 4 }
  },
  {
    id: 'rev-3',
    providerId: '1',
    providerName: 'Dr. Leila Bensouda',
    providerSpecialty: 'Dermatologue',
    providerImage: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300&h=300',
    date: '12 Mai 2026',
    rating: 5,
    text: 'Excellente consultation. Docteur très à l\'écoute, douce et pédagogue. L\'ordonnance proposée a été d\'une redoutable efficacité dès les premiers jours. Secrétariat agréable également.',
    aspects: { welcome: 5, cleanliness: 5, quality: 5, value: 4 }
  }
];

const FavorisAvis: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Set tab based on current path
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews'>(() => {
    return location.pathname === '/Avis' ? 'reviews' : 'favorites';
  });

  // Keep state in sync if path changes (e.g. clicking sidebar menu items)
  useEffect(() => {
    if (location.pathname === '/Avis') {
      setActiveTab('reviews');
    } else if (location.pathname === '/Favoris') {
      setActiveTab('favorites');
    }
  }, [location.pathname]);

  // Helper to change tab and URL path
  const handleTabChange = (tab: 'favorites' | 'reviews') => {
    setActiveTab(tab);
    setSearchTerm('');
    navigate(tab === 'favorites' ? '/Favoris' : '/Avis');
  };
  
  // Local states with fallback data
  const [favorites, setFavorites] = useState<Professional[]>(INITIAL_FAVORITES);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interaction modals states
  const [bookingProfessional, setBookingProfessional] = useState<Professional | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingRating, setEditingRating] = useState(5);
  const [editingAspects, setEditingAspects] = useState({ welcome: 5, cleanliness: 5, quality: 5, value: 5 });

  // Undo removal from favorites
  const [lastRemovedFav, setLastRemovedFav] = useState<Professional | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('user');
    if (s) {
      const u = JSON.parse(s);
      setUserName(u.nomComplet || u.nom || 'Utilisateur');
    }
  }, []);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const { getMyFavorites } = await import('../../services/Client/favorisService');
        const data = await getMyFavorites();
        if (data) {
          const mappedFavs = data.map((f: any) => ({
            id: f.id.toString(),
            name: f.nom,
            specialty: f.specialite || 'Spécialité non spécifiée',
            rating: f.rating || 0,
            reviewsCount: 0,
            location: f.location || 'Adresse non spécifiée',
            city: f.location ? f.location.split(',')[0] : 'Ville',
            image: f.avatar ? f.avatar : 'https://ui-avatars.com/api/?name=' + f.nom,
            availability: f.availableToday ? "Disponible aujourd'hui" : "Non disponible",
          }));
          setFavorites(mappedFavs);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des favoris", err);
      }
    };
    if (activeTab === 'favorites') {
      fetchFavs();
    }
  }, [activeTab]);

  // Filter professionals and reviews
  const filteredFavorites = favorites.filter(fav => 
    fav.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    fav.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fav.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(rev => 
    rev.providerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rev.providerSpecialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle favorite / Remove
  const handleRemoveFavorite = async (prof: Professional) => {
    try {
      const { toggleFavori } = await import('../../services/Client/favorisService');
      await toggleFavori(Number(prof.id));
      setLastRemovedFav(prof);
      setFavorites(prev => prev.filter(f => f.id !== prof.id));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch(e) {
      console.error("Error toggling favorite", e);
    }
  };

  const handleUndoRemove = async () => {
    if (lastRemovedFav) {
      try {
        const { toggleFavori } = await import('../../services/Client/favorisService');
        await toggleFavori(Number(lastRemovedFav.id));
        setFavorites(prev => [...prev, lastRemovedFav]);
        setLastRemovedFav(null);
        setShowToast(false);
      } catch(e) {
        console.error("Error undoing toggle", e);
      }
    }
  };

  // Handle Edit Review
  const handleOpenEditReview = (review: Review) => {
    setEditingReview(review);
    setEditingText(review.text);
    setEditingRating(review.rating);
    setEditingAspects(review.aspects || { welcome: 5, cleanliness: 5, quality: 5, value: 5 });
  };

  const handleSaveReview = () => {
    if (!editingReview) return;
    setReviews(prev => prev.map(rev => {
      if (rev.id === editingReview.id) {
        return {
          ...rev,
          text: editingText,
          rating: editingRating,
          aspects: editingAspects,
          date: 'Modifié aujourd\'hui'
        };
      }
      return rev;
    }));
    setEditingReview(null);
  };

  // Booking handlers
  const handleOpenBooking = (prof: Professional) => {
    setBookingProfessional(prof);
    setSelectedService('');
    setSelectedDate('');
    setSelectedTimeSlot('');
    setIsBookingSuccess(false);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingSuccess(true);
    setTimeout(() => {
      setBookingProfessional(null);
      setIsBookingSuccess(false);
    }, 2500);
  };

  // Framer motion animations config
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 320, damping: 26 } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] transition-colors duration-200 overflow-x-hidden">
      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(26,111,209,0.06) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
          transition: all 0.3s ease;
        }
        .dark .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px -12px rgba(26, 111, 209, 0.2);
          border-color: rgba(26, 111, 209, 0.3);
        }
        .dark .glass-card:hover {
          box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.4);
        }

        .premium-shadow {
          box-shadow: 0 10px 30px -10px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(26, 111, 209, 0.05)'};
        }
        
        .text-brand-gradient {
          background: linear-gradient(to right, #1A6FD1, #475569, #0c5a7c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .dark .text-brand-gradient {
          background: linear-gradient(to right, #3b82f6, #94a3b8, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

      `}</style>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#0B0F19]/60 backdrop-blur-md z-40" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      {/* Sidebar Drawer */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-transparent transform transition-transform duration-300 z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection={activeTab === 'favorites' ? 'favoris' : 'avis'} onSectionChange={() => setIsSidebarOpen(false)} />
      </div>

      <main className="min-h-screen relative bg-dot-pattern pb-20 md:pb-0">
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-fraunces text-gray-900 dark:text-white tracking-tight mb-2">
                Mes Favoris & Avis
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gérez vos professionnels favoris et consultez l'historique des avis que vous avez rédigés.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'favorites' ? "Rechercher un favori..." : "Rechercher un avis..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200/80 dark:border-[#2d3148] bg-white/50 dark:bg-[#1a1d27]/40 focus:outline-none focus:ring-2 focus:ring-[#1A6FD1]/50 text-sm transition-all dark:text-white"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Stats overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-5 premium-shadow flex items-center justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-red-500 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                <Heart size={100} fill="currentColor" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <Heart className="text-red-500 fill-red-500/10" size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white font-fraunces">
                    {favorites.length}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Favoris enregistrés</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 premium-shadow flex items-center justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-[#1A6FD1] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <MessageSquare size={100} fill="currentColor" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="text-[#1A6FD1] dark:text-blue-400" size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white font-fraunces">
                    {reviews.length}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Avis publiés</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 premium-shadow flex items-center justify-between overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 group-hover:scale-110 transition-all duration-500">
                <Star size={100} fill="currentColor" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Star className="text-amber-500 fill-amber-500" size={24} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white font-fraunces">
                    4.9
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400"> / 5.0</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Note moyenne donnée</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tab Panel */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2d3148] mb-8 pb-px">
            <div className="flex space-x-6 relative">
              <button 
                onClick={() => handleTabChange('favorites')}
                className={`pb-4 text-sm font-semibold relative transition-all duration-300 ${
                  activeTab === 'favorites' 
                    ? 'text-[#1A6FD1] dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Professionnels Favoris
                {activeTab === 'favorites' && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A6FD1] dark:bg-blue-400 rounded-full shadow-[0_0_8px_#1A6FD1]"
                  />
                )}
              </button>

              <button 
                onClick={() => handleTabChange('reviews')}
                className={`pb-4 text-sm font-semibold relative transition-all duration-300 ${
                  activeTab === 'reviews' 
                    ? 'text-[#1A6FD1] dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                Mes Avis Rédigés
                {activeTab === 'reviews' && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A6FD1] dark:bg-blue-400 rounded-full shadow-[0_0_8px_#1A6FD1]"
                  />
                )}
              </button>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Données chiffrées & sécurisées</span>
            </div>
          </div>

          {/* Tab Content Rendering */}
          <AnimatePresence mode="wait">
            {activeTab === 'favorites' ? (
              <motion.div
                key="favorites-tab"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredFavorites.map(prof => (
                      <motion.div 
                        key={prof.id}
                        variants={itemVariants}
                        layout
                        className="glass-card rounded-3xl p-6 premium-shadow flex flex-col sm:flex-row justify-between gap-5 relative group/card hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-white/50 dark:border-[#2d3148]/50 shadow-inner">
                            <img src={prof.image} alt={prof.name} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[#1A6FD1] dark:text-blue-400 font-semibold uppercase tracking-wider">
                                {prof.specialty}
                              </span>
                            </div>
                            <h3 className="font-fraunces font-bold text-lg mt-1 text-gray-900 dark:text-white">
                              {prof.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex text-amber-400">
                                <Star size={14} fill="currentColor" />
                              </div>
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                {prof.rating}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({prof.reviewsCount} avis)
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                              <MapPin size={13} className="text-gray-400" />
                              <span>{prof.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-end gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
                          {/* Heart icon - Clickable to unfavorite */}
                          <button 
                            onClick={() => handleRemoveFavorite(prof)}
                            className="p-2.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors cursor-pointer self-start sm:self-auto"
                            title="Retirer des favoris"
                          >
                            <Heart size={18} fill="currentColor" className="transform scale-100 active:scale-90 transition-transform" />
                          </button>

                          <div className="w-full sm:w-auto text-right">
                            <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                              {prof.availability}
                            </span>
                            <button 
                              onClick={() => handleOpenBooking(prof)}
                              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white text-xs font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                            >
                              Réserver à nouveau
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto mt-6"
                  >
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <HeartOff className="text-red-500" size={28} />
                    </div>
                    <h3 className="text-lg font-bold font-fraunces text-gray-900 dark:text-white">Aucun favori trouvé</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {searchTerm 
                        ? "Aucun professionnel ne correspond à votre recherche. Essayez d'autres mots-clés." 
                        : "Vous n'avez pas encore ajouté de professionnels à vos favoris. Cliquez sur le cœur lors de votre recherche pour en enregistrer !"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="reviews-tab"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {filteredReviews.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {filteredReviews.map(rev => (
                      <motion.div 
                        key={rev.id}
                        variants={itemVariants}
                        layout
                        className="glass-card rounded-3xl p-6 premium-shadow flex flex-col md:flex-row justify-between gap-6"
                      >
                        {/* Review Main Body */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3.5 mb-4">
                            <img src={rev.providerImage} alt={rev.providerName} className="w-11 h-11 rounded-full object-cover border border-white dark:border-[#2d3148]" />
                            <div>
                              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{rev.providerName}</h3>
                              <p className="text-xs text-gray-400 font-medium">{rev.providerSpecialty} · Consulté le {rev.date}</p>
                            </div>
                          </div>

                          {/* Star Component */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((starValue) => (
                                <Star 
                                  key={starValue} 
                                  size={15} 
                                  className={starValue <= rev.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-gray-700"} 
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {rev.rating}/5
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-normal italic">
                            "{rev.text}"
                          </p>

                          {/* Sub Aspects Ratings Details */}
                          {rev.aspects && (
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2d3148]/50 grid grid-cols-2 sm:grid-cols-4 gap-4">
                              <div>
                                <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider">Accueil</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{rev.aspects.welcome}</span>
                                  <div className="h-1.5 w-12 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(rev.aspects.welcome/5)*100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider">Propreté</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{rev.aspects.cleanliness}</span>
                                  <div className="h-1.5 w-12 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(rev.aspects.cleanliness/5)*100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider">Qualité</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{rev.aspects.quality}</span>
                                  <div className="h-1.5 w-12 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(rev.aspects.quality/5)*100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className="block text-[10px] text-gray-400 font-medium uppercase tracking-wider">Rapport Q/P</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{rev.aspects.value}</span>
                                  <div className="h-1.5 w-12 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(rev.aspects.value/5)*100}%` }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Review Action Panel */}
                        <div className="flex md:flex-col justify-end items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-0 border-gray-100 dark:border-[#2d3148]/50">
                          <button 
                            onClick={() => handleOpenEditReview(rev)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#1A6FD1] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                          >
                            <Edit2 size={13} />
                            <span>Modifier</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto mt-6"
                  >
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="text-[#1A6FD1] dark:text-blue-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold font-fraunces text-gray-900 dark:text-white">Aucun avis trouvé</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                      {searchTerm 
                        ? "Aucun avis ne correspond à votre recherche. Essayez d'autres termes." 
                        : "Vous n'avez pas encore laissé d'avis sur l'application Bookify. Vos avis s'afficheront ici après vos rendez-vous terminés !"}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />
        <MobileBottomNav />
      </main>

      {/* Floating toast notification for heart toggle undo */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900/95 dark:bg-[#1a1d27]/95 border border-white/10 text-white px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md"
          >
            <AlertCircle size={18} className="text-red-400" />
            <span className="text-sm font-medium">Favori retiré.</span>
            <button 
              onClick={handleUndoRemove} 
              className="text-sm font-bold text-blue-400 hover:text-blue-300 ml-2 transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GORGEOUS MODAL: Booking Selector Mockup */}
      <AnimatePresence>
        {bookingProfessional && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="w-full max-w-lg bg-white dark:bg-[#151B2B] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2d3148] overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gradient-to-br from-[#1A6FD1]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <img src={bookingProfessional.image} alt={bookingProfessional.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{bookingProfessional.name}</h3>
                    <p className="text-xs text-gray-400">{bookingProfessional.specialty} · {bookingProfessional.city}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setBookingProfessional(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirmBooking} className="p-6 space-y-5">
                {isBookingSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10"
                  >
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mb-4 text-emerald-500 shadow-lg shadow-emerald-500/20">
                      <Check size={36} strokeWidth={3} className="animate-pulse" />
                    </div>
                    <h4 className="text-lg font-bold font-fraunces text-gray-900 dark:text-white">Réservation confirmée !</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 max-w-xs leading-relaxed">
                      Votre rendez-vous a été planifié avec succès. Vous recevrez un SMS et un e-mail de confirmation.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Service Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Choisir une prestation</label>
                      <select 
                        required
                        value={selectedService}
                        onChange={e => setSelectedService(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-[#2d3148] bg-gray-50 dark:bg-[#0f1117] text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:outline-none text-gray-900 dark:text-white"
                      >
                        <option value="">Sélectionner une prestation</option>
                        <option value="consultation">Consultation classique (300 MAD)</option>
                        <option value="controle">Contrôle / Suivi (150 MAD)</option>
                        <option value="urgences">Prestation complète premium (500 MAD)</option>
                      </select>
                    </div>

                    {/* Date Picker Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sélectionner une date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="date" 
                          required
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-[#2d3148] bg-gray-50 dark:bg-[#0f1117] text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:outline-none text-gray-900 dark:text-white cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Time Slots Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Créneaux horaires disponibles</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['09:00', '10:30', '14:00', '15:30', '16:00', '17:30'].map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                              selectedTimeSlot === slot
                                ? 'bg-gradient-to-tr from-[#1A6FD1] to-[#0c5a7c] border-transparent text-white shadow-md'
                                : 'bg-gray-50 hover:bg-gray-100 dark:bg-[#0f1117] dark:hover:bg-gray-800 border-gray-200 dark:border-[#2d3148] text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setBookingProfessional(null)}
                        className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        disabled={!selectedService || !selectedDate || !selectedTimeSlot}
                        className="flex-1 py-3 bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white text-sm font-semibold rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Confirmer le rendez-vous
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GORGEOUS MODAL: Edit Review Dialog */}
      <AnimatePresence>
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-[#151B2B] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2d3148] overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Modifier mon avis</h3>
                  <p className="text-xs text-gray-400">Pour {editingReview.providerName}</p>
                </div>
                <button 
                  onClick={() => setEditingReview(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Edit Body */}
              <div className="p-6 space-y-5 custom-scrollbar max-h-[75vh] overflow-y-auto">
                
                {/* Main Star Rating Selector */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Note globale</label>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        onClick={() => setEditingRating(v)}
                        className="text-2xl transition-transform active:scale-95 duration-100"
                      >
                        <Star 
                          size={28} 
                          className={v <= editingRating ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.2)]" : "text-gray-200 dark:text-gray-700"} 
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3">
                      {editingRating} sur 5
                    </span>
                  </div>
                </div>

                {/* Sub Aspects Details Selectors */}
                <div className="space-y-3 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Évaluation détaillée</h4>
                  
                  {/* Aspect Welcome */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Qualité de l'accueil</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button 
                          key={v}
                          onClick={() => setEditingAspects(prev => ({...prev, welcome: v}))}
                          className={`w-7 h-7 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
                            editingAspects.welcome === v
                              ? 'bg-emerald-500 border-transparent text-white'
                              : 'bg-gray-50 dark:bg-[#0f1117] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Cleanliness */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Propreté & Hygiène</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button 
                          key={v}
                          onClick={() => setEditingAspects(prev => ({...prev, cleanliness: v}))}
                          className={`w-7 h-7 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
                            editingAspects.cleanliness === v
                              ? 'bg-emerald-500 border-transparent text-white'
                              : 'bg-gray-50 dark:bg-[#0f1117] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Quality */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Qualité de la prestation</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button 
                          key={v}
                          onClick={() => setEditingAspects(prev => ({...prev, quality: v}))}
                          className={`w-7 h-7 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
                            editingAspects.quality === v
                              ? 'bg-emerald-500 border-transparent text-white'
                              : 'bg-gray-50 dark:bg-[#0f1117] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Value for Money */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rapport qualité / prix</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button 
                          key={v}
                          onClick={() => setEditingAspects(prev => ({...prev, value: v}))}
                          className={`w-7 h-7 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
                            editingAspects.value === v
                              ? 'bg-emerald-500 border-transparent text-white'
                              : 'bg-gray-50 dark:bg-[#0f1117] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review text area input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Votre avis détaillé</label>
                  <textarea
                    rows={4}
                    value={editingText}
                    onChange={e => setEditingText(e.target.value)}
                    placeholder="Écrivez votre commentaire ici..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-[#2d3148] bg-gray-50 dark:bg-[#0f1117] text-sm focus:ring-2 focus:ring-[#1A6FD1]/50 focus:outline-none text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                  <button 
                    onClick={() => setEditingReview(null)}
                    className="flex-1 py-3 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSaveReview}
                    disabled={!editingText.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-[#1A6FD1] to-[#0c5a7c] text-white text-sm font-semibold rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavorisAvis;

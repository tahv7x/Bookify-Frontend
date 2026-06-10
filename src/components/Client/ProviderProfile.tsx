import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  ChevronRight, ChevronLeft, BadgeCheck, MapPin, Zap, Users,
  Calendar, MessageCircle, ChevronDown, ChevronUp, Send, Clock, Check, Shield, Award, HeartHandshake, Video, Heart
} from 'lucide-react';
import { getDisponibilites } from '../../services/provider/disponibiliteService';
import { getProviderProfile } from '../../services/provider/providerService';
import { toggleFavori, checkFavori } from '../../services/Client/favorisService';
import TopBar from '../../components/Client/TopBar';
import Footer from '../../components/Client/Footer';
import ChatPanel from '../../components/Client/ChatPanel';
import BookingModal from '../../components/Client/BookingModal';
import Navbar from '../../components/Client/Navbar';


const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const buildDefaultGrid = () => {
  return DAYS.map(day => ({
    day,
    slots: TIME_SLOTS.map(time => ({ time, available: false }))
  }));
};

const StarsRow = ({ rating, size = 13 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="transition-transform hover:scale-125 duration-200">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={rating >= i ? '#f59e0b' : '#e5e7eb'}/>
      </svg>
    ))}
  </div>
);

export default function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isRedirecting, setIsRedirecting] = useState(false);  
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [initialSelectedSlot, setInitialSelectedSlot] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState(buildDefaultGrid());

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
    if (s) {
      try {
        const u = JSON.parse(s);
        setUserName(u.nomComplet || u.nom);
      } catch (e) { }
    }
  }, []);

  useEffect(() =>{
    const fetchProvider = async() => {
      try{
        setLoading(true);
        const data = await getProviderProfile(Number(providerId));
        const apiData = data;
        
        // Also check favorite status
        try {
          const { isFavorited } = await checkFavori(Number(providerId));
          setIsFavorited(isFavorited);
        } catch(e) {
          console.log("Not logged in or error checking favorite");
        }
        
        // MAPPING ENHANCED: taking new properties avatar & adresse from backend
        const mappedProvider = {
          id: apiData.id,
          userId: apiData.idUtilisateur,
          name: apiData.nom,
          business: apiData.nom,
          title: apiData.specialite,
          rating: apiData.note || 4.8, 
          reviews: 24, 
          hired: 87, 
          location: apiData.adresse || "Casablanca, Maroc",
          intro: apiData.bio || "Professionnel expérimenté offrant des services de haute qualité. Passionné par mon métier, je m'assure de toujours satisfaire mes clients en proposant un accompagnement sur mesure.",
          services: (apiData.services || []).map((s: any) => ({ ...s, nom: s.name || s.nom })),
          image: apiData.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&fit=crop",
          verified: true,
          badge: "Top Pro",
          // We keep only the avatar as the main photo if no gallery exists in DB
          photos: apiData.photos && apiData.photos.length > 0 ? apiData.photos : (apiData.avatar ? [apiData.avatar] : []),
          reviewsList: [
            { name: "Amine Benali", avatar: "https://ui-avatars.com/api/?name=Amine+Benali&background=0D8ABC&color=fff", rating: 5, date: "Il y a 2 semaines", text: "Excellent service ! Très professionnel et ponctuel. Je recommande vivement pour tous vos besoins." },
            { name: "Sara Tazi", avatar: "https://ui-avatars.com/api/?name=Sara+Tazi&background=f43f5e&color=fff", rating: 4, date: "Il y a 1 mois", text: "Travail très propre et soigné. Le prix est correct vu la qualité de la prestation fournie." }
          ],
          credentials: ["Identité vérifiée", "Professionnel certifié"],
          faq: [
            { q: "Quels sont vos horaires de disponibilité ?", a: "Je suis disponible du lundi au samedi, de 9h00 à 18h00. Pour les urgences, n'hésitez pas à me contacter directement." },
            { q: "Comment se déroule le paiement ?", a: "Le paiement s'effectue après la prestation. Vous pouvez payer en espèces ou par virement bancaire." },
            { q: "Est-ce que vous vous déplacez à domicile ?", a: "Oui, je me déplace gratuitement dans un rayon de 20km. Au-delà, des frais de déplacement peuvent s'appliquer." }
          ],
          price: apiData.services && apiData.services.length > 0 ? apiData.services[0].prix : 200,
          priceNote: "par prestation",
          responseTime: "Répond en moins d'une heure",
          memberSince: "Janvier 2024"
        };
        setProvider(mappedProvider);

        // Fetch Availability
        try {
          const data = await getDisponibilites(Number(providerId));
          // Combine DB data with the default grid
          const grid = buildDefaultGrid();
          data.forEach((dayData: any) => {
            const dayIndex = grid.findIndex(d => d.day === dayData.day);
            if (dayIndex !== -1) {
              dayData.slots.forEach((dbSlot: any) => {
                const slotIndex = grid[dayIndex].slots.findIndex(s => s.time === dbSlot.time);
                if (slotIndex !== -1) {
                  grid[dayIndex].slots[slotIndex].available = dbSlot.available;
                }
              });
            }
          });
          setAvailabilityData(grid);
        } catch (e) {
          console.error("Could not fetch availability", e);
        }

      }catch(err: any){
        setError(err.message);
      }finally{
        setTimeout(() => {
          setLoading(false);
        },600);
      }
    };
    if(providerId) fetchProvider();
  },[providerId]);

  const nextPhoto = (e: any) => {
    e.stopPropagation();
    if(provider) setActivePhoto((prev) => (prev + 1) % provider.photos.length);
  };

  const prevPhoto = (e: any) => {
    e.stopPropagation();
    if(provider) setActivePhoto((prev) => (prev === 0 ? provider.photos.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 transition-colors"
        style={{ background: isDark ? '#0d1117' : '#eef2fc' }}
      >
        <div className="w-12 h-12 border-4 border-blue-200 border-t-[#0059B2] rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Chargement du profil...</p>
      </div>
    );
  }
  if (error) {
    return <div className="p-10 text-red-500 text-center font-bold">Erreur: {error}</div>;
  }
  if (!provider) {
    return <div className="p-10 text-center text-gray-500">Aucun prestataire trouvé</div>;
  }

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: isDark ? '#0d1117' : '#eef2fc', fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Fraunces:wght@600;700;800&display=swap');
        .heading-font { font-family:'Fraunces',Georgia,serif; }
        @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn {from{opacity:0}to{opacity:1}}
        .fade-up {animation:fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity:0;}

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

        .glow-button {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .glow-button::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateY(-50%);
          transition: all 0.6s ease;
          opacity: 0;
        }
        .glow-button:hover::after {
          opacity: 1;
          transform: rotate(30deg) translateY(-50%) translateX(50%);
        }
        .glow-button:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 25px -5px rgba(0, 89, 178, 0.4);
        }
      `}</style>

      {isRedirecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 transition-all">
          <div className="bg-white dark:bg-[#1a1d27] rounded-3xl px-8 py-8 flex flex-col items-center gap-5 shadow-2xl scale-100 transform transition-transform">
            <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-[#0059B2] dark:border-t-[#1A6FD1] rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Redirection vers la connexion...</p>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)}/>}

      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#1a1d27] border-r border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Navbar activeSection="home" onSectionChange={() => setIsSidebarOpen(false)} />
      </div>

      <main className="min-h-screen relative bg-dot-pattern flex flex-col">
        {/* Imported TopBar */}
        <TopBar userName={userName} onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} isMobileMenuOpen={isSidebarOpen} />
        
        {/* Back Navigation Bar */}
        <div className="bg-transparent px-4 sm:px-8 py-4 z-30">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-[#0059B2] dark:hover:text-blue-400 px-3 py-2 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all hover:-translate-x-1"
            >
              <ChevronRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform"/>
              Retour
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Hero card */}
              <div className="glass-card rounded-3xl overflow-hidden fade-up">
                <div className="relative h-48 sm:h-64 bg-gradient-to-r from-[#004a96] to-[#1A6FD1] overflow-hidden group">
                  {provider.photos.length > 0 ? (
                    <img src={provider.photos[activePhoto]} alt="work"
                      className="w-full h-full object-cover opacity-80 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"/>
                  ) : (
                    <div className="w-full h-full opacity-30 bg-dot-pattern" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                  
                  {/* Hoverable Navigation Arrows for Photos */}
                    {provider.photos.length > 1 && (
                      <>
                        <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                          <ChevronLeft size={24}/>
                        </button>
                        <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                          <ChevronRight size={24}/>
                        </button>
                        
                        {/* Photo Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {provider.photos.map((_: any, i: number) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); setActivePhoto(i); }}
                              className={`h-1.5 rounded-full transition-all duration-300 ${i === activePhoto ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}/>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                {/* Profile info */}
                <div className="p-6 sm:p-8 relative">
                  <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                    <div className="relative shrink-0 -mt-16 sm:-mt-20 z-10 group/avatar">
                      <img src={provider.image} alt={provider.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-[#1a1d27] shadow-lg bg-white dark:bg-gray-800 transition-transform duration-500 group-hover/avatar:scale-105"/>
                      {provider.verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#0059B2] to-[#1A6FD1] rounded-full flex items-center justify-center border-2 border-white dark:border-[#1a1d27] shadow-md group-hover/avatar:scale-110 transition-transform">
                          <BadgeCheck size={16} color="#fff"/>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 mt-2 sm:mt-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white heading-font">{provider.business}</h1>
                        {provider.badge && (
                          <span className="bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-500/20 dark:to-amber-500/5 text-amber-700 dark:text-amber-400 text-[11px] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-500/20 shadow-sm hover:scale-105 transition-transform">
                            ★ {provider.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-base text-[#0059B2] dark:text-[#1A6FD1] font-semibold mb-3">{provider.title}</p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                          <StarsRow rating={provider.rating} size={15}/>
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">{provider.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">({provider.reviews})</span>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                          <Users size={14} className="text-[#0059B2] dark:text-[#1A6FD1]"/> {provider.hired} recrutements
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                          <MapPin size={14} className="text-[#0059B2] dark:text-[#1A6FD1]"/> {provider.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {/* About */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 fade-up" style={{animationDelay:'.1s'}}>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">À propos</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{provider.intro}</p>

                {/* SERVICES LIST */}
                <div className="border-t border-gray-100 dark:border-white/5 pt-6 mb-6">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Services & Tarifs</h3>
                  <div className="space-y-3">
                    {provider.services.length > 0 ? provider.services.map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#1A6FD1]/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-[#1A6FD1] dark:group-hover:text-blue-400 transition-colors">{s.nom || s.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium"><Clock size={12} className="text-gray-400 group-hover:text-[#1A6FD1] transition-colors"/> {s.duree} min</span>
                            <span className="text-[11px] text-blue-500 dark:text-blue-400 flex items-center gap-1 font-bold"><Video size={11}/> En ligne</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="font-extrabold text-[#0059B2] dark:text-[#1A6FD1] text-sm">{s.prix} MAD</p>
                          <button onClick={(e) => { e.stopPropagation(); setInitialSelectedSlot(null); handleAuthAction(() => setIsBookingModalOpen(true)); }} className="text-[11px] font-bold text-white bg-gradient-to-r from-[#004a96] to-[#1A6FD1] shadow-md shadow-[#1A6FD1]/30 hover:shadow-lg hover:shadow-[#1A6FD1]/40 px-3 py-1.5 rounded-lg transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5">
                            <Calendar size={12}/> Réserver
                          </button>
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500 italic">Aucun service défini pour le moment.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-white/5 pt-6 flex flex-wrap gap-5">
                  {[
                    { icon: <Zap size={16} className="text-amber-500"/>,      label: provider.responseTime },
                    { icon: <Calendar size={16} className="text-[#0059B2] dark:text-[#1A6FD1]"/>, label: `Membre depuis ${provider.memberSince}` },
                    { icon: <Users size={16} className="text-emerald-500"/>,    label: `${provider.hired} clients satisfaits` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-[#1A6FD1] transition-colors">
                      {item.icon}{item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* AVAILABILITY SCHEDULE */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 fade-up" style={{animationDelay:'.13s'}}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="text-[#1A6FD1]" size={18}/> Disponibilités en ligne
                  </h2>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-5 mb-5 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block"/> Disponible</span>
                  <span className="flex items-center gap-1.5 text-gray-400"><span className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 inline-block"/> Occupé</span>
                </div>

                {/* Schedule Grid */}
                <div className="overflow-x-auto -mx-1">
                  <div className="min-w-[440px] px-1">
                    {/* Day headers */}
                    <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '52px repeat(6, 1fr)' }}>
                      <div/>
                      {availabilityData.map((d: any) => (
                        <div key={d.day} className="text-center text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider py-1">{d.day}</div>
                      ))}
                    </div>

                    {/* Time rows */}
                    {TIME_SLOTS.map((timeLabel: string, slotIdx: number) => (
                      <div key={slotIdx} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '52px repeat(6, 1fr)' }}>
                        {/* Time label */}
                        <div className="flex items-center justify-end pr-2">
                          <span className="text-[11px] font-bold text-gray-400">{timeLabel}</span>
                        </div>
                        {/* Slot cells */}
                        {availabilityData.map((dayData: any) => {
                          const slot = dayData.slots[slotIdx];
                          return slot.available ? (
                            <button
                              key={dayData.day}
                              onClick={() => { setInitialSelectedSlot(`${dayData.day} ${slot.time}`); handleAuthAction(() => setIsBookingModalOpen(true)); }}
                              title={`${dayData.day} à ${slot.time} — Disponible`}
                              className="h-9 rounded-lg text-[11px] font-bold transition-all duration-200 border bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:border-transparent hover:scale-105 hover:shadow-md"
                            >
                              {slot.time}
                            </button>
                          ) : (
                            <div
                              key={dayData.day}
                              title={`${dayData.day} à ${slot.time} — Occupé`}
                              className="h-9 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 cursor-not-allowed"
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 font-medium mt-4 text-center">
                  Cliquez sur un créneau disponible pour démarrer une réservation en ligne.
                </p>
              </div>



            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4 z-20">
              
              {/* Main Booking Card */}
              <div className="relative">
                {/* Specific glow requested ONLY under this widget */}
                <div className="absolute -inset-2 bg-gradient-to-br from-[#004a96]/40 to-[#1A6FD1]/40 rounded-[2.5rem] blur-xl opacity-60 animate-pulse pointer-events-none"></div>

                <div className="glass-card rounded-[2rem] p-6 sm:p-8 shadow-2xl relative bg-white/95 dark:bg-[#111827]/95 border-t-4 border-t-[#0059B2] dark:border-t-[#1A6FD1]">
                  <div className="fade-up">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Prestation à partir de</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-extrabold text-gray-900 dark:text-white heading-font tracking-tight">{provider.price}</p>
                      <span className="text-sm font-bold text-gray-400 dark:text-gray-500 pb-1.5">MAD</span>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-4 py-3 mb-6 mt-4 hover:-translate-y-1 transition-transform shadow-sm cursor-default">
                      <Zap className="text-emerald-500 shrink-0" size={16}/>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{provider.responseTime}</span>
                    </div>

                    <button onClick={() => { setInitialSelectedSlot(null); handleAuthAction(() => setIsBookingModalOpen(true)); }}
                      className="glow-button w-full bg-gradient-to-r from-[#004a96] to-[#1A6FD1] text-white py-4 rounded-2xl font-bold text-sm shadow-lg mb-3"
                    >
                      Réserver un service
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleAuthAction(() => setIsChatOpen(true))} className="flex-1 bg-white dark:bg-[#1a1d27] border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 hover:-translate-y-1 hover:shadow-md transition-all flex items-center justify-center gap-2">
                        <MessageCircle size={16}/> Contacter
                      </button>
                      <button 
                        onClick={() => {
                          handleAuthAction(async () => {
                            try {
                              const { isFavorited } = await toggleFavori(Number(providerId));
                              setIsFavorited(isFavorited);
                            } catch(e) {
                              console.error("Error toggling favorite", e);
                            }
                          });
                        }} 
                        className="w-14 shrink-0 bg-white dark:bg-[#1a1d27] border-2 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:-translate-y-1 hover:shadow-md transition-all flex items-center justify-center"
                      >
                        <Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>



            </div>

          </div>
        </div>
        
        {/* Imported Footer */}
        <Footer />
        </main> 

      {/* Slide-in Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        provider={provider ? {
          id: provider.id,
          userId: provider.userId,
          name: provider.name,
          title: provider.title,
          image: provider.image,
          responseTime: provider.responseTime,
        } : null}
      />

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        provider={provider}
        availabilityData={availabilityData}
        initialSlot={initialSelectedSlot}
      />
    </div>
  );
}
